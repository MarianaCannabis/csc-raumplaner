/**
 * P17.15 — Theme-Management extrahiert aus index.html:11560 + 20468-20493.
 *
 * Drei Funktionen, alle DOM + localStorage:
 * - applyThemeIcon: setzt #theme-toggle data-icon attribute (Lucide moon/sun)
 * - toggleTheme: cyclet data-theme zwischen 'dark' und 'light' + persistiert
 * - initTheme: liest csc-theme localStorage und applies einmalig
 * - setColorMode: separater Pfad aus dem Welcome-Modal (eigener Storage-Key
 *   csc-darkmode, eigener _darkMode-Flag); idempotent, kann mehrfach gerufen werden
 *
 * Single-Source-of-Truth für Theme: html[data-theme]. Legacy body.light-mode
 * wurde in Cluster 8d eliminiert.
 */

export interface ApplyThemeIconDeps {
  populateIcons?: () => void;
}

export interface ToggleThemeDeps extends ApplyThemeIconDeps {
  draw2D?: () => void;
}

export interface SetColorModeDeps {
  setDarkMode: (v: boolean) => void;
}

/** Setzt #theme-toggle data-icon und triggert Lucide-Re-Population. */
export function applyThemeIcon(isLight: boolean, deps: ApplyThemeIconDeps = {}): void {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.setAttribute('data-icon', isLight ? 'sun' : 'moon');
  btn.innerHTML = '';
  if (typeof deps.populateIcons === 'function') deps.populateIcons();
}

/** Toggle dark ↔ light. Persistiert in csc-theme + triggert canvas-redraw. */
export function toggleTheme(deps: ToggleThemeDeps = {}): void {
  const current = document.documentElement.getAttribute('data-theme');
  const isLight = current !== 'light';
  document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
  applyThemeIcon(isLight, deps);
  try {
    localStorage.setItem('csc-theme', isLight ? 'light' : 'dark');
  } catch {
    /* private-mode / quota — best-effort */
  }
  if (typeof deps.draw2D === 'function') deps.draw2D();
}

/** Boot-Init: liest csc-theme localStorage und appliziert. */
export function initTheme(deps: ApplyThemeIconDeps = {}): void {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('csc-theme');
  } catch {
    /* private-mode etc. */
  }
  const isLight = saved === 'light';
  document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark');
  applyThemeIcon(isLight, deps);
}

/** Welcome-Modal-Pfad mit eigenem Storage-Key + Button-State-Sync.
 *  Parallel zu toggleTheme aus historischen Gründen (Cluster 8d). */
export function setColorMode(dark: boolean, deps: SetColorModeDeps): void {
  deps.setDarkMode(dark);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  try {
    localStorage.setItem('csc-darkmode', dark ? '1' : '0');
  } catch {
    /* private-mode etc. */
  }
  const btnD = document.getElementById('btn-dark');
  const btnL = document.getElementById('btn-light');
  if (btnD) btnD.className = 'mdl-btn' + (dark ? ' mdl-btn--primary' : '');
  if (btnL) btnL.className = 'mdl-btn' + (!dark ? ' mdl-btn--primary' : '');
}
