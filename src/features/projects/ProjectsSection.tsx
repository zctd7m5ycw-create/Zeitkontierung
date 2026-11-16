/**
 * Projektverwaltung in den Einstellungen: aktive und archivierte Projekte.
 */
import { useState } from 'react';
import { useProjects } from '@/data/hooks';
import type { Project } from '@/domain/types';
import { ColorDot } from '@/ui/ColorDot';
import { Icon } from '@/ui/Icon';
import { List, ListRow } from '@/ui/List';
import { ProjectEditorSheet } from './ProjectEditorSheet';
import styles from './ProjectsSection.module.css';

type EditorState = { kind: 'closed' } | { kind: 'create' } | { kind: 'edit'; project: Project };

export function ProjectsSection() {
  const projects = useProjects();
  const [editor, setEditor] = useState<EditorState>({ kind: 'closed' });
  const [showArchived, setShowArchived] = useState(false);

  if (!projects) return null;

  const active = projects.filter((project) => !project.archived);
  const archived = projects.filter((project) => project.archived);

  return (
    <div>
      <List title="Projekte">
        {active.map((project) => (
          <ListRow
            key={project.id}
            leading={<ColorDot color={project.color} size="md" />}
            title={project.name}
            chevron
            onClick={() => setEditor({ kind: 'edit', project })}
          />
        ))}
        <ListRow
          leading={<Icon name="plus" size={20} className={styles.addIcon} />}
          title={<span className={styles.addLabel}>Neues Projekt</span>}
          onClick={() => setEditor({ kind: 'create' })}
        />
      </List>

      {archived.length > 0 && (
        <div className={styles.archive}>
          <button
            type="button"
            className={styles.archiveToggle}
            aria-expanded={showArchived}
            onClick={() => setShowArchived((value) => !value)}
          >
            <span>Archivierte Projekte ({archived.length})</span>
            <Icon
              name="chevronDown"
              size={18}
              className={showArchived ? styles.chevronOpen : styles.chevron}
            />
          </button>
          {showArchived && (
            <List>
              {archived.map((project) => (
                <ListRow
                  key={project.id}
                  leading={<ColorDot color={project.color} size="md" />}
                  title={<span className={styles.archivedName}>{project.name}</span>}
                  chevron
                  onClick={() => setEditor({ kind: 'edit', project })}
                />
              ))}
            </List>
          )}
        </div>
      )}

      {editor.kind !== 'closed' && (
        <ProjectEditorSheet
          project={editor.kind === 'edit' ? editor.project : undefined}
          allProjects={projects}
          onClose={() => setEditor({ kind: 'closed' })}
        />
      )}
    </div>
  );
}
