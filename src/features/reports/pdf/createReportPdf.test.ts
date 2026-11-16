import { describe, expect, it } from 'vitest';
import { monthRange } from '@/domain/dateRange';
import { at, makeProject } from '@/test/fixtures';
import { createReportPdf, reportFileName } from './createReportPdf';

describe('createReportPdf', () => {
  const range = monthRange(at(2026, 11, 5));

  it('erzeugt ein PDF, auch mit vielen Projekten über mehrere Seiten', async () => {
    const rows = Array.from({ length: 60 }, (_, index) => ({
      projectId: `p${index}`,
      project: makeProject({
        id: `p${index}`,
        name: `Projekt Nr. ${index} mit Überlänge`.repeat(3),
      }),
      minutes: 60 + index,
    }));
    const blob = createReportPdf({
      owner: 'Gundermann',
      appName: 'Zeitkontierung',
      range,
      summary: { rows, totalMinutes: rows.reduce((sum, row) => sum + row.minutes, 0) },
      createdAt: at(2026, 11, 30),
    });

    expect(blob.type).toBe('application/pdf');
    const text = await blob.text();
    expect(text.startsWith('%PDF')).toBe(true);
    const pageCount = Number(/\/Count (\d+)/.exec(text)?.[1]);
    expect(pageCount).toBeGreaterThan(1); // Tabelle wird auf Folgeseiten fortgesetzt
  });

  it('benennt die Datei nach dem Zeitraum', () => {
    expect(reportFileName(range)).toBe('Projektzeiten_2026-11-01_bis_2026-11-30.pdf');
  });
});
