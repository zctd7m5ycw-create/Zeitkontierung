/**
 * Formatierung von Zeiten und Daten für die Anzeige (deutsches Format).
 */
import { lastDayOf } from './dateRange';
import { MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from './time';
import type { TimeRange, Timestamp } from './types';

const LOCALE = 'de-DE';

const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const weekdayDateFormat = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});
const monthYearFormat = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });
const decimalFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Laufende Uhr, z. B. "1:02:03". */
export function formatClock(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / MS_PER_SECOND);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${pad2(minutes)}:${pad2(seconds)}`;
}

/** Minuten als Stunden:Minuten, z. B. 125 → "2:05". */
export function formatMinutes(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  return `${Math.floor(minutes / 60)}:${pad2(minutes % 60)}`;
}

/** Millisekunden als Stunden:Minuten (abgerundet auf volle Minuten), z. B. "2:05". */
export function formatDurationMs(ms: number): string {
  return formatMinutes(Math.floor(Math.max(0, ms) / MS_PER_MINUTE));
}

/** Minuten als Dezimalstunden, z. B. 125 → "2,08". */
export function formatDecimalHours(totalMinutes: number): string {
  return decimalFormat.format((totalMinutes * MS_PER_MINUTE) / MS_PER_HOUR);
}

/** Uhrzeit, z. B. "08:15". */
export function formatTime(ts: Timestamp): string {
  return timeFormat.format(ts);
}

/** Datum, z. B. "16.11.2026". */
export function formatDate(ts: Timestamp): string {
  return dateFormat.format(ts);
}

/** Wochentag und Datum, z. B. "Montag, 16. November". */
export function formatWeekdayDate(ts: Timestamp): string {
  return weekdayDateFormat.format(ts);
}

const shortWeekdayDateFormat = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
});

/** Kurzer Wochentag und Datum, z. B. "Mo., 16. November". */
export function formatShortWeekdayDate(ts: Timestamp): string {
  return shortWeekdayDateFormat.format(ts);
}

/** Monat und Jahr, z. B. "November 2026". */
export function formatMonthYear(ts: Timestamp): string {
  return monthYearFormat.format(ts);
}

/** Zeitraum mit beiden Tagen einschließlich, z. B. "16.11.2026 – 22.11.2026". */
export function formatRange(range: TimeRange): string {
  const first = formatDate(range.start);
  const last = formatDate(lastDayOf(range));
  return first === last ? first : `${first} – ${last}`;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}
