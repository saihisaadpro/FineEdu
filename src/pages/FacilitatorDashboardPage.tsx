import React, { useCallback, useEffect, useState } from 'react';
import { Download, RefreshCw, Trash2, UnlockKeyhole } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/services/supabase';
import { SessionOverview, type FacilitatorStats } from '@/components/dashboard/SessionOverview';
import { BlockBreakdown } from '@/components/dashboard/BlockBreakdown';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { useGateOverrideStore } from '@/stores/gateOverrideStore';

const POLL_INTERVAL = 30_000; // 30s fallback polling

export const FacilitatorDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<FacilitatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const gateOverride = useGateOverrideStore((s) => s.enabled);
  const toggleGateOverride = useGateOverrideStore((s) => s.toggle);

  const fetchStats = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const { data, error } = await supabase.rpc('facilitator_stats');
      if (error) throw error;
      setStats(data as FacilitatorStats);
    } catch (err) {
      console.error('Failed to fetch facilitator stats:', err);
      // Don't toast on background polls
      if (showSpinner) toast.error('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fallback polling
  useEffect(() => {
    const id = setInterval(() => fetchStats(false), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchStats]);

  const handleRefresh = () => fetchStats(true);

  const handleResetSessions = async () => {
    setShowResetConfirm(false);
    try {
      const { error } = await supabase
        .from('block_sessions')
        .delete()
        .gte('started_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());
      if (error) throw error;
      toast.success("Today's sessions cleared");
      fetchStats(true);
    } catch {
      toast.error('Failed to reset sessions');
    }
  };

  const handleExport = () => {
    toast.info('Export coming in production — data will be available as CSV');
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">Facilitator Dashboard</h1>
        <p className="text-sm text-slate-500">Real-time overview of learner activity and performance.</p>
      </div>

      {/* Session Overview (4 stat cards) */}
      <section className="mb-6">
        <SessionOverview stats={stats} loading={loading} />
      </section>

      {/* Main content: Block Breakdown + Activity Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <BlockBreakdown blocks={stats?.blocks ?? []} loading={loading} />
        <ActivityFeed initialCompletions={stats?.recent_completions ?? []} loading={loading} />
      </section>

      {/* Quick Actions bar */}
      <section className="sticky bottom-0 z-10 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] -mx-4 sm:-mx-6 md:-mx-10 px-4 sm:px-6 md:px-10 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-3">
            {/* Reset sessions */}
            <div className="relative">
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="w-full sm:w-auto justify-center"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Reset Sessions</span>
                <span className="sm:hidden">Reset</span>
              </Button>

              {/* Confirmation popover */}
              {showResetConfirm && (
                <div className="absolute bottom-full mb-2 left-0 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-20 animate-slide-up">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Clear today's sessions?</p>
                  <p className="text-xs text-slate-500 mb-3">This will remove all anonymous block sessions created today. This cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="danger" onClick={handleResetSessions} className="flex-1 justify-center">
                      Confirm
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowResetConfirm(false)} className="flex-1 justify-center">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Export */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              className="w-full sm:w-auto justify-center"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Export Data</span>
              <span className="sm:hidden">Export</span>
            </Button>

            {/* Gate Override */}
            <button
              type="button"
              onClick={toggleGateOverride}
              className={clsx(
                'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all border',
                gateOverride
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
              )}
            >
              <UnlockKeyhole className="w-4 h-4" />
              <span className="hidden sm:inline">Gate Override {gateOverride ? 'ON' : 'OFF'}</span>
              <span className="sm:hidden">{gateOverride ? 'Gates OFF' : 'Gates ON'}</span>
              <div className={clsx(
                'w-8 h-4 rounded-full relative transition-colors',
                gateOverride ? 'bg-amber-400' : 'bg-slate-300',
              )}>
                <div className={clsx(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform',
                  gateOverride ? 'translate-x-4' : 'translate-x-0.5',
                )} />
              </div>
            </button>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              isLoading={refreshing}
              className="w-full sm:w-auto justify-center border border-slate-200"
            >
              <RefreshCw className={clsx('w-4 h-4 mr-1.5', refreshing && 'animate-spin')} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
