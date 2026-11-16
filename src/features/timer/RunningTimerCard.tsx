/**
 * Karte oben auf der Timer-Seite: zeigt den laufenden Timer oder „Kein Timer aktiv“.
 */
import { APP_CONFIG } from '@/config/appConfig';
import { formatClock, formatDurationMs, formatTime } from '@/domain/format';
import { entryDurationMs, isLongRunning } from '@/domain/time';
import type { Project, TimeEntry, Timestamp } from '@/domain/types';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { ColorDot } from '@/ui/ColorDot';
import { Notice } from '@/ui/Notice';
import styles from './RunningTimerCard.module.css';

interface RunningTimerCardProps {
  entry: TimeEntry | null;
  project: Project | undefined;
  now: Timestamp;
  todayTotalMs: number;
  onStop: () => void;
  onEdit: () => void;
}

export function RunningTimerCard({
  entry,
  project,
  now,
  todayTotalMs,
  onStop,
  onEdit,
}: RunningTimerCardProps) {
  const todayLine = (
    <p className={styles.today}>
      <span>Heute gesamt</span>
      <span className={styles.todayValue}>{formatDurationMs(todayTotalMs)} h</span>
    </p>
  );

  if (!entry) {
    return (
      <Card className={styles.card}>
        <p className={styles.idleTitle}>Kein Timer aktiv</p>
        <p className={styles.idleText}>Tippe unten auf ein Projekt, um die Zeit zu starten.</p>
        {todayLine}
      </Card>
    );
  }

  const longRunning = isLongRunning(entry, now, APP_CONFIG.longRunningThresholdMs);

  return (
    <Card className={`${styles.card} ${styles.running}`}>
      <div className={styles.projectLine}>
        {project && <ColorDot color={project.color} size="md" />}
        <span className={styles.projectName}>{project?.name ?? 'Unbekanntes Projekt'}</span>
        <span className={styles.liveBadge}>
          <span className={styles.pulse} aria-hidden="true" />
          läuft
        </span>
      </div>

      <p className={styles.clock} aria-label="Laufzeit">
        {formatClock(entryDurationMs(entry, now))}
      </p>
      <p className={styles.since}>seit {formatTime(entry.start)} Uhr</p>
      {entry.note && <p className={styles.note}>{entry.note}</p>}

      {longRunning && (
        <div className={styles.warning}>
          <Notice tone="warning">
            Der Timer läuft schon sehr lange. Falls du das Stoppen vergessen hast, kannst du das
            Ende über „Bearbeiten“ korrigieren.
          </Notice>
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="primary" size="lg" icon="stop" onClick={onStop}>
          Stoppen
        </Button>
        <Button size="lg" icon="note" onClick={onEdit}>
          Bearbeiten
        </Button>
      </div>

      {todayLine}
    </Card>
  );
}
