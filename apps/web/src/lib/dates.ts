/**
 * Date-only helpers.
 *
 * The API returns SQL DATE columns as plain 'YYYY-MM-DD' strings — a calendar
 * day with no time and no timezone. Passing one to `new Date()` parses it as
 * UTC midnight, which renders as the *previous* day everywhere west of UTC
 * (a wedding on the 1st shows as the 30th in New York). These helpers anchor
 * such values to local midnight so the day the user typed is the day they see.
 *
 * Use these for date-only fields (wedding date, RSVP deadline, expense due
 * date). Real timestamps (created_at, sent_at) are instants and should keep
 * using `new Date()` directly.
 */

/** 'YYYY-MM-DD' (or an ISO timestamp) -> Date at LOCAL midnight. */
export const parseDateOnly = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;

  const dayPart = String(value).split('T')[0];
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayPart);
  if (!match) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  const [, y, m, d] = match;
  // Month is zero-based; this constructor builds the date in local time.
  return new Date(Number(y), Number(m) - 1, Number(d));
};

/** Date -> 'YYYY-MM-DD' in local time, for <input type="date"> and the API. */
export const toDateInput = (value: Date | string | null | undefined): string | null => {
  const date = parseDateOnly(value);
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Format a date-only value for display, without any timezone drift. */
export const formatDateOnly = (
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
  locale = 'en-GB',
): string | null => {
  const date = parseDateOnly(value);
  return date ? date.toLocaleDateString(locale, options) : null;
};

/** Whole days from today to the given date; negative when it is in the past. */
export const daysUntilDate = (value: string | Date | null | undefined): number | null => {
  const date = parseDateOnly(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
};
