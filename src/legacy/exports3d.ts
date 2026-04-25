/**
 * P17.12 — 3D-Exports (GLTF + DXF) extrahiert aus index.html:11118-11225.
 *
 * Section A — exportGLTF (async): nutzt GLTFExporter aus three/examples.
 *   Pfad B (Sub-Task 1): GLTFExporter wird NICHT mehr direkt importiert,
 *   sondern als `ExporterClass` über deps gereicht. main.ts lädt das Modul
 *   lazy beim ersten Click (window.cscLoadGLTFExporter), spart ~−10 KB gz
 *   im Initial-Bundle. Async wegen GLTFExporter.parse-Callback-Pattern.
 *
 * Section B — exportDXF (sync): Custom-DXF-Generator (5 Layers,
 *   AC1015-Kompatibilität). Pure String-Concat + Math, keine async.
 */

import type { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type * as THREE from 'three';
import type { CompletedRoom, SceneObject } from './types.js';

// ── Shared types ─────────────────────────────────────────────────────

interface CatalogItemView {
  cat?: string;
  name?: string;
  w?: number;
  d?: number;
  h?: number;
}

interface Wall {
  x1: number;
  z1: number;
  x2: number;
  z2: number;
}

interface Measure {
  ax: number;
  ay: number;
  bx: number;
  by: number;
}

interface Ground {
  x: number;
  y: number;
  w: number;
  d: number;
}

// ── Section A: GLTF ──────────────────────────────────────────────────

export interface ExportGLTFDeps {
  scene: THREE.Scene | null;
  projName: string;
  toast: (msg: string, type?: string) => void;
  /** GLTFExporter-Klasse — nach Pfad-B Sub-Task 1 immer Pflicht: main.ts
   *  reicht sie via lazy-loader ein, Tests injizieren ein FakeExporter. */
  ExporterClass: typeof GLTFExporter;
}

export async function exportGLTF(deps: ExportGLTFDeps): Promise<void> {
  if (!deps.scene) {
    deps.toast('Szene nicht bereit', 'r');
    return;
  }
  deps.toast('⏳ GLTF wird erstellt…', 'b');
  const exporter = new deps.ExporterClass();
  return new Promise<void>((resolve) => {
    exporter.parse(
      deps.scene as THREE.Scene,
      (gltf) => {
        const str = JSON.stringify(gltf);
        const blob = new Blob([str], { type: 'application/json' });
        const a = Object.assign(document.createElement('a'), {
          href: URL.createObjectURL(blob),
          download: deps.projName.replace(/[^a-z0-9]/gi, '_') + '.gltf',
        });
        a.click();
        deps.toast('✅ GLTF exportiert!', 'g');
        resolve();
      },
      (err) => {
        const msg = (err as unknown as { message?: string })?.message || String(err);
        deps.toast('GLTF-Fehler: ' + msg, 'r');
        resolve();
      },
      { binary: false } as { binary: boolean },
    );
  });
}

// ── Section B: DXF ───────────────────────────────────────────────────

export interface ExportDXFDeps {
  rooms: CompletedRoom[];
  objects: SceneObject[];
  walls: Wall[];
  measures: Measure[];
  grounds?: Ground[];
  projName: string;
  findItem: (typeId: string) => CatalogItemView | null | undefined;
  toast: (msg: string, type?: string) => void;
}

export function exportDXF(deps: ExportDXFDeps): void {
  const layers = [
    { name: 'ROOMS', color: 5 },
    { name: 'GROUNDS', color: 3 },
    { name: 'OBJECTS', color: 7 },
    { name: 'FREE_WALLS', color: 8 },
    { name: 'MEASURES', color: 2 },
  ];
  let dxf = '0\nSECTION\n2\nHEADER\n9\n$ACADVER\n1\nAC1015\n0\nENDSEC\n';
  dxf += '0\nSECTION\n2\nTABLES\n0\nTABLE\n2\nLAYER\n';
  layers.forEach((l) => {
    dxf += '0\nLAYER\n2\n' + l.name + '\n70\n0\n62\n' + l.color + '\n6\nCONTINUOUS\n';
  });
  dxf += '0\nENDTAB\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n';

  const lwpolyRect = (x1: number, y1: number, x2: number, y2: number, layer: string): string => {
    return (
      '0\nLWPOLYLINE\n8\n' +
      layer +
      '\n90\n4\n70\n1\n' +
      '10\n' + x1 + '\n20\n' + y1 + '\n' +
      '10\n' + x2 + '\n20\n' + y1 + '\n' +
      '10\n' + x2 + '\n20\n' + y2 + '\n' +
      '10\n' + x1 + '\n20\n' + y2 + '\n'
    );
  };

  // Räume
  deps.rooms.forEach((r) => {
    dxf += lwpolyRect(r.x, r.y, r.x + r.w, r.y + r.d, 'ROOMS');
    const cx = (r.x + r.w / 2).toFixed(3);
    const cy = (r.y + r.d / 2).toFixed(3);
    dxf +=
      '0\nTEXT\n8\nROOMS\n10\n' + cx + '\n20\n' + cy + '\n40\n0.25\n1\n' + (r.name || 'Raum') + '\n';
  });

  // Grounds (optional)
  if (deps.grounds) {
    deps.grounds.forEach((g) => {
      dxf += lwpolyRect(g.x, g.y, g.x + g.w, g.y + g.d, 'GROUNDS');
    });
  }

  // Walls
  deps.walls.forEach((w) => {
    dxf +=
      '0\nLINE\n8\nFREE_WALLS\n' +
      '10\n' + w.x1 + '\n20\n' + w.z1 + '\n30\n0\n' +
      '11\n' + w.x2 + '\n21\n' + w.z2 + '\n31\n0\n';
  });

  // Objects
  deps.objects.forEach((o) => {
    const it = deps.findItem(o.typeId) || {};
    const oo = o as { w?: number; d?: number; x?: number; y?: number; rot?: number };
    const w = oo.w || it.w || 1;
    const d = oo.d || it.d || 1;
    const cx = (oo.x ?? 0) + w / 2;
    const cy = (oo.y ?? 0) + d / 2;
    const rot = ((oo.rot || 0) * Math.PI) / 180;
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const corners = [
      [-w / 2, -d / 2],
      [w / 2, -d / 2],
      [w / 2, d / 2],
      [-w / 2, d / 2],
    ].map(([lx, ly]) => ({
      x: cx + lx! * cos - ly! * sin,
      y: cy + lx! * sin + ly! * cos,
    }));
    dxf += '0\nLWPOLYLINE\n8\nOBJECTS\n90\n4\n70\n1\n';
    corners.forEach((c) => {
      dxf += '10\n' + c.x.toFixed(3) + '\n20\n' + c.y.toFixed(3) + '\n';
    });
    dxf +=
      '0\nTEXT\n8\nOBJECTS\n10\n' +
      cx.toFixed(3) +
      '\n20\n' +
      cy.toFixed(3) +
      '\n40\n0.15\n1\n' +
      (it.name || o.typeId).replace(/[^\x20-\x7E]/g, '') +
      '\n';
  });

  // Measures
  deps.measures.forEach((m) => {
    dxf +=
      '0\nLINE\n8\nMEASURES\n' +
      '10\n' + m.ax + '\n20\n' + m.ay + '\n30\n0\n' +
      '11\n' + m.bx + '\n21\n' + m.by + '\n31\n0\n';
    const dist = Math.hypot(m.bx - m.ax, m.by - m.ay);
    const mx = (m.ax + m.bx) / 2;
    const my = (m.ay + m.by) / 2;
    dxf +=
      '0\nTEXT\n8\nMEASURES\n10\n' +
      mx.toFixed(3) +
      '\n20\n' +
      my.toFixed(3) +
      '\n40\n0.2\n1\n' +
      dist.toFixed(2) +
      ' m\n';
  });

  dxf += '0\nENDSEC\n0\nEOF\n';
  const blob = new Blob([dxf], { type: 'application/dxf' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: deps.projName.replace(/[^a-z0-9]/gi, '_') + '.dxf',
  });
  a.click();
  deps.toast('📐 DXF exportiert (5 Layers: ROOMS/GROUNDS/OBJECTS/FREE_WALLS/MEASURES)', 'g');
}
