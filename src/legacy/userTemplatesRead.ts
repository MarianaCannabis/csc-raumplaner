/**
 * P17.11 — User-Templates Cloud-Read extrahiert aus index.html:9432-9482.
 *
 * Module-internal Cache (`_cache`, `_loadedAt`) — Inverse zu P17.8 (saves.ts),
 * wo der Cache zurückblieb. Hier wandert er INS Modul, weil dieses Modul
 * jetzt die kanonische Quelle für die Templates-Liste ist.
 *
 * Das `invalidateTemplatesCache`-Callback aus P17.8's `doSaveUserTemplate`
 * ruft jetzt `invalidateUserTemplatesCache` aus diesem Modul (über die
 * main.ts-Bridge) — dadurch ist der Save-Path automatisch konsistent
 * mit dem Read-Path.
 *
 * Note: `renderUserTemplates` aus der Spec existiert in index.html nicht
 * (Liste wird direkt im `openTemplates`-Modal-Opener gerendert). Daher
 * extrahieren wir hier `deleteUserTemplate` + `applyUserTemplate`
 * stattdessen, weil sie denselben Cache lesen/schreiben.
 */

export interface UserTemplate {
  id: string;
  name: string;
  data: unknown;
  description?: string;
  tags?: string[];
  thumbnail?: string;
  size_label?: string | null;
  icon?: string;
  updated_at?: string;
}

export interface UserTemplatesDeps {
  sbUrl: string;
  sbKey: string;
  sbToken: string | null;
  /** Test-injection: fetch-Mock. Default = global fetch. */
  fetchFn?: typeof fetch;
}

export interface UserTemplatesUIDeps extends UserTemplatesDeps {
  closeM: (id: string) => void;
  /** Re-render-Callback (z.B. openTemplates() das die Liste neu zeichnet). */
  refreshTemplatesUI?: () => void;
  toast: (msg: string, type?: string) => void;
  loadPD: (data: unknown) => void;
  /** Confirm-Dialog (für Test-Injection). Default = window.confirm. */
  confirmFn?: (msg: string) => boolean;
}

const CACHE_TTL_MS = 60_000;
let _cache: UserTemplate[] = [];
let _loadedAt = 0;

/** Snapshot der aktuellen Cache-Daten. Ohne TTL-Check. */
export function getUserTemplatesCacheSnapshot(): readonly UserTemplate[] {
  return _cache;
}

/** Test-Helper: Cache komplett zurücksetzen. */
export function invalidateUserTemplatesCache(): void {
  _cache = [];
  _loadedAt = 0;
}

/**
 * Liefert die User-Templates des aktuellen Users. Cache-First:
 * - Cache leer ODER TTL abgelaufen → fetch GET, befüllen, return
 * - Cache befüllt + TTL ok → return Cache
 * - Token leer → return []
 * - Fetch-Fehler → return []
 */
export async function loadUserTemplates(deps: UserTemplatesDeps): Promise<UserTemplate[]> {
  if (!deps.sbToken) return [];
  if (_cache.length && Date.now() - _loadedAt < CACHE_TTL_MS) return _cache;
  const fetchFn = deps.fetchFn ?? fetch;
  try {
    const r = await fetchFn(
      deps.sbUrl + '/rest/v1/csc_user_templates?select=*&order=updated_at.desc',
      {
        headers: { apikey: deps.sbKey, Authorization: 'Bearer ' + deps.sbToken },
      },
    );
    if (!r.ok) return [];
    _cache = (await r.json()) as UserTemplate[];
    _loadedAt = Date.now();
    return _cache;
  } catch {
    return [];
  }
}

/**
 * Löscht eine User-Template-Row via DELETE. Invalidiert den Cache und
 * triggert refreshTemplatesUI (typisch openTemplates re-render).
 */
export async function deleteUserTemplate(
  id: string,
  deps: UserTemplatesUIDeps,
): Promise<void> {
  const confirmFn = deps.confirmFn ?? ((m: string) => window.confirm(m));
  if (!confirmFn('Vorlage endgültig löschen?')) return;
  const fetchFn = deps.fetchFn ?? fetch;
  try {
    await fetchFn(deps.sbUrl + '/rest/v1/csc_user_templates?id=eq.' + id, {
      method: 'DELETE',
      headers: { apikey: deps.sbKey, Authorization: 'Bearer ' + (deps.sbToken ?? '') },
    });
    invalidateUserTemplatesCache();
    if (deps.refreshTemplatesUI) deps.refreshTemplatesUI();
    deps.toast('🗑 Vorlage gelöscht', 'b');
  } catch (e) {
    deps.toast('Löschen fehlgeschlagen: ' + (e as Error).message, 'r');
  }
}

/**
 * Lädt eine zuvor gefetchte Template-Row in den aktuellen Workspace.
 * User wird mit confirm() gewarnt (überschreibt aktuelle Räume).
 */
export function applyUserTemplate(id: string, deps: UserTemplatesUIDeps): void {
  const t = _cache.find((x) => x.id === id);
  if (!t) {
    deps.toast('Vorlage nicht gefunden', 'r');
    return;
  }
  const confirmFn = deps.confirmFn ?? ((m: string) => window.confirm(m));
  if (!confirmFn('Vorlage „' + t.name + '" laden? Aktuelle Räume werden ersetzt.')) return;
  deps.closeM('m-templates');
  try {
    deps.loadPD(t.data);
    deps.toast('✅ Vorlage geladen: ' + t.name, 'g');
  } catch (e) {
    deps.toast('Laden fehlgeschlagen: ' + (e as Error).message, 'r');
  }
}
