import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl } from "@/lib/db-safe";
import { eventsQuerySchema } from "@/lib/validation";
import { occurrencePath } from "@/lib/urls";
import { listUpcomingOccurrences } from "@/modules/events/service";
import { formatPriceLabel } from "@/modules/pricing/format";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const parsed = eventsQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }

  try {
    const { city, category, cursor, limit, q, free, when } = parsed.data;
    const { items, nextCursor } = await listUpcomingOccurrences({
      citySlug: city,
      categorySlug: category,
      cursor,
      limit,
      q,
      free,
      when,
    });

    return NextResponse.json(
      {
        items: items.map((item) => ({
          id: item.occurrenceId,
          title: item.title,
          href: occurrencePath(item.citySlug, item.eventSlug, item.occurrenceSlug),
          startsAt: item.startsAt.toISOString(),
          timezone: item.timezone,
          city: item.cityName,
          venue: item.venueTba ? "Venue TBA" : item.venueName,
          category: item.primaryCategoryName,
          priceLabel: formatPriceLabel({
            priceType: item.priceType,
            priceMin: item.priceMin,
            currency: item.currency,
          }),
        })),
        nextCursor,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Failed to retrieve events", error);
    return NextResponse.json({ error: "Unable to retrieve events" }, { status: 500 });
  }
}
