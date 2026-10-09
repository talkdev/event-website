import { PUBLIC_OCCURRENCE_STATUS, PUBLIC_PUBLICATION } from "@/modules/events/listing-policy";
import { absoluteUrl, occurrencePath } from "@/lib/urls";

export function shouldIndexOccurrence(input: {
  publication: string;
  deletedAt: Date | null;
  status: string;
  startsAt: Date;
  now?: Date;
}): boolean {
  if (input.publication !== PUBLIC_PUBLICATION) return false;
  if (input.deletedAt) return false;
  if (input.status === "CANCELLED") return false;
  // Upcoming and recently useful past occurrences can be indexed; cancelled never.
  return true;
}

export function occurrenceCanonicalUrl(input: {
  siteUrl: string;
  citySlug: string;
  eventSlug: string;
  occurrenceSlug: string;
}): string {
  return absoluteUrl(
    input.siteUrl,
    occurrencePath(input.citySlug, input.eventSlug, input.occurrenceSlug),
  );
}

export function buildEventJsonLd(input: {
  siteUrl: string;
  name: string;
  description: string;
  startsAt: Date;
  endsAt: Date | null;
  timezone: string;
  cityName: string;
  citySlug: string;
  eventSlug: string;
  occurrenceSlug: string;
  status: string;
  isOnline: boolean;
  venueName: string | null;
  venueAddress: string | null;
  imageUrl: string | null;
  offers: Array<{
    url: string;
    priceType: string;
    priceMin: string | null;
    currency: string;
    availability: string;
  }>;
}) {
  const url = occurrenceCanonicalUrl(input);
  const eventStatus =
    input.status === "CANCELLED"
      ? "https://schema.org/EventCancelled"
      : input.status === "POSTPONED"
        ? "https://schema.org/EventPostponed"
        : "https://schema.org/EventScheduled";

  const location = input.isOnline
    ? {
        "@type": "VirtualLocation",
        url,
      }
    : {
        "@type": "Place",
        name: input.venueName ?? "Venue TBA",
        address: {
          "@type": "PostalAddress",
          addressLocality: input.cityName,
          addressCountry: "IN",
          streetAddress: input.venueAddress ?? undefined,
        },
      };

  const offer = input.offers.find((o) => o.url) ?? input.offers[0];

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    description: input.description.slice(0, 5000),
    startDate: input.startsAt.toISOString(),
    endDate: input.endsAt?.toISOString(),
    eventStatus,
    eventAttendanceMode: input.isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location,
    image: input.imageUrl ? [input.imageUrl] : undefined,
    url,
    offers: offer
      ? {
          "@type": "Offer",
          url: offer.url,
          priceCurrency: offer.currency,
          price: offer.priceType === "FREE" ? "0" : (offer.priceMin ?? undefined),
          availability:
            offer.availability === "SOLD_OUT"
              ? "https://schema.org/SoldOut"
              : "https://schema.org/InStock",
        }
      : undefined,
  };
}

export function robotsForFilterPage(): { index: boolean; follow: boolean } {
  return { index: false, follow: true };
}
