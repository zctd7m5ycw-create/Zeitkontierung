/**
 * Lokale Datenbank (IndexedDB über die Bibliothek Dexie).
 *
 * Nur Dateien im Ordner `src/data/` greifen direkt auf `db` zu.
 * Alle anderen Teile der App nutzen die Repositories und Hooks aus diesem Ordner.
 *
 * Schema ändern:
 *   Eine bestehende `this.version(n)` niemals verändern – sie ist auf den Geräten
 *   bereits angelegt. Stattdessen eine neue Version mit höherer Nummer ergänzen,
 *   bei Bedarf mit `.upgrade(...)` für die Umwandlung vorhandener Daten.
 *   Siehe https://dexie.org/docs/Tutorial/Design#database-versioning
 */
import Dexie, { type EntityTable } from 'dexie';
import type { Project, TimeEntry } from '@/domain/types';

export const DATABASE_NAME = 'zeitkontierung';

/** Einfache Schlüssel-Wert-Einstellungen (siehe `settingsRepository.ts`). */
export interface SettingRecord {
  key: string;
  value: unknown;
}

export class AppDatabase extends Dexie {
  // `declare` statt normaler Felder: Dexie legt die Tabellen selbst an.
  declare projects: EntityTable<Project, 'id'>;
  declare entries: EntityTable<TimeEntry, 'id'>;
  declare settings: EntityTable<SettingRecord, 'key'>;

  constructor(name: string = DATABASE_NAME) {
    super(name);

    // Indizes: Nur Felder, nach denen gesucht oder sortiert wird.
    // `end` und `archived` sind bewusst nicht indiziert: IndexedDB kann
    // `null` und Wahrheitswerte nicht indizieren.
    this.version(1).stores({
      projects: 'id, name',
      entries: 'id, projectId, start',
      settings: 'key',
    });
  }
}

export const db = new AppDatabase();
