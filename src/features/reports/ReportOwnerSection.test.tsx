import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { getSetting, setSetting } from '@/data/settingsRepository';
import { ReportOwnerSection } from './ReportOwnerSection';

describe('ReportOwnerSection', () => {
  it('speichert den eingegebenen Namen bereinigt', async () => {
    const user = userEvent.setup();
    render(<ReportOwnerSection />);

    await user.click(await screen.findByRole('button', { name: /Name im Kopf/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Name im PDF' });
    await user.type(within(dialog).getByLabelText('Name'), '  Gundermann   GmbH ');
    await user.click(within(dialog).getByRole('button', { name: 'Speichern' }));

    expect(await getSetting('reportOwnerName')).toBe('Gundermann GmbH');
    expect(await screen.findByText('Gundermann GmbH')).toBeInTheDocument();
  });

  it('zeigt an, wenn noch kein Name festgelegt ist', async () => {
    render(<ReportOwnerSection />);
    expect(await screen.findByText('Nicht festgelegt')).toBeInTheDocument();
  });

  it('erlaubt das Entfernen des Namens', async () => {
    await setSetting('reportOwnerName', 'Alt');
    const user = userEvent.setup();
    render(<ReportOwnerSection />);

    await user.click(await screen.findByRole('button', { name: /Name im Kopf/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Name im PDF' });
    await user.clear(within(dialog).getByLabelText('Name'));
    await user.click(within(dialog).getByRole('button', { name: 'Speichern' }));

    expect(await getSetting('reportOwnerName')).toBe('');
    expect(await screen.findByText('Nicht festgelegt')).toBeInTheDocument();
  });
});
