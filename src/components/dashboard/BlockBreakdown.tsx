import React from 'react';
import { clsx } from 'clsx';
import type { BlockStats } from '@/components/dashboard/SessionOverview';

const BLOCK_META: Record<string, { label: string; color: string; bgBar: string; fgBar: string }> = {
  accounting:  { label: 'Accounting Essentials', color: 'bg-emerald-500', bgBar: 'bg-emerald-100', fgBar: 'bg-emerald-500' },
  investment:  { label: 'Future Security',       color: 'bg-blue-500',    bgBar: 'bg-blue-100',    fgBar: 'bg-blue-500' },
  management:  { label: 'Household Management',  color: 'bg-violet-500',  bgBar: 'bg-violet-100',  fgBar: 'bg-violet-500' },
  fintech:     { label: 'FinTech & Digital',      color: 'bg-pink-500',    bgBar: 'bg-pink-100',    fgBar: 'bg-pink-500' },
};

interface BlockBreakdownProps {
  blocks: BlockStats[];
  loading: boolean;
}

export const BlockBreakdown: React.FC<BlockBreakdownProps> = ({ blocks, loading }) => {
  // Sort by most active first
  const sorted = [...blocks].sort((a, b) => b.starts - a.starts);

  // Fill in missing blocks so all 4 always appear
  const allBlockIds = ['accounting', 'investment', 'management', 'fintech'];
  const presentIds = new Set(sorted.map((b) => b.block_id));
  const filled = [
    ...sorted,
    ...allBlockIds
      .filter((id) => !presentIds.has(id))
      .map((id) => ({ block_id: id, starts: 0, completions: 0, completion_pct: 0, avg_xp: 0, avg_score: 0 })),
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Block Breakdown</h2>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="space-y-2">
              <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
              <div className="h-2 w-full bg-slate-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Block Breakdown</h2>
      </div>

      <div className="divide-y divide-slate-100">
        {filled.map((block, i) => {
          const meta = BLOCK_META[block.block_id] ?? { label: block.block_id, color: 'bg-slate-500', bgBar: 'bg-slate-100', fgBar: 'bg-slate-500' };

          return (
            <div
              key={block.block_id}
              className="px-6 py-4 animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={clsx('w-2.5 h-2.5 rounded-full', meta.color)} />
                  <span className="text-sm font-semibold text-slate-900">{meta.label}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span><strong className="text-slate-700">{block.starts}</strong> started</span>
                  <span><strong className="text-slate-700">{block.completions}</strong> completed</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className={clsx('h-2 rounded-full w-full', meta.bgBar)}>
                <div
                  className={clsx('h-2 rounded-full transition-all duration-700 ease-out', meta.fgBar)}
                  style={{ width: `${Math.min(block.completion_pct, 100)}%` }}
                />
              </div>

              {/* Metrics row */}
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span>
                  Completion: <strong className={clsx(
                    block.completion_pct >= 80 ? 'text-emerald-600' : block.completion_pct >= 50 ? 'text-amber-600' : 'text-slate-600',
                  )}>{block.completion_pct}%</strong>
                </span>
                <span>Avg Score: <strong className="text-slate-600">{block.avg_score}%</strong></span>
                <span>Avg XP: <strong className="text-slate-600">{block.avg_xp}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
