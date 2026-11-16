/**
 * Hilfsfunktionen zum Erzeugen von Testdaten.
 */
import type { Project, TimeEntry, Timestamp } from '@/domain/types';

/** Lokale Uhrzeit in Europe/Berlin (siehe vitest.config.ts), Monat 1-basiert. */
export function at(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
): Timestamp {
  return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'p1',
    name: 'Projekt A',
    color: 'blue',
    archived: false,
    createdAt: at(2026, 1, 1),
    ...overrides,
  };
}

let entryCounter = 0;

export function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  entryCounter += 1;
  return {
    id: `e${entryCounter}`,
    projectId: 'p1',
    start: at(2026, 11, 16, 8, 0),
    end: at(2026, 11, 16, 9, 0),
    note: '',
    ...overrides,
  };
}
