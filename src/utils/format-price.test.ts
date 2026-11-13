import { formatPrice } from './format-price';

describe('formatPrice', () => {
  it('uses the store default currency with two decimals', () => {
    expect(formatPrice(1600)).toBe('EGP 1,600.00');
    expect(formatPrice(160.5, '')).toBe('EGP 160.50');
  });

  it('uses a custom currency label in the same format', () => {
    expect(formatPrice(1600, 'LE')).toBe('LE 1,600.00');
    expect(formatPrice(99, '  ')).toBe('EGP 99.00');
  });
});
