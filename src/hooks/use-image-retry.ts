import { useState } from 'react';

/** One automatic retry: the product image CDN intermittently drops requests. */
const MAX_RETRIES = 1;

/** Inline sources (data:, blob:) can't fail transiently, so they are never retried. */
function isInlineSource(src: string): boolean {
  return /^(data|blob):/i.test(src);
}

/**
 * Cache-busting retry URL for plain URLs. URLs that already carry a query (e.g. signed
 * URLs, where an extra parameter would invalidate the signature) are retried unchanged;
 * remounting the <img> (keyed by `attempt`) makes the browser request it again.
 */
function retrySource(src: string, attempt: number): string {
  if (attempt === 0) {
    return src;
  }
  const url = new URL(src, window.location.href);
  if (url.search) {
    return src;
  }
  url.searchParams.set('retry', String(attempt));
  return url.toString();
}

/**
 * Load-failure handling for an image: retries once, then reports `failed` so the caller
 * can render a placeholder. State resets whenever `src` changes. Use `attempt` as the
 * <img> key, `currentSrc` as its src, and call `handleError` from its onError.
 */
export function useImageRetry(src: string) {
  const [state, setState] = useState({ src, attempt: 0, failed: false });

  // Reset when the source changes (derived state; no effect needed).
  if (state.src !== src) {
    setState({ src, attempt: 0, failed: false });
  }

  const handleError = () => {
    setState((current) =>
      current.attempt < MAX_RETRIES && !isInlineSource(current.src)
        ? { ...current, attempt: current.attempt + 1 }
        : { ...current, failed: true },
    );
  };

  return {
    failed: state.failed,
    attempt: state.attempt,
    currentSrc: retrySource(src, state.attempt),
    handleError,
  };
}
