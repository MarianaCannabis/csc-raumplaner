// P11.4 + P16 — Command-Palette (P9.4 + P10.6 + Bug-C-Fix).
// Explicitly guards the user invariant: palette shows ALL commands,
// never filtered by mode or tier.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
});

test('Ctrl+K opens the palette', async ({ page }) => {
  await page.keyboard.press('Control+K');
  await expect(page.locator('#cmd-palette.vis')).toBeVisible({ timeout: 2000 });
});

test('Esc closes the palette', async ({ page }) => {
  await page.keyboard.press('Control+K');
  await page.keyboard.press('Escape');
  const hasVis = await page.locator('#cmd-palette').evaluate((el) => el.classList.contains('vis'));
  expect(hasVis).toBe(false);
});

test('palette exposes items via window.cscCommandPalette (Bug-C debug API)', async ({ page }) => {
  const count = await page.evaluate(() => {
    return (window as any).cscCommandPalette?.items?.length ?? 0;
  });
  expect(count, 'palette should register >= 50 commands').toBeGreaterThanOrEqual(50);
});

test('palette shows counter header (Bug-C fix)', async ({ page }) => {
  await page.keyboard.press('Control+K');
  await page.waitForTimeout(100);
  const counter = page.locator('.cmd-count');
  await expect(counter).toBeVisible();
  // Counter should mention total count and filter hint
  await expect(counter).toContainText(/von \d+ Befehlen/);
});

test('palette shows MORE than 12 commands when unfiltered (Bug-C regression guard)', async ({ page }) => {
  await page.keyboard.press('Control+K');
  await page.waitForTimeout(200);
  // The previous bug: slice(0, 12) showed only 12 rows.
  // Now all should render, list scrolls.
  const rowCount = await page.locator('.cmd-item').count();
  expect(rowCount, 'unfiltered palette should show all registered commands').toBeGreaterThan(12);
});

test('palette search filters by label/sub', async ({ page }) => {
  await page.keyboard.press('Control+K');
  await page.waitForTimeout(100);
  await page.locator('#cmd-input').fill('raum');
  await page.waitForTimeout(100);
  const rowCount = await page.locator('.cmd-item').count();
  expect(rowCount, 'search for "raum" should return some matches').toBeGreaterThan(0);
});

test('palette is mode-agnostic (Bug-C universal-access invariant)', async ({ page }) => {
  // Switch to Simple UI-mode (which hides ~80% of topbar buttons)
  await page.locator('#ui-mode-select').selectOption('simple');
  await page.waitForTimeout(100);
  await page.keyboard.press('Control+K');
  await page.waitForTimeout(100);
  const rowCount = await page.locator('.cmd-item').count();
  // Palette must still list ALL commands — even in Simple mode
  expect(rowCount, 'palette should NOT filter by UI-mode').toBeGreaterThan(12);
});
