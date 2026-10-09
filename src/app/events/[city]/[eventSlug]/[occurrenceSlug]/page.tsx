import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { formatEventDateTime } from "@/lib/dates";
import { databaseMissingMessage, hasDatabaseUrl } from "@/lib/db-safe";
import { getEnv } from "@/lib/env";
import { categoryPath, cityPath, externalMapsUrl } from "@/lib/urls";
import { listLaunchCities } from "@/modules/cities/service";
import { getOccurrenceBySlugs } from "@/modules/events/service";
import { formatPriceLabel } from "@/modules/pricing/format";
import { buildEventJsonLd, shouldIndexOccurrence } from "@/modules/seo/policy";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ city: string; eventSlug: string; occurrenceSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, eventSlug, occurrenceSlug } = await params;
  if (!hasDatabaseUrl()) return { title: "Event" };

  const detail = await getOccurrenceBySlugs({
    citySlug: city,
    eventSlug,
    occurrenceSlug,
  });
  if (!detail) return { title: "Event not found" };

  const indexable = shouldIndexOccurrence({
    publication: detail.event.publication,
    deletedAt: detail.event.deletedAt,
    status: detail.occurrence.status,
    startsAt: detail.occurrence.startsAt,
  });

  return {
    title: `${detail.event.title} · ${detail.cityName}`,
    description: detail.event.description.slice(0, 160),
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function OccurrencePage({ params }: Props) {
  const { city, eventSlug, occurrenceSlug } = await params;

  if (!hasDatabaseUrl()) {
    return (
      <>
        <SiteHeader />
        <main className="shell">
          <p className="db-warning">{databaseMissingMessage()}</p>
        </main>
      </>
    );
  }

  const [detail, cities] = await Promise.all([
    getOccurrenceBySlugs({
      citySlug: city,
      eventSlug,
      occurrenceSlug,
    }),
    listLaunchCities(),
  ]);

  if (!detail) notFound();

  const primaryCategory = detail.categories.find((c) => c.isPrimary) ?? detail.categories[0];
  const primaryOffer =
    detail.offers.find((o) => o.isPrimary) ?? detail.offers[0] ?? null;

  const place = detail.event.isOnline
    ? "Online event"
    : detail.occurrence.venueTba
      ? "Venue TBA"
      : detail.venue?.name ?? "Venue TBA";

  const mapsQuery = detail.venue
    ? [detail.venue.name, detail.venue.locality, detail.cityName].filter(Boolean).join(", ")
    : null;

  const jsonLd = buildEventJsonLd({
    siteUrl: getEnv().SITE_URL,
    name: detail.event.title,
    description: detail.event.description,
    startsAt: detail.occurrence.startsAt,
    endsAt: detail.occurrence.endsAt,
    timezone: detail.occurrence.timezone,
    cityName: detail.cityName,
    citySlug: detail.citySlug,
    eventSlug: detail.event.slug,
    occurrenceSlug: detail.occurrence.slug,
    status: detail.occurrence.status,
    isOnline: detail.event.isOnline,
    venueName: detail.venue?.name ?? null,
    venueAddress: detail.venue?.streetAddress ?? detail.venue?.locality ?? null,
    imageUrl: detail.event.imageUrl,
    offers: detail.offers.map((o) => ({
      url: o.url,
      priceType: o.priceType,
      priceMin: o.priceMin,
      currency: o.currency,
      availability: o.availability,
    })),
  });

  return (
    <>
      <SiteHeader citySlug={detail.citySlug} cityName={detail.cityName} cities={cities} />
      <main className="shell detail">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <p className="detail__kicker">
          <Link href={cityPath(detail.citySlug)}>{detail.cityName}</Link>
          {primaryCategory ? (
            <>
              {" · "}
              <Link href={categoryPath(detail.citySlug, primaryCategory.slug)}>
                {primaryCategory.name}
              </Link>
            </>
          ) : null}
        </p>

        <h1 className="detail__title">{detail.event.title}</h1>

        <div className="detail__panel">
          <p>
            <strong>When:</strong>{" "}
            {formatEventDateTime(detail.occurrence.startsAt, detail.occurrence.timezone)}
          </p>
          <p>
            <strong>Where:</strong> {place}
            {detail.venue?.locality ? ` · ${detail.venue.locality}` : ""}
          </p>
          <p>
            <strong>Status:</strong> {detail.occurrence.status.toLowerCase()}
          </p>
          {primaryOffer ? (
            <p>
              <strong>Tickets:</strong>{" "}
              {formatPriceLabel({
                priceType: primaryOffer.priceType,
                priceMin: primaryOffer.priceMin,
                currency: primaryOffer.currency,
              })}
              {" · "}
              <a href={primaryOffer.url} rel="noopener noreferrer">
                Get tickets
              </a>
            </p>
          ) : null}
          {mapsQuery ? (
            <p>
              <a href={externalMapsUrl(mapsQuery)} rel="noopener noreferrer">
                Open in Maps
              </a>
            </p>
          ) : null}
        </div>

        <div className="detail__description">{detail.event.description}</div>
      </main>
    </>
  );
}
