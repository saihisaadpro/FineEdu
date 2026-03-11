/**
 * Seed data for demo / showcase mode.
 * Seeds progressStore and blockSessionStore with realistic partial progress
 * so the dashboard and gamification widgets look populated during a guided tour.
 */

export const DEMO_XP = 185;

export const DEMO_BADGES: string[] = [
  'first_stage',
  'first_block',
  'streak_3',
];

/** Matches the TopicProgress shape from progressStore (topicId, completed, score, totalQuestions, highestDifficulty, completedAt) */
export const DEMO_TOPIC_PROGRESS: Record<string, {
  completed: boolean;
  score: number;
  totalQuestions: number;
  highestDifficulty: 'easy' | 'medium' | 'hard';
  completedAt: string | null;
}> = {
  acc_1: { completed: true, score: 5, totalQuestions: 6, highestDifficulty: 'medium', completedAt: '2026-03-10T10:15:00Z' },
  acc_2: { completed: true, score: 4, totalQuestions: 6, highestDifficulty: 'medium', completedAt: '2026-03-10T10:30:00Z' },
  acc_3: { completed: true, score: 5, totalQuestions: 6, highestDifficulty: 'hard', completedAt: '2026-03-10T10:50:00Z' },
  acc_4: { completed: true, score: 3, totalQuestions: 4, highestDifficulty: 'hard', completedAt: '2026-03-10T11:10:00Z' },
  inv_1: { completed: true, score: 6, totalQuestions: 6, highestDifficulty: 'medium', completedAt: '2026-03-10T14:00:00Z' },
  inv_2: { completed: false, score: 2, totalQuestions: 6, highestDifficulty: 'easy', completedAt: null },
};
