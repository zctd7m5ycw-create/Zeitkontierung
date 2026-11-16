/**
 * Umwandlung zwischen Zeitstempeln und den Werten von HTML-Eingabefeldern
 * (`<input type="date">` und `<input type="datetime-local">`), jeweils in lokaler Zeit.
 */
import { dayKey } from './dateRange';
import type { Timestamp } from './types';

/** Wert für `<input type="date">`, z. B. "2026-11-16". */
export function toDateInputValue(ts: Timestamp): string {
  return dayKey(ts);
}

/** Wert für `<input type="datetime-local">`, z. B. "2026-11-16T08:15". */
export function toDateTimeInputValue(ts: Timestamp): string {
  const date = new Date(ts);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${dayKey(ts)}T${hours}:${minutes}`;
}

/** Liest "2026-11-16" als 00:00 Uhr lokale Zeit. Ungültige Werte ergeben `null`. */
export function parseDateInputValue(value: string): Timestamp | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return buildTimestamp(Number(match[1]), Number(match[2]), Number(match[3]), 0, 0);
}

/** Liest "2026-11-16T08:15" (Sekunden optional) in lokaler Zeit. Ungültige Werte ergeben `null`. */
export function parseDateTimeInputValue(value: string): Timestamp | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/.exec(value);
  if (!match) return null;
  return buildTimestamp(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
  );
}

function buildTimestamp(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
): Timestamp | null {
  const date = new Date(year, month - 1, day, hours, minutes);
  // Ungültige Daten wie der 31.02. würden sonst still in den März rutschen.
  const valid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date.getTime() : null;
}
