import { describe, expect, it } from 'vitest';
import { at } from '@/test/fixtures';
import {
  addDays,
  dayKey,
  dayRange,
  inclusiveDaysRange,
  isoWeekNumber,
  lastDayOf,
  monthRange,
  shiftMonth,
  shiftWeek,
  weekRange,
} from './dateRange';

describe('dateRange', () => {
  it('Woche beginnt am Montag', () => {
    // Sonntag, 22.11.2026 gehört zur Woche ab Montag, 16.11.
    expect(weekRange(at(2026, 11, 22, 15))).toEqual({
      start: at(2026, 11, 16),
      end: at(2026, 11, 23),
    });
    expect(weekRange(at(2026, 11, 16, 0))).toEqual({
      start: at(2026, 11, 16),
      end: at(2026, 11, 23),
    });
  });

  it('Monat umfasst den ganzen Kalendermonat', () => {
    expect(monthRange(at(2026, 2, 15))).toEqual({ start: at(2026, 2, 1), end: at(2026, 3, 1) });
    expect(monthRange(at(2026, 12, 31, 23, 59))).toEqual({
      start: at(2026, 12, 1),
      end: at(2027, 1, 1),
    });
  });

  it('Tag mit Zeitumstellung hat 23 bzw. 25 Stunden', () => {
    const springDay = dayRange(at(2026, 3, 29, 12));
    expect(springDay.end - springDay.start).toBe(23 * 3_600_000);
    const autumnDay = dayRange(at(2026, 10, 25, 12));
    expect(autumnDay.end - autumnDay.start).toBe(25 * 3_600_000);
  });

  it('addDays behält die Uhrzeit über die Zeitumstellung hinweg', () => {
    expect(addDays(at(2026, 3, 28, 9), 1)).toBe(at(2026, 3, 29, 9));
  });

  it('verschiebt Wochen und Monate', () => {
    const week = weekRange(at(2026, 11, 18));
    expect(shiftWeek(week, -1).start).toBe(at(2026, 11, 9));
    const month = monthRange(at(2026, 1, 31));
    expect(shiftMonth(month, 1)).toEqual({ start: at(2026, 2, 1), end: at(2026, 3, 1) });
    expect(shiftMonth(month, -1).start).toBe(at(2025, 12, 1));
  });

  it('freier Zeitraum schließt beide Tage ein, auch in umgekehrter Reihenfolge', () => {
    const range = inclusiveDaysRange(at(2026, 11, 20, 14), at(2026, 11, 1, 9));
    expect(range).toEqual({ start: at(2026, 11, 1), end: at(2026, 11, 21) });
    expect(lastDayOf(range)).toBe(at(2026, 11, 20));
  });

  it('berechnet die ISO-Kalenderwoche', () => {
    expect(isoWeekNumber(at(2026, 11, 16))).toBe(47);
    expect(isoWeekNumber(at(2026, 1, 1))).toBe(1); // Donnerstag
    expect(isoWeekNumber(at(2027, 1, 1))).toBe(53); // Freitag → letzte Woche 2026
    expect(isoWeekNumber(at(2026, 12, 28))).toBe(53);
  });

  it('erzeugt Tagesschlüssel', () => {
    expect(dayKey(at(2026, 1, 5, 23, 59))).toBe('2026-01-05');
  });
});
