import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { db } from '@/data/db';
import { makeProject } from '@/test/fixtures';
import { TimerPage } from './TimerPage';

describe('TimerPage', () => {
  it('Starten eines anderen Projekts stoppt das laufende', async () => {
    await db.projects.bulkAdd([
      makeProject({ id: 'a', name: 'Alpha' }),
      makeProject({ id: 'b', name: 'Beta', color: 'teal' }),
    ]);
    const user = userEvent.setup();
    render(<TimerPage />);

    await user.click(await screen.findByRole('button', { name: 'Alpha: Timer starten' }));
    expect(await screen.findByRole('button', { name: 'Alpha: Timer stoppen' })).toBeInTheDocument();
    expect(screen.getByLabelText('Laufzeit')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Beta: Timer starten' }));
    expect(await screen.findByRole('button', { name: 'Beta: Timer stoppen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alpha: Timer starten' })).toBeInTheDocument();

    const entries = await db.entries.toArray();
    expect(entries.filter((entry) => entry.end === null).map((entry) => entry.projectId)).toEqual([
      'b',
    ]);
  });

  it('Stoppen beendet den laufenden Timer', async () => {
    await db.projects.add(makeProject({ id: 'a', name: 'Alpha' }));
    const user = userEvent.setup();
    render(<TimerPage />);

    await user.click(await screen.findByRole('button', { name: 'Alpha: Timer starten' }));
    await user.click(await screen.findByRole('button', { name: 'Stoppen' }));

    expect(await screen.findByText('Kein Timer aktiv')).toBeInTheDocument();
    expect((await db.entries.toArray())[0]?.end).not.toBeNull();
  });

  it('ohne Projekte kann direkt ein Projekt angelegt werden', async () => {
    const user = userEvent.setup();
    render(<TimerPage />);

    await user.click(await screen.findByRole('button', { name: 'Projekt anlegen' }));
    const dialog = await screen.findByRole('dialog', { name: 'Neues Projekt' });
    await user.type(within(dialog).getByLabelText('Name'), 'Neubau Halle 3');
    await user.click(within(dialog).getByRole('button', { name: 'Projekt anlegen' }));

    expect(
      await screen.findByRole('button', { name: 'Neubau Halle 3: Timer starten' }),
    ).toBeInTheDocument();
  });
});
