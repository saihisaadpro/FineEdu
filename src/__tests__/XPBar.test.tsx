import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { XPBar } from '@/components/gamification/XPBar';
import { useProgressStore } from '@/stores/progressStore';

describe('XPBar', () => {
  beforeEach(() => {
    useProgressStore.setState({ xp: 0, badges: [], topicProgress: {} });
  });

  it('renders level 1 at 0 XP', () => {
    render(<XPBar />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', '0 experience points, level 1');
  });

  it('shows correct level for XP ≥ 100', () => {
    useProgressStore.setState({ xp: 250 });
    render(<XPBar />);
    // Level = floor(250/100)+1 = 3
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      '250 experience points, level 3',
    );
  });

  it('renders both desktop and mobile variants', () => {
    useProgressStore.setState({ xp: 50 });
    render(<XPBar />);
    // Desktop progressbar
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    // Mobile status pill
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has accessible attributes', () => {
    render(<XPBar />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });
});
