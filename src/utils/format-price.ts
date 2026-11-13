import { DEFAULT_CURRENCY } from '../constants';

const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * One format everywhere: "<label> 1,234.00". The label is the product's custom currency
 * (free text from the API, e.g. "LE") or the store default, so it is not passed to
 * Intl's `currency` option, which only accepts ISO codes.
 */
export function formatPrice(value: number, currency?: string): string {
  return `${currency?.trim() || DEFAULT_CURRENCY} ${amountFormatter.format(value)}`;
}
