import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/services/supabase';
import { useUserStore } from '@/stores/userStore';
import { hasGDPRConsent } from '@/components/ui/ConsentBanner';
import type { Role } from '@/stores/userStore';

/**
 * Initialises and manages the Supabase auth session.
 *
 * - Listens to onAuthStateChange for all session lifecycle events.
 * - GDPR: Does NOT create an anonymous session until consent is given.
 *   The consent banner calls `initAnonymousSession()` after the user accepts.
 * - For authenticated (non-anonymous) users, fetches their profile role.
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
          logout();
          return;
        }

        if (session?.user) {
          const user = session.user;
          setSupabaseUserId(user.id);
          setIsAnonymous(user.is_anonymous ?? false);

          // For non-anonymous users, fetch their role from the profiles table.
          if (!user.is_anonymous) {
            // Use setTimeout to avoid deadlock per Supabase docs:
            // "Do not use other Supabase functions in the callback function"
            setTimeout(async () => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();

              if (profile?.role) {
                setRole(profile.role as Role);
              }
            }, 0);
          }
        }

        setAuthLoading(false);
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
