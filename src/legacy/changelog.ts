/**
 * P17.16 — Changelog + Visual-History extrahiert aus
 * index.html:11023-11060 + 18929-18997.
 *
 * Section A — Changelog (text-Log):
 *   logChange, getChangelog, showChangelog, clearChangelog, loadChangelog
 *   Cache: module-internal _changelog (Array von {ts, msg, rooms, objects, floor}).
 *   Persistenz: localStorage 'csc-changelog'.
 *
 * Section B — Visual-History (Thumbnails + Modal):
 *   pushVisualHistory, openVisualHistory, restoreFromVisualHistory
 *   Cache: module-internal _visualHistory (Array von {ts, thumb, state}).
 *   In-Memory only (Thumbnails sind groß; Persistenz wäre teuer).
 */

const MAX_CHANGELOG = 50;
const VISUAL_HISTORY_MAX = 50;
const STORAGE_KEY = 'csc-changelog';

interface ChangelogEntry {
  ts: number;
  msg: string;
  rooms: number;
  objects: number;
  floor: string;
}

export interface VisualHistoryEntry {
  ts: number;
  thumb: string;
  state: string;
}

let _changelog: ChangelogEntry[] = [];
const _visualHistory: VisualHistoryEntry[] = [];

// ── Section A: Changelog ─────────────────────────────────────────────

export interface LogChangeDeps {
  rooms: { length: number };
  objects: { length: number };
  curFloor: string;
}

export function logChange(msg: string, deps: LogChangeDeps): void {
  _changelog.unshift({
    ts: Date.now(),
    msg,
    rooms: deps.rooms.length,
    objects: deps.objects.length,
    floor: deps.curFloor,
  });
  if (_changelog.length > MAX_CHANGELOG) _changelog.pop();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_changelog));
  } catch {
    /* private-mode / quota — best-effort */
  }
}

export function getChangelog(): readonly ChangelogEntry[] {
  return _changelog;
}

export function loadChangelog(): void {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) _changelog = JSON.parse(s);
  } catch {
    /* ignore */
  }
}

export function clearChangelog(): void {
  _changelog = [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export interface ShowChangelogDeps {
  openM: (id: string) => void;
}

export function showChangelog(deps: ShowChangelogDeps): void {
  const el = document.getElementById('changelog-list');
  if (!el) {
    deps.openM('m-changelog');
    return;
  }
  if (!_changelog.length) {
    el.innerHTML =
      '<div style="padding:12px;font-size:11px;color:var(--tx3)">Noch keine Änderungen protokolliert.</div>';
  } else {
    el.innerHTML = _changelog
      .map((c) => {
        const d = new Date(c.ts).toLocaleString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
        return (
          '<div class="changelog-entry">' +
          '<div class="cl-time">' +
          d +
          ' · Etage: ' +
          c.floor +
          ' · ' +
          c.rooms +
          ' Räume · ' +
          c.objects +
          ' Objekte</div>' +
          '<div class="cl-msg">' +
          c.msg +
          '</div></div>'
        );
      })
      .join('');
  }
  deps.openM('m-changelog');
}

// ── Section B: Visual-History ────────────────────────────────────────

export interface PushVisualHistoryDeps {
  fpCv: HTMLCanvasElement | null;
}

export function pushVisualHistory(state: string, deps: PushVisualHistoryDeps): void {
  try {
    if (!deps.fpCv) return;
    const thumb = document.createElement('canvas');
    thumb.width = 180;
    thumb.height = 120;
    const tctx = thumb.getContext('2d');
    if (!tctx) return;
    tctx.drawImage(deps.fpCv, 0, 0, 180, 120);
    _visualHistory.push({
      ts: Date.now(),
      thumb: thumb.toDataURL('image/jpeg', 0.6),
      state,
    });
    if (_visualHistory.length > VISUAL_HISTORY_MAX) _visualHistory.shift();
  } catch {
    /* canvas not drawable yet — skip */
  }
}

export function getVisualHistorySize(): number {
  return _visualHistory.length;
}

/**
 * Sitzung G Schritt 2: read-access auf Visual-History-Entries für die
 * neue UI (visualHistoryUI.ts). Returnt readonly-Slice — kein direkter
 * Zugriff auf den internen Array.
 */
export function getVisualHistory(): readonly VisualHistoryEntry[] {
  return _visualHistory;
}

/** Sitzung G Schritt 2: Single-Entry-Lookup für Restore-Pfade. */
export function getVisualHistoryEntry(idx: number): VisualHistoryEntry | null {
  return _visualHistory[idx] ?? null;
}

export function clearVisualHistoryForTests(): void {
  _visualHistory.length = 0;
  _changelog = [];
}

export interface OpenVisualHistoryDeps {
  openM: (id: string) => void;
}

export function openVisualHistory(deps: OpenVisualHistoryDeps): void {
  let modal = document.getElementById('m-visual-history');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'm-visual-history';
    modal.className = 'mdl-overlay';
    modal.innerHTML =
      '<div class="mdl-dialog" style="max-width:720px;max-height:80vh">' +
      '<h2>📜 Verlauf (Visual History)</h2>' +
      '<div style="font-size:11px;color:var(--tx3);margin-bottom:10px">Klick auf ein Thumbnail springt zu diesem Stand zurück. Max ' +
      VISUAL_HISTORY_MAX +
      ' Einträge.</div>' +
      '<div id="visual-history-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;max-height:50vh;overflow-y:auto;padding:4px"></div>' +
      '<div class="mdl-actions"><button class="mdl-btn" data-tier="simple" onclick="closeM(\'m-visual-history\')">Schließen</button></div>' +
      '</div>';
    document.body.appendChild(modal);
  }
  const grid = document.getElementById('visual-history-grid');
  if (!grid) {
    deps.openM('m-visual-history');
    return;
  }
  if (_visualHistory.length === 0) {
    grid.innerHTML =
      '<div style="grid-column:1/-1;padding:20px;text-align:center;color:var(--tx3);font-size:11px">Noch kein Verlauf. Mache Änderungen, um Einträge zu erzeugen.</div>';
  } else {
    grid.innerHTML = _visualHistory
      .slice()
      .reverse()
      .map((entry, revIdx) => {
        const idx = _visualHistory.length - 1 - revIdx;
        const date = new Date(entry.ts);
        const timeStr = date.toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        return (
          '<div style="cursor:pointer;border:1px solid var(--bd);border-radius:6px;overflow:hidden;background:var(--bg3);transition:.1s" ' +
          "onmouseover=\"this.style.borderColor='var(--gr)'\" onmouseout=\"this.style.borderColor='var(--bd)'\" " +
          'onclick="_restoreFromVisualHistory(' +
          idx +
          ')">' +
          '<img src="' +
          entry.thumb +
          '" style="width:100%;display:block" alt="Snapshot ' +
          timeStr +
          '">' +
          '<div style="padding:4px 8px;font-size:10px;color:var(--tx2);display:flex;justify-content:space-between">' +
          '<span>' +
          timeStr +
          '</span><span>#' +
          (idx + 1) +
          '</span></div></div>'
        );
      })
      .join('');
  }
  deps.openM('m-visual-history');
}

export interface RestoreVisualHistoryDeps {
  restoreSnapshot: (state: string) => void;
  closeM: (id: string) => void;
  toast: (msg: string, type?: string) => void;
}

export function restoreFromVisualHistory(idx: number, deps: RestoreVisualHistoryDeps): void {
  const entry = _visualHistory[idx];
  if (!entry) return;
  try {
    deps.restoreSnapshot(entry.state);
    deps.closeM('m-visual-history');
    deps.toast('📜 Zurück zu Snapshot #' + (idx + 1), 'g');
  } catch (e) {
    deps.toast('Restore fehlgeschlagen: ' + (e as Error).message, 'r');
  }
}
