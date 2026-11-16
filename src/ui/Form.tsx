/**
 * Formular-Bausteine: Beschriftetes Feld, Eingabe, Textbereich, Auswahl.
 * Alle Eingaben haben mindestens 16px Schrift, damit iOS beim Antippen nicht zoomt.
 */
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import styles from './Form.module.css';

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
      </label>
      {children}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${styles.control} ${className ?? ''}`} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={`${styles.control} ${styles.textarea} ${className ?? ''}`} {...rest} />
  );
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${styles.control} ${styles.select} ${className ?? ''}`} {...rest}>
      {children}
    </select>
  );
}

/** Abstand zwischen mehreren Feldern eines Formulars. */
export function FormStack({ children }: { children: ReactNode }) {
  return <div className={styles.stack}>{children}</div>;
}
