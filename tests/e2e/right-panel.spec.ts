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

// P15 Right-Panel-Cleanup — Save-Panel neu strukturiert.
// Die KCanG-Projektdaten sind komplett ins m-kcang-dashboard-Modal migriert;
// im Save-Panel ersetzt eine Bridge-Card die ~15 Inputs. Falls jemand die
// Inputs versehentlich wieder ins Panel packt, soll dieser Test rot werden.
test('P15: KCanG-Brücken-Button öffnet Dashboard', async ({ page }) => {
  await page.evaluate(() => (window as any).showRight('save'));
  const bridgeBtn = page.locator('#btn-open-kcang-dashboard');
  await expect(bridgeBtn, 'Bridge-Card-Button must exist').toBeAttached();
  await expect(bridgeBtn).toContainText(/Dashboard öffnen/);

  // Modal muss nach Klick sichtbar werden — direkt über Funktion aufrufen,
  // damit data-mode="room"-Visibility-Filter (CSS) nicht als Hit-Test-Hürde
  // im Weg steht.
  await page.evaluate(() => (window as any).openKCaNGDashboard());
  await expect(page.locator('#m-kcang-dashboard')).toHaveClass(/open/);
});

test('P15: Save-Panel rendert ohne KCanG-Inputs (negativ-Assertion)', async ({ page }) => {
  await page.evaluate(() => (window as any).showRight('save'));
  const savePanel = page.locator('#rpanel-save');
  await expect(savePanel).toHaveClass(/active/);

  // Die pm-* IDs waren die ~15 Metadaten-Inputs aus dem alten KCanG-Block
  // im Save-Panel. Nach P15 dürfen die dort nicht mehr existieren (leben
  // jetzt als kd-* im m-kcang-dashboard-Modal).
  for (const id of ['pm-members', 'pm-address', 'pm-prev-officer', 'pm-windows-filmed', 'pm-energy-class']) {
    await expect(
      savePanel.locator(`#${id}`),
      `#${id} darf nach P15 nicht mehr im Save-Panel sein`,
    ).toHaveCount(0);
  }

  // Auch die tote API-Key-Eingabe (doSaveKey/updateApiSt) ist weg.
  await expect(savePanel.locator('#api-inp')).toHaveCount(0);
  await expect(savePanel.locator('.api-box #api-st')).toHaveCount(0);
});

test('P15: Sections sind als <details> collapsible', async ({ page }) => {
  await page.evaluate(() => (window as any).showRight('save'));
  const savePanel = page.locator('#rpanel-save');

  // Jede der 7 Sinnbereich-Sections lebt als <details class="rp-sec">.
  // Nicht alle sind im Room-Mode sichtbar (📄 Messeordnung = data-mode="event"),
  // deshalb zählen wir im DOM (nicht via :visible).
  const sections = savePanel.locator('details.rp-sec');
  await expect(sections).toHaveCount(7);

  // Mindestens eines ist beim Boot offen (Speicherung + Cloud per Freigabe).
  const openSections = savePanel.locator('details.rp-sec[open]');
  expect(await openSections.count()).toBeGreaterThanOrEqual(2);
});
