/**
 * Shared date/time formatting. Single locale standard (en-PH) so every
 * screen renders dates the same way.
 */
const LOCALE = "en-PH";

export function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString(LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Same as formatDate but includes the weekday — for schedule/calendar screens. */
export function formatDateWithWeekday(d: string | Date): string {
  return new Date(d).toLocaleDateString(LOCALE, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "June 30, 2026" — for formal/legal-feeling copy (signed dates, created dates). */
export function formatDateLong(d: string | Date): string {
  return new Date(d).toLocaleDateString(LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "Tuesday, June 30, 2026" — for scheduled events (interviews, home visits). */
export function formatDateLongWithWeekday(d: string | Date): string {
  return new Date(d).toLocaleDateString(LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(d: string | Date): string {
  return new Date(d).toLocaleTimeString(LOCALE, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(d: string | Date): string {
  return `${formatDate(d)} • ${formatTime(d)}`;
}
