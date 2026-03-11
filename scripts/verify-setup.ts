// scripts/verify-setup.ts — run with: npx tsx scripts/verify-setup.ts
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load .env.local (Vite does this automatically, but Node scripts need it explicitly)
config({ path: '.env.local' });

const checks = {
  nodeVersion: () => {
    const [major] = process.version.slice(1).split('.').map(Number);
    if (major < 22) throw new Error(`Node.js 22+ required, found ${process.version}`);
    console.log(`✓ Node.js ${process.version}`);
  },
  envVars: () => {
    const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const missing = required.filter(v => !process.env[v]);
    if (missing.length) throw new Error(`Missing env vars: ${missing.join(', ')}`);
    console.log('✓ Environment variables set');
  },
  supabase: async () => {
    const url = process.env.VITE_SUPABASE_URL!;
    const key = process.env.VITE_SUPABASE_ANON_KEY!;
    const client = createClient(url, key);
    const { error } = await client.auth.signInAnonymously();
    if (error) throw new Error(`Supabase connection failed: ${error.message}`);
    console.log('✓ Supabase connectivity verified');
  },
};

(async () => {
  console.log('Verifying development setup...\n');
  for (const [name, check] of Object.entries(checks)) {
    try {
      await check();
    } catch (e: any) {
      console.error(`✗ ${name}: ${e.message}`);
      process.exit(1);
    }
  }
  console.log('\nAll checks passed. Ready to develop.');
})();
