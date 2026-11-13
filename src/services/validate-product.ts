import type { ApiProduct } from '../types/api';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

const isVariationProp = (value: unknown): value is UnknownRecord =>
  isRecord(value) && isString(value.id) && isString(value.name);

const isVariation = (value: unknown): value is UnknownRecord =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  isString(value.type) &&
  isArrayOf(value.props, isVariationProp);

const isVariantPropRef = (value: unknown): value is UnknownRecord =>
  isRecord(value) && isString(value.variation) && isString(value.variation_prop);

const isVariant = (value: unknown): value is UnknownRecord =>
  isRecord(value) &&
  isString(value.id) &&
  isNumber(value.price) &&
  isNumber(value.sale_price) &&
  isNumber(value.quantity) &&
  isArrayOf(value.variation_props, isVariantPropRef);

const isCategory = (value: unknown): value is UnknownRecord =>
  isRecord(value) && isString(value.id) && isString(value.name);

/**
 * Structural check of the fields the app relies on, so a changed or partial API
 * response fails as a clear `invalid` error instead of a TypeError deep in
 * normalization. Optional text fields (description, thumb, currency) may be null;
 * normalization supplies defaults.
 */
export function isApiProduct(value: unknown): value is ApiProduct {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.slug) &&
    isNumber(value.price) &&
    isNumber(value.sale_price) &&
    isNumber(value.quantity) &&
    typeof value.track_stock === 'boolean' &&
    isArrayOf(value.images, isString) &&
    isArrayOf(value.variations, isVariation) &&
    isArrayOf(value.variants, isVariant) &&
    isArrayOf(value.categories, isCategory)
  );
}
