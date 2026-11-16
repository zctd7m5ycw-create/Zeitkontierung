import type { ProjectColor } from '@/domain/projectColors';
import styles from './ColorDot.module.css';

interface ColorDotProps {
  color: ProjectColor;
  size?: 'sm' | 'md';
}

/** Kleiner Farbpunkt zur Kennzeichnung eines Projekts. */
export function ColorDot({ color, size = 'sm' }: ColorDotProps) {
  return (
    <span
      className={`${styles.dot} ${styles[size]}`}
      style={{ background: `var(--project-${color})` }}
      aria-hidden="true"
    />
  );
}
