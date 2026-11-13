import type { Product } from '../types/domain';

/**
 * Synthetic fixture derived from the Sneakers12 response, with variant pricing
 * edge cases: v5 (black/40) has its own sale (200 → 150) and v7 (biege/38)
 * has its own regular price (210, no sale). Every other variant mirrors the product.
 * For assertions about real-world behavior, use `liveProductFixture`.
 */
export const productFixture: Product = {
  id: 'd032e864-17cf-4417-9e34-a1a35620d42d',
  name: 'Achilles Pro - Genuine Suede X Leather Sneakers',
  slug: 'Sneakers12',
  price: 190,
  salePrice: 160,
  descriptionHtml: '<ul><li>Made with cowhide leather</li></ul>',
  descriptionText: 'Made with cowhide leather',
  images: ['https://example.com/thumb.webp', 'https://example.com/main.webp'],
  customCurrency: '',
  trackStock: false,
  stockQuantity: 0,
  isQuantityHidden: true,
  variations: [
    {
      id: 'color-id',
      name: 'color',
      type: 'image',
      options: [
        { id: 'brown-id', name: 'brown', value: 'https://example.com/brown.webp' },
        { id: 'black-id', name: 'black', value: 'https://example.com/black.webp' },
        { id: 'biege-id', name: 'biege', value: 'https://example.com/biege.jpg' },
      ],
    },
    {
      id: 'size-id',
      name: 'size',
      type: 'button',
      options: [
        { id: '38-id', name: '38' },
        { id: '40-id', name: '40' },
        { id: '42-id', name: '42' },
      ],
    },
  ],
  variants: [
    { id: 'v1', price: 190, salePrice: 0, quantity: 0, options: { color: 'brown', size: '38' } },
    { id: 'v2', price: 190, salePrice: 0, quantity: 0, options: { color: 'brown', size: '40' } },
    { id: 'v3', price: 190, salePrice: 0, quantity: 0, options: { color: 'brown', size: '42' } },
    { id: 'v4', price: 190, salePrice: 0, quantity: 0, options: { color: 'black', size: '38' } },
    { id: 'v5', price: 200, salePrice: 150, quantity: 3, options: { color: 'black', size: '40' } },
    { id: 'v6', price: 190, salePrice: 0, quantity: 0, options: { color: 'black', size: '42' } },
    { id: 'v7', price: 210, salePrice: 0, quantity: 0, options: { color: 'biege', size: '38' } },
    { id: 'v8', price: 190, salePrice: 0, quantity: 0, options: { color: 'biege', size: '40' } },
    { id: 'v9', price: 190, salePrice: 0, quantity: 0, options: { color: 'biege', size: '42' } },
  ],
  categories: [{ id: 'c1', name: 'sneakers', slug: 'sneakers' }],
};

/**
 * Matches the live Sneakers12 API data shape (verified 2026-11-13): product 190 with
 * sale 160; all nine variants `price: 190, sale_price: 0, quantity: 0`; stock not
 * tracked; quantity selector visible.
 */
export const liveProductFixture: Product = {
  ...productFixture,
  isQuantityHidden: false,
  variants: productFixture.variants.map((variant) => ({
    ...variant,
    price: 190,
    salePrice: 0,
    quantity: 0,
  })),
};

export const trackedStockProduct: Product = {
  ...productFixture,
  trackStock: true,
  stockQuantity: 5,
};

/**
 * Common EasyOrders shape: stock tracked, product-level
 * quantity 0, stock held on variants. Only black/40 (v5) has stock.
 */
export const variantStockProduct: Product = {
  ...liveProductFixture,
  trackStock: true,
  stockQuantity: 0,
  variants: liveProductFixture.variants.map((variant) => ({
    ...variant,
    quantity: variant.id === 'v5' ? 3 : 0,
  })),
};
