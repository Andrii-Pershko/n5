import { expect, test } from '@playwright/test';

test('home offers demo login and self-signup', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('buyer@n5deal.demo')).toBeVisible();
  await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
});

test('buyer demo can open the public catalog', async ({ page }) => {
  await page.goto('/');
  await page.getByText('buyer@n5deal.demo').click();
  await expect(page).toHaveURL(/\/listings/);
  await expect(page.getByText(/ND-|Asset ID/i).first()).toBeVisible({
    timeout: 15_000,
  });
});
