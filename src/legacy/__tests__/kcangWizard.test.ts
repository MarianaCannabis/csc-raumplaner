import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getEmptyApplication,
  loadFromLocalStorage,
  saveToLocalStorage,
  validateApplication,
  autoImportFromProject,
  openWizardModal,
  closeWizardModal,
  setCloudSync,
  resetApplication,
  getCurrentState,
  _resetForTests,
  _setStateForTests,
  LS_KEY,
  type KCanGApplication,
  type KCanGWizardDeps,
} from '../kcangWizard.js';

const mkDeps = (overrides: Partial<KCanGWizardDeps> = {}): KCanGWizardDeps => ({
  toast: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  _resetForTests();
  localStorage.clear();
  // Wizard-Modal-DOM einmalig stub für openWizardModal-Tests
  document.body.innerHTML = `
    <div class="mdl-overlay" id="m-kcang-wizard" style="display:none">
      <main id="kcang-sections"></main>
      <input type="checkbox" id="kcang-cloud-sync">
    </div>
  `;
});

describe('getEmptyApplication', () => {
  it('liefert alle Felder mit Defaults', () => {
    const app = getEmptyApplication();
    expect(app.vereinsdaten.name).toBe('');
    expect(app.vereinsdaten.mitgliederzahl).toBe(0);
    expect(app.raeume).toEqual([]);
    expect(app.compliance.status).toEqual({});
    expect(app.hygienekonzept.haendewaschen).toBe(false);
    expect(app.suchtberatung.kontakt_name).toBe('');
    expect(app.sicherheit.brandschutz.vorhanden).toBe(false);
    expect(app.meta.cloud_sync).toBe(false);
    expect(app.meta.version).toBe(1);
  });
});

describe('localStorage roundtrip', () => {
  it('save → load returnt identische App', () => {
    const app = getEmptyApplication();
    app.vereinsdaten.name = 'Test CSC e.V.';
    saveToLocalStorage(app);
    const loaded = loadFromLocalStorage();
    expect(loaded?.vereinsdaten.name).toBe('Test CSC e.V.');
  });

  it('saveToLocalStorage updated geaendert_am', () => {
    const app = getEmptyApplication();
    // saveToLocalStorage überschreibt geaendert_am mit new Date().toISOString().
    // Setzen wir einen alten Stempel und prüfen dass er getauscht wird.
    app.meta.geaendert_am = '2020-01-01T00:00:00Z';
    saveToLocalStorage(app);
    const loaded = loadFromLocalStorage();
    expect(loaded!.meta.geaendert_am).not.toBe('2020-01-01T00:00:00Z');
  });

  it('load aus leerem localStorage: null', () => {
    expect(loadFromLocalStorage()).toBeNull();
  });

  it('load mit korruptem JSON: null statt throw', () => {
    localStorage.setItem(LS_KEY, '{not valid json');
    expect(loadFromLocalStorage()).toBeNull();
  });
});

describe('validateApplication', () => {
  it('leere App: alle Pflichtfelder fehlen', () => {
    const missing = validateApplication(getEmptyApplication());
    expect(missing).toContain('Vereinsname');
    expect(missing).toContain('Vereinsadresse');
    expect(missing).toContain('Mitgliederzahl');
    expect(missing).toContain('Präventionsbeauftragter (Name)');
    expect(missing).toContain('Mindestens ein Raum');
    expect(missing).toContain('Suchtberatung (Kontakt-Name)');
  });

  it('vollständige App: leere Liste', () => {
    const app = getEmptyApplication();
    app.vereinsdaten.name = 'CSC Köln';
    app.vereinsdaten.adresse = 'Musterstr. 1, 50667 Köln';
    app.vereinsdaten.mitgliederzahl = 50;
    app.vereinsdaten.praeventionsbeauftragter.name = 'Max Mustermann';
    app.raeume.push({ name: 'Anbau', flaeche_m2: 30, typ: 'anbau' });
    app.suchtberatung.kontakt_name = 'Dr. Beratung';
    expect(validateApplication(app)).toEqual([]);
  });

  it('Whitespace-only fields zählen als fehlend', () => {
    const app = getEmptyApplication();
    app.vereinsdaten.name = '   ';
    app.vereinsdaten.adresse = '\t\n';
    expect(validateApplication(app)).toContain('Vereinsname');
    expect(validateApplication(app)).toContain('Vereinsadresse');
  });
});

describe('autoImportFromProject', () => {
  it('importiert Räume aus Projekt mit Heuristik-Typ', () => {
    const app = getEmptyApplication();
    const deps = mkDeps({
      getCurrentProjectData: () => ({
        rooms: [
          { name: 'Anbau-Raum', w: 5, d: 4 },
          { name: 'Lager Süd', w: 3, d: 2 },
          { name: 'Ausgabetheke', w: 2, d: 1.5 },
        ],
      }),
    });
    const next = autoImportFromProject(app, deps);
    expect(next.raeume.length).toBe(3);
    expect(next.raeume[0]).toEqual({ name: 'Anbau-Raum', flaeche_m2: 20, typ: 'anbau' });
    expect(next.raeume[1]).toEqual({ name: 'Lager Süd', flaeche_m2: 6, typ: 'lager' });
    expect(next.raeume[2]).toEqual({ name: 'Ausgabetheke', flaeche_m2: 3, typ: 'ausgabe' });
  });

  it('importiert Compliance-Status aus Projekt', () => {
    const app = getEmptyApplication();
    const deps = mkDeps({
      getCurrentProjectData: () => ({
        compliance: [
          { id: 'rule-1', passed: true },
          { id: 'rule-2', passed: false },
        ],
      }),
    });
    const next = autoImportFromProject(app, deps);
    expect(next.compliance.status['rule-1']).toBe('passed');
    expect(next.compliance.status['rule-2']).toBe('failed');
  });

  it('idempotent: zweiter Import ergänzt nicht-existierende Räume nur', () => {
    const app = getEmptyApplication();
    app.raeume.push({ name: 'Manuell', flaeche_m2: 10, typ: 'sonstiges' });
    const deps = mkDeps({
      getCurrentProjectData: () => ({
        rooms: [
          { name: 'Manuell', w: 99, d: 99 }, // existiert schon → nicht überschreiben
          { name: 'Neu', w: 2, d: 3 },
        ],
      }),
    });
    const next = autoImportFromProject(app, deps);
    expect(next.raeume.length).toBe(2);
    expect(next.raeume[0]!.flaeche_m2).toBe(10); // unverändert
    expect(next.raeume[1]!.name).toBe('Neu');
  });

  it('ohne deps.getCurrentProjectData: returns app unverändert', () => {
    const app = getEmptyApplication();
    const next = autoImportFromProject(app, mkDeps());
    expect(next).toEqual(app);
  });
});

describe('openWizardModal', () => {
  it('öffnet das Modal + rendert Sektionen', () => {
    openWizardModal(mkDeps());
    const overlay = document.getElementById('m-kcang-wizard');
    expect(overlay!.style.display).toBe('flex');
    expect(overlay!.classList.contains('open')).toBe(true);
    const sections = document.getElementById('kcang-sections');
    expect(sections!.innerHTML).toContain('A. Vereinsdaten');
    expect(sections!.innerHTML).toContain('B. Räume');
    expect(sections!.innerHTML).toContain('G. Notizen');
  });

  it('lädt aus localStorage falls vorhanden', () => {
    const app = getEmptyApplication();
    app.vereinsdaten.name = 'Persistierter Verein';
    saveToLocalStorage(app);
    openWizardModal(mkDeps());
    expect(getCurrentState().vereinsdaten.name).toBe('Persistierter Verein');
    const sections = document.getElementById('kcang-sections')!.innerHTML;
    expect(sections).toContain('Persistierter Verein');
  });

  it('Auto-Import bei leerer App + getCurrentProjectData', () => {
    const deps = mkDeps({
      getCurrentProjectData: () => ({ rooms: [{ name: 'Lager', w: 4, d: 3 }] }),
    });
    openWizardModal(deps);
    expect(getCurrentState().raeume.length).toBe(1);
    expect(getCurrentState().raeume[0]!.name).toBe('Lager');
  });
});

describe('Input-Handler', () => {
  it('input event auf Vereinsname → state ändert sich', () => {
    openWizardModal(mkDeps());
    const input = document
      .querySelector<HTMLInputElement>('[data-kcang-path="vereinsdaten.name"]')!;
    input.value = 'Neuer Name';
    input.dispatchEvent(new Event('input'));
    expect(getCurrentState().vereinsdaten.name).toBe('Neuer Name');
  });

  it('change event auf checkbox → boolean update', () => {
    openWizardModal(mkDeps());
    const cb = document.querySelector<HTMLInputElement>(
      '[data-kcang-path="hygienekonzept.haendewaschen"]',
    )!;
    cb.checked = true;
    cb.dispatchEvent(new Event('change'));
    expect(getCurrentState().hygienekonzept.haendewaschen).toBe(true);
  });

  it('input number: Number()-Cast', () => {
    openWizardModal(mkDeps());
    const inp = document.querySelector<HTMLInputElement>(
      '[data-kcang-path="vereinsdaten.mitgliederzahl"]',
    )!;
    inp.value = '42';
    inp.dispatchEvent(new Event('input'));
    expect(getCurrentState().vereinsdaten.mitgliederzahl).toBe(42);
  });
});

describe('setCloudSync', () => {
  it('toggleOn: meta.cloud_sync=true + saveToCloud aufgerufen', async () => {
    const saveToCloud = vi.fn().mockResolvedValue(undefined);
    setCloudSync(true, mkDeps({ saveToCloud }));
    expect(getCurrentState().meta.cloud_sync).toBe(true);
    expect(saveToCloud).toHaveBeenCalledOnce();
  });

  it('toggleOff: meta.cloud_sync=false + saveToCloud NICHT aufgerufen', () => {
    const saveToCloud = vi.fn();
    setCloudSync(false, mkDeps({ saveToCloud }));
    expect(getCurrentState().meta.cloud_sync).toBe(false);
    expect(saveToCloud).not.toHaveBeenCalled();
  });
});

describe('resetApplication + closeWizardModal', () => {
  it('resetApplication: localStorage cleared + frische Default-State', () => {
    const app = getEmptyApplication();
    app.vereinsdaten.name = 'X';
    saveToLocalStorage(app);
    resetApplication();
    expect(localStorage.getItem(LS_KEY)).toBeNull();
    expect(getCurrentState().vereinsdaten.name).toBe('');
  });

  it('closeWizardModal: setzt display=none + entfernt open-class', () => {
    openWizardModal(mkDeps());
    closeWizardModal();
    const overlay = document.getElementById('m-kcang-wizard');
    expect(overlay!.style.display).toBe('none');
    expect(overlay!.classList.contains('open')).toBe(false);
  });
});

describe('Cloud-Sync via auto-save', () => {
  it('cloud_sync=true: Input-Change triggert saveToCloud (debounced)', async () => {
    const saveToCloud = vi.fn().mockResolvedValue(undefined);
    const app = getEmptyApplication();
    app.meta.cloud_sync = true;
    _setStateForTests(app);
    saveToLocalStorage(app);
    openWizardModal(mkDeps({ saveToCloud }));
    const input = document
      .querySelector<HTMLInputElement>('[data-kcang-path="vereinsdaten.name"]')!;
    input.value = 'Cloud-Test';
    input.dispatchEvent(new Event('input'));
    // Debounce 500ms abwarten
    await new Promise((r) => setTimeout(r, 600));
    expect(saveToCloud).toHaveBeenCalled();
  });
});
