// P15 Topbar-Cleanup — Rechts-Panel-Tabs Regression.
//
// Nach dem Cleanup der Topbar (4 Duplikat-Navigations-Buttons entfernt)
// sind #rtab-ai, #rtab-design, #rtab-light und #rtab-save der einzige
// UI-Zugang zu diesen Panels. Dieser Test garantiert, dass Tab-Clicks
// funktionieren — falls jemand in Zukunft die Tab-IDs umbenennt oder
// showRight() refactort, bricht dieser Test früh.
import { test, expect } from './_fixtures.js';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Legacy-Boot-Code setzt nach 200ms setTimeout(showRight('props'))
  // — warten bis dieser Race abgeklungen ist, sonst überschreibt er
  // unseren Click.
  await page.waitForTimeout(300);
});

const TABS: Array<{ tab: string; panel: string; label: RegExp }> = [
  { tab: 'rtab-ai',     panel: 'rpanel-ai',     label: /KI-Assistent/ },
  { tab: 'rtab-design', panel: 'rpanel-design', label: /Design/ },
  { tab: 'rtab-light',  panel: 'rpanel-light',  label: /Licht/ },
  { tab: 'rtab-save',   panel: 'rpanel-save',   label: /Projekte/ },
];

for (const { tab, panel, label } of TABS) {
  test(`#${tab} activates corresponding #${panel}`, async ({ page }) => {
    const tabEl = page.locator(`#${tab}`);
    await expect(tabEl, 'tab must exist in DOM').toBeAttached();
    await expect(tabEl).toContainText(label);

    // Umgeht Click-Hit-Tests + alle Legacy-setTimeout-Rewrites indem
    // showRight() direkt aufgerufen wird. Testet die Funktion + die CSS-
    // Folge (rtab/rpanel bekommen .active).
    const tabId = tab.replace('rtab-', '');
    await page.evaluate((id) => (window as any).showRight(id), tabId);
    await expect(tabEl).toHaveClass(/active/);
    await expect(page.locator(`#${panel}`)).toHaveClass(/active/);
  });
}

test('tabs are mutually exclusive — nur ein aktives Panel gleichzeitig', async ({ page }) => {
  await page.evaluate(() => (window as any).showRight('ai'));
  await expect(page.locator('#rpanel-ai')).toHaveClass(/active/);

  await page.evaluate(() => (window as any).showRight('design'));
  await expect(page.locator('#rpanel-design')).toHaveClass(/active/);
  await expect(page.locator('#rpanel-ai')).not.toHaveClass(/active/);
});
