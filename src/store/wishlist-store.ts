import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncAcrossTabs } from './sync-across-tabs';

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
}

function sanitizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return Array.from(
    new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0)),
  );
}

export const WISHLIST_STORAGE_KEY = 'easy-orders-wishlist';

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
    }),
    {
      name: WISHLIST_STORAGE_KEY,
      version: 1,
      merge: (persisted, current) => {
        const persistedState = (persisted ?? {}) as { ids?: unknown };
        return { ...current, ids: sanitizeIds(persistedState.ids) };
      },
    },
  ),
);

syncAcrossTabs(useWishlistStore, WISHLIST_STORAGE_KEY);

export const selectWishlistCount = (state: WishlistState) => state.ids.length;
