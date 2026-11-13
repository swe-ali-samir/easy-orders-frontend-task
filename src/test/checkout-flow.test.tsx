import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { fetchProduct } from '../services/product-service';
import { liveProductFixture, productFixture } from './fixtures';
import { renderWithProviders } from './utils';
import { useCartStore } from '../store/cart-store';

vi.mock('../services/product-service', () => ({
  fetchProduct: vi.fn(),
}));

const fetchProductMock = vi.mocked(fetchProduct);

beforeEach(() => {
  localStorage.clear();
  act(() => useCartStore.setState({ items: [], isOpen: false }));
  fetchProductMock.mockReset();
  fetchProductMock.mockResolvedValue(productFixture);
});

describe('critical purchase flow', () => {
  it('loads product, selects variant, adds to cart, manages cart, and persists', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await screen.findByTestId('product-title');
    expect(screen.getByTestId('price')).toHaveTextContent('EGP 160.00');

    await user.click(screen.getByRole('button', { name: 'color: black' }));
    await user.click(screen.getByRole('button', { name: '40' }));

    expect(screen.getByTestId('price')).toHaveTextContent('EGP 150.00');
    expect(screen.getByTestId('original-price')).toHaveTextContent('EGP 200.00');

    expect(screen.queryByTestId('quantity-selector')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('add-to-cart-button'));

    const drawer = await screen.findByRole('dialog', { name: 'Your Cart' });
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('1');
    expect(within(drawer).getAllByTestId('cart-item')).toHaveLength(1);
    expect(within(drawer).getByTestId('cart-subtotal')).toHaveTextContent('EGP 150.00');

    const stored = JSON.parse(localStorage.getItem('easy-orders-cart') ?? '{}');
    expect(stored.state.items).toHaveLength(1);
    expect(stored.state.items[0]).toMatchObject({
      variantId: 'v5',
      quantity: 1,
      unitPrice: 150,
    });

    expect(Object.keys(stored.state)).toEqual(['items']);

    // Simulate a page refresh: in-memory state resets, then storage rehydrates.
    // (Reset first: setState persists, which would overwrite the stored cart.)
    act(() => {
      useCartStore.setState({ items: [], isOpen: false, lastAdd: null });
    });
    localStorage.setItem('easy-orders-cart', JSON.stringify(stored));
    act(() => {
      useCartStore.persist.rehydrate();
    });
    await waitFor(() => {
      expect(useCartStore.getState().items).toHaveLength(1);
    });
    expect(useCartStore.getState().isOpen).toBe(false);

    await user.click(screen.getByTestId('cart-button'));
    const refreshedDrawer = await screen.findByRole('dialog', { name: 'Your Cart' });

    await user.click(within(refreshedDrawer).getByRole('button', { name: /increase quantity/i }));
    await waitFor(() => {
      expect(within(refreshedDrawer).getByTestId('cart-subtotal')).toHaveTextContent('EGP 300.00');
    });
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('2');

    await user.click(within(refreshedDrawer).getByTestId('remove-item'));
    await screen.findByTestId('cart-empty');
    expect(screen.getByTestId('cart-empty')).toHaveTextContent('Your cart is empty');
    expect(screen.queryByTestId('cart-badge')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue shopping' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Your Cart' })).not.toBeInTheDocument();
    });
  });

  it('keeps the sale price through selection, quantity and cart on live-shaped data', async () => {
    fetchProductMock.mockResolvedValue(liveProductFixture);
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await screen.findByTestId('product-title');
    expect(screen.getByTestId('price')).toHaveTextContent('EGP 160.00');
    expect(screen.getByTestId('original-price')).toHaveTextContent('EGP 190.00');
    expect(screen.getByTestId('stock-status')).toHaveTextContent('In Stock');

    await user.click(screen.getByRole('button', { name: 'color: brown' }));
    await user.click(screen.getByRole('button', { name: '42' }));

    expect(screen.getByTestId('price')).toHaveTextContent('EGP 160.00');
    expect(screen.getByTestId('original-price')).toHaveTextContent('EGP 190.00');

    expect(screen.getByTestId('quantity-selector')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /increase quantity/i }));
    await user.click(screen.getByTestId('add-to-cart-button'));

    const drawer = await screen.findByRole('dialog', { name: 'Your Cart' });
    expect(within(drawer).getByTestId('cart-added-banner')).toHaveTextContent(
      `Added ${liveProductFixture.name} to your cart`,
    );
    expect(drawer).toHaveAccessibleDescription(`Added ${liveProductFixture.name} to your cart.`);
    expect(within(drawer).getByTestId('cart-subtotal')).toHaveTextContent('EGP 320.00');
    expect(useCartStore.getState().items[0]).toMatchObject({ unitPrice: 160, quantity: 2 });

    await user.click(within(drawer).getByTestId('close-cart'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Your Cart' })).not.toBeInTheDocument();
    });

    await user.click(screen.getByTestId('cart-button'));
    const reopened = await screen.findByRole('dialog', { name: 'Your Cart' });
    expect(within(reopened).queryByTestId('cart-added-banner')).not.toBeInTheDocument();
  });

  it('validates on click: hints, focuses the missing group, and adds nothing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await screen.findByTestId('product-title');

    const add = screen.getByTestId('add-to-cart-button');
    const hint = screen.getByTestId('add-to-cart-hint');
    expect(add).toBeEnabled();
    expect(hint).toBeEmptyDOMElement();
    expect(hint).toHaveAttribute('aria-live', 'polite');

    // Colour is pre-selected (first available); size must still be chosen.
    expect(screen.getByRole('button', { name: 'color: brown' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(add);
    expect(hint).toHaveTextContent('Please select size');
    expect(screen.getByRole('button', { name: '38' })).toHaveFocus();
    expect(screen.queryByRole('dialog', { name: 'Your Cart' })).not.toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'color: black' }));
    expect(hint).toHaveTextContent('Please select size');
    await user.click(screen.getByRole('button', { name: '40' }));
    expect(hint).toBeEmptyDOMElement();
  });

  it('recovers from an API failure via retry', async () => {
    fetchProductMock.mockRejectedValueOnce(new Error('Network error'));
    const user = userEvent.setup();
    renderWithProviders(<App />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/couldn't load this product/i);

    // Hold the retry open to observe the in-flight state.
    let resolveRetry: (value: typeof productFixture) => void = () => undefined;
    fetchProductMock.mockImplementationOnce(
      () => new Promise((resolve) => (resolveRetry = resolve)),
    );
    await user.click(screen.getByRole('button', { name: /try again/i }));
    // React Query resets an errored query without data to 'pending', so the skeleton shows.
    expect(await screen.findByText('Loading product…')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    act(() => resolveRetry(productFixture));
    await screen.findByTestId('product-title');
    expect(screen.getByTestId('product-title')).toHaveTextContent(productFixture.name);
  });

  it('sets the document title and meta description from the product', async () => {
    renderWithProviders(<App />);
    await screen.findByTestId('product-title');

    expect(document.title).toBe(`${productFixture.name} | EasyOrders`);
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      productFixture.descriptionText,
    );
  });
});
