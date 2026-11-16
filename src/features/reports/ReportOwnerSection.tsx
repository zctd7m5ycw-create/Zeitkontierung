/**
 * Einstellung „Name im PDF“: wird in den Einstellungen angezeigt und
 * öffnet zum Ändern ein eigenes Fenster.
 */
import { useId, useState, type FormEvent } from 'react';
import { useSetting } from '@/data/hooks';
import { setSetting } from '@/data/settingsRepository';
import { Button } from '@/ui/Button';
import { Field, FormStack, Input } from '@/ui/Form';
import { List, ListRow } from '@/ui/List';
import { Notice } from '@/ui/Notice';
import { Sheet } from '@/ui/Sheet';
import { MAX_REPORT_OWNER_LENGTH, normalizeReportOwner } from './reportOwner';
import styles from './ReportOwnerSection.module.css';

export function ReportOwnerSection() {
  const owner = useSetting('reportOwnerName');
  const [editing, setEditing] = useState(false);

  if (owner === undefined) return null;

  return (
    <>
      <List
        title="PDF-Bericht"
        footer="Erscheint oben im PDF der Auswertung, z. B. dein Name oder deine Firma."
      >
        <ListRow
          title="Name im Kopf"
          trailing={owner || <span className={styles.placeholder}>Nicht festgelegt</span>}
          chevron
          onClick={() => setEditing(true)}
        />
      </List>

      {editing && <ReportOwnerSheet initialName={owner ?? ''} onClose={() => setEditing(false)} />}
    </>
  );
}

interface ReportOwnerSheetProps {
  initialName: string;
  onClose: () => void;
}

function ReportOwnerSheet({ initialName, onClose }: ReportOwnerSheetProps) {
  const formId = useId();
  const inputId = useId();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await setSetting('reportOwnerName', normalizeReportOwner(name));
      onClose();
    } catch (cause) {
      console.error(cause);
      setError('Der Name konnte nicht gespeichert werden.');
    }
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title="Name im PDF"
      footer={
        <Button type="submit" form={formId} variant="primary" size="lg" fullWidth>
          Speichern
        </Button>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <FormStack>
          {error && <Notice tone="error">{error}</Notice>}
          <Field
            label="Name"
            htmlFor={inputId}
            hint="Leer lassen, wenn im PDF kein Name stehen soll."
          >
            <Input
              id={inputId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={MAX_REPORT_OWNER_LENGTH}
              autoComplete="name"
              enterKeyHint="done"
              placeholder="z. B. Gundermann"
              autoFocus
            />
          </Field>
        </FormStack>
      </form>
    </Sheet>
  );
}
