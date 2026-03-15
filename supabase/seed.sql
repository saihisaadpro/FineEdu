-- ============================================================
-- WorkReady Finance — Demo Seed Data
-- ============================================================
-- Referenced by supabase/config.toml → [db.seed] sql_paths
-- Run with: supabase db reset (local dev)
--
-- This file seeds:
--   1. Demo auth users (facilitator + module lead)
--   2. Profile rows with correct roles
--   3. Block ownership assignments
--   4. Sample learner sessions and completions (populates dashboards)
--   5. Sample assessment results and survey responses
--
-- Demo Credentials (local dev only):
--   Facilitator:  facilitator.demo@gmail.com / WorkReady2026!
--   Module Lead:  modulelead.demo@gmail.com  / WorkReady2026!
-- ============================================================

-- Fixed UUIDs for reproducibility
-- Facilitator: 11111111-1111-1111-1111-111111111111
-- Module Lead: 22222222-2222-2222-2222-222222222222
-- Learner A:   aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001
-- Learner B:   aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002
-- Learner C:   aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa003

-- ── 1. Auth Users ────────────────────────────────────────────────────

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
  -- Facilitator
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated',
    'facilitator.demo@gmail.com',
    crypt('WorkReady2026!', gen_salt('bf')),
    now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Demo Facilitator"}',
    now(), now(), '', '', '', ''
  ),
  -- Module Lead
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated',
    'modulelead.demo@gmail.com',
    crypt('WorkReady2026!', gen_salt('bf')),
    now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Demo Module Lead"}',
    now(), now(), '', '', '', ''
  ),
  -- Anonymous Learner A
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001',
    'authenticated', 'authenticated',
    NULL, '', now(), now(),
    '{"provider":"anonymous","providers":["anonymous"]}',
    '{"display_name":"Learner A"}',
    now(), now(), '', '', '', ''
  ),
  -- Anonymous Learner B
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002',
    'authenticated', 'authenticated',
    NULL, '', now(), now(),
    '{"provider":"anonymous","providers":["anonymous"]}',
    '{"display_name":"Learner B"}',
    now(), now(), '', '', '', ''
  ),
  -- Anonymous Learner C
  (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa003',
    'authenticated', 'authenticated',
    NULL, '', now(), now(),
    '{"provider":"anonymous","providers":["anonymous"]}',
    '{"display_name":"Learner C"}',
    now(), now(), '', '', '', ''
  )
ON CONFLICT (id) DO NOTHING;

-- Auth identities (required by GoTrue for email login)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
   json_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'facilitator.demo@gmail.com'),
   'email', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
   json_build_object('sub', '22222222-2222-2222-2222-222222222222', 'email', 'modulelead.demo@gmail.com'),
   'email', now(), now(), now())
ON CONFLICT DO NOTHING;

-- ── 2. Profiles ──────────────────────────────────────────────────────
-- handle_new_user trigger fires on auth.users insert, creating 'guest' rows.
-- We upsert to set the correct roles.

INSERT INTO profiles (id, role, display_name, organisation) VALUES
  ('11111111-1111-1111-1111-111111111111', 'facilitator', 'Demo Facilitator', 'UWE Bristol'),
  ('22222222-2222-2222-2222-222222222222', 'module_lead', 'Demo Module Lead', 'UWE Bristol'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001', 'guest', 'Learner A', NULL),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002', 'guest', 'Learner B', NULL),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa003', 'guest', 'Learner C', NULL)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  display_name = EXCLUDED.display_name,
  organisation = EXCLUDED.organisation;

-- ── 3. Block Ownership ───────────────────────────────────────────────

UPDATE block_ownership
SET owner_id = '22222222-2222-2222-2222-222222222222'
WHERE block_id IN ('accounting', 'investment', 'management', 'fintech');

-- ── 4. Sample Sessions (today's date for facilitator dashboard) ──────

INSERT INTO sessions (id, anon_user_id, started_at, last_active, role, blocks_accessed, stages_completed, total_xp, device_type) VALUES
  ('cccc0001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001',
   now() - interval '3 hours', now() - interval '20 minutes',
   'student', '{accounting}', '{acc_1,acc_2,acc_3,acc_4}', 280, 'desktop'),
  ('cccc0002-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002',
   now() - interval '2 hours', now() - interval '10 minutes',
   'student', '{accounting,investment}', '{acc_1,acc_2,inv_1}', 165, 'mobile'),
  ('cccc0003-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa003',
   now() - interval '1 hour', now() - interval '5 minutes',
   'student', '{investment}', '{inv_1,inv_2}', 95, 'desktop')
ON CONFLICT (id) DO NOTHING;

-- ── 5. Block Sessions ────────────────────────────────────────────────

INSERT INTO block_sessions (id, session_id, block_id, current_stage, stages_completed, total_xp, started_at, completed_at) VALUES
  -- Learner A: completed accounting
  ('dddd0001-0000-0000-0000-000000000001', 'cccc0001-0000-0000-0000-000000000001',
   'accounting', 4, '{1,2,3,4}', 280, now() - interval '3 hours', now() - interval '1 hour'),
  -- Learner B: accounting in progress (stage 3)
  ('dddd0002-0000-0000-0000-000000000002', 'cccc0002-0000-0000-0000-000000000002',
   'accounting', 3, '{1,2}', 100, now() - interval '2 hours', NULL),
  -- Learner B: investment started
  ('dddd0003-0000-0000-0000-000000000003', 'cccc0002-0000-0000-0000-000000000002',
   'investment', 1, '{}', 65, now() - interval '30 minutes', NULL),
  -- Learner C: investment in progress (stage 3)
  ('dddd0004-0000-0000-0000-000000000004', 'cccc0003-0000-0000-0000-000000000003',
   'investment', 3, '{1,2}', 95, now() - interval '1 hour', NULL)
ON CONFLICT (id) DO NOTHING;

-- ── 6. Block Completions ─────────────────────────────────────────────

INSERT INTO block_completions (id, user_id, block_id, scores, total_xp, badges_earned, time_taken_seconds, completed_at) VALUES
  ('eeee0001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001',
   'accounting',
   '{"stage1": 83, "stage2": 67, "stage3": 100, "stage4": 75}',
   280, '{first_steps,quick_thinker,perfect_score}', 5400, now() - interval '1 hour')
ON CONFLICT (id) DO NOTHING;

-- ── 7. Assessment Results ────────────────────────────────────────────

INSERT INTO assessment_results (id, session_id, block_id, stage_number, question_id, correct, difficulty, time_taken_ms, answered_at) VALUES
  -- Learner A: accounting stage 1 (5/6)
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 1, 'acc1_q1', true,  'easy',   4200, now() - interval '170 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 1, 'acc1_q2', true,  'easy',   3800, now() - interval '169 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 1, 'acc1_q3', true,  'medium', 6100, now() - interval '168 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 1, 'acc1_q4', false, 'medium', 8200, now() - interval '167 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 1, 'acc1_q5', true,  'hard',   9500, now() - interval '166 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 1, 'acc1_q6', true,  'hard',   7300, now() - interval '165 minutes'),
  -- Learner A: accounting stage 2 (4/6)
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 2, 'acc2_q1', true,  'easy',   3500, now() - interval '155 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 2, 'acc2_q2', true,  'easy',   4100, now() - interval '154 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 2, 'acc2_q3', false, 'medium', 7800, now() - interval '153 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 2, 'acc2_q4', true,  'medium', 5600, now() - interval '152 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 2, 'acc2_q5', false, 'hard',   9900, now() - interval '151 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 2, 'acc2_q6', true,  'hard',  11200, now() - interval '150 minutes'),
  -- Learner A: accounting stage 3 (6/6 perfect)
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 3, 'acc3_q1', true, 'easy',   3200, now() - interval '130 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 3, 'acc3_q2', true, 'easy',   2900, now() - interval '129 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 3, 'acc3_q3', true, 'medium', 5100, now() - interval '128 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 3, 'acc3_q4', true, 'medium', 4800, now() - interval '127 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 3, 'acc3_q5', true, 'hard',   8700, now() - interval '126 minutes'),
  (gen_random_uuid(), 'cccc0001-0000-0000-0000-000000000001', 'accounting', 3, 'acc3_q6', true, 'hard',   7100, now() - interval '125 minutes'),
  -- Learner B: accounting stage 1 (4/6)
  (gen_random_uuid(), 'cccc0002-0000-0000-0000-000000000002', 'accounting', 1, 'acc1_q1', true,  'easy',   5100, now() - interval '110 minutes'),
  (gen_random_uuid(), 'cccc0002-0000-0000-0000-000000000002', 'accounting', 1, 'acc1_q2', true,  'easy',   4400, now() - interval '109 minutes'),
  (gen_random_uuid(), 'cccc0002-0000-0000-0000-000000000002', 'accounting', 1, 'acc1_q3', false, 'medium', 9200, now() - interval '108 minutes'),
  (gen_random_uuid(), 'cccc0002-0000-0000-0000-000000000002', 'accounting', 1, 'acc1_q4', true,  'medium', 7600, now() - interval '107 minutes'),
  (gen_random_uuid(), 'cccc0002-0000-0000-0000-000000000002', 'accounting', 1, 'acc1_q5', false, 'hard',  12300, now() - interval '106 minutes'),
  (gen_random_uuid(), 'cccc0002-0000-0000-0000-000000000002', 'accounting', 1, 'acc1_q6', true,  'hard',   8900, now() - interval '105 minutes'),
  -- Learner C: investment stage 1 (5/6)
  (gen_random_uuid(), 'cccc0003-0000-0000-0000-000000000003', 'investment', 1, 'inv1_q1', true,  'easy',   3600, now() - interval '55 minutes'),
  (gen_random_uuid(), 'cccc0003-0000-0000-0000-000000000003', 'investment', 1, 'inv1_q2', true,  'easy',   4000, now() - interval '54 minutes'),
  (gen_random_uuid(), 'cccc0003-0000-0000-0000-000000000003', 'investment', 1, 'inv1_q3', true,  'medium', 5500, now() - interval '53 minutes'),
  (gen_random_uuid(), 'cccc0003-0000-0000-0000-000000000003', 'investment', 1, 'inv1_q4', false, 'medium', 8100, now() - interval '52 minutes'),
  (gen_random_uuid(), 'cccc0003-0000-0000-0000-000000000003', 'investment', 1, 'inv1_q5', true,  'hard',  10200, now() - interval '51 minutes'),
  (gen_random_uuid(), 'cccc0003-0000-0000-0000-000000000003', 'investment', 1, 'inv1_q6', true,  'hard',   7800, now() - interval '50 minutes')
ON CONFLICT (id) DO NOTHING;

-- ── 8. Survey Responses ──────────────────────────────────────────────

INSERT INTO survey_responses (id, user_id, block_id, survey_type, responses, created_at) VALUES
  -- Learner A: pre + post for accounting (confidence grew)
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001', 'accounting', 'pre',
   '{"q1": 2, "q2": 3, "q3": 2, "q4": 1, "q5": 3}',
   now() - interval '3 hours'),
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa001', 'accounting', 'post',
   '{"q1": 4, "q2": 4, "q3": 3, "q4": 3, "q5": 4}',
   now() - interval '1 hour'),
  -- Learner B: pre only for accounting (in progress)
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa002', 'accounting', 'pre',
   '{"q1": 3, "q2": 2, "q3": 3, "q4": 2, "q5": 2}',
   now() - interval '2 hours'),
  -- Learner C: pre for investment
  (gen_random_uuid(), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa003', 'investment', 'pre',
   '{"q1": 1, "q2": 2, "q3": 2, "q4": 1, "q5": 1}',
   now() - interval '1 hour')
ON CONFLICT (id) DO NOTHING;

-- ── 9. Sample Scenario Review (pending escalation) ───────────────────

INSERT INTO scenario_reviews (id, block_id, stage_number, flagged_by, flagged_by_role, flag_reason, status, created_at) VALUES
  (gen_random_uuid(), 'accounting', 2,
   '11111111-1111-1111-1111-111111111111', 'facilitator',
   'Question 3 in stage 2 has ambiguous wording — learners consistently get it wrong.',
   'pending', now() - interval '45 minutes')
ON CONFLICT (id) DO NOTHING;
