import type { EntryValidationError } from '@/domain/entries';

export const ENTRY_ERROR_MESSAGES: Record<EntryValidationError, string> = {
  'missing-project': 'Bitte ein Projekt auswählen.',
  'start-in-future': 'Der Beginn liegt in der Zukunft.',
  'end-in-future': 'Das Ende liegt in der Zukunft.',
  'end-not-after-start': 'Das Ende muss nach dem Beginn liegen.',
  overlap: 'Der Zeitraum überschneidet sich mit einem anderen Eintrag dieses Projekts.',
};
