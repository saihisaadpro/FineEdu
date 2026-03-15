import type { ScenarioTemplate, VariablePool } from '@/types/content';

// ── Corporate Finance in Practice Block (Lead: Yan) — 4 Stages ───────
// Workplace setting: A mid-size UK company that imports goods from overseas suppliers
// Learner role: New finance intern supporting the finance director during a busy quarter
// Learning arc: Understand the Flows → Face External Pressure → Find Solutions → Plan Ahead

export const managementTemplates: ScenarioTemplate[] = [
  {
    templateId: 'mgt_stage_1',
    blockId: 'management',
    stageNumber: 1,
    stageTitle: 'Mapping the Company\'s Cashflow',
    pedagogicalGoal: 'Understand corporate cashflow as a timing and planning challenge, distinct from profitability. A company can be profitable on paper but short of cash in practice.',
    workplaceSetting: 'A mid-size UK company that imports goods from overseas suppliers',
    learnerRole: 'New finance intern supporting the finance director during a busy quarter',
    taskType: 'Read a simplified monthly cashflow statement; identify the three largest inflows and outflows; explain why the company can be profitable but cash-short; identify the low point in the monthly cash cycle',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'identifying inflows vs outflows' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'what cashflow means for a business' },
      { difficulty: 'medium', questionType: 'ordering', focusArea: 'ranking largest cash movements' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'profitable but cash-short explanation' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'identifying the cash low point' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'cashflow timing mismatch consequences' },
    ],
    promptSkeleton: `Generate a scenario for a finance intern at {{company_name}}, a {{company_sector}} company in {{company_location}}.
The company imports from {{source_country}} and pays suppliers in {{supplier_currency}}.
Monthly revenue is {{revenue_range}} from UK customers.
Outgoings include supplier payments, wages of {{wages}}, rent of {{rent}}, loan repayments, and VAT.
The key timing problem is: {{timing_problem}}.
Render the cashflow statement as a simple table with inflows and outflows by week or fortnight, with a running balance column.
Include a visual indicator for the cash low point.
Generate: scenario_brief, cashflow_data, 6 questions, and bridge_text to Stage 2.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['inflows-vs-outflows', 'cash-timing-gap'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'The intern now understands the rhythm. But this month, one of the supplier payments is higher than expected...',
    interactiveComponents: [
      { component: 'FinancialStatementTable', props: { type: 'cashflow', highlightLowPoint: true } },
    ],
  },
  {
    templateId: 'mgt_stage_2',
    blockId: 'management',
    stageNumber: 2,
    stageTitle: 'Foreign Exchange Impact',
    pedagogicalGoal: 'Understand that currency fluctuations directly affect a company\'s costs and see foreign exchange risk as a real, practical business issue rather than an abstract concept',
    workplaceSetting: 'The same import company — reviewing supplier invoices',
    learnerRole: 'Finance intern comparing invoices and calculating the impact of exchange rate changes',
    taskType: 'Compare two invoices for the same order at different exchange rates; calculate extra cost in sterling; explain what "the pound has weakened" means practically; learn hedging concept at a basic level',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'what an exchange rate is' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'impact of currency weakness on import costs' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'calculating GBP cost difference' },
      { difficulty: 'medium', questionType: 'matching', focusArea: 'matching currency movements to business impacts' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'basic hedging concept' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'FX risk management importance' },
    ],
    promptSkeleton: `Continue at {{company_name}}.
The company orders goods from {{source_country}} priced in {{supplier_currency}}.
Show two invoices side by side for the same order: same foreign-currency amount, different GBP equivalents.
Invoice 1: date {{invoice_1_date}}, rate {{rate_1}}, GBP total calculated.
Invoice 2: date {{invoice_2_date}}, rate {{rate_2}}, GBP total calculated.
The rate movement is {{rate_movement}}.
Include a simple calculator widget for the learner to work out the difference.
Include a 2–3 sentence hedging introduction in plain English.
Generate: scenario_brief, invoice_pair, hedging_intro, 6 questions, and bridge_text to Stage 3.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['fx-cost-calculation', 'currency-weakness-meaning'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'The FX hit means the company needs to think about whether it has enough cash to cover the rest of the quarter...',
    interactiveComponents: [
      { component: 'ComparisonCards', props: { cardCount: 2, showCalculator: true } },
    ],
  },
  {
    templateId: 'mgt_stage_3',
    blockId: 'management',
    stageNumber: 3,
    stageTitle: 'Funding the Shortfall',
    pedagogicalGoal: 'Evaluate short-term funding options and understand that every funding choice involves trade-offs in cost, speed, and relationship impact',
    workplaceSetting: 'The same company — the finance director asks for analysis of funding options',
    learnerRole: 'Finance intern researching and comparing funding options for the shortfall',
    taskType: 'Compare three funding options with clear cost, speed, and relationship dimensions; recommend one and explain trade-offs; identify consequences of inaction',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'what short-term funding means' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'identifying cost of funding' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'comparing speed vs cost trade-offs' },
      { difficulty: 'medium', questionType: 'matching', focusArea: 'matching options to trade-off dimensions' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'consequences of doing nothing' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'selecting and justifying best option' },
    ],
    promptSkeleton: `Continue at {{company_name}}.
The company needs short-term funding of approximately {{funding_gap}} to bridge the gap created by the cash timing issue (Stage 1) and the FX cost increase (Stage 2).
The funding is needed within {{funding_timeline}}.
Present exactly three funding options:
Option A: {{option_a}}
Option B: {{option_b}}
Option C: {{option_c}}
Each option must have a clear cost, speed, relationship risk, and approximate GBP impact.
The do-nothing scenario: {{do_nothing_consequence}}.
Render the three options as comparison cards with structured fields.
Generate: scenario_brief, funding options, do_nothing scenario, 6 questions, and bridge_text to Stage 4.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['funding-trade-offs', 'do-nothing-consequence'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'The finance director likes the analysis and asks a bigger question: how do we stop this kind of pressure happening every quarter?',
    interactiveComponents: [
      { component: 'ComparisonCards', props: { cardCount: 3, fields: ['cost', 'speed', 'relationship_risk', 'gbp_impact'] } },
    ],
  },
  {
    templateId: 'mgt_stage_4',
    blockId: 'management',
    stageNumber: 4,
    stageTitle: 'Building a Risk Management Plan',
    pedagogicalGoal: 'Integrate the three types of financial risk encountered across the block (cashflow timing, currency exposure, funding vulnerability) and propose protective measures. Corporate finance is fundamentally about anticipating and managing uncertainty, not just reacting to it.',
    workplaceSetting: 'The same company — preparing a summary for the finance director to present to the board',
    learnerRole: 'Finance intern drafting a risk management summary for the board',
    taskType: 'Review three risks from Stages 1–3; propose one realistic protective action per risk; explain why risk management matters for employees; draft a short board summary',
    questionPatterns: [
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'identifying the three risk types' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'proposing realistic protective actions' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'connecting risk management to employee wellbeing' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'integrating risks into a coherent plan' },
    ],
    promptSkeleton: `Final stage at {{company_name}}.
This stage must pull context from Stages 1–3: the company name, sector, currency pair, cashflow timing issue, FX impact, and funding choice from previous stages.
The intern must review three risk types:
1. Cashflow timing risk (from Stage 1)
2. Foreign exchange exposure (from Stage 2)
3. Funding vulnerability (from Stage 3)
For each risk, propose one realistic protective action.
Explain why financial risk management matters for the company's employees, not just its owners.
Include a free-text field for the board summary.
AI evaluation checks: (a) all three risk types identified, (b) proposed actions consistent with the company's situation, (c) summary mentions employees or people, not just financial metrics.
Generate: scenario_brief, risk_summary, question_prompts, evaluation_rubric, and concluding bridge_text.`,
    stageGate: {
      minCorrectPercent: 50,
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Outstanding work. You\'ve completed the Corporate Finance in Practice block. You now understand what working in a corporate finance team involves.',
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
        name: 'company_name',
        values: [
          { id: 'cn1', value: 'Avon Import Solutions Ltd' },
          { id: 'cn2', value: 'Bristol Trading Company' },
          { id: 'cn3', value: 'Westgate Distribution Ltd' },
          { id: 'cn4', value: 'Harbour Goods International' },
        ],
      },
      {
        name: 'company_sector',
        values: [
          { id: 'cs1', value: 'consumer electronics importing from East Asia' },
          { id: 'cs2', value: 'Italian food products importing' },
          { id: 'cs3', value: 'textiles importing from India' },
          { id: 'cs4', value: 'German engineering parts importing' },
          { id: 'cs5', value: 'Scandinavian furniture distribution' },
        ],
      },
      {
        name: 'company_location',
        values: [
          { id: 'cl1', value: 'Bristol' },
          { id: 'cl2', value: 'Bath' },
          { id: 'cl3', value: 'Gloucester' },
          { id: 'cl4', value: 'Exeter' },
        ],
      },
      {
        name: 'source_country',
        values: [
          { id: 'sc1', value: 'China' },
          { id: 'sc2', value: 'Italy' },
          { id: 'sc3', value: 'India' },
          { id: 'sc4', value: 'Germany' },
          { id: 'sc5', value: 'Sweden' },
        ],
      },
      {
        name: 'supplier_currency',
        values: [
          { id: 'cur1', value: 'CNY (Chinese Yuan)' },
          { id: 'cur2', value: 'EUR (Euro)' },
          { id: 'cur3', value: 'INR (Indian Rupee)' },
          { id: 'cur4', value: 'USD (US Dollar)' },
        ],
      },
      {
        name: 'revenue_range',
        values: [
          { id: 'rr1', value: '£80,000–£120,000' },
          { id: 'rr2', value: '£150,000–£250,000' },
          { id: 'rr3', value: '£50,000–£90,000' },
        ],
      },
      {
        name: 'wages',
        values: [{ id: 'w1', value: '£25,000' }, { id: 'w2', value: '£40,000' }, { id: 'w3', value: '£55,000' }],
      },
      {
        name: 'rent',
        values: [{ id: 'r1', value: '£3,500' }, { id: 'r2', value: '£5,000' }, { id: 'r3', value: '£7,500' }],
      },
      {
        name: 'timing_problem',
        values: [
          { id: 'tp1', value: 'Pays suppliers 30 days before customers pay' },
          { id: 'tp2', value: 'Seasonal revenue spike in Q4 but fixed costs year-round' },
          { id: 'tp3', value: 'Large quarterly VAT payment creates a regular dip' },
          { id: 'tp4', value: 'Bulk stock purchase required before the selling season begins' },
        ],
      },
    ],
  },
  {
    templateId: 'mgt_stage_2',
    parameters: [
      {
        name: 'rate_1',
        values: [{ id: 'r1a', value: '1 GBP = 1.18 EUR' }, { id: 'r1b', value: '1 GBP = 1.27 USD' }, { id: 'r1c', value: '1 GBP = 9.15 CNY' }],
      },
      {
        name: 'rate_2',
        values: [{ id: 'r2a', value: '1 GBP = 1.12 EUR' }, { id: 'r2b', value: '1 GBP = 1.20 USD' }, { id: 'r2c', value: '1 GBP = 8.60 CNY' }],
      },
      {
        name: 'rate_movement',
        values: [
          { id: 'rm1', value: 'GBP weakened 5% against EUR over the past month' },
          { id: 'rm2', value: 'GBP weakened 6% against USD over six weeks' },
          { id: 'rm3', value: 'GBP weakened 3% against CNY following economic data' },
          { id: 'rm4', value: 'GBP weakened 8% against EUR after political uncertainty' },
        ],
      },
      {
        name: 'invoice_1_date',
        values: [{ id: 'id1', value: '1 February 2026' }, { id: 'id2', value: '15 January 2026' }, { id: 'id3', value: '1 March 2026' }],
      },
      {
        name: 'invoice_2_date',
        values: [{ id: 'id4', value: '1 March 2026' }, { id: 'id5', value: '15 February 2026' }, { id: 'id6', value: '1 April 2026' }],
      },
    ],
  },
  {
    templateId: 'mgt_stage_3',
    parameters: [
      {
        name: 'funding_gap',
        values: [{ id: 'fg1', value: '£15,000' }, { id: 'fg2', value: '£25,000' }, { id: 'fg3', value: '£8,000' }],
      },
      {
        name: 'funding_timeline',
        values: [{ id: 'ft1', value: '2 weeks' }, { id: 'ft2', value: '3 weeks' }, { id: 'ft3', value: '10 days' }],
      },
      {
        name: 'option_a',
        values: [
          { id: 'oa1', value: 'Extend the bank overdraft (interest at 9% APR, fast, no relationship impact)' },
          { id: 'oa2', value: 'Draw down a small business loan (interest at 7% APR plus arrangement fee, medium speed)' },
        ],
      },
      {
        name: 'option_b',
        values: [
          { id: 'ob1', value: 'Negotiate longer payment terms with the supplier (no interest cost, slow, potential relationship strain)' },
          { id: 'ob2', value: 'Use short-term invoice factoring (fees 1.5–3%, fast, no relationship impact with supplier)' },
        ],
      },
      {
        name: 'option_c',
        values: [
          { id: 'oc1', value: 'Offer customers a 2% discount for early payment (margin reduction, medium speed, improves customer goodwill)' },
          { id: 'oc2', value: 'Delay a planned equipment purchase (no financial cost, immediate, operational impact on capacity)' },
        ],
      },
      {
        name: 'do_nothing_consequence',
        values: [
          { id: 'dn1', value: 'Cash runs out in 3 weeks and staff wages are delayed' },
          { id: 'dn2', value: 'Supplier stops shipping and the next customer order cannot be fulfilled' },
          { id: 'dn3', value: 'The bank calls in the existing overdraft facility' },
          { id: 'dn4', value: 'A key payment bounces and the company\'s credit rating drops' },
        ],
      },
    ],
  },
  {
    templateId: 'mgt_stage_4',
    parameters: [
      // Stage 4 variables carry forward from Stages 1-3 via generated context.
      // No new variable pools needed — variation comes from the combination of
      // company sector, source country, currency exposure, and funding situation.
      {
        name: 'risk_types',
        values: [
          { id: 'rt1', value: 'cashflow timing, currency exposure, funding vulnerability' },
        ],
      },
    ],
  },
];
