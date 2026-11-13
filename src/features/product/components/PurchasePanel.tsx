import { StaticLink } from '../../../components/ui/StaticLink';
import type { Product } from '../../../types/domain';
import { cn } from '../../../utils/cn';
import { QuantitySelector } from './QuantitySelector';
import type { AddToCartPayload, ProductSelection } from '../hooks/use-product-selection';
import { usePurchaseActions } from '../hooks/use-purchase-actions';
import { VariationSelector } from './VariationSelector';

interface PurchasePanelProps {
  product: Product;
  selection: ProductSelection;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: (payload: AddToCartPayload) => void;
  className?: string;
}

const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900';

export function PurchasePanel({
  product,
  selection,
  quantity,
  onQuantityChange,
  onAddToCart,
  className,
}: PurchasePanelProps) {
  const { hint, outOfStock, addToCart, optionsRef } = usePurchaseActions({
    product,
    selection,
    quantity,
    onAddToCart,
  });

  return (
    <div className={cn('space-y-6 lg:space-y-8', className)} data-testid="purchase-panel">
      <div ref={optionsRef}>
        <VariationSelector
          groups={product.variations}
          selection={selection.selection}
          isAvailable={selection.isAvailable}
          isSelectable={selection.isSelectable}
          onSelect={selection.selectOption}
        />
      </div>

      {!product.isQuantityHidden && (
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-base text-gray-500 lg:text-xl">Quantity:</span>
          <QuantitySelector
            value={quantity}
            max={selection.maxQuantity}
            onChange={onQuantityChange}
          />
        </div>
      )}

      <div className="pt-2 lg:pt-6">
        <div className="flex flex-col gap-4 sm:flex-row md:flex-col lg:flex-row lg:gap-6">
          <button
            type="button"
            disabled={outOfStock}
            onClick={addToCart}
            aria-describedby={hint ? 'purchase-hint' : undefined}
            data-testid="add-to-cart-button"
            className={cn(
              'h-14 rounded-lg bg-gray-950 px-6 text-base font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap sm:flex-[3] sm:basis-0 md:basis-auto lg:basis-0 lg:h-[60px] lg:text-lg',
              focusRing,
            )}
          >
            Add To Cart
          </button>
          <button
            type="button"
            disabled={outOfStock}
            onClick={addToCart}
            aria-describedby={hint ? 'purchase-hint' : undefined}
            data-testid="checkout-now-button"
            className={cn(
              'h-14 rounded-lg border border-gray-300 bg-white px-6 text-base font-medium text-gray-900 transition hover:border-gray-900 disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap sm:flex-[2] sm:basis-0 md:basis-auto lg:basis-0 lg:h-[60px] lg:text-lg',
              focusRing,
            )}
          >
            Checkout Now
          </button>
        </div>
        <p
          id="purchase-hint"
          aria-live="polite"
          data-testid="add-to-cart-hint"
          className={cn('text-sm text-amber-800', hint && 'mt-3')}
        >
          {hint}
        </p>
      </div>

      <StaticLink className="hidden text-sm text-gray-500 underline underline-offset-4 sm:inline-block lg:text-base">
        Delivery T&amp;C
      </StaticLink>
    </div>
  );
}
