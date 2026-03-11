import { create } from 'zustand';

export type Role = 'guest' | 'student' | 'pin_learner' | 'facilitator' | 'lecturer' | 'admin';

interface UserState {
  role: Role | null;
  sessionId: string | null;
  pin: string | null;
  supabaseUserId: string | null;
  isAuthenticated: boolean;

  setRole: (role: Role) => void;
  setSession: (sessionId: string) => void;
  setPin: (pin: string) => void;
  setSupabaseUserId: (id: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  role: null,
  sessionId: null,
  pin: null,
  supabaseUserId: null,
  isAuthenticated: false,

  setRole: (role) => set({ role, isAuthenticated: true }),
  setSession: (sessionId) => set({ sessionId }),
  setPin: (pin) => set({ pin }),
  setSupabaseUserId: (id) => set({ supabaseUserId: id }),
  logout: () => set({
    role: null,
    sessionId: null,
    pin: null,
    supabaseUserId: null,
    isAuthenticated: false,
  }),
}));
