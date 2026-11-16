import { describe, expect, it } from 'vitest';
import { at, makeEntry, makeProject } from '@/test/fixtures';
import { dayRange, monthRange } from './dateRange';
import { overlapMs, summarizeByProject, totalMsInRange } from './report';

const projectA = makeProject({ id: 'a', name: 'Alpha' });
const projectB = makeProject({ id: 'b', name: 'Beta' });

describe('overlapMs', () => {
  it('teilt Einträge über Mitternacht auf beide Tage auf', () => {
    const entry = makeEntry({ start: at(2026, 11, 16, 22), end: at(2026, 11, 17, 2) });
    expect(overlapMs(entry, dayRange(at(2026, 11, 16)), 0)).toBe(2 * 3_600_000);
    expect(overlapMs(entry, dayRange(at(2026, 11, 17)), 0)).toBe(2 * 3_600_000);
  });

  it('zählt einen laufenden Timer bis jetzt', () => {
    const entry = makeEntry({ start: at(2026, 11, 16, 8), end: null });
    const now = at(2026, 11, 16, 9, 30);
    expect(overlapMs(entry, dayRange(now), now)).toBe(90 * 60_000);
  });

  it('ist 0 für Einträge außerhalb des Zeitraums', () => {
    const entry = makeEntry({ start: at(2026, 10, 31, 8), end: at(2026, 10, 31, 9) });
    expect(overlapMs(entry, monthRange(at(2026, 11, 1)), 0)).toBe(0);
  });
});

describe('summarizeByProject', () => {
  const range = monthRange(at(2026, 11, 1));
  const now = at(2026, 11, 30);

  it('summiert pro Projekt und sortiert nach Dauer', () => {
    const entries = [
      makeEntry({ projectId: 'a', start: at(2026, 11, 2, 8), end: at(2026, 11, 2, 9) }),
      makeEntry({ projectId: 'b', start: at(2026, 11, 2, 9), end: at(2026, 11, 2, 12) }),
      makeEntry({ projectId: 'a', start: at(2026, 11, 3, 8), end: at(2026, 11, 3, 8, 30) }),
    ];
    const summary = summarizeByProject(entries, [projectA, projectB], range, now);
    expect(summary.rows.map((row) => [row.project?.name, row.minutes])).toEqual([
      ['Beta', 180],
      ['Alpha', 90],
    ]);
    expect(summary.totalMinutes).toBe(270);
  });

  it('Gesamtsumme passt immer zu den gerundeten Zeilen', () => {
    // Je 1 Min. 40 Sek. → einzeln auf 2 Min. gerundet, Summe 4 Min.
    const entries = [
      makeEntry({ projectId: 'a', start: at(2026, 11, 2, 8), end: at(2026, 11, 2, 8, 1, 40) }),
      makeEntry({ projectId: 'b', start: at(2026, 11, 2, 9), end: at(2026, 11, 2, 9, 1, 40) }),
    ];
    const summary = summarizeByProject(entries, [projectA, projectB], range, now);
    expect(summary.rows.map((row) => row.minutes)).toEqual([2, 2]);
    expect(summary.totalMinutes).toBe(4);
  });

  it('lässt Projekte ohne Zeit im Zeitraum weg', () => {
    const entries = [
      makeEntry({ projectId: 'a', start: at(2026, 12, 2, 8), end: at(2026, 12, 2, 9) }),
    ];
    expect(summarizeByProject(entries, [projectA], range, now)).toEqual({
      rows: [],
      totalMinutes: 0,
    });
  });
});

describe('totalMsInRange', () => {
  it('filtert optional nach Projekt', () => {
    const entries = [
      makeEntry({ projectId: 'a', start: at(2026, 11, 16, 8), end: at(2026, 11, 16, 9) }),
      makeEntry({ projectId: 'b', start: at(2026, 11, 16, 9), end: at(2026, 11, 16, 11) }),
    ];
    const day = dayRange(at(2026, 11, 16));
    expect(totalMsInRange(entries, day, 0)).toBe(3 * 3_600_000);
    expect(totalMsInRange(entries, day, 0, 'b')).toBe(2 * 3_600_000);
  });
});
