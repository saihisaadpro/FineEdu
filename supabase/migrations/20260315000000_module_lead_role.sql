-- Sprint 7: Module Leader role + content management tables
-- Migration: 20260315000000_module_lead_role.sql

-- ── Update profiles role CHECK to include module_lead ────────────────

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('guest', 'facilitator', 'lecturer', 'module_lead', 'admin'));

-- ── Block ownership (which module lead owns which block) ─────────────

CREATE TABLE IF NOT EXISTS block_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id TEXT NOT NULL UNIQUE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT,
  assigned_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE block_ownership ENABLE ROW LEVEL SECURITY;

CREATE POLICY "block_ownership_read" ON block_ownership
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "block_ownership_manage" ON block_ownership
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role IN ('module_lead', 'admin'))
  );

-- Seed ownership (matching PROTOTYPE_PLAN block leads)
INSERT INTO block_ownership (block_id, display_name) VALUES
  ('accounting', 'Rui'),
  ('investment', 'Helen'),
  ('management', 'Yan'),
  ('fintech', 'Xiaojun')
ON CONFLICT (block_id) DO NOTHING;

-- ── Scenario review queue ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS scenario_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID REFERENCES generated_scenarios(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  stage_number INTEGER NOT NULL,
  flagged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  flagged_by_role TEXT,
  flag_reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'revised', 'retired')),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_sr_block ON scenario_reviews (block_id);
CREATE INDEX idx_sr_status ON scenario_reviews (status);

ALTER TABLE scenario_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sr_facilitator_flag" ON scenario_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role IN ('facilitator', 'lecturer', 'module_lead', 'admin'))
  );

CREATE POLICY "sr_read" ON scenario_reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role IN ('facilitator', 'lecturer', 'module_lead', 'admin'))
  );

CREATE POLICY "sr_module_lead_resolve" ON scenario_reviews
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role IN ('module_lead', 'admin'))
  );

-- ── Scenario publish control ─────────────────────────────────────────

ALTER TABLE generated_scenarios
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- ── Module lead stats RPC ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION module_lead_block_stats(p_block_id TEXT)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'block_id', p_block_id,
    'total_sessions', (
      SELECT COUNT(*)
      FROM block_sessions
      WHERE block_id = p_block_id
    ),
    'total_completions', (
      SELECT COUNT(*)
      FROM block_completions
      WHERE block_id = p_block_id
    ),
    'avg_score', (
      SELECT COALESCE(ROUND(AVG(
        (COALESCE((scores->>'stage1')::numeric, 0) +
         COALESCE((scores->>'stage2')::numeric, 0) +
         COALESCE((scores->>'stage3')::numeric, 0) +
         COALESCE((scores->>'stage4')::numeric, 0)) / 4
      ), 1), 0)
      FROM block_completions
      WHERE block_id = p_block_id
    ),
    'completion_rate', (
      SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE completed_at IS NOT NULL) * 100.0 / COUNT(*))::numeric, 1)
      END
      FROM block_sessions
      WHERE block_id = p_block_id
    ),
    'stage_scores', (
      SELECT COALESCE(json_agg(row_to_json(s)), '[]'::json) FROM (
        SELECT
          stage_number,
          COUNT(*)::int AS attempts,
          COUNT(*) FILTER (WHERE correct)::int AS correct_count,
          CASE WHEN COUNT(*) = 0 THEN 0
               ELSE ROUND((COUNT(*) FILTER (WHERE correct) * 100.0 / COUNT(*))::numeric, 1) END AS accuracy_pct
        FROM assessment_results
        WHERE block_id = p_block_id
        GROUP BY stage_number
        ORDER BY stage_number
      ) s
    ),
    'hard_questions', (
      SELECT COALESCE(json_agg(row_to_json(q)), '[]'::json) FROM (
        SELECT
          question_id,
          COUNT(*)::int AS attempts,
          COUNT(*) FILTER (WHERE correct)::int AS correct_answers,
          CASE WHEN COUNT(*) = 0 THEN 0
               ELSE ROUND((COUNT(*) FILTER (WHERE correct) * 100.0 / COUNT(*))::numeric, 1) END AS pass_rate
        FROM assessment_results
        WHERE block_id = p_block_id
        GROUP BY question_id
        HAVING COUNT(*) >= 5
        ORDER BY ROUND((COUNT(*) FILTER (WHERE correct) * 100.0 / COUNT(*))::numeric, 1)
        LIMIT 10
      ) q
    ),
    'scenarios_generated', (
      SELECT COUNT(*)
      FROM generated_scenarios
      WHERE template_id LIKE p_block_id || '%'
    ),
    'scenarios_flagged', (
      SELECT COUNT(*)
      FROM scenario_reviews
      WHERE block_id = p_block_id AND status = 'pending'
    ),
    'confidence_delta', (
      SELECT COALESCE(ROUND(AVG(post_avg - pre_avg)::numeric, 2), 0) FROM (
        SELECT
          pre.user_id,
          (SELECT AVG(v::numeric) FROM jsonb_each_text(pre.responses) AS kv(k, v)) AS pre_avg,
          (SELECT AVG(v::numeric) FROM jsonb_each_text(post_.responses) AS kv(k, v)) AS post_avg
        FROM survey_responses pre
        JOIN survey_responses post_ ON pre.user_id = post_.user_id AND pre.block_id = post_.block_id
        WHERE pre.block_id = p_block_id
          AND pre.survey_type = 'pre'
          AND post_.survey_type = 'post'
      ) deltas
    )
  );
$$;

GRANT EXECUTE ON FUNCTION module_lead_block_stats(TEXT) TO authenticated;

-- ── Update RLS on generated_scenarios for module lead publish control ─

CREATE POLICY "gs_module_lead_manage" ON generated_scenarios
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role IN ('module_lead', 'admin'))
  );

-- ── Update custom_questions RLS for module leads ─────────────────────

CREATE POLICY "cq_module_lead_manage" ON custom_questions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (SELECT auth.uid()) AND role IN ('module_lead', 'admin'))
  );
