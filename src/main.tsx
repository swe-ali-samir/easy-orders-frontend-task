import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AppProviders } from './app/providers.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { AppCrashFallback } from './components/AppCrashFallback.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={() => <AppCrashFallback />}>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
