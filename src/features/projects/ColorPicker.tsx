import { PROJECT_COLOR_LABELS, PROJECT_COLORS, type ProjectColor } from '@/domain/projectColors';
import { Icon } from '@/ui/Icon';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  value: ProjectColor;
  onChange: (color: ProjectColor) => void;
  labelledBy: string;
}

/** Auswahl einer Projektfarbe als Reihe runder Farbfelder. */
export function ColorPicker({ value, onChange, labelledBy }: ColorPickerProps) {
  return (
    <div className={styles.picker} role="radiogroup" aria-labelledby={labelledBy}>
      {PROJECT_COLORS.map((color) => {
        const selected = color === value;
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={PROJECT_COLOR_LABELS[color]}
            className={`${styles.swatch} ${selected ? styles.selected : ''}`}
            style={{ background: `var(--project-${color})` }}
            onClick={() => onChange(color)}
          >
            {selected && <Icon name="check" size={18} />}
          </button>
        );
      })}
    </div>
  );
}
