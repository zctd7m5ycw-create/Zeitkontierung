import { describe, expect, it } from 'vitest';
import { at } from '@/test/fixtures';
import { monthRange } from './dateRange';
import {
  formatClock,
  formatDecimalHours,
  formatDurationMs,
  formatMinutes,
  formatRange,
  formatTime,
  formatWeekdayDate,
} from './format';

describe('format', () => {
  it('formatiert eine laufende Uhr', () => {
    expect(formatClock(0)).toBe('0:00:00');
    expect(formatClock((3_600 + 2 * 60 + 3) * 1_000 + 999)).toBe('1:02:03');
  });

  it('formatiert Minuten als Stunden:Minuten', () => {
    expect(formatMinutes(125)).toBe('2:05');
    expect(formatMinutes(0)).toBe('0:00');
    expect(formatMinutes(60 * 100)).toBe('100:00');
  });

  it('rundet Millisekunden für die Anzeige auf volle Minuten ab', () => {
    expect(formatDurationMs(59_999)).toBe('0:00');
    expect(formatDurationMs(60_000)).toBe('0:01');
  });

  it('formatiert Dezimalstunden mit Komma', () => {
    expect(formatDecimalHours(125)).toBe('2,08');
    expect(formatDecimalHours(90)).toBe('1,50');
  });

  it('formatiert Datum und Uhrzeit deutsch', () => {
    expect(formatTime(at(2026, 11, 16, 8, 5))).toBe('08:05');
    expect(formatWeekdayDate(at(2026, 11, 16))).toBe('Montag, 16. November');
    expect(formatRange(monthRange(at(2026, 11, 5)))).toBe('01.11.2026 – 30.11.2026');
  });
});
