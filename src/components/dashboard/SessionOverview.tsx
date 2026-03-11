import React from 'react';
import { Activity, BarChart3, TrendingUp, Users } from 'lucide-react';
import { clsx } from 'clsx';

export interface FacilitatorStats {
  total_today: number;
  active_now: number;
  avg_score: number;
  completion_rate: number;
  blocks: BlockStats[];
  recent_completions: RecentCompletion[];
}

export interface BlockStats {
  block_id: string;
  starts: number;
  completions: number;
  completion_pct: number;
  avg_xp: number;
  avg_score: number;
}

export interface RecentCompletion {
  block_id: string;
  total_xp: number;
  badges_earned: string[];
  completed_at: string;
  avg_score: number;
}

interface SessionOverviewProps {
  stats: FacilitatorStats | null;
  loading: boolean;
}

const CARDS = [
  {
    key: 'total_today',
    label: 'Sessions Today',
    icon: Users,
    color: 'text-blue-500',
    format: (v: number) => `${v}`,
  },
  {
    key: 'active_now',
    label: 'Active Now',
    icon: Activity,
    color: 'text-emerald-500',
    pulse: true,
    format: (v: number) => `${v}`,
  },
  {
    key: 'completion_rate',
    label: 'Completion Rate',
    icon: BarChart3,
    color: 'text-violet-500',
    format: (v: number) => `${v}%`,
  },
  {
    key: 'avg_score',
    label: 'Avg. Score',
    icon: TrendingUp,
    color: 'text-amber-500',
    format: (v: number) => `${v}%`,
    scoreColor: true,
  },
] as const;

export const SessionOverview: React.FC<SessionOverviewProps> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {CARDS.map((card, i) => {
        const Icon = card.icon;
        const value = stats ? (stats as unknown as Record<string, unknown>)[card.key] as number : 0;

        return (
          <div
            key={card.key}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 relative overflow-hidden group hover:shadow-md transition-shadow animate-slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Icon */}
            <div className="absolute top-4 right-4">
              <Icon className={clsx('w-5 h-5 opacity-40', card.color)} />
            </div>

            {/* Value */}
            {loading ? (
              <div className="h-9 w-20 bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <p className={clsx(
                'text-3xl font-extrabold mb-1',
                'scoreColor' in card && card.scoreColor
                  ? value >= 80 ? 'text-emerald-600' : value >= 60 ? 'text-amber-600' : 'text-red-500'
                  : 'text-slate-900',
              )}>
                {card.format(value)}
              </p>
            )}

            {/* Label */}
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              {card.label}
              {'pulse' in card && card.pulse && !loading && value > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
};
