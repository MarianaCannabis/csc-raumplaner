// P11.4 + P16 + fix/e2e-green — Accessibility regression.
import { test, expect } from './_fixtures.js';

test.beforeEach(async ({ page }) => {
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

test('Tab-Key moves focus to a focusable topbar element', async ({ page }) => {
  // Wait for app bootstrap (topbar muss gerendert sein, damit überhaupt
  // focusable Elemente vorhanden sind).
  await expect(page.locator('#topbar')).toBeVisible();

  // Bis zu 20 Tabs drücken, um den ersten focusable-Element zu finden.
  // Body.focus() ist ein No-Op (body ist nicht tabindexed), deshalb fokussieren
  // wir explizit ein bekannt-focusable Element am Seitenanfang.
  await page.locator('#btn-save-primary').focus();
  const firstFocus = await page.evaluate(() => document.activeElement?.id || '');
  expect(firstFocus, 'Save-Button sollte programmatisch fokussierbar sein').toBe('btn-save-primary');

  // Tab bewegt weiter — muss IRGENDEIN anderes fokussierbares Element treffen.
  await page.keyboard.press('Tab');
  const afterTab = await page.evaluate(() => ({
    tag: document.activeElement?.tagName?.toLowerCase() ?? '',
    id: document.activeElement?.id ?? '',
  }));
  expect(afterTab.tag, 'Tab muss Focus auf ein Element bewegen').toBeTruthy();
  expect(['body', 'html'], 'Tab darf nicht auf body/html landen').not.toContain(afterTab.tag);
});
