/**
 * Name im Kopf des PDF-Berichts. Jede Person trägt ihren eigenen Namen in den
 * Einstellungen ein; er wird nur auf dem jeweiligen Gerät gespeichert.
 */
export const MAX_REPORT_OWNER_LENGTH = 60;

/** Entfernt Leerzeichen am Rand und fasst mehrfache Leerzeichen zusammen. */
export function normalizeReportOwner(name: string): string {
  return name.trim().replace(/\s+/g, ' ').slice(0, MAX_REPORT_OWNER_LENGTH);
}
