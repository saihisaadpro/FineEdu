import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfidenceSurvey } from '@/components/feedback/ConfidenceSurvey';
import { useUserStore } from '@/stores/userStore';

// Stub the user store to have a userId
vi.mock('@/stores/userStore', () => ({
  useUserStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ supabaseUserId: 'test-user-id', role: 'student', isAnonymous: true }),
  ),
}));

describe('ConfidenceSurvey', () => {
  const onComplete = vi.fn();

  beforeEach(() => {
    onComplete.mockClear();
  });

  it('renders all 5 question progress dots', () => {
    render(
      <ConfidenceSurvey
        blockId="accounting"
        blockTitle="Accounting Fundamentals"
        surveyType="pre"
        onComplete={onComplete}
      />,
    );
    const dots = screen.getAllByRole('button', { name: /Go to question/ });
    expect(dots).toHaveLength(5);
  });

  it('displays the first question', () => {
    render(
      <ConfidenceSurvey
        blockId="accounting"
        blockTitle="Accounting Fundamentals"
        surveyType="pre"
        onComplete={onComplete}
      />,
    );
    expect(screen.getByText(/financial records/i)).toBeInTheDocument();
    expect(screen.getByText('1/5')).toBeInTheDocument();
  });

  it('allows selecting a Likert answer and navigating next', () => {
    render(
      <ConfidenceSurvey
        blockId="accounting"
        blockTitle="Accounting Fundamentals"
        surveyType="pre"
        onComplete={onComplete}
      />,
    );
    // Select "Agree" (value 4)
    fireEvent.click(screen.getByText('Agree'));
    expect(screen.getByText('Agree')).toHaveAttribute('aria-pressed', 'true');

    // Click Next → goes to Q2
    fireEvent.click(screen.getByText(/Next/));
    expect(screen.getByText('2/5')).toBeInTheDocument();
  });

  it('calls onComplete(null) when skip is clicked', () => {
    render(
      <ConfidenceSurvey
        blockId="accounting"
        blockTitle="Accounting Fundamentals"
        surveyType="pre"
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByText(/Skip for now/));
    expect(onComplete).toHaveBeenCalledWith(null);
  });

  it('shows submit button on last question', () => {
    render(
      <ConfidenceSurvey
        blockId="accounting"
        blockTitle="Accounting Fundamentals"
        surveyType="pre"
        onComplete={onComplete}
      />,
    );
    // Navigate to Q5
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText('Neutral'));
      fireEvent.click(screen.getByText(/Next/));
    }
    // On Q5, should show Submit
    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });
});
