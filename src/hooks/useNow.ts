import { useEffect, useState } from 'react';
import type { Timestamp } from '@/domain/types';

/**
 * Liefert die aktuelle Uhrzeit und aktualisiert sie regelmäßig,
 * z. B. jede Sekunde für die laufende Uhr.
 *
 * Kehrt die App aus dem Hintergrund zurück, wird sofort aktualisiert –
 * iOS pausiert Timer von Web-Apps im Hintergrund.
 */
export function useNow(intervalMs = 1_000): Timestamp {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = window.setInterval(update, intervalMs);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') update();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs]);

  return now;
}
