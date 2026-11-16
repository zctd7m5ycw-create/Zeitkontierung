/**
 * Dateiformat der Datensicherung (JSON).
 *
 * Beim Einlesen wird die Datei vollständig geprüft, bevor irgendetwas an den
 * vorhandenen Daten geändert wird. Wird das Format erweitert, `BACKUP_VERSION`
 * erhöhen und ältere Versionen beim Einlesen umwandeln.
 */
import { z } from 'zod';
import { PROJECT_COLORS } from '@/domain/projectColors';
import { MAX_PROJECT_NAME_LENGTH } from '@/domain/projects';
import type { Project, TimeEntry, Timestamp } from '@/domain/types';

export const BACKUP_FORMAT_ID = 'zeitkontierung-backup';
export const BACKUP_VERSION = 1;

const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(MAX_PROJECT_NAME_LENGTH),
  color: z.enum(PROJECT_COLORS),
  archived: z.boolean(),
  createdAt: z.number().int().nonnegative(),
});

const entrySchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative().nullable(),
  note: z.string(),
});

const backupSchema = z
  .object({
    format: z.literal(BACKUP_FORMAT_ID),
    version: z.literal(BACKUP_VERSION),
    exportedAt: z.iso.datetime(),
    projects: z.array(projectSchema),
    entries: z.array(entrySchema),
  })
  .superRefine((backup, ctx) => {
    const projectIds = new Set(backup.projects.map((project) => project.id));
    if (projectIds.size !== backup.projects.length) {
      ctx.addIssue({ code: 'custom', message: 'Doppelte Projekt-IDs' });
    }
    if (new Set(backup.entries.map((entry) => entry.id)).size !== backup.entries.length) {
      ctx.addIssue({ code: 'custom', message: 'Doppelte Eintrags-IDs' });
    }
    if (backup.entries.some((entry) => !projectIds.has(entry.projectId))) {
      ctx.addIssue({ code: 'custom', message: 'Eintrag verweist auf unbekanntes Projekt' });
    }
    if (backup.entries.some((entry) => entry.end !== null && entry.end < entry.start)) {
      ctx.addIssue({ code: 'custom', message: 'Eintrag endet vor seinem Beginn' });
    }
    if (backup.entries.filter((entry) => entry.end === null).length > 1) {
      ctx.addIssue({ code: 'custom', message: 'Mehr als ein laufender Timer' });
    }
  });

export interface Backup {
  format: typeof BACKUP_FORMAT_ID;
  version: typeof BACKUP_VERSION;
  /** Erstellungszeitpunkt als ISO-Text, z. B. "2026-11-16T18:30:00.000Z". */
  exportedAt: string;
  projects: Project[];
  entries: TimeEntry[];
}

export type BackupParseError =
  'invalid-json' | 'wrong-format' | 'unsupported-version' | 'invalid-data';

export type BackupParseResult =
  { ok: true; backup: Backup } | { ok: false; error: BackupParseError };

export function createBackup(
  projects: readonly Project[],
  entries: readonly TimeEntry[],
  now: Timestamp,
): Backup {
  return {
    format: BACKUP_FORMAT_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date(now).toISOString(),
    projects: [...projects],
    entries: [...entries],
  };
}

export function serializeBackup(backup: Backup): string {
  return JSON.stringify(backup, null, 2);
}

export function parseBackup(text: string): BackupParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'invalid-json' };
  }

  if (!isRecord(raw) || raw.format !== BACKUP_FORMAT_ID) {
    return { ok: false, error: 'wrong-format' };
  }
  if (raw.version !== BACKUP_VERSION) {
    return { ok: false, error: 'unsupported-version' };
  }

  const result = backupSchema.safeParse(raw);
  return result.success ? { ok: true, backup: result.data } : { ok: false, error: 'invalid-data' };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
