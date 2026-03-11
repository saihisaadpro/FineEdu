import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const ResumePage: React.FC = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setError('Please enter a valid PIN (at least 4 digits)');
      return;
    }
    // PIN resume will be connected in Phase 3 (Auth)
    // For now, redirect to dashboard
    setError('PIN resume is not yet available. Please start a new session.');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mb-4">
            <KeyRound className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Resume Session</h1>
          <p className="text-sm text-slate-500 mt-2">Enter your PIN to continue where you left off.</p>
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
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="• • • •"
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <Button type="submit" className="w-full justify-center" size="lg">
            Resume Learning
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
