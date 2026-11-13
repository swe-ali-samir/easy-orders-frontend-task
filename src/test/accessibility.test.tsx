import { act, screen, waitFor } from '@testing-library/react';
import { axe } from 'jest-axe';
import { vi, beforeEach } from 'vitest';
import App from '../App';
import { renderWithProviders } from './utils';
import { fetchProduct } from '../services/product-service';
import { productFixture } from './fixtures';
import { useCartStore } from '../store/cart-store';
import type { CartItem } from '../types/cart';

vi.mock('../services/product-service', () => ({
  fetchProduct: vi.fn(),
}));

const fetchProductMock = vi.mocked(fetchProduct);

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

const expectNoViolations = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(
    results.violations.map((violation) => `${violation.id}: ${violation.description}`),
  ).toEqual([]);
};

beforeEach(() => {
  fetchProductMock.mockReset();
  act(() => useCartStore.setState({ items: [], isOpen: false }));
});

// Full-page axe scans are slow (the page now includes reviews, rails and the footer).
const AXE_TIMEOUT_MS = 20_000;

describe('accessibility (axe)', { timeout: AXE_TIMEOUT_MS }, () => {
  it('product page has no violations', async () => {
    fetchProductMock.mockResolvedValue(productFixture);
    const { container } = renderWithProviders(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('product-title')).toBeInTheDocument();
    });

    await expectNoViolations(container);
  });

  it('loading skeleton has no violations', async () => {
    fetchProductMock.mockImplementation(() => new Promise(() => undefined));
    const { container } = renderWithProviders(<App />);

    await waitFor(() => {
      expect(screen.getByText('Loading product…')).toBeInTheDocument();
    });

    await expectNoViolations(container);
  });

  it('error state has no violations', async () => {
    fetchProductMock.mockRejectedValue(new Error('Network error'));
    const { container } = renderWithProviders(<App />);

    await screen.findByRole('alert');

    await expectNoViolations(container);
  });

  it('open cart drawer has no violations', async () => {
    fetchProductMock.mockResolvedValue(productFixture);
    renderWithProviders(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('product-title')).toBeInTheDocument();
    });

    act(() => {
      useCartStore.setState({ isOpen: true, items: [makeItem()] });
    });
    await screen.findByRole('dialog', { name: 'Your Cart' });

    // The drawer renders in a portal on document.body, outside `container`.
    await expectNoViolations(document.body);
  });
});
