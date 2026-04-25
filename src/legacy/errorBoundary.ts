/**
 * P17.4 — Crash-Modal extrahiert aus index.html:2421-2435.
 *
 * WICHTIG: Die window.addEventListener('error'|'unhandledrejection', …)
 * Listener bleiben bewusst inline in index.html — sie müssen so früh
 * wie möglich registriert sein (vor Module-Boot), sonst werden Errors
 * im Module-Boot-Window nicht gefangen. Die Listener callen window-bound
 * showCrashModal(...) — Boot-Shim resolved beim Aufruf, nicht bei
 * Listener-Registrierung.
 *
 * Idempotenz: pro Page-Lifetime feuert nur das erste Modal. Sonst
 * stapeln sich Crash-Modals bei Folge-Errors (z.B. wenn der Crash-
 * Render selbst einen Error wirft).
 */

let _crashShown = false;

export function showCrashModal(msg: string | null | undefined): void {
  if (_crashShown) return;
  _crashShown = true;
  const sanitized = String(msg || '(unbekannt)').replace(/[<>]/g, '');
  const m = document.createElement('div');
  // Marker-Klasse hilft Tests + DOM-Diagnose das Overlay zu finden,
  // ohne sich auf die fragile inline-style-Serialisierung verlassen zu müssen.
  m.className = 'csc-crash-overlay';
  m.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  m.innerHTML =
    '<div style="background:#0a0f14;border:1px solid #ef4444;border-radius:10px;padding:24px;max-width:440px;color:#e0e6ed;font-family:system-ui">' +
    '<h2 style="margin:0 0 10px;color:#ef4444;font-size:18px">⚠ Etwas ist schiefgelaufen</h2>' +
    '<p style="font-size:13px;line-height:1.5;color:#a0aec0">Die App hat einen Fehler gemeldet. Dein Projekt ist auto-gespeichert (alle 30s in IndexedDB). Bitte die Seite neu laden.</p>' +
    '<details style="margin-top:8px;font-size:11px;color:#666"><summary>Technischer Fehler</summary><pre style="overflow-x:auto;margin-top:6px">' +
    sanitized +
    '</pre></details>' +
    '<div style="display:flex;gap:6px;margin-top:14px;justify-content:flex-end">' +
    '<button onclick="this.closest(\'div\').parentNode.remove();" style="background:#2a2a2a;color:#e0e6ed;border:1px solid #3a3a3a;border-radius:4px;padding:6px 14px;cursor:pointer">Schließen</button>' +
    '<button onclick="location.reload();" style="background:#4ade80;color:#0a0f14;border:none;border-radius:4px;padding:6px 14px;cursor:pointer;font-weight:600">Neu laden</button>' +
    '</div></div>';
  document.body.appendChild(m);
}

/**
 * Test-Helper: Reset des `_crashShown`-Flags. NUR für Vitest gedacht
 * (oder Smoke-Tests die mehrere Modals in Folge prüfen). Production
 * lässt das Flag genau einmal pro Page-Lifetime feuern.
 */
export function _resetCrashShownForTests(): void {
  _crashShown = false;
}
