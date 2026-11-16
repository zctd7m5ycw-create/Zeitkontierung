/**
 * Regeln für Projekte: Namensprüfung und Sortierung.
 */
import type { Project, ProjectId } from './types';

export const MAX_PROJECT_NAME_LENGTH = 60;

export type ProjectValidationError = 'name-empty' | 'name-too-long' | 'name-taken';

/** Entfernt Leerzeichen am Rand und fasst mehrfache Leerzeichen zusammen. */
export function normalizeProjectName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Prüft einen Projektnamen. Namen müssen eindeutig sein (ohne Groß-/Kleinschreibung),
 * auch gegenüber archivierten Projekten, damit Auswertungen eindeutig bleiben.
 */
export function validateProjectName(
  name: string,
  existing: readonly Project[],
  editingId?: ProjectId,
): ProjectValidationError | null {
  const normalized = normalizeProjectName(name);
  if (normalized.length === 0) return 'name-empty';
  if (normalized.length > MAX_PROJECT_NAME_LENGTH) return 'name-too-long';
  const lower = normalized.toLocaleLowerCase('de');
  const taken = existing.some(
    (project) => project.id !== editingId && project.name.toLocaleLowerCase('de') === lower,
  );
  return taken ? 'name-taken' : null;
}

export function sortProjectsByName(projects: readonly Project[]): Project[] {
  return [...projects].sort((a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }));
}
