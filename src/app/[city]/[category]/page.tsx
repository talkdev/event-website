import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/event-card";
import { EventFilters } from "@/components/event-filters";
import { SiteHeader } from "@/components/site-header";
import { databaseMissingMessage, hasDatabaseUrl } from "@/lib/db-safe";
import type { DateChip } from "@/lib/dates";
import { getCategoryBySlug, listParentCategories } from "@/modules/categories/service";
import { getCityBySlug, listLaunchCities } from "@/modules/cities/service";
import { listUpcomingOccurrences } from "@/modules/events/service";
import { robotsForFilterPage } from "@/modules/seo/policy";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ city: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { city: citySlug, category: categorySlug } = await params;
  const sp = await searchParams;
  const hasFilters = Boolean(first(sp.q) || first(sp.when) || first(sp.free));

  if (!hasDatabaseUrl()) return { title: "Category" };

  const [city, category] = await Promise.all([
    getCityBySlug(citySlug),
    getCategoryBySlug(categorySlug),
  ]);
  if (!city || !category) return { title: "Not found" };

  return {
    title: `${category.name} in ${city.name}`,
    description: `Upcoming ${category.name.toLowerCase()} events in ${city.name}.`,
    robots: hasFilters ? robotsForFilterPage() : { index: true, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { city: citySlug, category: categorySlug } = await params;
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

  const [city, category] = await Promise.all([
    getCityBySlug(citySlug),
    getCategoryBySlug(categorySlug),
  ]);
  if (!city || !category) notFound();

  const [cities, categories, listing] = await Promise.all([
    listLaunchCities(),
    listParentCategories(),
    listUpcomingOccurrences({
      citySlug,
      categorySlug,
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
          <p className="hero__eyebrow">
            {city.name} · {category.name}
          </p>
          <h1 className="hero__title">{category.name}</h1>
          <p className="hero__lede">
            Upcoming {category.name.toLowerCase()} in {city.name}.
          </p>
        </section>

        <section className="shell section">
          <EventFilters
            citySlug={city.slug}
            categories={categories}
            activeCategory={category.slug}
            activeWhen={first(sp.when)}
            activeFree={first(sp.free) === "true"}
            query={first(sp.q)}
          />

          {listing.items.length === 0 ? (
            <p className="empty">No upcoming events in this category yet.</p>
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
