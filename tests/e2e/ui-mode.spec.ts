// P11.4 — UI-Mode Progressive Disclosure (P10.5) regression.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
});

test('default ui-mode is standard', async ({ page }) => {
  await expect(page.locator('body')).toHaveAttribute('data-ui-mode', 'standard');
});

test('switching to simple mode hides pro-tier items', async ({ page }) => {
  await page.locator('#ui-mode-select').selectOption('simple');
  await expect(page.locator('body')).toHaveAttribute('data-ui-mode', 'simple');
});

test('pro-mode shows all tiers', async ({ page }) => {
  await page.locator('#ui-mode-select').selectOption('pro');
  await expect(page.locator('body')).toHaveAttribute('data-ui-mode', 'pro');
});
