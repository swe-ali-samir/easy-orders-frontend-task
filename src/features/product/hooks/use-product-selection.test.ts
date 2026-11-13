import { act, renderHook } from '@testing-library/react';
import { useProductSelection } from './use-product-selection';
import { productFixture, trackedStockProduct } from '../../../test/fixtures';

describe('useProductSelection', () => {
  it('pre-selects the first available colour but never the size', () => {
    const { result } = renderHook(() => useProductSelection(productFixture));
    expect(result.current.selection).toEqual({ color: 'brown' });
    expect(result.current.highlightImage).toBe('https://example.com/brown.webp');
    expect(result.current.isComplete).toBe(false);
    expect(result.current.missingGroups).toEqual(['size']);
    expect(result.current.price).toBe(160);
    expect(result.current.originalPrice).toBe(190);
    expect(result.current.onSale).toBe(true);
  });

  it('tracks selection and resolves the variant when complete', () => {
    const { result } = renderHook(() => useProductSelection(productFixture));

    act(() => result.current.selectOption('color', 'black'));
    expect(result.current.isComplete).toBe(false);

    act(() => result.current.selectOption('size', '40'));
    expect(result.current.isComplete).toBe(true);
    expect(result.current.selectedVariant?.id).toBe('v5');
    expect(result.current.price).toBe(150);
    expect(result.current.maxQuantity).toBe(10);
  });

  it('skips sold-out colours when pre-selecting', () => {
    // trackedStockProduct: only black/40 has stock.
    const { result } = renderHook(() => useProductSelection(trackedStockProduct));
    expect(result.current.selection).toEqual({ color: 'black' });
  });

  it('pre-selects nothing when no colour is purchasable', () => {
    const soldOut = {
      ...trackedStockProduct,
      variants: trackedStockProduct.variants.map((variant) => ({ ...variant, quantity: 0 })),
    };
    const { result } = renderHook(() => useProductSelection(soldOut));
    expect(result.current.selection).toEqual({});
  });
});

describe('useProductSelection without dead ends', () => {
  const twoCombos = {
    ...trackedStockProduct,
    variants: trackedStockProduct.variants.map((variant) => ({
      ...variant,
      quantity: variant.id === 'v1' || variant.id === 'v5' ? 2 : 0,
    })),
  };

  it('lets the user switch to a conflicting option and clears the other group', () => {
    const { result } = renderHook(() => useProductSelection(twoCombos));

    act(() => result.current.selectOption('color', 'brown'));
    act(() => result.current.selectOption('size', '38'));
    expect(result.current.isComplete).toBe(true);

    expect(result.current.isAvailable('color', 'black')).toBe(false);
    expect(result.current.isSelectable('color', 'black')).toBe(true);

    act(() => result.current.selectOption('color', 'black'));
    expect(result.current.selection).toEqual({ color: 'black' });
    expect(result.current.missingGroups).toEqual(['size']);
    expect(result.current.isAvailable('size', '40')).toBe(true);
  });
});
