/**
 * Eintrag nachtragen oder bearbeiten (Projekt, Beginn, Ende, Notiz).
 *
 * Ein laufender Timer kann hier ebenfalls bearbeitet werden. Bekommt er ein
 * Ende, ist er damit gestoppt. Wird von der Eltern-Komponente nur gerendert,
 * solange es offen ist.
 */
import { useId, useState, type FormEvent } from 'react';
import {
  createEntry,
  deleteEntry,
  EntryValidationFailure,
  updateEntry,
} from '@/data/entryRepository';
import { parseDateTimeInputValue, toDateTimeInputValue } from '@/domain/dateInput';
import type { EntryDraft } from '@/domain/entries';
import { MS_PER_HOUR } from '@/domain/time';
import type { Project, TimeEntry } from '@/domain/types';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { Field, FormStack, Input, Select, Textarea } from '@/ui/Form';
import { Notice } from '@/ui/Notice';
import { Sheet } from '@/ui/Sheet';
import { ENTRY_ERROR_MESSAGES } from './entryMessages';
import styles from './EntryEditorSheet.module.css';

const MAX_NOTE_LENGTH = 500;

interface EntryEditorSheetProps {
  /** Zu bearbeitender Eintrag; ohne Angabe wird ein neuer nachgetragen. */
  entry?: TimeEntry;
  projects: readonly Project[];
  /** Vorausgewähltes Projekt beim Nachtragen. */
  defaultProjectId?: string;
  onClose: () => void;
}

export function EntryEditorSheet({
  entry,
  projects,
  defaultProjectId,
  onClose,
}: EntryEditorSheetProps) {
  const isNew = entry === undefined;
  const isRunning = entry?.end === null;
  const ids = { form: useId(), project: useId(), start: useId(), end: useId(), note: useId() };

  // Auswahl: aktive Projekte, plus das aktuelle Projekt, falls es archiviert ist.
  const selectableProjects = projects.filter(
    (project) => !project.archived || project.id === entry?.projectId,
  );

  const [initial] = useState(() => initialValues(entry, selectableProjects, defaultProjectId));
  const [projectId, setProjectId] = useState(initial.projectId);
  const [startValue, setStartValue] = useState(initial.start);
  const [endValue, setEndValue] = useState(initial.end);
  const [note, setNote] = useState(entry?.note ?? '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = buildDraft({ projectId, startValue, endValue, note, isRunning });
    if (typeof result === 'string') {
      setError(result);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (isNew) {
        await createEntry(result);
      } else {
        await updateEntry(entry.id, result);
      }
      onClose();
    } catch (cause) {
      if (!(cause instanceof EntryValidationFailure)) console.error(cause);
      setError(
        cause instanceof EntryValidationFailure
          ? ENTRY_ERROR_MESSAGES[cause.code]
          : 'Der Eintrag konnte nicht gespeichert werden.',
      );
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!entry) return;
    setConfirmDelete(false);
    try {
      await deleteEntry(entry.id);
      onClose();
    } catch (cause) {
      console.error(cause);
      setError('Der Eintrag konnte nicht gelöscht werden.');
    }
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={isNew ? 'Zeit nachtragen' : isRunning ? 'Laufender Timer' : 'Eintrag bearbeiten'}
      footer={
        <Button type="submit" form={ids.form} variant="primary" size="lg" fullWidth disabled={busy}>
          Speichern
        </Button>
      }
    >
      <form id={ids.form} onSubmit={handleSubmit} noValidate>
        <FormStack>
          {error && <Notice tone="error">{error}</Notice>}

          <Field label="Projekt" htmlFor={ids.project}>
            <Select
              id={ids.project}
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            >
              {projectId === '' && <option value="">Bitte wählen</option>}
              {selectableProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.archived ? `${project.name} (archiviert)` : project.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className={styles.timeRow}>
            <Field label="Beginn" htmlFor={ids.start}>
              <Input
                id={ids.start}
                type="datetime-local"
                value={startValue}
                onChange={(event) => setStartValue(event.target.value)}
                required
              />
            </Field>
            <Field
              label="Ende"
              htmlFor={ids.end}
              hint={isRunning ? 'Leer lassen, solange der Timer weiterlaufen soll.' : undefined}
            >
              <Input
                id={ids.end}
                type="datetime-local"
                value={endValue}
                onChange={(event) => setEndValue(event.target.value)}
                required={!isRunning}
              />
            </Field>
          </div>

          <Field label="Notiz" htmlFor={ids.note}>
            <Textarea
              id={ids.note}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={MAX_NOTE_LENGTH}
              placeholder="Woran hast du gearbeitet? (optional)"
            />
          </Field>
        </FormStack>
      </form>

      {entry && (
        <div className={styles.deleteArea}>
          <Button icon="trash" variant="danger" fullWidth onClick={() => setConfirmDelete(true)}>
            Eintrag löschen
          </Button>
          <ConfirmDialog
            open={confirmDelete}
            title="Eintrag löschen?"
            message="Der Eintrag wird endgültig gelöscht."
            confirmLabel="Löschen"
            destructive
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(false)}
          />
        </div>
      )}
    </Sheet>
  );
}

function initialValues(
  entry: TimeEntry | undefined,
  projects: readonly Project[],
  defaultProjectId: string | undefined,
) {
  if (entry) {
    return {
      projectId: entry.projectId,
      start: toDateTimeInputValue(entry.start),
      end: entry.end === null ? '' : toDateTimeInputValue(entry.end),
    };
  }
  // Neuer Eintrag: die letzte Stunde bis jetzt als Vorschlag.
  const now = Date.now();
  const preferred = projects.find((project) => project.id === defaultProjectId) ?? projects[0];
  return {
    projectId: preferred?.id ?? '',
    start: toDateTimeInputValue(now - MS_PER_HOUR),
    end: toDateTimeInputValue(now),
  };
}

interface FormValues {
  projectId: string;
  startValue: string;
  endValue: string;
  note: string;
  isRunning: boolean;
}

/** Wandelt die Formularwerte in einen Entwurf um oder liefert eine Fehlermeldung. */
function buildDraft(values: FormValues): EntryDraft | string {
  if (!values.projectId) return ENTRY_ERROR_MESSAGES['missing-project'];

  const start = parseDateTimeInputValue(values.startValue);
  if (start === null) return 'Bitte einen gültigen Beginn angeben.';

  if (values.endValue === '') {
    if (!values.isRunning) return 'Bitte ein Ende angeben.';
    return { projectId: values.projectId, start, end: null, note: values.note };
  }

  const end = parseDateTimeInputValue(values.endValue);
  if (end === null) return 'Bitte ein gültiges Ende angeben.';
  return { projectId: values.projectId, start, end, note: values.note };
}
