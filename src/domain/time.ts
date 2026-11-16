/**
 * Grundlegende Zeitberechnungen für Einträge.
 * Reine Funktionen: Die aktuelle Uhrzeit wird immer als Parameter `now` übergeben,
 * damit alles deterministisch und testbar bleibt.
 */
import type { TimeEntry, Timestamp } from './types';

export const MS_PER_SECOND = 1_000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;

export function isRunning(entry: TimeEntry): boolean {
  return entry.end === null;
}

/** Ende eines Eintrags; bei einem laufenden Timer ist das „jetzt“. */
export function effectiveEnd(entry: TimeEntry, now: Timestamp): Timestamp {
  return entry.end ?? now;
}

export function entryDurationMs(entry: TimeEntry, now: Timestamp): number {
  return Math.max(0, effectiveEnd(entry, now) - entry.start);
}

/** Minutengenaue Rundung (kaufmännisch: ab 30 Sekunden wird aufgerundet). */
export function toWholeMinutes(ms: number): number {
  return Math.round(ms / MS_PER_MINUTE);
}

/** True, wenn ein laufender Timer länger als `thresholdMs` läuft (vermutlich vergessen). */
export function isLongRunning(entry: TimeEntry, now: Timestamp, thresholdMs: number): boolean {
  return isRunning(entry) && entryDurationMs(entry, now) > thresholdMs;
}
