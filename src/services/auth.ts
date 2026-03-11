import { supabase } from './supabase';

/**
 * Sign in a facilitator or lecturer with email and password.
 * Returns the Supabase auth data on success, throws on failure.
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

/**
 * Sign out the current user.
 * Clears both Supabase session and local state.
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Send a password reset email.
 */
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/dashboard`,
  });
  if (error) throw error;
};
