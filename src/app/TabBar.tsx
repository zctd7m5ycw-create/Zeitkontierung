import { NavLink } from 'react-router';
import { Icon } from '@/ui/Icon';
import { TABS } from './routes';
import styles from './TabBar.module.css';

/** Navigationsleiste am unteren Bildschirmrand (in Daumenreichweite). */
export function TabBar() {
  return (
    <nav className={styles.tabBar} aria-label="Hauptnavigation">
      <ul className={styles.list}>
        {TABS.map((tab) => (
          <li key={tab.path} className={styles.item}>
            <NavLink
              to={tab.path}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              <Icon name={tab.icon} size={24} />
              <span className={styles.label}>{tab.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
