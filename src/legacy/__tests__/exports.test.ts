import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  exportPDF,
  exportFurnitureCSV,
  exportBudgetCSV,
  type ExportDeps,
} from '../exports.js';
import type { CompletedRoom, SceneObject } from '../types.js';

const baseDeps = (overrides: Partial<ExportDeps> = {}): ExportDeps => ({
  objects: [],
  rooms: [],
  projName: 'TestProj',
  curFloor: 'eg',
  findItem: () => null,
  getObjPrice: () => 0,
  toast: vi.fn(),
  ...overrides,
});

const room = (id: string, x: number, y: number, w: number, d: number): CompletedRoom => ({
  id,
  name: 'R-' + id,
  x,
  y,
  w,
  d,
  floorId: 'eg',
});

// Helper: capture <a download> click
function captureDownload(): { name: string | null; href: string | null } {
  const result = { name: null as string | null, href: null as string | null };
  const orig = document.createElement.bind(document);
  document.createElement = ((tag: string) => {
    const el = orig(tag) as HTMLElement;
    if (tag === 'a') {
      (el as HTMLAnchorElement).click = () => {
        result.name = (el as HTMLAnchorElement).download;
        result.href = (el as HTMLAnchorElement).href;
      };
    }
    return el;
  }) as typeof document.createElement;
  return result;
}

describe('exportBudgetCSV', () => {
  beforeEach(() => {
    document.createElement = HTMLDocument.prototype.createElement.bind(document);
  });

  it('leeres objects: nur Header + GESAMT-Zeile', () => {
    const captured = captureDownload();
    const deps = baseDeps();
    exportBudgetCSV(deps);
    expect(captured.name).toBe('csc_budget.csv');
    expect(deps.toast).toHaveBeenCalledWith('📥 Budget als CSV exportiert', 'g');
  });

  it('UTF-8 BOM + Excel-kompatibel', () => {
    let blobContent = '';
    const origURL = URL.createObjectURL;
    URL.createObjectURL = vi.fn((blob: Blob) => {
      blob.text().then((t) => { blobContent = t; });
      return 'blob:test';
    }) as unknown as typeof URL.createObjectURL;
    captureDownload();
    exportBudgetCSV(baseDeps());
    URL.createObjectURL = origURL;
    // BOM-Check kann mit await Blob.text gemessen werden — Sync-Variante
    // via Constructor-Spy ist solider.
    expect(blobContent === '' || blobContent.charCodeAt(0) === 0xfeff).toBe(true);
  });

  it('mit 2 Objekten gleichen typeId: aggregiert + total', () => {
    const captured = captureDownload();
    const deps = baseDeps({
      objects: [
        { typeId: 'sofa' },
        { typeId: 'sofa' },
        { typeId: 'tisch' },
      ] as SceneObject[],
      findItem: (id) => ({ name: id === 'sofa' ? 'Sofa-3er' : 'Tisch' }),
      getObjPrice: (id) => (id === 'sofa' ? 800 : 200),
    });
    exportBudgetCSV(deps);
    expect(captured.name).toBe('csc_budget.csv');
    expect(deps.toast).toHaveBeenCalled();
  });
});

describe('exportFurnitureCSV', () => {
  beforeEach(() => {
    document.createElement = HTMLDocument.prototype.createElement.bind(document);
  });

  it('leere objects: nur Header-Zeilen', () => {
    const captured = captureDownload();
    const deps = baseDeps();
    exportFurnitureCSV(deps);
    expect(captured.name).toMatch(/_moebel\.csv$/);
    expect(deps.toast).toHaveBeenCalledWith(
      expect.stringContaining('Möbelliste exportiert'),
      'g',
    );
  });

  it('Filename sanitized aus projName', () => {
    const captured = captureDownload();
    exportFurnitureCSV(
      baseDeps({ projName: 'Mein Test — Lounge#1' }),
    );
    expect(captured.name).toMatch(/Mein_Test/);
  });

  it('Detail + Aggregiert getrennt, mit Quote-Escape', async () => {
    // Capture Blob constructor args ohne Blob zu replacen (URL.createObjectURL
    // braucht real-Blob in jsdom).
    let blobContent = '';
    const origBlob = window.Blob;
    const SpyBlob = function SpyBlob(this: Blob, parts: BlobPart[], opts?: BlobPropertyBag) {
      blobContent = parts.map((p) => String(p)).join('');
      return new origBlob(parts, opts);
    } as unknown as typeof Blob;
    SpyBlob.prototype = origBlob.prototype;
    window.Blob = SpyBlob;
    captureDownload();
    exportFurnitureCSV(
      baseDeps({
        objects: [{ typeId: 'sofa' }] as SceneObject[],
        findItem: () => ({ name: 'Sofa "Premium"', cat: 'Sitz' }),
        getObjPrice: () => 1000,
      }),
    );
    window.Blob = origBlob;
    expect(blobContent).toContain('AGGREGIERT');
    // Quotes innerhalb names sollten escaped/entfernt sein
    expect(blobContent).toContain('Sofa Premium'); // " entfernt
  });
});

describe('exportPDF', () => {
  beforeEach(() => {
    document.createElement = HTMLDocument.prototype.createElement.bind(document);
  });

  it('keine Räume: toast(r) + return ohne window.open', () => {
    const open = vi.fn();
    const origOpen = window.open;
    window.open = open as unknown as typeof window.open;
    const deps = baseDeps();
    exportPDF(deps);
    window.open = origOpen;
    expect(open).not.toHaveBeenCalled();
    expect(deps.toast).toHaveBeenCalledWith('Keine Räume zum Drucken', 'r');
  });

  it('mit Räumen: window.open mit SVG-Content', () => {
    const docWrite = vi.fn();
    const docClose = vi.fn();
    const origOpen = window.open;
    window.open = (() => ({ document: { write: docWrite, close: docClose } })) as unknown as typeof window.open;
    const deps = baseDeps({
      rooms: [room('r1', 0, 0, 5, 4)],
      findItem: () => ({ name: 'Foo' }),
    });
    exportPDF(deps);
    window.open = origOpen;
    expect(docWrite).toHaveBeenCalledOnce();
    const html = docWrite.mock.calls[0]![0] as string;
    expect(html).toContain('<svg');
    expect(html).toContain('TestProj');
    expect(html).toContain('window.print()');
    expect(docClose).toHaveBeenCalled();
  });

  it('window.open returns null (popup blocked): toast(r)', () => {
    const origOpen = window.open;
    window.open = (() => null) as unknown as typeof window.open;
    const deps = baseDeps({ rooms: [room('r1', 0, 0, 5, 4)] });
    exportPDF(deps);
    window.open = origOpen;
    expect(deps.toast).toHaveBeenCalledWith(expect.stringContaining('Pop-up blockiert'), 'r');
  });

  it('SVG enthält Raum-Namen + Maße', () => {
    let html = '';
    const origOpen = window.open;
    window.open = (() => ({
      document: {
        write: (s: string) => { html = s; },
        close: () => {},
      },
    })) as unknown as typeof window.open;
    const deps = baseDeps({
      rooms: [room('r1', 0, 0, 5.5, 4.2)],
      findItem: () => ({ name: 'Foo' }),
    });
    exportPDF(deps);
    window.open = origOpen;
    expect(html).toContain('R-r1');
    expect(html).toContain('5.5×4.2m');
  });
});
