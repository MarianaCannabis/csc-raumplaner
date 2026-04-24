/**
 * Persistence-Layer Barrel (P-TrackA Phase 1 + 2b.2).
 *
 * Phase 1 extrahiert die I/O-reinen Module (local/versions/autosave).
 * Phase 2b.2 ergänzt cloud + offline: die Supabase-REST-Clients und
 * die deferred-Action-Queue. UI-Glue (Spinner-Button, Thumbnail via
 * rend3, Confirm-Dialog bei großen Uploads, Toast-Feedback) bleibt
 * bewusst in den Legacy-Wrappern — die Module selbst sind pure.
 *
 * Dieser Barrel registriert `window.cscPersist` als namespaced API für
 * die Legacy-Wrapper in index.html + für künftige src/ Module, die
 * Projekt-Daten speichern/laden müssen.
 */

import * as local from './localProjects.js';
import * as versions from './versionHistory.js';
import * as autosave from './autosave.js';
import * as cloud from './cloudProjects.js';
import * as offline from './offlineQueue.js';
import type { ProjectState, SavedProject, ProjectVersion, AutosaveRecord } from './types.js';

export { local, versions, autosave, cloud, offline };
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
    cloud: {
      save: cloud.saveCloudProject,
      fetchAll: cloud.fetchAllCloudProjects,
      load: cloud.loadCloudProject,
      delete: cloud.deleteCloudProject,
      findByName: cloud.findProjectByName,
      AuthError: cloud.AuthError,
      TableMissingError: cloud.TableMissingError,
    },
    offline: {
      queue: offline.queueAction,
      flush: offline.flushQueue,
      register: offline.registerHandler,
      size: offline.getQueueSize,
      list: offline.listQueue,
      clear: offline.clearQueue,
    },
  };
  (window as unknown as { cscPersist?: typeof bridge }).cscPersist = bridge;
}
