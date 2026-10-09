import { asc, eq } from "drizzle-orm";
import { cities } from "@/db/schema";
import { getDb } from "@/lib/db";

export type CityRecord = typeof cities.$inferSelect;

export async function listLaunchCities(): Promise<CityRecord[]> {
  const db = getDb();
  return db
    .select()
    .from(cities)
    .where(eq(cities.isLaunchCity, true))
    .orderBy(asc(cities.sortOrder), asc(cities.name));
}

export async function listAllCities(): Promise<CityRecord[]> {
  const db = getDb();
  return db.select().from(cities).orderBy(asc(cities.sortOrder), asc(cities.name));
}

export async function getCityBySlug(slug: string): Promise<CityRecord | null> {
  const db = getDb();
  const rows = await db.select().from(cities).where(eq(cities.slug, slug)).limit(1);
  return rows[0] ?? null;
}
