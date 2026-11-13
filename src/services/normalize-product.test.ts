import { describe, expect, it } from 'vitest';
import { htmlToText, normalizeProduct } from './normalize-product';
import type { ApiProduct } from '../types/api';

const apiProduct: ApiProduct = {
  id: '1',
  name: 'Product',
  slug: 'product',
  price: 10,
  sale_price: 5,
  description: '<p>a</p><br><br><br><p>b</p>',
  thumb: 'https://example.com/t.jpg',
  images: ['https://example.com/t.jpg'],
  quantity: 3,
  track_stock: false,
  custom_currency: '',
  variations: [],
  variants: [],
  categories: [],
};

describe('normalizeProduct', () => {
  // The live API description is full of <br> runs and empty <p>s that create big gaps.
  it.each([
    ['collapses runs of <br> into one', '<p>a</p><br><br><br><p>b</p>', '<p>a</p><br><p>b</p>'],
    ['strips leading and trailing breaks', '<br><br>hello<br>', 'hello'],
    [
      'removes paragraphs that only hold breaks',
      '<p>Shipping</p><p><br></p><p><br></p><ul><li>item</li></ul>',
      '<p>Shipping</p><ul><li>item</li></ul>',
    ],
    [
      'removes whitespace/nbsp-only paragraphs',
      '<p>a</p><p>   </p><p>&nbsp;</p><p>b</p>',
      '<p>a</p><p>b</p>',
    ],
  ])('cleans the description: %s', (_label, description, expected) => {
    expect(normalizeProduct({ ...apiProduct, description }).descriptionHtml).toBe(expected);
  });

  it('de-duplicates categories by name and makes them display-ready', () => {
    const product = normalizeProduct({
      ...apiProduct,
      categories: [
        { id: 'a', name: 'mules', slug: 'mules' },
        { id: 'b', name: ' women heels ', slug: 'women-heels' },
        { id: 'c', name: 'Mules', slug: 'mules-2' },
      ],
    });
    expect(product.categories).toEqual([
      { id: 'a', name: 'Mules', slug: 'mules' },
      { id: 'b', name: 'Women heels', slug: 'women-heels' },
    ]);
  });

  it('shows the quantity selector unless the API explicitly hides it', () => {
    expect(normalizeProduct(apiProduct).isQuantityHidden).toBe(false);
    expect(normalizeProduct({ ...apiProduct, is_quantity_hidden: true }).isQuantityHidden).toBe(
      true,
    );
  });
});

describe('htmlToText', () => {
  it('separates list items and paragraphs with full stops', () => {
    expect(
      htmlToText('<ul><li>Cowhide leather</li><li>Nappa finish</li></ul><p>Ships fast</p>'),
    ).toBe('Cowhide leather. Nappa finish. Ships fast.');
  });

  it('keeps existing punctuation and avoids double stops in nested blocks', () => {
    expect(htmlToText('<div><p>Sole: TR.</p><p>Lining: leather</p></div>')).toBe(
      'Sole: TR. Lining: leather.',
    );
  });

  it('handles line breaks and entities', () => {
    expect(htmlToText('<p>A&amp;B<br>next</p>')).toBe('A&B next.');
  });
});
