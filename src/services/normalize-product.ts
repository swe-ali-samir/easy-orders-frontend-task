import DOMPurify from 'dompurify';
import type { ApiProduct } from '../types/api';
import type {
  Category,
  Product,
  ProductVariant,
  VariationGroup,
  VariationType,
} from '../types/domain';
import { capitalize } from '../utils/text';

function toVariationType(type: string): VariationType {
  return type === 'image' ? 'image' : 'button';
}

function normalizeVariations(api: ApiProduct): VariationGroup[] {
  return api.variations.map((variation) => ({
    id: variation.id,
    name: variation.name,
    type: toVariationType(variation.type),
    options: variation.props.map((prop) => ({
      id: prop.id,
      name: prop.name,
      ...(prop.value ? { value: prop.value } : {}),
    })),
  }));
}

function normalizeVariants(api: ApiProduct): ProductVariant[] {
  return api.variants.map((variant) => ({
    id: variant.id,
    price: variant.price,
    salePrice: variant.sale_price,
    quantity: variant.quantity,
    options: Object.fromEntries(
      variant.variation_props.map((ref) => [ref.variation, ref.variation_prop]),
    ),
  }));
}

function normalizeImages(api: ApiProduct): string[] {
  const all = [api.thumb, ...api.images].filter((url): url is string => Boolean(url));
  return Array.from(new Set(all));
}

function cleanDescriptionHtml(html: string): string {
  return html
    .replace(/<p(?:\s[^>]*)?>(?:&nbsp;|\s|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/(?:&nbsp;|\s)*((?:<br\s*\/?>(?:&nbsp;|\s)*)+)/gi, '<br>')
    .replace(/^(?:&nbsp;|\s)*<br>|<br>(?:&nbsp;|\s)*$/gi, '')
    .trim();
}

const BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, div, tr';
const ENDS_WITH_PUNCTUATION = /[.!?:;,]$/;

/**
 * Readable plain text from sanitized HTML (used for the collapsed description excerpt).
 * Each block (list item, paragraph, heading…) ends in a full stop unless it already has
 * punctuation, so a bulleted list reads "A. B. C." rather than run-on "A B C".
 */
export function htmlToText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
  // Deepest blocks first, so a wrapper (e.g. <div><p>…</p></div>) doesn't add a second stop.
  const blocks = Array.from(doc.body.querySelectorAll(BLOCK_SELECTOR)).reverse();
  for (const block of blocks) {
    const text = block.textContent?.trim() ?? '';
    if (text && !ENDS_WITH_PUNCTUATION.test(text)) {
      block.append('.');
    }
    block.append(' ');
  }
  return (doc.body.textContent ?? '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/** De-duplicated by name (the API can list the same category twice) and display-ready. */
function normalizeCategories(api: ApiProduct): Category[] {
  const seen = new Set<string>();
  const categories: Category[] = [];
  for (const { id, name, slug } of api.categories) {
    const key = name.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      categories.push({ id, name: capitalize(name.trim()), slug });
    }
  }
  return categories;
}

export function normalizeProduct(api: ApiProduct): Product {
  const descriptionHtml = cleanDescriptionHtml(DOMPurify.sanitize(api.description ?? ''));
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    price: api.price,
    salePrice: api.sale_price,
    descriptionHtml,
    descriptionText: htmlToText(descriptionHtml),
    images: normalizeImages(api),
    customCurrency: api.custom_currency ?? '',
    variations: normalizeVariations(api),
    variants: normalizeVariants(api),
    categories: normalizeCategories(api),
    trackStock: api.track_stock,
    stockQuantity: api.quantity,
    // The quantity selector is a task requirement: only hide it when the API explicitly asks.
    isQuantityHidden: api.is_quantity_hidden ?? false,
  };
}
