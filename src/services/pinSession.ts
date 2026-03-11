import { supabase } from './supabase';
import { generatePIN, hashPIN, verifyPIN } from '@/utils/pin';

interface PinSessionData {
  xp: number;
  badges: string[];
  topicProgress: Record<string, unknown>;
}

interface SavePinResult {
  pin: string;
  pinHash: string;
}

/**
 * Generate a new PIN, hash it, and save the learner's progress.
 * Returns the plain-text PIN (shown once to the user) and the hash.
 */
export const savePinSession = async (
  sessionData: PinSessionData,
): Promise<SavePinResult> => {
  const pin = generatePIN();
  const pinHash = await hashPIN(pin);

  const { error } = await supabase.from('pin_sessions').insert({
    pin_hash: pinHash,
    session_data: sessionData,
  });

  if (error) throw new Error(`Failed to save PIN session: ${error.message}`);

  return { pin, pinHash };
};

/**
 * Look up all candidate PIN sessions and verify the PIN client-side
 * using constant-time comparison. Returns the session data if found.
 *
 * NOTE: Because PIN hashes use random salts, we cannot do a simple
 * WHERE pin_hash = $1 query. Instead we fetch recent non-expired
 * sessions and verify each against the submitted PIN. For the current
 * scale (<1000 sessions) this is acceptable. At larger scale, move
 * verification to a Supabase Edge Function.
 */
export const loadPinSession = async (
  pin: string,
): Promise<PinSessionData | null> => {
  const { data: sessions, error } = await supabase
    .from('pin_sessions')
    .select('id, pin_hash, session_data, expires_at')
    .gt('expires_at', new Date().toISOString())
    .order('last_accessed', { ascending: false })
    .limit(500);

  if (error) throw new Error(`Failed to query PIN sessions: ${error.message}`);
  if (!sessions || sessions.length === 0) return null;

  for (const session of sessions) {
    const match = await verifyPIN(pin, session.pin_hash);
    if (match) {
      // Update last_accessed timestamp
      await supabase
        .from('pin_sessions')
        .update({ last_accessed: new Date().toISOString() })
        .eq('id', session.id);

      return session.session_data as PinSessionData;
    }
  }

  return null;
};
