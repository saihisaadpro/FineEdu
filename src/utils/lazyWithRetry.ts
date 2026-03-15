import { lazy, type ComponentType } from 'react';

/** How many times to re-attempt the dynamic import before reloading the page. */
const MAX_IMPORT_RETRIES = 2;
/** Delay in ms between import retries (doubles each attempt). */
const RETRY_BASE_DELAY = 500;

/**
 * Check if an error looks like a stale-chunk / network import failure.
 */
function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message;
  return (
    msg.includes('dynamically imported module') ||
    msg.includes('Failed to fetch') ||
    msg.includes('Loading chunk') ||
    msg.includes('Loading CSS chunk') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Importing a module script failed')
  );
}

/**
 * Wraps a dynamic import with retry logic for Vercel deployments.
 *
 * Strategy (3 layers):
 *  1. Retry the import up to MAX_IMPORT_RETRIES times with exponential backoff.
 *     This handles transient network blips without a visible reload.
 *  2. If retries are exhausted and the error looks like a stale chunk, force
 *     a single hard-reload to fetch the updated index.html.
 *     A sessionStorage flag prevents infinite reload loops.
 *  3. If we already reloaded and the import still fails, let the error
 *     propagate to the nearest ErrorBoundary / Route errorElement.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const storageKey = 'chunk-reload-retry';
    const hasReloaded = globalThis.sessionStorage?.getItem(storageKey);

    // Layer 1 — import-level retries with backoff
    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_IMPORT_RETRIES; attempt++) {
      try {
        const module = await importFn();
        // Import succeeded — clear any previous reload flag
        globalThis.sessionStorage?.removeItem(storageKey);
        return module;
      } catch (error) {
        lastError = error;
        if (attempt < MAX_IMPORT_RETRIES && isChunkLoadError(error)) {
          await new Promise(r => setTimeout(r, RETRY_BASE_DELAY * 2 ** attempt));
          continue;
        }
      }
    }

    // Layer 2 — hard-reload for stale-chunk errors (once only)
    if (!hasReloaded && isChunkLoadError(lastError)) {
      globalThis.sessionStorage?.setItem(storageKey, '1');
      // Clear SW caches so the reload fetches the real index.html
      if ('caches' in globalThis) {
        const names = await caches.keys();
        await Promise.all(names.map(n => caches.delete(n)));
      }
      globalThis.location.reload();
      // Return a never-resolving promise so React doesn't render the error
      // while the page is reloading
      return new Promise<{ default: T }>(() => {});
    }

    // Layer 3 — propagate to ErrorBoundary
    throw lastError;
  });
}
