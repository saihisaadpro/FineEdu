import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@/types/roles';

export type { Role } from '@/types/roles';

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

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'wrf-user',
      partialize: (state) => ({
        role: state.role,
        sessionId: state.sessionId,
        pin: state.pin,
        isAuthenticated: state.isAuthenticated,
        isAnonymous: state.isAnonymous,
      }),
    },
  ),
);
