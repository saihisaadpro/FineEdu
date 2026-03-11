import type { ScenarioTemplate, VariablePool } from '@/types/content';

// ── Household Management Block (Lead: Yan) — 4 Stages ────────────────

export const managementTemplates: ScenarioTemplate[] = [
  {
    templateId: 'mgt_stage_1',
    blockId: 'management',
    stageNumber: 1,
    stageTitle: 'Mastering Household Cashflow',
    pedagogicalGoal: 'Understand the difference between income and expenditure, categorise essential vs discretionary spending, and map monthly cashflow',
    workplaceSetting: 'A local budgeting support workshop in a Bristol community centre',
    learnerRole: 'Workshop participant creating their first household budget',
    taskType: 'Sort 8-12 household items into essential/discretionary; calculate monthly surplus or deficit; spot one timing risk',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'essential vs discretionary' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'income identification' },
      { difficulty: 'medium', questionType: 'ordering', focusArea: 'payment priority ordering' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'surplus/deficit calculation' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'timing risk identification' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'cashflow improvement strategy' },
    ],
    promptSkeleton: `Generate a scenario for a household budgeting workshop.
{{person_name}} earns {{income_amount}} per month from {{income_source}}.
They have {{item_count}} regular outgoings.
One payment falls at a difficult time: {{timing_issue}}.
Generate: scenario_brief, task_data (sort items into essential/discretionary with amounts),
6 questions, and bridge_text to Stage 2.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['essential-vs-discretionary', 'cashflow-timing'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Now that {{person_name}} can see their monthly cashflow clearly, the workshop moves on to handling income that doesn\'t arrive regularly...',
    interactiveComponents: [
      { component: 'BudgetSorter', props: { categories: ['Essential', 'Discretionary'] } },
    ],
  },
  {
    templateId: 'mgt_stage_2',
    blockId: 'management',
    stageNumber: 2,
    stageTitle: 'Managing Irregular Income',
    pedagogicalGoal: 'Learn strategies for budgeting when income varies week to week — smoothing, minimum baselines, and priority stacking',
    workplaceSetting: 'The same workshop, now focusing on irregular earners',
    learnerRole: 'Workshop participant who works variable hours or has multiple income sources',
    taskType: 'Allocate variable income across fixed obligations using a priority stack; identify the minimum viable budget',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'variable income basics' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'priority stacking concept' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'minimum baseline calculation' },
      { difficulty: 'medium', questionType: 'ordering', focusArea: 'obligation priority order' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'income smoothing strategies' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'worst-case scenario planning' },
    ],
    promptSkeleton: `Continue the workshop.
{{person_name}} now works {{work_pattern}} and earns between {{min_income}} and {{max_income}} per month.
They have {{fixed_obligation_count}} fixed obligations totalling {{fixed_total}}.
In a bad month, they fall short by {{shortfall}}.
Generate: scenario_brief, task_data (allocate items from a priority stack),
6 questions, and bridge_text to Stage 3.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['priority-stacking', 'minimum-baseline'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'With a priority stack in place, the workshop now addresses the next challenge — what to do when debt is already part of the picture...',
    interactiveComponents: [
      { component: 'PriorityAllocator', props: { maxCategories: 5 } },
    ],
  },
  {
    templateId: 'mgt_stage_3',
    blockId: 'management',
    stageNumber: 3,
    stageTitle: 'Debt Awareness & Management',
    pedagogicalGoal: 'Distinguish between manageable and problem debt; understand priority vs non-priority debts; know where to get free help',
    workplaceSetting: 'A debt awareness session at a community advice centre',
    learnerRole: 'Participant reviewing a realistic debt scenario to identify the safest path forward',
    taskType: 'Sort debts into priority/non-priority; match debts to consequences; identify one action that could make things worse',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'priority vs non-priority debt' },
      { difficulty: 'easy', questionType: 'matching', focusArea: 'debt type consequences' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'debt management options' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'avoiding harmful actions' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'negotiating with creditors' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'knowing when to seek help' },
    ],
    promptSkeleton: `Continue the session.
{{person_name}} has {{debt_count}} debts totalling {{total_debt}}.
These include {{debt_types}}.
One action they are considering is {{risky_action}}, which could make things worse.
Generate: scenario_brief, task_data (sort debts by priority with consequences),
6 questions, and bridge_text to Stage 4.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['priority-debt', 'free-help-awareness'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'With debt under control, {{person_name}} is ready to build a longer-term stability plan that brings together everything learned so far...',
    interactiveComponents: [
      { component: 'DebtSorter', props: { categories: ['Priority', 'Non-priority'] } },
    ],
  },
  {
    templateId: 'mgt_stage_4',
    blockId: 'management',
    stageNumber: 4,
    stageTitle: 'Planning for Stability',
    pedagogicalGoal: 'Combine cashflow, irregular income, and debt knowledge to build a realistic stability plan with small, achievable steps',
    workplaceSetting: 'A one-to-one planning session with a household adviser',
    learnerRole: 'Person creating a 3-month financial stability plan',
    taskType: 'Review a complex household scenario; write a free-text stability plan recommendation',
    questionPatterns: [
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'combining budgeting strategies' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'realistic goal setting' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'prioritising competing demands' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'building sustainable habits' },
    ],
    promptSkeleton: `Final stage.
{{person_name}} has irregular income of {{income_range}}, {{debt_summary}}, and wants to achieve {{stability_goal}}.
They must balance {{pressure_a}} with {{pressure_b}}.
Draw on all previous stage knowledge.
Generate: scenario_brief, task_data (free-text with rubric),
4 questions, and concluding bridge_text.`,
    stageGate: {
      minCorrectPercent: 50,
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Brilliant work. {{person_name}} now has a clear 3-month stability plan. You\'ve completed the Household Management mission.',
    interactiveComponents: [
      { component: 'FreeTextResponse', props: { maxWords: 300, rubricVisible: true } },
    ],
  },
];

export const managementVariables: VariablePool[] = [
  {
    templateId: 'mgt_stage_1',
    parameters: [
      {
        name: 'person_name',
        values: [{ id: 'p1', value: 'Keisha' }, { id: 'p2', value: 'Tom' }, { id: 'p3', value: 'Fatima' }, { id: 'p4', value: 'Liam' }],
      },
      {
        name: 'income_amount',
        values: [{ id: 'ia1', value: '£1,400' }, { id: 'ia2', value: '£1,750' }, { id: 'ia3', value: '£1,200' }],
      },
      {
        name: 'income_source',
        values: [
          { id: 'is1', value: 'a part-time retail job' },
          { id: 'is2', value: 'a zero-hours care work contract' },
          { id: 'is3', value: 'Universal Credit plus part-time cleaning work' },
        ],
      },
      {
        name: 'item_count',
        values: [{ id: 'ic1', value: '8' }, { id: 'ic2', value: '10' }, { id: 'ic3', value: '12' }],
      },
      {
        name: 'timing_issue',
        values: [
          { id: 'ti1', value: 'rent is due on the 1st but wages arrive on the 15th' },
          { id: 'ti2', value: 'council tax and electricity both leave on the same day' },
          { id: 'ti3', value: 'a quarterly water bill arrives the same week as a car insurance renewal' },
        ],
      },
    ],
  },
  {
    templateId: 'mgt_stage_2',
    parameters: [
      {
        name: 'work_pattern',
        values: [
          { id: 'wp1', value: 'variable hours on a zero-hours contract' },
          { id: 'wp2', value: 'two part-time jobs with different pay dates' },
          { id: 'wp3', value: 'self-employed with seasonal demand' },
        ],
      },
      {
        name: 'min_income',
        values: [{ id: 'mi1', value: '£800' }, { id: 'mi2', value: '£950' }, { id: 'mi3', value: '£700' }],
      },
      {
        name: 'max_income',
        values: [{ id: 'xi1', value: '£1,600' }, { id: 'xi2', value: '£1,900' }, { id: 'xi3', value: '£1,400' }],
      },
      {
        name: 'fixed_obligation_count',
        values: [{ id: 'fo1', value: '5' }, { id: 'fo2', value: '6' }, { id: 'fo3', value: '7' }],
      },
      {
        name: 'fixed_total',
        values: [{ id: 'ft1', value: '£1,100' }, { id: 'ft2', value: '£950' }, { id: 'ft3', value: '£1,250' }],
      },
      {
        name: 'shortfall',
        values: [{ id: 'sf1', value: '£300' }, { id: 'sf2', value: '£150' }, { id: 'sf3', value: '£450' }],
      },
    ],
  },
  {
    templateId: 'mgt_stage_3',
    parameters: [
      {
        name: 'debt_count',
        values: [{ id: 'dc1', value: '3' }, { id: 'dc2', value: '4' }, { id: 'dc3', value: '5' }],
      },
      {
        name: 'total_debt',
        values: [{ id: 'td1', value: '£3,200' }, { id: 'td2', value: '£5,800' }, { id: 'td3', value: '£2,100' }],
      },
      {
        name: 'debt_types',
        values: [
          { id: 'dt1', value: 'council tax arrears, a credit card, and a catalogue account' },
          { id: 'dt2', value: 'rent arrears, a bank overdraft, and a mobile phone contract debt' },
          { id: 'dt3', value: 'an energy bill debt, a doorstep loan, and a buy-now-pay-later balance' },
        ],
      },
      {
        name: 'risky_action',
        values: [
          { id: 'ra1', value: 'taking out a payday loan to cover the council tax arrears' },
          { id: 'ra2', value: 'ignoring letters from the energy company hoping they will stop' },
          { id: 'ra3', value: 'borrowing from a friend to pay off the catalogue, creating social pressure' },
        ],
      },
    ],
  },
  {
    templateId: 'mgt_stage_4',
    parameters: [
      {
        name: 'income_range',
        values: [
          { id: 'ir1', value: '£900-£1,500 per month' },
          { id: 'ir2', value: '£1,100-£1,800 per month' },
          { id: 'ir3', value: '£750-£1,300 per month' },
        ],
      },
      {
        name: 'debt_summary',
        values: [
          { id: 'ds1', value: '£1,500 in priority debt being repaid at £60/month' },
          { id: 'ds2', value: 'no debt but zero savings' },
          { id: 'ds3', value: '£800 in non-priority debt on a repayment plan' },
        ],
      },
      {
        name: 'stability_goal',
        values: [
          { id: 'sg1', value: 'build a £500 emergency buffer within 3 months' },
          { id: 'sg2', value: 'stop using overdraft by the end of month 2' },
          { id: 'sg3', value: 'have all bills paid on time for 3 consecutive months' },
        ],
      },
      {
        name: 'pressure_a',
        values: [
          { id: 'pa1', value: 'a child needing new school uniform and shoes' },
          { id: 'pa2', value: 'a broken washing machine that needs replacing' },
          { id: 'pa3', value: 'transport costs increasing due to a change in working hours' },
        ],
      },
      {
        name: 'pressure_b',
        values: [
          { id: 'pb1', value: 'a family birthday celebration that everyone expects' },
          { id: 'pb2', value: 'a training course that could lead to better-paid work' },
          { id: 'pb3', value: 'pressure from friends to contribute to a group holiday fund' },
        ],
      },
    ],
  },
];
