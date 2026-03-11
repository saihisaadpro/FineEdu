import { create } from 'zustand';

interface GateOverrideState {
  /** When true, all stage gates are bypassed (facilitator-only) */
  enabled: boolean;
  toggle: () => void;
  setEnabled: (v: boolean) => void;
}

export const useGateOverrideStore = create<GateOverrideState>((set) => ({
  enabled: false,
  toggle: () => set((s) => ({ enabled: !s.enabled })),
  setEnabled: (enabled) => set({ enabled }),
}));
