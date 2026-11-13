import { useState } from 'react';
import { useCartStore } from '../../../store/cart-store';
import type { CartItem } from '../../../types/cart';
import type { Product } from '../../../types/domain';
import type { AddToCartPayload, ProductSelection } from './use-product-selection';

/**
 * The quantity being chosen and adding the selected variant to the cart. Quantity is
 * clamped to the current stock bound (it can shrink when the variant changes); after a
 * successful add the cart drawer opens and the quantity resets to 1.
 */
export function useAddToCart(product: Product, selection: ProductSelection) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const [rawQuantity, setQuantity] = useState(1);
  const quantity = Math.min(rawQuantity, Math.max(1, selection.maxQuantity));

  const addToCart = ({ variant, quantity: addedQuantity }: AddToCartPayload) => {
    const item: CartItem = {
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      image: selection.highlightImage ?? product.images[0],
      options: variant.options,
      unitPrice: selection.price,
      currency: product.customCurrency,
      maxQuantity: selection.maxQuantity,
      quantity: addedQuantity,
    };
    addItem(item);
    openCart();
    setQuantity(1);
  };

  return { quantity, setQuantity, addToCart };
}
