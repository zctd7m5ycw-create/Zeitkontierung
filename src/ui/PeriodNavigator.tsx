import { IconButton } from './Button';
import styles from './PeriodNavigator.module.css';

interface PeriodNavigatorProps {
  label: string;
  /** Zusatzzeile unter der Beschriftung, z. B. der genaue Datumsbereich. */
  detail?: string;
  onPrevious: () => void;
  onNext: () => void;
  /** Verhindert das Blättern in die Zukunft. */
  nextDisabled?: boolean;
}

/** Blättern zwischen Wochen oder Monaten. */
export function PeriodNavigator({
  label,
  detail,
  onPrevious,
  onNext,
  nextDisabled = false,
}: PeriodNavigatorProps) {
  return (
    <div className={styles.navigator}>
      <IconButton icon="chevronLeft" label="Zurück" onClick={onPrevious} />
      <div className={styles.label} aria-live="polite">
        <span className={styles.main}>{label}</span>
        {detail && <span className={styles.detail}>{detail}</span>}
      </div>
      <IconButton icon="chevronRight" label="Weiter" onClick={onNext} disabled={nextDisabled} />
    </div>
  );
}
