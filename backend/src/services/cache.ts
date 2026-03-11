import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import { logger } from '../logger.js';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY);

const CACHE_TTL_DAYS = 7;

export const getCachedScenario = async (cacheKey: string): Promise<unknown | null> => {
  try {
    const { data, error } = await supabase
      .from('generation_cache')
      .select('scenario_data')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (error || !data) return null;
    return data.scenario_data;
  } catch {
    return null; // Cache miss is non-critical — proceed to generate
  }
};

export const cacheScenario = async (cacheKey: string, scenario: unknown): Promise<void> => {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);
    await supabase
      .from('generation_cache')
      .upsert({
        cache_key: cacheKey,
        scenario_data: scenario,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      }, { onConflict: 'cache_key' });
  } catch (err) {
    logger.warn({ err }, 'Failed to cache scenario — non-critical');
  }
};
