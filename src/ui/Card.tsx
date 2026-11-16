import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

/** Neutrale, abgerundete Fläche für zusammengehörige Inhalte. */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${styles.card} ${className ?? ''}`} {...rest} />;
}
