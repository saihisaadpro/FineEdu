/**
 * Lightweight feature flag system for WorkReady Finance.
 *
 * Reads from Vite environment variables (VITE_*) with sensible defaults.
 * In development/testing, any flag can be overridden via localStorage:
 *
 *   localStorage.setItem('wrf-flag-ai-generation', 'false');
 *
 * This centralises the scattered `import.meta.env.VITE_*` checks
 * and makes it easy to force fallback mode during demos.
 */

const LS_PREFIX = 'wrf-flag-';

function readFlag(key: string, envDefault: boolean): boolean {
  try {
    const override = localStorage.getItem(`${LS_PREFIX}${key}`);
    if (override !== null) return override === 'true';
  } catch {
    // localStorage unavailable (SSR, privacy mode) — use env default
  }
  return envDefault;
}

export const FeatureFlags = {
  /** Whether the AI scenario generation backend is available. */
  get AI_GENERATION(): boolean {
    return readFlag('ai-generation', !!import.meta.env.VITE_API_URL);
  },

  /** Whether the AI chat assistant is enabled. */
  get AI_CHAT(): boolean {
    return readFlag('ai-chat', !!import.meta.env.VITE_API_URL);
  },

  /**
   * Whether prototype demo affordances are shown (quick-login buttons,
   * demo tour, role-override via localStorage). Defaults to true unless
   * explicitly disabled with VITE_DEMO_MODE=false.
   */
  get DEMO_MODE(): boolean {
    return readFlag('demo-mode', import.meta.env.VITE_DEMO_MODE !== 'false');
  },
} as const;
