import { cn } from '../../utils/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-gray-200 motion-reduce:animate-none', className)}
      aria-hidden="true"
    />
  );
}
