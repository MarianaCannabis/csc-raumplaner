/**
 * Lokale Projekt-Persistenz (P-TrackA Phase 1).
 *
 * Read/Write gegen localStorage['csc-saves3']. Pure Funktionen — keine
 * DOM-Zugriffe, kein window-Globalstate, keine toast()/UI-Calls. Die
 * legacy-Wrapper in index.html kümmern sich um Soft-Limits (cscPlan),
 * Toast, UI-Refresh und Telemetrie.
 */

import type { ProjectState, SavedProject } from './types.js';

export const STORAGE_KEY = 'csc-saves3';

/** Alle lokal gespeicherten Projekte als Dict `{ [name]: SavedProject }`. */
export function loadAllSaved(): Record<string, SavedProject> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    // Corrupt JSON — kein blind clear, wir geben einfach leer zurück und
    // lassen die nächste save-Operation das file heilen (overwrite).
    return {};
  }
}

/** Liste aller gespeicherten Projekt-Namen (Keys). */
export function listSavedNames(): string[] {
  return Object.keys(loadAllSaved());
}

/**
 * Speichert ein Projekt unter dem gegebenen Namen (overwrite).
 * Gibt das aktualisierte Saved-Objekt zurück, damit Callers ohne
 * weiteren localStorage-Roundtrip das UI refreshen können.
 */
export function saveProject(name: string, data: ProjectState): SavedProject {
  const saves = loadAllSaved();
  const entry: SavedProject = { data, at: new Date().toISOString() };
  saves[name] = entry;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  return entry;
}

/** Löscht ein Projekt. No-op, wenn Name unbekannt. */
export function deleteProject(name: string): void {
  const saves = loadAllSaved();
  if (!(name in saves)) return;
  delete saves[name];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

/** Liefert das einzelne Projekt oder null. */
export function getProject(name: string): SavedProject | null {
  const saves = loadAllSaved();
  return saves[name] ?? null;
}

/**
 * Anzahl der gespeicherten Projekte, optional mit Ausschluss eines
 * Namens (für Soft-Limit-Check beim Re-Save).
 */
export function countExcluding(excludeName: string): number {
  return listSavedNames().filter((k) => k !== excludeName).length;
}
