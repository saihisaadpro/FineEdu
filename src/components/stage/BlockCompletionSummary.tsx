import React, { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, Award, BookOpen, CheckCircle2, Clock, MessageCircle, Printer, Trophy, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { useProgressStore } from '@/stores/progressStore';
import { useBlockSessionStore } from '@/stores/blockSessionStore';
import { getBlockTemplates } from '@/data/content/index';
import { MODULES } from '@/data/modules';
import { getBadge, TIER_COLORS } from '@/data/badges';
import { checkAndAwardBadges } from '@/services/badgeChecker';
import { supabase } from '@/services/supabase';
import { useUserStore } from '@/stores/userStore';
import { ConfidenceSurvey, type SurveyResponses } from '@/components/feedback/ConfidenceSurvey';
import { PrintableSummary } from '@/components/feedback/PrintableSummary';
import type { BlockId, ScenarioTemplate } from '@/types/content';

/** Block theme colours for confetti */
const BLOCK_COLORS: Record<string, string[]> = {
  accounting: ['#10b981', '#14b8a6', '#059669'],
  investment: ['#3b82f6', '#6366f1', '#2563eb'],
  management: ['#8b5cf6', '#a855f7', '#7c3aed'],
  fintech: ['#ec4899', '#f43f5e', '#db2777'],
};

interface BlockCompletionSummaryProps {
  blockId: BlockId;
  onReturnToDashboard: () => void;
  onTryAnotherBlock: () => void;
}

export const BlockCompletionSummary: React.FC<BlockCompletionSummaryProps> = ({
  blockId,
  onReturnToDashboard,
  onTryAnotherBlock,
}) => {
  const session = useBlockSessionStore((s) => s.activeSession);
  const topicProgress = useProgressStore((s) => s.topicProgress);
  const badges = useProgressStore((s) => s.badges);
  const userId = useUserStore((s) => s.supabaseUserId);

  const [showPostSurvey, setShowPostSurvey] = useState(false);
  const [postSurveyDone, setPostSurveyDone] = useState(false);
  const [preSurveyResponses, setPreSurveyResponses] = useState<SurveyResponses | null>(null);
  const [showPrint, setShowPrint] = useState(false);
  const confettiFired = useRef(false);
  const persistedRef = useRef(false);

  const module = MODULES.find((m) => m.id === blockId);
  const blockTitle = module?.title ?? 'Block';
  const blockTemplates = useMemo(() => getBlockTemplates(blockId), [blockId]);

  // Get per-stage data
  const stagePrefix = blockId === 'accounting' ? 'acc' : blockId === 'investment' ? 'inv' : blockId === 'management' ? 'mgt' : 'fin';
  const stageData = [1, 2, 3, 4].map((n) => {
    const tid = `${stagePrefix}_${n}`;
    const prog = topicProgress[tid];
    const template = blockTemplates.find((t) => t.stageNumber === n);
    return {
      stage: n,
      title: template?.stageTitle ?? `Stage ${n}`,
      score: prog?.score ?? 0,
      total: prog?.totalQuestions ?? 0,
      percent: prog && prog.totalQuestions > 0 ? Math.round((prog.score / prog.totalQuestions) * 100) : 0,
      passed: prog?.completed ?? false,
      pedagogicalGoal: template?.pedagogicalGoal ?? '',
    };
  });

  const totalXP = session?.totalXP ?? 0;
  const animatedXP = useAnimatedNumber(totalXP);
  const overallPercent = (() => {
    const total = stageData.reduce((a, s) => a + s.total, 0);
    const correct = stageData.reduce((a, s) => a + s.score, 0);
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  })();
  const animatedPercent = useAnimatedNumber(overallPercent);

  // Time taken
  const timeTaken = useMemo(() => {
    if (!session?.startedAt) return '—';
    const secs = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
    const mins = Math.floor(secs / 60);
    if (mins < 1) return '<1 min';
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    return `${mins} min`;
  }, [session?.startedAt]);

  const timeTakenSeconds = useMemo(() => {
    if (!session?.startedAt) return 0;
    return Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
  }, [session?.startedAt]);

  // Chat interactions count
  const chatCount = Number(localStorage.getItem('wrf-chat-count') ?? '0');

  // Check for newly earned badges
  const newBadges = useMemo(() => {
    const earned = checkAndAwardBadges();
    return earned;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // All block-related badges the user has
  const blockMasterBadgeId = `block_master_${blockId}`;
  const hasBlockMaster = badges.includes(blockMasterBadgeId);

  // Pedagogical goals (top 3)
  const keyTakeaways = stageData
    .map((s) => s.pedagogicalGoal)
    .filter(Boolean)
    .slice(0, 3);

  // Fire confetti on mount
  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;
    const colors = BLOCK_COLORS[blockId] ?? ['#3b82f6', '#10b981', '#f59e0b'];
    // Left volley
    confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors });
    // Right volley
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors });
    }, 300);
  }, [blockId]);

  // Persist completion record to Supabase
  useEffect(() => {
    if (persistedRef.current || !userId) return;
    persistedRef.current = true;

    const scores: Record<string, number> = {};
    stageData.forEach((s) => { scores[`stage${s.stage}`] = s.percent; });

    supabase.from('block_completions').insert({
      user_id: userId,
      block_id: blockId,
      scores,
      total_xp: totalXP,
      badges_earned: newBadges,
      time_taken_seconds: timeTakenSeconds,
    }).then(() => { /* fire-and-forget */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, blockId]);

  // Load pre-survey responses for delta display
  useEffect(() => {
    if (!userId) return;
    supabase
      .from('survey_responses')
      .select('responses')
      .eq('user_id', userId)
      .eq('block_id', blockId)
      .eq('survey_type', 'pre')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPreSurveyResponses(data[0].responses as SurveyResponses);
        }
      });
  }, [userId, blockId]);

  // Show print view
  if (showPrint) {
    return (
      <PrintableSummary
        blockId={blockId}
        blockTitle={blockTitle}
        stageData={stageData}
        totalXP={totalXP}
        overallPercent={overallPercent}
        timeTaken={timeTaken}
        takeaways={keyTakeaways}
        preSurveyResponses={preSurveyResponses}
        onBack={() => setShowPrint(false)}
      />
    );
  }

  // Show post-survey before CTA buttons
  if (showPostSurvey && !postSurveyDone) {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-fade-in">
        <ConfidenceSurvey
          blockId={blockId}
          blockTitle={blockTitle}
          surveyType="post"
          preSurveyResponses={preSurveyResponses}
          onComplete={() => {
            setPostSurveyDone(true);
            setShowPostSurvey(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 pb-20 sm:pb-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-emerald-200">
          <Trophy className="w-4 h-4" />
          Mission Complete!
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">
          {blockTitle}
        </h1>
        <p className="text-slate-500">You've completed all 4 stages. Here's how you did.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard icon={<Award className="w-5 h-5 text-blue-500" />} label="Total XP" value={`${animatedXP}`} />
        <StatCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} label="Accuracy" value={`${animatedPercent}%`} />
        <StatCard icon={<Clock className="w-5 h-5 text-amber-500" />} label="Time Taken" value={timeTaken} />
        <StatCard icon={<MessageCircle className="w-5 h-5 text-violet-500" />} label="AI Chats" value={`${chatCount}`} />
      </div>

      {/* Per-stage scorecard */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Stage Scorecard</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {stageData.map((s, i) => (
            <div
              key={s.stage}
              className="flex items-center justify-between px-6 py-4 animate-slide-up"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                  s.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500',
                )}>
                  {s.stage}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{s.title}</p>
                  <p className="text-xs text-slate-400">{s.score}/{s.total} correct</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={clsx(
                  'text-sm font-bold',
                  s.percent >= 80 ? 'text-emerald-600' : s.percent >= 60 ? 'text-amber-600' : 'text-red-500',
                )}>
                  {s.percent}%
                </span>
                {s.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Badge unlocked */}
      {(hasBlockMaster || newBadges.length > 0) && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Badges Earned</h2>
          <div className="flex flex-wrap gap-3">
            {[...(hasBlockMaster ? [blockMasterBadgeId] : []), ...newBadges.filter((b) => b !== blockMasterBadgeId)].map((badgeId) => {
              const badge = getBadge(badgeId);
              if (!badge) return null;
              const Icon = badge.icon;
              const tc = TIER_COLORS[badge.tier];
              return (
                <div
                  key={badgeId}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm animate-pop-in',
                    tc.bg, 'border-slate-200',
                  )}
                >
                  <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', tc.bg, tc.text)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{badge.name}</p>
                    <p className="text-xs text-slate-500">+{badge.xpReward} XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Key learning takeaways */}
      {keyTakeaways.length > 0 && (
        <section className="bg-green-50 border-l-4 border-green-500 rounded-r-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-green-600" />
            <h2 className="text-sm font-bold text-green-700 uppercase tracking-widest">Key Learning Takeaways</h2>
          </div>
          <ul className="space-y-2">
            {keyTakeaways.map((goal, i) => (
              <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                {goal}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Post-survey prompt */}
      {!postSurveyDone && (
        <section className="bg-blue-50 rounded-2xl border border-blue-200 p-6 mb-8 text-center">
          <p className="text-sm font-semibold text-blue-800 mb-3">
            Help us measure impact — take a quick 1-minute confidence check
          </p>
          <Button onClick={() => setShowPostSurvey(true)} size="sm">
            Take Post-Block Survey <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </section>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onReturnToDashboard} className="flex-1 justify-center" size="lg">
          Return to Dashboard
        </Button>
        <Button onClick={onTryAnotherBlock} variant="secondary" className="flex-1 justify-center" size="lg">
          Try Another Block
        </Button>
        <Button
          onClick={() => setShowPrint(true)}
          variant="ghost"
          className="flex-1 justify-center border border-slate-200"
          size="lg"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Summary
        </Button>
      </div>
    </div>
  );
};

// ── Stat Card sub-component ───────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 text-center">
    <div className="flex justify-center mb-2">{icon}</div>
    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{value}</p>
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
  </div>
);
