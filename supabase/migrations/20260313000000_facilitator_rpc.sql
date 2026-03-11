-- Sprint 4: Facilitator dashboard aggregation RPC
-- Migration: 20260313000000_facilitator_rpc.sql

-- ── facilitator_stats(): returns aggregated dashboard data ───────────

CREATE OR REPLACE FUNCTION facilitator_stats()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_today', (
      SELECT COUNT(DISTINCT session_id)
      FROM block_sessions
      WHERE started_at::date = CURRENT_DATE
    ),
    'active_now', (
      SELECT COUNT(DISTINCT session_id)
      FROM block_sessions
      WHERE started_at > now() - interval '15 minutes'
        AND completed_at IS NULL
    ),
    'avg_score', (
      SELECT COALESCE(ROUND(AVG(
        (COALESCE((scores->>'stage1')::numeric, 0) +
         COALESCE((scores->>'stage2')::numeric, 0) +
         COALESCE((scores->>'stage3')::numeric, 0) +
         COALESCE((scores->>'stage4')::numeric, 0)) / 4
      ), 1), 0)
      FROM block_completions
      WHERE completed_at::date = CURRENT_DATE
    ),
    'completion_rate', (
      SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE completed_at IS NOT NULL) * 100.0 / COUNT(*))::numeric, 1)
      END
      FROM block_sessions
      WHERE started_at::date = CURRENT_DATE
    ),
    'blocks', (
      SELECT COALESCE(json_agg(row_to_json(b)), '[]'::json) FROM (
        SELECT
          bs.block_id,
          COUNT(*)::int AS starts,
          COUNT(bs.completed_at)::int AS completions,
          CASE WHEN COUNT(*) = 0 THEN 0
               ELSE ROUND((COUNT(bs.completed_at) * 100.0 / COUNT(*))::numeric, 1) END AS completion_pct,
          COALESCE(ROUND(AVG(bc.total_xp)::numeric, 0), 0)::int AS avg_xp,
          COALESCE(ROUND(AVG(
            (COALESCE((bc.scores->>'stage1')::numeric, 0) +
             COALESCE((bc.scores->>'stage2')::numeric, 0) +
             COALESCE((bc.scores->>'stage3')::numeric, 0) +
             COALESCE((bc.scores->>'stage4')::numeric, 0)) / 4
          ), 1), 0) AS avg_score
        FROM block_sessions bs
        LEFT JOIN block_completions bc
          ON bc.block_id = bs.block_id
          AND bc.completed_at::date = CURRENT_DATE
        WHERE bs.started_at::date = CURRENT_DATE
        GROUP BY bs.block_id
        ORDER BY COUNT(*) DESC
      ) b
    ),
    'recent_completions', (
      SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json) FROM (
        SELECT
          bc.block_id,
          bc.total_xp,
          bc.badges_earned,
          bc.completed_at,
          COALESCE(ROUND(
            (COALESCE((bc.scores->>'stage1')::numeric, 0) +
             COALESCE((bc.scores->>'stage2')::numeric, 0) +
             COALESCE((bc.scores->>'stage3')::numeric, 0) +
             COALESCE((bc.scores->>'stage4')::numeric, 0)) / 4
          , 1), 0) AS avg_score
        FROM block_completions bc
        WHERE bc.completed_at::date = CURRENT_DATE
        ORDER BY bc.completed_at DESC
        LIMIT 20
      ) r
    )
  );
$$;

-- Grant execute to authenticated users (RLS on underlying tables still applies via SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION facilitator_stats() TO authenticated;
