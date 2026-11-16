/**
 * Einstiegspunkt der Oberfläche: Routing zwischen den Seiten.
 *
 * Hash-Routing (Adressen wie …/#/timer) funktioniert auf GitHub Pages ohne
 * Server-Konfiguration und auch offline.
 */
import { lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router';
import { EntriesPage } from '@/features/entries/EntriesPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { TimerPage } from '@/features/timer/TimerPage';
import { AppLayout } from './AppLayout';
import { ROUTES } from './routes';

// Die Auswertung enthält die PDF-Bibliothek und wird erst beim Öffnen geladen.
const ReportPage = lazy(() => import('@/features/reports/ReportPage'));

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={ROUTES.timer} element={<TimerPage />} />
          <Route path={ROUTES.entries} element={<EntriesPage />} />
          <Route path={ROUTES.report} element={<ReportPage />} />
          <Route path={ROUTES.settings} element={<SettingsPage />} />
          <Route path="*" element={<Navigate to={ROUTES.timer} replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
