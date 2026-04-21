// P15 Topbar-Responsive — Regression für User-Bug: bei Zoom ≥ 125% oder
// schmalem Viewport (<1400px) waren rechte Topbar-Buttons off-screen und
// nicht erreichbar. Diese Tests decken die zwei Lösungsmechanismen:
//   1. flex-wrap: wrap auf #topbar — Items landen bei Platzmangel auf
//      einer zweiten Zeile, nicht off-screen
//   2. Priority+ Overflow-Menü (⋯) bei <900px — Low-Priority-Items (Sprache,
//      UI-Mode, Help, Theme, Vorlagen, KCanG) sind via #topbar-overflow-btn
//      erreichbar
import { test, expect } from './_fixtures.js';

/** Mode-agnostische Core-Buttons, die in jedem Planning-Mode (Room+Event)
 *  sichtbar sein müssen. #btn-templates (data-mode="event") und #btn-kcang
 *  (data-mode="room") sind nur in ihrem jeweiligen Modus sichtbar — daher
 *  hier nicht enthalten; deren Mode-Sichtbarkeit ist in planning-mode.spec.ts
 *  abgedeckt. */
const CORE_BUTTONS = [
  '#btn-save-primary',
  '#pm-room',
  '#pm-event',
  '#btn-help',
  '#lang-switch',
  '#ui-mode-select',
  '#theme-toggle',
];

async function collectTopbarBoxes(page) {
  return await page.evaluate((selectors) => {
    const topbar = document.getElementById('topbar');
    if (!topbar) return [];
    const tbBox = topbar.getBoundingClientRect();
    return selectors.map((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { sel, exists: false };
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return {
        sel,
        exists: true,
        visible: style.display !== 'none' && style.visibility !== 'hidden',
        inTopbar: box.top >= tbBox.top - 1 && box.bottom <= tbBox.bottom + 1,
        right: box.right,
        bottom: box.bottom,
      };
    });
  }, CORE_BUTTONS);
}

test('Desktop (1280×720): alle Primary-Buttons sichtbar in Topbar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  const boxes = await collectTopbarBoxes(page);
  const missing = boxes.filter((b) => b.exists && !b.visible);
  expect(missing, `Im Desktop-Mode müssen alle Buttons sichtbar sein`).toEqual([]);
});

test('Narrow Viewport (800px): niedrig-priorisierte Items via Overflow-Menü erreichbar', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 720 });
  await page.goto('/');
  // ⋯-Button muss sichtbar sein
  const overflowBtn = page.locator('#topbar-overflow-btn');
  await expect(overflowBtn).toBeVisible();

  // Priority-1-Items (#btn-templates, #btn-kcang, #btn-help) sind ausgeblendet
  // in der Topbar-Main-Zone — müssen aber im Overflow-Menü auftauchen
  await overflowBtn.click();
  const menu = page.locator('#topbar-overflow-menu.open');
  await expect(menu).toBeVisible();

  // Menu enthält Items für die ausgeblendeten Buttons (data-overflow-for-Attribut)
  const overflowItems = page.locator('#topbar-overflow-menu [data-overflow-for]');
  const count = await overflowItems.count();
  expect(count, 'Overflow-Menü muss ≥1 Item enthalten').toBeGreaterThan(0);
});

test('Sehr schmal (720px): Priority-2-Items auch im Overflow', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 720 });
  await page.goto('/');
  // Auch Priority-2 (Sprache, UI-Mode, Theme) wandert jetzt ins Overflow
  await page.locator('#topbar-overflow-btn').click();
  const menu = page.locator('#topbar-overflow-menu.open');
  await expect(menu).toBeVisible();

  // Prüfe dass ein Priority-2-Referenz (data-overflow-for="theme-toggle") da ist
  const themeRef = page.locator('#topbar-overflow-menu [data-overflow-for="theme-toggle"]');
  await expect(themeRef).toBeAttached();
});

test('Overflow-Menü schließt bei Outside-Click', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 720 });
  await page.goto('/');
  await page.locator('#topbar-overflow-btn').click();
  await expect(page.locator('#topbar-overflow-menu.open')).toBeVisible();
  // Click ausserhalb → schließt
  await page.locator('body').click({ position: { x: 400, y: 400 } });
  await expect(page.locator('#topbar-overflow-menu.open')).not.toBeVisible();
});

test('Topbar wrapped statt overflow: alle Items noch im Layout (nicht offscreen-rechts)', async ({ page }) => {
  // Zoom 150% simuliert durch Viewport-Verschmälerung. Playwright hat kein
  // direktes "Zoom", aber CSS-Media-Queries verhalten sich äquivalent bei
  // entsprechend reduzierter Breite.
  await page.setViewportSize({ width: 1050, height: 720 });
  await page.goto('/');
  const boxes = await collectTopbarBoxes(page);
  const vpWidth = 1050;
  const offscreen = boxes.filter((b) => b.exists && b.visible && b.right > vpWidth + 5);
  expect(
    offscreen.map((b) => `${b.sel} @ right=${b.right}`),
    `Keine sichtbaren Topbar-Items dürfen > viewport.width sein (flex-wrap muss sie umbrechen)`,
  ).toEqual([]);
});
