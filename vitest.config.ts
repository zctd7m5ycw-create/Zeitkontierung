import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

/*
 * Alle Tests laufen in der Zeitzone Europe/Berlin, damit Tests rund um
 * Mitternacht und Sommer-/Winterzeit auf jedem Rechner gleich ausfallen.
 */
process.env.TZ = 'Europe/Berlin';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      restoreMocks: true,
    },
  }),
);
