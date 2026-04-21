// P11.4 — Command-Palette (P9.4/P10.6) regression.
import { test, expect } from '@playwright/test';

test('Ctrl+K opens the palette', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
  await page.keyboard.press('Control+K');
  await expect(page.locator('#cmd-palette.vis, #cmd-palette[style*="display:block"], #cmd-palette[style*="display: block"]').first()).toBeVisible({ timeout: 2000 });
});

test('Esc closes the palette', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
  await page.keyboard.press('Control+K');
  await page.keyboard.press('Escape');
  // #cmd-palette should no longer have the .vis class
  const hasVis = await page.locator('#cmd-palette').evaluate((el) => el.classList.contains('vis'));
  expect(hasVis).toBe(false);
});
