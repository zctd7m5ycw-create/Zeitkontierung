import { formatDurationMs } from '@/domain/format';
import { entryDurationMs } from '@/domain/time';
import type { Project, TimeEntry, Timestamp } from '@/domain/types';
import { ColorDot } from '@/ui/ColorDot';
import { ListRow } from '@/ui/List';
import { formatEntrySpan } from './entryLabels';
import styles from './EntryRow.module.css';

interface EntryRowProps {
  entry: TimeEntry;
  project: Project | undefined;
  now: Timestamp;
  onSelect: () => void;
}

/** Ein Zeiteintrag in der Liste: Projekt, Uhrzeiten, Notiz und Dauer. */
export function EntryRow({ entry, project, now, onSelect }: EntryRowProps) {
  const running = entry.end === null;
  const span = formatEntrySpan(entry);
  const subtitle = entry.note ? `${span} · ${entry.note}` : span;

  return (
    <ListRow
      leading={project ? <ColorDot color={project.color} /> : undefined}
      title={project?.name ?? 'Unbekanntes Projekt'}
      subtitle={subtitle}
      trailing={
        <>
          {running && <span className={styles.runningBadge}>läuft</span>}
          <span className={styles.duration}>{formatDurationMs(entryDurationMs(entry, now))}</span>
        </>
      }
      highlighted={running}
      onClick={onSelect}
    />
  );
}
