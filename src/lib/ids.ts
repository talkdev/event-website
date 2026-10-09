import { randomBytes } from "crypto";

/** URL-safe unique id (cuid-like enough for app use without extra deps). */
export function createId(prefix?: string): string {
  const id = randomBytes(12).toString("base64url");
  return prefix ? `${prefix}_${id}` : id;
}
