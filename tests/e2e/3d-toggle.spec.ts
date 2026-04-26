import { test, expect } from './_fixtures.js';

// Mit _fixtures: ?e2e=1 wird auto-angehängt (kein Welcome-Modal),
// dialog-Handler akzeptiert confirm()/alert() automatisch.

test.setTimeout(120_000);
test('3D-Smoke: Boot + Console-Errors + 3D-Toggle', async ({ page }) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));
  page.on('console', (msg) => {
    const t = msg.type();
    if (t === 'error') errors.push('CONSOLE.ERROR: ' + msg.text());
    if (t === 'warning' && /three|3d|webgl|render/i.test(msg.text())) {
      warnings.push('CONSOLE.WARN: ' + msg.text());
    }
  });

  await page.goto('/', { waitUntil: 'load' });
  // Boot-Wait via fester Pause (rend3 ist `const` im Script-Scope, nicht auf
  // window — kann nicht via waitForFunction geprüft werden).
  await page.waitForTimeout(2000);

  // 1. THREE muss verfügbar sein (CDN-load) und tCv (3D-canvas-element).
  const status = await page.evaluate(() => {
    const w = window as unknown as {
      THREE?: { WebGLRenderer?: unknown };
      tCv?: HTMLCanvasElement;
      fpCv?: HTMLCanvasElement;
      scene?: { children?: unknown[] };
      currentView?: string;
      setView?: (v: string) => void;
      rebuild3D?: () => void;
    };
    return {
      threeLoaded: typeof w.THREE !== 'undefined',
      threeWebGLRenderer: typeof w.THREE?.WebGLRenderer === 'function',
      tCvExists: !!document.getElementById('three-canvas'),
      tCvIsCanvas: document.getElementById('three-canvas')?.tagName === 'CANVAS',
      fpCvExists: !!document.getElementById('fp-canvas'),
      sceneOnWindow: typeof w.scene !== 'undefined',
      currentView: w.currentView,
      hasSetView: typeof w.setView === 'function',
      hasRebuild3D: typeof w.rebuild3D === 'function',
    };
  });
  console.log('[smoke] boot-status:', JSON.stringify(status, null, 2));

  // 2. setView('3d') aufrufen
  if (status.hasSetView) {
    await page.evaluate(() => {
      const w = window as unknown as { setView: (v: string) => void };
      w.setView('3d');
    });
    await page.waitForTimeout(500);
  }

  const after3d = await page.evaluate(() => {
    const w = window as unknown as { currentView?: string };
    const tCv = document.getElementById('three-canvas') as HTMLCanvasElement | null;
    const fpCv = document.getElementById('fp-canvas') as HTMLCanvasElement | null;
    return {
      currentView: w.currentView,
      tCvDisplay: tCv ? window.getComputedStyle(tCv).display : 'no-tCv',
      tCvVisible: tCv ? tCv.offsetParent !== null : false,
      fpCvDisplay: fpCv ? window.getComputedStyle(fpCv).display : 'no-fpCv',
    };
  });
  console.log('[smoke] post-3d-toggle:', JSON.stringify(after3d, null, 2));

  // 3. Errors-Bericht
  console.log('[smoke] page errors:', errors.length);
  for (const e of errors.slice(0, 10)) console.log('  ' + e);
  console.log('[smoke] 3D-related warnings:', warnings.length);
  for (const w of warnings.slice(0, 5)) console.log('  ' + w);

  expect(status.threeLoaded, 'THREE-CDN nicht geladen').toBe(true);
  expect(status.threeWebGLRenderer, 'THREE.WebGLRenderer-Constructor fehlt').toBe(true);
  expect(status.tCvExists, 'tCv (3D-canvas) nicht im DOM').toBe(true);
  expect(status.hasSetView, 'window.setView nicht gebunden').toBe(true);
  expect(status.hasRebuild3D, 'window.rebuild3D nicht definiert').toBe(true);
  // Hotfix v2.7.2 Regression-Schutz: nach setView('3d') MUSS der 3D-canvas
  // sichtbar (display: block) und der 2D-canvas versteckt (display: none) sein.
  // Bug v2.7.1: setView-Wrapper las window.fpCv/tCv (lokale const,
  // nicht auf window) → Canvas-Display-Swap unterblieb.
  expect(after3d.tCvDisplay, '3D-Canvas display-toggle nach setView(3d) defekt').toBe('block');
  expect(after3d.fpCvDisplay, '2D-Canvas sollte hidden sein nach setView(3d)').toBe('none');
});
