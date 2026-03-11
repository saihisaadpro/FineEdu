import type { LucideIcon } from 'lucide-react';
import {
  Footprints,
  Trophy,
  Zap,
  MessageCircleQuestion,
  GraduationCap,
  Star,
  Flame,
  Compass,
} from 'lucide-react';

export type BadgeTier = 'bronze' | 'silver' | 'gold';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  tier: BadgeTier;
  xpReward: number;
}

/** All achievable badges ordered by approximate earn-order */
export const BADGES: BadgeDefinition[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first stage',
    icon: Footprints,
    tier: 'bronze',
    xpReward: 10,
  },
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Start at least 2 different blocks',
    icon: Compass,
    tier: 'bronze',
    xpReward: 10,
  },
  {
    id: 'curious_mind',
    name: 'Curious Mind',
    description: 'Use the AI chatbot 5+ times',
    icon: MessageCircleQuestion,
    tier: 'bronze',
    xpReward: 15,
  },
  {
    id: 'quick_thinker',
    name: 'Quick Thinker',
    description: 'Score 80%+ on first attempt at any stage',
    icon: Zap,
    tier: 'silver',
    xpReward: 25,
  },
  {
    id: 'streak_keeper',
    name: 'Streak Keeper',
    description: 'Complete 3 stages in one session',
    icon: Flame,
    tier: 'silver',
    xpReward: 25,
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Score 100% on any stage assessment',
    icon: Star,
    tier: 'gold',
    xpReward: 30,
  },
  {
    id: 'block_master_accounting',
    name: 'Block Master: Accounting',
    description: 'Complete all 4 stages of Accounting',
    icon: Trophy,
    tier: 'silver',
    xpReward: 50,
  },
  {
    id: 'block_master_investment',
    name: 'Block Master: Investment',
    description: 'Complete all 4 stages of Investment',
    icon: Trophy,
    tier: 'silver',
    xpReward: 50,
  },
  {
    id: 'block_master_management',
    name: 'Block Master: Management',
    description: 'Complete all 4 stages of Management',
    icon: Trophy,
    tier: 'silver',
    xpReward: 50,
  },
  {
    id: 'block_master_fintech',
    name: 'Block Master: FinTech',
    description: 'Complete all 4 stages of FinTech',
    icon: Trophy,
    tier: 'silver',
    xpReward: 50,
  },
  {
    id: 'full_journey',
    name: 'Full Journey',
    description: 'Complete all 4 blocks (16 stages)',
    icon: GraduationCap,
    tier: 'gold',
    xpReward: 200,
  },
];

/** Look up a badge definition by ID */
export function getBadge(id: string): BadgeDefinition | undefined {
  return BADGES.find((b) => b.id === id);
}

/** Tier colour mapping for consistent styling */
export const TIER_COLORS: Record<BadgeTier, { bg: string; text: string; ring: string; glow: string }> = {
  bronze: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-300', glow: 'shadow-amber-200/60' },
  silver: { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-300', glow: 'shadow-slate-200/60' },
  gold:   { bg: 'bg-yellow-50', text: 'text-yellow-700', ring: 'ring-yellow-400', glow: 'shadow-yellow-200/60' },
};
