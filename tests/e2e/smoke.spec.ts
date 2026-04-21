// P11.4 + P16 — Smoke test: app boots, no runtime errors, brand=CSC Studio Pro.
import { test, expect } from '@playwright/test';

test('app boots and shows topbar', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');
  await expect(page.locator('#topbar')).toBeVisible();
  await expect(page.locator('.logo')).toContainText('CSC');
  // P16: verify rebrand — the logo should say "Studio Pro" not "Raumplaner"
  await expect(page.locator('.logo em')).toContainText('Studio Pro');
  expect(errors, `unexpected runtime errors: ${errors.join(' | ')}`).toEqual([]);
});

test('page title is CSC Studio Pro', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/CSC Studio Pro/);
});

test('login-gate or main app is visible', async ({ page }) => {
  await page.goto('/');
  // Either the gate is visible (no token) or the main app (token present).
  const gateOrApp = page.locator('#login-gate, #app');
  await expect(gateOrApp.first()).toBeVisible();
});
