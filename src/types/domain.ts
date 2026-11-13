/**
 * Selection of one option per variation group, e.g. { color: 'black', size: '40' }.
 */
export type VariantSelection = Record<string, string>;

export type VariationType = 'image' | 'button';

export interface VariationOption {
  id: string;
  name: string;
  /** Image URL for options rendered as a swatch (type: 'image'). */
  value?: string;
}

export interface VariationGroup {
  id: string;
  name: string;
  type: VariationType;
  options: VariationOption[];
}

export interface ProductVariant {
  id: string;
  price: number;
  salePrice: number;
  quantity: number;
  options: VariantSelection;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number;
  descriptionHtml: string;
  /** Plain-text version of the description (block boundaries become spaces). */
  descriptionText: string;
  images: string[];
  /** Custom currency string from API, empty when using the store default. */
  customCurrency: string;
  variations: VariationGroup[];
  variants: ProductVariant[];
  categories: Category[];
  /** Whether variant/product quantity determines availability. */
  trackStock: boolean;
  stockQuantity: number;
  /** API is_quantity_hidden: quantity selector is not shown to customers. */
  isQuantityHidden: boolean;
}
