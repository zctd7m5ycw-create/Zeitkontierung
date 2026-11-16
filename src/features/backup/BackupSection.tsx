/**
 * Datensicherung in den Einstellungen: Sicherung als Datei erstellen und wieder einspielen.
 *
 * Da alle Daten nur auf dem iPhone liegen, ist das der einzige Weg, sie auf ein
 * neues Gerät mitzunehmen oder nach einem Verlust wiederherzustellen.
 */
import { useRef, useState, type ChangeEvent } from 'react';
import { APP_CONFIG } from '@/config/appConfig';
import { createBackup, parseBackup, serializeBackup, type Backup } from '@/data/backupFormat';
import { restoreBackup } from '@/data/backupRepository';
import { useAllData, useSetting } from '@/data/hooks';
import { setSetting } from '@/data/settingsRepository';
import { dayKey } from '@/domain/dateRange';
import { formatDate, formatTime } from '@/domain/format';
import { useNow } from '@/hooks/useNow';
import { shareOrDownload } from '@/lib/shareFile';
import { Button } from '@/ui/Button';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import { List } from '@/ui/List';
import { Notice } from '@/ui/Notice';
import { BACKUP_ERROR_MESSAGES } from './backupMessages';
import styles from './BackupSection.module.css';

const DAY_MS = 86_400_000;

type Status = { tone: 'success' | 'error'; text: string } | null;

export function BackupSection() {
  const now = useNow(60_000);
  const data = useAllData();
  const lastBackupAt = useSetting('lastBackupAt');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const [pendingRestore, setPendingRestore] = useState<Backup | null>(null);
  const [restoring, setRestoring] = useState(false);

  const hasData = (data?.entries.length ?? 0) > 0;
  const reminderDue =
    hasData &&
    lastBackupAt !== undefined &&
    (lastBackupAt === null || now - lastBackupAt > APP_CONFIG.backupReminderDays * DAY_MS);

  async function handleCreateBackup() {
    if (!data) return;
    setStatus(null);
    const now = Date.now();
    // Daten liegen bereits im Speicher: Das Teilen-Menü öffnet ohne Verzögerung.
    const json = serializeBackup(createBackup(data.projects, data.entries, now));
    const file = new File([json], `Zeitkontierung-Sicherung_${dayKey(now)}.json`, {
      type: 'application/json',
    });
    try {
      const outcome = await shareOrDownload(file);
      if (outcome !== 'cancelled') {
        await setSetting('lastBackupAt', now);
        setStatus({ tone: 'success', text: 'Sicherung erstellt.' });
      }
    } catch (cause) {
      console.error(cause);
      setStatus({ tone: 'error', text: 'Die Sicherung konnte nicht erstellt werden.' });
    }
  }

  async function handleFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // dieselbe Datei kann erneut gewählt werden
    if (!file) return;
    setStatus(null);

    const result = parseBackup(await file.text());
    if (result.ok) {
      setPendingRestore(result.backup);
    } else {
      setStatus({ tone: 'error', text: BACKUP_ERROR_MESSAGES[result.error] });
    }
  }

  async function handleConfirmRestore() {
    if (!pendingRestore) return;
    setRestoring(true);
    try {
      await restoreBackup(pendingRestore);
      setStatus({ tone: 'success', text: 'Die Sicherung wurde eingespielt.' });
    } catch (cause) {
      console.error(cause);
      setStatus({
        tone: 'error',
        text: 'Die Sicherung konnte nicht eingespielt werden. Die bisherigen Daten sind unverändert.',
      });
    } finally {
      setRestoring(false);
      setPendingRestore(null);
    }
  }

  return (
    <List
      title="Datensicherung"
      footer="Deine Daten liegen nur auf diesem iPhone. Sichere sie regelmäßig, z. B. über „In Dateien sichern“ in iCloud Drive."
    >
      <li className={styles.content}>
        <p className={styles.lastBackup}>
          {lastBackupAt
            ? `Letzte Sicherung: ${formatDate(lastBackupAt)}, ${formatTime(lastBackupAt)} Uhr`
            : 'Noch keine Sicherung erstellt'}
        </p>

        {reminderDue && (
          <Notice tone="warning">
            {lastBackupAt
              ? `Deine letzte Sicherung ist älter als ${APP_CONFIG.backupReminderDays} Tage.`
              : 'Erstelle eine erste Sicherung, damit deine Zeiten nicht verloren gehen.'}
          </Notice>
        )}
        {status && <Notice tone={status.tone}>{status.text}</Notice>}

        <div className={styles.actions}>
          <Button icon="share" variant="primary" onClick={handleCreateBackup} disabled={!data}>
            Sicherung erstellen
          </Button>
          <Button icon="restore" onClick={() => fileInputRef.current?.click()}>
            Sicherung einspielen
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="visually-hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleFileChosen}
        />

        {pendingRestore && (
          <ConfirmDialog
            open
            title="Sicherung einspielen?"
            message={
              <>
                <p>
                  Sicherung vom {formatDate(Date.parse(pendingRestore.exportedAt))} mit{' '}
                  {pendingRestore.projects.length} Projekten und {pendingRestore.entries.length}{' '}
                  Einträgen.
                </p>
                <p>
                  <strong>Alle aktuell gespeicherten Daten auf diesem Gerät werden ersetzt.</strong>
                </p>
              </>
            }
            confirmLabel="Daten ersetzen"
            destructive
            busy={restoring}
            onConfirm={handleConfirmRestore}
            onCancel={() => setPendingRestore(null)}
          />
        )}
      </li>
    </List>
  );
}
