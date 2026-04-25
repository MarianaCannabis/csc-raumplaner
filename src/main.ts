// P1 entry — loaded alongside the legacy inline script in index.html.
// Modules under src/ live here; legacy globals stay in index.html until
// they get strangled one by one.
//
// P11.3: Main CSS wurde aus index.html hierher ausgelagert — Vite bundlet
// das Stylesheet, purgecss-kompatibel und messbar separat.
// P15: Design-Tokens zuerst importieren — main.css referenziert die CSS-
// Custom-Properties daraus.
import './styles/tokens.css';
import './styles/main.css';
// P15 Topbar-Redesign: additive Button-Variants + Segmented-Control +
// Focus-Ring aus design/topbar-redesign/. Die Klassen sind da, der HTML-
// Block in index.html migriert cluster-für-cluster in einer Folge-PR.
import './styles/topbar-v2.css';
// P15 Cluster 7a — Surface-Design-System: Sidebar (Rail + Panel). Nach
// topbar-v2, damit surface-eigene Properties topbar-Resets überschreiben
// können, ohne dass wir mit Specificity kämpfen.
import './styles/surfaces.css';
// P15 Cluster 7x — Help-Button-Pulse (Variante A, first-session-only).
import './styles/help-pulse.css';
import * as compliance from './compliance/index.js';
import * as geo from './geo/overpass.js';
import * as defaults from './config/defaults.js';
import { scheduleAnalysis, subscribe, getLatestAnalysis } from './compliance/escapeAnalysis.js';
import { loadModel, fitToBounds } from './three/assetLoader.js';
import { makeMaterial, loadGroundMaterial } from './three/materials.js';
import type { MaterialKey } from './three/materials.js';
import * as primitiveBuilders from './three/primitiveBuilders.js';
import * as environment from './three/environment.js';
import { NEW_CATALOG } from './catalog/index.js';
import { RICH_PRIMITIVES, EVENT_ITEMS, EVENT_ITEMS_P2, CSC_EXPANSION_ITEMS, CSC_EXPANSION_ITEMS_P2 } from './catalog/items/primitives.js';
import { CREDITS, renderCreditsHtml } from './catalog/credits.js';
import { GROUND_MATERIALS, findGroundMaterial } from './catalog/grounds.js';
import type { GroundMaterial } from './catalog/grounds.js';
import { processUpload, estimateImageMapBytes } from './util/imageUpload.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { STAND_TEMPLATES, findTemplate } from './templates/index.js';
import type { StandTemplate } from './templates/index.js';
import { calcMesseBudget, fmtEUR } from './compliance/budget.js';
import type { BudgetResult } from './compliance/budget.js';
import { exportToIfc, downloadIfc } from './export/ifc.js';
import type { IfcProject } from './export/ifc.js';
import { t, setLang, LANG, availableLanguages } from './i18n/index.js';
import type { SupportedLang } from './i18n/index.js';
import { userTier, currentLimits, hasFeature, checkLimit, PLANS } from './config/features.js';
import { buildPackList } from './compliance/packlist.js';
import { registerGlobalShortcuts } from './input/keyboard.js';
import { icon, type IconName } from './icons/lucide.js';
import { installBridge as installPersistBridge } from './persist/index.js';
import type { PersistBridge } from './persist/index.js';
import { toast } from './legacy/toast.js';
import { addMsg, renderAIText } from './legacy/aiMessages.js';
import { showCrashModal } from './legacy/errorBoundary.js';
import { updateSbStatus, setSbMsg } from './legacy/sbStatus.js';
import * as inlineRename from './legacy/inlineRename.js';
import * as authUI from './legacy/authUI.js';
import * as saves from './legacy/saves.js';
import * as renderPresets from './legacy/renderPresets.js';
import * as exports10 from './legacy/exports.js';
import * as userTemplatesRead from './legacy/userTemplatesRead.js';
import * as exports3d from './legacy/exports3d.js';
import * as undoRedo from './legacy/undoRedo.js';
import * as viewControls from './legacy/viewControls.js';
import * as complianceBridge from './legacy/complianceBridge.js';
import type { CompletedRoom, SceneObject } from './legacy/types.js';
import * as authSupabase from './auth/supabase.js';
import * as authState from './auth/state.js';
import { consumeMagicLinkFromHash } from './auth/magicLink.js';

console.info('[csc] vite entry alive', import.meta.env.MODE);

// P-TrackA Phase 1: Persistence-Namespace auf window.cscPersist exposen.
// Legacy-Funktionen in index.html (saveProj/saveVersion/…) delegieren an
// diese Bridge. Siehe src/persist/*.ts für die extrahierte Logik.
installPersistBridge();

// P-TrackA Phase 2a/2b.1: Auth-API auf window.cscAuth exposen.
// Phase 2a: Pure Helpers + Async-Cores aus supabase.ts.
// Phase 2b.1: State-Module aus state.ts (getAuthState, setToken,
//             subscribe, clearAuth) — Single-Source-of-Truth.
// Beide werden flach gemergt: Legacy-Call-Sites kennen window.cscAuth
// als eine einzige Auth-Namespace.
(window as unknown as { cscAuth?: typeof authSupabase & typeof authState }).cscAuth = {
  ...authSupabase,
  ...authState,
};

// P-TrackA Phase 2b.1: Mirror-Sync von State → Legacy-Globals.
// Die `var SB_TOKEN / SB_USER`-Deklarationen in index.html bleiben als
// lesbare Mirrors — sonst würde `SB_TOKEN`-Reads in Inline-Script-Scope
// einen ReferenceError werfen (sloppy-mode resolve läuft bei var-scope,
// nicht via window-Properties). Das State-Modul ist single source of
// truth; ein Subscriber hier hält die Globals synchron. Erster Sync-Run
// bei Module-Load überträgt den hydrierten State aus localStorage.
type LegacyGlobals = { SB_TOKEN?: string; SB_USER?: authState.AuthUser | null };
function _syncLegacyGlobals(snap: authState.AuthState): void {
  (window as LegacyGlobals).SB_TOKEN = snap.token;
  (window as LegacyGlobals).SB_USER = snap.user;
}
_syncLegacyGlobals(authState.getAuthState());
authState.subscribe(_syncLegacyGlobals);

// P-TrackA Phase 2b.2: Auth-State-Changes triggern automatisch das UI-
// Refresh (Login-Gate + Auth-Status-Pill). Die index.html-Funktionen
// lesen window.SB_TOKEN/SB_USER, die der Mirror-Sync oben schon aktuell
// hält — d.h. zum Zeitpunkt dieses Aufrufs liefern sie den neuen State.
// Vorher musste jede Auth-Mutation-Site updateAuthStatus()+updateLoginGate()
// manuell aufrufen; jetzt laufen beide einmal zentral.
authState.subscribe(() => {
  const w = window as unknown as {
    updateAuthStatus?: () => void;
    updateLoginGate?: () => void;
  };
  try { w.updateAuthStatus?.(); } catch (e) { console.warn('[auth] updateAuthStatus threw', e); }
  try { w.updateLoginGate?.(); } catch (e) { console.warn('[auth] updateLoginGate threw', e); }
});

// Hotfix v2.6.1: Magic-Link-Redirect verarbeiten. Die Legacy-Funktion
// handleAuthRedirect() in index.html lief BEVOR window.cscAuth installiert
// war und returnte früh — in Production resultierte das nach jedem
// Magic-Link-Klick in erneutem Login-Prompt. Hier am Module-Boot ist die
// Bridge fertig, und der Subscribe oben triggert updateLoginGate +
// updateAuthStatus automatisch nach setToken().
if (typeof window !== 'undefined') {
  consumeMagicLinkFromHash(window.location.hash, {
    saveRefresh: (rt) => {
      try { localStorage.setItem('csc-sb-refresh', rt); } catch { /* quota / private-mode */ }
    },
    replaceHistory: () => {
      history.replaceState(null, '', location.pathname + location.search);
    },
    onSuccess: () => {
      const toast = (window as unknown as { toast?: (msg: string, kind: string) => void }).toast;
      if (typeof toast === 'function') toast('✅ Eingeloggt!', 'g');
    },
  });
}

// Bridge GLTFExporter onto the globally-available legacy THREE (from CDN).
// Der legacy exportGLTF()-Handler ruft `new THREE.GLTFExporter()` — ohne
// diese Zuweisung hat er kein GLTFExporter. Früher kam er aus einem
// separaten CDN-Tag; der ist entfernt (duplicate-Warning), der Exporter
// kommt jetzt aus dem npm-Bundle (single source of truth).
declare global {
  interface Window {
    THREE: any;
    /** Hotfix v2.6.3: typisiert, damit zukünftiger Drift zwischen
     *  Modul-Signatur (persist/*) und TS-Callsite bei Build-Time
     *  gefangen wird. Legacy-JS in index.html ist weiterhin untyped —
     *  dafür gibt's den Runtime-Guard in saveCloudProject. */
    cscPersist: PersistBridge;
    /** P17.1: toast() aus src/legacy/toast.ts (extrahiert aus inline-
     *  Script). 304 Caller in index.html bleiben kompatibel über die
     *  window-Bindung unten. Folge-Module der P17-Serie hängen sich
     *  an dieselbe Stelle. */
    toast: typeof toast;
    /** P17.2: Compliance-Bridge — Closure-Wrapper um die deps-DI-Funktionen
     *  in complianceBridge. Inline-Caller im index.html callen diese ohne
     *  deps-Argument; der Wrapper liest die Legacy-Globals zur Aufrufzeit. */
    calcHealthScore: () => number;
    renderComplianceBadges: () => void;
    showHealthDetails: () => void;
    /** P17.3: KI-Chat-Notifications aus src/legacy/aiMessages.ts. addMsg
     *  appendet ins #ai-msgs-Panel; renderAIText XSS-hardened Markdown-
     *  Render. Pure DOM, keine Closure-Wrapper nötig. */
    addMsg: typeof addMsg;
    renderAIText: typeof renderAIText;
    /** P17.4: Crash-Modal aus src/legacy/errorBoundary.ts. Listener-
     *  Registrierung BLEIBT inline in index.html (Boot-Time-Coverage),
     *  nur die Modal-Render-Logik wird via window-Bind aufgerufen. */
    showCrashModal: typeof showCrashModal;
    /** P17.5: Cloud-Status-Bar UI-Helpers aus src/legacy/sbStatus.ts.
     *  Pure DOM-Updaters, keine Closure-Wrapper. */
    updateSbStatus: typeof updateSbStatus;
    setSbMsg: typeof setSbMsg;
    /** P17.6: Inline-Rename (Raum + Projekt) aus src/legacy/inlineRename.ts.
     *  Closure-Wrapping nötig, weil mehrere Legacy-Globals betroffen
     *  (rooms, wx2cx, wy2cy, draw2D, renderLeft, snapshot, projName, closeM). */
    startInlineRename: (roomId: string, x: number, y: number) => void;
    doRename: () => void;
    startInlineProjectRename: () => void;
    finishInlineProjectRename: () => void;
    /** P17.7: Auth-UI aus src/legacy/authUI.ts. Closure-Wrap für SB_TOKEN/
     *  SB_USER/__cscE2E-Reads zur Aufrufzeit. */
    updateAuthStatus: () => void;
    updateLoginGate: () => void;
    setGateState: (s: 'default' | 'awaiting') => void;
    /** P17.8: Save-Family aus src/legacy/saves.ts. Section A (Local) +
     *  Section B (User-Templates). Closure-Wrap-Helpers liefern Legacy-
     *  Globals + cscPlan/cscTelemetry-Bridges. */
    saveProj: () => void;
    updateSavedUI: () => void;
    delSave: (name: string) => void;
    saveAsUserTemplate: () => void;
    doSaveUserTemplate: () => Promise<void>;
    /** P17.9: High-Res-Render-Preset aus src/legacy/renderPresets.ts.
     *  Three.js-touch — erstes P17-Modul mit WebGL-Pipeline. Closure-Wrap
     *  liefert scene/_computeSceneBounds zur Aufrufzeit. */
    renderHighResPreset: (preset: string, defaultW: number, defaultH: number) => void;
    /** P17.10: Export-Family (PDF + CSV) aus src/legacy/exports.ts.
     *  Pure DOM/Math-Pipelines, keine async-Pfade. */
    exportPDF: () => void;
    exportFurnitureCSV: () => void;
    exportBudgetCSV: () => void;
    /** P17.11: User-Templates Cloud-Read aus src/legacy/userTemplatesRead.ts.
     *  Module-internal Cache; saves.ts (P17.8) invalidiert via Hook. */
    loadUserTemplates: () => Promise<userTemplatesRead.UserTemplate[]>;
    deleteUserTemplate: (id: string) => Promise<void>;
    applyUserTemplate: (id: string) => void;
    /** P17.12: 3D-Exports (GLTF + DXF) aus src/legacy/exports3d.ts.
     *  GLTF nutzt three/examples GLTFExporter (npm-bundle), DXF ist
     *  pure String-Math. */
    exportGLTF: () => Promise<void>;
    exportDXF: () => void;
    /** P17.13: Undo/Redo Stack-Management aus src/legacy/undoRedo.ts.
     *  Module-internal Stack; Inline-snapshot()/undo()/redo() rufen
     *  durch und behalten ihre Side-Effects (Serialize, Restore). */
    _undoRedo_pushSnapshot: (state: string) => void;
    _undoRedo_undo: () => string | null;
    _undoRedo_redo: () => string | null;
    _undoRedo_canUndo: () => boolean;
    _undoRedo_canRedo: () => boolean;
    /** P17.14: View-Controls aus src/legacy/viewControls.ts.
     *  Tightly-coupled mit Three.js + Canvas; Closure-Wrapper schaufelt
     *  ~10 Legacy-Globals durch. */
    setView: (v: viewControls.ViewMode) => void;
    fitViewToRooms: () => void;
    switchFloor: (id: string) => void;
  }
}
if (typeof window !== 'undefined' && (window as any).THREE) {
  (window as any).THREE.GLTFExporter = GLTFExporter;
}
// P17.1: toast() global verfügbar machen für die 304 Caller in index.html.
window.toast = toast;

// P17.3: aiMessages — addMsg (74 Caller) + renderAIText (2 Caller).
// Pure DOM, keine Deps zu wrappen.
window.addMsg = addMsg;
window.renderAIText = renderAIText;

// P17.4: Crash-Modal. Listener-Registrierung in index.html behält die
// Boot-Time-Coverage; das Modul-Modal wird hier verfügbar gemacht.
window.showCrashModal = showCrashModal;

// P17.5: Cloud-Status-Bar — pure DOM, keine Deps zu wrappen.
window.updateSbStatus = updateSbStatus;
window.setSbMsg = setSbMsg;

// P17.6: Inline-Rename — Closure-Wrapping über Legacy-Globals.
function buildRoomRenameDeps(): inlineRename.StartInlineRoomRenameDeps {
  const w = window as unknown as {
    rooms?: import('./legacy/types.js').CompletedRoom[];
    wx2cx?: (x: number) => number;
    wy2cy?: (y: number) => number;
    draw2D?: () => void;
    renderLeft?: () => void;
    snapshot?: () => void;
  };
  return {
    rooms: w.rooms ?? [],
    wx2cx: w.wx2cx ?? ((x: number) => x),
    wy2cy: w.wy2cy ?? ((y: number) => y),
    draw2D: w.draw2D ?? (() => {}),
    renderLeft: w.renderLeft ?? (() => {}),
    snapshot: w.snapshot ?? (() => {}),
  };
}
function buildProjectRenameDeps(): inlineRename.ProjectRenameDeps {
  const w = window as unknown as {
    projName?: string;
    closeM?: (id: string) => void;
    snapshot?: () => void;
    toast?: (msg: string, type: string) => void;
  };
  return {
    setProjName: (name: string) => {
      (window as unknown as { projName?: string }).projName = name;
    },
    getCurrentProjName: () => w.projName ?? 'Projekt',
    closeM: w.closeM ?? (() => {}),
    snapshot: w.snapshot,
    toast: w.toast,
  };
}
window.startInlineRename = (roomId, x, y) =>
  inlineRename.startInlineRename(roomId, x, y, buildRoomRenameDeps());
window.doRename = () => inlineRename.doRename(buildProjectRenameDeps());
window.startInlineProjectRename = () =>
  inlineRename.startInlineProjectRename(buildProjectRenameDeps());
window.finishInlineProjectRename = () =>
  inlineRename.finishInlineProjectRename(buildProjectRenameDeps());

// P17.7: Auth-UI — Closure-Wrap für Legacy-Globals SB_TOKEN/SB_USER/__cscE2E.
function buildAuthDeps(): authUI.AuthUIDeps {
  const w = window as unknown as {
    SB_TOKEN?: string;
    SB_USER?: authUI.AuthUser | null;
    __cscE2E?: boolean;
  };
  return {
    token: w.SB_TOKEN || null,
    user: w.SB_USER || null,
    e2eMode: !!w.__cscE2E,
  };
}
window.updateAuthStatus = () => authUI.updateAuthStatus(buildAuthDeps());
window.updateLoginGate = () => authUI.updateLoginGate(buildAuthDeps());
window.setGateState = (s) => authUI.setGateState(s);

// P17.8: Save-Family — Closure-Wrap. Local-Save-Bridge nutzt die
// _local*-Helpers aus dem inline-script (die wiederum auf
// window.cscPersist.local delegieren — siehe Track A Phase 1).
function buildLocalSaveDeps(): saves.LocalSaveDeps {
  const w = window as unknown as {
    projName?: string;
    getPD?: () => unknown;
    _localSave?: (n: string, d: unknown) => void;
    _localLoadAll?: () => Record<string, saves.SavedRecord>;
    _localDelete?: (n: string) => void;
    _localCountExcluding?: (n: string) => number;
    toast?: (msg: string, type?: string) => void;
    cscPlan?: { check: (k: string, c: number) => boolean };
    cscTelemetry?: { track: (e: string, p: Record<string, unknown>) => void };
  };
  return {
    projName: w.projName ?? 'Projekt',
    getPD: w.getPD ?? (() => ({})),
    localSave: w._localSave ?? (() => {}),
    localLoadAll: w._localLoadAll ?? (() => ({})),
    localDelete: w._localDelete ?? (() => {}),
    localCountExcluding: w._localCountExcluding ?? (() => 0),
    toast: w.toast ?? (() => {}),
    cscPlan: w.cscPlan,
    cscTelemetry: w.cscTelemetry,
  };
}
function buildTemplateSaveDeps(): saves.TemplateSaveDeps {
  const w = window as unknown as {
    projName?: string;
    fpCv?: HTMLCanvasElement;
    getPD?: () => { rooms?: Array<{ w: number; d: number }> };
    openM?: (id: string) => void;
    closeM?: (id: string) => void;
    toast?: (msg: string, type?: string) => void;
    SB_URL?: string;
    SB_KEY?: string;
    SB_TOKEN?: string;
    SB_USER?: { id?: string };
    _userTemplatesCache?: unknown[];
    _userTemplatesLoadedAt?: number;
  };
  return {
    projName: w.projName ?? 'Projekt',
    isDefaultProjName: (n) => n === 'Neue Ausgabestelle',
    fpCv: w.fpCv ?? null,
    getPD: w.getPD ?? (() => ({})),
    openM: w.openM ?? (() => {}),
    closeM: w.closeM ?? (() => {}),
    toast: w.toast ?? (() => {}),
    sbUrl: w.SB_URL ?? '',
    sbKey: w.SB_KEY ?? '',
    sbToken: w.SB_TOKEN ?? null,
    sbUser: w.SB_USER ?? null,
    invalidateTemplatesCache: () => {
      // P17.11-Bridge: Modul-Cache und Inline-Shadow synchronisieren.
      userTemplatesRead.invalidateUserTemplatesCache();
      w._userTemplatesCache = [];
      w._userTemplatesLoadedAt = 0;
    },
  };
}
window.saveProj = () => saves.saveProj(buildLocalSaveDeps());
window.updateSavedUI = () => saves.updateSavedUI(buildLocalSaveDeps());
window.delSave = (name) => saves.delSave(name, buildLocalSaveDeps());
window.saveAsUserTemplate = () => saves.saveAsUserTemplate(buildTemplateSaveDeps());
window.doSaveUserTemplate = () => saves.doSaveUserTemplate(buildTemplateSaveDeps());

// P17.9: High-Res-Render — Closure-Wrap. Liest scene + _computeSceneBounds
// zur Aufrufzeit (rend3 ist nicht needed im Modul; wir spawnen einen
// eigenen WebGLRenderer). renderToDataURL ist die Three.js-Pipeline aus
// dem Modul — closures binden scene + bounds zur Aufrufzeit.
// P17.10: Export-Family Closure-Wrap.
function buildExportDeps(): exports10.ExportDeps {
  const w = window as unknown as {
    objects?: import('./legacy/types.js').SceneObject[];
    rooms?: import('./legacy/types.js').CompletedRoom[];
    projName?: string;
    curFloor?: string;
    findItem?: (id: string) => exports10.CatalogItemView | null | undefined;
    getObjPrice?: (id: string) => number;
    toast?: (msg: string, type?: string) => void;
  };
  return {
    objects: w.objects ?? [],
    rooms: w.rooms ?? [],
    projName: w.projName ?? 'Projekt',
    curFloor: w.curFloor ?? 'eg',
    findItem: w.findItem ?? (() => null),
    getObjPrice: w.getObjPrice ?? (() => 0),
    toast: w.toast ?? (() => {}),
  };
}
window.exportPDF = () => exports10.exportPDF(buildExportDeps());
window.exportFurnitureCSV = () => exports10.exportFurnitureCSV(buildExportDeps());
window.exportBudgetCSV = () => exports10.exportBudgetCSV(buildExportDeps());

// P17.11: User-Templates Cloud-Read.
function buildUserTemplatesDeps(): userTemplatesRead.UserTemplatesDeps {
  const w = window as unknown as { SB_URL?: string; SB_KEY?: string; SB_TOKEN?: string };
  return {
    sbUrl: w.SB_URL ?? '',
    sbKey: w.SB_KEY ?? '',
    sbToken: w.SB_TOKEN ?? null,
  };
}
function buildUserTemplatesUIDeps(): userTemplatesRead.UserTemplatesUIDeps {
  const w = window as unknown as {
    closeM?: (id: string) => void;
    openTemplates?: () => void;
    toast?: (msg: string, type?: string) => void;
    loadPD?: (data: unknown) => void;
  };
  return {
    ...buildUserTemplatesDeps(),
    closeM: w.closeM ?? (() => {}),
    refreshTemplatesUI: w.openTemplates,
    toast: w.toast ?? (() => {}),
    loadPD: w.loadPD ?? (() => {}),
  };
}
window.loadUserTemplates = () => userTemplatesRead.loadUserTemplates(buildUserTemplatesDeps());
window.deleteUserTemplate = (id) => userTemplatesRead.deleteUserTemplate(id, buildUserTemplatesUIDeps());
window.applyUserTemplate = (id) => userTemplatesRead.applyUserTemplate(id, buildUserTemplatesUIDeps());

// P17.12: 3D-Exports (GLTF + DXF).
window.exportGLTF = () => {
  const w = window as unknown as { scene?: import('three').Scene; projName?: string; toast?: (m: string, t?: string) => void };
  return exports3d.exportGLTF({
    scene: w.scene ?? null,
    projName: w.projName ?? 'Projekt',
    toast: w.toast ?? (() => {}),
  });
};
// P17.13: Undo/Redo wiring — Update-Buttons-Callback registrieren + pure
// Stack-API exportieren. Inline-snapshot/undo/redo rufen durch.
undoRedo.setUpdateButtonsCallback(() => {
  const w = window as unknown as { _updUndoBtns?: () => void };
  if (typeof w._updUndoBtns === 'function') w._updUndoBtns();
});
// P17.14: View-Controls — drei separate Closure-Wrapper. Größere Anzahl
// von Legacy-Globals (cam3, scene-helpers, vpZoom, etc.); jeder Wrapper
// liest die aktuellen Werte zur Aufrufzeit aus window.*.
window.setView = (v) => {
  const w = window as unknown as {
    fpCv?: HTMLCanvasElement;
    tCv?: HTMLCanvasElement;
    fpCam3?: unknown;
    oCam?: unknown;
    grid3?: { visible: boolean };
    draw2D?: () => void;
    currentView?: viewControls.ViewMode;
    cam3?: unknown;
  };
  viewControls.setView(v, {
    setCurrentView: (val) => { w.currentView = val; },
    fpCv: w.fpCv ?? null,
    tCv: w.tCv ?? null,
    exitPointerLock: () => document.exitPointerLock(),
    draw2D: w.draw2D ?? (() => {}),
    setCam3: (cam) => { w.cam3 = cam; },
    fpCam3: w.fpCam3,
    oCam: w.oCam,
    setGrid3Visible: (vis) => { if (w.grid3) w.grid3.visible = vis; },
  });
};
window.fitViewToRooms = () => {
  const w = window as unknown as {
    rooms?: import('./legacy/types.js').CompletedRoom[];
    fpCv?: HTMLCanvasElement;
    vpZoom?: number; vpX?: number; vpY?: number;
    draw2D?: () => void;
    toast?: (msg: string, type?: string) => void;
  };
  viewControls.fitViewToRooms({
    rooms: w.rooms ?? [],
    fpCv: w.fpCv ?? null,
    setVpZoom: (v) => { w.vpZoom = v; },
    setVpX: (v) => { w.vpX = v; },
    setVpY: (v) => { w.vpY = v; },
    draw2D: w.draw2D ?? (() => {}),
    toast: w.toast ?? (() => {}),
  });
};
window.switchFloor = (id) => {
  const w = window as unknown as {
    curFloor?: string;
    selId?: string | null; selIsRoom?: boolean; selIsWall?: boolean;
    floors?: ReadonlyArray<{ id: string; name: string }>;
    renderFloorTabs?: () => void;
    renderLeft?: () => void;
    draw2D?: () => void;
    rebuild3D?: () => void;
    updateSelBotBar?: () => void;
    toast?: (msg: string, type?: string) => void;
  };
  viewControls.switchFloor(id, {
    setCurFloor: (i) => { w.curFloor = i; },
    setSel: (s, r, wall) => { w.selId = s; w.selIsRoom = r; w.selIsWall = wall; },
    floors: w.floors ?? [],
    renderFloorTabs: w.renderFloorTabs ?? (() => {}),
    renderLeft: w.renderLeft ?? (() => {}),
    draw2D: w.draw2D ?? (() => {}),
    rebuild3D: w.rebuild3D ?? (() => {}),
    updateSelBotBar: w.updateSelBotBar ?? (() => {}),
    toast: w.toast ?? (() => {}),
  });
};

window._undoRedo_pushSnapshot = undoRedo.pushSnapshot;
window._undoRedo_undo = undoRedo.undo;
window._undoRedo_redo = undoRedo.redo;
window._undoRedo_canUndo = undoRedo.canUndo;
window._undoRedo_canRedo = undoRedo.canRedo;

window.exportDXF = () => {
  const w = window as unknown as {
    rooms?: import('./legacy/types.js').CompletedRoom[];
    objects?: import('./legacy/types.js').SceneObject[];
    walls?: { x1: number; z1: number; x2: number; z2: number }[];
    measures?: { ax: number; ay: number; bx: number; by: number }[];
    grounds?: { x: number; y: number; w: number; d: number }[];
    projName?: string;
    findItem?: (id: string) => { cat?: string; name?: string; w?: number; d?: number; h?: number } | null | undefined;
    toast?: (m: string, t?: string) => void;
  };
  return exports3d.exportDXF({
    rooms: w.rooms ?? [],
    objects: w.objects ?? [],
    walls: w.walls ?? [],
    measures: w.measures ?? [],
    grounds: w.grounds,
    projName: w.projName ?? 'Projekt',
    findItem: w.findItem ?? (() => null),
    toast: w.toast ?? (() => {}),
  });
};

window.renderHighResPreset = (preset, defaultW, defaultH) => {
  const w = window as unknown as {
    scene?: import('three').Scene;
    _computeSceneBounds?: () => renderPresets.SceneBounds;
    projName?: string;
    toast?: (msg: string, type?: string) => void;
  };
  renderPresets.renderHighResPreset(preset, defaultW, defaultH, {
    getSizeOverride: () => {
      const sel = document.getElementById('hr-size') as HTMLSelectElement | null;
      return sel?.value || null;
    },
    setStatus: (text: string) => {
      const status = document.getElementById('hr-status');
      if (status) status.textContent = text;
    },
    toast: w.toast ?? (() => {}),
    projName: w.projName ?? 'Projekt',
    renderToDataURL: (preset2, width, height) =>
      renderPresets.renderSceneToDataURL(preset2, width, height, {
        scene: w.scene ?? null,
        computeBounds: w._computeSceneBounds ?? (() => {
          throw new Error('_computeSceneBounds nicht verfügbar');
        }),
      }),
  });
};

// P17.2: Compliance-Bridge — Closures wrap deps automatisch aus den Legacy-
// Globals. Inline-Caller in index.html (8 Sites) bleiben so kompatibel ohne
// deps-Argument-Migration. Wenn alle Caller migriert sind, kann die Closure
// entfallen und die DI-Funktionen direkt zugänglich sein.
function buildComplianceDeps(): complianceBridge.ComplianceBridgeDeps {
  const w = window as unknown as {
    rooms?: readonly CompletedRoom[];
    objects?: readonly SceneObject[];
    projMeta?: Record<string, unknown>;
    curFloor?: string;
    currentView?: '2d' | '3d';
    _realtimeCompliance?: boolean;
    SB_URL?: string;
    SB_KEY?: string;
    getKCaNGChecklist?: () => Array<{ passed: boolean; label: string }>;
    wx2cx?: (x: number) => number;
    wy2cy?: (y: number) => number;
    cscCompliance?: complianceBridge.ComplianceBridgeDeps['registry'];
    addMsg?: (msg: string, type: string) => void;
    showRight?: (panel: string) => void;
  };
  return {
    rooms: w.rooms ?? [],
    objects: w.objects ?? [],
    projMeta: w.projMeta ?? {},
    curFloor: w.curFloor ?? 'eg',
    currentView: w.currentView ?? '2d',
    realtimeCompliance: !!w._realtimeCompliance,
    cloudConnected: !!(w.SB_URL && w.SB_KEY),
    autosaveEnabled: !!localStorage.getItem('csc-autosave'),
    getKCaNGChecklist: w.getKCaNGChecklist ?? (() => []),
    wx2cx: w.wx2cx ?? ((x: number) => x),
    wy2cy: w.wy2cy ?? ((y: number) => y),
    registry: w.cscCompliance,
    addMsg: w.addMsg,
    showRight: w.showRight,
  };
}
window.calcHealthScore = () => {
  const score = complianceBridge.calcHealthScore(buildComplianceDeps());
  // Legacy: ein paar Inline-Sites lesen aus _healthScore. Hier den Wert
  // synchron in den globalen State zurückspielen, damit kein Drift entsteht.
  (window as unknown as { _healthScore?: number })._healthScore = score;
  return score;
};
window.renderComplianceBadges = () => complianceBridge.renderComplianceBadges(buildComplianceDeps());
window.showHealthDetails = () => complianceBridge.showHealthDetails(buildComplianceDeps());
const _allRules = compliance.listRules();
const _projectRules = _allRules.filter((r) => (r.scope ?? 'project') === 'project').length;
const _roomRules = _allRules.filter((r) => r.scope === 'room').length;
console.info(
  `[csc] compliance rules registered: ${_allRules.length} (project: ${_projectRules}, room: ${_roomRules})`,
);

// When the escape-route worker returns a new result, nudge the legacy
// badge bar so the `flucht` rule's outcome repaints against fresh data.
subscribe(() => {
  // The render function is a legacy global — guard in case it hasn't been
  // defined yet (early boot, or a future refactor that renames it).
  const fn = (window as unknown as { renderComplianceBadges?: () => void }).renderComplianceBadges;
  if (typeof fn === 'function') {
    try { fn(); } catch (e) { console.warn('[compliance] renderComplianceBadges threw', e); }
  }
});

// Legacy bridge: expose modules on window so index.html can drive them
// without a build round-trip. cscEscape.schedule() is called from
// legacy draw2D / rebuild3D hooks on room/object changes.
declare global {
  interface Window {
    cscCompliance: typeof compliance;
    cscGeo: typeof geo;
    cscDefaults: typeof defaults;
    cscEscape: {
      schedule: typeof scheduleAnalysis;
      getLatest: typeof getLatestAnalysis;
    };
    cscAssets: {
      loadModel: typeof loadModel;
      fitToBounds: typeof fitToBounds;
    };
    cscMaterials: {
      make: (kind: MaterialKey, colorOverride?: number) => import('three').MeshStandardMaterial;
    };
    cscCatalog: {
      newItems: typeof NEW_CATALOG;
      richPrimitives: typeof RICH_PRIMITIVES;
      eventItems: typeof EVENT_ITEMS;
      cscExpansionItems: typeof CSC_EXPANSION_ITEMS;
    };
    cscBuilders: typeof primitiveBuilders;
    cscEnv: typeof environment;
    cscCredits: {
      list: typeof CREDITS;
      renderHtml: typeof renderCreditsHtml;
    };
    cscGrounds: {
      materials: typeof GROUND_MATERIALS;
      find: typeof findGroundMaterial;
      loadMaterial: (mat: GroundMaterial, tintOverride?: number) => import('three').MeshStandardMaterial;
    };
    cscImageUpload: {
      processUpload: typeof processUpload;
      estimateBytes: typeof estimateImageMapBytes;
    };
    cscTemplates: {
      list: StandTemplate[];
      find: typeof findTemplate;
      /** Defensive alias for list — some diagnostic snippets call .all(). */
      all: () => StandTemplate[];
    };
    cscBudget: {
      calc: typeof calcMesseBudget;
      fmtEUR: typeof fmtEUR;
    };
    cscPacklist: {
      build: typeof buildPackList;
    };
    cscIfc: {
      exportToIfc: typeof exportToIfc;
      download: typeof downloadIfc;
    };
    cscI18n: {
      t: typeof t;
      setLang: typeof setLang;
      current: () => SupportedLang;
      available: typeof availableLanguages;
    };
    cscPlan: {
      tier: typeof userTier;
      limits: typeof currentLimits;
      has: typeof hasFeature;
      check: typeof checkLimit;
      plans: typeof PLANS;
    };
  }
}
window.cscCompliance = compliance;
window.cscGeo = geo;
window.cscDefaults = defaults;
window.cscEscape = { schedule: scheduleAnalysis, getLatest: getLatestAnalysis };
window.cscAssets = { loadModel, fitToBounds };
window.cscMaterials = { make: makeMaterial };
window.cscCatalog = {
  newItems: NEW_CATALOG,
  richPrimitives: RICH_PRIMITIVES,
  eventItems: [...EVENT_ITEMS, ...EVENT_ITEMS_P2],
  cscExpansionItems: [...CSC_EXPANSION_ITEMS, ...CSC_EXPANSION_ITEMS_P2],
};
console.info('[csc] event catalog ready', (EVENT_ITEMS.length + EVENT_ITEMS_P2.length), 'event items (phase1+2) · CSC-expansion', (CSC_EXPANSION_ITEMS.length + CSC_EXPANSION_ITEMS_P2.length), 'items');
window.cscBuilders = primitiveBuilders;
window.cscEnv = environment;
window.cscCredits = { list: CREDITS, renderHtml: renderCreditsHtml };
window.cscGrounds = { materials: GROUND_MATERIALS, find: findGroundMaterial, loadMaterial: loadGroundMaterial };
window.cscImageUpload = { processUpload, estimateBytes: estimateImageMapBytes };
window.cscTemplates = {
  list: STAND_TEMPLATES,
  find: findTemplate,
  all: () => STAND_TEMPLATES,
};
console.info('[csc] templates bridge ready', STAND_TEMPLATES.length, 'project templates');
window.cscBudget = { calc: calcMesseBudget, fmtEUR };
window.cscPacklist = { build: buildPackList };
window.cscIfc = { exportToIfc, download: downloadIfc };
window.cscI18n = { t, setLang, current: () => LANG, available: availableLanguages };
window.cscPlan = { tier: userTier, limits: currentLimits, has: hasFeature, check: checkLimit, plans: PLANS };

// Project-panel footer: show the most-recent lastVerified so the operator
// knows how fresh the cost/energy defaults are. Rewrites on every boot,
// so a defaults.ts bump is visible without a hard reload ritual.
queueMicrotask(() => {
  const el = document.getElementById('defaults-last-verified');
  if (el) el.textContent = defaults.latestLastVerified();
});

// P17.2: Global-Keyboard-Shortcuts (Teil-Extraktion). Liest die Legacy-
// Handler aus window.*, damit der Wire-Up zur Boot-Zeit keine Top-Level-
// Referenz mehr braucht (die Funktionen sind erst definiert, wenn das
// inline-Script-Block in index.html durchgelaufen ist — type="module"
// ist deferred, also sind wir hier garantiert nach den Legacy-Globals).
// Nicht extrahiert: siehe Kommentar in src/input/keyboard.ts.
type LegacyWindow = Window & {
  openHelpModal?: () => void;
  openHelp?: () => void;
  closeHelp?: () => void;
  showRight?: (panel: string) => void;
  fitViewToRooms?: () => void;
  set2DTool?: (tool: string) => void;
  toggleRuler?: () => void;
  toggleDimensions?: () => void;
  toggleNoteMode?: () => void;
  presentNext?: () => void;
  presentPrev?: () => void;
  exitPresentation?: () => void;
  _presentMode?: boolean;
};
const legacyWin = window as LegacyWindow;
registerGlobalShortcuts({
  openHelpModal: () => legacyWin.openHelpModal?.(),
  openHelp: () => legacyWin.openHelp?.(),
  showKbdOverlay: () =>
    document.getElementById('kbd-overlay')?.classList.add('vis'),
  closeHelp: () => legacyWin.closeHelp?.(),
  isHelpOverlayOpen: () =>
    !!document.getElementById('help-overlay')?.classList.contains('open'),
  focusAI: () => {
    legacyWin.showRight?.('ai');
    const inp = document.getElementById('ai-inp') as HTMLInputElement | null;
    if (inp) {
      inp.focus();
      inp.select();
    }
  },
  fitView: () => legacyWin.fitViewToRooms?.(),
  selectTool: () => legacyWin.set2DTool?.('sel'),
  toggleRuler: () => legacyWin.toggleRuler?.(),
  toggleDimensions: () => legacyWin.toggleDimensions?.(),
  toggleNoteMode: () => legacyWin.toggleNoteMode?.(),
  isPresenting: () => !!legacyWin._presentMode,
  presentNext: () => legacyWin.presentNext?.(),
  presentPrev: () => legacyWin.presentPrev?.(),
  exitPresentation: () => legacyWin.exitPresentation?.(),
});

// P15 Cluster 4a: Lucide-Icons werden per data-icon-Attribut automatisch
// injiziert. Macht HTML frei von Inline-SVG und hält src/icons/lucide.ts
// als Single-Source-of-Truth. Aufruf beim DOMContentLoaded, nicht beim
// Module-Load — manche Elemente existieren erst nach dem Inline-Script.
function populateIcons() {
  document.querySelectorAll<HTMLElement>('[data-icon]').forEach((el) => {
    const name = el.dataset.icon as IconName;
    if (!name) return;
    // Nur befüllen wenn leer — sonst doppelte Icons bei Re-Runs
    if (el.childElementCount === 0) el.innerHTML = icon(name);
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', populateIcons);
} else {
  populateIcons();
}
// Für Widgets die Icons nach Boot brauchen (Custom-Render, etc.)
(window as unknown as { cscPopulateIcons?: () => void }).cscPopulateIcons =
  populateIcons;

// P15 Cluster 7x — Help-Button Pulse (Variante A, first-session-only).
// localStorage['csc-help-seen'] markiert, ob der User die Hilfe bereits
// einmal geöffnet hat. Ohne Eintrag: .is-pulsing auf #btn-help. Ein Click
// auf den Button setzt den Storage + entfernt die Klasse — ab da still.
// Reduced-motion wird vom Stylesheet selbst gehandhabt (Media-Query).
function initHelpPulse() {
  const btn = document.getElementById('btn-help');
  if (!btn) return;
  let seen = false;
  try { seen = localStorage.getItem('csc-help-seen') === '1'; } catch { /* private-mode */ }
  if (!seen) btn.classList.add('is-pulsing');
  btn.addEventListener('click', () => {
    try { localStorage.setItem('csc-help-seen', '1'); } catch { /* ignore */ }
    btn.classList.remove('is-pulsing');
  }, { once: false });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHelpPulse);
} else {
  initHelpPulse();
}
