import type { BackupParseError } from '@/data/backupFormat';

export const BACKUP_ERROR_MESSAGES: Record<BackupParseError, string> = {
  'invalid-json': 'Die Datei ist keine gültige Sicherungsdatei.',
  'wrong-format': 'Die Datei ist keine Sicherung dieser App.',
  'unsupported-version':
    'Die Sicherung stammt aus einer neueren App-Version. Bitte die App aktualisieren.',
  'invalid-data': 'Die Sicherung ist unvollständig oder beschädigt und wurde nicht eingespielt.',
};
