import React, { useEffect, useRef, useState } from 'react';
import { Award, BookOpen, Play } from 'lucide-react';
import { clsx } from 'clsx';
import { supabase } from '@/services/supabase';
import type { RecentCompletion } from '@/components/dashboard/SessionOverview';

const BLOCK_LABELS: Record<string, string> = {
  accounting: 'Accounting Essentials',
  investment: 'Future Security',
  management: 'Household Management',
  fintech: 'FinTech & Digital',
};

interface FeedEvent {
  id: string;
  type: 'completion' | 'session_start';
  blockId: string;
  description: string;
  timestamp: string;
  icon: typeof Award;
  iconColor: string;
}

interface ActivityFeedProps {
  initialCompletions: RecentCompletion[];
  loading: boolean;
}

function formatTimeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function completionToEvent(c: RecentCompletion, index: number): FeedEvent {
  const label = BLOCK_LABELS[c.block_id] ?? c.block_id;
  const badges = c.badges_earned?.length
    ? ` — earned ${c.badges_earned.length} badge${c.badges_earned.length > 1 ? 's' : ''}`
    : '';
  return {
    id: `completion-${c.completed_at}-${index}`,
    type: 'completion',
    blockId: c.block_id,
    description: `Learner completed ${label} (Score: ${c.avg_score}%, XP: ${c.total_xp}${badges})`,
    timestamp: c.completed_at,
    icon: Award,
    iconColor: 'text-emerald-500 bg-emerald-50',
  };
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ initialCompletions, loading }) => {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const seenIds = useRef(new Set<string>());

  // Seed from initial data
  useEffect(() => {
    const initial = initialCompletions.map(completionToEvent);
    initial.forEach((e) => seenIds.current.add(e.id));
    setEvents(initial);
  }, [initialCompletions]);

  // Subscribe to Realtime for new block_completions and block_sessions
  useEffect(() => {
    const channel = supabase
      .channel('facilitator-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'block_completions' },
        (payload) => {
          const row = payload.new as {
            block_id: string;
            total_xp: number;
            badges_earned: string[];
            completed_at: string;
            scores: Record<string, number>;
          };
          const scores = Object.values(row.scores || {});
          const avgScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;
          const label = BLOCK_LABELS[row.block_id] ?? row.block_id;
          const badges = row.badges_earned?.length
            ? ` — earned ${row.badges_earned.length} badge${row.badges_earned.length > 1 ? 's' : ''}`
            : '';
          const ev: FeedEvent = {
            id: `rt-completion-${row.completed_at}-${Date.now()}`,
            type: 'completion',
            blockId: row.block_id,
            description: `Learner completed ${label} (Score: ${avgScore}%, XP: ${row.total_xp}${badges})`,
            timestamp: row.completed_at,
            icon: Award,
            iconColor: 'text-emerald-500 bg-emerald-50',
          };
          if (!seenIds.current.has(ev.id)) {
            seenIds.current.add(ev.id);
            setEvents((prev) => [ev, ...prev].slice(0, 50));
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'block_sessions' },
        (payload) => {
          const row = payload.new as { block_id: string; started_at: string };
          const label = BLOCK_LABELS[row.block_id] ?? row.block_id;
          const ev: FeedEvent = {
            id: `rt-session-${row.started_at}-${Date.now()}`,
            type: 'session_start',
            blockId: row.block_id,
            description: `New session started — ${label}`,
            timestamp: row.started_at,
            icon: Play,
            iconColor: 'text-blue-500 bg-blue-50',
          };
          if (!seenIds.current.has(ev.id)) {
            seenIds.current.add(ev.id);
            setEvents((prev) => [ev, ...prev].slice(0, 50));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h2>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
                <div className="h-2 w-1/4 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h2>
        <span className="text-xs text-slate-400">{events.length} events</span>
      </div>

      {events.length === 0 ? (
        <div className="p-8 text-center">
          <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No activity yet today.</p>
          <p className="text-xs text-slate-300 mt-1">Sessions will appear here as learners begin.</p>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
          {events.map((ev, i) => {
            const Icon = ev.icon;
            // Filter out events older than 24h
            const age = Date.now() - new Date(ev.timestamp).getTime();
            if (age > 86_400_000) return null;

            return (
              <div
                key={ev.id}
                className={clsx(
                  'flex items-start gap-3 px-6 py-3 hover:bg-slate-50 transition-colors',
                  i === 0 && 'animate-slide-up',
                )}
              >
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', ev.iconColor)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 leading-snug">{ev.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatTimeAgo(ev.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
