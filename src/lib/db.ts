import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { requireDatabaseUrl } from "@/lib/env";

const globalForDb = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

function createClient() {
  const url = requireDatabaseUrl();
  return postgres(url, {
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

export function getSql() {
  if (!globalForDb.postgresClient) {
    globalForDb.postgresClient = createClient();
  }
  return globalForDb.postgresClient;
}

export function getDb() {
  return drizzle(getSql(), { schema });
}

export type Database = ReturnType<typeof getDb>;
