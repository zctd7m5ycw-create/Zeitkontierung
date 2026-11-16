/**
 * Kleine, typisierte Einstellungen, die in der Datenbank liegen.
 * Neue Einstellung: Schlüssel und Typ in `Settings` ergänzen.
 */
import type { Timestamp } from '@/domain/types';
import { db } from './db';

export interface Settings {
  /** Zeitpunkt der letzten erfolgreich erstellten Sicherung. */
  lastBackupAt: Timestamp;
}

export type SettingKey = keyof Settings;

export async function getSetting<K extends SettingKey>(key: K): Promise<Settings[K] | undefined> {
  const record = await db.settings.get(key);
  return record?.value as Settings[K] | undefined;
}

export async function setSetting<K extends SettingKey>(key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value });
}
