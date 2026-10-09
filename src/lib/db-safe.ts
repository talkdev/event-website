/** Helpers for pages that should degrade gracefully when DATABASE_URL is missing. */

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function databaseMissingMessage(): string {
  return "Database is not configured. Add DATABASE_URL to .env (Railway Postgres), run migrations, then pnpm db:seed.";
}
