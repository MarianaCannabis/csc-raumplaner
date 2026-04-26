import { describe, it, expect, vi } from 'vitest';
import { exportApplicationAsPdf, type PdfExportDeps } from '../kcangPdfExport.js';
import { getEmptyApplication, type KCanGApplication } from '../kcangWizard.js';

function fullApp(): KCanGApplication {
  const app = getEmptyApplication();
  app.vereinsdaten.name = 'Test CSC';
  app.vereinsdaten.adresse = 'Musterstr. 1';
  app.vereinsdaten.mitgliederzahl = 30;
  app.raeume.push({ name: 'Anbau', flaeche_m2: 20, typ: 'anbau' });
  app.compliance.status = { 'r1': 'passed', 'r2': 'failed' };
  app.suchtberatung.kontakt_name = 'Beratung';
  return app;
}

// Spy-able Fake-jsPDF-Klasse — vi.fn() ist kein Constructor, daher echte
// class-Definition mit Spy-Methoden je Instanz.
const fakeSaveSpies: Array<ReturnType<typeof vi.fn>> = [];
let fakePdfCallCount = 0;
class FakePdf {
  save: ReturnType<typeof vi.fn>;
  constructor(_opts?: unknown) {
    fakePdfCallCount++;
    this.save = vi.fn();
    fakeSaveSpies.push(this.save);
  }
  setFontSize() {}
  setFont() {}
  text() {}
  addPage() {}
  setPage() {}
  setTextColor() {}
  getNumberOfPages() { return 1; }
  splitTextToSize(s: string) { return [s]; }
  get internal() {
    return { pageSize: { getWidth: () => 210, getHeight: () => 297 } };
  }
}

function resetPdfSpies(): void {
  fakeSaveSpies.length = 0;
  fakePdfCallCount = 0;
}

describe('exportApplicationAsPdf', () => {
  it('preferJsPdf=true: ruft loadJsPdf + jsPDF-save', async () => {
    resetPdfSpies();
    const loadJsPdf = vi
      .fn()
      .mockResolvedValue({ jsPDF: FakePdf as unknown as typeof import('jspdf').jsPDF });
    const toast = vi.fn();
    await exportApplicationAsPdf(fullApp(), { loadJsPdf, toast });
    expect(loadJsPdf).toHaveBeenCalledOnce();
    expect(fakePdfCallCount).toBe(1);
    expect(fakeSaveSpies[0]).toHaveBeenCalledOnce();
    const fname = fakeSaveSpies[0]!.mock.calls[0]![0] as string;
    expect(fname).toMatch(/^KCanG-Antrag-Test_CSC.*\.pdf$/);
  });

  it('toast-Sequence: "wird geladen" → "PDF erstellt"', async () => {
    resetPdfSpies();
    const loadJsPdf = vi
      .fn()
      .mockResolvedValue({ jsPDF: FakePdf as unknown as typeof import('jspdf').jsPDF });
    const toast = vi.fn();
    await exportApplicationAsPdf(fullApp(), { loadJsPdf, toast });
    expect(toast).toHaveBeenCalledWith(expect.stringMatching(/wird geladen/), 'b');
    expect(toast).toHaveBeenCalledWith(expect.stringMatching(/PDF erstellt/), 'g');
  });

  it('jsPDF-Lazy-Load-Fail: fallback auf printFallback', async () => {
    const loadJsPdf = vi.fn().mockRejectedValue(new Error('module-not-found'));
    const printFallback = vi.fn();
    const toast = vi.fn();
    await exportApplicationAsPdf(fullApp(), { loadJsPdf, printFallback, toast });
    expect(loadJsPdf).toHaveBeenCalledOnce();
    expect(printFallback).toHaveBeenCalledOnce();
    expect(toast).toHaveBeenCalledWith(expect.stringMatching(/Browser-Print/), 'b');
  });

  it('preferJsPdf=false: direkt browser-print', async () => {
    const loadJsPdf = vi.fn();
    const printFallback = vi.fn();
    await exportApplicationAsPdf(fullApp(), { preferJsPdf: false, loadJsPdf, printFallback });
    expect(loadJsPdf).not.toHaveBeenCalled();
    expect(printFallback).toHaveBeenCalledOnce();
  });

  it('Filename sanitized aus Vereinsname', async () => {
    resetPdfSpies();
    const loadJsPdf = vi
      .fn()
      .mockResolvedValue({ jsPDF: FakePdf as unknown as typeof import('jspdf').jsPDF });
    const app = fullApp();
    app.vereinsdaten.name = 'CSC Köln-Süd / Verein 🌿';
    await exportApplicationAsPdf(app, { loadJsPdf });
    const fname = fakeSaveSpies[0]!.mock.calls[0]![0] as string;
    // Sonderzeichen / Slashes / Emojis entfernt
    expect(fname).not.toContain('/');
    expect(fname).not.toContain('🌿');
    expect(fname).toMatch(/\.pdf$/);
  });
});
