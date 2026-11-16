/**
 * Auswertung: Summen pro Projekt in einem Zeitraum.
 *
 * Einträge, die über die Grenze des Zeitraums hinausgehen (z. B. über Mitternacht
 * oder über das Monatsende), werden nur mit dem Anteil gezählt, der im Zeitraum liegt.
 *
 * Rundung: Jede Projektsumme wird auf ganze Minuten gerundet. Die Gesamtsumme ist
 * die Summe dieser gerundeten Werte, damit Zeilen und Summe im Bericht immer zusammenpassen.
 */
import { effectiveEnd, toWholeMinutes } from './time';
import type { Project, ProjectId, TimeEntry, TimeRange, Timestamp } from './types';

/** Millisekunden eines Eintrags, die innerhalb des Zeitraums liegen. */
export function overlapMs(entry: TimeEntry, range: TimeRange, now: Timestamp): number {
  const start = Math.max(entry.start, range.start);
  const end = Math.min(effectiveEnd(entry, now), range.end);
  return Math.max(0, end - start);
}

export function overlapsRange(entry: TimeEntry, range: TimeRange, now: Timestamp): boolean {
  return entry.start < range.end && effectiveEnd(entry, now) > range.start;
}

export interface ProjectSummaryRow {
  projectId: ProjectId;
  /** `undefined` nur bei inkonsistenten Daten (Eintrag ohne Projekt). */
  project: Project | undefined;
  minutes: number;
}

export interface ProjectSummary {
  rows: ProjectSummaryRow[];
  totalMinutes: number;
}

/** Ungerundete Zeit pro Projekt im Zeitraum (in Millisekunden). */
export function msByProjectInRange(
  entries: readonly TimeEntry[],
  range: TimeRange,
  now: Timestamp,
): Map<ProjectId, number> {
  const result = new Map<ProjectId, number>();
  for (const entry of entries) {
    const ms = overlapMs(entry, range, now);
    if (ms > 0) {
      result.set(entry.projectId, (result.get(entry.projectId) ?? 0) + ms);
    }
  }
  return result;
}

export function summarizeByProject(
  entries: readonly TimeEntry[],
  projects: readonly Project[],
  range: TimeRange,
  now: Timestamp,
): ProjectSummary {
  const projectsById = new Map(projects.map((project) => [project.id, project]));
  const rows: ProjectSummaryRow[] = [...msByProjectInRange(entries, range, now)]
    .map(([projectId, ms]) => ({
      projectId,
      project: projectsById.get(projectId),
      minutes: toWholeMinutes(ms),
    }))
    .filter((row) => row.minutes > 0)
    .sort(
      (a, b) =>
        b.minutes - a.minutes || (a.project?.name ?? '').localeCompare(b.project?.name ?? '', 'de'),
    );

  const totalMinutes = rows.reduce((sum, row) => sum + row.minutes, 0);
  return { rows, totalMinutes };
}

/** Ungerundete Summe in Millisekunden, z. B. für eine sekundengenaue Live-Anzeige. */
export function totalMsInRange(
  entries: readonly TimeEntry[],
  range: TimeRange,
  now: Timestamp,
  projectId?: ProjectId,
): number {
  return entries
    .filter((entry) => projectId === undefined || entry.projectId === projectId)
    .reduce((sum, entry) => sum + overlapMs(entry, range, now), 0);
}
