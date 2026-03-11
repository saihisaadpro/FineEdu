import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle, Gauge, Play, RotateCcw, ShieldCheck, User, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { AssessmentState, Module, Question, Role, Topic } from '../types';
import { Button } from './Button';

interface AssessmentProps {
  topic: Topic;
  module: Module;
  initialDifficulty: 'easy' | 'medium' | 'hard';
  onExit: () => void;
  userRole: Role;
  testBank: Question[];
}

const selectNextQuestion = (
  questions: Question[],
  usedIndices: Set<number>,
  difficulty: 'easy' | 'medium' | 'hard',
) => {
  const remaining = questions
    .map((question, index) => ({ question, index }))
    .filter(({ index }) => !usedIndices.has(index));

  if (remaining.length === 0) {
    return null;
  }

  const sameDifficulty = remaining.filter(({ question }) => question.difficulty === difficulty);
  return (sameDifficulty.length > 0 ? sameDifficulty : remaining)[0];
};

export const Assessment: React.FC<AssessmentProps> = ({
  topic,
  module,
  initialDifficulty,
  onExit,
  testBank,
}) => {
  const usedQuestionIndices = useRef<Set<number>>(new Set());
  const [state, setState] = useState<AssessmentState>({
    isActive: true,
    difficulty: initialDifficulty,
    currentQuestion: null,
    history: [],
    loading: true,
    feedbackGiven: false,
    selectedOptionIndex: null,
    score: 0,
  });

  const availableQuestionCount = useMemo(() => testBank.length, [testBank.length]);

  const loadQuestion = (difficulty: 'easy' | 'medium' | 'hard') => {
    setState((previous) => ({
      ...previous,
      loading: true,
      feedbackGiven: false,
      selectedOptionIndex: null,
      difficulty,
    }));

    const selected = selectNextQuestion(testBank, usedQuestionIndices.current, difficulty);

    window.setTimeout(() => {
      setState((previous) => ({
        ...previous,
        currentQuestion: selected?.question ?? null,
        loading: false,
      }));
    }, 250);

    if (selected) {
      usedQuestionIndices.current.add(selected.index);
    }
  };

  useEffect(() => {
    usedQuestionIndices.current = new Set();
    loadQuestion(initialDifficulty);
  }, [initialDifficulty, topic.id]);

  const handleOptionSelect = (index: number) => {
    if (!state.currentQuestion || state.feedbackGiven) {
      return;
    }

    const isCorrect = index === state.currentQuestion.correctAnswerIndex;
    setState((previous) => ({ ...previous, selectedOptionIndex: index }));

    window.setTimeout(() => {
      setState((previous) => ({
        ...previous,
        feedbackGiven: true,
        score: isCorrect ? previous.score + 1 : previous.score,
        history: [...previous.history, { questionId: previous.currentQuestion!.id, correct: isCorrect }],
      }));
    }, 250);
  };

  const handleNext = () => {
    if (!state.currentQuestion) {
      return;
    }

    const wasCorrect = state.selectedOptionIndex === state.currentQuestion.correctAnswerIndex;
    let nextDifficulty = state.difficulty;

    if (wasCorrect) {
      if (state.difficulty === 'easy') {
        nextDifficulty = 'medium';
      } else if (state.difficulty === 'medium') {
        nextDifficulty = 'hard';
      }
    } else if (state.difficulty === 'hard') {
      nextDifficulty = 'medium';
    }

    loadQuestion(nextDifficulty);
  };

  if (state.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px] animate-in fade-in">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-5">
          <Play className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Loading Scenario</h2>
        <p className="text-slate-500 mt-2">Preparing the next local question for {topic.title}.</p>
      </div>
    );
  }

  if (!state.currentQuestion) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-10 text-center bg-white rounded-3xl shadow-xl border border-slate-200">
        <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Assessment Complete</h2>
        <p className="text-slate-600 mb-6">
          You completed all {availableQuestionCount} local scenarios for {topic.title}.
        </p>
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Score</p>
          <p className="text-4xl font-extrabold text-slate-900">
            {state.score}
            <span className="text-xl text-slate-400"> / {state.history.length}</span>
          </p>
        </div>
        <Button onClick={onExit} size="lg" className="w-full">
          Return To Topic
        </Button>
      </div>
    );
  }

  const isCorrect = state.selectedOptionIndex === state.currentQuestion.correctAnswerIndex;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 animate-in fade-in duration-300 min-h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">
            {state.history.length + 1}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Assessment</p>
            <p className="text-sm text-slate-700">{module.title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors bg-slate-50 px-4 py-2 rounded-lg"
        >
          Exit
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">Scenario Guide</span>
          </div>

          <div className="bg-white p-6 rounded-3xl rounded-tl-none shadow-md border border-slate-100 flex-1 relative">
            <div className="absolute top-4 right-4">
              <div
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm',
                  state.currentQuestion.difficulty === 'easy'
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : state.currentQuestion.difficulty === 'medium'
                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                    : 'bg-red-50 text-red-700 border-red-100',
                )}
              >
                <Gauge className="w-3 h-3" />
                {state.currentQuestion.difficulty}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-lg md:text-xl text-slate-800 leading-relaxed font-medium">{state.currentQuestion.text}</p>
            </div>
          </div>
        </div>

        {!state.feedbackGiven ? (
          <div className="space-y-3">
            {state.currentQuestion.options.map((option, index) => (
              <button
                key={`${state.currentQuestion.id}-option-${index}`}
                type="button"
                onClick={() => handleOptionSelect(index)}
                className={clsx(
                  'w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 bg-white shadow-sm group',
                  state.selectedOptionIndex === index
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-slate-100 hover:border-blue-300 hover:shadow-md',
                )}
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors',
                    state.selectedOptionIndex === index
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-slate-200 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-500',
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-base font-medium text-slate-700 group-hover:text-slate-900">{option}</span>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in space-y-5">
            <div className="flex gap-4 justify-end">
              <div
                className={clsx(
                  'p-5 rounded-3xl rounded-tr-none shadow-md border max-w-lg',
                  isCorrect ? 'bg-green-600 text-white border-green-500' : 'bg-red-500 text-white border-red-600',
                )}
              >
                <p className="text-lg font-medium">
                  I chose: <span className="font-bold">{state.currentQuestion.options[state.selectedOptionIndex!]}</span>
                </p>
              </div>
              <div className="flex-shrink-0 w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <User className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            <div className="flex gap-4">
              <div
                className={clsx(
                  'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg',
                  isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
                )}
              >
                {isCorrect ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>
              <div
                className={clsx(
                  'bg-white p-6 rounded-3xl rounded-tl-none shadow-lg border flex-1',
                  isCorrect ? 'border-green-100' : 'border-red-100',
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <RotateCcw className="w-5 h-5 text-red-600" />
                  )}
                  <h3 className={clsx('text-lg font-bold', isCorrect ? 'text-green-700' : 'text-red-700')}>
                    {isCorrect ? 'Outcome: Strong Choice' : 'Outcome: Review Needed'}
                  </h3>
                </div>
                <p className="text-slate-600 leading-relaxed mb-6">{state.currentQuestion.explanation}</p>
                <Button
                  onClick={handleNext}
                  className={clsx(
                    'px-8 py-3 text-lg',
                    isCorrect ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-slate-900 hover:bg-slate-800',
                  )}
                >
                  Next Scenario
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
