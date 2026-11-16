/**
 * Kalenderberechnungen in der lokalen Zeitzone des Geräts.
 *
 * Alle Funktionen rechnen über `Date` mit lokalen Feldern (Tag, Monat …),
 * damit Sommer- und Winterzeit korrekt berücksichtigt werden.
 * Ein Tag ist deshalb nicht immer 24 Stunden lang.
 */
import type { TimeRange, Timestamp } from './types';

export function startOfDay(ts: Timestamp): Timestamp {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Verschiebt um ganze Kalendertage; die Uhrzeit bleibt erhalten. */
export function addDays(ts: Timestamp, days: number): Timestamp {
  const date = new Date(ts);
  date.setDate(date.getDate() + days);
  return date.getTime();
}

export function dayRange(ts: Timestamp): TimeRange {
  const start = startOfDay(ts);
  return { start, end: addDays(start, 1) };
}

/** Kalenderwoche von Montag 00:00 bis Montag 00:00 der Folgewoche. */
export function weekRange(ts: Timestamp): TimeRange {
  const dayStart = startOfDay(ts);
  const weekday = new Date(dayStart).getDay(); // 0 = Sonntag … 6 = Samstag
  const daysSinceMonday = (weekday + 6) % 7;
  const start = addDays(dayStart, -daysSinceMonday);
  return { start, end: addDays(start, 7) };
}

export function monthRange(ts: Timestamp): TimeRange {
  const date = new Date(ts);
  const start = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
  return { start, end };
}

export function shiftWeek(range: TimeRange, weeks: number): TimeRange {
  return weekRange(addDays(range.start, weeks * 7));
}

export function shiftMonth(range: TimeRange, months: number): TimeRange {
  const date = new Date(range.start);
  return monthRange(new Date(date.getFullYear(), date.getMonth() + months, 1).getTime());
}

/** Zeitraum aus zwei Kalendertagen, beide einschließlich. */
export function inclusiveDaysRange(fromDay: Timestamp, toDay: Timestamp): TimeRange {
  const first = startOfDay(Math.min(fromDay, toDay));
  const last = startOfDay(Math.max(fromDay, toDay));
  return { start: first, end: addDays(last, 1) };
}

/** Letzter Kalendertag, der noch zum Zeitraum gehört (für die Anzeige „bis …“). */
export function lastDayOf(range: TimeRange): Timestamp {
  return startOfDay(range.end - 1);
}

/** Eindeutiger Schlüssel eines Kalendertags, z. B. "2026-11-16". */
export function dayKey(ts: Timestamp): string {
  const date = new Date(ts);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Kalenderwoche nach ISO 8601 (Woche mit dem ersten Donnerstag des Jahres ist KW 1). */
export function isoWeekNumber(ts: Timestamp): number {
  const date = new Date(ts);
  // Auf den Donnerstag derselben Woche verschieben; dessen Jahr bestimmt die Woche.
  const thursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  thursday.setDate(thursday.getDate() + 3 - ((thursday.getDay() + 6) % 7));
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
  return 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * 86_400_000));
}

export function containsTimestamp(range: TimeRange, ts: Timestamp): boolean {
  return ts >= range.start && ts < range.end;
}
