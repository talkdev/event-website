export function cityPath(citySlug: string): string {
  return `/${citySlug}`;
}

export function categoryPath(citySlug: string, categorySlug: string): string {
  return `/${citySlug}/${categorySlug}`;
}

export function occurrencePath(
  citySlug: string,
  eventSlug: string,
  occurrenceSlug: string,
): string {
  return `/events/${citySlug}/${eventSlug}/${occurrenceSlug}`;
}

export function absoluteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function externalMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
