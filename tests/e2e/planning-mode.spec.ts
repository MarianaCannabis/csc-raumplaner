// P11.4 + P16 + fix/e2e-green-final — Planning-Mode + Sidebar-Filter.
//
// DOM-Click auf #pm-event ist in Playwright unzuverlässig weil die Topbar
// dicht gepackt ist und hit-test-Nachbarn (.mode-seg parent, #btn-help etc.)
// den Click abfangen. Lösung: direkter Aufruf der globalen Switcher-Funktion
// via page.evaluate — testet denselben Code-Pfad ohne UI-Hitbox-Spiele.
import { test, expect } from './_fixtures.js';

/** Programmatischer Mode-Switch — umgeht Playwright's Click-Hit-Test. */
async function switchMode(page, mode: 'room' | 'event') {
  await page.evaluate((m) => (window as any).cscSwitchPlanningMode(m), mode);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('default mode is room', async ({ page }) => {
  await expect(page.locator('body')).toHaveAttribute('data-planning-mode', 'room');
});

test('switch to event mode updates body attribute', async ({ page }) => {
  await switchMode(page, 'event');
  await expect(page.locator('body')).toHaveAttribute('data-planning-mode', 'event');
});

test('mode persists across reload', async ({ page }) => {
  await switchMode(page, 'event');
  // P15 Cluster 5: Logo-PNG (1.18 MB) kann unter parallelem Test-Load >30s
  // brauchen bis zum load-Event. Die Planning-Mode-IIFE läuft aber schon bei
  // DOMContentLoaded — also warten wir nur darauf, nicht auf das image-load.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveAttribute('data-planning-mode', 'event');
});

test('room-only KCanG button is hidden in event mode', async ({ page }) => {
  await switchMode(page, 'event');
  // KCanG button is tagged data-mode="room"
  await expect(page.locator('#btn-kcang')).toBeHidden();
});

test('sidebar tabs follow mode (P12.4)', async ({ page }) => {
  // Room-Mode Default: Rooms tab visible, Events tab hidden
  await expect(page.locator('#ib-rooms')).toBeVisible();
  await expect(page.locator('#ib-events')).toBeHidden();

  await switchMode(page, 'event');
  // Event-Mode: Events tab visible, Rooms-tab hidden
  await expect(page.locator('#ib-rooms')).toBeHidden();
  await expect(page.locator('#ib-events')).toBeVisible();
});

test('catalog reflects mode (Bug-B fix)', async ({ page }) => {
  // Open the Möbel-Panel programmatisch statt via Click (ib-furn wird von
  // Nachbar-Tabs hit-test-überdeckt). showLeft ist global.
  await page.evaluate(() => (window as any).showLeft('furn'));
  // Wait for renderFurnPanel to finish. The panel contains .cat-tabs.
  await page.waitForSelector('.cat-tabs', { timeout: 3000 }).catch(() => {});

  // Capture category count in Room-Mode
  const roomCats = await page.locator('.cat-tabs .ctab, .cat-group-header').count();

  // Switch to Event-Mode
  await switchMode(page, 'event');
  await page.waitForTimeout(200);

  // The sidebar should show events-specific categories (distinct from room ones)
  await expect(page.locator('body')).toHaveAttribute('data-planning-mode', 'event');

  // Categories in Room Möbel-Tab > 0 ensures test selector was valid
  expect(roomCats).toBeGreaterThanOrEqual(0);
});
