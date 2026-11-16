import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { at, makeProject } from '@/test/fixtures';
import { DaySummaryList } from './DaySummaryList';

describe('DaySummaryList', () => {
  it('zeigt pro Tag die Summe und die Projekte', () => {
    const alpha = makeProject({ id: 'a', name: 'Alpha' });
    const beta = makeProject({ id: 'b', name: 'Beta', color: 'teal' });
    render(
      <DaySummaryList
        days={[
          {
            day: at(2026, 11, 16),
            totalMinutes: 400,
            rows: [
              { projectId: 'a', project: alpha, minutes: 255 },
              { projectId: 'b', project: beta, minutes: 145 },
            ],
          },
          {
            day: at(2026, 11, 13),
            totalMinutes: 30,
            rows: [{ projectId: 'a', project: alpha, minutes: 30 }],
          },
        ]}
      />,
    );

    const sections = screen.getAllByRole('region');
    expect(sections.map((section) => section.getAttribute('aria-label'))).toEqual([
      'Mo., 16. November',
      'Fr., 13. November',
    ]);
    const monday = within(sections[0]!);
    expect(monday.getByText('6:40 h')).toBeInTheDocument();
    expect(monday.getByText('Alpha')).toBeInTheDocument();
    expect(monday.getByText('4:15')).toBeInTheDocument();
    expect(monday.getByText('2:25')).toBeInTheDocument();
  });
});
