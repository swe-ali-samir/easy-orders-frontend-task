import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { isRetryableError } from '../services/api-client';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // One retry, and only for transient failures (network, timeout, 5xx) — never 4xx or bad data.
      retry: (failureCount, error) => failureCount < 1 && isRetryableError(error),
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
