import { useEffect, useState } from 'react';

type ShareStatus = 'idle' | 'copied' | 'error';

const SHARE_MESSAGE_MS = 2500;

/**
 * Shares the current page: the native share sheet when available, otherwise (or when it
 * fails) copying the link. Dismissing the native sheet is not a failure. `status` drives a
 * short-lived message and resets to 'idle' on its own.
 */
export function useShareLink(title: string) {
  const [status, setStatus] = useState<ShareStatus>('idle');

  useEffect(() => {
    if (status === 'idle') {
      return;
    }
    const timer = setTimeout(() => setStatus('idle'), SHARE_MESSAGE_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const share = async () => {
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        return; // The native share sheet is its own feedback.
      } catch (error) {
        // Dismissing the sheet is not a failure; any other error falls back to copying.
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  };

  return { share, status };
}
