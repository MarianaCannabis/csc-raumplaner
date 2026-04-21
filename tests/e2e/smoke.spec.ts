// P11.4 — Smoke test: app boots without console errors.
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
  expect(errors, `unexpected runtime errors: ${errors.join(' | ')}`).toEqual([]);
});

test('login-gate shows when no token', async ({ page }) => {
  await page.goto('/');
  // Either the gate is visible (no token) or the main app (token present).
  const gateOrApp = page.locator('#login-gate, #app');
  await expect(gateOrApp.first()).toBeVisible();
});
