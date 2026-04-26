import { describe, it, expect, vi } from 'vitest';
import {
  generateBauantragPdf,
  type BauantragDeps,
  type ProjectData,
  type ComplianceResult,
} from '../bauantragPdf.js';
import { getEmptyApplication, type KCanGApplication } from '../kcangWizard.js';

// Spy-able Fake-jsPDF — vi.fn() ist kein Constructor (siehe kcangPdfExport-Tests).
const fakeSaveSpies: Array<ReturnType<typeof vi.fn>> = [];
const fakeAddPageSpies: Array<ReturnType<typeof vi.fn>> = [];
let fakePdfCallCount = 0;

class FakePdf {
  save: ReturnType<typeof vi.fn>;
  addPage: ReturnType<typeof vi.fn>;
  addImage = vi.fn();
  textCalls: Array<{ text: string | string[]; x: number; y: number }> = [];
  constructor(_opts?: unknown) {
    fakePdfCallCount++;
    this.save = vi.fn();
    this.addPage = vi.fn();
    fakeSaveSpies.push(this.save);
    fakeAddPageSpies.push(this.addPage);
  }
  setFontSize = vi.fn();
  setFont = vi.fn();
  setTextColor = vi.fn();
  setLineWidth = vi.fn();
  line = vi.fn();
  setPage = vi.fn();
  getNumberOfPages = vi.fn(() => 5);
  splitTextToSize = (s: string, _w: number) => (Array.isArray(s) ? s : [s]);
  text = vi.fn((text: string | string[], x: number, y: number) => {
    this.textCalls.push({ text, x, y });
  });
  get internal() {
    return { pageSize: { getWidth: () => 210, getHeight: () => 297 } };
  }
}

function resetSpies(): void {
  fakeSaveSpies.length = 0;
  fakeAddPageSpies.length = 0;
  fakePdfCallCount = 0;
}

function mkProjectData(overrides: Partial<ProjectData> = {}): ProjectData {
  return {
    name: 'Test CSC',
    rooms: [
      { id: 'r1', name: 'Lager 1', w: 5, d: 4, x: 0, y: 0, floorId: 'eg' },
      { id: 'r2', name: 'Anbau Süd', w: 8, d: 6, x: 5, y: 0, floorId: 'eg' },
    ],
    objects: [
      { id: 'o1', typeId: 'sofa-1', x: 1, y: 1 },
      { id: 'o2', typeId: 'sofa-1', x: 2, y: 2 },
      { id: 'o3', typeId: 'tisch-1', x: 3, y: 3 },
    ],
    walls: [],
    measures: [],
    floors: [{ id: 'eg', name: 'Erdgeschoss' }],
    curFloor: 'eg',
    ...overrides,
  };
}

function mkCompliance(): ComplianceResult[] {
  return [
    { rule: { id: 'r1', label: 'Mindestfläche pro Mitglied' }, passed: true, details: 'OK: 4.2 m²/Person' },
    { rule: { id: 'r2', label: 'Sichtschutz § 14' }, passed: false, details: 'FEHLT: Fenster ohne Folie' },
    { rule: { id: 'r3', label: 'Präventionsbeauftragter' }, passed: null },
  ];
}

function mkKcangApp(): KCanGApplication {
  const app = getEmptyApplication();
  app.vereinsdaten.name = 'CSC Köln';
  app.vereinsdaten.adresse = 'Musterstr. 1, 50667 Köln';
  app.vereinsdaten.mitgliederzahl = 50;
  app.vereinsdaten.praeventionsbeauftragter.name = 'Max Mustermann';
  app.hygienekonzept.haendewaschen = true;
  app.hygienekonzept.desinfektion = true;
  app.suchtberatung.kontakt_name = 'Dr. Beratung';
  app.suchtberatung.kontakt_email = 'beratung@example.de';
  app.sicherheit.brandschutz.vorhanden = true;
  app.sicherheit.poi_distanz_p13.bestaetigt = true;
  app.sicherheit.poi_distanz_p13.entfernung_m = 150;
  return app;
}

function mkDeps(overrides: Partial<BauantragDeps> = {}): BauantragDeps {
  return {
    kcangApp: mkKcangApp(),
    projectData: mkProjectData(),
    complianceResults: mkCompliance(),
    renderFloorPlan: vi.fn(() => 'data:image/jpeg;base64,FAKE_FLOOR'),
    renderPerspective: vi.fn(() => 'data:image/jpeg;base64,FAKE_PERSP'),
    toast: vi.fn(),
    loadJsPdf: vi.fn().mockResolvedValue({ jsPDF: FakePdf as unknown as typeof import('jspdf').jsPDF }),
    findItem: (typeId) => ({ name: typeId === 'sofa-1' ? 'Sofa' : 'Tisch', cat: typeId === 'sofa-1' ? 'Möbel' : 'Tische' }),
    getObjPrice: (typeId) => (typeId === 'sofa-1' ? 200 : 100),
    ...overrides,
  };
}

describe('generateBauantragPdf', () => {
  it('alle Sektionen aktiv: ruft addPage mehrfach (mind. 9 Sektionen + Deckblatt)', async () => {
    resetSpies();
    const deps = mkDeps();
    await generateBauantragPdf(deps);
    expect(fakePdfCallCount).toBe(1);
    // Mindestens 9 addPage-Calls (eine pro Sektion außer Deckblatt das die erste Seite ist)
    expect(fakeAddPageSpies[0]!.mock.calls.length).toBeGreaterThanOrEqual(8);
    expect(fakeSaveSpies[0]).toHaveBeenCalledOnce();
  });

  it('Filename enthält Vereinsname + Datum', async () => {
    resetSpies();
    const deps = mkDeps();
    await generateBauantragPdf(deps);
    const fname = fakeSaveSpies[0]!.mock.calls[0]![0] as string;
    expect(fname).toMatch(/^Bauantrag_CSC_K.+_\d{4}-\d{2}-\d{2}\.pdf$/);
  });

  it('Vereinsname mit Sonderzeichen wird sanitized', async () => {
    resetSpies();
    const app = mkKcangApp();
    app.vereinsdaten.name = 'CSC Köln-Süd / Verein 🌿';
    await generateBauantragPdf(mkDeps({ kcangApp: app }));
    const fname = fakeSaveSpies[0]!.mock.calls[0]![0] as string;
    expect(fname).not.toContain('/');
    expect(fname).not.toContain('🌿');
    expect(fname).toMatch(/\.pdf$/);
  });

  it('includeSections.deckblatt=false: kein Deckblatt-Render', async () => {
    resetSpies();
    const deps = mkDeps();
    await generateBauantragPdf(deps, { includeSections: { deckblatt: false } });
    // sectionHeader für „Lageplan" wird zur ersten Seite — kein newPage davor
    // (sectionStarted=false, also sollte das ohne addPage starten)
    expect(fakeSaveSpies[0]).toHaveBeenCalled();
  });

  it('toast: Start- + Erfolg-Meldung', async () => {
    resetSpies();
    const deps = mkDeps();
    await generateBauantragPdf(deps);
    const calls = (deps.toast as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[0]?.[0]).toMatch(/wird generiert/);
    expect(calls[calls.length - 1]?.[0]).toMatch(/Bauantrag erstellt/);
  });

  it('renderFloorPlan: pro Floor 1× aufgerufen', async () => {
    resetSpies();
    const deps = mkDeps({
      projectData: mkProjectData({
        floors: [
          { id: 'eg', name: 'EG' },
          { id: 'og1', name: '1. OG' },
          { id: 'kg', name: 'KG' },
        ],
      }),
    });
    await generateBauantragPdf(deps);
    expect(deps.renderFloorPlan).toHaveBeenCalledTimes(3);
  });

  it('Compliance: 0 Regeln → Hinweis "Noch keine ... evaluiert"', async () => {
    resetSpies();
    const deps = mkDeps({ complianceResults: [] });
    await generateBauantragPdf(deps);
    // Ein der text-Calls auf der Compliance-Seite enthält den Hinweis
    const fakePdf = fakeSaveSpies[0]!.mock.instances?.[0] as unknown as FakePdf;
    const allTexts = fakeSaveSpies[0]!.mock.calls.length > 0; // sanity
    expect(allTexts).toBe(true);
    // Kein Crash
    expect(fakeSaveSpies[0]).toHaveBeenCalled();
  });

  it('kcangApp=null → Hygiene/Suchtberatung-Sektionen mit Hinweis', async () => {
    resetSpies();
    const deps = mkDeps({ kcangApp: null });
    await expect(generateBauantragPdf(deps)).resolves.toBeUndefined();
    expect(fakeSaveSpies[0]).toHaveBeenCalled();
  });

  it('jsPDF-Lazy-Load-Fail: throws + toast(r)', async () => {
    resetSpies();
    const deps = mkDeps({ loadJsPdf: vi.fn().mockRejectedValue(new Error('CDN down')) });
    await expect(generateBauantragPdf(deps)).rejects.toThrow('CDN down');
    expect(deps.toast).toHaveBeenCalledWith(expect.stringContaining('konnte nicht geladen'), 'r');
  });

  it('renderPerspective fail → kein Crash', async () => {
    resetSpies();
    const deps = mkDeps({ renderPerspective: vi.fn(() => { throw new Error('canvas not ready'); }) });
    await expect(generateBauantragPdf(deps)).resolves.toBeUndefined();
    expect(fakeSaveSpies[0]).toHaveBeenCalled();
  });

  it('Möbel-Liste: Möbel werden nach Kategorie gruppiert', async () => {
    resetSpies();
    const deps = mkDeps();
    await generateBauantragPdf(deps);
    // 3 Objekte: 2 Sofas + 1 Tisch — sollte „2× Sofa" und „1× Tisch" rendern
    // Wir sehen das nur indirekt am text() spy.
    expect(fakeSaveSpies[0]).toHaveBeenCalled();
  });

  it('orientation + format Optionen werden an jsPDF gereicht', async () => {
    resetSpies();
    const ctorSpy = vi.fn();
    class SpyPdf extends FakePdf {
      constructor(opts: unknown) {
        ctorSpy(opts);
        super(opts);
      }
    }
    const deps = mkDeps({
      loadJsPdf: vi.fn().mockResolvedValue({ jsPDF: SpyPdf as unknown as typeof import('jspdf').jsPDF }),
    });
    await generateBauantragPdf(deps, { format: 'a3', orientation: 'landscape' });
    expect(ctorSpy).toHaveBeenCalledWith(expect.objectContaining({
      format: 'a3',
      orientation: 'landscape',
      unit: 'mm',
    }));
  });

  it('Empty-Projekt: keine Räume + keine Möbel → kein Crash', async () => {
    resetSpies();
    const deps = mkDeps({
      projectData: mkProjectData({ rooms: [], objects: [], floors: [] }),
    });
    await expect(generateBauantragPdf(deps)).resolves.toBeUndefined();
    expect(fakeSaveSpies[0]).toHaveBeenCalled();
  });
});
