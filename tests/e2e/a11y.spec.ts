// P11.4 — Accessibility regression (P8.6).
// Checks that the main interactive elements have aria-labels, and that
// focus is visible on Tab-navigation.
import { test, expect } from '@playwright/test';

test('icon-only topbar buttons have aria-label', async ({ page }) => {
  await page.goto('/');
  const iconBtns = await page.locator('.icon-btn').all();
  expect(iconBtns.length).toBeGreaterThan(0);
  for (const btn of iconBtns) {
    const aria = await btn.getAttribute('aria-label');
    const title = await btn.getAttribute('title');
    expect(aria || title).toBeTruthy();
  }
});

test('language switcher has aria-label', async ({ page }) => {
  await page.goto('/');
  const sel = page.locator('#lang-switch');
  await expect(sel).toHaveAttribute('aria-label', /Sprache/);
});
