import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { BasketIcon, CloseIcon } from '../../../components/ui/icons';
import type { LastAdd } from '../../../store/cart-store';
import {
    selectCartCurrency,
    selectCartIsOpen,
    selectCartItems,
    selectCartSubtotal,
    useCartStore,
} from '../../../store/cart-store';
import type { CartItem } from '../../../types/cart';
import { cn } from '../../../utils/cn';
import { formatPrice } from '../../../utils/format-price';
import { CartItemRow } from './CartItemRow';

function addBanner(
  lastAdd: LastAdd,
  item: CartItem,
): { tone: 'success' | 'warning'; message: string } {
  if (lastAdd.added === 0) {
    return {
      tone: 'warning',
      message: `You already have the maximum (${item.maxQuantity}) of ${item.productName} in your cart.`,
    };
  }
  const limit = lastAdd.atLimit ? ` Maximum of ${item.maxQuantity} per order reached.` : '';
  return { tone: 'success', message: `Added ${item.productName} to your cart.${limit}` };
}

export function CartDrawer() {
  const isOpen = useCartStore(selectCartIsOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore(selectCartItems);
  const subtotal = useCartStore(selectCartSubtotal);
  const currency = useCartStore(selectCartCurrency);
  const lastAdd = useCartStore((state) => state.lastAdd);
  const lastAddedItem = useCartStore((state) =>
    state.items.find((item) => item.variantId === state.lastAdd?.variantId),
  );
  const banner = lastAdd && lastAddedItem ? addBanner(lastAdd, lastAddedItem) : null;

  return (
    <Dialog open={isOpen} onClose={closeCart} className="relative z-50" data-testid="cart-drawer">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 backdrop-blur-sm duration-300 ease-out data-[closed]:opacity-0 motion-reduce:transition-none"
      />

      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          transition
          className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl duration-300 ease-out data-[closed]:translate-x-full motion-reduce:transition-none"
        >
          <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <DialogTitle className="text-lg font-bold">Your Cart</DialogTitle>
            <button
              type="button"
              aria-label="Close cart"
              data-testid="close-cart"
              onClick={closeCart}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
            >
              <CloseIcon />
            </button>
          </header>

          {banner && (
            <Description
              data-testid="cart-added-banner"
              className={cn(
                'flex items-start gap-2 px-6 py-3 text-sm font-medium',
                banner.tone === 'success'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-amber-50 text-amber-900',
              )}
            >
              <span aria-hidden="true">{banner.tone === 'success' ? '✓' : '!'}</span>
              <span className="min-w-0">{banner.message}</span>
            </Description>
          )}

          {items.length === 0 ? (
            <div
              className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center"
              data-testid="cart-empty"
            >
              <BasketIcon className="size-12 text-gray-300" />
              <p className="text-base font-semibold">Your cart is empty</p>
              <p className="text-sm text-gray-500">Add products to see them here.</p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-2 rounded-full border border-gray-900 px-5 py-2 text-sm font-semibold transition hover:bg-gray-950 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto px-6">
                {items.map((item) => (
                  <CartItemRow key={item.variantId} item={item} />
                ))}
              </ul>

              <footer className="space-y-4 border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Subtotal
                  </span>
                  <span className="text-xl font-bold" data-testid="cart-subtotal">
                    {formatPrice(subtotal, currency)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Shipping and taxes are calculated at checkout.
                </p>
                <button
                  type="button"
                  disabled
                  aria-describedby="checkout-unavailable"
                  className="w-full cursor-not-allowed rounded-lg bg-gray-950 px-6 py-3 text-base font-semibold text-white opacity-50"
                >
                  Checkout
                </button>
                <p id="checkout-unavailable" className="text-center text-xs text-gray-500">
                  Checkout isn't available in this demo.
                </p>
              </footer>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
