import Link from "next/link";

export function SiteHeader({
  citySlug,
  cityName,
  cities,
}: {
  citySlug?: string;
  cityName?: string;
  cities?: Array<{ slug: string; name: string }>;
}) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          Scene<span>Around</span>
        </Link>

        {citySlug && cityName && cities && cities.length > 0 ? (
          <label className="city-switcher">
            <span className="sr-only">City</span>
            <select
              name="city"
              defaultValue={citySlug}
              aria-label="Select city"
              data-city-switcher
            >
              {cities.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </header>
  );
}
