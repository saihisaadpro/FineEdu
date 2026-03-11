import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { BadgeShelf } from '@/components/gamification/BadgeShelf';
import { useProgressStore } from '@/stores/progressStore';
import { BADGES } from '@/data/badges';

describe('BadgeShelf', () => {
  beforeEach(() => {
    useProgressStore.setState({ xp: 0, badges: [], topicProgress: {} });
  });

  it('renders all badge slots', () => {
    render(<BadgeShelf />);
    // Each badge should display its name
    for (const badge of BADGES) {
      expect(screen.getByText(badge.name)).toBeInTheDocument();
    }
  });

  it('shows correct count of earned badges', () => {
    useProgressStore.setState({ badges: ['first_steps', 'explorer'] });
    render(<BadgeShelf />);
    expect(screen.getByText(`2/${BADGES.length}`)).toBeInTheDocument();
  });

  it('displays 0 earned when no badges', () => {
    render(<BadgeShelf />);
    expect(screen.getByText(`0/${BADGES.length}`)).toBeInTheDocument();
  });

  it('renders earned badges with tier label', () => {
    useProgressStore.setState({ badges: ['first_steps'] });
    render(<BadgeShelf />);
    // The tier label should appear for earned badges
    expect(screen.getByText('bronze')).toBeInTheDocument();
  });
});
