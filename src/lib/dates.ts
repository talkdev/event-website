const DISPLAY_LOCALE = "en-IN";

export function formatEventDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: timezone,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatEventTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatEventDateTime(date: Date, timezone: string): string {
  return `${formatEventDate(date, timezone)} · ${formatEventTime(date, timezone)}`;
}

function localDateTimeString(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
}

function localWeekdayShort(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(date);
}

/** UTC instant for local midnight in the given IANA timezone. */
export function startOfDayInTimezone(timezone: string, now = new Date()): Date {
  const ymd = localDateTimeString(now, timezone).slice(0, 10);
  const target = `${ymd}T00:00:00`;
  let lo = now.getTime() - 36 * 3600_000;
  let hi = now.getTime() + 36 * 3600_000;

  for (let i = 0; i < 48; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const local = localDateTimeString(new Date(mid), timezone);
    if (local < target) lo = mid + 1;
    else hi = mid;
  }

  return new Date(lo);
}

const WEEKDAY_TO_ISO: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

export type DateChip = "today" | "tomorrow" | "weekend" | "week";

export function dateChipRange(
  chip: DateChip,
  timezone: string,
  now = new Date(),
): { from: Date; to: Date } {
  const startToday = startOfDayInTimezone(timezone, now);
  const dayMs = 24 * 60 * 60 * 1000;

  if (chip === "today") {
    return { from: startToday, to: new Date(startToday.getTime() + dayMs) };
  }
  if (chip === "tomorrow") {
    const from = new Date(startToday.getTime() + dayMs);
    return { from, to: new Date(from.getTime() + dayMs) };
  }
  if (chip === "weekend") {
    const iso = WEEKDAY_TO_ISO[localWeekdayShort(now, timezone)] ?? 1;
    const daysUntilFriday = (5 - iso + 7) % 7;
    const friday = new Date(startToday.getTime() + daysUntilFriday * dayMs);
    return { from: friday, to: new Date(friday.getTime() + 3 * dayMs) };
  }
  return {
    from: startToday,
    to: new Date(startToday.getTime() + 7 * dayMs),
  };
}
