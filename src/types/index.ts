export type Role = 'guest' | 'student' | 'pin_learner' | 'facilitator' | 'lecturer' | 'admin';

export type ModuleId = 'accounting' | 'investment' | 'management' | 'fintech';

export interface Topic {
  id: string;
  title: string;
  moduleId: ModuleId;
}

export interface Module {
  id: ModuleId;
  title: string;
  description: string;
  icon: string;
  lead: string; // Added lead property
  topics: Topic[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'new' | 'remedial' | 'bank';
  isCustom?: boolean; // To mark questions manually added/edited by lecturer
}

export interface AssessmentState {
  isActive: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  currentQuestion: Question | null;
  history: { questionId: string; correct: boolean }[];
  loading: boolean;
  feedbackGiven: boolean; // Whether the user has answered the current question
  selectedOptionIndex: number | null;
  score: number;
}

export interface TestBank {
  topicId: string;
  questions: Question[];
  isReleased: boolean;
}

export interface MissionDossier {
  role: string;
  location: string;
  situation: string;
  objective: string;
  keyPoints: {
    concept: string; // The short title/concept (e.g., "Tax Allowance")
    brief: string;   // One sentence summary
    detailedExplanation: string; // Deeper explanation
    realWorldExample: string; // Practical example
  }[];
}