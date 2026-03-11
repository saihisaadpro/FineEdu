/**
 * Phase 4 — Content Index
 *
 * Aggregates all block templates, variable pools, and fallback scenarios.
 * Provides lookup functions for the scenario generation pipeline.
 *
 * The old `data/content.ts` still exists for backward compatibility with
 * TopicDetail and AssessmentPage until fully migrated to StageView.
 */

import { accountingTemplates, accountingVariables } from '@/data/templates/accounting';
import { investmentTemplates, investmentVariables } from '@/data/templates/investment';
import { managementTemplates, managementVariables } from '@/data/templates/management';
import { fintechTemplates, fintechVariables } from '@/data/templates/fintech';

import { accountingFallbacks } from '@/data/fallbacks/accounting';
import { investmentFallbacks } from '@/data/fallbacks/investment';
import { managementFallbacks } from '@/data/fallbacks/management';
import { fintechFallbacks } from '@/data/fallbacks/fintech';

import type { ScenarioTemplate, VariablePool, GeneratedScenario, BlockId, StageNumber } from '@/types/content';

// ── Aggregated collections ────────────────────────────────────────────

const allTemplates: ScenarioTemplate[] = [
  ...accountingTemplates,
  ...investmentTemplates,
  ...managementTemplates,
  ...fintechTemplates,
];

const allVariables: VariablePool[] = [
  ...accountingVariables,
  ...investmentVariables,
  ...managementVariables,
  ...fintechVariables,
];

const allFallbacks: GeneratedScenario[] = [
  ...accountingFallbacks,
  ...investmentFallbacks,
  ...managementFallbacks,
  ...fintechFallbacks,
];

// ── Lookup functions ──────────────────────────────────────────────────

export const getTemplate = (blockId: BlockId, stageNumber: StageNumber): ScenarioTemplate | undefined =>
  allTemplates.find((t) => t.blockId === blockId && t.stageNumber === stageNumber);

export const getVariablePool = (templateId: string): VariablePool | undefined =>
  allVariables.find((v) => v.templateId === templateId);

export const getFallback = (templateId: string): GeneratedScenario | undefined =>
  allFallbacks.find((f) => f.templateId === templateId);

// ── Mapping helpers ───────────────────────────────────────────────────

/**
 * Map a topic ID (e.g. 'acc_1') to its block ID and stage number.
 * Topic IDs follow the pattern: {prefix}_{stageNumber}
 *   acc → accounting, inv → investment, mgt → management, fin → fintech
 */
const prefixToBlock: Record<string, BlockId> = {
  acc: 'accounting',
  inv: 'investment',
  mgt: 'management',
  fin: 'fintech',
};

export const topicToBlockStage = (topicId: string): { blockId: BlockId; stageNumber: StageNumber } | undefined => {
  const parts = topicId.split('_');
  if (parts.length !== 2) return undefined;
  const blockId = prefixToBlock[parts[0]];
  const stageNumber = parseInt(parts[1], 10) as StageNumber;
  if (!blockId || stageNumber < 1 || stageNumber > 4) return undefined;
  return { blockId, stageNumber };
};

/**
 * Get all three resources needed for generation, given a topic ID.
 */
export const getStageResources = (topicId: string) => {
  const mapping = topicToBlockStage(topicId);
  if (!mapping) return undefined;

  const template = getTemplate(mapping.blockId, mapping.stageNumber);
  if (!template) return undefined;

  const variablePool = getVariablePool(template.templateId);
  const fallback = getFallback(template.templateId);

  if (!variablePool || !fallback) return undefined;

  return { template, variablePool, fallback, ...mapping };
};

/**
 * Get all 4 stage templates for a block. Useful for the completion summary
 * where we need to display pedagogical goals from each stage.
 */
export const getBlockTemplates = (blockId: BlockId): ScenarioTemplate[] =>
  allTemplates.filter((t) => t.blockId === blockId);
