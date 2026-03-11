-- Phase 5: AI Integration tables
-- Run in Supabase SQL Editor

-- Generation cache (7-day TTL)
CREATE TABLE IF NOT EXISTS generation_cache (
  cache_key TEXT PRIMARY KEY,
  scenario_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_generation_cache_expires ON generation_cache (expires_at);

-- Chat message counters (distributed rate limiting — 24h TTL)
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages (session_id);

-- Generation quality metrics (for prompt tuning)
CREATE TABLE IF NOT EXISTS generation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  model TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  failure_reason TEXT,
  cache_hit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gen_metrics_template ON generation_metrics (template_id, created_at);

-- RLS: generation_cache accessed only by service role (backend)
ALTER TABLE generation_cache ENABLE ROW LEVEL SECURITY;
-- No public policies — only service_role key can access

-- RLS: chat_messages accessed only by service role (backend)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
-- No public policies — only service_role key can access

-- RLS: generation_metrics accessed only by service role (backend)
ALTER TABLE generation_metrics ENABLE ROW LEVEL SECURITY;
-- No public policies — only service_role key can access

-- Maintenance (schedule via pg_cron or Cloud Run cron):
-- DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '24 hours';
-- DELETE FROM generation_cache WHERE expires_at < NOW();
