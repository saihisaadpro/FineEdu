import React, { useMemo, useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Code, FileText, Layers, Shield, Target } from 'lucide-react';
import { clsx } from 'clsx';
import { getBlockTemplates, getVariablePool } from '@/data/content/index';
import type { BlockId, ScenarioTemplate, StageNumber } from '@/types/content';

interface TemplateViewerProps {
  blockId: string;
}

export const TemplateViewer: React.FC<TemplateViewerProps> = ({ blockId }) => {
  const templates = useMemo(() => getBlockTemplates(blockId as BlockId), [blockId]);
  const [expandedStage, setExpandedStage] = useState<StageNumber | null>(1);

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No templates found for this block.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-600" />
          Stage Templates
        </h3>
        <span className="text-xs font-semibold text-slate-400">{templates.length} stages</span>
      </div>

      <div className="space-y-3">
        {templates.map((template) => {
          const isExpanded = expandedStage === template.stageNumber;
          const variablePool = getVariablePool(template.templateId);

          return (
            <div
              key={template.templateId}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              {/* Stage header — clickable */}
              <button
                type="button"
                onClick={() => setExpandedStage(isExpanded ? null : template.stageNumber as StageNumber)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-700 text-sm font-bold shrink-0">
                    {template.stageNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{template.stageTitle}</p>
                    <p className="text-xs text-slate-500 truncate">{template.pedagogicalGoal}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-slate-100 animate-fade-in">
                  <TemplateDetail template={template} variablePool={variablePool} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Detail view for a single template ──────────────────────────────

interface TemplateDetailProps {
  template: ScenarioTemplate;
  variablePool: ReturnType<typeof getVariablePool>;
}

const TemplateDetail: React.FC<TemplateDetailProps> = ({ template, variablePool }) => {
  return (
    <div className="p-4 space-y-5">
      {/* Setting & Role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoCard icon={BookOpen} label="Workplace Setting" value={template.workplaceSetting} />
        <InfoCard icon={Target} label="Learner Role" value={template.learnerRole} />
      </div>

      {/* Task Type */}
      <div className="bg-slate-50 rounded-lg p-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Task Type</p>
        <p className="text-sm text-slate-700">{template.taskType}</p>
      </div>

      {/* Question Patterns */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question Patterns ({template.questionPatterns.length})</p>
        <div className="flex flex-wrap gap-1.5">
          {template.questionPatterns.map((qp, i) => (
            <span
              key={i}
              className={clsx(
                'text-xs px-2 py-1 rounded border font-medium',
                qp.difficulty === 'easy'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : qp.difficulty === 'medium'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-red-50 text-red-700 border-red-200',
              )}
            >
              {qp.difficulty} · {qp.questionType} · {qp.focusArea}
            </span>
          ))}
        </div>
      </div>

      {/* Stage Gate */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" />
          Stage Gate
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <GateChip label="Pass %" value={`${template.stageGate.minCorrectPercent}%`} />
          <GateChip label="Retry" value={template.stageGate.canRetry ? 'Yes' : 'No'} />
          <GateChip label="Override" value={template.stageGate.facilitatorOverride ? 'Allowed' : 'No'} />
          {template.stageGate.requiredConcepts && (
            <GateChip
              label="Concepts"
              value={template.stageGate.requiredConcepts.join(', ')}
            />
          )}
        </div>
      </div>

      {/* Variable Pool */}
      {variablePool && variablePool.parameters.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Code className="w-3.5 h-3.5" />
            Variable Pool ({variablePool.parameters.length} parameters)
          </p>
          <div className="space-y-2">
            {variablePool.parameters.map((param) => (
              <div key={param.name} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700 font-mono">{`{{${param.name}}}`}</span>
                  <span className="text-xs text-slate-400">{param.values.length} values</span>
                </div>
                {param.constraints && (
                  <p className="text-xs text-slate-400 mb-1.5 italic">{param.constraints}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {param.values.map((v) => (
                    <span key={v.id} className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {String(v.value)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rubric (Stage 4 only) */}
      {template.stageNumber === 4 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evaluation Rubric</p>
          <p className="text-xs text-slate-500 italic">
            Rubric is embedded in the fallback scenario for this stage — AI evaluation uses criteria weights to assess free-text responses.
          </p>
        </div>
      )}

      {/* Prompt Skeleton */}
      <details className="text-xs">
        <summary className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors select-none font-semibold">
          Prompt Skeleton
        </summary>
        <pre className="mt-2 bg-slate-900 text-slate-300 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap text-xs leading-relaxed">
          {template.promptSkeleton}
        </pre>
      </details>

      {/* Interactive Components */}
      {template.interactiveComponents.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Interactive Components</p>
          <div className="flex flex-wrap gap-1.5">
            {template.interactiveComponents.map((ic, i) => (
              <span key={i} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-200 font-mono">
                {ic.component}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bridge Narrative Template */}
      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Bridge Narrative</p>
        <p className="text-xs text-amber-800 italic">{template.bridgeNarrativeTemplate}</p>
      </div>
    </div>
  );
};

// ── Small helper components ────────────────────────────────────────

const InfoCard: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="bg-slate-50 rounded-lg p-3 flex items-start gap-2">
    <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  </div>
);

const GateChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white rounded-lg border border-slate-200 px-3 py-2 text-center">
    <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
    <p className="text-sm font-bold text-slate-700">{value}</p>
  </div>
);
