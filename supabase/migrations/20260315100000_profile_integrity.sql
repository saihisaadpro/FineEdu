-- Phase 5: Profile integrity hardening
-- Migration: 20260315100000_profile_integrity.sql

-- ── Auto-update updated_at on profiles ───────────────────────────────
-- The profiles table has an updated_at column but nothing was keeping it
-- current. This trigger ensures it stays accurate for audit trails.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ── Ensure unique partial index on active sessions per user/block ────
-- Prevents duplicate active block sessions (no completed_at) for the same
-- user + block combination, which could corrupt dashboard aggregations.

CREATE UNIQUE INDEX IF NOT EXISTS idx_bs_active_per_user_block
  ON block_sessions (session_id, block_id)
  WHERE completed_at IS NULL;

-- ── Add index for scenario_reviews lookups by resolver ───────────────
CREATE INDEX IF NOT EXISTS idx_sr_reviewer ON scenario_reviews (reviewer_id)
  WHERE reviewer_id IS NOT NULL;
