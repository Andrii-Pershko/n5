import { expect, test } from '@playwright/test';

test('home links to sign-in and register', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /sign in/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /create an account/i }).first()).toBeVisible();
});

test('sign-in offers demo roles and classic login', async ({ page }) => {
  await page.goto('/signin');
  await expect(page.getByText('buyer@n5deal.demo')).toBeVisible();
  await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible();
});

test('buyer demo can open the public catalog', async ({ page }) => {
  await page.goto('/signin');
  await page.getByText('buyer@n5deal.demo').click();
  await expect(page).toHaveURL(/\/listings/);
  await expect(page.getByText(/ND-|Asset ID/i).first()).toBeVisible({
    timeout: 15_000,
  });
});
