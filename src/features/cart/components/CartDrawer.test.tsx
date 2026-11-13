import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CartDrawer } from './CartDrawer';
import { useCartStore } from '../../../store/cart-store';
import type { CartItem } from '../../../types/cart';

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    variantId: 'v5',
    productId: 'p1',
    productName: 'Achilles Pro Sneakers',
    image: 'https://example.com/a.webp',
    options: { color: 'black', size: '40' },
    unitPrice: 150,
    currency: '',
    maxQuantity: 3,
    quantity: 2,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
  act(() => useCartStore.setState({ items: [], isOpen: false }));
});

describe('CartDrawer', () => {
  it('shows items, options, line totals and subtotal when open', () => {
    act(() =>
      useCartStore.setState({
        isOpen: true,
        items: [
          makeItem(),
          makeItem({
            variantId: 'v1',
            quantity: 1,
            unitPrice: 160,
            options: { color: 'brown', size: '38' },
          }),
        ],
      }),
    );
    render(<CartDrawer />);

    expect(screen.getAllByTestId('cart-item')).toHaveLength(2);
    expect(screen.getByText('black · 40')).toBeInTheDocument();
    expect(screen.getByText('brown · 38')).toBeInTheDocument();
    expect(screen.getAllByTestId('line-total')[0]).toHaveTextContent('EGP 300.00');
    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('EGP 460.00');
    expect(screen.getByRole('button', { name: 'Checkout' })).toHaveAccessibleDescription(
      "Checkout isn't available in this demo.",
    );
  });

  it('formats prices with the line currency', () => {
    act(() => useCartStore.setState({ isOpen: true, items: [makeItem({ currency: 'LE' })] }));
    render(<CartDrawer />);
    expect(screen.getByTestId('line-total')).toHaveTextContent('LE 300.00');
    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('LE 300.00');
  });
});

describe('CartDrawer add banner', () => {
  it('warns instead of claiming success when nothing could be added', () => {
    act(() => {
      useCartStore.setState({ items: [], isOpen: false, lastAdd: null });
      useCartStore.getState().addItem(makeItem({ quantity: 3 })); // reaches max 3
      useCartStore.getState().addItem(makeItem({ quantity: 1 })); // nothing added
      useCartStore.getState().openCart();
    });
    render(<CartDrawer />);
    expect(screen.getByTestId('cart-added-banner')).toHaveTextContent(
      'You already have the maximum (3) of Achilles Pro Sneakers in your cart.',
    );
    expect(screen.getByTestId('cart-added-banner')).toHaveClass('bg-amber-50');
  });

  it('mentions the limit when an add was capped', () => {
    act(() => {
      useCartStore.setState({ items: [], isOpen: false, lastAdd: null });
      useCartStore.getState().addItem(makeItem({ quantity: 9 }));
      useCartStore.getState().openCart();
    });
    render(<CartDrawer />);
    expect(screen.getByTestId('cart-added-banner')).toHaveTextContent(
      'Added Achilles Pro Sneakers to your cart. Maximum of 3 per order reached.',
    );
  });
});
