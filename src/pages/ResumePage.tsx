import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { KeyRound, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { loadPinSession } from '@/services/pinSession';
import { useProgressStore } from '@/stores/progressStore';
import { useUserStore } from '@/stores/userStore';

const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 60;

export const ResumePage: React.FC = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(null);

  const setRole = useUserStore(s => s.setRole);
  const updateTopicProgress = useProgressStore(s => s.updateTopicProgress);
  const addXP = useProgressStore(s => s.addXP);
  const awardBadge = useProgressStore(s => s.awardBadge);

  const startLockout = useCallback(() => {
    const unlockTime = Date.now() + LOCKOUT_SECONDS * 1000;
    setLockedUntil(unlockTime);
    setCountdown(LOCKOUT_SECONDS);

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((unlockTime - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setLockedUntil(null);
        setAttempts(0);
        setError('');
      }
    }, 1000);
  }, []);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) return;

    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const sessionData = await loadPinSession(pin);

      if (!sessionData) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          startLockout();
          setError(`Too many failed attempts. Please wait ${LOCKOUT_SECONDS} seconds.`);
        } else {
          setError(`PIN not recognised. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? '' : 's'} remaining.`);
        }
        return;
      }

      // Restore progress into Zustand stores
      if (sessionData.xp) addXP(sessionData.xp);
      if (sessionData.badges) {
        for (const badge of sessionData.badges) awardBadge(badge);
      }
      if (sessionData.topicProgress) {
        for (const [topicId, progress] of Object.entries(sessionData.topicProgress)) {
          updateTopicProgress(topicId, progress as Record<string, unknown>);
        }
      }

      // Set role to pin_learner and navigate to dashboard
      setRole('pin_learner');
      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('PIN resume error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Resume Session</h1>
          <p className="text-sm text-slate-500 mt-2">Enter your 4-digit PIN to continue where you left off.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pin-input" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
              Your PIN
            </label>
            <input
              id="pin-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              disabled={isLocked || loading}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="• • • •"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}{isLocked && countdown > 0 ? ` (${countdown}s)` : ''}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full justify-center"
            size="lg"
            disabled={isLocked || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Verifying…
              </>
            ) : isLocked ? (
              `Locked (${countdown}s)`
            ) : (
              'Resume Learning'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-slate-500 hover:text-blue-600 transition-colors"
          >
            Start a new session instead
          </button>
        </div>
      </div>
    </div>
  );
};
