import { useRef, useState } from 'react';
import type { Product } from '../../../types/domain';
import type { AddToCartPayload, ProductSelection } from './use-product-selection';

interface UsePurchaseActionsOptions {
  product: Product;
  selection: ProductSelection;
  quantity: number;
  onAddToCart: (payload: AddToCartPayload) => void;
}

function formatMissing(groups: string[]): string {
  return `Please select ${groups.join(' and ')}`;
}

/**
 * Add-to-cart validation shared by "Add To Cart" and "Checkout Now". Feedback appears
 * only after the user tries to add (the design shows no hint up front); a failed attempt
 * moves focus to the first option group that still needs a choice. Attach `optionsRef`
 * to the element containing the variation groups.
 */
export function usePurchaseActions({
  product,
  selection,
  quantity,
  onAddToCart,
}: UsePurchaseActionsOptions) {
  const [attempted, setAttempted] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Nothing purchasable at all: every option is disabled, so asking the customer to
  // "select" one would be a dead end.
  const soldOut = selection.selectedVariant === undefined && !selection.inStock;
  const outOfStock =
    soldOut || (selection.selectedVariant !== undefined && selection.maxQuantity <= 0);
  const missing = selection.missingGroups;

  let hint = '';
  if (soldOut) {
    hint = 'This product is out of stock';
  } else if (outOfStock) {
    hint =
      product.variations.length > 0
        ? 'This combination is out of stock'
        : 'This product is out of stock';
  } else if (attempted && missing.length > 0) {
    hint = formatMissing(missing);
  } else if (attempted && !selection.selectedVariant) {
    // Every group is chosen but no variant matches: say so instead of failing silently.
    hint = "This combination isn't available. Please choose different options.";
  }

  const addToCart = () => {
    if (outOfStock) {
      return;
    }
    if (missing.length > 0 || !selection.selectedVariant) {
      setAttempted(true);
      // Take keyboard and screen-reader users to the first group that still needs a choice.
      optionsRef.current
        ?.querySelector<HTMLButtonElement>(
          `[data-variation-group="${CSS.escape(missing[0] ?? '')}"] button:not([disabled])`,
        )
        ?.focus();
      return;
    }
    setAttempted(false);
    onAddToCart({ variant: selection.selectedVariant, quantity });
  };

  return { hint, outOfStock, addToCart, optionsRef };
}
