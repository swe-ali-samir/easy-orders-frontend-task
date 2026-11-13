import { cn } from '../../utils/cn';

export function DashedDivider({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-dashed border-gray-300', className)} />;
}
