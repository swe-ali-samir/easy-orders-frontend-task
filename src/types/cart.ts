import type { VariantSelection } from './domain';

export interface CartItem {
  /** Unique line key: the variant id, or a synthetic id for variant-less products. */
  variantId: string;
  productId: string;
  productName: string;
  image?: string;
  options: VariantSelection;
  /** Price per unit at the time of adding (sale-aware). */
  unitPrice: number;
  /** Product custom currency label; empty string means the store default. */
  currency: string;
  /** Upper bound for this line's quantity, enforced by the store. */
  maxQuantity: number;
  quantity: number;
}

export function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const item = value as Partial<CartItem>;
  return (
    typeof item.variantId === 'string' &&
    item.variantId.length > 0 &&
    typeof item.productId === 'string' &&
    typeof item.productName === 'string' &&
    typeof item.unitPrice === 'number' &&
    // Free (price 0) items are valid; only negative or non-finite prices are corrupt.
    Number.isFinite(item.unitPrice) &&
    item.unitPrice >= 0 &&
    typeof item.currency === 'string' &&
    typeof item.maxQuantity === 'number' &&
    item.maxQuantity > 0 &&
    Number.isInteger(item.quantity) &&
    (item.quantity as number) > 0 &&
    typeof item.options === 'object' &&
    item.options !== null
  );
}
