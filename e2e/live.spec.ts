import { expect, test } from '@playwright/test';

/**
 * Smoke test against the real EasyOrders API (no mocks). Runs only in the `live` project
 * (`npm run test:e2e:live`) because it depends on the network and live data.
 */

test('loads the live product and keeps its sale price through selection', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('product-title')).toBeVisible({ timeout: 20_000 });
  const price = await page.getByTestId('price').innerText();

  await page
    .getByRole('button', { name: /^color: / })
    .first()
    .click();
  await page.getByRole('group', { name: 'Select Size' }).getByRole('button').first().click();
  await expect(page.getByTestId('price')).toHaveText(price);
});
