import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { BookOpen, ChevronRight, Loader2, Rocket, Target, Trophy, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import { MODULES } from '@/data/modules';
import { StageView } from '@/components/stage/StageView';
import { BlockCompletionSummary } from '@/components/stage/BlockCompletionSummary';
import { ConfidenceSurvey } from '@/components/feedback/ConfidenceSurvey';
import { supabase } from '@/services/supabase';
import { useUserStore } from '@/stores/userStore';
import { useProgressStore } from '@/stores/progressStore';
import { Button } from '@/components/ui/Button';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { BlockId } from '@/types/content';

type TopicView = 'loading' | 'intro' | 'pre-survey' | 'stage' | 'completion';

export const TopicPage: React.FC = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const userId = useUserStore((s) => s.supabaseUserId);
  const topicProgress = useProgressStore((s) => s.topicProgress);

  const isFirstStage = topicId?.endsWith('_1') ?? false;

  // Start in 'loading' for stage 1 (need pre-survey check), otherwise go straight to 'stage'
  const [view, setView] = useState<TopicView>(isFirstStage ? 'loading' : 'stage');
  const [preSurveyChecked, setPreSurveyChecked] = useState(!isFirstStage);

  // Find the module and topic
  const { foundModule, foundTopic } = useMemo(() => {
    for (const mod of MODULES) {
      const topic = mod.topics.find((t) => t.id === topicId);
      if (topic) return { foundModule: mod, foundTopic: topic };
    }
    return { foundModule: null, foundTopic: null };
  }, [topicId]);

  const blockId = foundModule?.id as BlockId | undefined;

  // Compute stage index (1-based) within the module
  const stageIndex = foundModule?.topics.findIndex((t) => t.id === topicId) ?? 0;
  const stageNumber = stageIndex + 1;

  // Count completed stages in this block
  const completedStages = useMemo(() => {
    if (!foundModule) return 0;
    return foundModule.topics.filter((t) => topicProgress[t.id]?.completed).length;
  }, [foundModule, topicProgress]);

  // Check if user has already taken a pre-survey for this block
  useEffect(() => {
    if (!isFirstStage || preSurveyChecked) return;
    if (!userId || !blockId) {
      // No auth — skip pre-survey check, show intro directly
      setPreSurveyChecked(true);
      setView('intro');
      return;
    }

    supabase
      .from('survey_responses')
      .select('id')
      .eq('user_id', userId)
      .eq('block_id', blockId)
      .eq('survey_type', 'pre')
      .limit(1)
      .then(({ data }) => {
        setPreSurveyChecked(true);
        if (!data || data.length === 0) {
          // No pre-survey yet — show mission intro first, then survey
          setView('intro');
        } else {
          // Already completed pre-survey — go straight to stage
          setView('stage');
        }
      });
  }, [userId, blockId, isFirstStage, preSurveyChecked]);

  if (!foundModule || !foundTopic || !topicId) return <NotFoundPage />;

  const handleBack = () => {
    navigate(`/module/${foundModule!.id}`);
  };

  const handleNextStage = (nextTopicId: string) => {
    navigate(`/topic/${nextTopicId}`);
  };

  const handleBlockComplete = () => {
    setView('completion');
  };

  // ── Loading: waiting for pre-survey check ──
  if (view === 'loading') {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-500">Preparing your mission...</p>
      </div>
    );
  }

  // ── Mission Introduction: shown before pre-survey on stage 1 ──
  if (view === 'intro' && blockId) {
    const STAGE_LABELS = ['Discover', 'Apply', 'Analyse', 'Synthesise'];
    return (
      <div className="max-w-2xl mx-auto py-8 animate-slide-in-up">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Hero gradient */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 sm:p-10 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_60%)]" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8" />
              </div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">
                New Mission
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
                {foundModule.title}
              </h1>
              <p className="text-blue-100 text-sm max-w-md mx-auto leading-relaxed">
                {foundModule.description}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* What to expect */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Your Mission Journey
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {foundModule.topics.map((topic, i) => (
                  <div
                    key={topic.id}
                    className={clsx(
                      'rounded-xl border p-3 transition-colors',
                      i === 0
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-slate-50 border-slate-200',
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500',
                      )}>
                        {i + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {STAGE_LABELS[i]}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 leading-snug">{topic.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick info cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-emerald-50">
                <Target className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-emerald-700">4 Stages</p>
                <p className="text-[10px] text-emerald-600">AI scenarios</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-50">
                <Zap className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-amber-700">Earn XP</p>
                <p className="text-[10px] text-amber-600">Per correct answer</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-violet-50">
                <Trophy className="w-5 h-5 text-violet-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-violet-700">Badges</p>
                <p className="text-[10px] text-violet-600">Unlock rewards</p>
              </div>
            </div>

            {/* CTA */}
            <Button
              onClick={() => setView('pre-survey')}
              className="w-full justify-center"
              size="lg"
            >
              Begin Mission <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pre-survey gate for first stage of a block ──
  if (view === 'pre-survey' && blockId) {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-slide-in-up">
        <ConfidenceSurvey
          blockId={blockId}
          blockTitle={foundModule.title}
          surveyType="pre"
          onComplete={() => setView('stage')}
        />
      </div>
    );
  }

  // ── Block completion summary ──
  if (view === 'completion' && blockId) {
    return (
      <BlockCompletionSummary
        blockId={blockId}
        onReturnToDashboard={() => navigate('/dashboard')}
        onTryAnotherBlock={() => navigate('/dashboard')}
      />
    );
  }

  // ── Main stage view ──
  return (
    <div className="animate-fade-in">
      <StageView
        topicId={topicId}
        moduleTitle={foundModule.title}
        onBack={handleBack}
        onNextStage={handleNextStage}
        onBlockComplete={handleBlockComplete}
      />
    </div>
  );
};
