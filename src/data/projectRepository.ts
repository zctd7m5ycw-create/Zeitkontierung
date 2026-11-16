/**
 * Schreib- und Lesezugriffe für Projekte.
 */
import type { ProjectColor } from '@/domain/projectColors';
import {
  normalizeProjectName,
  validateProjectName,
  type ProjectValidationError,
} from '@/domain/projects';
import type { Project, ProjectId, Timestamp } from '@/domain/types';
import { db } from './db';
import { createId } from './ids';

/** Wird geworfen, wenn ein Projektname ungültig oder schon vergeben ist. */
export class ProjectValidationFailure extends Error {
  readonly code: ProjectValidationError;

  constructor(code: ProjectValidationError) {
    super(`Ungültiges Projekt: ${code}`);
    this.name = 'ProjectValidationFailure';
    this.code = code;
  }
}

export interface ProjectInput {
  name: string;
  color: ProjectColor;
}

export function createProject(input: ProjectInput, now: Timestamp = Date.now()): Promise<Project> {
  return db.transaction('rw', db.projects, async () => {
    await assertNameValid(input.name);
    const project: Project = {
      id: createId(),
      name: normalizeProjectName(input.name),
      color: input.color,
      archived: false,
      createdAt: now,
    };
    await db.projects.add(project);
    return project;
  });
}

export function updateProject(id: ProjectId, input: ProjectInput): Promise<void> {
  return db.transaction('rw', db.projects, async () => {
    await assertNameValid(input.name, id);
    await db.projects.update(id, { name: normalizeProjectName(input.name), color: input.color });
  });
}

/**
 * Archiviert ein Projekt oder holt es aus dem Archiv zurück.
 * Läuft beim Archivieren gerade sein Timer, wird dieser gestoppt.
 */
export function setProjectArchived(
  id: ProjectId,
  archived: boolean,
  now: Timestamp = Date.now(),
): Promise<void> {
  return db.transaction('rw', db.projects, db.entries, async () => {
    if (archived) {
      const running = await db.entries
        .where('projectId')
        .equals(id)
        .filter((entry) => entry.end === null)
        .first();
      if (running) {
        await db.entries.update(running.id, { end: Math.max(now, running.start) });
      }
    }
    await db.projects.update(id, { archived });
  });
}

export function countEntriesForProject(id: ProjectId): Promise<number> {
  return db.entries.where('projectId').equals(id).count();
}

/**
 * Löscht ein Projekt, aber nur, wenn es noch keine Zeiteinträge hat
 * (z. B. nach einem Tippfehler). Projekte mit Zeiten werden archiviert, nicht gelöscht.
 *
 * @returns `true`, wenn gelöscht wurde.
 */
export function deleteProjectIfUnused(id: ProjectId): Promise<boolean> {
  return db.transaction('rw', db.projects, db.entries, async () => {
    if ((await countEntriesForProject(id)) > 0) return false;
    await db.projects.delete(id);
    return true;
  });
}

async function assertNameValid(name: string, editingId?: ProjectId) {
  const existing = await db.projects.toArray();
  const error = validateProjectName(name, existing, editingId);
  if (error) throw new ProjectValidationFailure(error);
}
