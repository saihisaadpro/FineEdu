import React from 'react';
import { Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { BADGES, TIER_COLORS, type BadgeDefinition } from '@/data/badges';
import { useProgressStore } from '@/stores/progressStore';

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, earned }) => {
  const Icon = badge.icon;
  const tierColor = TIER_COLORS[badge.tier];

  return (
    <div
      className={clsx(
        'relative flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all duration-300',
        earned
          ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
          : 'bg-slate-50 border-slate-100 opacity-50',
      )}
    >
      <div
        className={clsx(
          'w-12 h-12 rounded-xl flex items-center justify-center transition-transform',
          earned ? `${tierColor.bg} ${tierColor.text} shadow-sm` : 'bg-slate-200 text-slate-400',
        )}
      >
        {earned ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
      </div>

      <p className={clsx('text-xs font-bold leading-tight', earned ? 'text-slate-900' : 'text-slate-400')}>
        {badge.name}
      </p>

      <p className={clsx('text-[10px] leading-snug', earned ? 'text-slate-500' : 'text-slate-300')}>
        {badge.description}
      </p>

      {earned && (
        <span
          className={clsx(
            'absolute -top-1.5 -right-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border',
            badge.tier === 'gold'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : badge.tier === 'silver'
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'bg-orange-50 text-orange-700 border-orange-200',
          )}
        >
          {badge.tier}
        </span>
      )}
    </div>
  );
};

/**
 * Grid display of all badges – earned ones are highlighted, unearned are greyed/locked.
 */
export const BadgeShelf: React.FC = () => {
  const earnedIds = useProgressStore((s) => s.badges);
  const earnedSet = new Set(earnedIds);
  const earnedCount = earnedIds.length;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          Achievements{' '}
          <span className="text-sm font-medium text-slate-400">
            {earnedCount}/{BADGES.length}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {BADGES.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} earned={earnedSet.has(badge.id)} />
        ))}
      </div>
    </section>
  );
};
