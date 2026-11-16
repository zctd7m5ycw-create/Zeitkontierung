/**
 * Seite „Timer“: laufender Timer oben, darunter alle aktiven Projekte zum Starten/Stoppen.
 */
import { useMemo, useState } from 'react';
import { stopTimer, toggleTimer } from '@/data/entryRepository';
import { useEntriesInRange, useProjects, useRunningEntry } from '@/data/hooks';
import { addDays, startOfDay } from '@/domain/dateRange';
import { msByProjectInRange, totalMsInRange } from '@/domain/report';
import { useNow } from '@/hooks/useNow';
import { EntryEditorSheet } from '@/features/entries/EntryEditorSheet';
import { ProjectEditorSheet } from '@/features/projects/ProjectEditorSheet';
import { Button } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { Notice } from '@/ui/Notice';
import { PageHeader } from '@/ui/PageHeader';
import { ProjectTimerList } from './ProjectTimerList';
import { RunningTimerCard } from './RunningTimerCard';
import styles from './TimerPage.module.css';

export function TimerPage() {
  const now = useNow(1_000);
  const projects = useProjects();
  const running = useRunningEntry();

  // „Heute“ ändert sich nur um Mitternacht; so wird die Abfrage nicht jede Sekunde neu gestartet.
  const todayStart = startOfDay(now);
  const today = useMemo(() => ({ start: todayStart, end: addDays(todayStart, 1) }), [todayStart]);
  const todayEntries = useEntriesInRange(today);

  const [editingRunning, setEditingRunning] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (projects === undefined || running === undefined) {
    return <PageHeader title="Timer" />;
  }

  const activeProjects = projects.filter((project) => !project.archived);
  const runningProject = running
    ? projects.find((project) => project.id === running.projectId)
    : undefined;

  const todayMsByProject = msByProjectInRange(todayEntries ?? [], today, now);

  async function runSafely(action: () => Promise<unknown>) {
    setError(null);
    try {
      await action();
    } catch (cause) {
      console.error(cause);
      setError('Der Timer konnte nicht umgeschaltet werden. Bitte erneut versuchen.');
    }
  }

  return (
    <>
      <PageHeader title="Timer" />

      {error && (
        <div className={styles.error}>
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {(running || activeProjects.length > 0) && (
        <RunningTimerCard
          entry={running}
          project={runningProject}
          now={now}
          todayTotalMs={totalMsInRange(todayEntries ?? [], today, now)}
          onStop={() => runSafely(() => stopTimer())}
          onEdit={() => setEditingRunning(true)}
        />
      )}

      {activeProjects.length > 0 ? (
        <ProjectTimerList
          projects={activeProjects}
          runningProjectId={running?.projectId ?? null}
          todayMsByProject={todayMsByProject}
          onToggle={(projectId) => runSafely(() => toggleTimer(projectId))}
        />
      ) : (
        <NoProjects onCreate={() => setCreatingProject(true)} />
      )}

      {editingRunning && running && (
        <EntryEditorSheet
          entry={running}
          projects={projects}
          onClose={() => setEditingRunning(false)}
        />
      )}

      {creatingProject && (
        <ProjectEditorSheet allProjects={projects} onClose={() => setCreatingProject(false)} />
      )}
    </>
  );
}

function NoProjects({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon="timer"
      title="Noch keine Projekte"
      text="Lege dein erstes Projekt an. Danach startest du die Zeiterfassung mit einem Tipp."
      action={
        <Button variant="primary" icon="plus" onClick={onCreate}>
          Projekt anlegen
        </Button>
      }
    />
  );
}
