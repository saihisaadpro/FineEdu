import { create } from 'zustand';

export type Role = 'guest' | 'student' | 'pin_learner' | 'facilitator' | 'lecturer' | 'admin';

interface UserState {
  role: Role | null;
  sessionId: string | null;
  pin: string | null;
  supabaseUserId: string | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  authLoading: boolean;

  setRole: (role: Role) => void;
  setSession: (sessionId: string) => void;
  setPin: (pin: string) => void;
  setSupabaseUserId: (id: string) => void;
  setIsAnonymous: (isAnonymous: boolean) => void;
  setAuthLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  role: null,
  sessionId: null,
  pin: null,
  supabaseUserId: null,
  isAuthenticated: false,
  isAnonymous: false,
  authLoading: true,

  setRole: (role) => set({ role, isAuthenticated: true }),
  setSession: (sessionId) => set({ sessionId }),
  setPin: (pin) => set({ pin }),
  setSupabaseUserId: (id) => set({ supabaseUserId: id }),
  setIsAnonymous: (isAnonymous) => set({ isAnonymous }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  logout: () => set({
    role: null,
    sessionId: null,
    pin: null,
    supabaseUserId: null,
    isAuthenticated: false,
    isAnonymous: false,
    authLoading: false,
  }),
}));
