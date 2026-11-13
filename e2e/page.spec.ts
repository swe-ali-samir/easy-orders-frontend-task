import { expect, test } from '@playwright/test';
import { openProductPage, PRODUCT } from './support';

test('renders every design section without horizontal overflow', async ({ page, isMobile }) => {
  await openProductPage(page);

  await expect(page).toHaveTitle(`${PRODUCT.name} | EasyOrders`);
  for (const name of ['Related Product', 'Product Reviews', 'Popular this week']) {
    await expect(page.getByRole('heading', { name, level: 2 })).toBeVisible();
  }
  await expect(page.getByRole('contentinfo')).toBeVisible();

  // Header adapts: menu button on mobile, text controls on desktop.
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible({ visible: isMobile });
  await expect(page.getByRole('button', { name: 'Categories' })).toBeVisible({
    visible: !isMobile,
  });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('filters reviews by rating', async ({ page, isMobile }) => {
  await openProductPage(page);
  if (isMobile) {
    await page.getByRole('button', { name: 'Filter reviews' }).click();
  }
  await page.getByRole('checkbox', { name: '1 stars' }).check();
  await expect(page.getByTestId('review-item')).toHaveCount(1);
  await expect(page.getByTestId('review-item')).toContainText('Savannah Nguyen');
});
