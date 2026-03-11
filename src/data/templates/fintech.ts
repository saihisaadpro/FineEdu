import type { ScenarioTemplate, VariablePool } from '@/types/content';

// ── Digital Finance / FinTech Block (Lead: Xiaojun) — 4 Stages ───────

export const fintechTemplates: ScenarioTemplate[] = [
  {
    templateId: 'fin_stage_1',
    blockId: 'fintech',
    stageNumber: 1,
    stageTitle: 'Safe Digital Payments',
    pedagogicalGoal: 'Understand how digital payments work, recognise secure vs insecure payment situations, and adopt safer habits',
    workplaceSetting: 'A public digital skills drop-in at a Bristol library',
    learnerRole: 'Drop-in visitor who uses contactless and online payment regularly but wants to be safer',
    taskType: 'Sort 6-8 payment scenarios into safe/risky; identify the red flag in each risky scenario; match safety measures to risks',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'safe payment practices' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'contactless basics' },
      { difficulty: 'medium', questionType: 'matching', focusArea: 'risk-to-protection matching' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'phishing identification' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'multi-factor authentication' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'card-not-present fraud awareness' },
    ],
    promptSkeleton: `Generate a scenario for a digital skills session.
{{learner_name}} regularly uses {{payment_method}} for purchases.
Present {{scenario_count}} payment situations — some safe, some risky.
One scenario involves {{fraud_type}}.
Generate: scenario_brief, task_data (sort items into safe/risky),
6 questions, and bridge_text to Stage 2.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['safe-payment-habits', 'risk-recognition'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Now that {{learner_name}} is more aware of payment safety, the session moves on to getting the most from online banking tools...',
    interactiveComponents: [
      { component: 'ScenarioSorter', props: { categories: ['Safe', 'Risky'] } },
    ],
  },
  {
    templateId: 'fin_stage_2',
    blockId: 'fintech',
    stageNumber: 2,
    stageTitle: 'Online Banking Tools',
    pedagogicalGoal: 'Navigate common online banking features — alerts, pots/savings goals, standing orders, and transaction categorisation',
    workplaceSetting: 'A hands-on banking app workshop',
    learnerRole: 'Participant setting up useful banking app features for the first time',
    taskType: 'Match banking features to user goals; configure a realistic set of alerts and pots; identify one feature being misused',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'alert types' },
      { difficulty: 'easy', questionType: 'matching', focusArea: 'feature-to-purpose matching' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'standing order vs direct debit' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'savings pots strategy' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'feature misuse identification' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'optimising banking setup' },
    ],
    promptSkeleton: `Continue the session.
{{learner_name}} has opened their banking app on {{bank_name}}.
They want to set up features for {{primary_banking_goal}}.
Present {{feature_count}} banking features to configure.
One feature is being {{misuse_type}}.
Generate: scenario_brief, task_data (match features to goals),
6 questions, and bridge_text to Stage 3.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['banking-features', 'alert-configuration'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'With banking tools configured well, {{learner_name}} now turns to the growing threat that every digital user faces — fraud and scams...',
    interactiveComponents: [
      { component: 'FeatureMatcher', props: { featureCount: 6 } },
    ],
  },
  {
    templateId: 'fin_stage_3',
    blockId: 'fintech',
    stageNumber: 3,
    stageTitle: 'Fraud Awareness & Prevention',
    pedagogicalGoal: 'Recognise common fraud patterns (phishing, smishing, vishing, impersonation), know the correct response steps, and understand reporting',
    workplaceSetting: 'A fraud awareness workshop run by a local advice agency',
    learnerRole: 'Community member learning to recognise and respond to scam attempts',
    taskType: 'Review 5-6 communication examples (email, text, call scripts); identify which are scams; match each to the correct response',
    questionPatterns: [
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'phishing email signs' },
      { difficulty: 'easy', questionType: 'multiple-choice', focusArea: 'legitimate vs scam communication' },
      { difficulty: 'medium', questionType: 'matching', focusArea: 'scam type to response' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'social engineering tactics' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'reporting a scam correctly' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'account recovery after compromise' },
    ],
    promptSkeleton: `Continue the digital finance journey.
{{learner_name}} has received {{message_count}} suspicious messages via {{channels}}.
Include realistic examples of {{scam_types}}.
One message is actually genuine: {{genuine_message}}.
Generate: scenario_brief, task_data (review items — scam or genuine with response matching),
6 questions, and bridge_text to Stage 4.`,
    stageGate: {
      minCorrectPercent: 60,
      requiredConcepts: ['scam-recognition', 'correct-response-steps'],
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Now equipped to spot scams, {{learner_name}} is ready to bring together all their digital finance skills into everyday confident practice...',
    interactiveComponents: [
      { component: 'MessageReviewer', props: { messageCount: 6 } },
    ],
  },
  {
    templateId: 'fin_stage_4',
    blockId: 'fintech',
    stageNumber: 4,
    stageTitle: 'Fintech for Daily Life',
    pedagogicalGoal: 'Apply digital finance knowledge to build a safe, efficient daily routine using fintech tools while managing risks confidently',
    workplaceSetting: 'A wrap-up planning session at the digital skills centre',
    learnerRole: 'Person creating a personal digital finance safety plan',
    taskType: 'Review a realistic daily digital finance scenario; write a free-text personal safety and efficiency plan',
    questionPatterns: [
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'combining digital safety habits' },
      { difficulty: 'medium', questionType: 'multiple-choice', focusArea: 'choosing the right tool' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'responding to a complex scam' },
      { difficulty: 'hard', questionType: 'multiple-choice', focusArea: 'advising someone less tech-confident' },
    ],
    promptSkeleton: `Final stage.
{{learner_name}} uses {{daily_tools}} regularly.
They have a concern about {{security_concern}} and want to help {{person_to_help}}.
Bring together payment safety, banking tools, and fraud awareness from all stages.
Generate: scenario_brief, task_data (free-text with rubric),
4 questions, and concluding bridge_text.`,
    stageGate: {
      minCorrectPercent: 50,
      canRetry: true,
      facilitatorOverride: true,
    },
    bridgeNarrativeTemplate: 'Excellent work. {{learner_name}} now has a clear digital finance safety plan. You\'ve completed the Digital Finance mission.',
    interactiveComponents: [
      { component: 'FreeTextResponse', props: { maxWords: 300, rubricVisible: true } },
    ],
  },
];

export const fintechVariables: VariablePool[] = [
  {
    templateId: 'fin_stage_1',
    parameters: [
      {
        name: 'learner_name',
        values: [{ id: 'l1', value: 'Dani' }, { id: 'l2', value: 'Chen' }, { id: 'l3', value: 'Sade' }, { id: 'l4', value: 'Raj' }],
      },
      {
        name: 'payment_method',
        values: [
          { id: 'pm1', value: 'contactless card and Apple Pay' },
          { id: 'pm2', value: 'online shopping with saved card details' },
          { id: 'pm3', value: 'bank transfer and PayPal' },
        ],
      },
      {
        name: 'scenario_count',
        values: [{ id: 'sc1', value: '6' }, { id: 'sc2', value: '7' }, { id: 'sc3', value: '8' }],
      },
      {
        name: 'fraud_type',
        values: [
          { id: 'ft1', value: 'a fake Wi-Fi hotspot intercepting payment details at a cafe' },
          { id: 'ft2', value: 'a cloned website that looks identical to a legitimate retailer' },
          { id: 'ft3', value: 'a text message claiming a delivery needs a small payment to release' },
        ],
      },
    ],
  },
  {
    templateId: 'fin_stage_2',
    parameters: [
      {
        name: 'bank_name',
        values: [
          { id: 'bn1', value: 'Monzo' },
          { id: 'bn2', value: 'Starling Bank' },
          { id: 'bn3', value: 'a high-street bank mobile app' },
        ],
      },
      {
        name: 'primary_banking_goal',
        values: [
          { id: 'bg1', value: 'tracking daily spending and avoiding overdraft' },
          { id: 'bg2', value: 'saving for a holiday with monthly pots' },
          { id: 'bg3', value: 'managing bills from a shared household account' },
        ],
      },
      {
        name: 'feature_count',
        values: [{ id: 'fc1', value: '5' }, { id: 'fc2', value: '6' }],
      },
      {
        name: 'misuse_type',
        values: [
          { id: 'mu1', value: 'used to overspend by hiding money in an "untouchable" pot that gets raided monthly' },
          { id: 'mu2', value: 'set up as a standing order that duplicates a direct debit, causing double payments' },
          { id: 'mu3', value: 'configured with alerts turned off, defeating the purpose of the feature' },
        ],
      },
    ],
  },
  {
    templateId: 'fin_stage_3',
    parameters: [
      {
        name: 'message_count',
        values: [{ id: 'mc1', value: '5' }, { id: 'mc2', value: '6' }],
      },
      {
        name: 'channels',
        values: [
          { id: 'ch1', value: 'email, text message, and a phone call' },
          { id: 'ch2', value: 'WhatsApp, email, and a social media DM' },
          { id: 'ch3', value: 'text, email, and a letter that looks official' },
        ],
      },
      {
        name: 'scam_types',
        values: [
          { id: 'st1', value: 'a bank impersonation call and a parcel delivery phishing text' },
          { id: 'st2', value: 'a HMRC tax refund email and a romance scam message' },
          { id: 'st3', value: 'a Microsoft tech support scam call and a fake prize notification' },
        ],
      },
      {
        name: 'genuine_message',
        values: [
          { id: 'gm1', value: 'a real appointment reminder from the GP surgery' },
          { id: 'gm2', value: 'a genuine delivery notification from a tracked parcel' },
          { id: 'gm3', value: 'a legitimate security alert from the bank about a login from a new device' },
        ],
      },
    ],
  },
  {
    templateId: 'fin_stage_4',
    parameters: [
      {
        name: 'daily_tools',
        values: [
          { id: 'dt1', value: 'contactless payments, a banking app, and online shopping' },
          { id: 'dt2', value: 'mobile banking, PayPal, and subscription services' },
          { id: 'dt3', value: 'a budgeting app, Apple Pay, and direct debits' },
        ],
      },
      {
        name: 'security_concern',
        values: [
          { id: 'sc1', value: 'whether their saved card details are safe on multiple shopping sites' },
          { id: 'sc2', value: 'a suspicious message they received that looked like it came from their bank' },
          { id: 'sc3', value: 'their elderly parent who recently fell for an online scam' },
        ],
      },
      {
        name: 'person_to_help',
        values: [
          { id: 'ph1', value: 'a parent who doesn\'t use online banking and still pays everything by cash or cheque' },
          { id: 'ph2', value: 'a teenage sibling who shares passwords and clicks links without thinking' },
          { id: 'ph3', value: 'a friend who recently had their card details stolen after using public Wi-Fi' },
        ],
      },
    ],
  },
];
