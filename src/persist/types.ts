/**
 * Shared types for the persistence layer (P-TrackA Phase 1).
 *
 * Diese Interfaces sind absichtlich strukturell — sie spiegeln das
 * Serialization-Format wider, das getPD() seit v2.x produziert. KEINE
 * Schema-Änderungen in diesem Cluster.
 */

/** Was getPD() zurückgibt und loadPD() konsumiert. */
export interface ProjectState {
  rooms?: unknown[];
  objects?: unknown[];
  projMeta?: Record<string, unknown>;
  floors?: unknown[];
  activeFloor?: string;
  measures?: unknown[];
  name?: string;
  [key: string]: unknown;
}

/** Ein Eintrag in der lokalen Save-Liste (csc-saves3). */
export interface SavedProject {
  data: ProjectState;
  at: string; // ISO-Datum
}

/** Eine Version im Version-History-Stack (csc-versions). */
export interface ProjectVersion {
  label: string;
  data: ProjectState;
  ts: number; // Date.now()
}

/** Autosave-Record mit Timestamp für Staleness-Check. */
export interface AutosaveRecord {
  saved: string; // JSON.stringify(ProjectState)
  ts: number;
  roomCount?: number;
}
