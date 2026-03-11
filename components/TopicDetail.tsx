import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, FileText, Lock, Play, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { Module, Question, Role, Topic } from '../types';
import { Button } from './Button';
import { TestBankManager } from './TestBankManager';
import { getTopicContent } from '../content';

interface TopicDetailProps {
  topic: Topic;
  module: Module;
  onBack: () => void;
  onStartAssessment: (difficulty: 'easy' | 'medium' | 'hard') => void;
  userRole: Role;
  testBankQuestions: Question[];
  onUpdateTestBank: (questions: Question[]) => void;
}

export const TopicDetail: React.FC<TopicDetailProps> = ({
  topic,
  module,
  onBack,
  onStartAssessment,
  userRole,
  testBankQuestions,
  onUpdateTestBank,
}) => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [expandedPointIndex, setExpandedPointIndex] = useState<number | null>(0);
  const content = useMemo(() => getTopicContent(topic, module), [module, topic]);
  const questions = testBankQuestions.length > 0 ? testBankQuestions : content.questions;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300 pb-10">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to {module.title}
      </button>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-blue-600 font-semibold text-sm uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            Mission Briefing
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900">{topic.title}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            This topic now uses bundled local content only. No API key, chat service, or remote generation is required.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2">Role-Play Context</p>
                  <h2 className="text-2xl font-bold text-slate-900">{content.dossier.role}</h2>
                  <p className="text-sm text-slate-500 mt-1">{content.dossier.location}</p>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide">
                  <ShieldCheck className="w-3 h-3 mr-1.5" />
                  Local Content
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Situation</h3>
                <p className="text-slate-700 leading-relaxed">{content.dossier.situation}</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4">
                <h3 className="text-sm font-bold text-blue-700 uppercase tracking-widest mb-2">Objective</h3>
                <p className="text-blue-900 font-medium">{content.dossier.objective}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Key Learning Points</h3>
                <p className="text-sm text-slate-500">Expand each point for more detail and an example.</p>
              </div>
              <div className="text-xs font-bold uppercase text-slate-400">{content.dossier.keyPoints.length} points</div>
            </div>

            <div className="space-y-3">
              {content.dossier.keyPoints.map((point, index) => {
                const isExpanded = expandedPointIndex === index;

                return (
                  <div
                    key={point.concept}
                    className={clsx(
                      'border rounded-xl transition-all',
                      isExpanded ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-slate-50/40',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedPointIndex(isExpanded ? null : index)}
                      className="w-full text-left p-4 flex items-start gap-3"
                    >
                      <div
                        className={clsx(
                          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                          isExpanded ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200',
                        )}
                      >
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-bold text-slate-900">{point.concept}</h4>
                          <ChevronRight
                            className={clsx('w-4 h-4 text-slate-400 transition-transform', isExpanded && 'rotate-90 text-blue-600')}
                          />
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{point.brief}</p>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 ml-[3.25rem] space-y-4">
                        <p className="text-sm leading-relaxed text-slate-700">{point.detailedExplanation}</p>
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2">Real World Example</p>
                          <p className="text-sm text-slate-700">{point.realWorldExample}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {userRole === 'lecturer' ? (
              <TestBankManager topic={topic} module={module} questions={questions} onUpdateQuestions={onUpdateTestBank} />
            ) : (
              <div>
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Practice Bank</h3>
                    <p className="text-sm text-slate-500">This topic includes {questions.length} bundled scenarios.</p>
                  </div>
                  <div className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-600">
                    <Lock className="w-3 h-3 mr-1.5" />
                    Ready Offline
                  </div>
                </div>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div key={question.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
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
                          <p className="text-sm font-medium text-slate-800">{question.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 sticky top-8 shadow-lg">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Mission Status</p>
              <h3 className="text-2xl font-bold">Ready To Start</h3>
              <p className="text-sm text-slate-400 mt-2">Choose a difficulty and launch the local scenario set for this topic.</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-1 flex mb-5">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={clsx(
                    'flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all',
                    difficulty === level ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white',
                  )}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-2">{difficulty} mode</p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {difficulty === 'easy' && 'Focus on identifying the core principle and choosing the clearest next step.'}
                {difficulty === 'medium' && 'Apply the topic to a realistic workplace or everyday finance situation.'}
                {difficulty === 'hard' && 'Work through pressure, trade-offs, and competing priorities before deciding.'}
              </p>
            </div>

            <Button onClick={() => onStartAssessment(difficulty)} className="w-full justify-center" size="lg">
              <Play className="w-4 h-4 mr-2 fill-current" />
              Start Assessment
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
};
