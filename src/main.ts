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

console.info('[csc] vite entry alive', import.meta.env.MODE);

// Bridge GLTFExporter onto the globally-available legacy THREE (from CDN).
// Der legacy exportGLTF()-Handler ruft `new THREE.GLTFExporter()` — ohne
// diese Zuweisung hat er kein GLTFExporter. Früher kam er aus einem
// separaten CDN-Tag; der ist entfernt (duplicate-Warning), der Exporter
// kommt jetzt aus dem npm-Bundle (single source of truth).
declare global { interface Window { THREE: any } }
if (typeof window !== 'undefined' && (window as any).THREE) {
  (window as any).THREE.GLTFExporter = GLTFExporter;
}
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
