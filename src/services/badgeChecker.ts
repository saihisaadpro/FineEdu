import { BADGES, getBadge } from '@/data/badges';
import { useProgressStore } from '@/stores/progressStore';
import { useBlockSessionStore } from '@/stores/blockSessionStore';

/**
 * Evaluate all badge criteria against current state.
 * Returns an array of newly-earned badge IDs (not previously in the store).
 * Call this after completing a stage or awarding XP.
 */
export function checkAndAwardBadges(): string[] {
  const { badges: earned, topicProgress, awardBadge, addXP } = useProgressStore.getState();
  const session = useBlockSessionStore.getState().activeSession;
  const newlyEarned: string[] = [];

  const completedTopics = Object.values(topicProgress).filter((t) => t.completed);
  const completedTopicIds = new Set(completedTopics.map((t) => t.topicId));

  // Helper: get unique block IDs that have at least one started topic
  const startedBlocks = new Set(
    Object.keys(topicProgress).map((tid) => tid.split('_')[0]),
  );

  for (const badge of BADGES) {
    if (earned.includes(badge.id)) continue;

    let met = false;

    switch (badge.id) {
      case 'first_steps':
        met = completedTopics.length >= 1;
        break;

      case 'explorer':
        met = startedBlocks.size >= 2;
        break;

      case 'curious_mind':
        // Tracked via a simple localStorage counter incremented in AIChat
        met = Number(localStorage.getItem('wrf-chat-count') ?? '0') >= 5;
        break;

      case 'quick_thinker':
        met = completedTopics.some(
          (t) => t.totalQuestions > 0 && (t.score / t.totalQuestions) * 100 >= 80,
        );
        break;

      case 'streak_keeper':
        met = (session?.stagesCompleted.length ?? 0) >= 3;
        break;

      case 'perfect_score':
        met = completedTopics.some(
          (t) => t.totalQuestions > 0 && t.score === t.totalQuestions,
        );
        break;

      case 'block_master_accounting':
        met = ['acc_1', 'acc_2', 'acc_3', 'acc_4'].every((id) => completedTopicIds.has(id));
        break;

      case 'block_master_investment':
        met = ['inv_1', 'inv_2', 'inv_3', 'inv_4'].every((id) => completedTopicIds.has(id));
        break;

      case 'block_master_management':
        met = ['mgt_1', 'mgt_2', 'mgt_3', 'mgt_4'].every((id) => completedTopicIds.has(id));
        break;

      case 'block_master_fintech':
        met = ['fin_1', 'fin_2', 'fin_3', 'fin_4'].every((id) => completedTopicIds.has(id));
        break;

      case 'full_journey':
        met =
          ['acc_1', 'acc_2', 'acc_3', 'acc_4'].every((id) => completedTopicIds.has(id)) &&
          ['inv_1', 'inv_2', 'inv_3', 'inv_4'].every((id) => completedTopicIds.has(id)) &&
          ['mgt_1', 'mgt_2', 'mgt_3', 'mgt_4'].every((id) => completedTopicIds.has(id)) &&
          ['fin_1', 'fin_2', 'fin_3', 'fin_4'].every((id) => completedTopicIds.has(id));
        break;
    }

    if (met) {
      awardBadge(badge.id);
      addXP(badge.xpReward);
      newlyEarned.push(badge.id);
    }
  }

  return newlyEarned;
}
