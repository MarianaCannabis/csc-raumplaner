// P11.4 + P16 — Accessibility regression (P8.6 + P11.2 Touch-Targets).
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
});

test('icon-only topbar buttons have aria-label or title', async ({ page }) => {
  const iconBtns = await page.locator('.icon-btn').all();
  expect(iconBtns.length).toBeGreaterThan(0);
  for (const btn of iconBtns) {
    const aria = await btn.getAttribute('aria-label');
    const title = await btn.getAttribute('title');
    expect(aria || title).toBeTruthy();
  }
});

test('language switcher has aria-label', async ({ page }) => {
  const sel = page.locator('#lang-switch');
  await expect(sel).toHaveAttribute('aria-label', /Sprache/);
});

test('UI-mode select has aria-label', async ({ page }) => {
  await expect(page.locator('#ui-mode-select')).toHaveAttribute('aria-label', /UI-Modus/);
});

test('mode-switcher buttons have aria-labels', async ({ page }) => {
  await expect(page.locator('#pm-room')).toHaveAttribute('aria-label', /Raumplanung/);
  await expect(page.locator('#pm-event')).toHaveAttribute('aria-label', /Veranstaltungs-Planung/);
});

test('mobile touch-targets are min 44px (WCAG 2.1 AA)', async ({ page }) => {
  // Simulate mobile viewport (< 1024 px)
  await page.setViewportSize({ width: 800, height: 800 });
  await page.waitForTimeout(100);

  // Sample a few topbar buttons — should be >= 44px tall on mobile
  const saveBtn = page.locator('#btn-save-primary');
  const box = await saveBtn.boundingBox();
  if (box) {
    expect(box.height, 'Save-Button should be >= 44 px on mobile').toBeGreaterThanOrEqual(44);
  }
});

test('Tab-Key moves focus through topbar', async ({ page }) => {
  await page.locator('body').focus();
  await page.keyboard.press('Tab');
  // Focus should land on a focusable element — we check that SOME element has focus
  const focused = await page.evaluate(() => document.activeElement?.tagName?.toLowerCase());
  expect(focused, 'Tab must move focus to some element').toBeTruthy();
  expect(['body', 'html']).not.toContain(focused);
});
