import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/cart';
import { isCartItem } from '../types/cart';
import { syncAcrossTabs } from './sync-across-tabs';

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  /** Outcome of the latest add in this drawer session; drives the banner. Not persisted. */
  lastAdd: LastAdd | null;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  openCart: () => void;
  closeCart: () => void;
}

export interface LastAdd {
  variantId: string;
  /** Units actually added (0 when the line was already at its limit). */
  added: number;
  /** The line is now at its per-order maximum. */
  atLimit: boolean;
}

export const CART_STORAGE_KEY = 'easy-orders-cart';
export const CART_STORAGE_VERSION = 2;

const initialCartState = {
  items: [] as CartItem[],
  isOpen: false,
  lastAdd: null as LastAdd | null,
};

function clampQuantity(quantity: number, maxQuantity: number): number {
  return Math.min(Math.max(1, quantity), maxQuantity);
}

function sanitizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }
  // Merge duplicate lines (same variant) so keys stay unique and removal stays per-line.
  const byVariant = new Map<string, CartItem>();
  for (const item of value.filter(isCartItem)) {
    const existing = byVariant.get(item.variantId);
    byVariant.set(
      item.variantId,
      existing ? { ...existing, quantity: existing.quantity + item.quantity } : { ...item },
    );
  }
  return [...byVariant.values()].map((item) => ({
    ...item,
    quantity: clampQuantity(item.quantity, item.maxQuantity),
  }));
}

export const useCartStore = create<CartState>()(
  persist(
    immer((set) => ({
      ...initialCartState,

      addItem: (item) =>
        set((state) => {
          // Nothing to add: invalid quantity or no stock for this line.
          if (item.quantity <= 0 || item.maxQuantity <= 0) {
            return;
          }
          const existing = state.items.find((candidate) => candidate.variantId === item.variantId);
          const before = existing?.quantity ?? 0;
          let after: number;
          if (existing) {
            // Refresh line data from the latest add (price/stock may have changed since).
            existing.unitPrice = item.unitPrice;
            existing.currency = item.currency;
            existing.maxQuantity = item.maxQuantity;
            existing.image = item.image;
            existing.quantity = clampQuantity(existing.quantity + item.quantity, item.maxQuantity);
            after = existing.quantity;
          } else {
            after = clampQuantity(item.quantity, item.maxQuantity);
            state.items.push({ ...item, quantity: after });
          }
          state.lastAdd = {
            variantId: item.variantId,
            added: after - before,
            atLimit: after >= item.maxQuantity,
          };
        }),

      removeItem: (variantId) =>
        set((state) => {
          state.items = state.items.filter((item) => item.variantId !== variantId);
        }),

      updateQuantity: (variantId, quantity) =>
        set((state) => {
          const item = state.items.find((candidate) => candidate.variantId === variantId);
          if (!item) {
            return;
          }
          if (quantity <= 0) {
            state.items = state.items.filter((candidate) => candidate.variantId !== variantId);
            return;
          }
          item.quantity = clampQuantity(quantity, item.maxQuantity);
        }),

      openCart: () =>
        set((state) => {
          state.isOpen = true;
        }),

      closeCart: () =>
        set((state) => {
          state.isOpen = false;
          state.lastAdd = null;
        }),
    })),
    {
      name: CART_STORAGE_KEY,
      version: CART_STORAGE_VERSION,
      // Only the cart lines survive a refresh; drawer state and the banner are session UI.
      partialize: (state) => ({ items: state.items }),
      // v1 → v2: lines gained `currency` (empty = store default).
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as { items?: unknown };
        if (version < 2 && Array.isArray(state.items)) {
          return {
            items: state.items.map((item) =>
              typeof item === 'object' && item !== null ? { currency: '', ...item } : item,
            ),
          };
        }
        return state;
      },
      merge: (persisted, current) => ({
        ...current,
        items: sanitizeItems((persisted as { items?: unknown } | undefined)?.items),
      }),
    },
  ),
);

syncAcrossTabs(useCartStore, CART_STORAGE_KEY);

export const selectCartCount = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

/** All lines come from one store, so they share a currency; the first line's label is used. */
export const selectCartCurrency = (state: CartState): string => state.items[0]?.currency ?? '';

export const selectCartItems = (state: CartState): CartItem[] => state.items;

export const selectCartIsOpen = (state: CartState): boolean => state.isOpen;
