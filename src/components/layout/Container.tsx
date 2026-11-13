import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1440px] px-6 md:px-10 xl:px-20', className)}>
      {children}
    </div>
  );
}
