import { describe, expect, it } from 'vitest';
import { makeProject } from '@/test/fixtures';
import { suggestProjectColor } from './projectColors';
import { normalizeProjectName, sortProjectsByName, validateProjectName } from './projects';

describe('Projektnamen', () => {
  const existing = [makeProject({ id: 'a', name: 'Website Relaunch', archived: true })];

  it('normalisiert Leerzeichen', () => {
    expect(normalizeProjectName('  Neubau   Halle 3 ')).toBe('Neubau Halle 3');
  });

  it('lehnt leere, zu lange und doppelte Namen ab', () => {
    expect(validateProjectName('   ', existing)).toBe('name-empty');
    expect(validateProjectName('x'.repeat(61), existing)).toBe('name-too-long');
    expect(validateProjectName('website relaunch', existing)).toBe('name-taken');
  });

  it('erlaubt den eigenen Namen beim Bearbeiten', () => {
    expect(validateProjectName('Website Relaunch', existing, 'a')).toBeNull();
  });

  it('sortiert alphabetisch nach deutschen Regeln', () => {
    const sorted = sortProjectsByName([
      makeProject({ id: '1', name: 'Zander' }),
      makeProject({ id: '2', name: 'Ärger' }),
      makeProject({ id: '3', name: 'bau' }),
    ]);
    expect(sorted.map((project) => project.name)).toEqual(['Ärger', 'bau', 'Zander']);
  });
});

describe('suggestProjectColor', () => {
  it('schlägt die am seltensten genutzte Farbe vor', () => {
    expect(suggestProjectColor([])).toBe('slate');
    expect(suggestProjectColor(['slate', 'blue'])).toBe('teal');
  });
});
