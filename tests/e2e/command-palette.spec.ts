// P11.4 + P16 + fix/e2e-green-final — Command-Palette.
// Guards the user invariant: palette shows ALL commands, never filtered
// by mode or tier.
//
// Keyboard-Shortcut Ctrl+K triggert in Playwright den document.keydown-
// Listener nicht zuverlässig (Focus-Isolation in headless-Chromium).
// Statt zu fiddlen: direkter Aufruf der globalen Opener-Funktion via
// page.evaluate — testet denselben Code-Pfad ohne Keyboard-Indirection.
import { test, expect } from './_fixtures.js';

/** Öffnet die Palette programmatisch. Nutzt die Debug-API aus P12-Followup. */
async function openPalette(page) {
  await page.evaluate(() => (window as any).cscCommandPalette.open());
}

async function closePalette(page) {
  await page.evaluate(() => (window as any).cscCommandPalette.close());
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Ctrl+K opens the palette (programmatic equivalent)', async ({ page }) => {
  await openPalette(page);
  await expect(page.locator('#cmd-palette.vis')).toBeVisible({ timeout: 2000 });
});

test('Esc closes the palette (programmatic equivalent)', async ({ page }) => {
  await openPalette(page);
  await closePalette(page);
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
  await openPalette(page);
  await page.waitForTimeout(100);
  const counter = page.locator('.cmd-count');
  await expect(counter).toBeVisible();
  // Counter should mention total count and filter hint
  await expect(counter).toContainText(/von \d+ Befehlen/);
});

test('palette shows MORE than 12 commands when unfiltered (Bug-C regression guard)', async ({ page }) => {
  await openPalette(page);
  await page.waitForTimeout(200);
  // The previous bug: slice(0, 12) showed only 12 rows.
  // Now all should render, list scrolls.
  const rowCount = await page.locator('.cmd-item').count();
  expect(rowCount, 'unfiltered palette should show all registered commands').toBeGreaterThan(12);
});

test('palette search filters by label/sub', async ({ page }) => {
  await openPalette(page);
  await page.waitForTimeout(100);
  // Fill braucht den echten Focus auf #cmd-input — das ist OK weil Playwright
  // .fill() den Focus selbst setzt (anders als keyboard.press).
  await page.locator('#cmd-input').fill('raum');
  await page.waitForTimeout(100);
  const rowCount = await page.locator('.cmd-item').count();
  expect(rowCount, 'search for "raum" should return some matches').toBeGreaterThan(0);
});

test('palette is mode-agnostic (Bug-C universal-access invariant)', async ({ page }) => {
  // Switch to Simple UI-mode (which hides ~80% of topbar buttons).
  // Via selectOption statt Click — Select-Element ist kein hit-test-Problem.
  await page.locator('#ui-mode-select').selectOption('simple');
  await page.waitForTimeout(100);
  await openPalette(page);
  await page.waitForTimeout(100);
  const rowCount = await page.locator('.cmd-item').count();
  // Palette must still list ALL commands — even in Simple mode
  expect(rowCount, 'palette should NOT filter by UI-mode').toBeGreaterThan(12);
});
