/**
 * Smoke test — runs one generation per template ID against the local backend.
 * Usage: ANTHROPIC_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/smoke-test-generation.ts
 */

const BASE_URL = process.env.SMOKE_TEST_URL ?? 'http://localhost:8080';

const TEMPLATE_IDS = [
  'acc_stage_1', 'acc_stage_2', 'acc_stage_3', 'acc_stage_4',
  'inv_stage_1', 'inv_stage_2', 'inv_stage_3', 'inv_stage_4',
  'mgt_stage_1', 'mgt_stage_2', 'mgt_stage_3', 'mgt_stage_4',
  'fin_stage_1', 'fin_stage_2', 'fin_stage_3', 'fin_stage_4',
];

const SAMPLE_VARIABLES: Record<string, Record<string, string>> = {
  acc_stage_1: { company_name: 'Bristol Bakes Ltd', revenue: '£85,000', expense_category: 'ingredients' },
  acc_stage_2: { company_name: 'Bristol Bakes Ltd', tax_year: '2024-25', vat_amount: '£1,200' },
  acc_stage_3: { company_name: 'Bristol Bakes Ltd', budget_period: 'Q1 2025', target_savings: '£3,000' },
  acc_stage_4: { company_name: 'Bristol Bakes Ltd', scenario_type: 'year-end review' },
  inv_stage_1: { company_name: 'GreenTech Solutions', investment_amount: '£10,000', risk_level: 'moderate' },
  inv_stage_2: { company_name: 'GreenTech Solutions', portfolio_value: '£50,000', market_condition: 'growth' },
  inv_stage_3: { company_name: 'GreenTech Solutions', return_target: '8%', time_horizon: '5 years' },
  inv_stage_4: { company_name: 'GreenTech Solutions', scenario_type: 'investment review' },
  mgt_stage_1: { company_name: 'CityWide Logistics', team_size: '12', department: 'operations' },
  mgt_stage_2: { company_name: 'CityWide Logistics', budget_amount: '£120,000', fiscal_year: '2025' },
  mgt_stage_3: { company_name: 'CityWide Logistics', project_name: 'warehouse expansion', deadline: 'June 2025' },
  mgt_stage_4: { company_name: 'CityWide Logistics', scenario_type: 'financial management review' },
  fin_stage_1: { company_name: 'PayFlow Digital', transaction_volume: '5,000/month', platform: 'mobile payments' },
  fin_stage_2: { company_name: 'PayFlow Digital', compliance_area: 'FCA regulations', user_count: '10,000' },
  fin_stage_3: { company_name: 'PayFlow Digital', feature_name: 'open banking integration', timeline: 'Q2 2025' },
  fin_stage_4: { company_name: 'PayFlow Digital', scenario_type: 'fintech product review' },
};

async function runSmokeTest(): Promise<void> {
  let passed = 0;
  let failed = 0;

  console.log(`\nSmoke test — ${BASE_URL}\n${'─'.repeat(60)}`);

  for (const templateId of TEMPLATE_IDS) {
    const stageNumber = parseInt(templateId.slice(-1));
    const variables = SAMPLE_VARIABLES[templateId] ?? {};
    const start = Date.now();

    try {
      const response = await fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, variables, sessionContext: {}, stageNumber }),
      });

      const latency = Date.now() - start;
      const status = response.status;

      if (response.ok) {
        const data = await response.json() as Record<string, unknown>;
        const hasRequiredFields =
          typeof data.instanceId === 'string' &&
          typeof data.scenarioBrief === 'string' &&
          Array.isArray(data.questions);

        if (hasRequiredFields) {
          console.log(`  ✓ ${templateId} — ${latency}ms — ${status} — ${(data.questions as unknown[]).length} questions`);
          passed++;
        } else {
          console.log(`  ✗ ${templateId} — ${latency}ms — ${status} — missing required fields`);
          failed++;
        }
      } else {
        console.log(`  ✗ ${templateId} — ${latency}ms — ${status}`);
        failed++;
      }
    } catch (error) {
      const latency = Date.now() - start;
      const msg = error instanceof Error ? error.message : 'unknown error';
      console.log(`  ✗ ${templateId} — ${latency}ms — ERROR: ${msg}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Results: ${passed} passed, ${failed} failed out of ${TEMPLATE_IDS.length}`);
  process.exit(failed > 0 ? 1 : 0);
}

runSmokeTest();
