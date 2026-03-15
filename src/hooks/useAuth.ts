import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/services/supabase';
import { useUserStore } from '@/stores/userStore';
import { hasGDPRConsent } from '@/components/ui/ConsentBanner';
import { isClientOnlyRole } from '@/types/roles';
import type { Role } from '@/types/roles';

/**
 * Initialises and manages the Supabase auth session.
 *
 * - Listens to onAuthStateChange for all session lifecycle events.
 * - GDPR: Does NOT create an anonymous session until consent is given.
 *   The consent banner calls `initAnonymousSession()` after the user accepts.
 * - For authenticated (non-anonymous) users, fetches their profile role.
 * - Preserves client-only roles (student, pin_learner) that don't exist in the DB.
 * - Handles session expiration by redirecting to the landing page.
 */
export const useAuth = () => {
  const setSupabaseUserId = useUserStore(s => s.setSupabaseUserId);
  const setIsAnonymous = useUserStore(s => s.setIsAnonymous);
  const setAuthLoading = useUserStore(s => s.setAuthLoading);
  const setRole = useUserStore(s => s.setRole);
  const logout = useUserStore(s => s.logout);
  const initCalled = useRef(false);

  /** Create an anonymous Supabase session. Safe to call multiple times. */
  const initAnonymousSession = useCallback(async () => {
    if (initCalled.current) return;
    initCalled.current = true;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Anonymous sign-in failed:', error.message);
        setAuthLoading(false);
        initCalled.current = false; // allow retry
      }
    }
  }, [setAuthLoading]);

  useEffect(() => {
    // Set up the auth state listener first (recommended by Supabase docs).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('demo_role_override');
          logout();
          return;
        }

        // Handle token refresh failure — session has expired and can't be renewed
        if (event === 'TOKEN_REFRESHED' && !session) {
          toast.error('Your session has expired. Please log in again.');
          localStorage.removeItem('demo_role_override');
          logout();
          return;
        }

        if (session?.user) {
          const user = session.user;
          setSupabaseUserId(user.id);
          setIsAnonymous(user.is_anonymous ?? false);

          // Fetch role from profiles for ALL users (including anonymous demo logins).
          // Use setTimeout to avoid deadlock per Supabase docs:
          // "Do not use other Supabase functions in the callback function"
          // authLoading is set to false INSIDE the setTimeout after role
          // resolution so AuthGuard never sees role=null on a valid session.
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

              const dbRole = profile?.role as Role | undefined;
              const currentRole = useUserStore.getState().role;

              if (dbRole && dbRole !== 'guest') {
                // DB has a meaningful role — use it
                setRole(dbRole);
                localStorage.removeItem('demo_role_override');
              } else if (isClientOnlyRole(currentRole)) {
                // Current role is student or pin_learner (client-only, not in DB).
                // Preserve it — the user entered via the learner flow.
              } else {
                // Fall back to localStorage override (demo login) or DB role
                const override = localStorage.getItem('demo_role_override') as Role | null;
                if (override) {
                  setRole(override);
                } else if (dbRole) {
                  setRole(dbRole);
                }
              }
            } finally {
              setAuthLoading(false);
            }
          }, 0);
        } else {
          // No user in session — mark loading as done
          setAuthLoading(false);
        }
      }
    );

    // Only auto-create anonymous session if GDPR consent was already given.
    // Otherwise, the consent banner will call initAnonymousSession() on accept.
    if (hasGDPRConsent()) {
      initAnonymousSession();
    } else {
      // If there's an existing session (e.g. facilitator login), handle it.
      // Otherwise just mark loading as done — we're waiting for consent.
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) setAuthLoading(false);
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [setSupabaseUserId, setIsAnonymous, setAuthLoading, setRole, logout, initAnonymousSession]);

  return { initAnonymousSession };
};
