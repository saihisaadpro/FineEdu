import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Eye, EyeOff, FileText, RefreshCw, Search, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/services/supabase';

interface ScenarioRecord {
  id: string;
  template_id: string;
  variable_hash: string;
  scenario_data: {
    scenarioBrief?: string;
    questions?: { id: string; text: string }[];
    variablesUsed?: Record<string, string>;
  };
  flagged_for_review: boolean;
  is_published: boolean;
  serve_count: number;
  generated_at: string;
}

interface ScenarioManagerProps {
  blockId: string;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({ blockId }) => {
  const [scenarios, setScenarios] = useState<ScenarioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'unpublished'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchScenarios = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('generated_scenarios')
        .select('*')
        .like('template_id', `${blockId.substring(0, 3)}%`)
        .order('generated_at', { ascending: false })
        .limit(50);

      if (filter === 'flagged') query = query.eq('flagged_for_review', true);
      if (filter === 'unpublished') query = query.eq('is_published', false);

      const { data, error } = await query;
      if (error) throw error;
      setScenarios((data ?? []) as ScenarioRecord[]);
    } catch (err) {
      console.error('Failed to fetch scenarios:', err);
      toast.error('Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  }, [blockId, filter]);

  useEffect(() => { fetchScenarios(); }, [fetchScenarios]);

  const togglePublish = async (scenario: ScenarioRecord) => {
    try {
      const { error } = await supabase
        .from('generated_scenarios')
        .update({ is_published: !scenario.is_published })
        .eq('id', scenario.id);
      if (error) throw error;
      setScenarios(prev => prev.map(s => s.id === scenario.id ? { ...s, is_published: !s.is_published } : s));
      toast.success(scenario.is_published ? 'Scenario unpublished' : 'Scenario published');
    } catch {
      toast.error('Failed to update scenario');
    }
  };

  const filteredScenarios = scenarios.filter(s => {
    if (!searchTerm) return true;
    const brief = s.scenario_data?.scenarioBrief ?? '';
    return brief.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stageFromTemplate = (templateId: string): number => {
    const match = templateId.match(/stage_(\d)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Generated Scenarios
        </h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="ghost" size="sm" onClick={fetchScenarios}>
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(['all', 'flagged', 'unpublished'] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize',
              filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {f} {f === 'flagged' && scenarios.filter(s => s.flagged_for_review).length > 0 && (
              <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px]">
                {scenarios.filter(s => s.flagged_for_review).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredScenarios.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No scenarios found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredScenarios.map(scenario => (
            <div
              key={scenario.id}
              className={clsx(
                'bg-white rounded-xl border p-4 transition-all',
                scenario.flagged_for_review ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200',
                !scenario.is_published && 'opacity-60',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Stage {stageFromTemplate(scenario.template_id)}
                    </span>
                    {scenario.flagged_for_review && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Flagged
                      </span>
                    )}
                    {!scenario.is_published && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Unpublished
                      </span>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(scenario.generated_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-400">
                      Served {scenario.serve_count}×
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">
                    {scenario.scenario_data?.scenarioBrief ?? 'No brief available'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title={scenario.is_published ? 'Unpublish' : 'Publish'}
                    onClick={() => togglePublish(scenario)}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      scenario.is_published
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-slate-400 hover:bg-slate-50',
                    )}
                  >
                    {scenario.is_published ? <CheckCircle className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === scenario.id ? null : scenario.id)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"
                    title="Preview"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded preview */}
              {expandedId === scenario.id && (
                <div className="mt-3 pt-3 border-t border-slate-100 animate-fade-in">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Scenario Brief</h4>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{scenario.scenario_data?.scenarioBrief}</p>
                    </div>
                    {scenario.scenario_data?.variablesUsed && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Variables Used</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(scenario.scenario_data.variablesUsed).map(([k, v]) => (
                            <span key={k} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                              {k}: <b>{v}</b>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {scenario.scenario_data?.questions && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Questions ({scenario.scenario_data.questions.length})
                        </h4>
                        <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                          {scenario.scenario_data.questions.map(q => (
                            <li key={q.id}>{q.text}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
