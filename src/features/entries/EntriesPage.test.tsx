import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/data/db';
import { startOfDay } from '@/domain/dateRange';
import { makeEntry, makeProject } from '@/test/fixtures';
import { EntriesPage } from './EntriesPage';

const HOUR = 3_600_000;
// Einträge am heutigen Tag, damit sie im aktuell angezeigten Monat liegen.
const today = startOfDay(Date.now());

beforeEach(async () => {
  await db.projects.add(makeProject({ id: 'a', name: 'Alpha' }));
});

describe('EntriesPage', () => {
  it('zeigt Einträge mit Notiz und Tagessumme', async () => {
    await db.entries.bulkAdd([
      makeEntry({ id: 'e1', projectId: 'a', start: today, end: today + HOUR, note: 'Planung' }),
      makeEntry({ id: 'e2', projectId: 'a', start: today + 2 * HOUR, end: today + 3.5 * HOUR }),
    ]);
    render(<EntriesPage />);

    expect(await screen.findByText('00:00 – 01:00 · Planung')).toBeInTheDocument();
    expect(screen.getByText('2:30 h')).toBeInTheDocument();
  });

  it('meldet beim Bearbeiten ein Ende vor dem Beginn', async () => {
    await db.entries.add(makeEntry({ id: 'e1', projectId: 'a', start: today, end: today + HOUR }));
    const user = userEvent.setup();
    render(<EntriesPage />);

    await user.click(await screen.findByText('00:00 – 01:00'));
    const dialog = await screen.findByRole('dialog', { name: 'Eintrag bearbeiten' });
    const endInput = within(dialog).getByLabelText('Ende');
    await user.clear(endInput);
    await user.type(
      endInput,
      `${(within(dialog).getByLabelText('Beginn') as HTMLInputElement).value.slice(0, 11)}00:00`,
    );
    await user.click(within(dialog).getByRole('button', { name: 'Speichern' }));

    expect(
      await within(dialog).findByText('Das Ende muss nach dem Beginn liegen.'),
    ).toBeInTheDocument();
    expect((await db.entries.get('e1'))?.end).toBe(today + HOUR);
  });

  it('löscht einen Eintrag nach Rückfrage', async () => {
    await db.entries.add(makeEntry({ id: 'e1', projectId: 'a', start: today, end: today + HOUR }));
    const user = userEvent.setup();
    render(<EntriesPage />);

    await user.click(await screen.findByText('00:00 – 01:00'));
    await user.click(await screen.findByRole('button', { name: 'Eintrag löschen' }));
    await user.click(await screen.findByRole('button', { name: 'Löschen' }));

    expect(await screen.findByText('Keine Einträge')).toBeInTheDocument();
    expect(await db.entries.count()).toBe(0);
  });
});
