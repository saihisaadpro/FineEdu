/**
 * Secure PIN generation, hashing, and verification utilities.
 * Uses the Web Crypto API — no external dependencies.
 */

/** Generate a cryptographically random 4-digit PIN. */
export const generatePIN = (): string => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 10000).padStart(4, '0');
};

/** Generate a random 16-byte hex salt for PIN hashing. */
const generateSalt = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash a PIN using PBKDF2 (100 000 iterations, SHA-256).
 * Returns "salt:hash" format for storage.
 */
export const hashPIN = async (
  pin: string,
  existingSalt?: string,
): Promise<string> => {
  const salt = existingSalt ?? generateSalt();
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );

  const hash = Array.from(new Uint8Array(derivedBits), (b) =>
    b.toString(16).padStart(2, '0'),
  ).join('');

  return `${salt}:${hash}`;
};

/**
 * Verify a PIN against a stored "salt:hash" value.
 * Uses constant-time comparison to prevent timing attacks.
 */
export const verifyPIN = async (
  pin: string,
  stored: string,
): Promise<boolean> => {
  const [salt] = stored.split(':');
  if (!salt) return false;

  const rehashed = await hashPIN(pin, salt);

  // Constant-time comparison
  if (rehashed.length !== stored.length) return false;
  let mismatch = 0;
  for (let i = 0; i < rehashed.length; i++) {
    mismatch |= rehashed.charCodeAt(i) ^ stored.charCodeAt(i);
  }
  return mismatch === 0;
};
