-- Sprint 3: Survey responses + block completion records
-- Migration: 20260312000000_survey_tables.sql

-- ── Confidence Survey Responses ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  survey_type TEXT NOT NULL CHECK (survey_type IN ('pre', 'post')),
  responses JSONB NOT NULL,  -- e.g. {"q1": 3, "q2": 4, "q3": 2, "q4": 5, "q5": 3}
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own surveys"
  ON survey_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own surveys"
  ON survey_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Facilitators can read all surveys"
  ON survey_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('facilitator', 'lecturer', 'admin')
    )
  );

-- ── Block Completion Records ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS block_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  scores JSONB NOT NULL,           -- e.g. {"stage1": 85, "stage2": 90, "stage3": 75, "stage4": 80}
  total_xp INTEGER NOT NULL DEFAULT 0,
  badges_earned TEXT[] DEFAULT '{}',
  time_taken_seconds INTEGER,
  completed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE block_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own completions"
  ON block_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own completions"
  ON block_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Facilitators can read all completions"
  ON block_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('facilitator', 'lecturer', 'admin')
    )
  );

-- ── Indexes ──────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_survey_responses_user_block
  ON survey_responses (user_id, block_id, survey_type);

CREATE INDEX IF NOT EXISTS idx_block_completions_user_block
  ON block_completions (user_id, block_id);

CREATE INDEX IF NOT EXISTS idx_block_completions_completed_at
  ON block_completions (completed_at);
