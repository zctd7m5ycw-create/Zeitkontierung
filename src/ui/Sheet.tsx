/**
 * Von unten einfahrendes Fenster („Bottom Sheet“) auf Basis des nativen `<dialog>`.
 * Der Browser übernimmt Fokus-Steuerung, Escape-Taste und das Sperren des Hintergrunds.
 */
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconButton } from './Button';
import styles from './Sheet.module.css';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Bereich für Aktionen am unteren Rand, z. B. Speichern-Knopf. */
  footer?: ReactNode;
}

export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.sheet}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape-Taste: Schließen über den Zustand der Eltern-Komponente steuern.
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Tippen auf den abgedunkelten Hintergrund schließt das Fenster.
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {open && (
        <div className={styles.panel}>
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <IconButton icon="close" label="Schließen" onClick={onClose} />
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
