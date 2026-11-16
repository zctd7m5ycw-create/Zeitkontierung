/**
 * Ergebnis der Auswertung: Gesamtsumme und eine Zeile pro Projekt mit Anteilsbalken.
 */
import { formatDecimalHours, formatMinutes } from '@/domain/format';
import type { ProjectSummary } from '@/domain/report';
import { Card } from '@/ui/Card';
import { ColorDot } from '@/ui/ColorDot';
import styles from './ReportSummary.module.css';

interface ReportSummaryProps {
  summary: ProjectSummary;
}

export function ReportSummary({ summary }: ReportSummaryProps) {
  const maxMinutes = Math.max(...summary.rows.map((row) => row.minutes), 1);

  return (
    <>
      <Card className={styles.totalCard}>
        <p className={styles.totalLabel}>Gesamt</p>
        <p className={styles.totalValue}>{formatMinutes(summary.totalMinutes)} h</p>
        <p className={styles.totalDecimal}>{formatDecimalHours(summary.totalMinutes)} Stunden</p>
      </Card>

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
    </>
  );
}
