/**
 * Visual-History UX (Sitzung G Schritt 2).
 *
 * Time-Travel-UI mit 3 Modes:
 *   - Slider: horizontale Scroll-Bahn mit Thumbnails
 *   - Grid: 3-spaltige Karten
 *   - Compare: 2 Snapshots nebeneinander mit Diff-Counter
 *
 * Daten kommen vom existierenden changelog.ts-Modul (P17.16) via
 * `getVisualHistory()`. Diese Layer fügt nur die UI hinzu — kein
 * State-Layer.
 *
 * State-Recovery: jeder Entry hat `state` als JSON-String aus snapshot().
 * Wir parsen ihn nur für Diff-Counts; restore delegiert an existierenden
 * `restoreFromVisualHistory(idx, deps)`-Pfad.
 */

import { getVisualHistory, type VisualHistoryEntry } from './changelog.js';
import { computeDiff } from './conflictResolver.js';

export type ViewMode = 'slider' | 'grid' | 'compare';

export interface VisualHistoryUIDeps {
  /** Restore an snapshot. Caller delegiert an changelog.restoreFromVisualHistory. */
  restoreFromIndex: (idx: number) => void;
  /** Toast für Feedback. */
  toast?: (msg: string, type?: string) => void;
}

const MODAL_ID = 'm-visual-history';

let _currentMode: ViewMode = 'slider';
let _compareSelectionIdx: number | null = null;

export function openVisualHistoryModal(deps: VisualHistoryUIDeps): void {
  _currentMode = 'slider';
  _compareSelectionIdx = null;
  ensureModal();
  rerender(deps);
  const overlay = document.getElementById(MODAL_ID);
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.classList.add('open');
  }
}

export function closeVisualHistoryModal(): void {
  const overlay = document.getElementById(MODAL_ID);
  if (overlay) {
    overlay.style.display = 'none';
    overlay.classList.remove('open');
  }
}

export function setMode(mode: ViewMode, deps: VisualHistoryUIDeps): void {
  _currentMode = mode;
  rerender(deps);
}

export function selectForCompare(idx: number, deps: VisualHistoryUIDeps): void {
  _compareSelectionIdx = idx;
  _currentMode = 'compare';
  rerender(deps);
}

/** Test-Helper. */
export function _resetForTests(): void {
  _currentMode = 'slider';
  _compareSelectionIdx = null;
}

/** Test-Helper für Mode-Inspection. */
export function _getMode(): ViewMode {
  return _currentMode;
}

// ── Modal-DOM ────────────────────────────────────────────────────────

function ensureModal(): void {
  let overlay = document.getElementById(MODAL_ID);
  if (overlay) {
    return;
  }
  overlay = document.createElement('div');
  overlay.id = MODAL_ID;
  overlay.className = 'mdl-overlay';
  overlay.style.cssText =
    'display:none;position:fixed;inset:0;z-index:9999;' +
    'align-items:center;justify-content:center;background:rgba(0,0,0,0.55)';
  overlay.innerHTML =
    '<div class="mdl-dialog" style="max-width:1200px;width:95vw;height:85vh;padding:0;display:flex;flex-direction:column;background:var(--bg);border:1px solid var(--bd);border-radius:8px;overflow:hidden">' +
    '<header style="display:flex;gap:8px;padding:12px 16px;border-bottom:1px solid var(--bd);align-items:center">' +
    '<h3 style="margin:0;font-size:16px">🖼 Visual History</h3>' +
    '<span style="flex:1"></span>' +
    '<button class="mdl-btn" id="vh-mode-slider">📊 Slider</button>' +
    '<button class="mdl-btn" id="vh-mode-grid">🟦 Grid</button>' +
    '<button class="mdl-btn" id="vh-mode-compare">↔ Vergleich</button>' +
    '<button class="mdl-btn mdl-btn--primary" id="vh-close">✕ Schließen</button>' +
    '</header>' +
    '<main id="vh-content" style="flex:1;overflow:auto;padding:16px"></main>' +
    '</div>';
  document.body.appendChild(overlay);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtTime(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

function attachHeaderHandlers(deps: VisualHistoryUIDeps): void {
  const slider = document.getElementById('vh-mode-slider');
  const grid = document.getElementById('vh-mode-grid');
  const compare = document.getElementById('vh-mode-compare');
  const close = document.getElementById('vh-close');
  if (slider) slider.onclick = () => setMode('slider', deps);
  if (grid) grid.onclick = () => setMode('grid', deps);
  if (compare) compare.onclick = () => setMode('compare', deps);
  if (close) close.onclick = () => closeVisualHistoryModal();
}

function rerender(deps: VisualHistoryUIDeps): void {
  const container = document.getElementById('vh-content');
  if (!container) return;
  attachHeaderHandlers(deps);
  const entries = getVisualHistory();
  if (entries.length === 0) {
    container.innerHTML =
      '<div style="padding:40px;text-align:center;color:var(--tx3);font-size:12px">' +
      'Noch keine Snapshots vorhanden. Mache Änderungen am Plan, um Einträge zu erzeugen.' +
      '</div>';
    return;
  }
  switch (_currentMode) {
    case 'slider':
      container.innerHTML = renderSliderView(entries);
      attachEntryClicks(deps, 'slider');
      break;
    case 'grid':
      container.innerHTML = renderGridView(entries);
      attachEntryClicks(deps, 'grid');
      break;
    case 'compare':
      container.innerHTML = renderCompareView(entries, _compareSelectionIdx);
      attachCompareHandlers(deps);
      break;
  }
}

function renderEntryCard(entry: VisualHistoryEntry, idx: number, total: number, hoverable: boolean): string {
  const time = fmtTime(entry.ts);
  return (
    '<div class="vh-card" data-vh-idx="' +
    idx +
    '" style="cursor:pointer;border:1px solid var(--bd);border-radius:6px;overflow:hidden;background:var(--bg2);' +
    (hoverable ? 'transition:transform .12s ease, border-color .12s ease' : '') +
    '">' +
    '<img src="' +
    escapeHtml(entry.thumb) +
    '" style="width:100%;display:block" alt="Snapshot ' +
    time +
    '">' +
    '<div style="padding:6px 8px;font-size:10px;color:var(--tx2);display:flex;justify-content:space-between">' +
    '<span>' +
    time +
    '</span><span>#' +
    (idx + 1) +
    '/' +
    total +
    '</span></div>' +
    '</div>'
  );
}

function renderSliderView(entries: readonly VisualHistoryEntry[]): string {
  const total = entries.length;
  // Newest links, ältester rechts (umgekehrte Chronologie für UX-Frische)
  const cards = entries
    .map((entry, idx) => renderEntryCard(entry, idx, total, true))
    .reverse()
    .join('');
  return (
    '<div style="font-size:11px;color:var(--tx3);margin-bottom:10px">' +
    total +
    ' Snapshots — Click öffnet Vergleich, Hover für Größenvorschau' +
    '</div>' +
    '<div class="vh-slider" style="display:flex;gap:10px;overflow-x:auto;padding:8px 0;scroll-snap-type:x mandatory">' +
    cards.replace(/class="vh-card"/g, 'class="vh-card" style="scroll-snap-align:start;min-width:200px;max-width:200px"') +
    '</div>'
  );
}

function renderGridView(entries: readonly VisualHistoryEntry[]): string {
  const total = entries.length;
  const cards = entries
    .map((entry, idx) => renderEntryCard(entry, idx, total, true))
    .reverse()
    .join('');
  return (
    '<div style="font-size:11px;color:var(--tx3);margin-bottom:10px">' +
    total +
    ' Snapshots — Click öffnet Vergleich' +
    '</div>' +
    '<div class="vh-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">' +
    cards +
    '</div>'
  );
}

function parseStateForCounts(state: string): {
  rooms: unknown[];
  objects: unknown[];
  walls: unknown[];
  measures: unknown[];
} {
  try {
    const parsed = JSON.parse(state) as {
      rooms?: unknown[];
      objects?: unknown[];
      walls?: unknown[];
      measures?: unknown[];
    };
    return {
      rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
      objects: Array.isArray(parsed.objects) ? parsed.objects : [],
      walls: Array.isArray(parsed.walls) ? parsed.walls : [],
      measures: Array.isArray(parsed.measures) ? parsed.measures : [],
    };
  } catch {
    return { rooms: [], objects: [], walls: [], measures: [] };
  }
}

function renderCompareView(
  entries: readonly VisualHistoryEntry[],
  selectedIdx: number | null,
): string {
  if (selectedIdx === null || !entries[selectedIdx]) {
    // Selection-Hint + Mini-Slider zur Auswahl
    return (
      '<div style="padding:20px;text-align:center;color:var(--tx2);font-size:12px;margin-bottom:16px">' +
      'Wähle einen Snapshot für den Vergleich mit dem aktuellen Stand.' +
      '</div>' +
      '<div class="vh-mini-slider" style="display:flex;gap:8px;overflow-x:auto;padding:8px 0">' +
      entries
        .map((entry, idx) => renderEntryCard(entry, idx, entries.length, true))
        .reverse()
        .join('') +
      '</div>'
    );
  }
  const selected = entries[selectedIdx];
  if (!selected) return '<div>Snapshot nicht gefunden.</div>';
  const newest = entries[entries.length - 1];
  const newestState = newest ? parseStateForCounts(newest.state) : { rooms: [], objects: [], walls: [], measures: [] };
  const selState = parseStateForCounts(selected.state);
  // Diff: aktuellster Stand vs. ausgewählter (positive Werte = aktuell hat mehr)
  const diff = computeDiff(newestState, selState);
  const renderDiffLine = (label: string, n: number): string => {
    if (n === 0) return '<span style="color:var(--tx3)">' + label + ': identisch</span>';
    const sign = n > 0 ? '+' : '';
    const color = n > 0 ? 'var(--gr)' : 'var(--rd, #ef4444)';
    return (
      '<span style="color:' + color + '">' + label + ': ' + sign + n + '</span>'
    );
  };
  return (
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">' +
    '<div>' +
    '<div style="font-size:11px;color:var(--tx2);margin-bottom:4px">📜 Snapshot #' +
    (selectedIdx + 1) +
    ' · ' +
    fmtTime(selected.ts) +
    '</div>' +
    '<img src="' +
    escapeHtml(selected.thumb) +
    '" style="width:100%;border:1px solid var(--bd);border-radius:6px;display:block" alt="Snapshot">' +
    '</div>' +
    '<div>' +
    '<div style="font-size:11px;color:var(--tx2);margin-bottom:4px">📝 Aktueller Stand · ' +
    fmtTime((newest && newest.ts) || Date.now()) +
    '</div>' +
    (newest
      ? '<img src="' +
        escapeHtml(newest.thumb) +
        '" style="width:100%;border:1px solid var(--bd);border-radius:6px;display:block" alt="Aktuell">'
      : '<div style="height:120px;background:var(--bg2);border:1px dashed var(--bd);border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--tx3);font-size:11px">kein Stand</div>') +
    '</div>' +
    '</div>' +
    '<div id="vh-diff" style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px;padding:10px 12px;background:var(--bg2);border-radius:4px;margin-bottom:14px">' +
    renderDiffLine('Räume', diff.rooms) +
    renderDiffLine('Objekte', diff.objects) +
    renderDiffLine('Wände', diff.walls) +
    renderDiffLine('Maße', diff.measures) +
    '</div>' +
    '<div style="display:flex;gap:8px;justify-content:flex-end">' +
    '<button id="vh-cancel" class="mdl-btn">Abbrechen</button>' +
    '<button id="vh-restore" class="mdl-btn mdl-btn--primary" data-vh-restore-idx="' +
    selectedIdx +
    '">⟲ Diesen Snapshot wiederherstellen</button>' +
    '</div>'
  );
}

function attachEntryClicks(deps: VisualHistoryUIDeps, _mode: 'slider' | 'grid'): void {
  const cards = document.querySelectorAll<HTMLElement>('.vh-card[data-vh-idx]');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const idx = Number(card.dataset.vhIdx);
      if (Number.isInteger(idx)) {
        selectForCompare(idx, deps);
      }
    });
  });
}

function attachCompareHandlers(deps: VisualHistoryUIDeps): void {
  // Cards in der Mini-Slider-Auswahl
  document.querySelectorAll<HTMLElement>('.vh-card[data-vh-idx]').forEach((card) => {
    card.addEventListener('click', () => {
      const idx = Number(card.dataset.vhIdx);
      if (Number.isInteger(idx)) {
        selectForCompare(idx, deps);
      }
    });
  });
  const restore = document.getElementById('vh-restore') as HTMLButtonElement | null;
  if (restore) {
    restore.onclick = () => {
      const idx = Number(restore.dataset.vhRestoreIdx);
      if (!Number.isInteger(idx)) return;
      deps.restoreFromIndex(idx);
      closeVisualHistoryModal();
    };
  }
  const cancel = document.getElementById('vh-cancel') as HTMLButtonElement | null;
  if (cancel) {
    cancel.onclick = () => {
      _compareSelectionIdx = null;
      _currentMode = 'slider';
      rerender(deps);
    };
  }
}
