import React from 'react';
import { Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { useProgressStore } from '@/stores/progressStore';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

const LEVEL_COLORS = [
  'from-slate-400 to-slate-500',   // level 1
  'from-blue-400 to-blue-600',     // level 2
  'from-indigo-400 to-indigo-600', // level 3
  'from-violet-500 to-purple-600', // level 4
  'from-amber-400 to-orange-500',  // level 5+
];

function getLevelColor(level: number): string {
  return LEVEL_COLORS[Math.min(level - 1, LEVEL_COLORS.length - 1)];
}

/**
 * Persistent XP / level indicator.
 * Desktop: inline bar with level badge.  Mobile: compact pill.
 */
export const XPBar: React.FC = () => {
  const xp = useProgressStore((s) => s.xp);
  const animatedXP = useAnimatedNumber(xp);

  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const pct = Math.min(xpInLevel, 100);

  return (
    <>
      {/* Desktop bar */}
      <div className="hidden md:flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
        <div
          className={clsx(
            'w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-extrabold bg-gradient-to-br',
            getLevelColor(level),
          )}
        >
          {level}
        </div>

        <div className="flex-1 min-w-[120px]">
          <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
            <span>Level {level}</span>
            <span>{animatedXP} XP</span>
          </div>
          <div
            className="h-2 bg-slate-100 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={xpInLevel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${xp} experience points, level ${level}`}
          >
            <div
              className={clsx('h-full rounded-full bg-gradient-to-r transition-all duration-500', getLevelColor(level))}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mobile pill */}
      <div
        className={clsx(
          'md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold bg-gradient-to-r shadow-sm',
          getLevelColor(level),
        )}
        role="status"
        aria-label={`Level ${level}, ${xp} experience points`}
      >
        <span>Lv.{level}</span>
        <Zap className="w-3 h-3 fill-current" />
        <span>{animatedXP}</span>
      </div>
    </>
  );
};
