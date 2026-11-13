import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });
}

export function renderWithProviders(ui: ReactElement, client = createTestQueryClient()) {
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}
