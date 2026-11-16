/**
 * Anzeigetexte für einzelne Einträge.
 */
import { startOfDay } from '@/domain/dateRange';
import { formatTime } from '@/domain/format';
import type { TimeEntry } from '@/domain/types';

/** Uhrzeitspanne, z. B. "08:15 – 10:30", "22:00 – 02:00 (+1 Tag)" oder "08:15 – läuft". */
export function formatEntrySpan(entry: TimeEntry): string {
  const start = formatTime(entry.start);
  if (entry.end === null) return `${start} – läuft`;

  const end = formatTime(entry.end);
  const days = calendarDaysBetween(entry.start, entry.end);
  if (days === 0) return `${start} – ${end}`;
  return `${start} – ${end} (+${days} ${days === 1 ? 'Tag' : 'Tage'})`;
}

function calendarDaysBetween(from: number, to: number): number {
  // Runden gleicht Tage mit 23 oder 25 Stunden (Zeitumstellung) aus.
  return Math.round((startOfDay(to) - startOfDay(from)) / 86_400_000);
}
