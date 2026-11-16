import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  /** Aktion rechts oben, z. B. ein Plus-Knopf. */
  action?: ReactNode;
}

/** Große Seitenüberschrift wie in iOS-Apps. */
export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {action && <div className={styles.action}>{action}</div>}
    </header>
  );
}
