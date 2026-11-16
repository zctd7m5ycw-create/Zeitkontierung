import { describe, expect, it } from 'vitest';
import { at } from '@/test/fixtures';
import { db } from './db';
import { findRunningEntry, startTimer } from './entryRepository';
import {
  createProject,
  deleteProjectIfUnused,
  ProjectValidationFailure,
  setProjectArchived,
  updateProject,
} from './projectRepository';

describe('projectRepository', () => {
  it('legt Projekte mit normalisiertem Namen an', async () => {
    const project = await createProject({ name: '  Neubau  Halle ', color: 'teal' });
    expect(project).toMatchObject({ name: 'Neubau Halle', color: 'teal', archived: false });
  });

  it('verhindert doppelte Namen', async () => {
    await createProject({ name: 'Alpha', color: 'blue' });
    await expect(createProject({ name: 'alpha', color: 'rose' })).rejects.toBeInstanceOf(
      ProjectValidationFailure,
    );
  });

  it('benennt um und ändert die Farbe', async () => {
    const project = await createProject({ name: 'Alpha', color: 'blue' });
    await updateProject(project.id, { name: 'Alpha 2', color: 'green' });
    expect(await db.projects.get(project.id)).toMatchObject({ name: 'Alpha 2', color: 'green' });
  });

  it('Archivieren stoppt den laufenden Timer des Projekts', async () => {
    const project = await createProject({ name: 'Alpha', color: 'blue' });
    await startTimer(project.id, at(2026, 11, 16, 8));
    await setProjectArchived(project.id, true, at(2026, 11, 16, 9));

    expect(await findRunningEntry()).toBeUndefined();
    expect((await db.projects.get(project.id))?.archived).toBe(true);
  });

  it('löscht nur Projekte ohne Einträge', async () => {
    const unused = await createProject({ name: 'Tippfehler', color: 'blue' });
    const used = await createProject({ name: 'Alpha', color: 'blue' });
    await startTimer(used.id);

    expect(await deleteProjectIfUnused(unused.id)).toBe(true);
    expect(await deleteProjectIfUnused(used.id)).toBe(false);
    expect(await db.projects.count()).toBe(1);
  });
});
