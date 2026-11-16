/**
 * Bittet den Browser, die Daten dieser App dauerhaft zu speichern.
 *
 * Ohne diese Zusage darf ein Browser gespeicherte Daten bei Speichermangel
 * oder längerer Nichtnutzung löschen. Auf dem iPhone ist eine zum
 * Home-Bildschirm hinzugefügte App davon ohnehin ausgenommen.
 */
export type PersistenceStatus = 'persisted' | 'not-persisted' | 'unsupported';

export async function requestPersistentStorage(): Promise<PersistenceStatus> {
  if (!navigator.storage?.persist) return 'unsupported';
  try {
    if (await navigator.storage.persisted()) return 'persisted';
    return (await navigator.storage.persist()) ? 'persisted' : 'not-persisted';
  } catch {
    return 'unsupported';
  }
}

export async function getPersistenceStatus(): Promise<PersistenceStatus> {
  if (!navigator.storage?.persisted) return 'unsupported';
  try {
    return (await navigator.storage.persisted()) ? 'persisted' : 'not-persisted';
  } catch {
    return 'unsupported';
  }
}
