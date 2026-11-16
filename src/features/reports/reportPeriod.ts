/**
 * Auswahl des Auswertungszeitraums: Woche, Monat oder frei wählbar.
 */
import { parseDateInputValue } from '@/domain/dateInput';
import { inclusiveDaysRange, isoWeekNumber } from '@/domain/dateRange';
import { formatMonthYear, formatRange } from '@/domain/format';
import type { TimeRange } from '@/domain/types';

export type PeriodKind = 'week' | 'month' | 'custom';

export const PERIOD_OPTIONS: readonly { value: PeriodKind; label: string }[] = [
  { value: 'week', label: 'Woche' },
  { value: 'month', label: 'Monat' },
  { value: 'custom', label: 'Zeitraum' },
];

export interface PeriodState {
  kind: PeriodKind;
  week: TimeRange;
  month: TimeRange;
  /** Werte der Datumsfelder, z. B. "2026-11-01". */
  customFrom: string;
  customTo: string;
}

/** Der gewählte Zeitraum oder `null`, wenn die freien Datumsfelder ungültig sind. */
export function resolvePeriod(state: PeriodState): TimeRange | null {
  switch (state.kind) {
    case 'week':
      return state.week;
    case 'month':
      return state.month;
    case 'custom': {
      const from = parseDateInputValue(state.customFrom);
      const to = parseDateInputValue(state.customTo);
      return from === null || to === null ? null : inclusiveDaysRange(from, to);
    }
  }
}

/** Überschrift für Woche oder Monat, z. B. "KW 47" oder "November 2026". */
export function periodLabel(kind: 'week' | 'month', range: TimeRange): string {
  return kind === 'week' ? `KW ${isoWeekNumber(range.start)}` : formatMonthYear(range.start);
}

export function periodDetail(range: TimeRange): string {
  return formatRange(range);
}
