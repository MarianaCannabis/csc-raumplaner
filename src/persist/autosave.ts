/**
 * Autosave (P-TrackA Phase 1).
 *
 * localStorage['csc-autosave'] = JSON-Blob des Projekts,
 * localStorage['csc-autosave-ts'] = Date.now() als String.
 *
 * Wird in index.html aus der snapshot()-Funktion getriggert (bei jeder
 * Room/Object-Mutation). Hier: pure Read/Write-Helpers + Staleness-Check.
 */

import type { AutosaveRecord, ProjectState } from './types.js';

export const STORAGE_KEY = 'csc-autosave';
export const TS_KEY = 'csc-autosave-ts';

/** Max-Age default: 14 Tage. Älter → als stale verworfen. */
export const MAX_AGE_MS = 14 * 24 * 3600 * 1000;

/**
 * Schreibt den aktuellen Projekt-State ins Autosave-Slot. Accepts either
 * einen ProjectState-Object (wird serialisiert) oder einen bereits
 * vor-serialisierten JSON-String (für den Hot-Path aus snapshot(), wo
 * undoStack[i] schon JSON ist und Double-parse/stringify unnötig wäre).
 * Idempotent-safe (wrappt beides in try/catch — Private Mode + Quota).
 */
export function writeAutosave(state: ProjectState | string): void {
  const serialized = typeof state === 'string' ? state : JSON.stringify(state);
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(TS_KEY, String(Date.now()));
  } catch {
    /* ignore — Private Mode oder Quota-Fehler */
  }
}

/**
 * Liefert den Autosave-Record, wenn vorhanden UND frisch. Stale Records
 * (älter als MAX_AGE_MS) werden als nicht-vorhanden behandelt.
 * Gibt null zurück für: kein Record, defekter Record, stale Record.
 */
export function readAutosave(): AutosaveRecord | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const tsRaw = localStorage.getItem(TS_KEY);
    if (!saved) return null;
    const ts = Number(tsRaw) || 0;
    if (ts > 0 && Date.now() - ts > MAX_AGE_MS) return null;
    // Optional room-count-preview für das UI, ohne das ganze Blob nochmal
    // zurückzureichen. Silent-fail bei defektem JSON.
    let roomCount: number | undefined;
    try {
      const parsed = JSON.parse(saved);
      roomCount = Array.isArray(parsed?.rooms) ? parsed.rooms.length : undefined;
    } catch {
      /* ignore */
    }
    return { saved, ts, roomCount };
  } catch {
    return null;
  }
}

/** Löscht beide Autosave-Keys. Silent-fail. */
export function clearAutosave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TS_KEY);
  } catch {
    /* ignore */
  }
}
