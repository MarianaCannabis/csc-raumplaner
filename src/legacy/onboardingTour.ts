/**
 * Onboarding-Tour Orchestrator (Pfad-C Schritt 7 / Bedienkonzept).
 *
 * Vereint Welcome + Tutorial in einem Phase-State-Machine-Flow:
 *
 *   idle → welcome → bridge → tutorial → done
 *                          ↘──────────→ done   (User wählt im Bridge "Später")
 *                  ↘──────────────────→ done   (User wählt CTA im Welcome)
 *   any  → skipped                              (User opt-out)
 *
 * Das Modul ruft die existierenden Module welcomeFlow / tutorial via deps
 * auf — UI-Implementation der einzelnen Phasen bleibt dort. Nur das
 * Bridge-Modal wird hier programmatisch erzeugt (klein, self-contained,
 * kein neuer HTML-Block in der 21k-Zeilen-index.html nötig).
 *
 * localStorage-Persistenz:
 *   csc-onboarding-state: aktuelle Phase ('idle'|'welcome'|...|'done'|'skipped')
 *   csc-onboarding-skip:  '1' wenn endgültig opt-out
 *
 * Migration alter Keys (autoStartTourIfNew einmalig):
 *   csc-welcome-never='1' → csc-onboarding-skip='1'
 *   csc-onboarded='1'     → csc-onboarding-state='done' (User hatte das alte
 *                          Welcome schon abgeschlossen, kein Re-Show)
 */

export type TourState =
  | 'idle'
  | 'welcome'
  | 'bridge'
  | 'tutorial'
  | 'done'
  | 'skipped';

export interface TourDeps {
  /** Öffnet den existierenden m-welcome Modal (welcomeFlow.startWelcomeFlow). */
  startWelcome: () => void;
  /** Öffnet den existierenden Tutorial-Overlay (tutorial.startTutorial). */
  startTutorial: () => void;
  /** Optional — für Logging/Toast. */
  toast?: (msg: string, type?: string) => void;
}

const STATE_KEY = 'csc-onboarding-state';
const SKIP_KEY = 'csc-onboarding-skip';
const LEGACY_NEVER_KEY = 'csc-welcome-never';
const LEGACY_ONBOARDED_KEY = 'csc-onboarded';
const BRIDGE_OVERLAY_ID = 'm-onboarding-bridge';

let _state: TourState = 'idle';

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key: string, val: string): void {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* private-mode / quota — best-effort */
  }
}

function setState(next: TourState): void {
  _state = next;
  lsSet(STATE_KEY, next);
}

/**
 * Migriert alte localStorage-Keys einmalig zu den neuen.
 * - csc-welcome-never='1' → csc-onboarding-skip='1'
 * - csc-onboarded='1'     → csc-onboarding-state='done'
 *
 * Idempotent: läuft auch wenn die neuen Keys schon existieren ohne sie zu
 * überschreiben.
 */
function migrateLegacyKeys(): void {
  // 1. Endgültiges opt-out aus altem Welcome → neues skip
  if (!lsGet(SKIP_KEY) && lsGet(LEGACY_NEVER_KEY) === '1') {
    lsSet(SKIP_KEY, '1');
  }
  // 2. Old-Welcome wurde abgeschlossen → state = done (kein Re-Show)
  if (!lsGet(STATE_KEY) && lsGet(LEGACY_ONBOARDED_KEY) === '1') {
    lsSet(STATE_KEY, 'done');
  }
  // Alte Keys NICHT löschen — falls Migration zurückgerollt wird, ist
  // der ursprüngliche User-State noch lesbar. Sind ohnehin winzig.
}

/** Reads aktuellen State aus localStorage (oder 'idle' bei frischem User). */
export function getTourState(): TourState {
  const stored = lsGet(STATE_KEY);
  if (
    stored === 'idle' ||
    stored === 'welcome' ||
    stored === 'bridge' ||
    stored === 'tutorial' ||
    stored === 'done' ||
    stored === 'skipped'
  ) {
    _state = stored;
    return stored;
  }
  return _state;
}

/** Endgültiges opt-out — alle Phasen geschlossen, kein Re-Show.
 *  Idempotent: doppelte Aufrufe sind harmlos.
 */
export function skipTour(): void {
  setState('skipped');
  lsSet(SKIP_KEY, '1');
}

/**
 * Auto-Start beim Boot. Idempotent — bei skip='1' oder state='done'/'skipped'
 * passiert nix. Sonst: Migration alter Keys + Welcome-Phase starten.
 */
export function autoStartTourIfNew(deps: TourDeps): void {
  migrateLegacyKeys();
  if (lsGet(SKIP_KEY) === '1') {
    _state = 'skipped';
    return;
  }
  const stored = getTourState();
  if (stored === 'done' || stored === 'skipped') return;
  // Frische User oder unterbrochene Tour (z.B. F5 mid-Welcome).
  // Wir starten die Welcome-Phase neu — der User hat dann Fortschritt
  // bis zur aktuellen Phase, ein einfacher Re-Start des Welcome-Modals
  // ist angemessen.
  setState('welcome');
  deps.startWelcome();
}

/**
 * Expliziter Start (z.B. per "Tutorial starten"-Button). Resettet State,
 * sodass die volle Tour läuft — auch für User die schon 'done' sind.
 */
export function startTour(deps: TourDeps): void {
  setState('welcome');
  deps.startWelcome();
}

/**
 * Hook: User hat Welcome-Modal abgeschlossen (auf "Fertig" geklickt, NICHT
 * via CTA). Übergang zu Bridge-Modal.
 */
export function onWelcomeDone(deps: TourDeps): void {
  if (_state !== 'welcome') return;
  setState('bridge');
  showBridgeModal(deps);
}

/**
 * Hook: User hat im Welcome eine CTA gewählt (Vorlage / Leer / Laden).
 * Direkter Sprung zu 'done' — kein Bridge, kein Tutorial. Wenn User
 * später das Tutorial möchte: Topbar-Button "🎯 Interaktives Tutorial".
 */
export function onWelcomeCtaChosen(): void {
  setState('done');
}

/** Bridge "Tour starten" → tutorial-Phase. */
export function onBridgeYes(deps: TourDeps): void {
  closeBridgeModal();
  if (_state !== 'bridge') return;
  setState('tutorial');
  deps.startTutorial();
}

/** Bridge "Später" → done (User hat Welcome gesehen, das reicht erstmal). */
export function onBridgeNo(): void {
  closeBridgeModal();
  if (_state !== 'bridge') return;
  setState('done');
}

/** Hook: Tutorial wurde abgeschlossen. */
export function onTutorialDone(deps: TourDeps): void {
  if (_state !== 'tutorial') return;
  setState('done');
  if (deps.toast) deps.toast('🌿 Tour abgeschlossen — viel Erfolg!', 'g');
}

// ── Bridge-Modal: programmatisch, kein index.html-Patch ─────────────

function ensureBridgeOverlay(): HTMLElement {
  let overlay = document.getElementById(BRIDGE_OVERLAY_ID);
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.id = BRIDGE_OVERLAY_ID;
  overlay.className = 'mdl-overlay';
  overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:9999';
  overlay.innerHTML =
    '<div class="mdl-dialog" style="max-width:380px;margin:auto;padding:24px;background:var(--bg);border:1px solid var(--bd);border-radius:8px">' +
    '<div style="font-size:36px;text-align:center;margin-bottom:8px">🎯</div>' +
    '<h2 style="text-align:center;margin:0 0 6px;font-size:16px">Kurze Tour gefällig?</h2>' +
    '<div style="text-align:center;color:var(--tx2);font-size:12px;line-height:1.5;margin-bottom:14px">' +
    'Wir zeigen dir die wichtigsten Features in 5 Schritten — Tools, KI-Assistent, Compliance-Check.' +
    '</div>' +
    '<div style="display:flex;gap:8px">' +
    '<button id="otb-no" class="mdl-btn" style="flex:1">Später</button>' +
    '<button id="otb-yes" class="mdl-btn mdl-btn--primary" style="flex:1">🎯 Tour starten</button>' +
    '</div></div>';
  document.body.appendChild(overlay);
  return overlay;
}

function showBridgeModal(deps: TourDeps): void {
  const overlay = ensureBridgeOverlay();
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  const yes = document.getElementById('otb-yes');
  const no = document.getElementById('otb-no');
  if (yes) (yes as HTMLButtonElement).onclick = () => onBridgeYes(deps);
  if (no) (no as HTMLButtonElement).onclick = () => onBridgeNo();
}

function closeBridgeModal(): void {
  const overlay = document.getElementById(BRIDGE_OVERLAY_ID);
  if (overlay) overlay.style.display = 'none';
}

// ── Test-Helpers ─────────────────────────────────────────────────────

export function _resetForTests(): void {
  _state = 'idle';
  const overlay = document.getElementById(BRIDGE_OVERLAY_ID);
  if (overlay) overlay.remove();
}
