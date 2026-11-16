/**
 * Erzeugt den PDF-Bericht: Summen pro Projekt für einen Zeitraum.
 *
 * Aufbau (A4 hoch, schwarz-weiß, gut druckbar):
 *   Name (falls in den Einstellungen hinterlegt), Titel, Zeitraum und Erstellungsdatum,
 *   Tabelle „Projekt | Stunden | Dezimal“, Gesamtsumme, Seitenzahlen.
 *
 * Läuft vollständig auf dem Gerät, ohne Server. Verwendet die Standardschrift
 * Helvetica; sie enthält alle deutschen Umlaute, aber z. B. keine Emojis.
 */
import { jsPDF } from 'jspdf';
import { dayKey, lastDayOf } from '@/domain/dateRange';
import { formatDate, formatDecimalHours, formatMinutes, formatRange } from '@/domain/format';
import type { ProjectSummary } from '@/domain/report';
import type { TimeRange, Timestamp } from '@/domain/types';

export interface ReportPdfInput {
  /** Name im Kopf; leer = nur der Titel „Projektzeiten“. */
  owner: string;
  appName: string;
  range: TimeRange;
  summary: ProjectSummary;
  createdAt: Timestamp;
}

// Maße in Millimetern
const PAGE = { width: 210, height: 297, marginX: 20, marginTop: 24, marginBottom: 22 };
const COLUMNS = {
  name: PAGE.marginX,
  nameWidth: 112,
  hours: 158, // rechtsbündig
  decimal: PAGE.width - PAGE.marginX, // rechtsbündig
};
const ROW_HEIGHT = 9;

// Graustufen (RGB)
const TEXT: [number, number, number] = [24, 24, 27];
const MUTED: [number, number, number] = [113, 113, 122];
const RULE: [number, number, number] = [212, 212, 216];

export function createReportPdf(input: ReportPdfInput): Blob {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const owner = input.owner.trim();
  doc.setProperties({
    title: `Projektzeiten ${formatRange(input.range)}`,
    creator: input.appName,
    ...(owner ? { author: owner } : {}),
  });

  let y = drawHeader(doc, owner, input);
  y = drawTableHeader(doc, y);

  for (const row of input.summary.rows) {
    if (y + ROW_HEIGHT > PAGE.height - PAGE.marginBottom - ROW_HEIGHT) {
      doc.addPage();
      y = drawTableHeader(doc, PAGE.marginTop);
    }
    drawRow(doc, y, row.project?.name ?? 'Unbekanntes Projekt', row.minutes);
    y += ROW_HEIGHT;
  }

  drawTotal(doc, y, input.summary.totalMinutes);
  drawFooters(doc, input.appName);

  return doc.output('blob');
}

/** Dateiname, z. B. "Projektzeiten_2026-11-01_bis_2026-11-30.pdf". */
export function reportFileName(range: TimeRange): string {
  return `Projektzeiten_${dayKey(range.start)}_bis_${dayKey(lastDayOf(range))}.pdf`;
}

function drawHeader(doc: jsPDF, owner: string, input: ReportPdfInput): number {
  let y = PAGE.marginTop + 4;

  // Mit Name: Name groß, darunter „Projektzeiten“. Ohne Name: nur „Projektzeiten“ groß.
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...TEXT);
  doc.text(owner || 'Projektzeiten', PAGE.marginX, y);

  if (owner) {
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...MUTED);
    doc.text('Projektzeiten', PAGE.marginX, y);
  }

  doc.setFont('helvetica', 'normal');

  y += 12;
  doc.setFontSize(10);
  const labelWidth = 26;
  for (const [label, value] of [
    ['Zeitraum', formatRange(input.range)],
    ['Erstellt am', formatDate(input.createdAt)],
  ] as const) {
    doc.setTextColor(...MUTED);
    doc.text(label, PAGE.marginX, y);
    doc.setTextColor(...TEXT);
    doc.text(value, PAGE.marginX + labelWidth, y);
    y += 6;
  }

  return y + 8;
}

function drawTableHeader(doc: jsPDF, y: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Projekt', COLUMNS.name, y);
  doc.text('Stunden', COLUMNS.hours, y, { align: 'right' });
  doc.text('Dezimal', COLUMNS.decimal, y, { align: 'right' });

  doc.setDrawColor(...TEXT);
  doc.setLineWidth(0.3);
  doc.line(PAGE.marginX, y + 3, PAGE.width - PAGE.marginX, y + 3);
  return y + 3 + ROW_HEIGHT - 2;
}

function drawRow(doc: jsPDF, y: number, name: string, minutes: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(...TEXT);
  doc.text(fitText(doc, name, COLUMNS.nameWidth), COLUMNS.name, y);
  doc.text(formatMinutes(minutes), COLUMNS.hours, y, { align: 'right' });
  doc.text(formatDecimalHours(minutes), COLUMNS.decimal, y, { align: 'right' });

  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.2);
  doc.line(PAGE.marginX, y + 3.5, PAGE.width - PAGE.marginX, y + 3.5);
}

function drawTotal(doc: jsPDF, y: number, totalMinutes: number) {
  const totalY = y + 2;
  doc.setDrawColor(...TEXT);
  doc.setLineWidth(0.4);
  doc.line(PAGE.marginX, totalY - 5.5, PAGE.width - PAGE.marginX, totalY - 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...TEXT);
  doc.text('Gesamt', COLUMNS.name, totalY);
  doc.text(formatMinutes(totalMinutes), COLUMNS.hours, totalY, { align: 'right' });
  doc.text(formatDecimalHours(totalMinutes), COLUMNS.decimal, totalY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(
    'Stunden im Format Std:Min, minutengenau. Dezimal = Stunden als Dezimalzahl.',
    PAGE.marginX,
    totalY + 10,
  );
}

function drawFooters(doc: jsPDF, appName: string) {
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const y = PAGE.height - 12;
    doc.text(appName, PAGE.marginX, y);
    doc.text(`Seite ${page} von ${pageCount}`, PAGE.width - PAGE.marginX, y, { align: 'right' });
  }
}

/** Kürzt zu lange Projektnamen mit „…“, damit sie in eine Zeile passen. */
function fitText(doc: jsPDF, text: string, maxWidth: number): string {
  if (doc.getTextWidth(text) <= maxWidth) return text;
  let shortened = text;
  while (shortened.length > 1 && doc.getTextWidth(`${shortened}…`) > maxWidth) {
    shortened = shortened.slice(0, -1);
  }
  return `${shortened.trimEnd()}…`;
}
