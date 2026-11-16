/**
 * Datensicherung: alle Daten auslesen bzw. vollständig ersetzen.
 */
import type { Timestamp } from '@/domain/types';
import { createBackup, type Backup } from './backupFormat';
import { db } from './db';

export async function readBackup(now: Timestamp = Date.now()): Promise<Backup> {
  return db.transaction('r', db.projects, db.entries, async () => {
    const [projects, entries] = await Promise.all([db.projects.toArray(), db.entries.toArray()]);
    return createBackup(projects, entries, now);
  });
}

/**
 * Ersetzt alle Projekte und Einträge durch den Inhalt der Sicherung.
 * Läuft in einer Transaktion: Schlägt etwas fehl, bleiben die alten Daten unverändert.
 */
export function restoreBackup(backup: Backup): Promise<void> {
  return db.transaction('rw', db.projects, db.entries, async () => {
    await Promise.all([db.projects.clear(), db.entries.clear()]);
    await db.projects.bulkAdd(backup.projects);
    await db.entries.bulkAdd(backup.entries);
  });
}
