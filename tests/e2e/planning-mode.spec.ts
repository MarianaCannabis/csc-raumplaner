// P11.4 — Planning-Mode-Switcher (P11.1) regression.
// Verifies that the segmented control toggles body[data-planning-mode]
// and persists across reload.
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Dismiss the confirm() that P11.1 throws on mode change so we don't hang.
  page.on('dialog', (d) => d.accept());
  await page.goto('/');
});

test('default mode is room', async ({ page }) => {
  await expect(page.locator('body')).toHaveAttribute('data-planning-mode', 'room');
});

test('switch to event mode updates body attribute', async ({ page }) => {
  await page.locator('#pm-event').click();
  await expect(page.locator('body')).toHaveAttribute('data-planning-mode', 'event');
});

test('mode persists across reload', async ({ page }) => {
  await page.locator('#pm-event').click();
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-planning-mode', 'event');
});

test('room-only element is hidden in event mode', async ({ page }) => {
  await page.locator('#pm-event').click();
  // KCanG button is tagged data-mode="room"
  await expect(page.locator('#btn-kcang')).toBeHidden();
});
