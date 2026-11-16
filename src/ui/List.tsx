/**
 * Gruppierte Liste im iOS-Stil: abgerundeter Block mit feinen Trennlinien.
 */
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './List.module.css';

interface ListProps {
  /** Überschrift über dem Block (klein, grau). */
  title?: ReactNode;
  /** Rechts neben der Überschrift, z. B. eine Tagessumme. */
  titleAside?: ReactNode;
  /** Erklärender Text unter dem Block. */
  footer?: ReactNode;
  children: ReactNode;
}

export function List({ title, titleAside, footer, children }: ListProps) {
  return (
    <section className={styles.section}>
      {(title || titleAside) && (
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          {titleAside && <span className={styles.sectionAside}>{titleAside}</span>}
        </div>
      )}
      <ul className={styles.list}>{children}</ul>
      {footer && <p className={styles.sectionFooter}>{footer}</p>}
    </section>
  );
}

interface ListRowProps {
  /** Links vor dem Titel, z. B. ein Farbpunkt. */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Rechts, z. B. eine Dauer oder ein Knopf. */
  trailing?: ReactNode;
  /** Macht die ganze Zeile antippbar. */
  onClick?: () => void;
  /** Zeigt einen Pfeil nach rechts (Zeile öffnet eine Detailansicht). */
  chevron?: boolean;
  highlighted?: boolean;
  /** Zugänglicher Name, falls der sichtbare Inhalt nicht reicht. */
  ariaLabel?: string;
  ariaPressed?: boolean;
}

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  chevron = false,
  highlighted = false,
  ariaLabel,
  ariaPressed,
}: ListRowProps) {
  const content = (
    <>
      {leading && <span className={styles.leading}>{leading}</span>}
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
      {chevron && <Icon name="chevronRight" size={18} className={styles.chevron} />}
    </>
  );

  const className = [styles.row, highlighted ? styles.highlighted : ''].join(' ');

  return (
    <li className={styles.item}>
      {onClick ? (
        <button
          type="button"
          className={`${className} ${styles.interactive}`}
          onClick={onClick}
          aria-label={ariaLabel}
          aria-pressed={ariaPressed}
        >
          {content}
        </button>
      ) : (
        <div className={className}>{content}</div>
      )}
    </li>
  );
}
