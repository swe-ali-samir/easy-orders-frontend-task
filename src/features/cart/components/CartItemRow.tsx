import type { CartItem } from '../../../types/cart';
import { useCartStore } from '../../../store/cart-store';
import { formatPrice } from '../../../utils/format-price';
import { ProductImage } from '../../../components/ui/ProductImage';
import { QuantitySelector } from '../../product/components/QuantitySelector';
import { TrashIcon } from '../../../components/ui/icons';

export function CartItemRow({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <li className="flex gap-4 py-4" data-testid="cart-item">
      {item.image && (
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <ProductImage src={item.image} alt={item.productName} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{item.productName}</p>
            {Object.keys(item.options).length > 0 && (
              <p className="text-xs text-gray-500">{Object.values(item.options).join(' · ')}</p>
            )}
            <p className="text-sm font-medium">{formatPrice(item.unitPrice, item.currency)}</p>
          </div>
          <button
            type="button"
            aria-label={`Remove ${item.productName} from cart`}
            data-testid="remove-item"
            onClick={() => removeItem(item.variantId)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600"
          >
            <TrashIcon />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <QuantitySelector
            value={item.quantity}
            max={item.maxQuantity}
            onChange={(quantity) => updateQuantity(item.variantId, quantity)}
          />
          <span className="text-sm font-semibold" data-testid="line-total">
            {formatPrice(item.unitPrice * item.quantity, item.currency)}
          </span>
        </div>
      </div>
    </li>
  );
}
