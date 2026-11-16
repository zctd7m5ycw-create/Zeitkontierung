/**
 * Zentrale Datentypen der App.
 *
 * Diese Typen beschreiben genau das, was in der Datenbank gespeichert wird.
 * Abgeleitete Werte (z. B. Dauern oder Summen) werden nie gespeichert, sondern
 * immer aus Start und Ende berechnet – siehe `time.ts` und `report.ts`.
 */
import type { ProjectColor } from './projectColors';

/** Zeitpunkt als Millisekunden seit 01.01.1970 UTC (wie `Date.now()`). */
export type Timestamp = number;

export type ProjectId = string;
export type EntryId = string;

export interface Project {
  id: ProjectId;
  name: string;
  color: ProjectColor;
  /** Archivierte Projekte erscheinen nicht mehr im Timer, ihre Zeiten bleiben erhalten. */
  archived: boolean;
  createdAt: Timestamp;
}

export interface TimeEntry {
  id: EntryId;
  projectId: ProjectId;
  start: Timestamp;
  /** `null` bedeutet: Der Timer läuft noch. Es gibt höchstens einen solchen Eintrag. */
  end: Timestamp | null;
  /** Freitext, leerer String wenn keine Notiz vorhanden ist. */
  note: string;
}

/** Zeitraum, halboffen: `start` gehört dazu, `end` nicht mehr. */
export interface TimeRange {
  start: Timestamp;
  end: Timestamp;
}
