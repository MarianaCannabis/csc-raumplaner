/**
 * Magic-Link-Redirect-Handler (Hotfix v2.6.1).
 *
 * Wird am Module-Boot in main.ts aufgerufen. Löst das Race-Condition-
 * Problem der Legacy-handleAuthRedirect()-Funktion: die lief im inline-
 * Script-Block bevor src/main.ts die window.cscAuth-Bridge installiert
 * hat und returnte früh — der Hash wurde nie geparst, User landete
 * wieder beim Login-Modal.
 *
 * Pure Funktion: window-Zugriff geht durch Callback-Injection, damit
 * der Test direkt gegen die Funktion gefahren werden kann, ohne dass
 * main.ts (mit ~50 Heavy-Imports: three.js, compliance, catalog, …)
 * im Test-Modul-Graph landet.
 */

import { parseAuthRedirectFragment } from './supabase.js';
import { setToken } from './state.js';

export interface ConsumeMagicLinkOptions {
  /** Refresh-Token persistieren (meist localStorage.setItem) */
  saveRefresh?: (rt: string) => void;
  /** URL-Cleanup — Token nicht in History/Referrer leaken */
  replaceHistory?: () => void;
  /** Optional User-Feedback (Toast etc.) nach erfolgreicher Anmeldung */
  onSuccess?: () => void;
}

/**
 * Verarbeitet einen Magic-Link-Redirect wenn `#access_token=…` im Hash
 * steht. Returnt `true` wenn ein Token konsumiert und persistiert wurde,
 * sonst `false` (normale Boot-Sequenz ohne Auth-Fragment).
 *
 * Jeder Callback ist try-catch-umhüllt — eine schlecht-gelaunte
 * localStorage/history/toast-API darf nicht die Anmeldung blockieren.
 */
export function consumeMagicLinkFromHash(
  hash: string,
  opts: ConsumeMagicLinkOptions = {},
): boolean {
  const parsed = parseAuthRedirectFragment(hash);
  if (!parsed) return false;
  setToken(parsed.accessToken, parsed.user);
  if (parsed.refreshToken && opts.saveRefresh) {
    try { opts.saveRefresh(parsed.refreshToken); } catch {
      /* Storage-Quota / Private-Mode — Auth-Token ist bereits im State */
    }
  }
  if (opts.replaceHistory) {
    try { opts.replaceHistory(); } catch {
      /* sehr alte Browser — Hash bleibt in URL, kein Blocker */
    }
  }
  if (opts.onSuccess) {
    try { opts.onSuccess(); } catch {
      /* Toast / UI-Feedback darf den Login nicht zurücksetzen */
    }
  }
  return true;
}
