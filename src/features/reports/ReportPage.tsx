/**
 * Seite „Auswertung“: Summen für Woche, Monat oder freien Zeitraum – wahlweise
 * pro Projekt oder pro Tag, in Dezimalstunden – plus Export der Projektsummen als PDF.
 *
 * Wird per `React.lazy` geladen (siehe App.tsx), damit die PDF-Bibliothek
 * erst beim Öffnen dieser Seite geladen wird.
 */
import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/app/routes';
import { APP_CONFIG } from '@/config/appConfig';
import { useEntriesInRange, useProjects, useSetting } from '@/data/hooks';
import { toDateInputValue } from '@/domain/dateInput';
import { monthRange, shiftMonth, shiftWeek, weekRange } from '@/domain/dateRange';
import { overlapsRange, summarizeByDay, summarizeByProject } from '@/domain/report';
import type { TimeRange } from '@/domain/types';
import { useNow } from '@/hooks/useNow';
import { shareOrDownload } from '@/lib/shareFile';
import { Button } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { Field, Input } from '@/ui/Form';
import { Notice } from '@/ui/Notice';
import { PageHeader } from '@/ui/PageHeader';
import { PeriodNavigator } from '@/ui/PeriodNavigator';
import { SegmentedControl } from '@/ui/SegmentedControl';
import { createReportPdf, reportFileName } from './pdf/createReportPdf';
import {
  PERIOD_OPTIONS,
  periodDetail,
  periodLabel,
  resolvePeriod,
  type PeriodState,
} from './reportPeriod';
import { DaySummaryList } from './DaySummaryList';
import { ProjectSummaryList } from './ProjectSummaryList';
import { ReportTotalCard } from './ReportTotalCard';
import styles from './ReportPage.module.css';

/** Platzhalter, solange kein gültiger Zeitraum gewählt ist (liefert keine Einträge). */
const EMPTY_RANGE: TimeRange = { start: 0, end: 0 };

type ResultView = 'projects' | 'days';

const VIEW_OPTIONS: readonly { value: ResultView; label: string }[] = [
  { value: 'projects', label: 'Projekte' },
  { value: 'days', label: 'Tage' },
];

export default function ReportPage() {
  const now = useNow(30_000);
  const fromId = useId();
  const toId = useId();

  const [period, setPeriod] = useState<PeriodState>(() => {
    const today = Date.now();
    return {
      kind: 'month',
      week: weekRange(today),
      month: monthRange(today),
      customFrom: toDateInputValue(monthRange(today).start),
      customTo: toDateInputValue(today),
    };
  });
  const [view, setView] = useState<ResultView>('projects');
  const [pdfError, setPdfError] = useState<string | null>(null);

  const range = useMemo(() => resolvePeriod(period), [period]);
  const projects = useProjects();
  const entries = useEntriesInRange(range ?? EMPTY_RANGE);
  const owner = useSetting('reportOwnerName') ?? '';

  const summary = useMemo(
    () => summarizeByProject(entries ?? [], projects ?? [], range ?? EMPTY_RANGE, now),
    [entries, projects, range, now],
  );
  // Tagesansicht nur berechnen, wenn sie angezeigt wird.
  const days = useMemo(
    () =>
      view === 'days' && range ? summarizeByDay(entries ?? [], projects ?? [], range, now) : [],
    [view, entries, projects, range, now],
  );
  const includesRunningTimer =
    range !== null &&
    (entries ?? []).some((entry) => entry.end === null && overlapsRange(entry, range, now));

  const update = (changes: Partial<PeriodState>) =>
    setPeriod((current) => ({ ...current, ...changes }));

  async function handleExportPdf() {
    if (!range) return;
    setPdfError(null);
    try {
      // Synchron erzeugen, damit das Teilen-Menü direkt nach dem Tipp öffnen darf.
      const blob = createReportPdf({
        owner,
        appName: APP_CONFIG.appName,
        range,
        summary,
        createdAt: Date.now(),
      });
      const file = new File([blob], reportFileName(range), { type: 'application/pdf' });
      await shareOrDownload(file);
    } catch (cause) {
      console.error(cause);
      setPdfError('Das PDF konnte nicht erstellt werden.');
    }
  }

  return (
    <>
      <PageHeader title="Auswertung" />

      <div className={styles.controls}>
        <SegmentedControl
          label="Zeitraum"
          options={PERIOD_OPTIONS}
          value={period.kind}
          onChange={(kind) => update({ kind })}
        />

        {period.kind === 'week' && (
          <PeriodNavigator
            label={periodLabel('week', period.week)}
            detail={periodDetail(period.week)}
            onPrevious={() => update({ week: shiftWeek(period.week, -1) })}
            onNext={() => update({ week: shiftWeek(period.week, 1) })}
            nextDisabled={period.week.end > now}
          />
        )}

        {period.kind === 'month' && (
          <PeriodNavigator
            label={periodLabel('month', period.month)}
            detail={periodDetail(period.month)}
            onPrevious={() => update({ month: shiftMonth(period.month, -1) })}
            onNext={() => update({ month: shiftMonth(period.month, 1) })}
            nextDisabled={period.month.end > now}
          />
        )}

        {period.kind === 'custom' && (
          <div className={styles.customRange}>
            <Field label="Von" htmlFor={fromId}>
              <Input
                id={fromId}
                type="date"
                value={period.customFrom}
                onChange={(event) => update({ customFrom: event.target.value })}
              />
            </Field>
            <Field label="Bis" htmlFor={toId}>
              <Input
                id={toId}
                type="date"
                value={period.customTo}
                onChange={(event) => update({ customTo: event.target.value })}
              />
            </Field>
          </div>
        )}
      </div>

      {range === null && <Notice tone="warning">Bitte zwei gültige Daten auswählen.</Notice>}

      {range !== null && entries !== undefined && summary.rows.length === 0 && (
        <EmptyState
          icon="chart"
          title="Keine Zeiten"
          text="In diesem Zeitraum wurde nichts erfasst."
        />
      )}

      {range !== null && summary.rows.length > 0 && (
        <>
          <ReportTotalCard totalMinutes={summary.totalMinutes} />

          <div className={styles.viewSwitch}>
            <SegmentedControl
              label="Ansicht"
              options={VIEW_OPTIONS}
              value={view}
              onChange={setView}
            />
          </div>

          {view === 'projects' ? (
            <ProjectSummaryList summary={summary} />
          ) : (
            <DaySummaryList days={days} />
          )}

          {includesRunningTimer && (
            <div className={styles.notice}>
              <Notice>Der laufende Timer ist bis jetzt mitgezählt.</Notice>
            </div>
          )}

          <div className={styles.export}>
            {pdfError && <Notice tone="error">{pdfError}</Notice>}
            <Button variant="primary" size="lg" icon="file" fullWidth onClick={handleExportPdf}>
              PDF erstellen
            </Button>
            <p className={styles.exportHint}>
              {owner ? (
                <>Enthält die Summen pro Projekt mit Kopfzeile „{owner}“.</>
              ) : (
                <>
                  Tipp: Unter{' '}
                  <Link to={ROUTES.settings} className={styles.link}>
                    Einstellungen
                  </Link>{' '}
                  deinen Namen für den Kopf des PDF eintragen.
                </>
              )}
            </p>
          </div>
        </>
      )}
    </>
  );
}
