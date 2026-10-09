import Link from "next/link";
import { categoryPath, cityPath } from "@/lib/urls";

const DATE_CHIPS = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "weekend", label: "This weekend" },
  { key: "week", label: "This week" },
] as const;

export function EventFilters({
  citySlug,
  categories,
  activeCategory,
  activeWhen,
  activeFree,
  query,
}: {
  citySlug: string;
  categories: Array<{ slug: string; name: string }>;
  activeCategory?: string;
  activeWhen?: string;
  activeFree?: boolean;
  query?: string;
}) {
  const listBase = activeCategory
    ? categoryPath(citySlug, activeCategory)
    : cityPath(citySlug);

  function hrefFor(next: {
    category?: string | null;
    when?: string | null;
    free?: boolean | null;
    q?: string | null;
  }) {
    const params = new URLSearchParams();
    const category = next.category === null ? undefined : (next.category ?? activeCategory);
    const when = next.when === null ? undefined : (next.when ?? activeWhen);
    const free =
      next.free === null ? undefined : next.free === undefined ? activeFree : next.free;
    const q = next.q === null ? undefined : (next.q ?? query);

    if (when) params.set("when", when);
    if (free === true) params.set("free", "true");
    if (q) params.set("q", q);

    const base = category ? categoryPath(citySlug, category) : cityPath(citySlug);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  return (
    <div className="filters">
      <form className="search-form" action={listBase} method="get">
        {activeWhen ? <input type="hidden" name="when" value={activeWhen} /> : null}
        {activeFree ? <input type="hidden" name="free" value="true" /> : null}
        <label className="sr-only" htmlFor="event-search">
          Search events
        </label>
        <input
          id="event-search"
          name="q"
          type="search"
          placeholder="Concerts, comedy, workshops…"
          defaultValue={query ?? ""}
          className="search-input"
        />
        <button type="submit" className="btn btn--primary">
          Search
        </button>
      </form>

      <div className="chip-row" aria-label="Date filters">
        {DATE_CHIPS.map((chip) => (
          <Link
            key={chip.key}
            href={hrefFor({
              when: activeWhen === chip.key ? null : chip.key,
            })}
            className={`chip ${activeWhen === chip.key ? "chip--active" : ""}`}
          >
            {chip.label}
          </Link>
        ))}
        <Link
          href={hrefFor({ free: activeFree ? null : true })}
          className={`chip ${activeFree ? "chip--active" : ""}`}
        >
          Free
        </Link>
      </div>

      <div className="chip-row chip-row--wrap" aria-label="Categories">
        <Link
          href={hrefFor({ category: null })}
          className={`chip ${!activeCategory ? "chip--active" : ""}`}
        >
          All categories
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={hrefFor({
              category: activeCategory === category.slug ? null : category.slug,
            })}
            className={`chip ${activeCategory === category.slug ? "chip--active" : ""}`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
