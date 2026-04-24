/**
 * Version-History (P-TrackA Phase 1).
 *
 * Ring-Buffer der letzten MAX_VERSIONS Projekt-Snapshots. Persistiert
 * lazy in localStorage['csc-versions']. Neue Einträge landen vorne
 * (unshift), älteste fallen hinten raus (pop).
 *
 * Kein globaler Module-State-Cache — jedes Public-API lädt frisch aus
 * dem Storage. Das hält die Tests isoliert und vermeidet Stale-State
 * bei mehreren Instanzen.
 */

import type { ProjectState, ProjectVersion } from './types.js';

export const STORAGE_KEY = 'csc-versions';
export const MAX_VERSIONS = 10;

/** Alle Versionen (neueste zuerst). Leer bei fehlendem/defektem Storage. */
export function listVersions(): ProjectVersion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Pushed eine neue Version. Label default = aktueller Zeitstempel (DE).
 * Enforced MAX_VERSIONS durch pop() der ältesten. Gibt die aktualisierte
 * Liste zurück.
 */
export function pushVersion(data: ProjectState, label?: string): ProjectVersion[] {
  const versions = listVersions();
  const entry: ProjectVersion = {
    label: label || new Date().toLocaleString('de-DE'),
    data,
    ts: Date.now(),
  };
  versions.unshift(entry);
  while (versions.length > MAX_VERSIONS) versions.pop();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
  } catch {
    /* quota exceeded in private mode — Best-Effort, nicht blockierend */
  }
  return versions;
}

/**
 * Löscht die Version an Position `index`. Gibt die aktualisierte Liste
 * zurück. No-op bei out-of-range-Index.
 */
export function removeVersion(index: number): ProjectVersion[] {
  const versions = listVersions();
  if (index < 0 || index >= versions.length) return versions;
  versions.splice(index, 1);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
  } catch {
    /* ignore */
  }
  return versions;
}

/** Liefert die Version an Position `index` oder null. */
export function getVersion(index: number): ProjectVersion | null {
  const versions = listVersions();
  return versions[index] ?? null;
}
