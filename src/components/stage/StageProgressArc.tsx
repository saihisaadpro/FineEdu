import React from 'react';
import { CheckCircle2, Lock, Circle } from 'lucide-react';
import { clsx } from 'clsx';
import type { StageNumber } from '@/types/content';
import { useBlockSessionStore } from '@/stores/blockSessionStore';

interface StageProgressArcProps {
  currentStage: StageNumber;
}

const STAGE_LABELS = ['Discover', 'Apply', 'Analyse', 'Synthesise'] as const;

/**
 * 4-step horizontal stepper (responsive).
 * States per step: completed (green), current (blue pulse), locked (grey).
 */
export const StageProgressArc: React.FC<StageProgressArcProps> = ({ currentStage }) => {
  const stagesCompleted = useBlockSessionStore((s) => s.activeSession?.stagesCompleted ?? []);

  return (
    <div className="flex items-center gap-1 sm:gap-2 mb-8" role="list" aria-label="Stage progress">
      {([1, 2, 3, 4] as StageNumber[]).map((stage, i) => {
        const completed = stagesCompleted.includes(stage);
        const isCurrent = stage === currentStage && !completed;
        const locked = stage > currentStage && !completed;

        return (
          <React.Fragment key={stage}>
            {/* Connector line (not before first) */}
            {i > 0 && (
              <div
                className={clsx(
                  'flex-1 h-0.5 rounded-full transition-colors duration-300',
                  stagesCompleted.includes(stage - 1 as StageNumber) ? 'bg-emerald-400' : 'bg-slate-200',
                )}
              />
            )}

            {/* Step node */}
            <div
              className="flex flex-col items-center gap-1.5 min-w-0"
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div
                className={clsx(
                  'w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                  completed && 'bg-emerald-500 border-emerald-500 text-white shadow-sm',
                  isCurrent && 'bg-blue-50 border-blue-500 text-blue-600 animate-pulse',
                  locked && 'bg-slate-50 border-slate-200 text-slate-300',
                )}
              >
                {completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : locked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4 fill-current" />
                )}
              </div>
              <span
                className={clsx(
                  'text-[10px] sm:text-xs font-semibold truncate max-w-[60px] sm:max-w-none text-center',
                  completed && 'text-emerald-600',
                  isCurrent && 'text-blue-600',
                  locked && 'text-slate-300',
                )}
              >
                {STAGE_LABELS[i]}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
