/**
 * P17.1 — Toast-Notifications, extrahiert aus index.html:5335-5342.
 *
 * Pure UI-Helper: erzeugt einen kurzen Banner unten im Viewport mit
 * Auto-Dismiss nach 2.3s. Style-Klassen `.toast` + Type-Modifier
 * (`.g`/`.r`/`.b`) sind in surfaces.css definiert.
 *
 * Backwards-Compat: 304 Aufrufstellen im index.html und mehrere
 * Inline-Scripts callen `toast(...)` als globale Function. Die
 * window-Bindung in main.ts hält das Pattern lebendig, bis alle
 * Caller ebenfalls extrahiert sind.
 */

export type ToastType = 'g' | 'r' | 'b';

export function toast(msg: string, type: ToastType = 'g'): void {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 350);
  }, 2300);
}
