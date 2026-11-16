/**
 * Seite „Einstellungen“: Projekte verwalten, Datensicherung, Info.
 */
import { BackupSection } from '@/features/backup/BackupSection';
import { ProjectsSection } from '@/features/projects/ProjectsSection';
import { PageHeader } from '@/ui/PageHeader';
import { AboutSection } from './AboutSection';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Einstellungen" />
      <div className={styles.sections}>
        <ProjectsSection />
        <BackupSection />
        <AboutSection />
      </div>
    </>
  );
}
