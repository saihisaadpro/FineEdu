import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GateOverrideState {
  /** When true, all stage gates are bypassed (facilitator-only) */
  enabled: boolean;
  toggle: () => void;
  setEnabled: (v: boolean) => void;
}

export const useGateOverrideStore = create<GateOverrideState>()(
  persist(
    (set) => ({
      enabled: false,
      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setEnabled: (enabled) => set({ enabled }),
    }),
    {
      name: 'wrf-gate-override',
    },
  ),
);
