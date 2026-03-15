/**
 * Creates two test accounts for client demo directly via Supabase Postgres.
 * Bypasses rate limits by inserting into auth.users and public.profiles directly.
 *
 * Usage: node scripts/create-demo-accounts.mjs
 */

import pg from 'pg';
import crypto from 'crypto';
import dns from 'dns';

// Force IPv4 to avoid IPv6 timeout
dns.setDefaultResultOrder('ipv4first');

// Use Supabase connection pooler (IPv4 support) - session mode on port 5432
const DB_CONFIG = {
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.yiivqavacexoajzyjekc',
  password: 'PJ#W7r_PUWHqhd8',
  ssl: { rejectUnauthorized: false },
};

const accounts = [
  {
    email: 'facilitator.demo@gmail.com',
    password: 'WorkReady2026!',
    role: 'facilitator',
    displayName: 'Demo Facilitator',
  },
  {
    email: 'modulelead.demo@gmail.com',
    password: 'WorkReady2026!',
    role: 'module_lead',
    displayName: 'Demo Module Lead',
  },
];

/**
 * Hash a password using bcrypt-compatible format that Supabase GoTrue expects.
 * We use the pgcrypto crypt() function inside Postgres for this.
 */
async function createAccount(client, account) {
  const userId = crypto.randomUUID();
  console.log(`\nCreating ${account.role}: ${account.email} (${userId})`);

  // Check if user already exists
  const existing = await client.query(
    `SELECT id FROM auth.users WHERE email = $1`,
    [account.email]
  );

  if (existing.rows.length > 0) {
    const existingId = existing.rows[0].id;
    console.log(`  User already exists (${existingId}). Updating role...`);
    await client.query(
      `UPDATE public.profiles SET role = $1, display_name = $2 WHERE id = $3`,
      [account.role, account.displayName, existingId]
    );
    console.log(`  ✅ Role updated to "${account.role}"`);
    return existingId;
  }

  // Insert into auth.users using GoTrue-compatible encrypted password
  // Supabase uses bcrypt via pgcrypto's crypt() function
  await client.query(`
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      is_anonymous
    ) VALUES (
      $1,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      $2,
      crypt($3, gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      $4::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      false
    )
  `, [
    userId,
    account.email,
    account.password,
    JSON.stringify({ display_name: account.displayName }),
  ]);

  console.log(`  ✅ Auth user created`);

  // Insert identity record (required for email login)
  await client.query(`
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      $1,
      $2,
      'email',
      jsonb_build_object('sub', $1::text, 'email', $2, 'email_verified', true, 'phone_verified', false),
      NOW(),
      NOW(),
      NOW()
    )
  `, [userId, account.email]);

  console.log(`  ✅ Identity record created`);

  // The handle_new_user trigger should auto-create the profiles row.
  // But in case it didn't fire or set wrong role, update it explicitly.
  // Wait a moment for the trigger to fire
  await new Promise(r => setTimeout(r, 500));

  const profileCheck = await client.query(
    `SELECT id, role FROM public.profiles WHERE id = $1`, [userId]
  );

  if (profileCheck.rows.length > 0) {
    await client.query(
      `UPDATE public.profiles SET role = $1, display_name = $2 WHERE id = $3`,
      [account.role, account.displayName, userId]
    );
    console.log(`  ✅ Profile role updated to "${account.role}"`);
  } else {
    await client.query(
      `INSERT INTO public.profiles (id, role, display_name) VALUES ($1, $2, $3)`,
      [userId, account.role, account.displayName]
    );
    console.log(`  ✅ Profile created with role "${account.role}"`);
  }

  return userId;
}

async function main() {
  console.log('Connecting to Supabase Postgres...');
  const client = new pg.Client(DB_CONFIG);
  await client.connect();
  console.log('Connected!\n');

  try {
    for (const acct of accounts) {
      await createAccount(client, acct);
    }
  } finally {
    await client.end();
  }

  console.log('\n\n========================================');
  console.log('   DEMO CREDENTIALS (send to clients)');
  console.log('========================================\n');
  console.log('FACILITATOR LOGIN');
  console.log('  URL:      https://finance-education-prototype.vercel.app/login?role=facilitator');
  console.log('  Email:    facilitator.demo@gmail.com');
  console.log('  Password: WorkReady2026!\n');
  console.log('MODULE LEAD LOGIN');
  console.log('  URL:      https://finance-education-prototype.vercel.app/login?role=module_lead');
  console.log('  Email:    modulelead.demo@gmail.com');
  console.log('  Password: WorkReady2026!\n');
  console.log('========================================');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
