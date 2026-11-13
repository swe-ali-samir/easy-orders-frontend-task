import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { liveProductFixture, variantStockProduct } from '../../../test/fixtures';
import type { Product } from '../../../types/domain';
import { PurchasePanel } from './PurchasePanel';
import { useProductSelection, type ProductSelection } from '../hooks/use-product-selection';

/**
 * The UI can't normally reach "every group chosen, no matching variant" (applyOption keeps
 * selections purchasable), so this guards the defensive branch directly.
 */
describe('PurchasePanel defensive states', () => {
  it('explains instead of silently doing nothing when a complete selection has no variant', async () => {
    const user = userEvent.setup();
    const onAddToCart = vi.fn();
    const selection = {
      selection: { color: 'brown', size: '42' },
      selectOption: vi.fn(),
      isAvailable: () => true,
      isSelectable: () => true,
      selectedVariant: undefined,
      missingGroups: [],
      isComplete: true,
      highlightImage: undefined,
      price: 160,
      originalPrice: 190,
      onSale: true,
      inStock: true,
      maxQuantity: 10,
    } satisfies ProductSelection;

    render(
      <PurchasePanel
        product={liveProductFixture}
        selection={selection}
        quantity={1}
        onQuantityChange={vi.fn()}
        onAddToCart={onAddToCart}
      />,
    );

    await user.click(screen.getByTestId('add-to-cart-button'));
    expect(onAddToCart).not.toHaveBeenCalled();
    expect(screen.getByTestId('add-to-cart-hint')).toHaveTextContent(
      "This combination isn't available. Please choose different options.",
    );
  });
});

describe('PurchasePanel with a sold-out product', () => {
  function SoldOutPanel({ onAddToCart }: { onAddToCart: () => void }) {
    const selection = useProductSelection(soldOutProduct);
    return (
      <PurchasePanel
        product={soldOutProduct}
        selection={selection}
        quantity={1}
        onQuantityChange={vi.fn()}
        onAddToCart={onAddToCart}
      />
    );
  }

  const soldOutProduct: Product = {
    ...variantStockProduct,
    variants: variantStockProduct.variants.map((variant) => ({ ...variant, quantity: 0 })),
  };

  it('says it is out of stock and disables buying, instead of asking for options', () => {
    render(<SoldOutPanel onAddToCart={vi.fn()} />);

    expect(screen.getByTestId('add-to-cart-hint')).toHaveTextContent(
      'This product is out of stock',
    );
    expect(screen.getByTestId('add-to-cart-button')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Checkout Now' })).toBeDisabled();
  });
});
