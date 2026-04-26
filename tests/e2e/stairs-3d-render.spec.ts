// Multi-Floor Phase 3 (Mega-Sammel #1) — Smoke: Treppe muss in 3D sichtbar sein.
//
// Phase 2 hatte buildStairsMesh gebaut, rebuild3D ignorierte den stairs-Type.
// Phase 3 ergänzt den Branch in build3DObj. Dieser Test fängt Regressionen.
import { test, expect } from './_fixtures.js';

test.setTimeout(120_000);

test('Treppe wird in 3D als Group mit Children gerendert', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(2000);

  // Add a stairs object in JS (no UI-Click — pragmatisch für Smoke).
  const result = await page.evaluate(() => {
    const w = window as unknown as {
      addObject?: (cfg: unknown) => void;
      rebuild3D?: () => void;
      scene?: { children: Array<{ children?: unknown[]; userData?: { type?: string } }> };
    };
    if (typeof w.addObject !== 'function') return { error: 'addObject nicht verfügbar' };
    w.addObject({
      typeId: 'stairs-straight-standard',
      type: 'stairs',
      x: 1,
      y: 1,
      w: 1.2,
      d: 4.76,
      h: 3.06,
      stairsConfig: {
        shape: 'straight',
        stepHeight: 0.18,
        stepDepth: 0.28,
        stepCount: 17,
        withRailing: true,
      },
    });
    if (typeof w.rebuild3D === 'function') w.rebuild3D();
    // Such nach Stairs-Group in scene
    const stairs = w.scene?.children.filter((c) => c.userData?.type === 'stairs');
    return {
      sceneChildren: w.scene?.children.length ?? 0,
      stairsFound: stairs?.length ?? 0,
      stairsHasMesh: stairs?.[0] && (stairs[0].children?.length ?? 0) > 0,
    };
  });
  console.log('[smoke] stairs render:', JSON.stringify(result));

  // build3DObj wraps das Stairs-Mesh in eine outer Group; userData.type === 'stairs'
  // ist auf der buildStairsMesh-Group, die ein Child der outer Group ist.
  // Daher prüfen wir die Outer-Group-Children mit nested userData.
  const meshFound = await page.evaluate(() => {
    const w = window as unknown as {
      scene?: { children: Array<{ children?: Array<{ userData?: { type?: string } }>; userData?: { type?: string } }> };
    };
    let found = 0;
    w.scene?.children.forEach((parent) => {
      // Prüfe direkt den Group oder verschachtelte Gruppen
      if (parent.userData?.type === 'stairs') found++;
      parent.children?.forEach((child) => {
        if (child.userData?.type === 'stairs') found++;
      });
    });
    return found;
  });
  console.log('[smoke] stairs-mesh count:', meshFound);

  expect(meshFound, 'Treppe sollte als Mesh in der Szene sichtbar sein').toBeGreaterThan(0);
});
