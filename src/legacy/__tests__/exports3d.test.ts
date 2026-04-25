import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportGLTF, exportDXF, type ExportGLTFDeps, type ExportDXFDeps } from '../exports3d.js';
import type { CompletedRoom, SceneObject } from '../types.js';
import type { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// Capture Blob constructor + a.click for download tests
function captureBlob(): { content: string } {
  const result = { content: '' };
  const origBlob = window.Blob;
  const SpyBlob = function SpyBlob(this: Blob, parts: BlobPart[], opts?: BlobPropertyBag) {
    result.content = parts.map((p) => String(p)).join('');
    return new origBlob(parts, opts);
  } as unknown as typeof Blob;
  SpyBlob.prototype = origBlob.prototype;
  window.Blob = SpyBlob;
  return result;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('exportGLTF', () => {
  it('scene=null: toast(r), kein parse', async () => {
    const ExporterClass = vi.fn();
    const deps: ExportGLTFDeps = {
      scene: null,
      projName: 'X',
      toast: vi.fn(),
      ExporterClass: ExporterClass as unknown as typeof GLTFExporter,
    };
    await exportGLTF(deps);
    expect(deps.toast).toHaveBeenCalledWith('Szene nicht bereit', 'r');
    expect(ExporterClass).not.toHaveBeenCalled();
  });

  it('happy: parse-success → toast(g) + Download triggered', async () => {
    captureBlob();
    const parse = vi.fn((_scene, onSuccess) => onSuccess({ asset: { version: '2.0' } }));
    class FakeExporter {
      parse = parse;
    }
    const toast = vi.fn();
    const deps: ExportGLTFDeps = {
      scene: {} as unknown as Parameters<typeof exportGLTF>[0]['scene'],
      projName: 'My Project',
      toast,
      ExporterClass: FakeExporter as unknown as typeof GLTFExporter,
    };
    await exportGLTF(deps);
    expect(parse).toHaveBeenCalledOnce();
    expect(toast).toHaveBeenCalledWith('⏳ GLTF wird erstellt…', 'b');
    expect(toast).toHaveBeenCalledWith('✅ GLTF exportiert!', 'g');
  });

  it('parse-error → toast(r), aber promise resolves', async () => {
    const parse = vi.fn((_scene, _onSuccess, onError) => onError(new Error('GLTF_FAIL')));
    class FakeExporter {
      parse = parse;
    }
    const toast = vi.fn();
    await exportGLTF({
      scene: {} as unknown as Parameters<typeof exportGLTF>[0]['scene'],
      projName: 'X',
      toast,
      ExporterClass: FakeExporter as unknown as typeof GLTFExporter,
    });
    expect(toast).toHaveBeenCalledWith(expect.stringContaining('GLTF_FAIL'), 'r');
  });
});

describe('exportDXF', () => {
  const room = (id: string, x: number, y: number, w: number, d: number): CompletedRoom => ({
    id,
    name: 'R-' + id,
    x,
    y,
    w,
    d,
    floorId: 'eg',
  });
  const baseDeps = (overrides: Partial<ExportDXFDeps> = {}): ExportDXFDeps => ({
    rooms: [],
    objects: [],
    walls: [],
    measures: [],
    projName: 'Test',
    findItem: () => null,
    toast: vi.fn(),
    ...overrides,
  });

  it('Header + alle 5 Layer + EOF', () => {
    const captured = captureBlob();
    exportDXF(baseDeps({ rooms: [room('r1', 0, 0, 5, 4)] }));
    expect(captured.content).toContain('$ACADVER');
    expect(captured.content).toContain('AC1015');
    expect(captured.content).toContain('ROOMS');
    expect(captured.content).toContain('GROUNDS');
    expect(captured.content).toContain('OBJECTS');
    expect(captured.content).toContain('FREE_WALLS');
    expect(captured.content).toContain('MEASURES');
    expect(captured.content).toMatch(/EOF\n?$/);
  });

  it('Räume als LWPOLYLINE + TEXT', () => {
    const captured = captureBlob();
    exportDXF(baseDeps({ rooms: [room('r1', 1, 2, 3, 4)] }));
    expect(captured.content).toContain('LWPOLYLINE');
    expect(captured.content).toContain('R-r1');
  });

  it('Walls als LINE', () => {
    const captured = captureBlob();
    exportDXF(baseDeps({ walls: [{ x1: 0, z1: 0, x2: 5, z2: 0 }] }));
    expect(captured.content).toContain('LINE\n8\nFREE_WALLS');
  });

  it('Objects rotated: 4 corners + TEXT mit ASCII-only-name', () => {
    const captured = captureBlob();
    exportDXF(
      baseDeps({
        objects: [{ typeId: 'sofa', x: 5, y: 5, w: 2, d: 1, rot: 45 }] as unknown as SceneObject[],
        findItem: () => ({ name: 'Sofa "Premium" 🛋️' }),
      }),
    );
    expect(captured.content).toContain('LWPOLYLINE\n8\nOBJECTS');
    // Emoji + Quotes sollten aus dem TEXT entfernt sein (ASCII-only)
    expect(captured.content).not.toContain('🛋');
  });

  it('Measures mit Distance-Label', () => {
    const captured = captureBlob();
    exportDXF(baseDeps({ measures: [{ ax: 0, ay: 0, bx: 3, by: 4 }] }));
    expect(captured.content).toContain('LINE\n8\nMEASURES');
    expect(captured.content).toContain('5.00 m'); // sqrt(9+16) = 5
  });

  it('Filename sanitized aus projName', () => {
    captureBlob();
    let downloadName = '';
    const orig = document.createElement.bind(document);
    document.createElement = ((tag: string) => {
      const el = orig(tag) as HTMLElement;
      if (tag === 'a') (el as HTMLAnchorElement).click = () => {
        downloadName = (el as HTMLAnchorElement).download;
      };
      return el;
    }) as typeof document.createElement;
    try {
      exportDXF(baseDeps({ projName: 'Mein Projekt — #1', rooms: [room('a', 0, 0, 1, 1)] }));
      expect(downloadName).toMatch(/Mein_Projekt.*\.dxf$/);
    } finally {
      document.createElement = orig;
    }
  });
});
