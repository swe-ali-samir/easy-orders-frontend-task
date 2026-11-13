import { useState } from 'react';
import type { Product, ProductVariant, VariantSelection } from '../../../types/domain';
import {
  getMaxQuantity,
  getPricing,
  isInStock,
  applyOption,
  isOptionAvailable,
  isOptionSelectable,
  resolveVariant,
} from '../utils/variant-matrix';

export interface AddToCartPayload {
  variant: ProductVariant;
  quantity: number;
}

/**
 * Pre-selects the first purchasable colour (stakeholder decision, matching the design's
 * "Color: <value>" state). Size is never pre-selected: the customer must choose it, so
 * validation before adding stays meaningful.
 */
function initialSelection(product: Product): VariantSelection {
  const colourGroup =
    product.variations.find((group) => group.type === 'image') ??
    product.variations.find((group) => /^colou?r$/i.test(group.name));
  const firstColour = colourGroup?.options.find((option) =>
    isOptionSelectable(product, colourGroup.name, option.name),
  );
  return colourGroup && firstColour ? { [colourGroup.name]: firstColour.name } : {};
}

export function useProductSelection(product: Product) {
  const [selection, setSelection] = useState<VariantSelection>(() => initialSelection(product));

  const selectOption = (groupName: string, optionName: string) => {
    setSelection((prev) =>
      prev[groupName] === optionName ? prev : applyOption(product, prev, groupName, optionName),
    );
  };
  const isSelectable = (groupName: string, optionName: string) =>
    isOptionSelectable(product, groupName, optionName);
  const isAvailable = (groupName: string, optionName: string) =>
    isOptionAvailable(product, groupName, optionName, selection);

  const groupsWithOptions = product.variations.filter((group) => group.options.length > 0);

  // A product without variations is bought as itself, via a synthetic base variant.
  const selectedVariant: ProductVariant | undefined =
    resolveVariant(product, selection) ??
    (groupsWithOptions.length === 0
      ? {
          id: `base-${product.id}`,
          price: product.price,
          salePrice: product.salePrice,
          quantity: product.stockQuantity,
          options: {},
        }
      : undefined);

  const missingGroups = groupsWithOptions
    .filter((group) => !selection[group.name])
    .map((group) => group.name);

  const swatchGroup = groupsWithOptions.find((group) => group.type === 'image');
  const highlightImage = swatchGroup?.options.find(
    (option) => option.name === selection[swatchGroup.name],
  )?.value;

  const isComplete = missingGroups.length === 0;

  return {
    selection,
    selectOption,
    isAvailable,
    isSelectable,
    selectedVariant,
    missingGroups,
    isComplete,
    highlightImage,
    ...getPricing(product, selectedVariant),
    inStock: isInStock(product, selectedVariant, selection),
    maxQuantity: getMaxQuantity(product, selectedVariant, selection),
  };
}

export type ProductSelection = ReturnType<typeof useProductSelection>;
