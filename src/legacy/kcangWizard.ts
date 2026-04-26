/**
 * KCanG-Compliance-Wizard (Pfad-E #2-9).
 *
 * Single-Page-Form mit 7 Sektionen, alle gleichzeitig sichtbar mit Sticky-
 * Anker-Navigation. localStorage default; optionaler Cloud-Sync via opt-in
 * Toggle (csc_kcang_applications-Tabelle, Migration 0010).
 *
 * Sektionen:
 *   A. Vereinsdaten (Name, Adresse, Mitgliederzahl, Präventionsbeauftragter)
 *   B. Räume (auto-importiert aus aktuellem Projekt + manuell ergänzbar)
 *   C. Compliance (auto aus 21 Regeln + Freitext-Notizen)
 *   D. Hygienekonzept (Checkliste + Freitext)
 *   E. Suchtberatung (Kontakt + Konzept)
 *   F. Sicherheit (Brandschutz, Notausgang, Sichtschutz §14, POI §13)
 *   G. Notizen (Freitext sonstiges)
 *
 * Auto-Save: bei jedem Input-Change debounced 500ms → localStorage.
 * Wenn cloud_sync=true: zusätzlich saveToCloud-Callback.
 */

export type RoomType = 'lager' | 'anbau' | 'ausgabe' | 'sozial' | 'sonstiges';
export type ComplianceStatus = 'passed' | 'failed' | 'na';

export interface KCanGRoom {
  name: string;
  flaeche_m2: number;
  typ: RoomType;
}

export interface KCanGApplication {
  vereinsdaten: {
    name: string;
    adresse: string;
    mitgliederzahl: number;
    praeventionsbeauftragter: { name: string; schulungsnachweis: string };
  };
  raeume: KCanGRoom[];
  compliance: {
    status: Record<string, ComplianceStatus>;
    notizen: string;
  };
  hygienekonzept: {
    haendewaschen: boolean;
    desinfektion: boolean;
    schaedlingsbekaempfung: boolean;
    abfallentsorgung: boolean;
    schulung_personal: boolean;
    notizen: string;
  };
  suchtberatung: {
    kontakt_name: string;
    kontakt_email: string;
    kontakt_telefon: string;
    konzept_text: string;
  };
  sicherheit: {
    brandschutz: { vorhanden: boolean; notizen: string };
    notausgang: { vorhanden: boolean; notizen: string };
    sichtschutz_p14: { vorhanden: boolean; notizen: string };
    poi_distanz_p13: { bestaetigt: boolean; entfernung_m: number };
  };
  notizen: string;
  meta: {
    erstellt_am: string;
    geaendert_am: string;
    version: number;
    cloud_sync: boolean;
  };
}

export interface KCanGWizardDeps {
  /** Liest aktuellen Projekt-Stand für Auto-Import in Section B+C. */
  getCurrentProjectData?: () => {
    rooms?: Array<{ name?: string; w?: number; d?: number; type?: string }>;
    compliance?: Array<{ id: string; passed: boolean }>;
  };
  /** Cloud-Save Callback (nur wenn cloud_sync=true). */
  saveToCloud?: (data: KCanGApplication) => Promise<void>;
  /** Cloud-Load Callback. */
  loadFromCloud?: () => Promise<KCanGApplication | null>;
  /** Toast für Feedback. */
  toast?: (msg: string, type?: string) => void;
}

export const LS_KEY = 'csc-kcang-application';

export function getEmptyApplication(): KCanGApplication {
  const now = new Date().toISOString();
  return {
    vereinsdaten: {
      name: '',
      adresse: '',
      mitgliederzahl: 0,
      praeventionsbeauftragter: { name: '', schulungsnachweis: '' },
    },
    raeume: [],
    compliance: { status: {}, notizen: '' },
    hygienekonzept: {
      haendewaschen: false,
      desinfektion: false,
      schaedlingsbekaempfung: false,
      abfallentsorgung: false,
      schulung_personal: false,
      notizen: '',
    },
    suchtberatung: {
      kontakt_name: '',
      kontakt_email: '',
      kontakt_telefon: '',
      konzept_text: '',
    },
    sicherheit: {
      brandschutz: { vorhanden: false, notizen: '' },
      notausgang: { vorhanden: false, notizen: '' },
      sichtschutz_p14: { vorhanden: false, notizen: '' },
      poi_distanz_p13: { bestaetigt: false, entfernung_m: 0 },
    },
    notizen: '',
    meta: { erstellt_am: now, geaendert_am: now, version: 1, cloud_sync: false },
  };
}

export function loadFromLocalStorage(): KCanGApplication | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as KCanGApplication;
  } catch {
    return null;
  }
}

export function saveToLocalStorage(app: KCanGApplication): void {
  try {
    app.meta.geaendert_am = new Date().toISOString();
    localStorage.setItem(LS_KEY, JSON.stringify(app));
  } catch {
    /* private-mode / quota — best-effort */
  }
}

/**
 * Importiert Räume + Compliance aus dem aktuellen Projekt (sofern vorhanden).
 * Idempotent: bestehende Wizard-Räume werden NICHT überschrieben, nur ergänzt
 * wo sie noch nicht existieren (Match by name).
 */
export function autoImportFromProject(
  app: KCanGApplication,
  deps: KCanGWizardDeps,
): KCanGApplication {
  if (!deps.getCurrentProjectData) return app;
  const proj = deps.getCurrentProjectData();
  const next: KCanGApplication = JSON.parse(JSON.stringify(app));
  if (Array.isArray(proj.rooms)) {
    for (const r of proj.rooms) {
      const name = r.name || 'Raum';
      if (next.raeume.some((existing) => existing.name === name)) continue;
      const flaeche = (r.w || 0) * (r.d || 0);
      // Heuristik: Raum-Typ aus Name ableiten
      const lower = name.toLowerCase();
      let typ: RoomType = 'sonstiges';
      if (/lager|stor|depot/.test(lower)) typ = 'lager';
      else if (/anbau|grow|kultur/.test(lower)) typ = 'anbau';
      else if (/ausgabe|theke|verkauf/.test(lower)) typ = 'ausgabe';
      else if (/sozial|aufenthalt|lounge/.test(lower)) typ = 'sozial';
      next.raeume.push({ name, flaeche_m2: Math.round(flaeche * 10) / 10, typ });
    }
  }
  if (Array.isArray(proj.compliance)) {
    for (const c of proj.compliance) {
      if (next.compliance.status[c.id] !== undefined) continue;
      next.compliance.status[c.id] = c.passed ? 'passed' : 'failed';
    }
  }
  return next;
}

/**
 * Validiert ob alle Pflichtfelder ausgefüllt sind. Returnt Liste der
 * fehlenden Felder (leer = vollständig).
 */
export function validateApplication(app: KCanGApplication): string[] {
  const missing: string[] = [];
  if (!app.vereinsdaten.name.trim()) missing.push('Vereinsname');
  if (!app.vereinsdaten.adresse.trim()) missing.push('Vereinsadresse');
  if (app.vereinsdaten.mitgliederzahl <= 0) missing.push('Mitgliederzahl');
  if (!app.vereinsdaten.praeventionsbeauftragter.name.trim())
    missing.push('Präventionsbeauftragter (Name)');
  if (app.raeume.length === 0) missing.push('Mindestens ein Raum');
  if (!app.suchtberatung.kontakt_name.trim()) missing.push('Suchtberatung (Kontakt-Name)');
  return missing;
}

// ── Modal-Render ─────────────────────────────────────────────────────

const MODAL_ID = 'm-kcang-wizard';

let _state: KCanGApplication = getEmptyApplication();
let _saveTimer: ReturnType<typeof setTimeout> | null = null;
let _depsRef: KCanGWizardDeps = {};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function debouncedSave(): void {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    saveToLocalStorage(_state);
    if (_state.meta.cloud_sync && _depsRef.saveToCloud) {
      _depsRef.saveToCloud(_state).catch((e) => {
        console.warn('[kcang] cloud-sync failed', e);
        if (_depsRef.toast) _depsRef.toast('Cloud-Sync fehlgeschlagen', 'r');
      });
    }
  }, 500);
}

function setField(path: string, value: unknown): void {
  // Pfad-Setter via dot-notation (z.B. "vereinsdaten.name" → _state.vereinsdaten.name)
  const parts = path.split('.');
  let target: Record<string, unknown> = _state as unknown as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i++) {
    target = target[parts[i]!] as Record<string, unknown>;
  }
  target[parts[parts.length - 1]!] = value;
  debouncedSave();
}

function inputRow(label: string, path: string, value: string, type = 'text'): string {
  return (
    '<label style="display:block;margin-bottom:8px;font-size:11px">' +
    '<div style="color:var(--tx2);margin-bottom:2px">' +
    escapeHtml(label) +
    '</div>' +
    '<input type="' +
    type +
    '" data-kcang-path="' +
    escapeHtml(path) +
    '" value="' +
    escapeHtml(value) +
    '" style="width:100%;padding:6px 8px;background:var(--bg2);border:1px solid var(--bd);border-radius:4px;color:var(--tx)">' +
    '</label>'
  );
}

function checkboxRow(label: string, path: string, checked: boolean): string {
  return (
    '<label style="display:flex;gap:8px;align-items:center;font-size:11px;margin-bottom:6px">' +
    '<input type="checkbox" data-kcang-path="' +
    escapeHtml(path) +
    '" data-kcang-bool="1"' +
    (checked ? ' checked' : '') +
    '>' +
    escapeHtml(label) +
    '</label>'
  );
}

function textareaRow(label: string, path: string, value: string, rows = 3): string {
  return (
    '<label style="display:block;margin-bottom:8px;font-size:11px">' +
    '<div style="color:var(--tx2);margin-bottom:2px">' +
    escapeHtml(label) +
    '</div>' +
    '<textarea data-kcang-path="' +
    escapeHtml(path) +
    '" rows="' +
    rows +
    '" style="width:100%;padding:6px 8px;background:var(--bg2);border:1px solid var(--bd);border-radius:4px;color:var(--tx);font:inherit">' +
    escapeHtml(value) +
    '</textarea>' +
    '</label>'
  );
}

function sectionWrap(id: string, title: string, body: string): string {
  return (
    '<section id="' +
    id +
    '" style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--bd)">' +
    '<h3 style="margin:0 0 12px;font-size:14px">' +
    escapeHtml(title) +
    '</h3>' +
    body +
    '</section>'
  );
}

function renderSections(): string {
  const v = _state.vereinsdaten;
  const h = _state.hygienekonzept;
  const s = _state.suchtberatung;
  const sec = _state.sicherheit;
  return (
    sectionWrap(
      'kcang-sec-vereinsdaten',
      'A. Vereinsdaten',
      inputRow('Vereinsname', 'vereinsdaten.name', v.name) +
        inputRow('Vereinsadresse', 'vereinsdaten.adresse', v.adresse) +
        inputRow(
          'Mitgliederzahl',
          'vereinsdaten.mitgliederzahl',
          String(v.mitgliederzahl),
          'number',
        ) +
        '<h4 style="margin:12px 0 6px;font-size:12px">Präventionsbeauftragter (§ 23 KCanG)</h4>' +
        inputRow(
          'Name',
          'vereinsdaten.praeventionsbeauftragter.name',
          v.praeventionsbeauftragter.name,
        ) +
        inputRow(
          'Schulungsnachweis (Aktenzeichen / Datum)',
          'vereinsdaten.praeventionsbeauftragter.schulungsnachweis',
          v.praeventionsbeauftragter.schulungsnachweis,
        ),
    ) +
    sectionWrap(
      'kcang-sec-raeume',
      'B. Räume',
      '<div id="kcang-raeume-list" style="font-size:11px;color:var(--tx2);margin-bottom:8px">' +
        (_state.raeume.length === 0
          ? '<i>Keine Räume erfasst. Auto-Import aus aktuellem Projekt verfügbar.</i>'
          : _state.raeume
              .map(
                (r) =>
                  '<div style="padding:4px 0;border-bottom:1px dashed var(--bd)">' +
                  escapeHtml(r.name) +
                  ' · ' +
                  r.flaeche_m2 +
                  ' m² · ' +
                  escapeHtml(r.typ) +
                  '</div>',
              )
              .join('')) +
        '</div>' +
        '<button id="kcang-import-rooms" class="mdl-btn" style="font-size:11px">↻ Räume aus Projekt importieren</button>',
    ) +
    sectionWrap(
      'kcang-sec-compliance',
      'C. Compliance-Status',
      '<div style="font-size:11px;color:var(--tx2);margin-bottom:8px">' +
        Object.keys(_state.compliance.status).length +
        ' Regeln auto-importiert' +
        '</div>' +
        textareaRow('Notizen zur Compliance', 'compliance.notizen', _state.compliance.notizen, 4),
    ) +
    sectionWrap(
      'kcang-sec-hygiene',
      'D. Hygienekonzept',
      checkboxRow('Händewaschmöglichkeit', 'hygienekonzept.haendewaschen', h.haendewaschen) +
        checkboxRow('Flächendesinfektion', 'hygienekonzept.desinfektion', h.desinfektion) +
        checkboxRow(
          'Schädlingsbekämpfungs-Konzept',
          'hygienekonzept.schaedlingsbekaempfung',
          h.schaedlingsbekaempfung,
        ) +
        checkboxRow(
          'Abfallentsorgung dokumentiert',
          'hygienekonzept.abfallentsorgung',
          h.abfallentsorgung,
        ) +
        checkboxRow(
          'Personal geschult (Hygiene)',
          'hygienekonzept.schulung_personal',
          h.schulung_personal,
        ) +
        textareaRow('Hygienekonzept-Notizen', 'hygienekonzept.notizen', h.notizen, 3),
    ) +
    sectionWrap(
      'kcang-sec-suchtberatung',
      'E. Suchtberatung',
      inputRow('Kontakt-Name', 'suchtberatung.kontakt_name', s.kontakt_name) +
        inputRow('E-Mail', 'suchtberatung.kontakt_email', s.kontakt_email, 'email') +
        inputRow('Telefon', 'suchtberatung.kontakt_telefon', s.kontakt_telefon, 'tel') +
        textareaRow(
          'Suchtberatungs-Konzept (Vermittlungsverfahren)',
          'suchtberatung.konzept_text',
          s.konzept_text,
          5,
        ),
    ) +
    sectionWrap(
      'kcang-sec-sicherheit',
      'F. Sicherheit',
      checkboxRow(
        'Brandschutz vorhanden',
        'sicherheit.brandschutz.vorhanden',
        sec.brandschutz.vorhanden,
      ) +
        textareaRow(
          'Brandschutz-Notizen',
          'sicherheit.brandschutz.notizen',
          sec.brandschutz.notizen,
          2,
        ) +
        checkboxRow(
          'Notausgang gekennzeichnet',
          'sicherheit.notausgang.vorhanden',
          sec.notausgang.vorhanden,
        ) +
        textareaRow('Notausgang-Notizen', 'sicherheit.notausgang.notizen', sec.notausgang.notizen, 2) +
        checkboxRow(
          'Sichtschutz § 14 KCanG',
          'sicherheit.sichtschutz_p14.vorhanden',
          sec.sichtschutz_p14.vorhanden,
        ) +
        textareaRow(
          'Sichtschutz-Notizen',
          'sicherheit.sichtschutz_p14.notizen',
          sec.sichtschutz_p14.notizen,
          2,
        ) +
        checkboxRow(
          '§ 13 POI-Distanz bestätigt (≥ 100 m zu Schulen/Spielplätzen)',
          'sicherheit.poi_distanz_p13.bestaetigt',
          sec.poi_distanz_p13.bestaetigt,
        ) +
        inputRow(
          'Geringste Entfernung (m)',
          'sicherheit.poi_distanz_p13.entfernung_m',
          String(sec.poi_distanz_p13.entfernung_m),
          'number',
        ),
    ) +
    sectionWrap(
      'kcang-sec-notizen',
      'G. Notizen',
      textareaRow('Sonstige Anmerkungen für den Antrag', 'notizen', _state.notizen, 8),
    )
  );
}

function attachInputHandlers(): void {
  const container = document.getElementById('kcang-sections');
  if (!container) return;
  container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    '[data-kcang-path]',
  ).forEach((el) => {
    const path = el.dataset.kcangPath!;
    const isBool = el.dataset.kcangBool === '1';
    const handler = () => {
      let value: unknown;
      if (isBool && el instanceof HTMLInputElement) {
        value = el.checked;
      } else if (el.type === 'number' && el instanceof HTMLInputElement) {
        value = Number(el.value) || 0;
      } else {
        value = el.value;
      }
      setField(path, value);
    };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  });
  const importBtn = document.getElementById('kcang-import-rooms');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      _state = autoImportFromProject(_state, _depsRef);
      saveToLocalStorage(_state);
      reRenderSections();
      if (_depsRef.toast) _depsRef.toast('Räume importiert', 'g');
    });
  }
}

function reRenderSections(): void {
  const container = document.getElementById('kcang-sections');
  if (!container) return;
  container.innerHTML = renderSections();
  attachInputHandlers();
}

export function openWizardModal(deps: KCanGWizardDeps): void {
  _depsRef = deps;
  _state = loadFromLocalStorage() || getEmptyApplication();
  // Erst-Öffnung: Auto-Import aus Projekt nur wenn noch keine Räume erfasst.
  if (_state.raeume.length === 0) {
    _state = autoImportFromProject(_state, deps);
  }
  const overlay = document.getElementById(MODAL_ID);
  if (!overlay) {
    if (deps.toast) deps.toast('Wizard-Modal nicht gefunden', 'r');
    return;
  }
  overlay.style.display = 'flex';
  overlay.classList.add('open');
  reRenderSections();
  // Cloud-Sync-Toggle initialisieren
  const toggle = document.getElementById('kcang-cloud-sync') as HTMLInputElement | null;
  if (toggle) toggle.checked = _state.meta.cloud_sync;
}

export function closeWizardModal(): void {
  const overlay = document.getElementById(MODAL_ID);
  if (overlay) {
    overlay.style.display = 'none';
    overlay.classList.remove('open');
  }
}

export function setCloudSync(enabled: boolean, deps: KCanGWizardDeps): void {
  _state.meta.cloud_sync = enabled;
  _depsRef = deps;
  saveToLocalStorage(_state);
  if (enabled && deps.saveToCloud) {
    deps.saveToCloud(_state).catch((e) => {
      console.warn('[kcang] initial cloud-sync failed', e);
      if (deps.toast) deps.toast('Cloud-Sync fehlgeschlagen', 'r');
    });
  }
}

export function resetApplication(): KCanGApplication {
  try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  _state = getEmptyApplication();
  return _state;
}

export function getCurrentState(): KCanGApplication {
  return _state;
}

/** Test-Helper. */
export function _resetForTests(): void {
  _state = getEmptyApplication();
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = null;
  _depsRef = {};
}

/** Test-Diagnostic. */
export function _setStateForTests(app: KCanGApplication): void {
  _state = app;
}
