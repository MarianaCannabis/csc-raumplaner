/**
 * P17.17 — Welcome-Flow (Onboarding) extrahiert aus index.html:13240-13322.
 *
 * Multi-State-Flow mit 3 Steps. Module-internal _idx state. CTA-Aktionen
 * (Vorlage / Leer / Laden) werden via deps-Callbacks ausgelöst.
 *
 * Persistenz: localStorage 'csc-onboarded' nach Close + 'csc-welcome-never'
 * wenn die Checkbox aktiv ist.
 */

interface WelcomeStep {
  icon: string;
  title: string;
  body: string;
  cta?: boolean;
}

const WELCOME_STEPS: readonly WelcomeStep[] = [
  {
    icon: '🌿',
    title: 'Willkommen bei CSC Studio Pro',
    body:
      'Entwirf professionelle Grundrisse für Cannabis Social Clubs, Messestände und Events. Drei Wege loszulegen:' +
      '<ul style="margin:10px 0;padding-left:20px;font-size:12px;line-height:1.7">' +
      '<li>📋 <b>Fertige Vorlage</b> — 14 Stand-Templates (CSC/Mari-Jane/Dmexco/Boot/Gamescom)</li>' +
      '<li>⬜ <b>Leer starten</b> — Räume selbst zeichnen</li>' +
      '<li>📂 <b>Projekt laden</b> — aus Datei oder Cloud</li></ul>',
  },
  {
    icon: '🎯',
    title: 'Was der Planner kann',
    body:
      '<ul style="margin:10px 0;padding-left:20px;font-size:12px;line-height:1.7">' +
      '<li>Räume zeichnen + möblieren (~260 Rich-Primitive-Items)</li>' +
      '<li>KCanG-Compliance live prüfen (🌿-Button in der Topbar)</li>' +
      '<li>Fotos auf Banner/Rückwände hochladen</li>' +
      '<li>Export als DXF/PDF/IFC/CSV/GLTF</li>' +
      '<li>Messeordnung als PDF importieren → Claude extrahiert Regeln</li>' +
      '<li>3D-Rundgang mit WASD + Maus</li></ul>',
  },
  {
    icon: '🚀',
    title: "Los geht's",
    body:
      'Klick unten auf einen der Start-Wege. Du kannst den Plan jederzeit umwerfen — alles ist umkehrbar via Strg+Z oder 🖼 Visual History.',
    cta: true,
  },
];

let _idx = 0;

export interface WelcomeFlowDeps {
  e2eMode?: boolean;
  openM: (id: string) => void;
  closeM: (id: string) => void;
  /** Pfad-C #7: Hook für die Onboarding-Tour-Orchestrierung. Feuert nach
   *  closeWelcomeFlow(mark=true). Nicht-aufrufer haben dasselbe Verhalten
   *  wie vorher (additiv, kein Breaking-Change). */
  onClose?: () => void;
}

export function startWelcomeFlow(deps: WelcomeFlowDeps): void {
  if (deps.e2eMode) return;
  _idx = 0;
  renderWelcomeStep(deps);
  deps.openM('m-welcome');
}

export function renderWelcomeStep(deps: WelcomeFlowDeps): void {
  const s = WELCOME_STEPS[_idx];
  if (!s) {
    closeWelcomeFlow(deps);
    return;
  }
  const content = document.getElementById('welcome-step-content');
  const dots = document.getElementById('welcome-dots');
  const back = document.getElementById('welcome-back') as HTMLElement | null;
  const next = document.getElementById('welcome-next') as HTMLButtonElement | null;
  if (content) {
    content.innerHTML =
      '<div style="font-size:32px;text-align:center;margin-bottom:8px">' +
      s.icon +
      '</div>' +
      '<h2 style="text-align:center;margin:0 0 10px;font-size:16px">' +
      s.title +
      '</h2>' +
      '<div style="color:var(--tx2);font-size:12px;line-height:1.5">' +
      s.body +
      '</div>' +
      (s.cta
        ? '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:14px">' +
          // Pfad-E #0: CTA → ctaThenAction setzt state=done direkt + schließt
          // Modal + ruft action(). Ohne diesen Wrapper hätte die Bridge-Phase
          // kurz aufpoppen können (visueller Glitch).
          '<button class="mdl-btn mdl-btn--primary" onclick="window.cscOnboarding.ctaThenAction(function(){openTemplates()})" style="padding:10px 6px;font-size:11px">📋 Vorlage</button>' +
          '<button class="mdl-btn mdl-btn--primary" onclick="window.cscOnboarding.ctaThenAction(function(){set2DTool(\'room\')})" style="padding:10px 6px;font-size:11px">⬜ Leer</button>' +
          '<button class="mdl-btn" onclick="window.cscOnboarding.ctaThenAction(function(){showRight(\'save\')})" style="padding:10px 6px;font-size:11px">📂 Laden</button>' +
          '</div>'
        : '');
  }
  if (dots) {
    dots.innerHTML = WELCOME_STEPS.map(
      (_, i) =>
        '<span style="width:8px;height:8px;border-radius:50%;background:' +
        (i === _idx ? 'var(--gr)' : 'var(--bd)') +
        '"></span>',
    ).join('');
  }
  if (back) back.style.display = _idx > 0 ? 'inline-block' : 'none';
  if (next) {
    next.textContent = _idx < WELCOME_STEPS.length - 1 ? 'Weiter →' : '✓ Fertig';
    next.onclick = () => {
      if (_idx < WELCOME_STEPS.length - 1) welcomeStep(1, deps);
      else closeWelcomeFlow(deps);
    };
  }
}

export function welcomeStep(delta: number, deps: WelcomeFlowDeps): void {
  _idx = Math.max(0, Math.min(WELCOME_STEPS.length - 1, _idx + delta));
  renderWelcomeStep(deps);
}

export function closeWelcomeFlow(deps: WelcomeFlowDeps, mark = true): void {
  const cb = document.getElementById('welcome-never') as HTMLInputElement | null;
  if (mark) {
    try {
      localStorage.setItem('csc-onboarded', '1');
      if (cb && cb.checked) localStorage.setItem('csc-welcome-never', '1');
    } catch {
      /* ignore */
    }
  }
  deps.closeM('m-welcome');
  if (mark && typeof deps.onClose === 'function') {
    try { deps.onClose(); } catch (e) { console.warn('[welcome] onClose threw', e); }
  }
}

/** Test-Helper: state-reset. */
export function _resetForTests(): void {
  _idx = 0;
}

/** Diagnostic für Tests. */
export function _getCurrentIdx(): number {
  return _idx;
}

export const WELCOME_STEP_COUNT = WELCOME_STEPS.length;
