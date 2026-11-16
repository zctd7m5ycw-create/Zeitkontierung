/**
 * React-Hooks für das Lesen von Daten.
 *
 * Die Hooks aktualisieren sich automatisch, sobald sich die Daten in der
 * Datenbank ändern (über `useLiveQuery` von Dexie). Rückgabewert `undefined`
 * bedeutet: Die Daten werden noch geladen.
 */
import { useLiveQuery } from 'dexie-react-hooks';
import { sortProjectsByName } from '@/domain/projects';
import type { Project, ProjectId, TimeEntry, TimeRange } from '@/domain/types';
import { db } from './db';
import { findRunningEntry } from './entryRepository';
import { getSetting, type SettingKey, type Settings } from './settingsRepository';

/** Alle Projekte (aktive und archivierte), alphabetisch sortiert. */
export function useProjects(): Project[] | undefined {
  return useLiveQuery(async () => sortProjectsByName(await db.projects.toArray()), []);
}

/** Der laufende Eintrag, `null` wenn kein Timer läuft. */
export function useRunningEntry(): TimeEntry | null | undefined {
  return useLiveQuery(async () => (await findRunningEntry()) ?? null, []);
}

/** Alle Einträge, die den Zeitraum ganz oder teilweise berühren (inkl. laufendem Timer). */
export function useEntriesInRange(range: TimeRange): TimeEntry[] | undefined {
  return useLiveQuery(
    () =>
      db.entries
        .where('start')
        .below(range.end)
        .filter((entry) => entry.end === null || entry.end > range.start)
        .toArray(),
    [range.start, range.end],
  );
}

export function useEntryCount(projectId: ProjectId): number | undefined {
  return useLiveQuery(() => db.entries.where('projectId').equals(projectId).count(), [projectId]);
}

/**
 * Alle Projekte und Einträge. Wird für die Datensicherung vorab geladen, damit
 * beim Tippen auf „Sicherung erstellen“ das Teilen-Menü sofort öffnen kann.
 */
export function useAllData(): { projects: Project[]; entries: TimeEntry[] } | undefined {
  return useLiveQuery(async () => {
    const [projects, entries] = await Promise.all([db.projects.toArray(), db.entries.toArray()]);
    return { projects, entries };
  }, []);
}

export function useSetting<K extends SettingKey>(key: K): Settings[K] | null | undefined {
  return useLiveQuery(async () => (await getSetting(key)) ?? null, [key]);
}
