import type { ScenarioTemplate, VariablePool } from '@/types/content';

// ── Investment in Practice Block (Lead: Helen) — 4 Stages ────────────
// Workplace setting: A small independent financial advisory firm
// Learner role: New trainee assisting a senior adviser
// Learning arc: Know the Products → Know the Client → Build a Plan → Hold the Course

export const investmentTemplates: ScenarioTemplate[] = [
  {
    templateId: 'inv_stage_1',
    blockId: 'investment',
    stageNumber: 1,
    stageTitle: 'Understanding the Product Range',
    pedagogicalGoal: 'Understand the main types of investment and the risk–return spectrum as a professional framework, not a personal dilemma',
    workplaceSetting: 'A small independent financial advisory firm in the Bristol area',
    learnerRole: 'New trainee at the firm, learning the product range the firm recommends to clients',
    taskType: 'Match 4–5 investment products to positions on a risk–return spectrum; explain each in one sentence; explain why the firm offers a range',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'product type identification' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'risk-return relationship basics' },
      { difficulty: 'medium', questionType: 'ordering', focusArea: 'risk spectrum positioning' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'why firms offer a product range' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'matching product characteristics to risk level' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'diversification as professional principle' },
    ],
    promptSkeleton: `Generate a scenario for a trainee at {{firm_name}}, a {{firm_description}} in the Bristol area.
The firm recommends {{product_count}} investment products to clients spanning the risk–return spectrum.
Products include types such as: {{product_types}}.
Illustrative annual returns: cash 3–5%, bonds 4–7%, equities 7–12%, property 5–9%, balanced 5–8%.
Include an explicit disclaimer: 'These are illustrative examples used for learning, not financial advice.'
Generate: scenario_brief, task_data (match products to risk–return spectrum positions),
6 questions, and bridge_text to Stage 2.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['risk-return-spectrum', 'product-range-rationale'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Now that the trainee understands the products, a real client is coming in for a meeting...',
    interactiveComponents: [
      { component: 'RiskReturnSpectrum', props: { levels: ['Low Risk / Low Return', 'Medium Risk / Medium Return', 'High Risk / High Return'] } },
    ],
  },
  {
    templateId: 'inv_stage_2',
    blockId: 'investment',
    stageNumber: 2,
    stageTitle: 'Understanding What the Client Needs',
    pedagogicalGoal: 'Understand suitability: investment advice must fit the specific person. Good advice depends on who you are advising.',
    workplaceSetting: 'The same financial advisory firm — a client meeting',
    learnerRole: 'Trainee helping the senior adviser prepare a client fact-find',
    taskType: 'Review a client profile; complete a simplified fact-find; identify time horizon and risk tolerance; explain why suitability matters',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'what a fact-find captures' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'time horizon identification' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'risk tolerance assessment from circumstances' },
      { difficulty: 'medium', questionType: 'matching', focusArea: 'matching client goals to time horizons' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'why same product suits one client but not another' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'suitability as professional obligation' },
    ],
    promptSkeleton: `Continue at {{firm_name}}.
A client has come in for a meeting: {{client_name}}, a {{client_age}}-year-old {{client_occupation}} earning {{client_income}}.
They have savings of {{client_savings}}, {{client_pension_status}}, {{client_dependants}}.
Their goal is {{client_goal}}.
Present the client profile as a structured card with key facts.
Generate: scenario_brief, client profile data, fact_find_template,
6 questions, and bridge_text to Stage 3.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['time-horizon', 'risk-tolerance', 'suitability'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'The fact-find is done. Now the trainee needs to help think about what to actually recommend...',
    interactiveComponents: [
      { component: 'ClientProfileCard', props: { fields: ['age', 'income', 'savings', 'goals', 'dependants'] } },
    ],
  },
  {
    templateId: 'inv_stage_3',
    blockId: 'investment',
    stageNumber: 3,
    stageTitle: 'Building a Recommendation',
    pedagogicalGoal: 'Allocate funds across product types to match the client profile, learning diversification as a practical professional principle',
    workplaceSetting: 'The advisory firm — preparing the recommendation for the client',
    learnerRole: 'Trainee proposing a portfolio allocation for the senior adviser to review',
    taskType: 'Using client profile from Stage 2 and products from Stage 1, propose a percentage allocation; explain reasoning; explain diversification',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'what diversification means' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'matching risk level to client' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'why not 100% in one product' },
      { difficulty: 'medium', questionType: 'matching', focusArea: 'allocation rationale for different profiles' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'adjusting allocation for different time horizons' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'coherence between risk tolerance and allocation' },
    ],
    promptSkeleton: `Continue at {{firm_name}}.
Using the client profile from Stage 2 and the product range from Stage 1, the trainee must propose a percentage allocation.
The client is {{client_summary}} with a {{client_risk_level}} risk tolerance and a {{client_time_horizon}} time horizon.
Products available: {{products_from_stage_1}}.
The allocation must sum to 100%.
Generate: scenario_brief, allocation_template with products,
evaluation_rubric (coherence, diversification, client match), and bridge_text to Stage 4.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['diversification', 'client-matched-allocation'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'The recommendation looks solid, but the client calls back the next day worried about a news story...',
    interactiveComponents: [
      { component: 'AllocationSliders', props: { sumTo: 100, unit: '%' } },
    ],
  },
  {
    templateId: 'inv_stage_4',
    blockId: 'investment',
    stageNumber: 4,
    stageTitle: 'When Markets Move',
    pedagogicalGoal: 'Understand that investment professionals help clients stay rational under uncertainty. Short-term volatility does not mean the plan has failed. Patience is a professional principle.',
    workplaceSetting: 'The advisory firm — handling a worried client call',
    learnerRole: 'Trainee preparing notes for the senior adviser\'s callback to the client',
    taskType: 'Explain why markets move; compare selling now versus waiting using illustrative figures; draft three key callback points',
    questionPatterns: [
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'why markets sometimes fall' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'paper loss vs realised loss' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'selling vs holding comparison' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'professional communication under uncertainty' },
    ],
    promptSkeleton: `Final stage at {{firm_name}}.
A market event has occurred: {{market_event}}.
The client reacts: {{client_reaction}}.
Their portfolio was {{portfolio_before}}, now shows {{portfolio_after}}.
Include a 12-month recovery scenario.
The trainee must draft three key points for the adviser's callback.
Include a visible disclaimer: 'This is a learning exercise. Real investment decisions should involve a qualified adviser.'
Generate: scenario_brief, illustrative_data, question_prompts,
evaluation_rubric (empathy, factual explanation, no guarantees), and concluding bridge_text.`,
    stageGate: {
      minCorrectPercent: 50,
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Outstanding work. You\'ve completed the Investment in Practice block. You now understand what working in a financial advisory firm involves.',
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
        name: 'firm_name',
        values: [
          { id: 'fn1', value: 'Avon Independent Financial Advisers' },
          { id: 'fn2', value: 'Clifton Wealth Management' },
          { id: 'fn3', value: 'Redcliffe Financial Planning' },
        ],
      },
      {
        name: 'firm_description',
        values: [
          { id: 'fd1', value: 'Bristol-based independent adviser' },
          { id: 'fd2', value: 'Bath wealth management practice' },
          { id: 'fd3', value: 'Southwest financial planning firm' },
        ],
      },
      {
        name: 'product_count',
        values: [{ id: 'pc1', value: '4' }, { id: 'pc2', value: '5' }],
      },
      {
        name: 'product_types',
        values: [
          { id: 'pt1', value: 'Cash ISA, Government bonds, FTSE 100 tracker fund, Commercial property fund, Balanced managed fund' },
          { id: 'pt2', value: 'Premium bonds, Corporate bonds, Global equity fund, UK REIT, Income fund' },
          { id: 'pt3', value: 'Cash ISA, Government bonds, Ethical equity fund, Balanced managed fund, Global equity fund' },
        ],
      },
    ],
  },
  {
    templateId: 'inv_stage_2',
    parameters: [
      {
        name: 'client_name',
        values: [{ id: 'cn1', value: 'Sarah' }, { id: 'cn2', value: 'James' }, { id: 'cn3', value: 'Priya' }, { id: 'cn4', value: 'David' }],
      },
      {
        name: 'client_age',
        values: [{ id: 'ca1', value: '35' }, { id: 'ca2', value: '28' }, { id: 'ca3', value: '50' }, { id: 'ca4', value: '22' }, { id: 'ca5', value: '42' }, { id: 'ca6', value: '55' }],
      },
      {
        name: 'client_occupation',
        values: [
          { id: 'co1', value: 'teacher with a stable pension' },
          { id: 'co2', value: 'freelancer with irregular income' },
          { id: 'co3', value: 'carer returning to work after a break' },
          { id: 'co4', value: 'graduate in first job' },
          { id: 'co5', value: 'single parent with modest savings' },
        ],
      },
      {
        name: 'client_income',
        values: [{ id: 'ci1', value: '£32,000' }, { id: 'ci2', value: '£24,000' }, { id: 'ci3', value: '£18,000' }, { id: 'ci4', value: '£45,000' }],
      },
      {
        name: 'client_savings',
        values: [{ id: 'cs1', value: '£12,000' }, { id: 'cs2', value: '£3,500' }, { id: 'cs3', value: '£28,000' }, { id: 'cs4', value: '£2,000' }],
      },
      {
        name: 'client_pension_status',
        values: [
          { id: 'cp1', value: 'an existing workplace pension' },
          { id: 'cp2', value: 'no private pension' },
          { id: 'cp3', value: 'a small personal pension from a previous job' },
        ],
      },
      {
        name: 'client_dependants',
        values: [
          { id: 'cd1', value: 'no dependants' },
          { id: 'cd2', value: 'one child aged 8' },
          { id: 'cd3', value: 'two school-age children' },
          { id: 'cd4', value: 'an elderly parent they help support' },
        ],
      },
      {
        name: 'client_goal',
        values: [
          { id: 'cg1', value: 'retirement planning — wants to stop working at 60' },
          { id: 'cg2', value: 'saving for a house deposit within 5 years' },
          { id: 'cg3', value: 'building a safety net and starting to invest for the first time' },
          { id: 'cg4', value: 'children\'s education fund needed in about 10 years' },
          { id: 'cg5', value: 'career break buffer — wants flexibility to reduce hours within 2 years' },
        ],
      },
    ],
  },
  {
    templateId: 'inv_stage_3',
    parameters: [
      {
        name: 'client_summary',
        values: [
          { id: 'cs1', value: 'a 35-year-old teacher with £12,000 in savings and a workplace pension' },
          { id: 'cs2', value: 'a 28-year-old freelancer with £3,500 in savings and no pension' },
          { id: 'cs3', value: 'a 50-year-old carer returning to work with £28,000 in savings' },
        ],
      },
      {
        name: 'client_risk_level',
        values: [{ id: 'rl1', value: 'low' }, { id: 'rl2', value: 'medium' }, { id: 'rl3', value: 'high' }],
      },
      {
        name: 'client_time_horizon',
        values: [
          { id: 'th1', value: 'short-term (under 3 years)' },
          { id: 'th2', value: 'medium-term (3–10 years)' },
          { id: 'th3', value: 'long-term (10+ years)' },
        ],
      },
      {
        name: 'products_from_stage_1',
        values: [
          { id: 'ps1', value: 'Cash ISA, Government bonds, FTSE 100 tracker, Commercial property fund, Balanced managed fund' },
          { id: 'ps2', value: 'Premium bonds, Corporate bonds, Global equity fund, UK REIT, Income fund' },
        ],
      },
    ],
  },
  {
    templateId: 'inv_stage_4',
    parameters: [
      {
        name: 'market_event',
        values: [
          { id: 'me1', value: 'Stock markets drop 8% in a week after unexpected economic data' },
          { id: 'me2', value: 'Bond yields spike unexpectedly, causing bond fund values to fall' },
          { id: 'me3', value: 'Global tech sector sells off sharply on regulatory concerns' },
          { id: 'me4', value: 'Energy prices cause a broad market dip affecting most funds' },
          { id: 'me5', value: 'Emerging markets fall on political uncertainty' },
        ],
      },
      {
        name: 'client_reaction',
        values: [
          { id: 'cr1', value: 'Wants to sell everything immediately and move to cash' },
          { id: 'cr2', value: 'Wants to pause contributions and wait until things settle' },
          { id: 'cr3', value: 'Asks whether they should invest more while prices are low' },
          { id: 'cr4', value: 'Wants to switch everything to a \'safer\' product right away' },
        ],
      },
      {
        name: 'portfolio_before',
        values: [{ id: 'pb1', value: '£10,000' }, { id: 'pb2', value: '£25,000' }, { id: 'pb3', value: '£5,000' }],
      },
      {
        name: 'portfolio_after',
        values: [{ id: 'pa1', value: '£9,200' }, { id: 'pa2', value: '£22,500' }, { id: 'pa3', value: '£4,600' }],
      },
    ],
  },
];
