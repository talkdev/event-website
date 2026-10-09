import { asc, eq, isNull } from "drizzle-orm";
import { categories } from "@/db/schema";
import { getDb } from "@/lib/db";

export type CategoryRecord = typeof categories.$inferSelect;

export async function listParentCategories(): Promise<CategoryRecord[]> {
  const db = getDb();
  return db
    .select()
    .from(categories)
    .where(isNull(categories.parentId))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function listCategories(): Promise<CategoryRecord[]> {
  const db = getDb();
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryRecord | null> {
  const db = getDb();
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function listChildCategories(parentId: string): Promise<CategoryRecord[]> {
  const db = getDb();
  return db
    .select()
    .from(categories)
    .where(eq(categories.parentId, parentId))
    .orderBy(asc(categories.sortOrder), asc(categories.name));
}
