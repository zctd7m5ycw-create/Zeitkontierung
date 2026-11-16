import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import packageJson from './package.json' with { type: 'json' };

/**
 * Build-Konfiguration.
 *
 * `base: './'` erzeugt relative Pfade. Dadurch läuft die App auf GitHub Pages
 * unabhängig davon, wie das Repository heißt (https://<nutzer>.github.io/<repo>/).
 */
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [
    react(),
    VitePWA({
      // Neue Versionen werden beim nächsten Öffnen der App automatisch aktiv.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Zeitkontierung',
        short_name: 'Zeitkontierung',
        description: 'Arbeitszeiten pro Projekt erfassen',
        lang: 'de',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f5f5f4',
        theme_color: '#f5f5f4',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Die gesamte App wird offline zwischengespeichert.
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        // Optionale Zusatzmodule der PDF-Bibliothek (HTML-Rendering), die die App nicht nutzt.
        globIgnores: ['**/html2canvas-*.js', '**/purify.es-*.js', '**/index.es-*.js'],
        // Die PDF-Bibliothek ist groß; ohne höheres Limit würde sie nicht offline gecacht.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
});
