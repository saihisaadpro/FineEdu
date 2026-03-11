import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, ChevronRight, Loader2, Play, RefreshCw, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { AIChat } from '@/components/chat/AIChat';
import { FreeTextWithAIEval } from '@/components/assessment/FreeTextWithAIEval';
import { getStageResources } from '@/data/content/index';
import { generateScenario } from '@/services/scenarioGenerator';
import { useBlockSessionStore } from '@/stores/blockSessionStore';
import { useProgressStore } from '@/stores/progressStore';
import type { GeneratedScenario, GeneratedQuestion, StageNumber, BlockId } from '@/types/content';

interface StageViewProps {
  topicId: string;
  moduleTitle: string;
  onBack: () => void;
  onNextStage: (nextTopicId: string) => void;
  onBlockComplete: () => void;
}

/** XP per correct answer */
const XP_PER_CORRECT = 10;
const XP_STAGE_BONUS = 25;

export const StageView: React.FC<StageViewProps> = ({
  topicId,
  moduleTitle,
  onBack,
  onNextStage,
  onBlockComplete,
}) => {
  const resources = useMemo(() => getStageResources(topicId), [topicId]);
  const activeSession = useBlockSessionStore((s) => s.activeSession);
  const startBlock = useBlockSessionStore((s) => s.startBlock);
  const completeStage = useBlockSessionStore((s) => s.completeStage);
  const addXP = useProgressStore((s) => s.addXP);
  const updateTopicProgress = useProgressStore((s) => s.updateTopicProgress);

  const [scenario, setScenario] = useState<GeneratedScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'brief' | 'task' | 'results' | 'bridge'>('brief');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanations, setShowExplanations] = useState(false);
  const [freeTextResponse, setFreeTextResponse] = useState('');
  const [freeTextPassed, setFreeTextPassed] = useState(false);

  // Ensure we have a block session running
  useEffect(() => {
    if (resources && (!activeSession || activeSession.blockId !== resources.blockId)) {
      startBlock(resources.blockId);
    }
  }, [resources, activeSession, startBlock]);

  // Generate scenario on mount
  useEffect(() => {
    if (!resources) return;
    let cancelled = false;

    const generate = async () => {
      setLoading(true);
      const session = useBlockSessionStore.getState().activeSession;
      if (!session) return;

      const result = await generateScenario(
        resources.template,
        resources.variablePool,
        session,
        resources.fallback,
      );

      if (!cancelled) {
        setScenario(result);
        setLoading(false);
      }
    };

    generate();
    return () => { cancelled = true; };
  }, [resources]);

  const handleSelectAnswer = useCallback((questionId: string, answerIndex: number) => {
    if (showExplanations) return; // already submitted
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  }, [showExplanations]);

  const handleSubmitAnswers = () => {
    setShowExplanations(true);
  };

  const correctCount = useMemo(() => {
    if (!scenario) return 0;
    return scenario.questions.reduce((count, q) => {
      return count + (selectedAnswers[q.id] === q.correctAnswerIndex ? 1 : 0);
    }, 0);
  }, [scenario, selectedAnswers]);

  const totalQuestions = scenario?.questions.length ?? 0;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isFreeTextStage = scenario?.taskData.type === 'free-text';
  const stageGatePass = resources ? (isFreeTextStage ? freeTextPassed : scorePercent >= resources.template.stageGate.minCorrectPercent) : false;

  const handleViewResults = () => {
    setPhase('results');
  };

  const handleCompleteStage = () => {
    if (!resources || !scenario) return;
    const xpEarned = correctCount * XP_PER_CORRECT + (stageGatePass ? XP_STAGE_BONUS : 0);
    addXP(xpEarned);
    updateTopicProgress(topicId, {
      completed: stageGatePass,
      score: correctCount,
      totalQuestions,
      completedAt: stageGatePass ? new Date().toISOString() : null,
    });
    completeStage(resources.stageNumber, scenario.variablesUsed, xpEarned);
    setPhase('bridge');
  };

  const handleNextStage = () => {
    if (!resources) return;
    if (resources.stageNumber === 4) {
      onBlockComplete();
    } else {
      const prefix = topicId.split('_')[0];
      const nextTopicId = `${prefix}_${resources.stageNumber + 1}`;
      onNextStage(nextTopicId);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setShowExplanations(false);
    setFreeTextResponse('');
    setFreeTextPassed(false);
    setPhase('brief');
  };

  if (!resources) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <p className="text-slate-500">Stage content not found for this topic.</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-500">Generating your scenario...</p>
      </div>
    );
  }

  if (!scenario) return null;

  const stageLabel = `Stage ${resources.stageNumber} of 4`;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to {moduleTitle}
        </button>
        <div className="text-sm font-semibold text-blue-600">{stageLabel}</div>
      </div>

      {/* Stage progress bar */}
      <div className="flex gap-2 mb-8">
        {([1, 2, 3, 4] as StageNumber[]).map((s) => (
          <div
            key={s}
            className={clsx(
              'h-2 flex-1 rounded-full transition-colors',
              s < resources.stageNumber
                ? 'bg-emerald-500'
                : s === resources.stageNumber
                  ? 'bg-blue-600'
                  : 'bg-slate-200',
            )}
          />
        ))}
      </div>

      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{resources.template.stageTitle}</h1>
      <p className="text-slate-500 mb-8">{resources.template.pedagogicalGoal}</p>

      {/* ── Phase: Brief ─────────────────── */}
      {phase === 'brief' && (
        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3 text-blue-600 text-sm font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              Scenario Briefing
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{scenario.scenarioBrief}</p>
          </section>

          {/* Task data preview */}
          {scenario.taskData.items.length > 0 && !isFreeTextStage && (
            <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Your Task — {scenario.taskData.type.replace('-', ' ')}
              </h3>
              <div className="grid gap-3">
                {scenario.taskData.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {item.id.replace(/\D/g, '')}
                    </div>
                    <span className="text-slate-800 text-sm font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Free-text context for Stage 4 */}
          {isFreeTextStage && (
            <section className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <h3 className="text-sm font-bold text-amber-700 uppercase tracking-widest mb-4">Context for your response</h3>
              <ul className="space-y-2">
                {scenario.taskData.items.map((item) => (
                  <li key={item.id} className="text-amber-900 text-sm flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    {item.label}
                  </li>
                ))}
              </ul>
              {scenario.taskData.evaluationRubric && (
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Evaluation Criteria</p>
                  <div className="grid gap-2">
                    {scenario.taskData.evaluationRubric.criteria.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-sm">
                        <span className="text-amber-800 font-medium">{c.name}</span>
                        <span className="text-amber-600 text-xs">{Math.round(c.weight * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <Button onClick={() => setPhase('task')} className="w-full justify-center" size="lg">
            <Play className="w-4 h-4 mr-2 fill-current" />
            {isFreeTextStage ? 'Write Your Response' : 'Start Assessment'}
          </Button>
        </div>
      )}

      {/* ── Phase: Task (Questions) ──────── */}
      {phase === 'task' && (
        <div className="space-y-6">
          {/* AI-evaluated free-text for Stage 4 */}
          {isFreeTextStage && scenario.taskData.evaluationRubric && (
            <FreeTextWithAIEval
              blockId={resources.blockId}
              scenarioBrief={scenario.scenarioBrief}
              rubric={scenario.taskData.evaluationRubric}
              onComplete={(passed) => {
                setFreeTextPassed(passed);
                handleViewResults();
              }}
            />
          )}

          {/* Fallback: plain free-text if no rubric (shouldn't happen for Stage 4) */}
          {isFreeTextStage && !scenario.taskData.evaluationRubric && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Your Response</h3>
              <textarea
                value={freeTextResponse}
                onChange={(e) => setFreeTextResponse(e.target.value)}
                maxLength={2000}
                rows={10}
                className="w-full rounded-xl border border-slate-300 p-4 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-y"
                placeholder="Write your response here (up to 300 words recommended)..."
              />
              <div className="mt-2 text-right text-xs text-slate-400">
                {freeTextResponse.split(/\s+/).filter(Boolean).length} words
              </div>
            </section>
          )}

          {/* MCQ questions */}
          <div className="space-y-5">
            {scenario.questions.map((q, qi) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={qi}
                selectedAnswer={selectedAnswers[q.id]}
                showExplanation={showExplanations}
                onSelect={(idx) => handleSelectAnswer(q.id, idx)}
              />
            ))}
          </div>

          {!showExplanations ? (
            <Button
              onClick={handleSubmitAnswers}
              className="w-full justify-center"
              size="lg"
              disabled={Object.keys(selectedAnswers).length < scenario.questions.length}
            >
              Submit Answers
            </Button>
          ) : (
            <Button onClick={handleViewResults} className="w-full justify-center" size="lg">
              View Results <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      )}

      {/* ── Phase: Results ───────────────── */}
      {phase === 'results' && (
        <div className="space-y-6">
          <section className={clsx(
            'rounded-2xl p-8 text-center border',
            stageGatePass ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200',
          )}>
            {stageGatePass ? (
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            ) : (
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            )}
            <h2 className="text-3xl font-extrabold mb-1">
              {correctCount}/{totalQuestions} Correct ({scorePercent}%)
            </h2>
            <p className={clsx('text-sm font-medium', stageGatePass ? 'text-emerald-700' : 'text-red-600')}>
              {stageGatePass
                ? `Stage passed! You earned ${correctCount * XP_PER_CORRECT + XP_STAGE_BONUS} XP.`
                : `You need ${resources.template.stageGate.minCorrectPercent}% to pass. Try again!`}
            </p>
          </section>

          {stageGatePass ? (
            <Button onClick={handleCompleteStage} className="w-full justify-center" size="lg">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleRetry} variant="secondary" className="w-full justify-center" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry Stage
            </Button>
          )}
        </div>
      )}

      {/* ── Phase: Bridge Narrative ──────── */}
      {phase === 'bridge' && (
        <div className="space-y-6">
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">
              {resources.stageNumber === 4 ? 'Block Complete' : 'Next Stage Preview'}
            </h3>
            <p className="text-slate-700 leading-relaxed text-lg">{scenario.bridgeText}</p>
          </section>

          <div className="flex items-center justify-between bg-slate-900 rounded-2xl p-6 text-white">
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Session XP</p>
              <p className="text-2xl font-extrabold">{activeSession?.totalXP ?? 0} XP</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Stages Complete</p>
              <p className="text-2xl font-extrabold">{activeSession?.stagesCompleted.length ?? 0}/4</p>
            </div>
          </div>

          <Button onClick={handleNextStage} className="w-full justify-center" size="lg">
            {resources.stageNumber === 4 ? 'Finish Block' : 'Next Stage'}{' '}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* AI Learning Assistant — visible during all phases except bridge */}
      {phase !== 'bridge' && scenario && (
        <AIChat
          blockId={resources.blockId as BlockId}
          stageNumber={resources.stageNumber}
          scenarioBrief={scenario.scenarioBrief}
        />
      )}
    </div>
  );
};

// ── Question Card sub-component ─────────────────────────────────────

interface QuestionCardProps {
  question: GeneratedQuestion;
  index: number;
  selectedAnswer: number | undefined;
  showExplanation: boolean;
  onSelect: (index: number) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  selectedAnswer,
  showExplanation,
  onSelect,
}) => {
  const isCorrect = selectedAnswer === question.correctAnswerIndex;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={clsx(
                'text-[10px] font-bold uppercase px-2 py-0.5 rounded border',
                question.difficulty === 'easy'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : question.difficulty === 'medium'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-red-50 text-red-700 border-red-200',
              )}
            >
              {question.difficulty}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-900">{question.text}</p>
        </div>
      </div>

      <div className="space-y-2 ml-11">
        {question.options.map((option, oi) => {
          const isSelected = selectedAnswer === oi;
          const isCorrectOption = oi === question.correctAnswerIndex;

          let optionStyles = 'border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300';
          if (isSelected && !showExplanation) {
            optionStyles = 'border-blue-500 bg-blue-50 ring-2 ring-blue-200';
          } else if (showExplanation && isCorrectOption) {
            optionStyles = 'border-emerald-500 bg-emerald-50';
          } else if (showExplanation && isSelected && !isCorrectOption) {
            optionStyles = 'border-red-400 bg-red-50';
          }

          return (
            <button
              key={oi}
              type="button"
              onClick={() => onSelect(oi)}
              disabled={showExplanation}
              className={clsx(
                'w-full text-left rounded-xl border p-3 text-sm transition-all',
                optionStyles,
                showExplanation && 'cursor-default',
              )}
            >
              <span className="font-medium text-slate-800">{String.fromCharCode(65 + oi)}.{' '}</span>
              {option}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className={clsx(
          'mt-4 ml-11 p-3 rounded-xl text-sm',
          isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200',
        )}>
          {isCorrect ? '✓ Correct! ' : '✗ Incorrect. '}
          {question.explanation}
        </div>
      )}
    </div>
  );
};
