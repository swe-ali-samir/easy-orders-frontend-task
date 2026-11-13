import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Rendered instead of `children` after an error; `reset` re-renders the children. */
  fallback: (reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Catches render/lazy-load errors below it so a failure doesn't unmount the whole app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  private reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    return this.state.hasError ? this.props.fallback(this.reset) : this.props.children;
  }
}
