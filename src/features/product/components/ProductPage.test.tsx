import { QueryClient } from '@tanstack/react-query';
import { act, screen, within } from '@testing-library/react';
import { vi, beforeEach } from 'vitest';
import App from '../../../App';
import { renderWithProviders } from '../../../test/utils';
import { fetchProduct } from '../../../services/product-service';
import { useCartStore } from '../../../store/cart-store';
import { liveProductFixture, variantStockProduct } from '../../../test/fixtures';

vi.mock('../../../services/product-service', () => ({
  fetchProduct: vi.fn(),
}));

const fetchProductMock = vi.mocked(fetchProduct);

beforeEach(() => {
  fetchProductMock.mockReset();
  localStorage.clear();
  act(() => useCartStore.setState({ items: [], isOpen: false }));
});

describe('ProductPage rendering', () => {
  it('renders the design sections: breadcrumb, rating link, related, reviews, popular, footer', async () => {
    fetchProductMock.mockResolvedValue({
      ...liveProductFixture,
      // Already normalized (de-duplicated, display-ready); see normalize-product.test.ts.
      categories: [
        { id: 'a', name: 'Mules', slug: 'mules' },
        { id: 'b', name: 'Women heels', slug: 'women-heels' },
      ],
    });
    renderWithProviders(<App />);
    await screen.findByTestId('product-title');

    const crumbs = within(screen.getByRole('navigation', { name: 'Breadcrumb' }));
    // A real path: flat category tags are not chained into a fake hierarchy.
    expect(crumbs.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Homepage',
      'Mules',
      liveProductFixture.name,
    ]);
    // All (de-duplicated) categories are still shown.
    expect(screen.getByTestId('product-categories')).toHaveTextContent(
      'Categories: Mules, Women heels',
    );

    expect(screen.getByTestId('rating-link')).toHaveAttribute('href', '#reviews');
    expect(screen.getByTestId('rating-link')).toHaveTextContent('1,238 Sold');

    for (const title of ['Related Product', 'Popular this week']) {
      const section = screen.getByRole('region', { name: title });
      expect(within(section).getAllByTestId('product-card')).toHaveLength(5);
      expect(within(section).getAllByTestId('product-card')[0]).toHaveTextContent('EGP 160.00');
    }
    expect(screen.getByRole('region', { name: 'Product Reviews' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('disables purchase and explains why when a product without variants is sold out', async () => {
    fetchProductMock.mockResolvedValue({
      ...liveProductFixture,
      variations: [],
      variants: [],
      trackStock: true,
      stockQuantity: 0,
    });
    renderWithProviders(<App />);
    await screen.findByTestId('product-title');

    expect(screen.getByTestId('add-to-cart-button')).toBeDisabled();
    expect(screen.getByTestId('checkout-now-button')).toBeDisabled();
    expect(screen.getByTestId('add-to-cart-hint')).toHaveTextContent(
      'This product is out of stock',
    );
    expect(screen.getByTestId('stock-status')).toHaveTextContent('Out of Stock');
  });

  it('keeps the stock badge and quantity selector consistent when stock lives on variants', async () => {
    fetchProductMock.mockResolvedValue(variantStockProduct);
    renderWithProviders(<App />);
    await screen.findByTestId('product-title');

    // Brown has no stock, so the first purchasable colour (black) is pre-selected.
    expect(screen.getByRole('button', { name: 'color: black' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('stock-status')).toHaveTextContent('In Stock');
    const quantity = screen.getByTestId('quantity-input');
    expect(quantity).toBeEnabled();
    expect(quantity).toHaveValue(1);
    expect(screen.getByTestId('quantity-selector')).not.toHaveTextContent('Out of stock');
  });

  it('keeps the page and shows a notice when a background refresh fails', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    fetchProductMock.mockResolvedValueOnce(liveProductFixture);
    renderWithProviders(<App />, client);
    await screen.findByTestId('product-title');

    // A background refetch (e.g. after reconnecting) fails while data is on screen.
    fetchProductMock.mockRejectedValueOnce(new Error('Network error'));
    await act(() => client.refetchQueries().catch(() => undefined));

    expect(await screen.findByTestId('refresh-error')).toHaveTextContent("couldn't refresh");
    expect(screen.getByTestId('product-title')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
