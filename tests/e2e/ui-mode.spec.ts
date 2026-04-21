// P11.4 + P16 + fix/e2e-green — UI-Mode Progressive Disclosure.
// _fixtures.ts erledigt Welcome-Modal-Suppression + Mode-State-Reset.
import { test, expect } from './_fixtures.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('default ui-mode is standard', async ({ page }) => {
  await expect(page.locator('body')).toHaveAttribute('data-ui-mode', 'standard');
});

test('switching to simple mode updates attribute', async ({ page }) => {
  await page.locator('#ui-mode-select').selectOption('simple');
  await expect(page.locator('body')).toHaveAttribute('data-ui-mode', 'simple');
});

test('simple-mode shows Simple-Badge (P12.3 Bug-A-Fix)', async ({ page }) => {
  await page.locator('#ui-mode-select').selectOption('simple');
  // Badge should be display:inline-flex in simple mode
  const badge = page.locator('.simple-badge');
  await expect(badge).toBeVisible();
  await expect(badge).toContainText('Simple');
});

test('simple-mode does NOT show full-width banner (Bug-A regression guard)', async ({ page }) => {
  await page.locator('#ui-mode-select').selectOption('simple');
  // The old banner element should no longer exist in the DOM
  const bannerCount = await page.locator('.simple-warn-banner').count();
  expect(bannerCount, 'old blocking banner must not exist').toBe(0);
});

test('clicking Simple-Badge switches back to standard', async ({ page }) => {
  await page.locator('#ui-mode-select').selectOption('simple');
  await page.locator('.simple-badge').click();
  await expect(page.locator('body')).toHaveAttribute('data-ui-mode', 'standard');
});

test('pro-mode unlocks all tiers', async ({ page }) => {
  await page.locator('#ui-mode-select').selectOption('pro');
  await expect(page.locator('body')).toHaveAttribute('data-ui-mode', 'pro');
  // Badge should NOT be visible in pro-mode
  await expect(page.locator('.simple-badge')).toBeHidden();
});
