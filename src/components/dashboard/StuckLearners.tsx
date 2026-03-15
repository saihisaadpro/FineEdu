import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Clock, RefreshCw, UserX } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '@/services/supabase';

/** Threshold in minutes before a session is considered "stuck". */
const STUCK_THRESHOLD_MINUTES = 15;

interface StuckSession {
  session_id: string;
  block_id: string;
  current_stage: number;
  started_at: string;
  minutes_on_stage: number;
  retry_count: number;
}

const BLOCK_LABELS: Record<string, string> = {
  accounting: 'Accounting',
  investment: 'Investment',
  management: 'Management',
  fintech: 'FinTech',
};

interface StuckLearnersProps {
  loading: boolean;
}

export const StuckLearners: React.FC<StuckLearnersProps> = ({ loading: parentLoading }) => {
  const [stuck, setStuck] = useState<StuckSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStuck = useCallback(async () => {
    setLoading(true);
    try {
      // Find active sessions that have been on the same stage beyond the threshold
      const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60_000).toISOString();
      const { data, error } = await supabase
        .from('block_sessions')
        .select('id, block_id, current_stage, started_at, updated_at, retry_count')
        .is('completed_at', null) // still active
        .lt('updated_at', cutoff)  // not updated recently
        .order('updated_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      setStuck(
        (data ?? []).map((row: { id: string; block_id: string; current_stage: number; started_at: string; updated_at: string; retry_count?: number }) => ({
          session_id: row.id,
          block_id: row.block_id,
          current_stage: row.current_stage,
          started_at: row.started_at,
          minutes_on_stage: Math.round((Date.now() - new Date(row.updated_at).getTime()) / 60_000),
          retry_count: row.retry_count ?? 0,
        })),
      );
    } catch (err) {
      console.error('Failed to fetch stuck learners:', err);
      // Silently fail — this is supplementary data
      setStuck([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStuck();
    const id = setInterval(fetchStuck, 60_000); // refresh every minute
    return () => clearInterval(id);
  }, [fetchStuck]);

  const isLoading = parentLoading || loading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (stuck.length === 0) {
    return (
      <div className="bg-emerald-50 rounded-2xl border border-emerald-200 px-4 py-3 flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-700">All learners progressing normally</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 rounded-2xl border border-amber-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-amber-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          Learners May Need Help
          <span className="text-xs font-semibold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
            {stuck.length}
          </span>
        </h3>
        <span className="text-xs text-amber-600">&gt; {STUCK_THRESHOLD_MINUTES} min on same stage</span>
      </div>

      <div className="divide-y divide-amber-100 max-h-48 overflow-y-auto">
        {stuck.map((s) => (
          <div key={s.session_id} className="px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <UserX className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-sm text-amber-900 font-medium">
                {BLOCK_LABELS[s.block_id] ?? s.block_id} — Stage {s.current_stage}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={clsx(
                'text-xs font-semibold flex items-center gap-1',
                s.minutes_on_stage > 30 ? 'text-red-600' : 'text-amber-600',
              )}>
                <Clock className="w-3 h-3" />
                {s.minutes_on_stage} min
              </span>
              {s.retry_count > 0 && (
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                  {s.retry_count} retries
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
