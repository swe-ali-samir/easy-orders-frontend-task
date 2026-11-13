import { cn } from '../../../utils/cn';

export function StockStatus({ inStock }: { inStock: boolean }) {
  return (
    <p
      data-testid="stock-status"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium lg:text-sm',
        inStock ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('h-1.5 w-1.5 rounded-full', inStock ? 'bg-emerald-600' : 'bg-red-600')}
      />
      {inStock ? 'In Stock' : 'Out of Stock'}
    </p>
  );
}
