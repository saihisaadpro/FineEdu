-- ============================================================
-- 1. PROFILES (facilitators, lecturers, admins)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'guest'
    CHECK (role IN ('guest', 'facilitator', 'lecturer', 'admin')),
  display_name TEXT,
  organisation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. PIN SESSIONS (anonymous learner progress)
-- ============================================================
CREATE TABLE pin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_hash TEXT NOT NULL,
  session_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '90 days'
);
CREATE INDEX idx_pin_hash ON pin_sessions (pin_hash);

-- ============================================================
-- 3. SESSIONS (anonymous usage tracking)
-- ============================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_user_id UUID,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  role TEXT DEFAULT 'guest',
  blocks_accessed TEXT[] DEFAULT '{}',
  stages_completed TEXT[] DEFAULT '{}',
  total_xp INTEGER DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  device_type TEXT
);

-- ============================================================
-- 4. BLOCK SESSIONS (cross-stage context for dynamic generation)
-- ============================================================
CREATE TABLE block_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  current_stage INTEGER DEFAULT 1,
  stages_completed INTEGER[] DEFAULT '{}',
  generated_context JSONB DEFAULT '{}',
  total_xp INTEGER DEFAULT 0,
  is_replay BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_bs_session ON block_sessions (session_id);

-- ============================================================
-- 5. GENERATED SCENARIOS (cache for AI-generated content)
-- ============================================================
CREATE TABLE generated_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  variable_hash TEXT NOT NULL,
  scenario_data JSONB NOT NULL,
  flagged_for_review BOOLEAN DEFAULT FALSE,
  review_notes TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  last_served TIMESTAMPTZ DEFAULT NOW(),
  serve_count INTEGER DEFAULT 1
);
CREATE INDEX idx_gs_template ON generated_scenarios (template_id);
CREATE UNIQUE INDEX idx_gs_cache_key ON generated_scenarios (template_id, variable_hash);

-- ============================================================
-- 6. ASSESSMENT RESULTS (per-question tracking)
-- ============================================================
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  stage_number INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  difficulty TEXT NOT NULL,
  time_taken_ms INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ar_session ON assessment_results (session_id);
CREATE INDEX idx_ar_block_stage ON assessment_results (block_id, stage_number);

-- ============================================================
-- 7. FEEDBACK (surveys and session feedback)
-- ============================================================
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  survey_type TEXT NOT NULL
    CHECK (survey_type IN ('pre_confidence', 'post_confidence', 'session_feedback')),
  responses JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. CUSTOM QUESTIONS (lecturer-authored, persisted)
-- ============================================================
CREATE TABLE custom_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id TEXT NOT NULL,
  stage_number INTEGER NOT NULL,
  text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer_index INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX idx_cq_block_stage ON custom_questions (block_id, stage_number);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_questions ENABLE ROW LEVEL SECURITY;

-- Profiles: users read/update own profile
CREATE POLICY "profiles_own" ON profiles
  FOR ALL TO authenticated
  USING ((select auth.uid()) = id);

-- Pin sessions: any authenticated user can CRUD
CREATE POLICY "pin_sessions_public" ON pin_sessions
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Sessions: anyone can create; own user can read; facilitators can read all
CREATE POLICY "sessions_insert" ON sessions
  FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "sessions_read_own" ON sessions
  FOR SELECT TO authenticated
  USING (anon_user_id = (select auth.uid()));
CREATE POLICY "sessions_read_facilitator" ON sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('facilitator', 'lecturer', 'admin'))
  );

-- Block sessions
CREATE POLICY "bs_insert" ON block_sessions
  FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "bs_read_own" ON block_sessions
  FOR SELECT TO authenticated
  USING (
    session_id IN (SELECT id FROM sessions WHERE anon_user_id = (select auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('facilitator', 'lecturer', 'admin'))
  );
CREATE POLICY "bs_update_own" ON block_sessions
  FOR UPDATE TO authenticated
  USING (
    session_id IN (SELECT id FROM sessions WHERE anon_user_id = (select auth.uid()))
  );

-- Generated scenarios: anyone can insert/read; facilitators can flag for review
CREATE POLICY "gs_insert" ON generated_scenarios
  FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "gs_read" ON generated_scenarios
  FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "gs_flag_review" ON generated_scenarios
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('facilitator', 'lecturer', 'admin'))
  );

-- Assessment results
CREATE POLICY "ar_insert" ON assessment_results
  FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "ar_read_via_session" ON assessment_results
  FOR SELECT TO authenticated
  USING (
    session_id IN (SELECT id FROM sessions WHERE anon_user_id = (select auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('facilitator', 'lecturer', 'admin'))
  );

-- Feedback: anyone can insert; facilitators can read
CREATE POLICY "feedback_insert" ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "feedback_read_facilitator" ON feedback
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('facilitator', 'lecturer', 'admin'))
  );

-- Custom questions: lecturers/admins have full CRUD; everyone can read active
CREATE POLICY "cq_read_active" ON custom_questions
  FOR SELECT TO authenticated
  USING (is_active = TRUE);
CREATE POLICY "cq_manage" ON custom_questions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('lecturer', 'admin'))
  );

-- Performance indexes for RLS policy columns
CREATE INDEX idx_sessions_anon_user ON sessions (anon_user_id);
CREATE INDEX idx_block_sessions_session ON block_sessions (session_id);
CREATE INDEX idx_assessment_results_session ON assessment_results (session_id);
CREATE INDEX idx_profiles_role ON profiles (role);