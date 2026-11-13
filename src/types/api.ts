/**
 * The subset of the EasyOrders product response this app reads. The live payload has
 * many more fields; they are intentionally not typed. Runtime shape is checked by
 * `services/validate-product.ts`.
 */

export interface ApiVariationProp {
  id: string;
  name: string;
  /** Swatch image URL for `type: 'image'` variations. */
  value?: string;
}

export interface ApiVariation {
  id: string;
  name: string;
  /** 'image' renders swatches; anything else renders buttons. */
  type: string;
  props: ApiVariationProp[];
}

export interface ApiVariantPropRef {
  /** Variation name, e.g. "color". */
  variation: string;
  /** Option name, e.g. "black". */
  variation_prop: string;
}

export interface ApiVariant {
  id: string;
  price: number;
  sale_price: number;
  quantity: number;
  variation_props: ApiVariantPropRef[];
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number;
  description: string | null;
  thumb: string | null;
  images: string[];
  quantity: number;
  track_stock: boolean;
  is_quantity_hidden?: boolean;
  custom_currency: string | null;
  variations: ApiVariation[];
  variants: ApiVariant[];
  categories: ApiCategory[];
}
