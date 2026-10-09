import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { databaseMissingMessage, hasDatabaseUrl } from "@/lib/db-safe";
import { listLaunchCities } from "@/modules/cities/service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!hasDatabaseUrl()) {
    return (
      <>
        <SiteHeader />
        <main className="shell hero">
          <p className="hero__eyebrow">SceneAround</p>
          <h1 className="hero__title">Find your next plan.</h1>
          <p className="hero__lede">
            Discover events happening around Indian cities — Delhi, Mumbai, Bengaluru, and more.
          </p>
          <p className="db-warning">{databaseMissingMessage()}</p>
        </main>
      </>
    );
  }

  const cities = await listLaunchCities();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="shell hero">
          <p className="hero__eyebrow">SceneAround · India</p>
          <h1 className="hero__title">Find your next plan.</h1>
          <p className="hero__lede">
            Discover events, experiences, and things to do across Indian cities. Pick your city to
            start.
          </p>
          <div className="city-grid">
            {cities.map((city) => (
              <Link key={city.id} href={`/${city.slug}`} className="city-tile">
                <strong>{city.name}</strong>
              </Link>
            ))}
          </div>
          {cities.length === 0 ? (
            <p className="empty">No launch cities yet. Run pnpm db:seed after migrations.</p>
          ) : null}
        </section>
      </main>
    </>
  );
}
