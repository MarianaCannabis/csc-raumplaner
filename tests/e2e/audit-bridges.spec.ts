// Sitzung G Schritt 0 / Module-Bridge-Audit Regression-Schutz.
//
// Prüft dass alle Top-Level-Variablen aus index.html, die von src/main.ts
// via window.X gelesen werden, auch tatsächlich auf window landen.
// Wenn ein zukünftiger Refactor `var` → `let` ändert oder eine neue
// Variable als `let`/`const` hinzukommt die auch von main.ts gelesen
// wird, schlägt dieser Test sofort an. Bug-Klasse aus 3D-Bug v2.7.2.
import { test, expect } from './_fixtures.js';

test.setTimeout(60_000);
test('Audit: window-Reads in main.ts vs. inline-script-Variablen', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  const audit = await page.evaluate(() => {
    type Test = { name: string; type: 'let' | 'function' | 'var'; onWindow: boolean; sampleValue: string };
    const w = window as unknown as Record<string, unknown>;
    const items: Array<{ name: string; expectedType: 'let' | 'function' | 'var' }> = [
      // let-Variablen aus index.html (alle Verdächtige aus 3D-Bug-Lehre)
      { name: 'rooms', expectedType: 'let' },
      { name: 'objects', expectedType: 'let' },
      { name: 'walls', expectedType: 'let' },
      { name: 'measures', expectedType: 'let' },
      { name: 'grounds', expectedType: 'let' },
      { name: 'floors', expectedType: 'let' },
      { name: 'curFloor', expectedType: 'let' },
      { name: 'projName', expectedType: 'let' },
      { name: 'selId', expectedType: 'let' },
      { name: 'selIsRoom', expectedType: 'let' },
      { name: 'selIsWall', expectedType: 'let' },
      { name: 'vpZoom', expectedType: 'let' },
      { name: 'vpX', expectedType: 'let' },
      { name: 'vpY', expectedType: 'let' },
      // var-Variablen (sollten auf window sein)
      { name: 'projMeta', expectedType: 'var' },
      // function-Decls (sollten auf window sein)
      { name: 'findItem', expectedType: 'function' },
      { name: 'getPD', expectedType: 'function' },
      { name: 'loadPD', expectedType: 'function' },
      { name: 'snapshot', expectedType: 'function' },
      { name: 'draw2D', expectedType: 'function' },
      { name: 'rebuild3D', expectedType: 'function' },
      { name: 'renderLeft', expectedType: 'function' },
      { name: 'updateSelBotBar', expectedType: 'function' },
      { name: 'wx2cx', expectedType: 'function' },
      { name: 'wy2cy', expectedType: 'function' },
      { name: 'cx2wx', expectedType: 'function' },
      { name: 'cy2wy', expectedType: 'function' },
      { name: 'getObjPrice', expectedType: 'function' },
      { name: 'renderFloorTabs', expectedType: 'function' },
      // 3D-Bug-Bridges (sollten nach v2.7.2 alle auf window sein)
      { name: 'fpCv', expectedType: 'var' },
      { name: 'tCv', expectedType: 'var' },
      { name: 'scene', expectedType: 'var' },
      { name: 'oCam', expectedType: 'var' },
      { name: 'fpCam3', expectedType: 'var' },
      { name: 'topCam', expectedType: 'var' },
      { name: 'grid3', expectedType: 'var' },
      { name: 'cam3', expectedType: 'var' },
      { name: 'rend3', expectedType: 'var' },
    ];
    const results: Test[] = [];
    for (const item of items) {
      const v = w[item.name];
      const tp = typeof v;
      results.push({
        name: item.name,
        type: item.expectedType,
        onWindow: tp !== 'undefined',
        sampleValue: tp === 'object' ? (Array.isArray(v) ? `Array(${(v as unknown[]).length})` : tp) : tp,
      });
    }
    return results;
  });

  const onWindow = audit.filter((a) => a.onWindow);
  const offWindow = audit.filter((a) => !a.onWindow);
  console.log('[audit] Total checked:', audit.length);
  console.log('[audit] On window:', onWindow.length);
  console.log('[audit] Off window:', offWindow.length);
  if (offWindow.length > 0) {
    console.log('[audit] OFF-WINDOW (Silent-Fail-Candidates):');
    for (const o of offWindow) console.log('   ', JSON.stringify(o));
  }
  console.log('[audit] ON-WINDOW (good):');
  for (const o of onWindow) console.log('   ', JSON.stringify(o));

  // Hard-fail wenn auch nur eine Variable nicht mehr auf window ist —
  // damit zukünftige Refactors den Audit-Test brechen statt silent zu fail'en.
  expect(offWindow, 'Module-Bridge-Audit: ' + offWindow.length + ' Silent-Fail-Candidates gefunden').toEqual([]);
});
