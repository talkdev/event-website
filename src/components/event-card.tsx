import Link from "next/link";
import { formatEventDateTime } from "@/lib/dates";
import { occurrencePath } from "@/lib/urls";
import { formatPriceLabel } from "@/modules/pricing/format";
import type { UpcomingOccurrenceCard } from "@/modules/events/service";

export function EventCard({ item }: { item: UpcomingOccurrenceCard }) {
  const href = occurrencePath(item.citySlug, item.eventSlug, item.occurrenceSlug);
  const place = item.isOnline
    ? "Online"
    : item.venueTba
      ? "Venue TBA"
      : item.venueName ?? "Venue TBA";
  const placeLine = item.neighborhood
    ? `${place} · ${item.neighborhood}`
    : `${place} · ${item.cityName}`;

  return (
    <article className="event-card">
      <Link href={href} className="event-card__link">
        <div className="event-card__body">
          {item.primaryCategoryName ? (
            <p className="event-card__meta">{item.primaryCategoryName}</p>
          ) : null}
          <h2 className="event-card__title">{item.title}</h2>
          <p className="event-card__when">
            {formatEventDateTime(item.startsAt, item.timezone)}
          </p>
          <p className="event-card__where">{placeLine}</p>
          <p className="event-card__price">
            {formatPriceLabel({
              priceType: item.priceType,
              priceMin: item.priceMin,
              currency: item.currency,
            })}
          </p>
        </div>
      </Link>
    </article>
  );
}
