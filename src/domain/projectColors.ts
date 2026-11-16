/**
 * Verfügbare Projektfarben.
 *
 * Hier stehen nur die Namen. Die eigentlichen Farbwerte (hell und dunkel)
 * sind in `src/styles/tokens.css` als `--project-<name>` definiert.
 * Neue Farbe hinzufügen: Namen hier ergänzen und in tokens.css einen Farbwert anlegen.
 */
export const PROJECT_COLORS = [
  'slate',
  'blue',
  'teal',
  'green',
  'amber',
  'orange',
  'rose',
  'violet',
] as const;

export type ProjectColor = (typeof PROJECT_COLORS)[number];

export const PROJECT_COLOR_LABELS: Record<ProjectColor, string> = {
  slate: 'Grau',
  blue: 'Blau',
  teal: 'Petrol',
  green: 'Grün',
  amber: 'Gelb',
  orange: 'Orange',
  rose: 'Rosé',
  violet: 'Violett',
};

export function isProjectColor(value: unknown): value is ProjectColor {
  return typeof value === 'string' && (PROJECT_COLORS as readonly string[]).includes(value);
}

/** Schlägt für ein neues Projekt die bisher am seltensten verwendete Farbe vor. */
export function suggestProjectColor(usedColors: readonly ProjectColor[]): ProjectColor {
  const usage = new Map<ProjectColor, number>(PROJECT_COLORS.map((color) => [color, 0]));
  for (const color of usedColors) {
    usage.set(color, (usage.get(color) ?? 0) + 1);
  }
  let best: ProjectColor = PROJECT_COLORS[0];
  for (const color of PROJECT_COLORS) {
    if ((usage.get(color) ?? 0) < (usage.get(best) ?? 0)) {
      best = color;
    }
  }
  return best;
}
