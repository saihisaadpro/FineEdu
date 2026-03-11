import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { ArrowRight, SkipForward } from 'lucide-react';
import { supabase } from '@/services/supabase';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'sonner';

export interface SurveyResponses {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
}

interface ConfidenceSurveyProps {
  blockId: string;
  blockTitle: string;
  surveyType: 'pre' | 'post';
  /** Called when the survey is completed or skipped */
  onComplete: (responses: SurveyResponses | null) => void;
  /** If pre-survey responses exist, pass them so we can show deltas on the post-survey */
  preSurveyResponses?: SurveyResponses | null;
}

const QUESTIONS = [
  'I understand how basic financial records work',
  'I could read a simple financial statement',
  'I understand the basics of investing',
  'I feel confident making financial decisions',
  'I understand how technology is changing finance',
] as const;

const LIKERT_LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] as const;

export const ConfidenceSurvey: React.FC<ConfidenceSurveyProps> = ({
  blockId,
  blockTitle,
  surveyType,
  onComplete,
  preSurveyResponses,
}) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const userId = useUserStore((s) => s.supabaseUserId);

  const qKey = `q${currentQ + 1}` as keyof SurveyResponses;
  const selectedValue = answers[qKey];
  const allAnswered = Object.keys(answers).length === QUESTIONS.length;

  const questionPrefix = surveyType === 'post' ? `After completing ${blockTitle}: ` : '';

  const handleSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [qKey]: value }));
  };

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    const responses = answers as unknown as SurveyResponses;

    try {
      if (userId) {
        await supabase.from('survey_responses').insert({
          user_id: userId,
          block_id: blockId,
          survey_type: surveyType,
          responses,
        });
      }
    } catch {
      // Silently continue — survey data is non-critical
    }

    setSaving(false);
    toast.success(surveyType === 'pre' ? 'Confidence survey saved!' : 'Post-survey saved — thank you!');
    onComplete(responses);
  };

  const handleSkip = () => {
    onComplete(null);
  };

  // Compute confidence delta for post-survey summary
  const showDelta = surveyType === 'post' && allAnswered && preSurveyResponses;
  const delta = showDelta
    ? (() => {
        const postMean = (Object.values(answers) as number[]).reduce((a, b) => a + b, 0) / 5;
        const preMean = (Object.values(preSurveyResponses!) as number[]).reduce((a, b) => a + b, 0) / 5;
        return +(postMean - preMean).toFixed(1);
      })()
    : null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
            {surveyType === 'pre' ? 'Before You Start' : 'Quick Reflection'}
          </p>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            How confident do you feel?
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {surveyType === 'pre'
              ? 'Rate each statement honestly — there are no wrong answers.'
              : 'Rate the same statements now that you\'ve completed the block.'}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {QUESTIONS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentQ(i)}
              className={clsx(
                'w-2.5 h-2.5 rounded-full transition-all duration-200',
                i === currentQ
                  ? 'bg-blue-600 scale-125'
                  : answers[`q${i + 1}`] !== undefined
                    ? 'bg-blue-300'
                    : 'bg-slate-200',
              )}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>

        {/* Question */}
        <fieldset className="mb-6" key={currentQ}>
          <legend className="text-sm font-semibold text-slate-800 mb-4 text-center">
            <span className="text-slate-400 mr-1">{currentQ + 1}/{QUESTIONS.length}</span>
            {questionPrefix}{QUESTIONS[currentQ]}
          </legend>

          <div className="flex flex-wrap justify-center gap-2">
            {LIKERT_LABELS.map((label, i) => {
              const value = i + 1;
              const isSelected = selectedValue === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelect(value)}
                  className={clsx(
                    'px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200',
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50',
                  )}
                  aria-pressed={isSelected}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentQ === 0}
            className="text-sm font-medium text-slate-400 hover:text-slate-700 disabled:invisible transition-colors"
          >
            Previous
          </button>

          {currentQ < QUESTIONS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={selectedValue === undefined}
              size="sm"
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || saving}
              size="sm"
            >
              {saving ? 'Saving...' : 'Submit'}
            </Button>
          )}
        </div>

        {/* Skip link */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1"
          >
            <SkipForward className="w-3 h-3" />
            Skip for now
          </button>
        </div>

        {/* Confidence delta display for post-survey */}
        {delta !== null && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
              Confidence Change
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {delta > 0 ? '+' : ''}{delta}
              <span className="text-sm font-medium text-slate-500 ml-1">points avg.</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {delta > 0
                ? 'Your confidence has grown!'
                : delta === 0
                  ? 'Your confidence is steady.'
                  : 'Your answers suggest areas to revisit.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
