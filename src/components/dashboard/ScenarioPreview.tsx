import React, { useState } from 'react';
import { Eye, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { getStageResources } from '@/data/content/index';
import { generateScenario } from '@/services/scenarioGenerator';
import type { GeneratedScenario } from '@/types/content';

interface ScenarioPreviewProps {
  blockId: string;
  stageNumber: number;
}

export const ScenarioPreview: React.FC<ScenarioPreviewProps> = ({ blockId, stageNumber }) => {
  const [scenario, setScenario] = useState<GeneratedScenario | null>(null);
  const [loading, setLoading] = useState(false);

  const prefix = { accounting: 'acc', investment: 'inv', management: 'mgt', fintech: 'fin' }[blockId] ?? blockId.substring(0, 3);
  const topicId = `${prefix}_${stageNumber}`;

  const handleGenerate = async () => {
    const resources = getStageResources(topicId);
    if (!resources) {
      toast.error('Stage resources not found');
      return;
    }

    setLoading(true);
    try {
      const mockSession = {
        sessionId: 'preview',
        blockId,
        startedAt: new Date().toISOString(),
        currentStage: stageNumber,
        stagesCompleted: [],
        generatedContext: {},
        totalXP: 0,
        isReplay: false,
      };

      const result = await generateScenario(
        resources.template,
        resources.variablePool,
        mockSession,
        resources.fallback,
      );
      setScenario({ ...result, generationSource: 'preview' });
      toast.success(
        result.generationSource === 'fallback' || result.generationSource === 'fallback-after-error'
          ? 'Showing fallback scenario (no API configured)'
          : 'Fresh scenario generated',
      );
    } catch {
      toast.error('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-600" />
          Scenario Preview — Stage {stageNumber}
        </h4>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleGenerate}
          isLoading={loading}
        >
          {scenario ? <RefreshCw className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
          {scenario ? 'Regenerate' : 'Preview'}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-sm">Generating scenario preview...</span>
        </div>
      )}

      {scenario && !loading && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700">
              {scenario.generationSource === 'fallback' || scenario.generationSource === 'fallback-after-error'
                ? 'Fallback Scenario'
                : scenario.generationSource === 'ai-live'
                  ? 'AI-Generated Scenario'
                  : 'Preview Scenario'}
            </span>
            <span className="text-xs text-blue-500">
              Instance: {scenario.instanceId.substring(0, 8)}...
            </span>
          </div>

          {/* Brief */}
          <div className="p-4 border-b border-slate-100">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Scenario Brief</h5>
            <p className="text-sm text-slate-700 whitespace-pre-line">{scenario.scenarioBrief}</p>
          </div>

          {/* Variables */}
          {Object.keys(scenario.variablesUsed).length > 0 && (
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Variables</h5>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(scenario.variablesUsed).map(([k, v]) => (
                  <span key={k} className="text-xs bg-white text-slate-600 px-2 py-1 rounded border border-slate-200">
                    <span className="text-slate-400">{k}:</span> <b>{v}</b>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Task Items */}
          {scenario.taskData.items.length > 0 && (
            <div className="p-4 border-b border-slate-100">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Task ({scenario.taskData.type})
              </h5>
              <div className="space-y-1.5">
                {scenario.taskData.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="text-xs font-mono text-slate-400 w-8">{item.id}</span>
                    <span className="text-slate-700">{item.label}</span>
                    {item.category && <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{item.category}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="p-4">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Questions ({scenario.questions.length})
            </h5>
            <div className="space-y-3">
              {scenario.questions.map((q, idx) => (
                <div key={q.id} className="text-sm">
                  <p className="font-medium text-slate-800 mb-1">
                    {idx + 1}. {q.text}
                    <span className="ml-2 text-xs text-slate-400">({q.difficulty})</span>
                  </p>
                  <div className="ml-4 space-y-0.5">
                    {q.options.map((opt, oi) => (
                      <p key={oi} className={oi === q.correctAnswerIndex ? 'text-green-700 font-semibold' : 'text-slate-500'}>
                        {String.fromCharCode(65 + oi)}. {opt} {oi === q.correctAnswerIndex && '✓'}
                      </p>
                    ))}
                  </div>
                  <p className="ml-4 mt-1 text-xs text-slate-400 italic">{q.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
