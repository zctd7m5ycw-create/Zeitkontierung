import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './Notice.module.css';

type NoticeTone = 'info' | 'warning' | 'error' | 'success';

const ICONS: Record<NoticeTone, IconName> = {
  info: 'info',
  warning: 'alert',
  error: 'alert',
  success: 'check',
};

interface NoticeProps {
  tone?: NoticeTone;
  children: ReactNode;
}

/** Hinweisbox für Warnungen, Fehler oder Erfolgsmeldungen. */
export function Notice({ tone = 'info', children }: NoticeProps) {
  return (
    <div
      className={`${styles.notice} ${styles[tone]}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon name={ICONS[tone]} size={18} className={styles.icon} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
