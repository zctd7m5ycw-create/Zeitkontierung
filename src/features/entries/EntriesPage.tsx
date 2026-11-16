/**
 * Seite „Einträge“: alle Zeitblöcke eines Monats, nach Tagen gruppiert.
 */
import { useState } from 'react';
import { useEntriesInRange, useProjects } from '@/data/hooks';
import { containsTimestamp, monthRange, shiftMonth } from '@/domain/dateRange';
import { groupByStartDay } from '@/domain/entries';
import { formatDurationMs, formatMonthYear, formatWeekdayDate } from '@/domain/format';
import { entryDurationMs } from '@/domain/time';
import type { TimeEntry } from '@/domain/types';
import { useNow } from '@/hooks/useNow';
import { IconButton } from '@/ui/Button';
import { EmptyState } from '@/ui/EmptyState';
import { List } from '@/ui/List';
import { PageHeader } from '@/ui/PageHeader';
import { PeriodNavigator } from '@/ui/PeriodNavigator';
import { EntryEditorSheet } from './EntryEditorSheet';
import { EntryRow } from './EntryRow';
import styles from './EntriesPage.module.css';

type EditorState = { kind: 'closed' } | { kind: 'create' } | { kind: 'edit'; entry: TimeEntry };

export function EntriesPage() {
  const now = useNow(15_000);
  const [month, setMonth] = useState(() => monthRange(Date.now()));
  const [editor, setEditor] = useState<EditorState>({ kind: 'closed' });
  const projects = useProjects();
  const entries = useEntriesInRange(month);

  const isCurrentMonth = containsTimestamp(month, now);
  const hasActiveProjects = projects?.some((project) => !project.archived) ?? false;

  // Einträge erscheinen in dem Monat, in dem sie begonnen haben.
  const groups = groupByStartDay(
    (entries ?? []).filter((entry) => containsTimestamp(month, entry.start)),
  );
  const projectsById = new Map((projects ?? []).map((project) => [project.id, project]));

  return (
    <>
      <PageHeader
        title="Einträge"
        action={
          <IconButton
            icon="plus"
            label="Zeit nachtragen"
            onClick={() => setEditor({ kind: 'create' })}
            disabled={!hasActiveProjects}
          />
        }
      />

      <div className={styles.navigator}>
        <PeriodNavigator
          label={formatMonthYear(month.start)}
          onPrevious={() => setMonth((current) => shiftMonth(current, -1))}
          onNext={() => setMonth((current) => shiftMonth(current, 1))}
          nextDisabled={isCurrentMonth}
        />
      </div>

      {entries !== undefined && groups.length === 0 && (
        <EmptyState
          icon="list"
          title="Keine Einträge"
          text={`Für ${formatMonthYear(month.start)} sind keine Zeiten erfasst.`}
        />
      )}

      {groups.map((group) => {
        const dayTotal = group.entries.reduce((sum, entry) => sum + entryDurationMs(entry, now), 0);
        return (
          <List
            key={group.day}
            title={formatWeekdayDate(group.day)}
            titleAside={`${formatDurationMs(dayTotal)} h`}
          >
            {group.entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                project={projectsById.get(entry.projectId)}
                now={now}
                onSelect={() => setEditor({ kind: 'edit', entry })}
              />
            ))}
          </List>
        );
      })}

      {editor.kind !== 'closed' && projects && (
        <EntryEditorSheet
          entry={editor.kind === 'edit' ? editor.entry : undefined}
          projects={projects}
          onClose={() => setEditor({ kind: 'closed' })}
        />
      )}
    </>
  );
}
