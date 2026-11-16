import { MAX_PROJECT_NAME_LENGTH, type ProjectValidationError } from '@/domain/projects';

export const PROJECT_ERROR_MESSAGES: Record<ProjectValidationError, string> = {
  'name-empty': 'Bitte einen Projektnamen eingeben.',
  'name-too-long': `Der Name darf höchstens ${MAX_PROJECT_NAME_LENGTH} Zeichen lang sein.`,
  'name-taken': 'Ein Projekt mit diesem Namen gibt es bereits (eventuell im Archiv).',
};
