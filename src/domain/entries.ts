/**
 * Regeln für Zeiteinträge: Prüfung beim Speichern und Gruppierung für die Anzeige.
 */
import { startOfDay } from './dateRange';
import { effectiveEnd } from './time';
import type { EntryId, ProjectId, TimeEntry, Timestamp } from './types';

/** Eingabe beim Anlegen oder Bearbeiten eines Eintrags. */
export interface EntryDraft {
  projectId: ProjectId;
  start: Timestamp;
  end: Timestamp | null;
  note: string;
}

export type EntryValidationError =
  'missing-project' | 'start-in-future' | 'end-in-future' | 'end-not-after-start' | 'overlap';

/** Erlaubte Abweichung in die Zukunft, damit eine Eingabe „jetzt“ nicht abgelehnt wird. */
const FUTURE_TOLERANCE_MS = 60_000;

/**
 * Prüft einen Eintrag. Gibt den ersten gefundenen Fehler zurück oder `null`, wenn alles passt.
 *
 * @param otherEntries Bereits gespeicherte Einträge, gegen die auf Überschneidung geprüft wird.
 * @param editingId    ID des bearbeiteten Eintrags, damit er nicht mit sich selbst kollidiert.
 */
export function validateEntry(
  draft: EntryDraft,
  otherEntries: readonly TimeEntry[],
  now: Timestamp,
  editingId?: EntryId,
): EntryValidationError | null {
  if (!draft.projectId) return 'missing-project';
  if (draft.start > now + FUTURE_TOLERANCE_MS) return 'start-in-future';
  if (draft.end !== null) {
    if (draft.end <= draft.start) return 'end-not-after-start';
    if (draft.end > now + FUTURE_TOLERANCE_MS) return 'end-in-future';
  }
  if (findOverlap(draft, otherEntries, now, editingId)) return 'overlap';
  return null;
}

/** Sucht einen Eintrag desselben Projekts, der sich zeitlich mit dem Entwurf überschneidet. */
export function findOverlap(
  draft: EntryDraft,
  otherEntries: readonly TimeEntry[],
  now: Timestamp,
  editingId?: EntryId,
): TimeEntry | undefined {
  const draftEnd = draft.end ?? now;
  return otherEntries.find(
    (other) =>
      other.id !== editingId &&
      other.projectId === draft.projectId &&
      draft.start < effectiveEnd(other, now) &&
      other.start < draftEnd,
  );
}

export interface DayGroup {
  /** Beginn des Kalendertags (00:00 Uhr lokale Zeit). */
  day: Timestamp;
  entries: TimeEntry[];
}

/**
 * Gruppiert Einträge nach dem Tag, an dem sie begonnen haben.
 * Neueste Tage und Einträge stehen oben.
 */
export function groupByStartDay(entries: readonly TimeEntry[]): DayGroup[] {
  const groups = new Map<Timestamp, TimeEntry[]>();
  for (const entry of [...entries].sort((a, b) => b.start - a.start)) {
    const day = startOfDay(entry.start);
    const group = groups.get(day);
    if (group) {
      group.push(entry);
    } else {
      groups.set(day, [entry]);
    }
  }
  return [...groups].map(([day, dayEntries]) => ({ day, entries: dayEntries }));
}
