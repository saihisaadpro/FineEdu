import { Module, MissionDossier, Question, Topic } from './types';

interface TopicContent {
  dossier: MissionDossier;
  questions: Question[];
}

interface ModuleTemplate {
  role: string;
  location: string;
  situation: (topic: Topic) => string;
  objective: (topic: Topic) => string;
  keyPoints: MissionDossier['keyPoints'];
  questionFocus: string;
  firstAction: string;
  strongestCheck: string;
  riskToAvoid: string;
}

const templates: Record<Module['id'], ModuleTemplate> = {
  accounting: {
    role: 'Finance Support Officer',
    location: 'A workplace payroll and records desk',
    situation: (topic) =>
      `A learner needs help with ${topic.title.toLowerCase()} and wants a clear explanation they can apply at work straight away.`,
    objective: (topic) =>
      `Use the core ideas behind ${topic.title.toLowerCase()} to make a sound decision and explain it simply.`,
    keyPoints: [
      {
        concept: 'Check The Numbers',
        brief: 'Start by identifying the key figures and labels before deciding what they mean.',
        detailedExplanation: 'Most finance mistakes happen when someone reacts before checking the core figures, dates, and labels in front of them.',
        realWorldExample: 'A payslip, tax letter, or expense form should be reviewed line by line before conclusions are drawn.',
      },
      {
        concept: 'Match To Policy',
        brief: 'Use the relevant rule, process, or deadline instead of guessing.',
        detailedExplanation: 'Accounting and admin tasks are safer when they follow the stated process, especially around records, claims, and reporting.',
        realWorldExample: 'Checking an employer expense rule is stronger than assuming every receipt can be claimed.',
      },
      {
        concept: 'Keep Evidence',
        brief: 'Good records make corrections and explanations easier.',
        detailedExplanation: 'Documents, receipts, and clear notes provide a reliable trail when something needs to be checked or corrected later.',
        realWorldExample: 'Saving receipts and dated notes helps resolve questions about deductions or reimbursements.',
      },
    ],
    questionFocus: 'reading records accurately',
    firstAction: 'review the figures and the relevant paperwork carefully',
    strongestCheck: 'compare the figures against the correct process before acting',
    riskToAvoid: 'making assumptions without checking the supporting details',
  },
  investment: {
    role: 'Financial Wellbeing Mentor',
    location: 'A community financial planning session',
    situation: (topic) =>
      `A participant wants to understand ${topic.title.toLowerCase()} without jargon and needs help linking the concept to a real decision.`,
    objective: (topic) =>
      `Explain ${topic.title.toLowerCase()} in practical terms and choose the option that best balances long-term suitability and risk.`,
    keyPoints: [
      {
        concept: 'Suitability Matters',
        brief: 'The best choice depends on the person’s goal, timing, and tolerance for uncertainty.',
        detailedExplanation: 'A financial option should fit the person using it, not just sound attractive in the abstract.',
        realWorldExample: 'Short-term money usually needs more stability than long-term retirement savings.',
      },
      {
        concept: 'Look Beyond Headlines',
        brief: 'Returns, labels, or marketing claims are only one part of the picture.',
        detailedExplanation: 'People should understand the trade-offs behind any financial choice instead of focusing on one appealing message.',
        realWorldExample: 'A product marketed as responsible or high-growth still needs to be checked for risk and suitability.',
      },
      {
        concept: 'Review Over Time',
        brief: 'Long-term choices need periodic review as needs and circumstances change.',
        detailedExplanation: 'Financial plans work best when people revisit them rather than setting and forgetting them forever.',
        realWorldExample: 'A pension contribution level that worked last year may need updating after a job change.',
      },
    ],
    questionFocus: 'risk, suitability, and long-term thinking',
    firstAction: 'match the choice to the person’s goal and time horizon',
    strongestCheck: 'weigh risk and suitability together instead of chasing the headline promise',
    riskToAvoid: 'treating every person or every product as if it fits the same goal',
  },
  management: {
    role: 'Household Planning Adviser',
    location: 'A local budgeting support workshop',
    situation: (topic) =>
      `Someone is struggling with ${topic.title.toLowerCase()} and needs a practical way to organise day-to-day finances.`,
    objective: (topic) =>
      `Use ${topic.title.toLowerCase()} to build control, reduce surprises, and choose the most stable next step.`,
    keyPoints: [
      {
        concept: 'Know The Priorities',
        brief: 'Essentials should be identified before optional spending decisions are made.',
        detailedExplanation: 'Housing, food, utilities, and other essential commitments usually need to be planned first.',
        realWorldExample: 'A household budget works better when rent and bills are ring-fenced before discretionary spending.',
      },
      {
        concept: 'Plan For Timing',
        brief: 'When money arrives matters as much as how much arrives.',
        detailedExplanation: 'Cashflow pressure can happen even when totals look acceptable if bills and income land on awkward dates.',
        realWorldExample: 'A family may need to smooth payment dates if multiple large bills leave just before payday.',
      },
      {
        concept: 'Build Small Buffers',
        brief: 'Minor cushions reduce the damage caused by unexpected costs.',
        detailedExplanation: 'Small, repeatable buffers are often more realistic and more useful than vague plans to save later.',
        realWorldExample: 'A weekly buffer can help cover urgent travel, food, or household repairs.',
      },
    ],
    questionFocus: 'practical budgeting and prioritisation',
    firstAction: 'identify essentials and map the timing of cash in and cash out',
    strongestCheck: 'adjust the plan to reduce pressure before the problem gets worse',
    riskToAvoid: 'ignoring priorities until the household is forced into reactive decisions',
  },
  fintech: {
    role: 'Digital Finance Guide',
    location: 'A public digital skills drop-in',
    situation: (topic) =>
      `A learner uses digital money tools already, but wants safer and more confident habits around ${topic.title.toLowerCase()}.`,
    objective: (topic) =>
      `Apply ${topic.title.toLowerCase()} to everyday digital behaviour and choose the safest practical response.`,
    keyPoints: [
      {
        concept: 'Verify First',
        brief: 'Pause and confirm details before taking action online.',
        detailedExplanation: 'Digital payment and fraud problems often start with rushed clicks or unchecked instructions.',
        realWorldExample: 'Opening a banking app directly is safer than using an unexpected link in a message.',
      },
      {
        concept: 'Use Tools Deliberately',
        brief: 'Alerts, pots, and app features help only when they are understood and reviewed.',
        detailedExplanation: 'Convenience is useful, but users still need to know what a tool is doing and what it costs.',
        realWorldExample: 'A budgeting alert is valuable only if the person acts on it instead of ignoring it.',
      },
      {
        concept: 'Protect Access',
        brief: 'Credentials, codes, and devices must be treated as security tools.',
        detailedExplanation: 'Secure access habits reduce the chance of fraud, unauthorised payments, or account misuse.',
        realWorldExample: 'A one-time code should not be handed to an unexpected caller claiming to be from the bank.',
      },
    ],
    questionFocus: 'safer digital finance behaviour',
    firstAction: 'verify the request or payment details using a trusted route',
    strongestCheck: 'use built-in banking or payment controls to stay in control',
    riskToAvoid: 'responding quickly to urgency without checking whether the request is genuine',
  },
};

const makeQuestion = (
  id: string,
  difficulty: 'easy' | 'medium' | 'hard',
  text: string,
  options: string[],
  correctAnswerIndex: number,
  explanation: string,
): Question => ({
  id,
  difficulty,
  text,
  options,
  correctAnswerIndex,
  explanation,
  type: 'bank',
});

export const getTopicContent = (topic: Topic, module: Module): TopicContent => {
  const template = templates[module.id];

  return {
    dossier: {
      role: template.role,
      location: template.location,
      situation: template.situation(topic),
      objective: template.objective(topic),
      keyPoints: template.keyPoints,
    },
    questions: [
      makeQuestion(
        `${topic.id}-easy`,
        'easy',
        `You are helping with ${topic.title.toLowerCase()}. What is the best first move?`,
        [
          template.firstAction,
          'guess based on memory and move quickly',
          'skip the details because they are probably fine',
          'wait until the issue becomes urgent',
        ],
        0,
        `The strongest first move in ${topic.title.toLowerCase()} is to ${template.firstAction}.`,
      ),
      makeQuestion(
        `${topic.id}-medium`,
        'medium',
        `A realistic scenario in ${topic.title.toLowerCase()} is becoming unclear. What should you do next?`,
        [
          'act on the first explanation you hear',
          template.strongestCheck,
          'leave the decision to chance',
          'ignore the timetable and the supporting details',
        ],
        1,
        `The stronger option is to ${template.strongestCheck}, because ${template.questionFocus} depends on checking the situation properly.`,
      ),
      makeQuestion(
        `${topic.id}-hard`,
        'hard',
        `There is pressure to make a quick decision about ${topic.title.toLowerCase()}, but the situation has trade-offs. Which option is strongest?`,
        [
          template.riskToAvoid,
          'make the fastest choice and explain it later',
          'balance the evidence, priorities, and likely consequences before deciding',
          'focus on only one detail and ignore the rest',
        ],
        2,
        `The strongest response is to balance the evidence, priorities, and likely consequences before deciding. The risk to avoid is ${template.riskToAvoid}.`,
      ),
    ],
  };
};

export const buildInitialTestBanks = (modules: Module[]): Record<string, Question[]> =>
  Object.fromEntries(
    modules.flatMap((module) =>
      module.topics.map((topic) => [topic.id, getTopicContent(topic, module).questions] as const),
    ),
  );
