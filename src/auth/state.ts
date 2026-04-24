/**
 * Auth-State Module (Track A Phase 2b.1).
 *
 * Singleton-Module mit Token + User als Module-Internal state. Keine
 * globals mehr in index.html — Reads via window.SB_TOKEN/SB_USER gehen
 * durch den Property-Proxy aus main.ts auf getAuthState(). Writes
 * müssen über setToken()/clearAuth() laufen (die alten direkten
 * Assignments waren die ~10 Write-Sites aus dem inline-Script, werden
 * in diesem Cluster alle auf Module-API migriert).
 *
 * Cross-tab-Sync via storage-Event: wenn ein anderer Tab einloggt,
 * hört dieser Tab es ohne Reload.
 */

import type { AuthUser } from './supabase.js';
export type { AuthUser };

/** Kompletter Auth-State-Snapshot. */
export interface AuthState {
  token: string;
  user: AuthUser | null;
  isSignedIn: boolean;
}

// ── Module-Internal State ─────────────────────────────────────────
let _token = '';
let _user: AuthUser | null = null;
const _listeners = new Set<(s: AuthState) => void>();

const STORAGE_TOKEN = 'csc-sb-token';
const STORAGE_USER = 'csc-sb-user';

/** Snapshot — getter liefert einen frischen, nicht den mutbaren State. */
export function getAuthState(): AuthState {
  return { token: _token, user: _user, isSignedIn: !!_token };
}

/**
 * Abonniere State-Changes. Rückgabe ist die Unsubscribe-Funktion.
 * Pattern wie bei src/compliance/escapeAnalysis.ts (subscribe + dispose).
 */
export function subscribe(fn: (s: AuthState) => void): () => void {
  _listeners.add(fn);
  return () => {
    _listeners.delete(fn);
  };
}

/**
 * Setzt Token + User gemeinsam. Triggert localStorage-Write (sync)
 * und notifiziert alle Subscriber. Leerer Token-String signalisiert
 * Logout — User wird dann auch auf null gesetzt und die localStorage-
 * Keys entfernt.
 */
export function setToken(token: string, user: AuthUser | null): void {
  _token = token;
  _user = token ? user : null;
  try {
    if (token) {
      localStorage.setItem(STORAGE_TOKEN, token);
      if (user) localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
    }
  } catch {
    /* Private-Mode / Quota — best-effort, state-in-memory bleibt */
  }
  _notifyListeners();
}

/** Convenience für Logout — `setToken('', null)`. */
export function clearAuth(): void {
  setToken('', null);
}

function _notifyListeners(): void {
  const snap = getAuthState();
  _listeners.forEach((fn) => {
    try {
      fn(snap);
    } catch (e) {
      // Ein fehlerhafter Subscriber darf die anderen nicht kaputtmachen.
      console.warn('[auth/state] subscriber threw', e);
    }
  });
}

// ── Module-Init: hydrate from localStorage ────────────────────────
// Wird bei Module-Load einmal ausgeführt. Der Legacy-Code hat das in
// rehydrateAuth() gemacht; das Modul zieht das hier früher hoch, damit
// getAuthState() direkt beim ersten Read den persistierten Token hat.
(function hydrate(): void {
  try {
    const tok = localStorage.getItem(STORAGE_TOKEN) ?? '';
    const usr = localStorage.getItem(STORAGE_USER) ?? '';
    if (tok) {
      _token = tok;
      try {
        _user = usr ? JSON.parse(usr) : null;
      } catch {
        _user = null;
      }
    }
  } catch {
    /* localStorage nicht verfügbar — state bleibt leer */
  }
})();

// ── Cross-Tab-Sync ────────────────────────────────────────────────
// Wenn ein anderer Tab csc-sb-token schreibt (Login/Logout), übernimmt
// dieser Tab den neuen Wert ohne Reload und notifiziert Subscriber.
// jsdom feuert storage-Events nicht automatisch, deshalb Guard für
// Test-Environments (window.addEventListener existiert aber wäre no-op).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_TOKEN) return;
    _token = e.newValue ?? '';
    if (_token) {
      try {
        const usr = localStorage.getItem(STORAGE_USER);
        _user = usr ? JSON.parse(usr) : null;
      } catch {
        _user = null;
      }
    } else {
      _user = null;
    }
    _notifyListeners();
  });
}
