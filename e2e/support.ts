import type { Page } from '@playwright/test';
import product from './fixtures/sneakers12.json' with { type: 'json' };

/** Live API response for Sneakers12, captured 2026-11-13. */
export const PRODUCT = product;

const API_PATTERN = '**/api/v1/products/slug/clear-theme/**';
const IMAGE_PATTERN = 'https://easyorders.fra1.digitaloceanspaces.com/**';

/** 1×1 transparent PNG: stands in for CDN images, which are slow and flaky. */
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

export async function mockImages(page: Page) {
  await page.route(IMAGE_PATTERN, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL }),
  );
}

export async function mockProductApi(page: Page, body: unknown = PRODUCT, status = 200) {
  await page.route(API_PATTERN, (route) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }),
  );
}

/** Mocked API + images, then open the page and wait for the product. */
export async function openProductPage(page: Page) {
  await mockImages(page);
  await mockProductApi(page);
  await page.goto('/');
  await page.getByTestId('product-title').waitFor();
}
