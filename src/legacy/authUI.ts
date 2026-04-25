/**
 * P17.7 — Auth-UI-Helpers extrahiert aus index.html:7647-7689.
 *
 * Drei Functions, alle DOM-bound:
 * - updateAuthStatus: rendert #auth-status-Label + Sign-in/out-Buttons
 * - setGateState: Sub-State-Toggle für #login-gate ('default' vs 'awaiting')
 * - updateLoginGate: Show/hide #login-gate basierend auf Token + E2E-Override
 *
 * Module-internal state: `_gateState` lokales Modul-Var. setGateState
 * ist exportiert, weil ein Caller in index.html (sendMagicLink) direkt
 * 'awaiting' setzt, bevor der nächste authState-Subscribe greift.
 */

export interface AuthUser {
  id?: string;
  email?: string;
}

export interface AuthUIDeps {
  token: string | null;
  user: AuthUser | null;
  e2eMode?: boolean;
}

export type GateState = 'default' | 'awaiting';

let _gateState: GateState = 'default';

export function setGateState(s: GateState): void {
  _gateState = s;
  const def = document.getElementById('gate-default');
  const awa = document.getElementById('gate-awaiting');
  if (def) def.style.display = s === 'default' ? 'flex' : 'none';
  if (awa) awa.style.display = s === 'awaiting' ? 'flex' : 'none';
}

export function updateAuthStatus(deps: AuthUIDeps): void {
  const el = document.getElementById('auth-status');
  const inBtn = document.getElementById('auth-signin-btn');
  const outBtn = document.getElementById('auth-signout-btn');
  if (deps.token && deps.user) {
    if (el) {
      el.textContent = '✅ Eingeloggt als ' + (deps.user.email || deps.user.id || '');
      el.style.color = '#4ade80';
    }
    if (inBtn) inBtn.style.display = 'none';
    if (outBtn) outBtn.style.display = 'block';
  } else {
    if (el) {
      el.textContent = '🔒 Nicht eingeloggt — KI-Funktionen erfordern Login';
      el.style.color = 'var(--tx3)';
    }
    if (inBtn) inBtn.style.display = 'block';
    if (outBtn) outBtn.style.display = 'none';
  }
  updateLoginGate(deps);
}

export function updateLoginGate(deps: AuthUIDeps): void {
  const el = document.getElementById('login-gate');
  if (!el) return;
  // E2E-Mode blendet Gate nie ein. Kein Auth-Bypass in der App-Logik
  // selbst — nur der visuelle Gate wird unterdrückt, alle authentifizierten
  // Calls (cloudSave etc.) schlagen weiterhin 401 fehl.
  if (deps.e2eMode) {
    el.style.display = 'none';
    return;
  }
  el.style.display = deps.token ? 'none' : 'flex';
  // Reset zu 'default' nach Login, sodass der NÄCHSTE Logout auf der
  // initialen CTA landet statt auf "Prüfe dein Postfach".
  if (deps.token) setGateState('default');
}

/** Test-Helper: _gateState reset. NUR für Vitest. */
export function _resetGateStateForTests(): void {
  _gateState = 'default';
}

/** Diagnostic für Tests + Debug. */
export function _getGateStateForTests(): GateState {
  return _gateState;
}
