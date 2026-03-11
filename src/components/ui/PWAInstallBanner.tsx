import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'wrf-pwa-dismissed';
const DISMISS_DAYS = 7;

function isDismissed(): boolean {
  const ts = localStorage.getItem(DISMISS_KEY);
  if (!ts) return false;
  return Date.now() - Number(ts) < DISMISS_DAYS * 86_400_000;
}

/**
 * "Add to Home Screen" install banner.
 * - Chromium: intercepts `beforeinstallprompt` and triggers native prompt
 * - iOS Safari: shows manual instructions (no API support)
 */
export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Already installed as standalone?
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (isDismissed()) return;

    // Detect iOS Safari
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as unknown as Record<string, unknown>).MSStream;
    setIsIOS(ios);
    if (ios) {
      setShowBanner(true);
      return;
    }

    // Chromium install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-4 flex items-center gap-4 pointer-events-auto animate-slide-up">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
          <Download className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900">Add WorkReady Finance to your home screen</p>
          {isIOS ? (
            <p className="text-xs text-slate-500 mt-0.5">
              Tap <span className="font-semibold">Share</span> → <span className="font-semibold">Add to Home Screen</span>
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-0.5">Get the best experience with quick access</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isIOS && (
            <button
              type="button"
              onClick={handleInstall}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Install
            </button>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
