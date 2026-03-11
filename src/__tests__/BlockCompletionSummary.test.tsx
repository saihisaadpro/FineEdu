import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlockCompletionSummary } from '@/components/stage/BlockCompletionSummary';
import { useProgressStore } from '@/stores/progressStore';
import { useBlockSessionStore } from '@/stores/blockSessionStore';
import { useUserStore } from '@/stores/userStore';

// Mock the user store
vi.mock('@/stores/userStore', () => ({
  useUserStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ supabaseUserId: 'test-user-id', role: 'student', isAnonymous: true }),
  ),
}));

// Mock badgeChecker
vi.mock('@/services/badgeChecker', () => ({
  checkAndAwardBadges: vi.fn(() => []),
}));

// Stub content index
vi.mock('@/data/content/index', () => ({
  getBlockTemplates: vi.fn(() => [
    { stageNumber: 1, stageTitle: 'Record', pedagogicalGoal: 'Understand basic recording' },
    { stageNumber: 2, stageTitle: 'Report', pedagogicalGoal: 'Read financial reports' },
    { stageNumber: 3, stageTitle: 'Analyse', pedagogicalGoal: 'Analyse financial data' },
    { stageNumber: 4, stageTitle: 'Advise', pedagogicalGoal: 'Provide financial advice' },
  ]),
}));

describe('BlockCompletionSummary', () => {
  const onReturnToDashboard = vi.fn();
  const onTryAnotherBlock = vi.fn();

  beforeEach(() => {
    onReturnToDashboard.mockClear();
    onTryAnotherBlock.mockClear();

    useProgressStore.setState({
      xp: 120,
      badges: [],
      topicProgress: {
        acc_1: { topicId: 'acc_1', completed: true, score: 4, totalQuestions: 5, highestDifficulty: 'easy', completedAt: new Date().toISOString() },
        acc_2: { topicId: 'acc_2', completed: true, score: 3, totalQuestions: 5, highestDifficulty: 'medium', completedAt: new Date().toISOString() },
        acc_3: { topicId: 'acc_3', completed: true, score: 5, totalQuestions: 5, highestDifficulty: 'medium', completedAt: new Date().toISOString() },
        acc_4: { topicId: 'acc_4', completed: true, score: 4, totalQuestions: 5, highestDifficulty: 'hard', completedAt: new Date().toISOString() },
      },
    });

    useBlockSessionStore.setState({
      activeSession: {
        sessionId: 'test-session',
        blockId: 'accounting',
        startedAt: new Date(Date.now() - 600_000).toISOString(), // 10 min ago
        currentStage: 4,
        stagesCompleted: [1, 2, 3, 4],
        generatedContext: {},
        totalXP: 120,
        isReplay: false,
      },
    });
  });

  it('renders "Mission Complete!" header', () => {
    render(
      <BlockCompletionSummary
        blockId="accounting"
        onReturnToDashboard={onReturnToDashboard}
        onTryAnotherBlock={onTryAnotherBlock}
      />,
    );
    expect(screen.getByText('Mission Complete!')).toBeInTheDocument();
  });

  it('renders 4 stat cards', () => {
    render(
      <BlockCompletionSummary
        blockId="accounting"
        onReturnToDashboard={onReturnToDashboard}
        onTryAnotherBlock={onTryAnotherBlock}
      />,
    );
    expect(screen.getByText('Total XP')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Time Taken')).toBeInTheDocument();
    expect(screen.getByText('AI Chats')).toBeInTheDocument();
  });

  it('shows stage scorecard with all 4 stages', () => {
    render(
      <BlockCompletionSummary
        blockId="accounting"
        onReturnToDashboard={onReturnToDashboard}
        onTryAnotherBlock={onTryAnotherBlock}
      />,
    );
    expect(screen.getByText('Stage Scorecard')).toBeInTheDocument();
    expect(screen.getByText('Record')).toBeInTheDocument();
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Analyse')).toBeInTheDocument();
    expect(screen.getByText('Advise')).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(
      <BlockCompletionSummary
        blockId="accounting"
        onReturnToDashboard={onReturnToDashboard}
        onTryAnotherBlock={onTryAnotherBlock}
      />,
    );
    expect(screen.getByText('Return to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Try Another Block')).toBeInTheDocument();
    expect(screen.getByText('Print Summary')).toBeInTheDocument();
  });

  it('shows key learning takeaways', () => {
    render(
      <BlockCompletionSummary
        blockId="accounting"
        onReturnToDashboard={onReturnToDashboard}
        onTryAnotherBlock={onTryAnotherBlock}
      />,
    );
    expect(screen.getByText('Key Learning Takeaways')).toBeInTheDocument();
    expect(screen.getByText('Understand basic recording')).toBeInTheDocument();
  });
});
