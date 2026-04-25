/**
 * P17.20 — Topbar-Dropdown-Menu-System extrahiert aus
 * index.html:11161-11182.
 *
 * Module-internal _openMenu-Tracking (aktive Menu-ID oder null).
 * toggleTBMenu schließt offene Menus (radio-style), closeTBMenu schließt
 * alle. updateMenuActiveStates ist Caller-side (zu viele Legacy-Globals).
 */

let _openMenu: string | null = null;

export interface ToggleMenuDeps {
  /** Optional: nach Open ruft das aktive-States-Sync (Toggle-Items
   *  wie ✓ Maße / ✓ Decke). Caller-side weil viele Legacy-Globals. */
  updateMenuActiveStates?: () => void;
}

export function toggleTBMenu(id: string, deps: ToggleMenuDeps = {}): void {
  const drop = document.getElementById('tbmd-' + id);
  const btn = document.querySelector('#tbm-' + id + ' .tbm-btn');
  if (!drop) return;
  if (_openMenu === id) {
    closeTBMenu();
    return;
  }
  closeTBMenu();
  _openMenu = id;
  drop.classList.add('open');
  if (btn) {
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
  if (deps.updateMenuActiveStates) deps.updateMenuActiveStates();
}

export function closeTBMenu(): void {
  document.querySelectorAll('.tbm-drop.open').forEach((d) => d.classList.remove('open'));
  document.querySelectorAll('.tbm-btn.open').forEach((b) => b.classList.remove('open'));
  // a11y: aria-expanded auf allen Dropdown-Triggern zurücksetzen.
  document
    .querySelectorAll('.tbm-btn[aria-expanded]')
    .forEach((b) => b.setAttribute('aria-expanded', 'false'));
  _openMenu = null;
}

/** Diagnostic für Tests + main.ts (z.B. zum Sync mit Legacy _openMenu). */
export function getOpenMenu(): string | null {
  return _openMenu;
}

/** Test-Helper. */
export function _resetForTests(): void {
  _openMenu = null;
}
