/**
 * Schreib- und Lesezugriffe für Zeiteinträge.
 *
 * Zentrale Regel: Es läuft höchstens ein Timer gleichzeitig.
 * Starten stoppt einen laufenden Timer automatisch – beides geschieht in einer
 * gemeinsamen Datenbank-Transaktion, damit nie zwei Timer gleichzeitig laufen.
 */
import { validateEntry, type EntryDraft, type EntryValidationError } from '@/domain/entries';
import type { EntryId, ProjectId, TimeEntry, Timestamp } from '@/domain/types';
import { db } from './db';
import { createId } from './ids';

/** Wird geworfen, wenn ein Eintrag gegen eine Regel verstößt (z. B. Ende vor Start). */
export class EntryValidationFailure extends Error {
  readonly code: EntryValidationError;

  constructor(code: EntryValidationError) {
    super(`Ungültiger Zeiteintrag: ${code}`);
    this.name = 'EntryValidationFailure';
    this.code = code;
  }
}

/** Der laufende Eintrag oder `undefined`, wenn kein Timer läuft. */
export function findRunningEntry(): Promise<TimeEntry | undefined> {
  return db.entries.filter((entry) => entry.end === null).first();
}

/**
 * Startet den Timer für ein Projekt. Ein anderer laufender Timer wird dabei gestoppt.
 * Läuft der Timer dieses Projekts bereits, passiert nichts.
 */
export function startTimer(projectId: ProjectId, now: Timestamp = Date.now()): Promise<TimeEntry> {
  return db.transaction('rw', db.entries, db.projects, async () => {
    const project = await db.projects.get(projectId);
    if (!project || project.archived) {
      throw new Error('Timer kann nur für ein aktives Projekt gestartet werden.');
    }

    const running = await findRunningEntry();
    if (running?.projectId === projectId) return running;
    if (running) {
      await db.entries.update(running.id, { end: Math.max(now, running.start) });
    }

    const entry: TimeEntry = { id: createId(), projectId, start: now, end: null, note: '' };
    await db.entries.add(entry);
    return entry;
  });
}

/** Stoppt den laufenden Timer. Gibt den gestoppten Eintrag zurück oder `undefined`. */
export function stopTimer(now: Timestamp = Date.now()): Promise<TimeEntry | undefined> {
  return db.transaction('rw', db.entries, async () => {
    const running = await findRunningEntry();
    if (!running) return undefined;
    const end = Math.max(now, running.start);
    await db.entries.update(running.id, { end });
    return { ...running, end };
  });
}

/** Startet den Timer des Projekts oder stoppt ihn, wenn er bereits läuft. */
export async function toggleTimer(
  projectId: ProjectId,
  now: Timestamp = Date.now(),
): Promise<void> {
  const running = await findRunningEntry();
  if (running?.projectId === projectId) {
    await stopTimer(now);
  } else {
    await startTimer(projectId, now);
  }
}

/** Trägt einen abgeschlossenen Zeitblock nach. */
export async function createEntry(
  draft: EntryDraft,
  now: Timestamp = Date.now(),
): Promise<TimeEntry> {
  if (draft.end === null) {
    throw new Error('Nachgetragene Einträge brauchen ein Ende. Timer startet man mit startTimer.');
  }
  return db.transaction('rw', db.entries, db.projects, async () => {
    await assertValid(draft, now);
    const entry: TimeEntry = { id: createId(), ...draft, note: draft.note.trim() };
    await db.entries.add(entry);
    return entry;
  });
}

/**
 * Ändert einen Eintrag. Ein laufender Eintrag darf ein Ende bekommen (= stoppen);
 * ein abgeschlossener Eintrag darf aber nicht wieder „laufend“ werden.
 */
export function updateEntry(
  id: EntryId,
  draft: EntryDraft,
  now: Timestamp = Date.now(),
): Promise<TimeEntry> {
  return db.transaction('rw', db.entries, db.projects, async () => {
    const existing = await db.entries.get(id);
    if (!existing) throw new Error('Eintrag nicht gefunden.');
    if (existing.end !== null && draft.end === null) {
      throw new Error('Ein abgeschlossener Eintrag kann nicht wieder gestartet werden.');
    }
    await assertValid(draft, now, id);
    const updated: TimeEntry = { ...existing, ...draft, note: draft.note.trim() };
    await db.entries.put(updated);
    return updated;
  });
}

export async function deleteEntry(id: EntryId): Promise<void> {
  await db.entries.delete(id);
}

async function assertValid(draft: EntryDraft, now: Timestamp, editingId?: EntryId) {
  const project = await db.projects.get(draft.projectId);
  if (!project) throw new EntryValidationFailure('missing-project');
  const sameProject = await db.entries.where('projectId').equals(draft.projectId).toArray();
  const error = validateEntry(draft, sameProject, now, editingId);
  if (error) throw new EntryValidationFailure(error);
}
