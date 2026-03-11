import type { ScenarioTemplate, VariablePool } from '@/types/content';

// ── Investment / Future Security Block (Lead: Helen) — 4 Stages ──────

export const investmentTemplates: ScenarioTemplate[] = [
  {
    templateId: 'inv_stage_1',
    blockId: 'investment',
    stageNumber: 1,
    stageTitle: 'Understanding Financial Risk',
    pedagogicalGoal: 'Understand that all financial choices carry risk and that risk varies by product, time horizon, and personal circumstance',
    workplaceSetting: 'A community financial wellbeing session in a Bristol library',
    learnerRole: 'Participant helping a friend make sense of different savings and investment options',
    taskType: 'Sort 6-8 financial products by risk level (low/medium/high); identify one mismatch between product and goal',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'risk level identification' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'savings vs investment distinction' },
      { difficulty: 'medium', questionType: 'ordering', focusArea: 'risk spectrum ordering' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'matching product to goal' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'risk tolerance assessment' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'trade-off analysis' },
    ],
    promptSkeleton: `Generate a scenario for a community financial wellbeing session.
{{participant_name}} wants to understand the risk of different options for their {{financial_goal}}.
They have {{available_amount}} to consider, with a time horizon of {{time_horizon}}.
Include {{product_count}} financial products varying from low to high risk.
One product is a poor match: {{mismatch_type}}.
Generate: scenario_brief, task_data (sort items by risk level),
6 questions, and bridge_text to Stage 2.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['risk-levels', 'product-goal-matching'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Now that {{participant_name}} understands risk basics, they want to know more about long-term security options like pensions...',
    interactiveComponents: [
      { component: 'RiskSorter', props: { levels: ['Low', 'Medium', 'High'] } },
    ],
  },
  {
    templateId: 'inv_stage_2',
    blockId: 'investment',
    stageNumber: 2,
    stageTitle: 'Pensions & Long-term Security',
    pedagogicalGoal: 'Understand how workplace pensions work, employer contributions, and why starting early matters',
    workplaceSetting: 'A workplace induction session covering employee benefits',
    learnerRole: 'New employee reviewing pension options during onboarding',
    taskType: 'Compare 3 pension scenarios with different contribution levels; calculate projected outcomes; identify the employer match',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'what is a pension' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'employer contribution basics' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'contribution impact over time' },
      { difficulty: 'medium', questionType: 'matching', focusArea: 'pension terms' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'making the best pension choice' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'early vs late start comparison' },
    ],
    promptSkeleton: `Continue the investment journey.
{{participant_name}} has started a new job at {{employer_name}} with a salary of {{salary}}.
The employer offers a pension scheme matching up to {{employer_match_percent}}%.
Present {{scenario_count}} pension contribution options with different monthly amounts.
Show projected values over {{projection_years}} years.
Generate: scenario_brief, task_data with pension comparison items,
6 questions, and bridge_text to Stage 3.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['pension-basics', 'employer-contribution'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'With a pension plan in place, {{participant_name}} now wants to explore whether other investment options could complement their long-term security...',
    interactiveComponents: [
      { component: 'PensionComparator', props: { scenarios: 3 } },
    ],
  },
  {
    templateId: 'inv_stage_3',
    blockId: 'investment',
    stageNumber: 3,
    stageTitle: 'Responsible Investment Basics',
    pedagogicalGoal: 'Understand ESG principles, the difference between ethical and standard funds, and how to evaluate claims',
    workplaceSetting: 'A community workshop on responsible finance',
    learnerRole: 'Community member evaluating investment fund options for their pension or ISA',
    taskType: 'Compare 4 fund descriptions; identify genuine ESG features vs marketing claims; match funds to values',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'what ESG stands for' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'ethical vs standard fund' },
      { difficulty: 'medium', questionType: 'matching', focusArea: 'ESG criteria matching' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'greenwashing identification' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'balanced fund evaluation' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'values-aligned decision making' },
    ],
    promptSkeleton: `Continue the journey.
{{participant_name}} is considering investment options and has heard about responsible investing.
Present {{fund_count}} fund descriptions. At least one is {{greenwash_type}}.
Each fund has different returns, risk levels, and ESG credentials.
Generate: scenario_brief, task_data (compare/match type with fund items),
6 questions, and bridge_text to Stage 4.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['esg-basics', 'greenwashing-awareness'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Armed with knowledge about risk, pensions, and responsible options, {{participant_name}} is now ready to build a complete financial resilience plan...',
    interactiveComponents: [
      { component: 'FundComparator', props: { fundCount: 4 } },
    ],
  },
  {
    templateId: 'inv_stage_4',
    blockId: 'investment',
    stageNumber: 4,
    stageTitle: 'Building Financial Resilience',
    pedagogicalGoal: 'Apply all investment knowledge to create a balanced personal financial plan considering risk, time, and values',
    workplaceSetting: 'A one-to-one financial planning review',
    learnerRole: 'Person creating a financial resilience plan with guidance from a mentor',
    taskType: 'Review a scenario with competing priorities; write a free-text financial plan recommendation',
    questionPatterns: [
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'prioritising financial goals' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'emergency fund importance' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'allocating limited resources' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'long-term vs short-term trade-offs' },
    ],
    promptSkeleton: `Final stage.
{{participant_name}} earns {{income}} per month, has {{debt_situation}}, and wants to achieve {{primary_goal}}.
They must balance {{competing_priority_a}} with {{competing_priority_b}}.
The learner should draw on risk, pension, and ESG knowledge from earlier stages.
Generate: scenario_brief with the full situation, task_data (free-text with rubric),
4 questions, and concluding bridge_text.`,
    stageGate: {
      minCorrectPercent: 50,
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Outstanding work. {{participant_name}} now has a clear financial resilience plan. You\'ve completed the Future Security mission.',
    interactiveComponents: [
      { component: 'FreeTextResponse', props: { maxWords: 300, rubricVisible: true } },
    ],
  },
];

export const investmentVariables: VariablePool[] = [
  {
    templateId: 'inv_stage_1',
    parameters: [
      {
        name: 'participant_name',
        values: [{ id: 'p1', value: 'Jordan' }, { id: 'p2', value: 'Aisha' }, { id: 'p3', value: 'Marcus' }, { id: 'p4', value: 'Cerys' }],
      },
      {
        name: 'financial_goal',
        values: [
          { id: 'g1', value: 'saving for a house deposit over 5 years' },
          { id: 'g2', value: 'building an emergency fund over 12 months' },
          { id: 'g3', value: 'growing money for retirement in 30 years' },
        ],
      },
      {
        name: 'available_amount',
        values: [{ id: 'a1', value: '£3,000' }, { id: 'a2', value: '£1,500' }, { id: 'a3', value: '£5,000' }],
      },
      {
        name: 'time_horizon',
        values: [{ id: 'th1', value: '1-2 years' }, { id: 'th2', value: '5-10 years' }, { id: 'th3', value: '20+ years' }],
      },
      {
        name: 'product_count',
        values: [{ id: 'pc1', value: '6' }, { id: 'pc2', value: '7' }, { id: 'pc3', value: '8' }],
      },
      {
        name: 'mismatch_type',
        values: [
          { id: 'm1', value: 'a high-risk stocks & shares ISA recommended for a 6-month emergency fund' },
          { id: 'm2', value: 'a fixed-term bond locking money away when it is needed within the year' },
          { id: 'm3', value: 'a cryptocurrency fund marketed as low-risk for retirement savings' },
        ],
      },
    ],
  },
  {
    templateId: 'inv_stage_2',
    parameters: [
      {
        name: 'employer_name',
        values: [{ id: 'en1', value: 'Avon Health Trust' }, { id: 'en2', value: 'Bristol City Logistics' }, { id: 'en3', value: 'Redcliffe Retail Group' }],
      },
      {
        name: 'salary',
        values: [{ id: 'sl1', value: '£24,000 per year' }, { id: 'sl2', value: '£28,500 per year' }, { id: 'sl3', value: '£22,000 per year' }],
      },
      {
        name: 'employer_match_percent',
        values: [{ id: 'em1', value: '3' }, { id: 'em2', value: '5' }, { id: 'em3', value: '4' }],
      },
      {
        name: 'scenario_count',
        values: [{ id: 'sc1', value: '3' }],
      },
      {
        name: 'projection_years',
        values: [{ id: 'py1', value: '20' }, { id: 'py2', value: '30' }, { id: 'py3', value: '25' }],
      },
    ],
  },
  {
    templateId: 'inv_stage_3',
    parameters: [
      {
        name: 'fund_count',
        values: [{ id: 'fc1', value: '4' }],
      },
      {
        name: 'greenwash_type',
        values: [
          { id: 'gw1', value: 'labelled "green" but invested heavily in fossil fuel companies' },
          { id: 'gw2', value: 'using ESG branding but with no published exclusion criteria' },
          { id: 'gw3', value: 'claiming carbon neutrality while funding deforestation-linked firms' },
        ],
      },
    ],
  },
  {
    templateId: 'inv_stage_4',
    parameters: [
      {
        name: 'income',
        values: [{ id: 'i1', value: '£1,800' }, { id: 'i2', value: '£2,200' }, { id: 'i3', value: '£1,500' }],
      },
      {
        name: 'debt_situation',
        values: [
          { id: 'ds1', value: '£800 remaining on a credit card' },
          { id: 'ds2', value: 'no debt but no savings either' },
          { id: 'ds3', value: '£2,000 in student overdraft' },
        ],
      },
      {
        name: 'primary_goal',
        values: [
          { id: 'pg1', value: 'save £1,000 for an emergency fund within 6 months' },
          { id: 'pg2', value: 'start pension contributions as early as possible' },
          { id: 'pg3', value: 'clear all debt before starting to save' },
        ],
      },
      {
        name: 'competing_priority_a',
        values: [
          { id: 'ca1', value: 'paying off debt quickly' },
          { id: 'ca2', value: 'building a safety net first' },
          { id: 'ca3', value: 'taking advantage of employer pension matching now' },
        ],
      },
      {
        name: 'competing_priority_b',
        values: [
          { id: 'cb1', value: 'starting long-term saving for retirement' },
          { id: 'cb2', value: 'putting money aside for a housing deposit' },
          { id: 'cb3', value: 'setting aside money for career development training' },
        ],
      },
    ],
  },
];
