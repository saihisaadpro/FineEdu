import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, Download, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/services/supabase';

interface BlockStats {
  block_id: string;
  total_sessions: number;
  total_completions: number;
  avg_score: number;
  completion_rate: number;
  stage_scores: { stage_number: number; attempts: number; correct_count: number; accuracy_pct: number }[];
  hard_questions: { question_id: string; attempts: number; correct_answers: number; pass_rate: number }[];
  scenarios_generated: number;
  scenarios_flagged: number;
  confidence_delta: number;
}

interface ContentAnalyticsProps {
  blockId: string;
  blockName: string;
}

export const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({ blockId, blockName }) => {
  const [stats, setStats] = useState<BlockStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('module_lead_block_stats', { p_block_id: blockId });
      if (error) throw error;
      setStats(data as BlockStats);
    } catch (err) {
      console.error('Failed to fetch block stats:', err);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [blockId]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleExport = () => {
    if (!stats) return;
    const rows: string[] = [
      ['Metric', 'Value'].join(','),
      ['Block', blockName].join(','),
      ['Total Sessions', String(stats.total_sessions)].join(','),
      ['Total Completions', String(stats.total_completions)].join(','),
      ['Avg Score (%)', String(stats.avg_score)].join(','),
      ['Completion Rate (%)', String(stats.completion_rate)].join(','),
      ['Confidence Delta', String(stats.confidence_delta)].join(','),
      ['Scenarios Generated', String(stats.scenarios_generated)].join(','),
      ['Scenarios Flagged', String(stats.scenarios_flagged)].join(','),
      '',
      ['Stage', 'Attempts', 'Correct', 'Accuracy (%)'].join(','),
      ...stats.stage_scores.map(s =>
        [s.stage_number, s.attempts, s.correct_count, s.accuracy_pct].join(','),
      ),
      '',
      ['Question', 'Attempts', 'Correct', 'Pass Rate (%)'].join(','),
      ...stats.hard_questions.map(q =>
        [q.question_id, q.attempts, q.correct_answers, q.pass_rate].join(','),
      ),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${blockId}-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics exported as CSV');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Sessions', value: stats.total_sessions, icon: Users, colour: 'text-blue-600 bg-blue-50' },
    { label: 'Completions', value: stats.total_completions, icon: BarChart3, colour: 'text-green-600 bg-green-50' },
    { label: 'Avg Score', value: `${stats.avg_score}%`, icon: TrendingUp, colour: 'text-indigo-600 bg-indigo-50' },
    { label: 'Completion Rate', value: `${stats.completion_rate}%`, icon: TrendingDown, colour: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          {blockName} Analytics
        </h3>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1.5" /> Export
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center mb-2', card.colour)}>
              <card.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Confidence Delta */}
      {stats.confidence_delta !== 0 && (
        <div className={clsx(
          'rounded-xl border p-4 flex items-center gap-3',
          stats.confidence_delta > 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200',
        )}>
          {stats.confidence_delta > 0
            ? <TrendingUp className="w-5 h-5 text-green-600" />
            : <TrendingDown className="w-5 h-5 text-amber-600" />
          }
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Confidence Delta: {stats.confidence_delta > 0 ? '+' : ''}{stats.confidence_delta} points
            </p>
            <p className="text-xs text-slate-500">Average pre/post confidence survey change across all learners</p>
          </div>
        </div>
      )}

      {/* Stage-by-Stage Accuracy */}
      {stats.stage_scores.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Stage Performance</h4>
          <div className="space-y-2">
            {stats.stage_scores.map(stage => (
              <div key={stage.stage_number} className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-4">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded w-16 text-center shrink-0">
                  Stage {stage.stage_number}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500">{stage.attempts} attempts</span>
                    <span className="font-bold text-slate-700">{stage.accuracy_pct}% accuracy</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-700',
                        stage.accuracy_pct >= 80 ? 'bg-green-500' : stage.accuracy_pct >= 60 ? 'bg-amber-500' : 'bg-red-500',
                      )}
                      style={{ width: `${stage.accuracy_pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hardest Questions */}
      {stats.hard_questions.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Hardest Questions (lowest pass rate)</h4>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="text-left px-4 py-2 font-medium">Question</th>
                  <th className="text-right px-4 py-2 font-medium">Attempts</th>
                  <th className="text-right px-4 py-2 font-medium">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.hard_questions.map(q => (
                  <tr key={q.question_id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2 text-slate-700 font-mono text-xs">{q.question_id}</td>
                    <td className="px-4 py-2 text-right text-slate-500">{q.attempts}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={clsx(
                        'text-xs font-bold px-2 py-0.5 rounded',
                        q.pass_rate >= 60 ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50',
                      )}>
                        {q.pass_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generation Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium mb-1">Scenarios Generated</p>
          <p className="text-xl font-bold text-slate-900">{stats.scenarios_generated}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium mb-1">Flagged for Review</p>
          <p className={clsx('text-xl font-bold', stats.scenarios_flagged > 0 ? 'text-amber-600' : 'text-slate-900')}>
            {stats.scenarios_flagged}
          </p>
        </div>
      </div>
    </div>
  );
};
