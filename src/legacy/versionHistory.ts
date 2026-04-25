/**
 * P17.21 — Version-History UI extrahiert aus index.html:8959-9008.
 *
 * Wrapper um den existierenden Persist-Bridge (window.cscPersist.versions
 * aus src/persist/versionHistory.ts — bereits in P-TrackA Phase 1
 * extrahiert). Diese Wrapper rendern die UI + delegieren das State-
 * Management an die Bridge.
 */

export interface VersionEntry {
  label: string;
  data: { rooms?: unknown[]; objects?: unknown[] } & Record<string, unknown>;
  ts: number;
}

export interface VersionHistoryDeps {
  /** Aktuell gespeichertes Projekt — wird beim push als data übernommen. */
  getPD: () => unknown;
  /** loadPD übernimmt den restorten state. */
  loadPD: (data: unknown) => void;
  toast: (msg: string, type?: string) => void;
  /** Confirm-Dialog (testbar via DI). Default = window.confirm. */
  confirmFn?: (msg: string) => boolean;
  /** Persist-Bridge: liest direkt von window.cscPersist.versions. */
  versionsBridge?: {
    list: () => VersionEntry[];
    push: (data: unknown, label?: string) => VersionEntry[];
    remove: (idx: number) => VersionEntry[];
  };
}

const STORAGE_KEY = 'csc-versions';
const MAX_VERSIONS = 30;

function rawList(): VersionEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function listAny(deps: VersionHistoryDeps): VersionEntry[] {
  return deps.versionsBridge ? deps.versionsBridge.list() : rawList();
}

export function saveVersion(label: string | undefined, deps: VersionHistoryDeps): void {
  const labelText = label || new Date().toLocaleString('de-DE');
  if (deps.versionsBridge) {
    deps.versionsBridge.push(deps.getPD(), labelText);
  } else {
    const v: VersionEntry = { label: labelText, data: deps.getPD() as VersionEntry['data'], ts: Date.now() };
    const next = [v, ...rawList()].slice(0, MAX_VERSIONS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* private-mode / quota — best-effort */
    }
  }
  deps.toast('📌 Version gespeichert', 'g');
  renderVersionHistory(deps);
}

export function loadVersionHistory(deps: VersionHistoryDeps): VersionEntry[] {
  return listAny(deps);
}

export function renderVersionHistory(deps: VersionHistoryDeps): void {
  const el = document.getElementById('version-list');
  if (!el) return;
  const list = listAny(deps);
  if (!list.length) {
    el.innerHTML =
      '<div style="font-size:11px;color:var(--tx3);padding:8px">Keine Versionen gespeichert.<br>Klicke "📌 Version merken" um den aktuellen Stand zu sichern.</div>';
    return;
  }
  el.innerHTML = list
    .map(
      (v, i) =>
        '<div class="sitem" onclick="restoreVersion(' +
        i +
        ')">' +
        '<div class="ri"><div class="rn">' +
        v.label +
        '</div>' +
        '<div class="rd">' +
        (v.data.rooms || []).length +
        ' Räume · ' +
        (v.data.objects || []).length +
        ' Objekte</div></div>' +
        '<button class="sdel" onclick="deleteVersion(' +
        i +
        ');event.stopPropagation()">🗑</button>' +
        '</div>',
    )
    .join('');
}

export function restoreVersion(i: number, deps: VersionHistoryDeps): void {
  const list = listAny(deps);
  const v = list[i];
  if (!v) return;
  const confirmFn = deps.confirmFn ?? ((m: string) => window.confirm(m));
  if (!confirmFn('Version "' + v.label + '" wiederherstellen? Aktuelle Änderungen gehen verloren.'))
    return;
  deps.loadPD(v.data);
  deps.toast('🔄 Version wiederhergestellt', 'g');
}

export function deleteVersion(i: number, deps: VersionHistoryDeps): void {
  if (deps.versionsBridge) {
    deps.versionsBridge.remove(i);
  } else {
    const list = rawList();
    list.splice(i, 1);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
  renderVersionHistory(deps);
}
