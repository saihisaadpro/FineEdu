import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { BookOpen, CheckCircle, ChevronRight, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { MODULES } from '@/data/modules';
import { useProgressStore } from '@/stores/progressStore';
import { NotFoundPage } from '@/pages/NotFoundPage';

const STAGE_LABELS = ['Discover', 'Apply', 'Analyse', 'Synthesise'] as const;

export const ModulePage: React.FC = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const module = MODULES.find(m => m.id === moduleId);
  const topicProgress = useProgressStore((s) => s.topicProgress);

  if (!module) return <NotFoundPage />;

  // Determine which stages are unlocked (sequential: complete stage N to unlock N+1)
  const getStageStatus = (index: number): 'completed' | 'current' | 'locked' => {
    const topic = module.topics[index];
    if (topicProgress[topic.id]?.completed) return 'completed';
    // First stage is always unlocked; others require previous to be completed
    if (index === 0) return 'current';
    const prevTopic = module.topics[index - 1];
    if (topicProgress[prevTopic.id]?.completed) return 'current';
    return 'locked';
  };

  const completedCount = module.topics.filter((t) => topicProgress[t.id]?.completed).length;
  const progressPercent = Math.round((completedCount / module.topics.length) * 100);

  const handleSelectTopic = (topicId: string, index: number) => {
    const status = getStageStatus(index);
    if (status === 'locked') return;
    navigate(`/topic/${topicId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto animate-zoom-in">
      <button type="button" onClick={handleBackToDashboard} className="md:hidden mb-6 text-sm font-medium text-slate-500 flex items-center">
        <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back
      </button>
      <div className="mb-10">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-3">
          Module Lead: {module.lead}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 sm:mb-4">{module.title}</h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">{module.description}</p>

        {/* Overall progress bar */}
        {completedCount > 0 && (
          <div className="mt-4 max-w-md">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
              <span>{completedCount}/{module.topics.length} stages complete</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div data-tour="stage-list" className="grid gap-4 sm:grid-cols-2">
        {module.topics.map((topic, index) => {
          const status = getStageStatus(index);
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';
          const score = topicProgress[topic.id]?.score;
          const total = topicProgress[topic.id]?.totalQuestions;

          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => handleSelectTopic(topic.id, index)}
              disabled={isLocked}
              className={clsx(
                'group relative flex flex-col bg-white p-6 rounded-2xl shadow-sm border text-left transition-all duration-300 ease-out overflow-hidden',
                isLocked
                  ? 'border-slate-100 opacity-60 cursor-not-allowed'
                  : isCompleted
                    ? 'border-emerald-200 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 cursor-pointer'
                    : 'border-slate-200 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] cursor-pointer',
              )}
            >
              {/* Decorative background icon */}
              <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-110 group-hover:rotate-6 duration-700 ease-in-out pointer-events-none">
                <BookOpen className="w-32 h-32" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      'text-xs font-bold tracking-wider uppercase',
                      isCompleted ? 'text-emerald-500' : isLocked ? 'text-slate-300' : 'text-slate-400',
                    )}>
                      Stage {index + 1} — {STAGE_LABELS[index]}
                    </span>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {isLocked && (
                    <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                </div>

                <h3 className={clsx(
                  'text-xl font-bold mb-2 transition-colors duration-300',
                  isCompleted ? 'text-emerald-800' : isLocked ? 'text-slate-400' : 'text-slate-900 group-hover:text-blue-600',
                )}>
                  {topic.title}
                </h3>

                {/* Score badge for completed stages */}
                {isCompleted && score != null && total != null && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
                    {score}/{total} correct
                  </div>
                )}

                {!isLocked && (
                  <div className={clsx(
                    'flex items-center font-medium text-sm mt-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out delay-75',
                    isCompleted ? 'text-emerald-600' : 'text-blue-600',
                  )}>
                    {isCompleted ? 'Replay Stage' : 'Start Mission'}{' '}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}

                {isLocked && (
                  <p className="text-xs text-slate-400 mt-3">
                    Complete Stage {index} to unlock
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
