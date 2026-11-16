import { formatDecimalHours } from '@/domain/format';
import { Card } from '@/ui/Card';
import styles from './ReportTotalCard.module.css';

interface ReportTotalCardProps {
  totalMinutes: number;
}

/** Gesamtsumme des gewählten Zeitraums. */
export function ReportTotalCard({ totalMinutes }: ReportTotalCardProps) {
  return (
    <Card className={styles.totalCard}>
      <p className={styles.totalLabel}>Gesamt</p>
      <p className={styles.totalValue}>{formatDecimalHours(totalMinutes)} h</p>
    </Card>
  );
}
