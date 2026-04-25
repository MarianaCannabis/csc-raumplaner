/**
 * Cloud-Projekt-Persistenz (Track A Phase 2b.2).
 *
 * Wraps die Supabase-REST-Calls für csc_projects: list, load, save, delete.
 * Pure Funktionen — Context (url/key/token) + optional refresh-Callback
 * kommen als Parameter. Keine window.*, keine DOM-Zugriffe, keine toasts.
 * Der Legacy-Wrapper in index.html kümmert sich um Spinner-Button,
 * Confirm-Dialog bei großen Uploads, Thumbnail-Generation (rend3),
 * Error-Toasts + addMsg-Setup-Hint.
 *
 * Retry-Policy: jede Funktion kann einen optionalen `refresh()`-Callback
 * akzeptieren. Bei 401 wird refresh() genau einmal aufgerufen — wenn
 * das neue Token liefert, wird der Call wiederholt. Bei 2. 401 oder
 * refresh-Failure wird eine AuthError geworfen.
 */

export interface CloudContext {
  url: string;
  key: string;
  token: string;
}

export interface CloudProjectSummary {
  id: string;
  name: string;
  updated_at: string;
  team_id?: string;
  author?: string;
}

export interface CloudSaveBody {
  name: string;
  data: unknown;
  thumbnail?: string;
  team_id?: string;
  author?: string;
  /**
   * Required für RLS-Policy `csc_projects_owner_ins` (WITH CHECK
   * auth.uid() = owner). Ohne diesen Wert wird jeder INSERT von
   * Supabase mit HTTP 400/403 abgelehnt. Wrapper muss hier
   * authState.getAuthState().user.id durchreichen.
   *
   * Hotfix v2.6.2: bewusst NICHT-optional, damit der TypeScript-
   * Compiler jede Call-Site markiert die owner vergisst.
   */
  owner: string;
}

/**
 * Refresh-Callback — gibt (new token, success) zurück.
 * Muss den neuen Token im Caller-Scope verfügbar machen.
 */
export type RefreshFn = () => Promise<string | null>;

export class AuthError extends Error {
  constructor(message = 'Cloud-Authentifizierung fehlgeschlagen') {
    super(message);
    this.name = 'AuthError';
  }
}

export class TableMissingError extends Error {
  constructor(message = 'Supabase-Tabelle csc_projects nicht vorhanden') {
    super(message);
    this.name = 'TableMissingError';
  }
}

/**
 * PostgREST-Error-Body lesen und in eine sprechende Exception umwandeln.
 * Hotfix v2.6.4: PGRST204 ("Column not found in schema cache") tritt auf
 * wenn das Frontend ein Feld sendet das in der DB fehlt. Im konkreten
 * Fall war das `thumbnail` — Migration 0008 ergänzt die Spalte. Der Hint
 * macht den Operator-Fix sofort sichtbar statt nur "HTTP 400" zu zeigen.
 *
 * Andere PostgREST-Codes werden mit Code+Message in die Fehlermeldung
 * gerendert. Wenn der Body nicht parsebar ist, fallen wir auf den HTTP-
 * Status zurück (gleiches Verhalten wie vor v2.6.4).
 */
interface PostgrestErrorBody { code?: string; message?: string; hint?: string }
async function _postgrestError(scope: string, r: Response): Promise<Error> {
  let parsed: PostgrestErrorBody | null = null;
  try {
    parsed = (await r.clone().json()) as PostgrestErrorBody;
  } catch {
    /* nicht-JSON Body → fallback unten */
  }
  if (parsed && typeof parsed.code === 'string') {
    if (parsed.code === 'PGRST204') {
      return new Error(
        `${scope} HTTP ${r.status} (PGRST204 – Column not found in schema cache). ` +
          (parsed.message ? `Detail: ${parsed.message}. ` : '') +
          'Migration 0008_add_project_thumbnail.sql nicht angewandt? ' +
          'Lauf supabase db push oder pasten Sie das SQL im Dashboard.',
      );
    }
    return new Error(
      `${scope} HTTP ${r.status} (${parsed.code}` +
        (parsed.message ? ` – ${parsed.message}` : '') +
        ')',
    );
  }
  return new Error(`${scope} HTTP ${r.status}`);
}

function buildHeaders(ctx: CloudContext, extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: ctx.key,
    Authorization: 'Bearer ' + (ctx.token || ctx.key),
    ...extra,
  };
}

/**
 * Fetch mit Auth-Retry. Bei 401 einmal refresh() + Retry. Bei 2. 401
 * AuthError. Token-Update kommt vom Caller via refresh()-Returnwert
 * (der neue Token wird in einen lokalen ctx-Clone injected).
 */
async function fetchWithAuthRetry(
  ctx: CloudContext,
  url: string,
  init: RequestInit,
  refresh?: RefreshFn,
  fetchFn: typeof fetch = fetch,
): Promise<Response> {
  let localCtx = ctx;
  let r = await fetchFn(url, { ...init, headers: buildHeaders(localCtx, (init.headers as Record<string, string>) || {}) });
  if (r.status === 401 && refresh) {
    const newToken = await refresh();
    if (newToken) {
      localCtx = { ...localCtx, token: newToken };
      r = await fetchFn(url, { ...init, headers: buildHeaders(localCtx, (init.headers as Record<string, string>) || {}) });
      if (r.status === 401) throw new AuthError();
    } else {
      throw new AuthError('Token-Refresh fehlgeschlagen');
    }
  }
  return r;
}

/**
 * Liefert die ID des Projekts mit diesem Namen oder null.
 * 404/406 von PostgREST → TableMissingError (Setup-Hint im Wrapper).
 */
export async function findProjectByName(
  ctx: CloudContext,
  name: string,
  refresh?: RefreshFn,
  fetchFn: typeof fetch = fetch,
): Promise<string | null> {
  const url = ctx.url + '/rest/v1/csc_projects?name=eq.' + encodeURIComponent(name) + '&select=id';
  const r = await fetchWithAuthRetry(ctx, url, { method: 'GET' }, refresh, fetchFn);
  if (r.status === 404 || r.status === 406) throw new TableMissingError();
  if (!r.ok) throw new Error('findProjectByName HTTP ' + r.status);
  const rows = await r.json();
  return Array.isArray(rows) && rows[0]?.id ? rows[0].id : null;
}

/**
 * Upsert-by-name: findet existierenden oder legt neuen an.
 * Returnt { id, created: true if new, false if updated }.
 */
export async function saveCloudProject(
  ctx: CloudContext,
  body: CloudSaveBody,
  refresh?: RefreshFn,
  fetchFn: typeof fetch = fetch,
): Promise<{ id: string | null; created: boolean }> {
  // Hotfix v2.6.3: Runtime-Guard für untyped JS-Callsites. CloudSaveBody.owner
  // ist auf Type-Ebene required, aber window.cscPersist.cloud.save wird
  // aus Inline-Script (index.html) ohne TypeScript aufgerufen. Ohne diesen
  // Check würde ein fehlendes owner-Feld durchflutschen und dann 400 auf
  // RLS-Policy csc_projects_owner_ins ergeben — der Root-Cause wäre dem
  // Caller aus dem HTTP-Fehler nicht ersichtlich.
  if (typeof body.owner !== 'string' || body.owner.length === 0) {
    throw new Error(
      'saveCloudProject: body.owner ist Pflicht (RLS csc_projects_owner_ins). ' +
        'Wrapper muss authState.getAuthState().user.id durchreichen.',
    );
  }
  const existingId = await findProjectByName(ctx, body.name, refresh, fetchFn);
  const commonHeaders = { 'Content-Type': 'application/json', Prefer: 'return=minimal' };
  if (existingId) {
    // Hotfix v2.6.2: owner wird beim PATCH bewusst NICHT mitgesendet.
    // RLS-Policy csc_projects_owner_upd erlaubt die Zeile nur wenn
    // auth.uid() == owner; ein Client-Attempt owner zu ändern würde
    // ohnehin abgelehnt, und ein explizites Mitsenden des bereits
    // passenden owner ist unnötiger Netzwerk-Ballast.
    const { owner: _omitOwner, ...patchBody } = body;
    void _omitOwner;
    const patchPayload = JSON.stringify(patchBody);
    const r = await fetchWithAuthRetry(
      ctx,
      ctx.url + '/rest/v1/csc_projects?id=eq.' + existingId,
      { method: 'PATCH', headers: commonHeaders, body: patchPayload },
      refresh,
      fetchFn,
    );
    if (!r.ok && r.status !== 204) throw await _postgrestError('Cloud-Update', r);
    return { id: existingId, created: false };
  }
  // INSERT-Pfad: owner MUSS im Body stehen — siehe CloudSaveBody.owner.
  const payload = JSON.stringify(body);
  const r = await fetchWithAuthRetry(
    ctx,
    ctx.url + '/rest/v1/csc_projects',
    { method: 'POST', headers: commonHeaders, body: payload },
    refresh,
    fetchFn,
  );
  if (!r.ok && r.status !== 201 && r.status !== 204) throw await _postgrestError('Cloud-Insert', r);
  return { id: null, created: true };
}

/**
 * GET /rest/v1/csc_projects?select=… — liefert Summary-Liste der letzten 20.
 * 401 nach refresh-Retry → return leer (Sign-In-Flow übernimmt der Caller).
 */
export async function fetchAllCloudProjects(
  ctx: CloudContext,
  refresh?: RefreshFn,
  fetchFn: typeof fetch = fetch,
): Promise<CloudProjectSummary[]> {
  const url =
    ctx.url +
    '/rest/v1/csc_projects?select=id,name,updated_at,team_id,author&order=updated_at.desc&limit=20';
  try {
    const r = await fetchWithAuthRetry(ctx, url, { method: 'GET' }, refresh, fetchFn);
    if (!r.ok) {
      if (r.status === 404 || r.status === 406) return [];
      throw new Error('fetchAllCloudProjects HTTP ' + r.status);
    }
    const rows = await r.json();
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    if (e instanceof AuthError) return [];
    throw e;
  }
}

/**
 * GET /rest/v1/csc_projects?id=eq.X&select=data — liefert den state-Blob
 * oder null wenn Row nicht gefunden.
 */
export async function loadCloudProject(
  ctx: CloudContext,
  id: string,
  refresh?: RefreshFn,
  fetchFn: typeof fetch = fetch,
): Promise<unknown | null> {
  const url = ctx.url + '/rest/v1/csc_projects?id=eq.' + encodeURIComponent(id) + '&select=data';
  const r = await fetchWithAuthRetry(ctx, url, { method: 'GET' }, refresh, fetchFn);
  if (!r.ok) throw new Error('loadCloudProject HTTP ' + r.status);
  const rows = await r.json();
  return Array.isArray(rows) && rows[0] ? rows[0].data : null;
}

/** DELETE /rest/v1/csc_projects?id=eq.X — throws bei !ok/!204. */
export async function deleteCloudProject(
  ctx: CloudContext,
  id: string,
  refresh?: RefreshFn,
  fetchFn: typeof fetch = fetch,
): Promise<void> {
  const url = ctx.url + '/rest/v1/csc_projects?id=eq.' + encodeURIComponent(id);
  const r = await fetchWithAuthRetry(ctx, url, { method: 'DELETE' }, refresh, fetchFn);
  if (!r.ok && r.status !== 204) throw new Error('deleteCloudProject HTTP ' + r.status);
}
