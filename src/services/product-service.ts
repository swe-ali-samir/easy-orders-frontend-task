import { ApiError, fetchJson } from './api-client';
import { API_BASE_URL } from './config';
import { normalizeProduct } from './normalize-product';
import { isApiProduct } from './validate-product';
import type { Product } from '../types/domain';

export async function fetchProduct(slug: string, signal?: AbortSignal): Promise<Product> {
  const url = `${API_BASE_URL}/products/slug/clear-theme/${encodeURIComponent(slug)}?join=reviews`;
  const data = await fetchJson(url, { signal });
  if (!isApiProduct(data)) {
    throw new ApiError('invalid', `Unexpected product payload for slug "${slug}"`);
  }
  return normalizeProduct(data);
}
