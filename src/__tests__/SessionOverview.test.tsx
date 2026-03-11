import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SessionOverview } from '@/components/dashboard/SessionOverview';
import type { FacilitatorStats } from '@/components/dashboard/SessionOverview';

const mockStats: FacilitatorStats = {
  total_today: 14,
  active_now: 3,
  avg_score: 72,
  completion_rate: 65,
  blocks: [],
  recent_completions: [],
};

describe('SessionOverview', () => {
  it('renders 4 stat cards with mock data', () => {
    render(<SessionOverview stats={mockStats} loading={false} />);
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('shows labels for all cards', () => {
    render(<SessionOverview stats={mockStats} loading={false} />);
    expect(screen.getByText('Sessions Today')).toBeInTheDocument();
    expect(screen.getByText('Active Now')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg. Score')).toBeInTheDocument();
  });

  it('shows loading skeleton when loading=true', () => {
    const { container } = render(<SessionOverview stats={null} loading={true} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(4);
  });

  it('handles null stats gracefully', () => {
    render(<SessionOverview stats={null} loading={false} />);
    // Should show 0 values
    expect(screen.getAllByText('0')).toHaveLength(2);
    expect(screen.getAllByText('0%')).toHaveLength(2);
  });
});
