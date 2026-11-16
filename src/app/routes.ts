/**
 * Alle Seiten der App mit ihren Adressen und den Einträgen der Tab-Leiste.
 */
import type { IconName } from '@/ui/Icon';

export const ROUTES = {
  timer: '/timer',
  entries: '/eintraege',
  report: '/auswertung',
  settings: '/einstellungen',
} as const;

export interface TabDefinition {
  path: string;
  label: string;
  icon: IconName;
}

export const TABS: readonly TabDefinition[] = [
  { path: ROUTES.timer, label: 'Timer', icon: 'timer' },
  { path: ROUTES.entries, label: 'Einträge', icon: 'list' },
  { path: ROUTES.report, label: 'Auswertung', icon: 'chart' },
  { path: ROUTES.settings, label: 'Einstellungen', icon: 'settings' },
];
