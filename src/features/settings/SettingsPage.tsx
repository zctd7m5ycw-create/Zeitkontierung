/**
 * Seite „Einstellungen“: Projekte verwalten, Name im PDF, Datensicherung, Info.
 */
import { BackupSection } from '@/features/backup/BackupSection';
import { ProjectsSection } from '@/features/projects/ProjectsSection';
import { ReportOwnerSection } from '@/features/reports/ReportOwnerSection';
import { PageHeader } from '@/ui/PageHeader';
import { AboutSection } from './AboutSection';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Einstellungen" />
      <div className={styles.sections}>
        <ProjectsSection />
        <ReportOwnerSection />
        <BackupSection />
        <AboutSection />
      </div>
    </>
  );
}
