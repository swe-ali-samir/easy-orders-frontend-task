import { formatPrice } from '../../../utils/format-price';

interface PriceBlockProps {
  price: number;
  originalPrice: number;
  onSale: boolean;
  currency?: string;
}

export function PriceBlock({ price, originalPrice, onSale, currency }: PriceBlockProps) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 lg:gap-x-5">
      {onSale && (
        <s className="text-sm text-gray-500 lg:text-xl" data-testid="original-price">
          <span className="sr-only">Was </span>
          {formatPrice(originalPrice, currency)}
        </s>
      )}
      <span className="text-xl font-bold text-gray-900 lg:text-3xl" data-testid="price">
        {onSale && <span className="sr-only">Now </span>}
        {formatPrice(price, currency)}
      </span>
    </p>
  );
}
