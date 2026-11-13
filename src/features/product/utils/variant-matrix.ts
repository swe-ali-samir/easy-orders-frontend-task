import type { Product, ProductVariant, VariantSelection } from '../../../types/domain';
import { DEFAULT_MAX_QUANTITY } from '../../../constants';

/**
 * Whether a variant can be purchased. Stock is only enforced when the
 * product tracks stock; otherwise every defined variant is purchasable.
 */
function isVariantPurchasable(product: Product, variant: ProductVariant): boolean {
  return product.trackStock ? variant.quantity > 0 : true;
}

/**
 * The variant for a complete selection. Matches on the product's selectable groups only,
 * so extra option keys on a variant (not exposed as a group) don't prevent a match.
 * Returns undefined while any group is still unselected.
 */
export function resolveVariant(
  product: Product,
  selection: VariantSelection,
): ProductVariant | undefined {
  const groups = product.variations
    .filter((group) => group.options.length > 0)
    .map((group) => group.name);
  if (groups.length === 0 || groups.some((group) => !selection[group])) {
    return undefined;
  }
  return product.variants.find((variant) =>
    groups.every((group) => variant.options[group] === selection[group]),
  );
}

function matchesSelection(variant: ProductVariant, selection: VariantSelection): boolean {
  return Object.entries(selection).every(([group, option]) => variant.options[group] === option);
}

function hasPurchasableMatch(product: Product, selection: VariantSelection): boolean {
  return product.variants.some(
    (variant) => isVariantPurchasable(product, variant) && matchesSelection(variant, selection),
  );
}

/**
 * Whether the option is compatible with the current selection: some purchasable
 * variant contains it while matching every *other* selected group. Incompatible
 * options are styled as unavailable but stay clickable (see `applyOption`).
 */
export function isOptionAvailable(
  product: Product,
  groupName: string,
  optionName: string,
  selection: VariantSelection,
): boolean {
  return hasPurchasableMatch(product, { ...selection, [groupName]: optionName });
}

/** Whether any purchasable variant has the option at all. Options failing this are disabled. */
export function isOptionSelectable(product: Product, groupName: string, optionName: string) {
  return hasPurchasableMatch(product, { [groupName]: optionName });
}

/**
 * Selects an option without dead ends: other selected groups are kept only while a
 * purchasable variant still supports them alongside the new choice; conflicting
 * ones are cleared so the user can pick again.
 */
export function applyOption(
  product: Product,
  selection: VariantSelection,
  groupName: string,
  optionName: string,
): VariantSelection {
  const next = { ...selection, [groupName]: optionName };
  if (hasPurchasableMatch(product, next)) {
    return next;
  }

  const result: VariantSelection = { [groupName]: optionName };
  for (const [group, option] of Object.entries(selection)) {
    if (group !== groupName && hasPurchasableMatch(product, { ...result, [group]: option })) {
      result[group] = option;
    }
  }
  return result;
}

export interface Pricing {
  /** Price the customer pays per unit. */
  price: number;
  /** Regular price, shown struck through when `onSale` is true. */
  originalPrice: number;
  onSale: boolean;
}

/**
 * Resolves the price for the product or a selected variant.
 *
 * A variant only overrides product pricing when it defines its own values:
 * - `variant.salePrice > 0` → the variant's own sale.
 * - `variant.price` missing (0) or equal to the product price → the variant
 *   inherits the product-level sale (the API sends `sale_price: 0` on variants
 *   that simply mirror the product).
 * - `variant.price` differs from the product price with no variant sale →
 *   variant-specific regular price, no sale.
 *
 * A "sale" price that is not lower than the regular price is ignored.
 */
export function getPricing(product: Product, variant?: ProductVariant): Pricing {
  const hasOwnPrice = variant !== undefined && variant.price > 0;
  const regular = hasOwnPrice ? variant.price : product.price;

  let sale = 0;
  if (variant && variant.salePrice > 0) {
    sale = variant.salePrice;
  } else if (!hasOwnPrice || regular === product.price) {
    sale = product.salePrice;
  }

  const onSale = sale > 0 && sale < regular;
  return { price: onSale ? sale : regular, originalPrice: regular, onSale };
}

/**
 * Upper bound for the quantity selector. Uses the same stock source as `isInStock`: the
 * resolved variant; otherwise the best-stocked variant matching the partial selection;
 * product-level quantity only for products without variants.
 */
export function getMaxQuantity(
  product: Product,
  variant: ProductVariant | undefined,
  selection: VariantSelection = {},
): number {
  if (!product.trackStock) {
    return DEFAULT_MAX_QUANTITY;
  }
  let quantity: number;
  if (variant) {
    quantity = variant.quantity;
  } else if (product.variants.length === 0) {
    quantity = product.stockQuantity;
  } else {
    quantity = Math.max(
      0,
      ...product.variants
        .filter((candidate) => matchesSelection(candidate, selection))
        .map((candidate) => candidate.quantity),
    );
  }
  return Math.max(0, Math.min(quantity, DEFAULT_MAX_QUANTITY));
}

/**
 * Stock status for display. With a resolved variant, that variant decides.
 * Without one (selection incomplete), the product is in stock when any
 * purchasable variant still matches the partial selection.
 */
export function isInStock(
  product: Product,
  variant: ProductVariant | undefined,
  selection: VariantSelection,
): boolean {
  if (!product.trackStock) {
    return true;
  }
  if (variant) {
    return variant.quantity > 0;
  }
  if (product.variants.length === 0) {
    return product.stockQuantity > 0;
  }
  return hasPurchasableMatch(product, selection);
}
