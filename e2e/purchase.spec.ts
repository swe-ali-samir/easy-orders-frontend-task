import { expect, test } from '@playwright/test';
import { openProductPage } from './support';

test('validates, adds the selected variant, survives a reload, and manages the cart', async ({
  page,
}) => {
  await openProductPage(page);
  await expect(page.getByTestId('price')).toContainText('EGP 160.00');
  await expect(page.getByTestId('original-price')).toContainText('EGP 190.00');

  // The first available colour is pre-selected; size must be chosen by the customer.
  await expect(page.getByRole('button', { name: 'color: brown' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  // Validation happens on click, not up front.
  const hint = page.getByTestId('add-to-cart-hint');
  await expect(hint).toBeEmpty();
  await page.getByTestId('add-to-cart-button').click();
  await expect(hint).toHaveText('Please select size');

  await page.getByRole('button', { name: 'color: black' }).click();
  await page.getByRole('button', { name: '40', exact: true }).click();
  await expect(hint).toBeEmpty();
  // Live data: every variant mirrors the product, so the sale price must hold.
  await expect(page.getByTestId('price')).toContainText('EGP 160.00');

  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await page.getByTestId('add-to-cart-button').click();

  // Headless UI puts role=dialog on a zero-size wrapper (the panel is position: fixed),
  // so visibility is asserted on the drawer's title rather than the dialog element.
  const drawer = page.getByRole('dialog', { name: 'Your Cart' });
  const drawerTitle = drawer.getByRole('heading', { name: 'Your Cart' });
  await expect(drawerTitle).toBeVisible();
  await expect(drawer.getByTestId('cart-added-banner')).toContainText('Added Achilles Pro');
  await expect(drawer.getByTestId('cart-item')).toHaveCount(1);
  await expect(drawer.getByText('black · 40')).toBeVisible();
  await expect(drawer.getByTestId('cart-subtotal')).toHaveText('EGP 320.00');

  await drawer.getByTestId('close-cart').click();
  await expect(drawer).toBeHidden();
  await expect(page.getByTestId('cart-badge')).toHaveText('2');

  // The cart persists across a full page reload.
  await page.reload();
  await page.getByTestId('product-title').waitFor();
  await expect(page.getByTestId('cart-badge')).toHaveText('2');

  await page.getByTestId('cart-button').click();
  await expect(drawerTitle).toBeVisible();
  await expect(drawer.getByTestId('cart-added-banner')).toHaveCount(0);
  await drawer.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(drawer.getByTestId('cart-subtotal')).toHaveText('EGP 480.00');

  await drawer.getByTestId('remove-item').click();
  await expect(drawer.getByTestId('cart-empty')).toBeVisible();
  await expect(page.getByTestId('cart-badge')).toHaveCount(0);
});

test('"Checkout Now" adds the item and opens the cart', async ({ page }) => {
  await openProductPage(page);
  await page.getByRole('button', { name: 'color: brown' }).click();
  await page.getByRole('button', { name: '42', exact: true }).click();
  await page.getByTestId('checkout-now-button').click();

  const drawer = page.getByRole('dialog', { name: 'Your Cart' });
  await expect(drawer.getByText('brown · 42')).toBeVisible();
});
