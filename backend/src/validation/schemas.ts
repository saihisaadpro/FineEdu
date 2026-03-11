import { z } from 'zod';

// ── Request schemas ──────────────────────────────────────────────────

export const generateRequestSchema = z.object({
  templateId: z.string().regex(/^(acc|inv|mgt|fin)_stage_[1-4]$/),
  variables: z.record(z.string()),
  sessionContext: z.record(z.unknown()).default({}),
  stageNumber: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(500),
  blockId: z.enum(['accounting', 'investment', 'management', 'fintech']),
  stageNumber: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  scenarioContext: z.string().max(2000),
  userXPLevel: z.enum(['beginner', 'intermediate']),
  sessionId: z.string().uuid(),
});

export const evaluateRequestSchema = z.object({
  blockId: z.enum(['accounting', 'investment', 'management', 'fintech']),
  freeText: z.string().min(50).max(3000),
  rubric: z.object({
    criteria: z.array(z.object({
      name: z.string(),
      description: z.string(),
      weight: z.number().min(0).max(1),
    })),
    passThreshold: z.number().min(0).max(1),
  }),
  scenarioContext: z.string().max(2000),
});

// ── Response validation (for Claude output) ──────────────────────────

const taskItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number()]).optional(),
  category: z.string().optional(),
});

const generatedQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswerIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const generatedScenarioOutputSchema = z.object({
  scenario_brief: z.string().min(50),
  task_data: z.object({
    type: z.string(),
    items: z.array(taskItemSchema).min(3),
  }),
  questions: z.array(generatedQuestionSchema).min(4).max(8),
  bridge_text: z.string().min(20),
});

export const evaluationOutputSchema = z.object({
  passed: z.boolean(),
  criteriaResults: z.array(z.object({
    name: z.string(),
    label: z.enum(['strong', 'good', 'needs-more-detail']),
    feedback: z.string(),
  })),
  overallFeedback: z.string(),
});

// ── Inferred types ───────────────────────────────────────────────────

export type GenerateRequest = z.infer<typeof generateRequestSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type EvaluateRequest = z.infer<typeof evaluateRequestSchema>;
export type GeneratedScenarioOutput = z.infer<typeof generatedScenarioOutputSchema>;
export type EvaluationOutput = z.infer<typeof evaluationOutputSchema>;
