import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchJson, getUserErrorMessage, isRetryableError } from './api-client';
import { fetchProduct } from './product-service';
import { isApiProduct } from './validate-product';
import type { ApiProduct } from '../types/api';

const validPayload: ApiProduct = {
  id: '1',
  name: 'Product',
  slug: 'product',
  price: 10,
  sale_price: 5,
  description: null,
  thumb: null,
  images: ['https://example.com/a.jpg'],
  quantity: 3,
  track_stock: false,
  custom_currency: null,
  variations: [
    {
      id: 'c',
      name: 'color',
      type: 'image',
      props: [{ id: 'p', name: 'brown' }],
    },
  ],
  variants: [
    {
      id: 'v',
      price: 10,
      sale_price: 0,
      quantity: 0,
      variation_props: [{ variation: 'color', variation_prop: 'brown' }],
    },
  ],
  categories: [],
};

function mockFetch(response: Partial<Response>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(response)),
  );
}

function mockFetchFailure(cause: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(cause)),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchJson error kinds', () => {
  it('maps HTTP failures with their status', async () => {
    mockFetch({ ok: false, status: 404 });
    await expect(fetchJson('/x')).rejects.toMatchObject({ kind: 'http', status: 404 });
  });

  it('maps network failures', async () => {
    mockFetchFailure(new TypeError('Failed to fetch'));
    await expect(fetchJson('/x')).rejects.toMatchObject({ kind: 'network' });
  });

  describe('with abort signals', () => {
    /** fetch that only settles by rejecting when its signal aborts. */
    function mockHangingFetch() {
      vi.stubGlobal(
        'fetch',
        vi.fn(
          (_url: string, init: RequestInit) =>
            new Promise((_resolve, reject) => {
              init.signal!.addEventListener('abort', () => reject(init.signal!.reason));
            }),
        ),
      );
    }

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('maps the timeout firing to a timeout ApiError', async () => {
      const timeout = new AbortController();
      vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeout.signal);
      mockHangingFetch();

      const request = fetchJson('/x', { signal: new AbortController().signal });
      timeout.abort(new DOMException('timed out', 'TimeoutError'));
      await expect(request).rejects.toMatchObject({ kind: 'timeout' });
    });

    it('rethrows a caller cancellation untouched (not as an ApiError)', async () => {
      mockHangingFetch();
      const caller = new AbortController();

      const request = fetchJson('/x', { signal: caller.signal });
      caller.abort(new DOMException('cancelled', 'AbortError'));
      const error = await request.catch((cause: unknown) => cause);
      expect(error).not.toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ name: 'AbortError' });
    });

    /** Headers arrive, but the body only settles by rejecting when the signal aborts. */
    function mockHangingBody() {
      vi.stubGlobal(
        'fetch',
        vi.fn((_url: string, init: RequestInit) =>
          Promise.resolve({
            ok: true,
            json: () =>
              new Promise((_resolve, reject) => {
                init.signal!.addEventListener('abort', () => reject(init.signal!.reason));
              }),
          }),
        ),
      );
    }

    it('maps a timeout while reading the body to a timeout, not a parse error', async () => {
      const timeout = new AbortController();
      vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeout.signal);
      mockHangingBody();

      const request = fetchJson('/x', { signal: new AbortController().signal });
      await Promise.resolve();
      timeout.abort(new DOMException('timed out', 'TimeoutError'));
      await expect(request).rejects.toMatchObject({ kind: 'timeout' });
    });

    it('rethrows a caller cancellation during the body read untouched', async () => {
      mockHangingBody();
      const caller = new AbortController();

      const request = fetchJson('/x', { signal: caller.signal });
      await Promise.resolve();
      caller.abort(new DOMException('cancelled', 'AbortError'));
      const error = await request.catch((cause: unknown) => cause);
      expect(error).not.toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ name: 'AbortError' });
    });
  });

  it('maps invalid JSON', async () => {
    mockFetch({ ok: true, json: () => Promise.reject(new SyntaxError('bad')) });
    await expect(fetchJson('/x')).rejects.toMatchObject({ kind: 'parse' });
  });
});

describe('isRetryableError', () => {
  it('retries transient failures only', () => {
    expect(isRetryableError(new ApiError('network', ''))).toBe(true);
    expect(isRetryableError(new ApiError('timeout', ''))).toBe(true);
    expect(isRetryableError(new ApiError('http', '', 503))).toBe(true);
    expect(isRetryableError(new ApiError('http', '', 404))).toBe(false);
    expect(isRetryableError(new ApiError('invalid', ''))).toBe(false);
    expect(isRetryableError(new Error('boom'))).toBe(false);
  });
});

describe('getUserErrorMessage', () => {
  it('never exposes technical details', () => {
    const technical = new ApiError('http', 'Request failed with status 500', 500);
    expect(getUserErrorMessage(technical)).not.toContain('500');
    expect(getUserErrorMessage(new ApiError('http', '', 404))).toBe(
      'This product is no longer available.',
    );
    expect(
      getUserErrorMessage(new TypeError("Cannot read properties of undefined (reading 'map')")),
    ).toBe('Something went wrong. Please try again.');
  });
});

describe('isApiProduct', () => {
  it('accepts a valid payload, including null optional text fields', () => {
    expect(isApiProduct(validPayload)).toBe(true);
  });

  it.each([
    ['null', null],
    ['an array', []],
    ['missing variants', { ...validPayload, variants: undefined }],
    ['a non-numeric price', { ...validPayload, price: '10' }],
    ['a malformed variation', { ...validPayload, variations: [{ id: 'c' }] }],
    [
      'a malformed variant prop ref',
      { ...validPayload, variants: [{ ...validPayload.variants[0], variation_props: [{}] }] },
    ],
  ])('rejects %s', (_label, payload) => {
    expect(isApiProduct(payload)).toBe(false);
  });
});

describe('fetchProduct', () => {
  it('requests the product endpoint', async () => {
    mockFetch({ ok: true, json: () => Promise.resolve(validPayload) });
    await fetchProduct('Sneakers12');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.easy-orders.net/api/v1/products/slug/clear-theme/Sneakers12?join=reviews',
      expect.objectContaining({ headers: { Accept: 'application/json' } }),
    );
  });

  it('normalizes a valid payload, defaulting null text fields', async () => {
    mockFetch({ ok: true, json: () => Promise.resolve(validPayload) });
    const product = await fetchProduct('product');
    expect(product).toMatchObject({
      descriptionHtml: '',
      customCurrency: '',
      images: validPayload.images,
    });
  });

  it('rejects an unexpected payload with an "invalid" ApiError', async () => {
    mockFetch({ ok: true, json: () => Promise.resolve({ data: 'something else' }) });
    await expect(fetchProduct('product')).rejects.toMatchObject({ kind: 'invalid' });
  });
});
