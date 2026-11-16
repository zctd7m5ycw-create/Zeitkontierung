/**
 * Liste der aktiven Projekte. Ein Tipp auf ein Projekt startet seinen Timer
 * (und stoppt damit den laufenden) oder stoppt ihn, wenn er bereits läuft.
 */
import { formatDurationMs } from '@/domain/format';
import type { Project, ProjectId } from '@/domain/types';
import { ColorDot } from '@/ui/ColorDot';
import { Icon } from '@/ui/Icon';
import { List, ListRow } from '@/ui/List';
import styles from './ProjectTimerList.module.css';

interface ProjectTimerListProps {
  projects: readonly Project[];
  runningProjectId: ProjectId | null;
  /** Heute erfasste Zeit pro Projekt in Millisekunden. */
  todayMsByProject: ReadonlyMap<ProjectId, number>;
  onToggle: (projectId: ProjectId) => void;
}

export function ProjectTimerList({
  projects,
  runningProjectId,
  todayMsByProject,
  onToggle,
}: ProjectTimerListProps) {
  return (
    <List title="Projekte">
      {projects.map((project) => {
        const running = project.id === runningProjectId;
        const todayMs = todayMsByProject.get(project.id) ?? 0;
        return (
          <ListRow
            key={project.id}
            leading={<ColorDot color={project.color} size="md" />}
            title={project.name}
            subtitle={`Heute ${formatDurationMs(todayMs)} h`}
            trailing={
              <span className={`${styles.toggle} ${running ? styles.toggleRunning : ''}`}>
                <Icon name={running ? 'stop' : 'play'} size={18} />
              </span>
            }
            highlighted={running}
            onClick={() => onToggle(project.id)}
            ariaLabel={`${project.name}: Timer ${running ? 'stoppen' : 'starten'}`}
            ariaPressed={running}
          />
        );
      })}
    </List>
  );
}
