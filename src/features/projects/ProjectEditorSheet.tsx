/**
 * Projekt anlegen oder bearbeiten (Name, Farbe, Archivieren, Löschen).
 *
 * Wird von der Eltern-Komponente nur gerendert, solange es offen ist,
 * damit jedes Öffnen mit frischem Formular beginnt.
 */
import { useId, useState, type FormEvent } from 'react';
import { useEntryCount } from '@/data/hooks';
import {
  createProject,
  deleteProjectIfUnused,
  ProjectValidationFailure,
  setProjectArchived,
  updateProject,
} from '@/data/projectRepository';
import { suggestProjectColor, type ProjectColor } from '@/domain/projectColors';
import { MAX_PROJECT_NAME_LENGTH } from '@/domain/projects';
import type { Project } from '@/domain/types';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { Field, FormStack, Input } from '@/ui/Form';
import { Notice } from '@/ui/Notice';
import { Sheet } from '@/ui/Sheet';
import { ColorPicker } from './ColorPicker';
import { PROJECT_ERROR_MESSAGES } from './projectMessages';
import styles from './ProjectEditorSheet.module.css';

interface ProjectEditorSheetProps {
  /** Zu bearbeitendes Projekt; ohne Angabe wird ein neues angelegt. */
  project?: Project;
  /** Alle vorhandenen Projekte, um eine freie Farbe vorzuschlagen. */
  allProjects: readonly Project[];
  onClose: () => void;
}

export function ProjectEditorSheet({ project, allProjects, onClose }: ProjectEditorSheetProps) {
  const isNew = project === undefined;
  const formId = useId();
  const nameId = useId();
  const colorLabelId = useId();

  const [name, setName] = useState(project?.name ?? '');
  const [color, setColor] = useState<ProjectColor>(
    () => project?.color ?? suggestProjectColor(allProjects.map((p) => p.color)),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (isNew) {
        await createProject({ name, color });
      } else {
        await updateProject(project.id, { name, color });
      }
      onClose();
    } catch (cause) {
      setError(
        cause instanceof ProjectValidationFailure
          ? PROJECT_ERROR_MESSAGES[cause.code]
          : 'Das Projekt konnte nicht gespeichert werden.',
      );
      setBusy(false);
    }
  }

  async function handleArchiveToggle() {
    if (!project) return;
    try {
      await setProjectArchived(project.id, !project.archived);
      onClose();
    } catch (cause) {
      console.error(cause);
      setError('Das Projekt konnte nicht geändert werden.');
    }
  }

  async function handleDelete() {
    if (!project) return;
    setConfirmDelete(false);
    try {
      if (await deleteProjectIfUnused(project.id)) {
        onClose();
      } else {
        setError('Das Projekt hat inzwischen Zeiten und kann nur archiviert werden.');
      }
    } catch (cause) {
      console.error(cause);
      setError('Das Projekt konnte nicht gelöscht werden.');
    }
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={isNew ? 'Neues Projekt' : 'Projekt bearbeiten'}
      footer={
        <Button type="submit" form={formId} variant="primary" size="lg" fullWidth disabled={busy}>
          {isNew ? 'Projekt anlegen' : 'Speichern'}
        </Button>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <FormStack>
          {error && <Notice tone="error">{error}</Notice>}

          <Field label="Name" htmlFor={nameId}>
            <Input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={MAX_PROJECT_NAME_LENGTH}
              autoComplete="off"
              enterKeyHint="done"
              placeholder="z. B. Neubau Halle 3"
              autoFocus={isNew}
            />
          </Field>

          <div>
            <p id={colorLabelId} className={styles.colorLabel}>
              Farbe
            </p>
            <ColorPicker value={color} onChange={setColor} labelledBy={colorLabelId} />
          </div>
        </FormStack>
      </form>

      {project && (
        <ProjectDangerZone
          project={project}
          onArchiveToggle={handleArchiveToggle}
          onDelete={() => setConfirmDelete(true)}
        />
      )}

      {project && (
        <ConfirmDialog
          open={confirmDelete}
          title="Projekt löschen?"
          message={`„${project.name}“ wird endgültig gelöscht.`}
          confirmLabel="Löschen"
          destructive
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </Sheet>
  );
}

interface ProjectDangerZoneProps {
  project: Project;
  onArchiveToggle: () => void;
  onDelete: () => void;
}

/** Archivieren bzw. Löschen. Löschen gibt es nur für Projekte ohne Zeiten. */
function ProjectDangerZone({ project, onArchiveToggle, onDelete }: ProjectDangerZoneProps) {
  const entryCount = useEntryCount(project.id);

  return (
    <div className={styles.dangerZone}>
      <Button icon="archive" fullWidth onClick={onArchiveToggle}>
        {project.archived ? 'Aus dem Archiv holen' : 'Archivieren'}
      </Button>
      <p className={styles.hint}>
        {project.archived
          ? 'Das Projekt erscheint danach wieder im Timer.'
          : 'Archivierte Projekte verschwinden aus dem Timer. Ihre Zeiten bleiben in Einträgen und Auswertung erhalten.'}
      </p>

      {entryCount === 0 && (
        <Button icon="trash" variant="danger" fullWidth onClick={onDelete}>
          Projekt löschen
        </Button>
      )}
    </div>
  );
}
