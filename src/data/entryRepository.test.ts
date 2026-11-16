import { beforeEach, describe, expect, it } from 'vitest';
import { at, makeProject } from '@/test/fixtures';
import { db } from './db';
import {
  createEntry,
  EntryValidationFailure,
  findRunningEntry,
  startTimer,
  stopTimer,
  toggleTimer,
  updateEntry,
} from './entryRepository';

beforeEach(async () => {
  await db.projects.bulkAdd([
    makeProject({ id: 'a', name: 'Alpha' }),
    makeProject({ id: 'b', name: 'Beta' }),
    makeProject({ id: 'old', name: 'Alt', archived: true }),
  ]);
});

describe('Timer', () => {
  it('Starten eines Projekts stoppt das laufende', async () => {
    await startTimer('a', at(2026, 11, 16, 8));
    await startTimer('b', at(2026, 11, 16, 10));

    const entries = await db.entries.orderBy('start').toArray();
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({ projectId: 'a', end: at(2026, 11, 16, 10) });
    expect(entries[1]).toMatchObject({ projectId: 'b', end: null });
  });

  it('erneutes Starten desselben Projekts ändert nichts', async () => {
    const first = await startTimer('a', at(2026, 11, 16, 8));
    const second = await startTimer('a', at(2026, 11, 16, 9));
    expect(second.id).toBe(first.id);
    expect(await db.entries.count()).toBe(1);
  });

  it('toggleTimer stoppt den Timer des gleichen Projekts', async () => {
    await toggleTimer('a', at(2026, 11, 16, 8));
    await toggleTimer('a', at(2026, 11, 16, 9));
    expect(await findRunningEntry()).toBeUndefined();
    expect((await db.entries.toArray())[0]?.end).toBe(at(2026, 11, 16, 9));
  });

  it('stopTimer ohne laufenden Timer tut nichts', async () => {
    expect(await stopTimer()).toBeUndefined();
  });

  it('archivierte Projekte können nicht gestartet werden', async () => {
    await expect(startTimer('old')).rejects.toThrow();
  });
});

describe('Einträge nachtragen und bearbeiten', () => {
  const now = at(2026, 11, 16, 18);

  it('legt einen gültigen Eintrag an und kürzt die Notiz', async () => {
    const entry = await createEntry(
      { projectId: 'a', start: at(2026, 11, 16, 8), end: at(2026, 11, 16, 9), note: ' Planung ' },
      now,
    );
    expect(entry.note).toBe('Planung');
    expect(await db.entries.get(entry.id)).toEqual(entry);
  });

  it('lehnt Überschneidungen mit einem Fehlercode ab', async () => {
    await createEntry(
      { projectId: 'a', start: at(2026, 11, 16, 8), end: at(2026, 11, 16, 9), note: '' },
      now,
    );
    const attempt = createEntry(
      { projectId: 'a', start: at(2026, 11, 16, 8, 30), end: at(2026, 11, 16, 10), note: '' },
      now,
    );
    await expect(attempt).rejects.toBeInstanceOf(EntryValidationFailure);
    await expect(attempt).rejects.toMatchObject({ code: 'overlap' });
  });

  it('ein laufender Eintrag kann über die Bearbeitung beendet werden', async () => {
    const running = await startTimer('a', at(2026, 11, 16, 8));
    await updateEntry(
      running.id,
      { projectId: 'a', start: running.start, end: at(2026, 11, 16, 12), note: 'Fertig' },
      now,
    );
    expect(await findRunningEntry()).toBeUndefined();
  });

  it('ein abgeschlossener Eintrag kann nicht wieder laufend werden', async () => {
    const entry = await createEntry(
      { projectId: 'a', start: at(2026, 11, 16, 8), end: at(2026, 11, 16, 9), note: '' },
      now,
    );
    await expect(
      updateEntry(entry.id, { projectId: 'a', start: entry.start, end: null, note: '' }, now),
    ).rejects.toThrow();
  });
});
