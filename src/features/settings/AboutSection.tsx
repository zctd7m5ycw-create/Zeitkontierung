/**
 * Informationen zur App: Version und Status der dauerhaften Speicherung.
 */
import { useEffect, useState } from 'react';
import { APP_VERSION } from '@/config/appConfig';
import { getPersistenceStatus, type PersistenceStatus } from '@/data/storagePersistence';
import { List, ListRow } from '@/ui/List';

const PERSISTENCE_LABELS: Record<PersistenceStatus, string> = {
  persisted: 'Dauerhaft',
  'not-persisted': 'Nicht garantiert',
  unsupported: 'Unbekannt',
};

export function AboutSection() {
  const [persistence, setPersistence] = useState<PersistenceStatus | null>(null);

  useEffect(() => {
    let active = true;
    void getPersistenceStatus().then((status) => {
      if (active) setPersistence(status);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <List
      title="Info"
      footer="Tipp: Füge die App in Safari über „Teilen → Zum Home-Bildschirm“ hinzu. Nur so bleiben die Daten auf dem iPhone dauerhaft gespeichert."
    >
      <ListRow title="Version" trailing={APP_VERSION} />
      <ListRow title="Speicherung" trailing={persistence ? PERSISTENCE_LABELS[persistence] : '…'} />
    </List>
  );
}
