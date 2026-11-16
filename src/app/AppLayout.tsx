import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { TabBar } from './TabBar';
import styles from './AppLayout.module.css';

/** Rahmen jeder Seite: Inhaltsbereich und Tab-Leiste. */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <main className={styles.content}>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <TabBar />
    </div>
  );
}
