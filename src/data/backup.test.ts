import { describe, expect, it } from 'vitest';
import { at, makeEntry, makeProject } from '@/test/fixtures';
import { createBackup, parseBackup, serializeBackup } from './backupFormat';
import { readBackup, restoreBackup } from './backupRepository';
import { db } from './db';

const projects = [makeProject({ id: 'a', name: 'Alpha' })];
const entries = [
  makeEntry({ id: 'e1', projectId: 'a' }),
  makeEntry({ id: 'e2', projectId: 'a', end: null }),
];

describe('Backup-Format', () => {
  it('liest eine selbst erzeugte Sicherung wieder ein', () => {
    const backup = createBackup(projects, entries, at(2026, 11, 16, 18));
    const result = parseBackup(serializeBackup(backup));
    expect(result).toEqual({ ok: true, backup });
  });

  it('erkennt kaputte und fremde Dateien', () => {
    expect(parseBackup('kein json')).toEqual({ ok: false, error: 'invalid-json' });
    expect(parseBackup('{"foo": 1}')).toEqual({ ok: false, error: 'wrong-format' });
    expect(parseBackup('{"format":"zeitkontierung-backup","version":99}')).toEqual({
      ok: false,
      error: 'unsupported-version',
    });
  });

  it('erkennt inkonsistente Daten', () => {
    const orphan = createBackup(projects, [makeEntry({ projectId: 'unbekannt' })], 0);
    expect(parseBackup(serializeBackup(orphan))).toEqual({ ok: false, error: 'invalid-data' });

    const twoRunning = createBackup(
      projects,
      [makeEntry({ projectId: 'a', end: null }), makeEntry({ projectId: 'a', end: null })],
      0,
    );
    expect(parseBackup(serializeBackup(twoRunning))).toEqual({ ok: false, error: 'invalid-data' });
  });
});

describe('Sichern und Wiederherstellen', () => {
  it('ersetzt alle vorhandenen Daten durch die Sicherung', async () => {
    await db.projects.add(makeProject({ id: 'x', name: 'Wird ersetzt' }));
    await restoreBackup(createBackup(projects, entries, 0));

    expect(await db.projects.toArray()).toEqual(projects);
    const backup = await readBackup(at(2026, 11, 16));
    expect(backup.entries).toHaveLength(2);
    expect(backup.projects).toEqual(projects);
  });
});
