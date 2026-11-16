/**
 * Ansicht „Projekte“: eine Zeile pro Projekt mit Summe und Anteilsbalken.
 */
import { formatDecimalHours, formatMinutes } from '@/domain/format';
import type { ProjectSummary } from '@/domain/report';
import { ColorDot } from '@/ui/ColorDot';
import styles from './ProjectSummaryList.module.css';

interface ProjectSummaryListProps {
  summary: ProjectSummary;
}

export function ProjectSummaryList({ summary }: ProjectSummaryListProps) {
  const maxMinutes = Math.max(...summary.rows.map((row) => row.minutes), 1);

  return (
    <ul className={styles.rows}>
      {summary.rows.map((row) => (
        <li key={row.projectId} className={styles.row}>
          <div className={styles.rowHead}>
            {row.project && <ColorDot color={row.project.color} />}
            <span className={styles.name}>
              {row.project?.name ?? 'Unbekanntes Projekt'}
              {row.project?.archived && <span className={styles.archived}> · archiviert</span>}
            </span>
            <span className={styles.hours}>{formatMinutes(row.minutes)} h</span>
          </div>
          <div className={styles.barTrack} aria-hidden="true">
            <div
              className={styles.bar}
              style={{
                width: `${(row.minutes / maxMinutes) * 100}%`,
                background: row.project ? `var(--project-${row.project.color})` : undefined,
              }}
            />
          </div>
          <p className={styles.decimal}>{formatDecimalHours(row.minutes)} Stunden</p>
        </li>
      ))}
    </ul>
  );
}
