import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { getBadge, TIER_COLORS } from '@/data/badges';

interface BadgePopupProps {
  badgeId: string | null;
  onDismiss: () => void;
}

/**
 * Full-screen overlay that celebrates a newly-earned badge.
 * Auto-dismisses after 4 s, or on click / Escape.
 */
export const BadgePopup: React.FC<BadgePopupProps> = ({ badgeId, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  const badge = badgeId ? getBadge(badgeId) : null;

  useEffect(() => {
    if (!badge) return;
    // Trigger enter animation on next frame
    requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300); // wait for exit animation
    }, 4000);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [badge, onDismiss]);

  if (!badge) return null;

  const Icon = badge.icon;
  const tierColor = TIER_COLORS[badge.tier];

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}
      onClick={() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Badge earned: ${badge.name}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div
        className={clsx(
          'relative bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 sm:p-10 max-w-sm w-[90%] text-center transition-transform duration-300',
          visible ? 'scale-100' : 'scale-90',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
          Badge Earned!
        </p>

        <div
          className={clsx(
            'w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-lg mb-5 animate-pop-in',
            tierColor.bg, tierColor.text,
          )}
        >
          <Icon className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 mb-1">{badge.name}</h2>
        <p className="text-sm text-slate-500 mb-4">{badge.description}</p>

        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          +{badge.xpReward} XP
        </div>
      </div>
    </div>
  );
};
