/**
 * Sicherheitsabfrage vor folgenreichen Aktionen (Löschen, Wiederherstellen …).
 * Ersetzt `window.confirm`, das in installierten Web-Apps unschön aussieht.
 */
import type { ReactNode } from 'react';
import { Button } from './Button';
import { Sheet } from './Sheet';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Sheet
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            size="lg"
            fullWidth
            disabled={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="ghost" fullWidth onClick={onCancel}>
            Abbrechen
          </Button>
        </>
      }
    >
      <div className={styles.message}>{message}</div>
    </Sheet>
  );
}
