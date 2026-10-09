import {
  and,
  asc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import {
  categories,
  cities,
  eventCategories,
  eventOccurrences,
  events,
  offers,
  venues,
} from "@/db/schema";
import { dateChipRange, type DateChip } from "@/lib/dates";
import { getDb } from "@/lib/db";
import {
  PUBLIC_OCCURRENCE_STATUS,
  PUBLIC_PUBLICATION,
} from "@/modules/events/listing-policy";

export type UpcomingOccurrenceCard = {
  occurrenceId: string;
  occurrenceSlug: string;
  startsAt: Date;
  timezone: string;
  venueTba: boolean;
  neighborhood: string | null;
  eventId: string;
  eventSlug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  isOnline: boolean;
  cityId: string;
  citySlug: string;
  cityName: string;
  venueName: string | null;
  venueLocality: string | null;
  primaryCategorySlug: string | null;
  primaryCategoryName: string | null;
  priceType: string | null;
  priceMin: string | null;
  currency: string | null;
};

export type ListUpcomingParams = {
  citySlug: string;
  categorySlug?: string;
  cursor?: string;
  limit?: number;
  q?: string;
  free?: boolean;
  when?: DateChip;
  now?: Date;
};

function decodeCursor(cursor: string | undefined): { startsAt: Date; id: string } | null {
  if (!cursor) return null;
  const [startsAtRaw, id] = cursor.split("::");
  if (!startsAtRaw || !id) return null;
  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) return null;
  return { startsAt, id };
}

export function encodeCursor(startsAt: Date, id: string): string {
  return `${startsAt.toISOString()}::${id}`;
}

export async function listUpcomingOccurrences(
  params: ListUpcomingParams,
): Promise<{ items: UpcomingOccurrenceCard[]; nextCursor: string | null }> {
  const db = getDb();
  const limit = params.limit ?? 20;
  const now = params.now ?? new Date();
  const cursor = decodeCursor(params.cursor);

  const conditions: SQL[] = [
    eq(events.publication, PUBLIC_PUBLICATION),
    isNull(events.deletedAt),
    eq(eventOccurrences.status, PUBLIC_OCCURRENCE_STATUS),
    gte(eventOccurrences.startsAt, now),
    eq(cities.slug, params.citySlug),
  ];

  if (params.categorySlug) {
    conditions.push(
      sql`exists (
        select 1 from event_categories ec
        inner join categories c on c.id = ec.category_id
        where ec.event_id = ${events.id}
          and (
            c.slug = ${params.categorySlug}
            or exists (
              select 1 from categories parent
              where parent.id = c.parent_id and parent.slug = ${params.categorySlug}
            )
          )
      )`,
    );
  }

  if (params.q) {
    const pattern = `%${params.q}%`;
    conditions.push(
      or(ilike(events.title, pattern), ilike(events.description, pattern)) as SQL,
    );
  }

  if (params.when) {
    const cityRows = await db
      .select({ timezone: cities.timezone })
      .from(cities)
      .where(eq(cities.slug, params.citySlug))
      .limit(1);
    const timezone = cityRows[0]?.timezone ?? "Asia/Kolkata";
    const range = dateChipRange(params.when, timezone, now);
    conditions.push(gte(eventOccurrences.startsAt, range.from));
    conditions.push(lt(eventOccurrences.startsAt, range.to));
  }

  if (params.free === true) {
    conditions.push(
      sql`exists (
        select 1 from offers o
        where o.occurrence_id = ${eventOccurrences.id}
          and o.price_type = 'FREE'
      )`,
    );
  } else if (params.free === false) {
    conditions.push(
      sql`exists (
        select 1 from offers o
        where o.occurrence_id = ${eventOccurrences.id}
          and o.price_type in ('PAID', 'RANGE')
      )`,
    );
  }

  if (cursor) {
    conditions.push(
      sql`(${eventOccurrences.startsAt}, ${eventOccurrences.id}) > (${cursor.startsAt.toISOString()}::timestamptz, ${cursor.id})`,
    );
  }

  const rows = await db
    .select({
      occurrenceId: eventOccurrences.id,
      occurrenceSlug: eventOccurrences.slug,
      startsAt: eventOccurrences.startsAt,
      timezone: eventOccurrences.timezone,
      venueTba: eventOccurrences.venueTba,
      neighborhood: eventOccurrences.neighborhood,
      eventId: events.id,
      eventSlug: events.slug,
      title: events.title,
      description: events.description,
      imageUrl: events.imageUrl,
      isOnline: events.isOnline,
      cityId: eventOccurrences.cityId,
      citySlug: cities.slug,
      cityName: cities.name,
      venueName: venues.name,
      venueLocality: venues.locality,
    })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .innerJoin(cities, eq(eventOccurrences.cityId, cities.id))
    .leftJoin(venues, eq(eventOccurrences.venueId, venues.id))
    .where(and(...conditions))
    .orderBy(asc(eventOccurrences.startsAt), asc(eventOccurrences.id))
    .limit(limit + 1);

  const slice = rows.slice(0, limit);
  const occurrenceIds = slice.map((r) => r.occurrenceId);
  const eventIds = [...new Set(slice.map((r) => r.eventId))];

  const primaryCats =
    eventIds.length === 0
      ? []
      : await db
          .select({
            eventId: eventCategories.eventId,
            categorySlug: categories.slug,
            categoryName: categories.name,
          })
          .from(eventCategories)
          .innerJoin(categories, eq(eventCategories.categoryId, categories.id))
          .where(
            and(inArray(eventCategories.eventId, eventIds), eq(eventCategories.isPrimary, true)),
          );

  const primaryOffers =
    occurrenceIds.length === 0
      ? []
      : await db.select().from(offers).where(inArray(offers.occurrenceId, occurrenceIds));

  const catByEvent = new Map(primaryCats.map((c) => [c.eventId, c]));
  const offerByOccurrence = new Map<string, (typeof primaryOffers)[number]>();
  for (const offer of primaryOffers) {
    const existing = offerByOccurrence.get(offer.occurrenceId);
    if (!existing || offer.isPrimary) {
      offerByOccurrence.set(offer.occurrenceId, offer);
    }
  }

  const items: UpcomingOccurrenceCard[] = slice.map((row) => {
    const cat = catByEvent.get(row.eventId);
    const offer = offerByOccurrence.get(row.occurrenceId);
    return {
      ...row,
      primaryCategorySlug: cat?.categorySlug ?? null,
      primaryCategoryName: cat?.categoryName ?? null,
      priceType: offer?.priceType ?? null,
      priceMin: offer?.priceMin ?? null,
      currency: offer?.currency ?? null,
    };
  });

  const last = slice.at(-1);
  const nextCursor =
    rows.length > limit && last ? encodeCursor(last.startsAt, last.occurrenceId) : null;

  return { items, nextCursor };
}

export async function getOccurrenceBySlugs(params: {
  citySlug: string;
  eventSlug: string;
  occurrenceSlug: string;
}) {
  const db = getDb();
  const rows = await db
    .select({
      occurrence: eventOccurrences,
      event: events,
      citySlug: cities.slug,
      cityName: cities.name,
      cityTimezone: cities.timezone,
      venue: venues,
    })
    .from(eventOccurrences)
    .innerJoin(events, eq(eventOccurrences.eventId, events.id))
    .innerJoin(cities, eq(eventOccurrences.cityId, cities.id))
    .leftJoin(venues, eq(eventOccurrences.venueId, venues.id))
    .where(
      and(
        eq(cities.slug, params.citySlug),
        eq(events.slug, params.eventSlug),
        eq(eventOccurrences.slug, params.occurrenceSlug),
        eq(events.publication, PUBLIC_PUBLICATION),
        isNull(events.deletedAt),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const [cats, occurrenceOffers] = await Promise.all([
    db
      .select({
        slug: categories.slug,
        name: categories.name,
        isPrimary: eventCategories.isPrimary,
      })
      .from(eventCategories)
      .innerJoin(categories, eq(eventCategories.categoryId, categories.id))
      .where(eq(eventCategories.eventId, row.event.id)),
    db.select().from(offers).where(eq(offers.occurrenceId, row.occurrence.id)),
  ]);

  return { ...row, categories: cats, offers: occurrenceOffers };
}
