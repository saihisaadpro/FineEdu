import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BlockSession } from '@/types/content';

interface BlockSessionState {
  activeSession: BlockSession | null;
  startBlock: (blockId: string) => void;
  completeStage: (stageNumber: number, context: Record<string, unknown>, xpEarned: number) => void;
  getSessionContext: () => Record<string, unknown>;
  resetSession: () => void;
}

export const useBlockSessionStore = create<BlockSessionState>()(
  persist(
    (set, get) => ({
      activeSession: null,

      startBlock: (blockId) =>
        set({
          activeSession: {
            sessionId: crypto.randomUUID(),
            blockId,
            startedAt: new Date().toISOString(),
            currentStage: 1,
            stagesCompleted: [],
            generatedContext: {},
            totalXP: 0,
            isReplay: false,
          },
        }),

      completeStage: (stageNumber, context, xpEarned) => {
        const session = get().activeSession;
        if (!session) return;
        set({
          activeSession: {
            ...session,
            currentStage: Math.min(stageNumber + 1, 4) as 1 | 2 | 3 | 4,
            stagesCompleted: [...session.stagesCompleted, stageNumber],
            generatedContext: { ...session.generatedContext, ...context },
            totalXP: session.totalXP + xpEarned,
          },
        });
      },

      getSessionContext: () => get().activeSession?.generatedContext ?? {},

      resetSession: () => set({ activeSession: null }),
    }),
    {
      name: 'wrf-block-session',
    },
  ),
);
