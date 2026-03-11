import { create } from 'zustand';
import type { Question } from '@/types';

interface ContentState {
  testBanks: Record<string, Question[]>;

  setTestBank: (topicId: string, questions: Question[]) => void;
  updateTestBank: (topicId: string, questions: Question[]) => void;
  initTestBanks: (banks: Record<string, Question[]>) => void;
}

export const useContentStore = create<ContentState>((set) => ({
  testBanks: {},

  setTestBank: (topicId, questions) => set((state) => ({
    testBanks: { ...state.testBanks, [topicId]: questions },
  })),
  updateTestBank: (topicId, questions) => set((state) => ({
    testBanks: { ...state.testBanks, [topicId]: questions },
  })),
  initTestBanks: (banks) => set({ testBanks: banks }),
}));
