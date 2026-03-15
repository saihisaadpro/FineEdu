/** Phase 4 — Dynamic Scenario Generation content types */

/** How the scenario was produced. Surfaced in the UI for transparency. */
export type GenerationSource = 'ai-live' | 'ai-cached' | 'fallback' | 'fallback-after-error' | 'preview';

/** Stage number across all blocks */
export type StageNumber = 1 | 2 | 3 | 4;

/** Block identifiers matching the four module IDs */
export type BlockId = 'accounting' | 'investment' | 'management' | 'fintech';

// ── Layer 1: Authored Stage Templates ─────────────────────────────────

export interface ScenarioTemplate {
  templateId: string;
  blockId: BlockId;
  stageNumber: StageNumber;
  stageTitle: string;
  pedagogicalGoal: string;
  workplaceSetting: string;
  learnerRole: string;
  taskType: string;
  questionPatterns: QuestionPattern[];
  promptSkeleton: string;
  stageGate: StageGate;
  bridgeNarrativeTemplate: string;
  interactiveComponents: InteractiveComponentSpec[];
}

export interface QuestionPattern {
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'multiple-choice' | 'ordering' | 'matching';
  focusArea: string;
}

export interface StageGate {
  minCorrectPercent: number;
  requiredConcepts?: string[];
  canRetry: boolean;
  facilitatorOverride: boolean;
}

export interface InteractiveComponentSpec {
  component: string;
  props: Record<string, unknown>;
}

// ── Layer 2: Variable Parameter Pools ─────────────────────────────────

export interface VariablePool {
  templateId: string;
  parameters: VariableParameter[];
}

export interface VariableParameter {
  name: string;
  values: VariableValue[];
  constraints?: string;
}

export interface VariableValue {
  id: string;
  value: string | number;
  metadata?: Record<string, string>;
}

// ── Layer 3: Generated Scenario Output ────────────────────────────────

export interface GeneratedScenario {
  instanceId: string;
  templateId: string;
  blockId: string;
  stageNumber: number;
  scenarioBrief: string;
  taskData: TaskData;
  questions: GeneratedQuestion[];
  bridgeText: string;
  variablesUsed: Record<string, string>;
  generatedAt: string;
  isStatic: boolean;
  /** How this scenario was produced (ai-live, ai-cached, fallback, preview). */
  generationSource: GenerationSource;
}

export interface TaskData {
  type: 'sort' | 'identify' | 'calculate' | 'allocate' | 'match' | 'compare' | 'free-text' | 'review' | 'fact-find' | 'table';
  items: TaskItem[];
  correctAnswer?: Record<string, unknown>;
  evaluationRubric?: EvaluationRubric;
}

export interface TaskItem {
  id: string;
  label: string;
  value?: string | number;
  category?: string;
  metadata?: Record<string, string>;
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface EvaluationRubric {
  criteria: {
    name: string;
    description: string;
    weight: number;
  }[];
  passThreshold: number;
}

// ── Cross-stage Session State ─────────────────────────────────────────

export interface BlockSession {
  sessionId: string;
  blockId: string;
  startedAt: string;
  currentStage: number;
  stagesCompleted: number[];
  generatedContext: Record<string, unknown>;
  totalXP: number;
  isReplay: boolean;
}
