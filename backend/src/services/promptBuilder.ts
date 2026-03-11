import { activePrompts } from './prompts/index.js';

/**
 * Delegates to the active prompt version for generation prompts.
 */
export const buildGenerationPrompt = (
  templateId: string,
  variables: Record<string, string>,
  sessionContext: Record<string, unknown>,
): string => activePrompts.buildGenerationPrompt(templateId, variables, sessionContext);

/**
 * Delegates to the active prompt version for evaluation prompts.
 */
export const buildEvaluationPrompt = (
  blockId: string,
  rubric: { criteria: { name: string; description: string; weight: number }[]; passThreshold: number },
  scenarioContext: string,
): string => activePrompts.buildEvaluationPrompt(blockId, rubric, scenarioContext);

/**
 * Delegates to the active prompt version for chat prompts.
 */
export const buildChatPrompt = (
  blockId: string,
  stageNumber: number,
  scenarioContext: string,
  xpLevel: string,
): string => activePrompts.buildChatPrompt(blockId, stageNumber, scenarioContext, xpLevel);

/**
 * Delegates to the active prompt version for bridge narrative prompts.
 */
export const buildBridgePrompt = (
  blockName: string,
  fromStage: number,
  toStage: number,
  previousScore: number,
  previousStageName: string,
): string => activePrompts.buildBridgePrompt(blockName, fromStage, toStage, previousScore, previousStageName);
