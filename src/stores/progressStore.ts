import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TopicProgress {
  topicId: string;
  completed: boolean;
  score: number;
  totalQuestions: number;
  highestDifficulty: 'easy' | 'medium' | 'hard';
  completedAt: string | null;
}

interface ProgressState {
  xp: number;
  badges: string[];
  topicProgress: Record<string, TopicProgress>;

  addXP: (amount: number) => void;
  awardBadge: (badgeId: string) => void;
  updateTopicProgress: (topicId: string, progress: Partial<TopicProgress>) => void;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      xp: 0,
      badges: [],
      topicProgress: {},

      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      awardBadge: (badgeId) => set((state) => ({
        badges: state.badges.includes(badgeId)
          ? state.badges
          : [...state.badges, badgeId],
      })),
      updateTopicProgress: (topicId, progress) => set((state) => ({
        topicProgress: {
          ...state.topicProgress,
          [topicId]: {
            topicId,
            completed: false,
            score: 0,
            totalQuestions: 0,
            highestDifficulty: 'easy',
            completedAt: null,
            ...state.topicProgress[topicId],
            ...progress,
          },
        },
      })),
      resetProgress: () => set({ xp: 0, badges: [], topicProgress: {} }),
    }),
    {
      name: 'wrf-progress',
    }
  )
);
