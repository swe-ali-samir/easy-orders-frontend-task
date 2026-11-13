import type { ReactNode } from 'react';

export const PLACEHOLDER_TITLE = 'Not available in this demo';

export function StaticLink({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={className} title={PLACEHOLDER_TITLE}>
      {children}
    </span>
  );
}
