import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ShieldCheck, X } from 'lucide-react';

const CONSENT_KEY = 'wrf-gdpr-consent';

/** Check whether the user has already accepted the GDPR consent. */
export const hasGDPRConsent = (): boolean =>
  localStorage.getItem(CONSENT_KEY) === 'accepted';

/** Record consent acceptance in localStorage (Supabase metadata is set by useAuth). */
export const acceptGDPRConsent = (): void =>
  localStorage.setItem(CONSENT_KEY, 'accepted');

/**
 * Full-width GDPR consent banner shown at the bottom of the viewport.
 *
 * Rules:
 *  - Appears on first visit BEFORE any anonymous Supabase session is created.
 *  - "Accept & Continue" stores consent and triggers the onConsent callback
 *    which lets useAuth proceed with session creation.
 *  - "Learn More" links to the /privacy page.
 *  - Does not render after consent has been given.
 */
export const ConsentBanner: React.FC<{ onConsent: () => void }> = ({ onConsent }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if consent hasn't been given yet
    if (!hasGDPRConsent()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    acceptGDPRConsent();
    setVisible(false);
    onConsent();
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie and privacy consent"
      className="fixed bottom-0 inset-x-0 z-[60] animate-slide-up"
    >
      <div className="bg-white border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon + Text */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Your Privacy Matters</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                WorkReady Finance collects anonymous session data to track your learning progress and improve the platform.
                No personal information is stored.{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
                  Learn more
                </Link>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 active:scale-95"
            >
              Accept &amp; Continue
            </button>
            <Link
              to="/privacy"
              className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors px-3 py-2.5"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
