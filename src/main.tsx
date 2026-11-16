import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { requestPersistentStorage } from '@/data/storagePersistence';
import '@/styles/tokens.css';
import '@/styles/global.css';

// Den Browser bitten, die Daten nicht automatisch zu löschen.
void requestPersistentStorage();

const container = document.getElementById('root');
if (!container) throw new Error('Element #root fehlt in index.html');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
