/**
 * Ansicht „Tage“: ein Block pro Kalendertag mit Tagessumme und den Projekten dieses Tages.
 * Neuester Tag oben, Tage ohne Zeiten werden nicht angezeigt.
 */
import { formatDecimalHours, formatShortWeekdayDate } from '@/domain/format';
import type { DaySummary } from '@/domain/report';
import { ColorDot } from '@/ui/ColorDot';
import styles from './DaySummaryList.module.css';

interface DaySummaryListProps {
  days: readonly DaySummary[];
}

export function DaySummaryList({ days }: DaySummaryListProps) {
  return (
    <div className={styles.days}>
      {days.map((day) => (
        <section key={day.day} className={styles.day} aria-label={formatShortWeekdayDate(day.day)}>
          <header className={styles.header}>
            <h3 className={styles.date}>{formatShortWeekdayDate(day.day)}</h3>
            <span className={styles.total}>{formatDecimalHours(day.totalMinutes)} h</span>
          </header>
          <ul className={styles.rows}>
            {day.rows.map((row) => (
              <li key={row.projectId} className={styles.row}>
                {row.project && <ColorDot color={row.project.color} />}
                <span className={styles.name}>{row.project?.name ?? 'Unbekanntes Projekt'}</span>
                <span className={styles.hours}>{formatDecimalHours(row.minutes)} h</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
