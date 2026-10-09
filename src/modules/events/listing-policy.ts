/**
 * Shared visibility rules for public listings, API, sitemap, and SEO.
 * Keep this module as the single source of truth.
 */
export const PUBLIC_PUBLICATION = "PUBLISHED" as const;
export const PUBLIC_OCCURRENCE_STATUS = "SCHEDULED" as const;

export function isUpcomingWindow(startsAt: Date, now = new Date()): boolean {
  return startsAt.getTime() >= now.getTime();
}
