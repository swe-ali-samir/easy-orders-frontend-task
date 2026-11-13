import { FETCH_TIMEOUT_MS } from './config';

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'parse' | 'invalid';

/** Technical error: `message` is for developers; show `getUserErrorMessage(error)` to users. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

/**
 * `AbortSignal.any` with a fallback: part of the build target (Chrome 111, Firefox 114,
 * Safari 16.4) predates it. `AbortSignal.timeout` needs no fallback (supported by all targets).
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any(signals);
  }
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}

/**
 * GETs JSON. The caller's `signal` (e.g. React Query's, on unmount or key change) is
 * combined with a timeout, which also covers reading the body. In both phases a caller
 * abort is rethrown as-is so the query treats it as a cancellation, and a timeout becomes
 * a (retryable) `timeout` error. Only a body that genuinely isn't JSON is `parse`.
 */
export async function fetchJson(url: string, init: RequestInit = {}): Promise<unknown> {
  const timeout = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  const signal = init.signal ? anySignal([init.signal, timeout]) : timeout;

  const abortError = (cause: unknown): unknown => {
    if (init.signal?.aborted) {
      return cause;
    }
    if (timeout.aborted) {
      return new ApiError('timeout', `Request timed out after ${FETCH_TIMEOUT_MS}ms`);
    }
    return null;
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...init.headers,
      },
      signal,
    });
  } catch (cause) {
    throw abortError(cause) ?? new ApiError('network', 'Network error: the service is unreachable');
  }

  if (!response.ok) {
    throw new ApiError('http', `Request failed with status ${response.status}`, response.status);
  }

  try {
    return await response.json();
  } catch (cause) {
    throw abortError(cause) ?? new ApiError('parse', 'Response is not valid JSON');
  }
}

/** Only transient failures are worth retrying: network, timeout and 5xx. */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }
  if (error.kind === 'network' || error.kind === 'timeout') {
    return true;
  }
  return error.kind === 'http' && (error.status ?? 0) >= 500;
}

export function getUserErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'network':
      case 'timeout':
        return 'Please check your internet connection and try again.';
      case 'http':
        return error.status === 404
          ? 'This product is no longer available.'
          : 'Our store is having trouble right now. Please try again in a moment.';
      case 'parse':
      case 'invalid':
        return 'We received unexpected product data. Please try again later.';
    }
  }
  return 'Something went wrong. Please try again.';
}
