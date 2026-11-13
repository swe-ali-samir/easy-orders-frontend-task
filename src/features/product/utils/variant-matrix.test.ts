import {
  applyOption,
  getMaxQuantity,
  getPricing,
  isInStock,
  isOptionAvailable,
  isOptionSelectable,
  resolveVariant,
} from './variant-matrix';
import {
  liveProductFixture,
  productFixture,
  trackedStockProduct,
  variantStockProduct,
} from '../../../test/fixtures';

describe('resolveVariant', () => {
  it('finds a variant matching a full selection', () => {
    const variant = resolveVariant(productFixture, { color: 'black', size: '40' });
    expect(variant?.id).toBe('v5');
  });

  it('returns undefined for a combination that does not exist', () => {
    expect(resolveVariant(productFixture, { color: 'red', size: '40' })).toBeUndefined();
  });
});

describe('isOptionAvailable', () => {
  it('marks every option available when stock is not tracked', () => {
    expect(isOptionAvailable(productFixture, 'color', 'brown', {})).toBe(true);
    expect(isOptionAvailable(productFixture, 'size', '42', { color: 'brown' })).toBe(true);
  });

  it('disables options with no purchasable matching variant when stock is tracked', () => {
    expect(isOptionAvailable(trackedStockProduct, 'color', 'brown', {})).toBe(false);
    expect(isOptionAvailable(trackedStockProduct, 'size', '40', { color: 'black' })).toBe(true);
    expect(isOptionAvailable(trackedStockProduct, 'size', '38', { color: 'black' })).toBe(false);
  });

  it('restricts options of other groups to combos matching the current selection', () => {
    expect(isOptionAvailable(productFixture, 'size', '40', { color: 'brown' })).toBe(true);
  });
});

describe('getPricing', () => {
  it('uses product-level sale pricing when no variant is selected', () => {
    expect(getPricing(productFixture)).toEqual({ price: 160, originalPrice: 190, onSale: true });
  });

  it('keeps the product sale for variants that mirror the product (live API shape)', () => {
    for (const variant of liveProductFixture.variants) {
      expect(getPricing(liveProductFixture, variant)).toEqual({
        price: 160,
        originalPrice: 190,
        onSale: true,
      });
    }
  });

  it('uses the variant sale when the variant defines one', () => {
    const variant = resolveVariant(productFixture, { color: 'black', size: '40' })!;
    expect(getPricing(productFixture, variant)).toEqual({
      price: 150,
      originalPrice: 200,
      onSale: true,
    });
  });

  it('uses a variant-specific regular price without a sale', () => {
    const variant = resolveVariant(productFixture, { color: 'biege', size: '38' })!;
    expect(getPricing(productFixture, variant)).toEqual({
      price: 210,
      originalPrice: 210,
      onSale: false,
    });
  });

  it('inherits product pricing when the variant has no price at all', () => {
    const variant = { ...productFixture.variants[0], price: 0, salePrice: 0 };
    expect(getPricing(productFixture, variant)).toEqual({
      price: 160,
      originalPrice: 190,
      onSale: true,
    });
  });

  it('ignores a sale price that is not below the regular price', () => {
    const product = { ...productFixture, salePrice: 190 };
    expect(getPricing(product)).toEqual({ price: 190, originalPrice: 190, onSale: false });
  });

  it('reports no sale when the product has none', () => {
    const product = { ...productFixture, salePrice: 0 };
    expect(getPricing(product)).toEqual({ price: 190, originalPrice: 190, onSale: false });
  });
});

describe('getMaxQuantity', () => {
  it('uses variant stock (not product-level quantity) before a variant is chosen', () => {
    expect(getMaxQuantity(variantStockProduct, undefined, {})).toBe(3);
    expect(getMaxQuantity(variantStockProduct, undefined, { color: 'black' })).toBe(3);
    expect(getMaxQuantity(variantStockProduct, undefined, { color: 'brown' })).toBe(0);
  });

  it('uses the default cap when stock is not tracked', () => {
    expect(getMaxQuantity(productFixture, undefined)).toBe(10);
  });

  it('uses variant quantity when stock is tracked', () => {
    const variant = resolveVariant(productFixture, { color: 'black', size: '40' })!;
    expect(getMaxQuantity(trackedStockProduct, variant)).toBe(3);
  });

  it('never goes below zero', () => {
    const variant = resolveVariant(productFixture, { color: 'brown', size: '38' })!;
    expect(getMaxQuantity(trackedStockProduct, variant)).toBe(0);
  });
});

describe('isInStock', () => {
  it('is true when stock is not tracked', () => {
    expect(isInStock(productFixture, undefined, {})).toBe(true);
  });

  it('uses the resolved variant quantity when stock is tracked', () => {
    const inStock = resolveVariant(trackedStockProduct, { color: 'black', size: '40' });
    const outOfStock = resolveVariant(trackedStockProduct, { color: 'brown', size: '38' });
    expect(isInStock(trackedStockProduct, inStock, {})).toBe(true);
    expect(isInStock(trackedStockProduct, outOfStock, {})).toBe(false);
  });

  it('is in stock before selection when any variant is purchasable', () => {
    expect(isInStock(trackedStockProduct, undefined, {})).toBe(true);
  });

  it('narrows to variants matching a partial selection', () => {
    expect(isInStock(trackedStockProduct, undefined, { color: 'black' })).toBe(true);
    expect(isInStock(trackedStockProduct, undefined, { color: 'brown' })).toBe(false);
  });

  it('uses product quantity for products without variants', () => {
    const simple = { ...trackedStockProduct, variations: [], variants: [] };
    expect(isInStock(simple, undefined, {})).toBe(true);
    expect(isInStock({ ...simple, stockQuantity: 0 }, undefined, {})).toBe(false);
  });
});

/** Tracked stock: brown only in 38, black only in 40, biege sold out. */
const twoCombos = {
  ...trackedStockProduct,
  variants: trackedStockProduct.variants.map((variant) => ({
    ...variant,
    quantity: variant.id === 'v1' || variant.id === 'v5' ? 2 : 0,
  })),
};

describe('isOptionSelectable', () => {
  it('is true when any purchasable variant has the option, regardless of selection', () => {
    expect(isOptionSelectable(twoCombos, 'size', '40')).toBe(true);
    expect(isOptionSelectable(twoCombos, 'color', 'brown')).toBe(true);
  });

  it('is false when no purchasable variant has the option', () => {
    expect(isOptionSelectable(twoCombos, 'color', 'biege')).toBe(false);
    expect(isOptionSelectable(twoCombos, 'size', '42')).toBe(false);
  });
});

describe('applyOption', () => {
  it('adds the option when it is compatible with the selection', () => {
    expect(applyOption(twoCombos, { color: 'brown' }, 'size', '38')).toEqual({
      color: 'brown',
      size: '38',
    });
  });

  it('clears conflicting groups instead of creating a dead end', () => {
    expect(applyOption(twoCombos, { color: 'brown', size: '38' }, 'size', '40')).toEqual({
      size: '40',
    });
  });

  it('replaces the value within the same group', () => {
    expect(applyOption(productFixture, { color: 'brown', size: '38' }, 'color', 'black')).toEqual({
      color: 'black',
      size: '38',
    });
  });

  it('keeps compatible groups while dropping only the conflicting ones', () => {
    const threeGroups = {
      ...twoCombos,
      variations: [
        ...twoCombos.variations,
        {
          id: 'w',
          name: 'width',
          type: 'button' as const,
          options: [{ id: 'wr', name: 'regular' }],
        },
      ],
      variants: twoCombos.variants.map((variant) => ({
        ...variant,
        options: { ...variant.options, width: 'regular' },
      })),
    };
    expect(
      applyOption(threeGroups, { color: 'brown', size: '38', width: 'regular' }, 'size', '40'),
    ).toEqual({ size: '40', width: 'regular' });
  });
});

describe('resolveVariant robustness', () => {
  it('ignores option keys on a variant that are not selectable groups', () => {
    const withExtraKey = {
      ...productFixture,
      variants: productFixture.variants.map((variant) => ({
        ...variant,
        options: { ...variant.options, material: 'suede' },
      })),
    };
    expect(resolveVariant(withExtraKey, { color: 'black', size: '40' })?.id).toBe('v5');
  });

  it('returns undefined until every group is selected', () => {
    expect(resolveVariant(productFixture, { color: 'black' })).toBeUndefined();
  });
});
