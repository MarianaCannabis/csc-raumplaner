/**
 * Persistence-Layer Barrel (P-TrackA Phase 1).
 *
 * Phase 1 extrahiert die I/O-reinen Module (local/versions/autosave).
 * Phase 2 (deferred): cloud/offline — die haben tiefe UI- und Auth-
 * Kopplung (refreshTokenIfNeeded, spinner buttons, toast, confirm)
 * und sind besser eigenes Cluster zusammen mit dem Auth-Layer-
 * Extrakt (src/auth/supabase.ts — noch nicht existent).
 *
 * Dieser Barrel registriert `window.cscPersist` als namespaced API für
 * die Legacy-Wrapper in index.html + für künftige src/ Module, die
 * Projekt-Daten speichern/laden müssen.
 */

import * as local from './localProjects.js';
import * as versions from './versionHistory.js';
import * as autosave from './autosave.js';
import type { ProjectState, SavedProject, ProjectVersion, AutosaveRecord } from './types.js';

export { local, versions, autosave };
export type { ProjectState, SavedProject, ProjectVersion, AutosaveRecord };

/**
 * Initialisiert den window.cscPersist-Namespace. Wird von src/main.ts
 * beim Boot einmal aufgerufen — dann können die Legacy-Funktionen in
 * index.html delegieren.
 */
export function installBridge(): void {
  const bridge = {
    local: {
      save: local.saveProject,
      delete: local.deleteProject,
      get: local.getProject,
      listNames: local.listSavedNames,
      loadAll: local.loadAllSaved,
      countExcluding: local.countExcluding,
      STORAGE_KEY: local.STORAGE_KEY,
    },
    versions: {
      push: versions.pushVersion,
      remove: versions.removeVersion,
      get: versions.getVersion,
      list: versions.listVersions,
      STORAGE_KEY: versions.STORAGE_KEY,
      MAX: versions.MAX_VERSIONS,
    },
    autosave: {
      write: autosave.writeAutosave,
      read: autosave.readAutosave,
      clear: autosave.clearAutosave,
      STORAGE_KEY: autosave.STORAGE_KEY,
      TS_KEY: autosave.TS_KEY,
      MAX_AGE_MS: autosave.MAX_AGE_MS,
    },
  };
  (window as unknown as { cscPersist?: typeof bridge }).cscPersist = bridge;
}
