import { describe, expect, it } from 'vitest';
import { at } from '@/test/fixtures';
import {
  parseDateInputValue,
  parseDateTimeInputValue,
  toDateInputValue,
  toDateTimeInputValue,
} from './dateInput';

describe('dateInput', () => {
  it('wandelt in beide Richtungen um', () => {
    const ts = at(2026, 3, 7, 8, 5);
    expect(toDateTimeInputValue(ts)).toBe('2026-03-07T08:05');
    expect(parseDateTimeInputValue('2026-03-07T08:05')).toBe(ts);
    expect(toDateInputValue(ts)).toBe('2026-03-07');
    expect(parseDateInputValue('2026-03-07')).toBe(at(2026, 3, 7));
  });

  it('akzeptiert Sekunden im Wert', () => {
    expect(parseDateTimeInputValue('2026-03-07T08:05:30')).toBe(at(2026, 3, 7, 8, 5));
  });

  it('lehnt ungültige Werte ab', () => {
    expect(parseDateTimeInputValue('')).toBeNull();
    expect(parseDateInputValue('2026-02-31')).toBeNull();
    expect(parseDateTimeInputValue('16.11.2026 08:00')).toBeNull();
  });
});
