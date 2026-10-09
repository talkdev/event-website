import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/event-card";
import { EventFilters } from "@/components/event-filters";
import { SiteHeader } from "@/components/site-header";
import { databaseMissingMessage, hasDatabaseUrl } from "@/lib/db-safe";
import type { DateChip } from "@/lib/dates";
import { listParentCategories } from "@/modules/categories/service";
import { getCityBySlug, listLaunchCities } from "@/modules/cities/service";
import { listUpcomingOccurrences } from "@/modules/events/service";
import { robotsForFilterPage } from "@/modules/seo/policy";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ city: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { city: citySlug } = await params;
  const sp = await searchParams;
  const hasFilters = Boolean(first(sp.q) || first(sp.when) || first(sp.free));

  if (!hasDatabaseUrl()) {
    return { title: "City events" };
  }

  const city = await getCityBySlug(citySlug);
  if (!city) return { title: "City not found" };

  return {
    title: `Events in ${city.name}`,
    description: `Upcoming concerts, workshops, food experiences, and more in ${city.name}.`,
    robots: hasFilters ? robotsForFilterPage() : { index: true, follow: true },
  };
}

export default async function CityPage({ params, searchParams }: Props) {
  const { city: citySlug } = await params;
  const sp = await searchParams;

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

  const city = await getCityBySlug(citySlug);
  if (!city) notFound();

  const [cities, categories, listing] = await Promise.all([
    listLaunchCities(),
    listParentCategories(),
    listUpcomingOccurrences({
      citySlug,
      q: first(sp.q),
      when: first(sp.when) as DateChip | undefined,
      free: first(sp.free) === "true" ? true : undefined,
      limit: 20,
    }),
  ]);

  return (
    <>
      <SiteHeader citySlug={city.slug} cityName={city.name} cities={cities} />
      <main>
        <section className="shell hero">
          <p className="hero__eyebrow">{city.name}</p>
          <h1 className="hero__title">Find your next plan.</h1>
          <p className="hero__lede">
            Discover events happening around {city.name}. Clear dates, venues, and ticket links —
            without the clutter.
          </p>
        </section>

        <section className="shell section">
          <EventFilters
            citySlug={city.slug}
            categories={categories}
            activeWhen={first(sp.when)}
            activeFree={first(sp.free) === "true"}
            query={first(sp.q)}
          />

          <h2 className="section__title">Upcoming in {city.name}</h2>

          {listing.items.length === 0 ? (
            <p className="empty">No upcoming events match these filters yet.</p>
          ) : (
            <div className="event-list">
              {listing.items.map((item) => (
                <EventCard key={item.occurrenceId} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
