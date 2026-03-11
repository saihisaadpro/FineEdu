import React, { useCallback, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { CheckCircle, ChevronDown, ChevronUp, Loader2, RefreshCw, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { EvaluationRubric } from '@/types/content';

interface CriterionResult {
  name: string;
  label: 'strong' | 'good' | 'needs-more-detail';
  feedback: string;
}

interface EvaluationResult {
  passed: boolean;
  criteriaResults: CriterionResult[];
  overallFeedback: string;
}

interface FreeTextWithAIEvalProps {
  blockId: string;
  scenarioBrief: string;
  rubric: EvaluationRubric;
  onComplete: (passed: boolean) => void;
}

const MAX_ATTEMPTS = 2;
const MIN_WORDS = 50;
const MAX_WORDS = 500;

const LABEL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  strong: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Strong' },
  good: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Good' },
  'needs-more-detail': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Needs more detail' },
};

export const FreeTextWithAIEval: React.FC<FreeTextWithAIEvalProps> = ({
  blockId,
  scenarioBrief,
  rubric,
  onComplete,
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [briefExpanded, setBriefExpanded] = useState(false);
  const [facilitatorReview, setFacilitatorReview] = useState(false);

  const wordCount = useMemo(
    () => text.split(/\s+/).filter(Boolean).length,
    [text],
  );

  const canSubmit = wordCount >= MIN_WORDS && wordCount <= MAX_WORDS && !loading;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      // No backend — auto-pass with facilitator review
      setFacilitatorReview(true);
      onComplete(true);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25_000);

      const response = await fetch(`${apiUrl}/api/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockId,
          freeText: text,
          rubric,
          scenarioContext: scenarioBrief.slice(0, 2000),
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { fallbackAction?: string };
        if (errorData.fallbackAction === 'facilitator_review') {
          setFacilitatorReview(true);
          onComplete(true);
          return;
        }
        throw new Error('Evaluation failed');
      }

      const data = await response.json() as EvaluationResult;
      setResult(data);
      setAttempt((prev) => prev + 1);

      if (data.passed) {
        onComplete(true);
      } else if (attempt + 1 >= MAX_ATTEMPTS) {
        // Auto-pass after max attempts
        onComplete(true);
      }
    } catch {
      // Evaluation unavailable — auto-pass with facilitator flag
      setFacilitatorReview(true);
      onComplete(true);
    } finally {
      setLoading(false);
    }
  }, [canSubmit, text, blockId, rubric, scenarioBrief, attempt, onComplete]);

  const handleRevise = () => {
    setResult(null);
  };

  // After max failed attempts — auto-passed with flag
  const autoPassedAfterMaxAttempts = result && !result.passed && attempt >= MAX_ATTEMPTS;

  return (
    <div className="space-y-5">
      {/* Collapsible scenario brief */}
      <section className="bg-slate-50 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setBriefExpanded(!briefExpanded)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <span>Scenario Brief</span>
          {briefExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {briefExpanded && (
          <div className="px-5 pb-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {scenarioBrief}
          </div>
        )}
      </section>

      {/* Text area (only show if no result yet, or revising) */}
      {!result && !facilitatorReview && (
        <>
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Your Recommendation</h3>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={5000}
              rows={10}
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 p-4 text-sm text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-y disabled:opacity-50"
              placeholder="Write your recommendation here (50-500 words)..."
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={clsx(
                'font-medium',
                wordCount < MIN_WORDS ? 'text-slate-400' :
                wordCount > MAX_WORDS ? 'text-red-500' :
                'text-emerald-600',
              )}>
                {wordCount} / {MIN_WORDS}-{MAX_WORDS} words
              </span>
              {attempt > 0 && (
                <span className="text-amber-600 font-medium">
                  Attempt {attempt + 1} of {MAX_ATTEMPTS}
                </span>
              )}
            </div>
          </section>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            isLoading={loading}
            className="w-full justify-center"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Evaluating your response...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Recommendation
              </>
            )}
          </Button>
        </>
      )}

      {/* Facilitator review fallback */}
      {facilitatorReview && (
        <section className="bg-blue-50 rounded-2xl border border-blue-200 p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-blue-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-blue-900 mb-2">Response Saved</h3>
          <p className="text-sm text-blue-700 leading-relaxed">
            Your response has been saved. A facilitator will review it.
            You can continue to the next section.
          </p>
        </section>
      )}

      {/* Evaluation results */}
      {result && (
        <div className="space-y-4">
          {/* Overall banner */}
          <section className={clsx(
            'rounded-2xl p-6 text-center border',
            result.passed || autoPassedAfterMaxAttempts
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-amber-50 border-amber-200',
          )}>
            {result.passed ? (
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            ) : autoPassedAfterMaxAttempts ? (
              <CheckCircle className="w-10 h-10 text-blue-500 mx-auto mb-2" />
            ) : (
              <RefreshCw className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            )}
            <h3 className={clsx(
              'text-lg font-bold mb-2',
              result.passed ? 'text-emerald-800' :
              autoPassedAfterMaxAttempts ? 'text-blue-800' :
              'text-amber-800',
            )}>
              {result.passed
                ? 'Well done!'
                : autoPassedAfterMaxAttempts
                  ? 'Good effort — you can move on!'
                  : 'Almost there — try again'}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{result.overallFeedback}</p>
          </section>

          {/* Per-criterion feedback cards */}
          <div className="space-y-3">
            {result.criteriaResults.map((cr) => {
              const style = LABEL_STYLES[cr.label] ?? LABEL_STYLES['needs-more-detail'];
              return (
                <div
                  key={cr.name}
                  className={clsx('rounded-xl border p-4', style.bg)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-800">{cr.name}</span>
                    <span className={clsx('text-xs font-bold uppercase tracking-wider', style.text)}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{cr.feedback}</p>
                </div>
              );
            })}
          </div>

          {/* Action button */}
          {result.passed || autoPassedAfterMaxAttempts ? (
            <Button onClick={() => onComplete(true)} className="w-full justify-center" size="lg">
              Continue
            </Button>
          ) : (
            <Button onClick={handleRevise} variant="secondary" className="w-full justify-center" size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
              Revise and Resubmit
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
