/**
 * Zentrale Einstellungen der App. Hier anpassen, nicht im Code verteilt.
 */
import { MS_PER_HOUR } from '@/domain/time';

export const APP_CONFIG = {
  appName: 'Zeitkontierung',

  /** Ab dieser Laufzeit weist die App auf einen vermutlich vergessenen Timer hin. */
  longRunningThresholdMs: 10 * MS_PER_HOUR,

  /** Nach so vielen Tagen ohne Sicherung erscheint eine Erinnerung. */
  backupReminderDays: 14,
} as const;

/** Versionsnummer aus package.json (wird beim Build eingesetzt). */
export const APP_VERSION = __APP_VERSION__;
