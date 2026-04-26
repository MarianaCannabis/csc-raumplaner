// Sitzung G Schritt 1 — Shortcuts-Editor v2 Regression-Schutz.
//
// Konflikt-Detection, 3 Presets, erweiterte 15-Item-Liste.
import { test, expect } from './_fixtures.js';

test.setTimeout(60_000);

test.describe('Shortcuts-Editor v2', () => {
  test('Editor rendert 15 Items aus SHORTCUT_DEFINITIONS', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.evaluate(() =>
      (window as unknown as { openShortcutEditor: () => void }).openShortcutEditor(),
    );
    await page.waitForTimeout(150);
    const count = await page.evaluate(() => {
      const el = document.getElementById('shortcuts-list');
      return el ? (el.innerHTML.match(/sc-edit-row/g) || []).length : 0;
    });
    expect(count).toBe(15);
  });

  test('3 Presets verfügbar (power-user / maus-user / touch-tablet)', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    // Einmal jeden Preset triggern und checken dass localStorage befüllt
    for (const name of ['power-user', 'maus-user', 'touch-tablet']) {
      await page.evaluate((n) => {
        (window as unknown as { applyShortcutPreset: (s: string) => void }).applyShortcutPreset(n);
      }, name);
      const ls = await page.evaluate(() => localStorage.getItem('csc-shortcuts'));
      expect(ls, `Preset ${name} sollte localStorage setzen`).toBeTruthy();
    }
  });

  test('applyShortcutPreset: localStorage gesetzt', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      (window as unknown as { applyShortcutPreset: (n: string) => void }).applyShortcutPreset(
        'power-user',
      );
    });
    const ls = await page.evaluate(() => localStorage.getItem('csc-shortcuts'));
    expect(ls).toBeTruthy();
    const parsed = JSON.parse(ls!);
    // power-user-Preset hat 'r' → 'rotateSel'
    expect(parsed['r']).toBe('rotateSel');
  });

  test('applyShortcutPreset: alle non-Preset-Bindings entfernt', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    // Erst beliebigen Custom-Eintrag setzen
    await page.evaluate(() => {
      const w = window as unknown as { _customShortcuts: Record<string, string> };
      w._customShortcuts['x'] = 'fooBar';
    });
    // Dann Preset anwenden
    await page.evaluate(() => {
      (window as unknown as { applyShortcutPreset: (n: string) => void }).applyShortcutPreset(
        'touch-tablet',
      );
    });
    const cs = await page.evaluate(
      () => (window as unknown as { _customShortcuts: Record<string, string> })._customShortcuts,
    );
    // Touch-Tablet hat NUR 2 + 3, kein 'x'
    expect(cs['x']).toBeUndefined();
    expect(cs['2']).toBe('modeView2d');
  });

  test('getKeyForFn: returnt Key zur Function', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const w = window as unknown as { applyShortcutPreset: (n: string) => void };
      w.applyShortcutPreset('power-user');
    });
    const key = await page.evaluate(() =>
      (window as unknown as { getKeyForFn: (fn: string) => string | null }).getKeyForFn(
        'rotateSel',
      ),
    );
    expect(key).toBe('r');
  });

  test('openShortcutEditor: Modal mit Preset-Buttons rendert', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      (window as unknown as { openShortcutEditor: () => void }).openShortcutEditor();
    });
    await page.waitForTimeout(150);
    const html = await page.evaluate(() => {
      const el = document.getElementById('shortcuts-list');
      return el ? el.innerHTML : '';
    });
    expect(html).toContain('Power-User');
    expect(html).toContain('Maus-User');
    expect(html).toContain('Touch-Tablet');
    expect(html).toContain('Reset');
    // 15 sc-edit-row Einträge
    expect((html.match(/sc-edit-row/g) || []).length).toBe(15);
  });
});
