import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

/** Single shared client — connection pooling handled internally by the SDK */
export const anthropic = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY,
});

/**
 * Model constants — SINGLE SOURCE OF TRUTH.
 * Only Haiku 4.5 (latest) and Sonnet 4.6 (latest) are permitted.
 */
export const MODELS = {
  /** Scenario generation — Haiku 4.5 for speed + structured JSON */
  GENERATION: 'claude-haiku-4-5-20251001',
  /** Learning assistant chatbot — Haiku 4.5 for low-latency conversation */
  CHAT: 'claude-haiku-4-5-20251001',
  /** Stage 4 free-text evaluation — Sonnet 4.6 for nuanced rubric assessment */
  EVALUATION: 'claude-sonnet-4-6-20250311',
} as const;

/** Token budgets per function */
export const TOKEN_LIMITS = {
  GENERATION: 2_000,
  CHAT: 300,
  EVALUATION: 800,
} as const;

/** Timeout budgets (ms) */
export const TIMEOUTS = {
  GENERATION_FIRST: 10_000,
  GENERATION_RETRY: 15_000,
  CHAT: 8_000,
  EVALUATION: 20_000,
} as const;
