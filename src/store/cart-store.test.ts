import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CART_STORAGE_VERSION,
  selectCartCount,
  selectCartSubtotal,
  useCartStore,
} from './cart-store';
import type { CartItem } from '../types/cart';

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId: 'v5',
    productId: 'p1',
    productName: 'Sneakers',
    image: 'https://example.com/a.webp',
    options: { color: 'black', size: '40' },
    unitPrice: 150,
    currency: '',
    maxQuantity: 3,
    quantity: 1,
    ...overrides,
  };
}

const store = () => useCartStore.getState();

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ items: [], isOpen: false, lastAdd: null });
  vi.restoreAllMocks();
});

describe('addItem', () => {
  it('merges identical variants into one line', () => {
    store().addItem(makeItem());
    store().addItem(makeItem({ quantity: 2 }));
    expect(store().items).toHaveLength(1);
    expect(store().items[0].quantity).toBe(3);
  });

  it('caps both new and merged lines at the line maxQuantity', () => {
    store().addItem(makeItem({ quantity: 99 }));
    expect(store().items[0].quantity).toBe(3);

    store().updateQuantity('v5', 1);
    store().addItem(makeItem({ quantity: 5 }));
    expect(store().items[0].quantity).toBe(3);
  });
});

describe('addItem guards', () => {
  it('ignores adds with no quantity or no stock', () => {
    store().addItem(makeItem({ quantity: 0 }));
    store().addItem(makeItem({ maxQuantity: 0 }));
    expect(store().items).toHaveLength(0);
    expect(store().lastAdd).toBeNull();
  });

  it('refreshes price, currency and stock bounds when the same line is added again', () => {
    store().addItem(makeItem({ quantity: 2 }));
    store().addItem(makeItem({ quantity: 1, unitPrice: 140, currency: 'LE', maxQuantity: 2 }));
    expect(store().items[0]).toMatchObject({
      unitPrice: 140,
      currency: 'LE',
      maxQuantity: 2,
      quantity: 2,
    });
  });
});

describe('updateQuantity', () => {
  it('clamps values above maxQuantity', () => {
    store().addItem(makeItem());
    store().updateQuantity('v5', 10);
    expect(store().items[0].quantity).toBe(3);
  });

  it.each([0, -2])('removes the line when quantity is set to %i', (quantity) => {
    store().addItem(makeItem());
    store().updateQuantity('v5', quantity);
    expect(store().items).toHaveLength(0);
  });
});

describe('removeItem', () => {
  it('removes only the matching line', () => {
    store().addItem(makeItem());
    store().addItem(makeItem({ variantId: 'v1', options: { color: 'brown', size: '38' } }));
    store().removeItem('v1');
    expect(store().items).toHaveLength(1);
    expect(store().items[0].variantId).toBe('v5');
  });
});

describe('computed selectors', () => {
  it('computes count and subtotal', () => {
    store().addItem(makeItem());
    store().addItem(makeItem({ variantId: 'v1', unitPrice: 160, maxQuantity: 10, quantity: 2 }));
    expect(selectCartCount(useCartStore.getState())).toBe(3);
    expect(selectCartSubtotal(useCartStore.getState())).toBe(150 * 1 + 160 * 2);
  });
});

describe('persistence', () => {
  it('persists only the cart lines (not drawer state) under the current version', () => {
    store().addItem(makeItem());
    store().openCart();
    const stored = JSON.parse(localStorage.getItem('easy-orders-cart') ?? '{}');
    expect(Object.keys(stored.state)).toEqual(['items']);
    expect(stored.state.items).toHaveLength(1);
    expect(stored.version).toBe(CART_STORAGE_VERSION);
  });

  it('migrates v1 lines (no currency) instead of dropping them', () => {
    const { currency: _omit, ...v1Item } = makeItem();
    localStorage.setItem(
      'easy-orders-cart',
      JSON.stringify({ state: { items: [v1Item], isOpen: true }, version: 1 }),
    );

    useCartStore.persist.rehydrate();
    expect(store().items).toEqual([{ ...v1Item, currency: '' }]);
    expect(store().isOpen).toBe(false);
  });

  it('clamps a stored quantity above the line maximum', () => {
    localStorage.setItem(
      'easy-orders-cart',
      JSON.stringify({ state: { items: [makeItem({ quantity: 50 })] }, version: 2 }),
    );
    useCartStore.persist.rehydrate();
    expect(store().items[0].quantity).toBe(3);
  });

  it('filters corrupt items during hydration', () => {
    localStorage.setItem(
      'easy-orders-cart',
      JSON.stringify({
        state: {
          items: [makeItem(), { variantId: 'bad', quantity: -5 }, 'garbage', null],
        },
        version: 2,
      }),
    );

    useCartStore.persist.rehydrate();
    expect(store().items).toHaveLength(1);
    expect(store().items[0].variantId).toBe('v5');
  });

  it('falls back to an empty cart when stored data is not an object', () => {
    localStorage.setItem('easy-orders-cart', 'not-json');
    expect(() => useCartStore.persist.rehydrate()).not.toThrow();
    expect(store().items).toHaveLength(0);
  });
});

describe('lastAdd outcome', () => {
  it('reports units actually added and whether the limit was hit', () => {
    store().addItem(makeItem({ quantity: 2 })); // max 3
    expect(store().lastAdd).toEqual({ variantId: 'v5', added: 2, atLimit: false });

    store().addItem(makeItem({ quantity: 5 }));
    expect(store().lastAdd).toEqual({ variantId: 'v5', added: 1, atLimit: true });

    store().addItem(makeItem({ quantity: 1 }));
    expect(store().lastAdd).toEqual({ variantId: 'v5', added: 0, atLimit: true });
  });
});

describe('cross-tab sync', () => {
  it('rehydrates when another tab changes the stored cart', () => {
    store().addItem(makeItem({ quantity: 1 }));

    // Another tab writes a newer cart, then the browser notifies this tab.
    const otherTab = {
      state: { items: [makeItem({ quantity: 3 }), makeItem({ variantId: 'v1', quantity: 1 })] },
      version: CART_STORAGE_VERSION,
    };
    localStorage.setItem('easy-orders-cart', JSON.stringify(otherTab));
    window.dispatchEvent(new StorageEvent('storage', { key: 'easy-orders-cart' }));

    expect(store().items).toHaveLength(2);
    expect(store().items[0].quantity).toBe(3);
  });

  it('ignores storage events for other keys', () => {
    store().addItem(makeItem({ quantity: 1 }));
    localStorage.setItem('easy-orders-cart', JSON.stringify({ state: { items: [] }, version: 2 }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'something-else' }));
    expect(store().items).toHaveLength(1);
  });
});

describe('rehydration edge cases', () => {
  it('keeps free (price 0) items across a reload', () => {
    localStorage.setItem(
      'easy-orders-cart',
      JSON.stringify({ state: { items: [makeItem({ unitPrice: 0 })] }, version: 2 }),
    );
    useCartStore.persist.rehydrate();
    expect(store().items).toHaveLength(1);
    expect(store().items[0].unitPrice).toBe(0);
  });

  it('still rejects negative prices', () => {
    localStorage.setItem(
      'easy-orders-cart',
      JSON.stringify({ state: { items: [makeItem({ unitPrice: -5 })] }, version: 2 }),
    );
    useCartStore.persist.rehydrate();
    expect(store().items).toHaveLength(0);
  });

  it('merges duplicate lines for the same variant', () => {
    localStorage.setItem(
      'easy-orders-cart',
      JSON.stringify({
        state: { items: [makeItem({ quantity: 1 }), makeItem({ quantity: 1 })] },
        version: 2,
      }),
    );
    useCartStore.persist.rehydrate();
    expect(store().items).toHaveLength(1);
    expect(store().items[0].quantity).toBe(2);
  });
});
