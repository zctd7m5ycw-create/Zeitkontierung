import { describe, expect, it } from 'vitest';
import { at, makeEntry } from '@/test/fixtures';
import { groupByStartDay, validateEntry, type EntryDraft } from './entries';

const now = at(2026, 11, 16, 18);

function draft(overrides: Partial<EntryDraft> = {}): EntryDraft {
  return {
    projectId: 'p1',
    start: at(2026, 11, 16, 10),
    end: at(2026, 11, 16, 11),
    note: '',
    ...overrides,
  };
}

describe('validateEntry', () => {
  it('akzeptiert einen gültigen Eintrag', () => {
    expect(validateEntry(draft(), [], now)).toBeNull();
  });

  it('verlangt ein Projekt', () => {
    expect(validateEntry(draft({ projectId: '' }), [], now)).toBe('missing-project');
  });

  it('lehnt Ende vor oder gleich Start ab', () => {
    expect(validateEntry(draft({ end: at(2026, 11, 16, 10) }), [], now)).toBe(
      'end-not-after-start',
    );
    expect(validateEntry(draft({ end: at(2026, 11, 16, 9) }), [], now)).toBe('end-not-after-start');
  });

  it('lehnt Zeiten in der Zukunft ab', () => {
    expect(validateEntry(draft({ end: at(2026, 11, 16, 19) }), [], now)).toBe('end-in-future');
    expect(validateEntry(draft({ start: at(2026, 11, 17, 8), end: null }), [], now)).toBe(
      'start-in-future',
    );
  });

  it('erkennt Überschneidungen im selben Projekt', () => {
    const existing = [
      makeEntry({ id: 'x', start: at(2026, 11, 16, 10, 30), end: at(2026, 11, 16, 12) }),
    ];
    expect(validateEntry(draft(), existing, now)).toBe('overlap');
  });

  it('erlaubt direkt aneinander anschließende Einträge', () => {
    const existing = [
      makeEntry({ id: 'x', start: at(2026, 11, 16, 11), end: at(2026, 11, 16, 12) }),
    ];
    expect(validateEntry(draft(), existing, now)).toBeNull();
  });

  it('ignoriert andere Projekte und den bearbeiteten Eintrag selbst', () => {
    const other = makeEntry({ id: 'x', projectId: 'p2', start: at(2026, 11, 16, 10) });
    const self = makeEntry({ id: 'self', start: at(2026, 11, 16, 10) });
    expect(validateEntry(draft(), [other, self], now, 'self')).toBeNull();
  });

  it('prüft gegen einen laufenden Timer bis jetzt', () => {
    const running = makeEntry({ id: 'r', start: at(2026, 11, 16, 17), end: null });
    expect(
      validateEntry(
        draft({ start: at(2026, 11, 16, 17, 30), end: at(2026, 11, 16, 17, 45) }),
        [running],
        now,
      ),
    ).toBe('overlap');
  });
});

describe('groupByStartDay', () => {
  it('gruppiert nach Starttag, neueste zuerst', () => {
    const early = makeEntry({ start: at(2026, 11, 15, 8) });
    const late = makeEntry({ start: at(2026, 11, 16, 14) });
    const morning = makeEntry({ start: at(2026, 11, 16, 8) });
    const groups = groupByStartDay([early, morning, late]);
    expect(groups.map((group) => group.day)).toEqual([at(2026, 11, 16), at(2026, 11, 15)]);
    expect(groups[0]?.entries).toEqual([late, morning]);
  });
});
