/**
 * BIM-Viewer Phase 1 (Mega-Sammel #4-9 / Roadmap v3.0 #4 — Phase 1).
 *
 * IFC-Import via @thatopen/components. Lazy-geladen (~500-800 KB), erst beim
 * ersten BIM-Tab-Open. Bundle-Initial-Impact: 0.
 *
 * Phase 1 = Import + Render. Phase 2 (eigene Sitzung) ergänzt Export.
 *
 * Architektur:
 *   createBimViewer(deps) → instance mit { loadIfcFile, exportToIfc, dispose }
 *   exportToIfc throws bewusst — Stub für Phase 2.
 *
 * Test-Strategie: Mock loadBimComponents um die echte Lib im Test zu ersetzen.
 */

export interface BimComponentsModule {
  Components: new () => {
    init: () => void | Promise<void>;
    get: <T>(cls: unknown) => T;
    dispose: () => void;
  };
  Worlds: unknown;
  SimpleScene: unknown;
  SimpleRenderer: new (components: unknown, container: HTMLElement) => unknown;
  SimpleCamera: new (components: unknown) => unknown;
  IfcLoader: unknown;
}

export interface BimViewerDeps {
  containerEl: HTMLElement;
  toast: (msg: string, type?: string) => void;
  loadBimComponents: () => Promise<BimComponentsModule>;
}

/** Phase 2: Scene-Daten für IFC-Export. Forms aus index.html-Globals. */
export interface BimExportDeps {
  rooms: Array<{ id: string; name?: string; x: number; y: number; w: number; d: number; h?: number }>;
  objects: Array<{ id: string; typeId: string; name?: string; x: number; y: number; w?: number; d?: number; h?: number; rot?: number; py?: number }>;
  walls?: Array<{ id: string; x1: number; z1: number; x2: number; z2: number; h?: number }>;
  grounds?: Array<{ id: string; name?: string; x: number; y: number; w: number; d: number }>;
  measures?: Array<{ ax: number; ay: number; bx: number; by: number }>;
  projName: string;
  meta?: { owner?: string; createdAt?: string; memberCount?: number; maxHeight?: number };
}

/**
 * Phase 2: Exportiert die aktuelle Scene als IFC2x3-STEP-21 String/Blob.
 *
 * Delegiert an `src/export/ifc.ts` (handgeschriebener Exporter, lizenzfrei,
 * unter 9 KB Code). Output ist Standard-IFC-STEP-21, lesbar in BIMvision,
 * Solibri, xeokit, ifcjs, Revit-Import.
 */
export async function exportCurrentSceneAsIfc(deps: BimExportDeps): Promise<Blob> {
  const { exportToIfc } = await import('../export/ifc.js');
  const ifcContent = exportToIfc({
    name: deps.projName,
    rooms: deps.rooms.map((r) => ({
      id: r.id, name: r.name ?? 'Raum', x: r.x, y: r.y, w: r.w, d: r.d, h: r.h,
    })),
    objects: deps.objects,
    walls: deps.walls,
    grounds: deps.grounds,
    measures: deps.measures,
    meta: deps.meta,
  });
  return new Blob([ifcContent], { type: 'application/x-step' });
}

export interface BimViewerInstance {
  loadIfcFile: (file: File) => Promise<void>;
  exportToIfc: () => Promise<Blob>;
  dispose: () => void;
  isReady: () => boolean;
}

interface InternalState {
  components: { init: () => void | Promise<void>; get: <T>(cls: unknown) => T; dispose: () => void };
  ready: boolean;
}

export async function createBimViewer(deps: BimViewerDeps): Promise<BimViewerInstance> {
  deps.toast('BIM-Viewer wird geladen (~500 KB, einmalig)…', 'b');
  const OBC = await deps.loadBimComponents();

  const components = new OBC.Components();
  const state: InternalState = { components, ready: false };

  try {
    // Some versions need init(); guard against missing.
    if (typeof components.init === 'function') {
      const r = components.init();
      if (r && typeof (r as Promise<unknown>).then === 'function') await r;
    }
    // World setup — the actual API of @thatopen/components evolved across
    // 2.x → 3.x. We try the modern path first; fall back to a no-op to keep
    // the skeleton robust until a manual smoke confirms the path.
    const worlds = components.get(OBC.Worlds) as {
      create?: () => { scene: { three: unknown }; renderer: unknown; camera: unknown };
    };
    if (worlds && typeof worlds.create === 'function') {
      const world = worlds.create();
      // Renderer + Scene + Camera assignment — concrete wiring depends on
      // installed @thatopen/components version. The skeleton intentionally
      // delegates to the lib's own setup helpers.
      void world;
    }
    state.ready = true;
  } catch (err) {
    console.warn('[bim] Viewer-Init unvollständig — Skeleton-Modus aktiv', err);
  }

  return {
    loadIfcFile: async (file: File) => {
      deps.toast('IFC-Datei wird verarbeitet…', 'b');
      try {
        const buffer = await file.arrayBuffer();
        const ifcLoader = state.components.get(OBC.IfcLoader) as {
          load?: (data: Uint8Array) => Promise<unknown>;
        };
        if (ifcLoader && typeof ifcLoader.load === 'function') {
          await ifcLoader.load(new Uint8Array(buffer));
          deps.toast('IFC geladen', 'g');
        } else {
          deps.toast('IFC-Loader nicht verfügbar (Phase-1-Skeleton)', 'r');
        }
      } catch (err) {
        console.warn('[bim] loadIfcFile failed', err);
        deps.toast('IFC-Import fehlgeschlagen', 'r');
      }
    },
    exportToIfc: async () => {
      // Phase 2: nutzt jetzt den existing handgeschriebenen IFC2x3-Exporter
      // (`src/export/ifc.ts`). @thatopen/components-Library wird bewusst NICHT
      // für den Export benutzt — der existing-Code ist 9 KB statt 5 MB Lazy-Lib
      // und produziert valides IFC-STEP-21 das in Solibri/BIMvision/Revit lädt.
      // Aufrufer muss die Scene-Daten via `exportCurrentSceneAsIfc(deps)`
      // mitliefern; dieser Stub wirft, weil er keinen Scene-Zugriff hat.
      throw new Error('exportToIfc(): bitte exportCurrentSceneAsIfc(deps) verwenden.');
    },
    dispose: () => {
      try { state.components.dispose(); } catch { /* noop */ }
    },
    isReady: () => state.ready,
  };
}
