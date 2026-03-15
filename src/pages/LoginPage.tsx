import React, { useState } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router';
import { Layout, Mail, Lock, ArrowLeft, AlertTriangle, Users, BookOpen, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { signInWithEmail, resetPassword } from '@/services/auth';
import { useUserStore } from '@/stores/userStore';
import type { Role } from '@/types/roles';
import { supabase } from '@/services/supabase';
import { FeatureFlags } from '@/utils/featureFlags';

const LOGIN_MODES = {
  facilitator: {
    title: 'Facilitator Login',
    subtitle: 'Sign in to monitor learner sessions at your venue.',
    icon: Users,
    colour: 'from-blue-600 to-indigo-700',
    redirect: '/facilitator',
    allowedRoles: ['facilitator', 'lecturer', 'admin'] as Role[],
  },
  module_lead: {
    title: 'Module Lead Login',
    subtitle: 'Sign in to manage scenarios and review content for your block.',
    icon: BookOpen,
    colour: 'from-teal-600 to-emerald-700',
    redirect: '/module-lead',
    allowedRoles: ['module_lead', 'lecturer', 'admin'] as Role[],
  },
} as const;

type LoginMode = keyof typeof LOGIN_MODES;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setRole = useUserStore(s => s.setRole);
  const userRole = useUserStore(s => s.role);
  const authLoading = useUserStore(s => s.authLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const modeKey = (searchParams.get('role') as LoginMode) || 'facilitator';
  const mode = LOGIN_MODES[modeKey] ?? LOGIN_MODES.facilitator;
  const ModeIcon = mode.icon;

  // Already signed in with a matching role — redirect straight to dashboard
  if (!authLoading && userRole && mode.allowedRoles.includes(userRole)) {
    return <Navigate to={mode.redirect} replace />;
  }

  /** Instant demo login — creates an anonymous session and assigns the role. */
  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: anonErr } = await supabase.auth.signInAnonymously();
      if (anonErr || !data.user) throw anonErr ?? new Error('Anonymous sign-in failed');

      const uid = data.user.id;
      const targetRole = modeKey === 'module_lead' ? 'module_lead' : 'facilitator';
      const displayName = targetRole === 'module_lead' ? 'Demo Module Lead' : 'Demo Facilitator';

      // Try updating the profile role in the DB.
      // May fail if the CHECK constraint hasn't been migrated yet — that's OK,
      // we fall back to a localStorage override so the role survives refresh.
      const { error: updErr } = await supabase
        .from('profiles')
        .update({ role: targetRole, display_name: displayName })
        .eq('id', uid);

      if (updErr) {
        // Store as fallback; useAuth will read this on next load
        localStorage.setItem('demo_role_override', targetRole);
      } else {
        localStorage.removeItem('demo_role_override');
      }

      setRole(targetRole as Role);
      navigate(mode.redirect);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Demo login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { user } = await signInWithEmail(email, password);

      // Fetch the user's role from profiles to validate access
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const userRole = (profile?.role ?? 'guest') as Role;

      if (!mode.allowedRoles.includes(userRole)) {
        setError(`This account does not have ${modeKey === 'module_lead' ? 'Module Lead' : 'Facilitator'} access. Please check you're using the correct login link.`);
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      setRole(userRole);
      navigate(mode.redirect);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.colour} text-white mb-4`}>
            <ModeIcon className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {showReset ? 'Reset Password' : mode.title}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {showReset
              ? 'Enter your email to receive a password reset link.'
              : mode.subtitle}
          </p>
        </div>

        {showReset ? (
          resetSent ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800 text-center">
                Password reset link sent! Check your email inbox.
              </div>
              <Button
                onClick={() => {
                  setShowReset(false);
                  setResetSent(false);
                  setError('');
                }}
                variant="secondary"
                className="w-full justify-center"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@organisation.ac.uk"
                    autoComplete="email"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full justify-center" isLoading={loading}>
                Send Reset Link
              </Button>

              <button
                type="button"
                onClick={() => { setShowReset(false); setError(''); }}
                className="w-full text-sm text-slate-500 hover:text-blue-600 transition-colors text-center"
              >
                Back to Login
              </button>
            </form>
          )
        ) : (
          <>
            {/* ── Quick Demo Login (prototype mode) ── */}
            {FeatureFlags.DEMO_MODE && (
              <>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${mode.colour} text-white font-semibold py-3 px-4 shadow-lg hover:shadow-xl hover:brightness-110 transition-all disabled:opacity-60`}
                >
                  <Zap className="w-4 h-4" />
                  {loading ? 'Signing in…' : `Quick Demo — ${modeKey === 'module_lead' ? 'Module Lead' : 'Facilitator'}`}
                </button>
                <p className="text-xs text-slate-400 text-center -mt-1">
                  Instant access for prototype evaluation — no credentials needed
                </p>
              </>
            )}

            {FeatureFlags.DEMO_MODE && (
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400 uppercase tracking-widest">or sign in</span>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@organisation.ac.uk"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full justify-center" isLoading={loading}>
              Sign In
            </Button>

            <button
              type="button"
              onClick={() => { setShowReset(true); setError(''); }}
              className="w-full text-sm text-slate-500 hover:text-blue-600 transition-colors text-center"
            >
              Forgot your password?
            </button>
          </form>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-center">
          {modeKey === 'facilitator' ? (
            <button
              type="button"
              onClick={() => { navigate('/login?role=module_lead'); setError(''); }}
              className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors font-medium"
            >
              <BookOpen className="w-4 h-4" />
              Switch to Module Lead Login
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { navigate('/login?role=facilitator'); setError(''); }}
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              <Users className="w-4 h-4" />
              Switch to Facilitator Login
            </button>
          )}
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
