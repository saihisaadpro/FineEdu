import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { StageProgressArc } from '@/components/stage/StageProgressArc';
import { useBlockSessionStore } from '@/stores/blockSessionStore';

describe('StageProgressArc', () => {
  beforeEach(() => {
    // Must provide a session object to avoid infinite re-render from referential
    // inequality of `?? []` producing a new array each render.
    useBlockSessionStore.setState({
      activeSession: {
        sessionId: 'test',
        blockId: 'accounting',
        startedAt: new Date().toISOString(),
        currentStage: 1,
        stagesCompleted: [],
        generatedContext: {},
        totalXP: 0,
        isReplay: false,
      },
    });
  });

  it('renders 4 stage steps', () => {
    render(<StageProgressArc currentStage={1} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
  });

  it('marks current stage with aria-current', () => {
    useBlockSessionStore.setState({
      activeSession: {
        sessionId: 'test',
        blockId: 'accounting',
        startedAt: new Date().toISOString(),
        currentStage: 2,
        stagesCompleted: [],
        generatedContext: {},
        totalXP: 0,
        isReplay: false,
      },
    });
    render(<StageProgressArc currentStage={2} />);
    const items = screen.getAllByRole('listitem');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).not.toHaveAttribute('aria-current');
  });

  it('shows completed stages after completeStage', () => {
    useBlockSessionStore.setState({
      activeSession: {
        sessionId: 'test',
        blockId: 'accounting',
        startedAt: new Date().toISOString(),
        currentStage: 2,
        stagesCompleted: [1],
        generatedContext: {},
        totalXP: 30,
        isReplay: false,
      },
    });
    render(<StageProgressArc currentStage={2} />);
    // Stage labels
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('Apply')).toBeInTheDocument();
    expect(screen.getByText('Analyse')).toBeInTheDocument();
    expect(screen.getByText('Synthesise')).toBeInTheDocument();
  });

  it('has list role with accessible label', () => {
    render(<StageProgressArc currentStage={1} />);
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', 'Stage progress');
  });
});
