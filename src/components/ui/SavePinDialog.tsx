import React, { useState } from 'react';
import { KeyRound, Copy, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { savePinSession } from '@/services/pinSession';
import { useProgressStore } from '@/stores/progressStore';
import { useUserStore } from '@/stores/userStore';

interface SavePinDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SavePinDialog: React.FC<SavePinDialogProps> = ({ open, onClose }) => {
  const [pin, setPin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const setUserPin = useUserStore(s => s.setPin);
  const xp = useProgressStore(s => s.xp);
  const badges = useProgressStore(s => s.badges);
  const topicProgress = useProgressStore(s => s.topicProgress);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await savePinSession({ xp, badges, topicProgress });
      setPin(result.pin);
      setUserPin(result.pin);
    } catch (err) {
      setError('Failed to save progress. Please try again.');
      console.error('Save PIN error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!pin) return;
    await navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setPin(null);
    setError('');
    setCopied(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative animate-fade-in">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Save Your Progress</h2>
          <p className="text-sm text-slate-500 mt-1">
            Generate a PIN to resume your learning later.
          </p>
        </div>

        {!pin ? (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
              <p className="font-medium text-slate-700 mb-1">Your current progress:</p>
              <ul className="space-y-1">
                <li>XP earned: <span className="font-bold text-blue-600">{xp}</span></li>
                <li>Badges: <span className="font-bold text-blue-600">{badges.length}</span></li>
                <li>Topics started: <span className="font-bold text-blue-600">{Object.keys(topicProgress).length}</span></li>
              </ul>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button
              onClick={handleGenerate}
              className="w-full justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating…
                </>
              ) : (
                'Generate PIN'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-2">
                Your PIN
              </p>
              <p className="text-4xl font-black tracking-[0.5em] text-blue-700 font-mono">
                {pin}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
              <strong>Important:</strong> Write down this PIN! It will not be shown again.
              Use it on the Resume page to continue your learning.
            </div>

            <Button
              onClick={handleCopy}
              variant="secondary"
              className="w-full justify-center"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy PIN
                </>
              )}
            </Button>

            <Button onClick={handleClose} className="w-full justify-center">
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
