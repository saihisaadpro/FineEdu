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
    role: 'Investment Trainee',
    location: 'A financial advisory firm',
    situation: (topic) =>
      `A client has come in for a meeting and the senior adviser asks you to help with ${topic.title.toLowerCase()} as part of the suitability process.`,
    objective: (topic) =>
      `Apply ${topic.title.toLowerCase()} from a professional perspective, matching products to client needs with appropriate risk awareness.`,
    keyPoints: [
      {
        concept: 'Risk–Return Spectrum',
        brief: 'Every product sits somewhere on a risk–return spectrum; higher potential returns come with greater uncertainty.',
        detailedExplanation: 'Advisers must understand the full product range so they can match the right level of risk to each client’s situation.',
        realWorldExample: 'A Cash ISA is low risk and low return; a global equity fund is higher risk with higher potential growth.',
      },
      {
        concept: 'Client Suitability',
        brief: 'The best recommendation depends on the individual client’s circumstances, not on the product’s headline return.',
        detailedExplanation: 'Suitability considers income, goals, time horizon, risk tolerance, and capacity for loss — every client is different.',
        realWorldExample: 'A medium-risk fund may suit a 10-year saver but be unsuitable for someone who needs cash within 12 months.',
      },
      {
        concept: 'Stay the Course',
        brief: 'Short-term market volatility does not mean the plan has failed — patience is a professional principle.',
        detailedExplanation: 'Advisers help clients stay rational when markets move, avoiding panic selling that locks in losses.',
        realWorldExample: 'An 8% market dip may feel alarming, but historically markets have recovered from similar drops within 12–18 months.',
      },
    ],
    questionFocus: 'risk–return awareness, client suitability, and portfolio diversification',
    firstAction: 'review the client’s profile and match products to their specific situation',
    strongestCheck: 'verify the recommendation is consistent with the client’s risk tolerance and time horizon',
    riskToAvoid: 'recommending products based on return potential alone without considering suitability',
  },
  management: {
    role: 'Finance Intern',
    location: 'A mid-size UK import company',
    situation: (topic) =>
      `The finance director asks you to help analyse ${topic.title.toLowerCase()} as part of the company’s quarterly financial review.`,
    objective: (topic) =>
      `Apply ${topic.title.toLowerCase()} to identify risks, evaluate options, and propose practical solutions for the business.`,
    keyPoints: [
      {
        concept: 'Cashflow Is Timing',
        brief: 'A company can be profitable on paper but short of cash because of when money arrives and leaves.',
        detailedExplanation: 'Corporate cashflow tracks the actual movement of money, not accounting profit. Timing mismatches between paying suppliers and collecting from customers create real pressure.',
        realWorldExample: 'An importer paying a supplier 30 days before customers pay creates a recurring cash gap every month.',
      },
      {
        concept: 'External Pressures Are Real',
        brief: 'Currency movements and market forces affect costs in ways the company cannot fully control.',
        detailedExplanation: 'Companies trading internationally face foreign exchange risk — the same invoice can cost more or less in sterling depending on when it is paid.',
        realWorldExample: 'A 5% weakening of the pound against the euro can add thousands to a single supplier payment.',
      },
      {
        concept: 'Every Funding Choice Has Trade-offs',
        brief: 'There is no free solution — every option involves balancing cost, speed, and relationship impact.',
        detailedExplanation: 'Short-term funding decisions require comparing dimensions beyond just financial cost, including speed of access and impact on key business relationships.',
        realWorldExample: 'An overdraft is fast but costs interest; renegotiating supplier terms is free but may strain the relationship.',
      },
    ],
    questionFocus: 'corporate cashflow, FX risk, and funding trade-offs',
    firstAction: 'map the cash inflows and outflows to identify timing gaps and pressure points',
    strongestCheck: 'compare funding options across cost, speed, and relationship impact before recommending',
    riskToAvoid: 'assuming the company is fine because it is profitable without checking actual cash availability',
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
