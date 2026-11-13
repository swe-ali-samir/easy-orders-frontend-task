import type { Product } from '../../../types/domain';
import { formatPrice } from '../../../utils/format-price';
import { getPricing } from './variant-matrix';
import { RATING_SUMMARY } from '../../reviews/utils/review-utils';
import { SOLD_COUNT } from '../../reviews/data/reviews-data';
import type { ShowcaseItem } from '../components/ProductShowcase';

/** Related / popular rails repeat the API product (scope decision); one card per image. */
const SHOWCASE_SIZE = 5;

/** Product photos followed by colour-swatch photos, de-duplicated, empty URLs dropped. */
export function buildGalleryImages(product: Product): string[] {
  const swatchImages = product.variations
    .filter((group) => group.type === 'image')
    .flatMap((group) => group.options.map((option) => option.value ?? ''));
  return Array.from(new Set([...product.images, ...swatchImages].filter(Boolean)));
}

export function buildShowcaseItems(
  product: Product,
  galleryImages: string[],
  brand: string | null,
): ShowcaseItem[] {
  if (galleryImages.length === 0) {
    return [];
  }
  const price = formatPrice(getPricing(product).price, product.customCurrency);
  return Array.from({ length: SHOWCASE_SIZE }, (_, index) => ({
    id: `${product.id}-${index}`,
    brand,
    name: product.name,
    price,
    image: galleryImages[index % galleryImages.length],
    rating: RATING_SUMMARY.average,
    sold: SOLD_COUNT,
  }));
}
