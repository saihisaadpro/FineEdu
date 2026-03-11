import type { ScenarioTemplate, VariablePool } from '@/types/content';

// ── Accounting Block (Lead: Rui) — 4 Stages ──────────────────────────

export const accountingTemplates: ScenarioTemplate[] = [
  {
    templateId: 'acc_stage_1',
    blockId: 'accounting',
    stageNumber: 1,
    stageTitle: 'Recording Transactions',
    pedagogicalGoal: 'Understand that every business transaction must be recorded and categorised correctly',
    workplaceSetting: 'A small but growing company in the Bristol area',
    learnerRole: 'New accounting assistant in the finance team',
    taskType: 'Sort 6-10 source documents into categories; identify money in/out; spot one unusual item',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'basic categorisation' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'money in vs money out' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'unusual item identification' },
      { difficulty: 'medium', questionType: 'ordering', focusArea: 'transaction sequence' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'impact on accounts' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'when to escalate' },
    ],
    promptSkeleton: `Generate a scenario for an accounting assistant at {{company_name}}, a {{company_sector}} business in Bristol.
The company has received {{transaction_count}} source documents this week.
Include transactions totalling between {{min_amount}} and {{max_amount}}.
One transaction is unusual: {{unusual_item_type}}.
Generate: scenario_brief (3-5 sentences), task_data (array of transaction items with categories),
6 questions matching the difficulty pattern, and bridge_text (transition to Stage 2).`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['categorisation', 'money-in-vs-out'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Having recorded all the transactions, {{manager_name}} asks you to help prepare the monthly financial statements...',
    interactiveComponents: [
      { component: 'TransactionSorter', props: { categories: ['Income', 'Expense', 'Asset', 'Liability'] } },
    ],
  },
  {
    templateId: 'acc_stage_2',
    blockId: 'accounting',
    stageNumber: 2,
    stageTitle: 'Reading Financial Statements',
    pedagogicalGoal: 'Interpret a simple profit-and-loss statement and balance sheet; understand what the numbers mean for business health',
    workplaceSetting: 'The same small company, one week later',
    learnerRole: 'Accounting assistant reviewing monthly reports',
    taskType: 'Identify key figures in a P&L and balance sheet; calculate a simple ratio; flag one concern',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'reading P&L line items' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'balance sheet basics' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'profit margin interpretation' },
      { difficulty: 'medium', questionType: 'matching', focusArea: 'linking transactions to statements' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'identifying financial risk' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'recommending action' },
    ],
    promptSkeleton: `Continue the scenario at {{company_name}} ({{company_sector}}).
The learner previously sorted {{transaction_count}} transactions.
Now present a simplified monthly P&L showing revenue of {{revenue_figure}} and expenses of {{expense_figure}}.
Include one line item that looks {{concern_type}}.
Generate: scenario_brief referencing previous stage, task_data with financial statement items,
6 questions, and bridge_text transitioning to Stage 3.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['reading-pnl', 'balance-sheet-basics'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Now that you understand the monthly figures, {{manager_name}} wants you to help manage the tax obligations...',
    interactiveComponents: [
      { component: 'FinancialStatementTable', props: { type: 'pnl' } },
    ],
  },
  {
    templateId: 'acc_stage_3',
    blockId: 'accounting',
    stageNumber: 3,
    stageTitle: 'Tax Basics & Compliance',
    pedagogicalGoal: 'Understand basic tax obligations (PAYE, NI, VAT), deadlines, and the consequences of non-compliance',
    workplaceSetting: 'The company is approaching a tax reporting deadline',
    learnerRole: 'Accounting assistant supporting the tax submission process',
    taskType: 'Match tax types to obligations; calculate a simple PAYE/NI deduction; identify a deadline',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'tax type identification' },
      { difficulty: 'easy', questionType: 'matching', focusArea: 'tax-to-obligation matching' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'PAYE calculation basics' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'deadline awareness' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'consequences of non-compliance' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'when to seek professional help' },
    ],
    promptSkeleton: `Continue at {{company_name}} ({{company_sector}}).
A tax deadline is approaching on {{deadline_date}}.
The business has {{employee_count}} employees with a total monthly payroll of {{payroll_figure}}.
One issue has arisen: {{tax_issue}}.
Generate: scenario_brief, task_data with tax items to match/calculate,
6 questions, and bridge_text leading to Stage 4.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['tax-types', 'deadline-awareness'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'With tax matters under control, {{manager_name}} asks you to prepare a summary memo for the business owner...',
    interactiveComponents: [
      { component: 'TaxMatcher', props: { taxTypes: ['PAYE', 'NI', 'VAT', 'Corporation Tax'] } },
    ],
  },
  {
    templateId: 'acc_stage_4',
    blockId: 'accounting',
    stageNumber: 4,
    stageTitle: 'Workplace Accounting Judgement',
    pedagogicalGoal: 'Apply accounting knowledge to a realistic workplace scenario with competing priorities and write a recommendation',
    workplaceSetting: 'The company faces a financial decision that requires judgement',
    learnerRole: 'Accounting assistant asked to write a brief recommendation to the owner',
    taskType: 'Review a scenario with trade-offs; write a free-text recommendation (evaluated by AI)',
    questionPatterns: [
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'identifying trade-offs' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'prioritising actions' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'risk assessment' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'professional communication' },
    ],
    promptSkeleton: `Final stage at {{company_name}} ({{company_sector}}).
The owner must decide between {{decision_option_a}} and {{decision_option_b}}.
Each option has financial and practical trade-offs.
The learner must consider information from all previous stages.
Generate: scenario_brief with the dilemma, task_data (free-text type with evaluation rubric),
4 questions, and a concluding bridge_text congratulating the learner.`,
    stageGate: {
      minCorrectPercent: 50,
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Excellent work. You\'ve completed the full accounting mission for {{company_name}}. Your recommendation has been shared with the business owner.',
    interactiveComponents: [
      { component: 'FreeTextResponse', props: { maxWords: 300, rubricVisible: true } },
    ],
  },
];

export const accountingVariables: VariablePool[] = [
  {
    templateId: 'acc_stage_1',
    parameters: [
      {
        name: 'company_name',
        values: [
          { id: 'c1', value: 'Bristol Bakes Ltd' },
          { id: 'c2', value: 'Harbour View Care Home' },
          { id: 'c3', value: 'Clifton Cycles' },
          { id: 'c4', value: 'Temple Meads Catering' },
        ],
      },
      {
        name: 'company_sector',
        values: [
          { id: 's1', value: 'bakery and cafe' },
          { id: 's2', value: 'residential care' },
          { id: 's3', value: 'bicycle retail and repair' },
          { id: 's4', value: 'event catering' },
        ],
      },
      {
        name: 'unusual_item_type',
        values: [
          { id: 'u1', value: 'a personal expense paid from the business account' },
          { id: 'u2', value: 'a duplicate supplier invoice' },
          { id: 'u3', value: 'a refund processed as income' },
          { id: 'u4', value: 'an uncategorised cash withdrawal' },
        ],
      },
      {
        name: 'transaction_count',
        values: [
          { id: 'tc1', value: '6' },
          { id: 'tc2', value: '8' },
          { id: 'tc3', value: '10' },
        ],
        constraints: 'Always between 6 and 10 transactions',
      },
      {
        name: 'min_amount',
        values: [{ id: 'mn1', value: '£45' }, { id: 'mn2', value: '£30' }, { id: 'mn3', value: '£50' }],
      },
      {
        name: 'max_amount',
        values: [{ id: 'mx1', value: '£2,500' }, { id: 'mx2', value: '£3,000' }, { id: 'mx3', value: '£1,800' }],
      },
      {
        name: 'manager_name',
        values: [{ id: 'mg1', value: 'Sarah' }, { id: 'mg2', value: 'David' }, { id: 'mg3', value: 'Priya' }],
      },
    ],
  },
  {
    templateId: 'acc_stage_2',
    parameters: [
      {
        name: 'revenue_figure',
        values: [{ id: 'r1', value: '£12,400' }, { id: 'r2', value: '£8,900' }, { id: 'r3', value: '£15,200' }],
      },
      {
        name: 'expense_figure',
        values: [{ id: 'e1', value: '£9,800' }, { id: 'e2', value: '£7,600' }, { id: 'e3', value: '£13,100' }],
      },
      {
        name: 'concern_type',
        values: [
          { id: 'ct1', value: 'unusually high compared to last month' },
          { id: 'ct2', value: 'inconsistent with the transaction records' },
          { id: 'ct3', value: 'not categorised under the correct heading' },
        ],
      },
    ],
  },
  {
    templateId: 'acc_stage_3',
    parameters: [
      {
        name: 'deadline_date',
        values: [{ id: 'd1', value: '5th April' }, { id: 'd2', value: '19th January' }, { id: 'd3', value: '31st July' }],
      },
      {
        name: 'employee_count',
        values: [{ id: 'ec1', value: '5' }, { id: 'ec2', value: '8' }, { id: 'ec3', value: '12' }],
      },
      {
        name: 'payroll_figure',
        values: [{ id: 'p1', value: '£9,200' }, { id: 'p2', value: '£14,500' }, { id: 'p3', value: '£18,000' }],
      },
      {
        name: 'tax_issue',
        values: [
          { id: 'ti1', value: 'a new employee started mid-month and their tax code has not been confirmed' },
          { id: 'ti2', value: 'the VAT return includes an invoice that was cancelled after payment' },
          { id: 'ti3', value: 'an employee queried their National Insurance deduction amount' },
        ],
      },
    ],
  },
  {
    templateId: 'acc_stage_4',
    parameters: [
      {
        name: 'decision_option_a',
        values: [
          { id: 'a1', value: 'investing £5,000 in new equipment to increase production capacity' },
          { id: 'a2', value: 'hiring a part-time bookkeeper to improve record-keeping accuracy' },
          { id: 'a3', value: 'switching to a cloud accounting system to save time on manual processes' },
        ],
      },
      {
        name: 'decision_option_b',
        values: [
          { id: 'b1', value: 'keeping the cash reserve for unexpected expenses over the next quarter' },
          { id: 'b2', value: 'using the budget to settle an outstanding supplier invoice early for a discount' },
          { id: 'b3', value: 'continuing with the existing system but training staff on better practices' },
        ],
      },
    ],
  },
];
