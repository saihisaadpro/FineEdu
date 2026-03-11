import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useUserStore } from '@/stores/userStore';
import type { Role } from '@/stores/userStore';

/**
 * Initialises and manages the Supabase auth session.
 *
 * - Listens to onAuthStateChange for all session lifecycle events.
 * - Creates an anonymous session when no session exists (learner flow).
 * - For authenticated (non-anonymous) users, fetches their profile role.
 * - Handles session expiration by redirecting to the landing page.
 */
export const useAuth = () => {
  const setSupabaseUserId = useUserStore(s => s.setSupabaseUserId);
  const setIsAnonymous = useUserStore(s => s.setIsAnonymous);
  const setAuthLoading = useUserStore(s => s.setAuthLoading);
  const setRole = useUserStore(s => s.setRole);
  const logout = useUserStore(s => s.logout);

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

    // Then check for an existing session and create an anonymous one if needed.
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Create anonymous session for learners — no login required.
        // CAPTCHA token can be added here when Cloudflare Turnstile is enabled
        // in the Supabase dashboard (Authentication → Bot and Abuse Protection).
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Anonymous sign-in failed:', error.message);
          setAuthLoading(false);
        }
        // onAuthStateChange will fire SIGNED_IN and handle the rest.
      }
      // If session already exists, onAuthStateChange INITIAL_SESSION handles it.
    };

    initSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [setSupabaseUserId, setIsAnonymous, setAuthLoading, setRole, logout]);
};
