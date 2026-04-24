/**
 * Auth-Core-Helpers (Track A Phase 2a).
 *
 * PURE Funktionen + Fetch-Wrapper. Kein Module-State, kein window.*,
 * kein DOM-Zugriff — damit die Funktionen in Unit-Tests gegen mock-fetch
 * laufen und im Legacy-Code via Wrapper integriert werden können, OHNE
 * die zig SB_TOKEN-Write-Sites in index.html anzufassen.
 *
 * Scope-Entscheidung Phase 2a:
 * - Pure Helpers (JWT-Parsing, Staleness-Check, URL-Builder) hier
 * - Async "Cores" (performTokenRefresh, postMagicLink, postSignOut) hier
 * - State-Management (SB_TOKEN/USER/URL/KEY globals) bleibt index.html
 * - DOM-Side-Effects (updateAuthStatus, Modal-Toggle, toast) bleiben in
 *   den index.html-Wrappers
 *
 * Phase 2b (separate PR): State-Extract via Window-Property-Proxy +
 * Cross-Tab-Sync + Listener-Pattern zusammen mit cloudProjects.ts +
 * offlineQueue.ts.
 */

/** Minimaler User-Shape, wie er in SB_USER (und localStorage['csc-sb-user']) lebt. */
export interface AuthUser {
  id: string;
  email: string;
}

/** Ergebnis eines erfolgreichen Token-Refreshs. */
export interface RefreshResult {
  ok: boolean;
  token?: string;
  refreshToken?: string;
  user?: AuthUser | null;
  /** Beim erst-parse-fail: stale refresh-token, caller muss handleAuthLoss. */
  fatal?: boolean;
}

/** Payload-Slice eines Supabase-JWT. */
export interface JwtPayload {
  sub?: string;
  email?: string;
  exp?: number;
}

/**
 * Decoded JWT-Payload oder null bei defektem Input. Tolerant gegen
 * Padding-Issues + Non-URL-safe-Base64 (Supabase nutzt standard-base64,
 * der Split auf ".[1]" ist stabil).
 */
export function parseTokenPayload(jwt: string): JwtPayload | null {
  if (!jwt) return null;
  const parts = jwt.split('.');
  if (parts.length < 2) return null;
  try {
    // atob ist im Browser verfügbar; in Vitest via jsdom ebenfalls.
    const json = atob(parts[1]!);
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * True wenn Token abgelaufen, default-Buffer 120s (das gleiche 2-Min-
 * Shortcut-Grid wie der Legacy-Code). null-Payload → expired.
 */
export function tokenExpired(jwt: string, bufferMs = 120_000): boolean {
  const payload = parseTokenPayload(jwt);
  if (!payload?.exp) return true;
  return payload.exp * 1000 - Date.now() <= bufferMs;
}

/**
 * Parsed das Fragment nach einem Magic-Link-Redirect (`#access_token=…`).
 * Returnt null, wenn kein access_token drin ist.
 */
export function parseAuthRedirectFragment(hash: string): {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser | null;
} | null {
  if (!hash || hash.indexOf('access_token=') < 0) return null;
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const accessToken = params.get('access_token');
  if (!accessToken) return null;
  const refreshToken = params.get('refresh_token') ?? undefined;
  const payload = parseTokenPayload(accessToken);
  const user: AuthUser | null = payload
    ? { id: payload.sub ?? '', email: payload.email ?? '' }
    : null;
  return { accessToken, refreshToken, user };
}

/**
 * Normalisiert den redirect_to für Supabase-Magic-Links. Entfernt
 * trailing Filename-Segmente (index.html) und garantiert trailing slash.
 */
export function buildRedirectUrl(origin: string, pathname: string): string {
  let base = origin + pathname;
  base = base.replace(/\/[^/]*\.\w+$/, '/');
  if (!base.endsWith('/')) base += '/';
  return base;
}

/**
 * POSTed /auth/v1/token?grant_type=refresh_token. Return-Shape siehe
 * RefreshResult. Networkfehler + 4xx mappen auf ok:false.
 */
export async function performTokenRefresh(
  sbUrl: string,
  sbKey: string,
  refreshToken: string,
  fetchFn: typeof fetch = fetch,
): Promise<RefreshResult> {
  if (!sbUrl || !refreshToken) return { ok: false };
  try {
    const r = await fetchFn(sbUrl + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: sbKey },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!r.ok) return { ok: false };
    const data = await r.json();
    if (!data?.access_token) return { ok: false };
    const payload = parseTokenPayload(data.access_token);
    const user: AuthUser | null = payload
      ? { id: payload.sub ?? '', email: payload.email ?? '' }
      : null;
    return {
      ok: true,
      token: data.access_token,
      refreshToken: data.refresh_token,
      user,
    };
  } catch {
    return { ok: false };
  }
}

/**
 * POSTed /auth/v1/otp für Magic-Link-Mail. Return-Shape: { ok, error? }.
 */
export async function postMagicLink(
  sbUrl: string,
  sbKey: string,
  email: string,
  redirectTo: string,
  fetchFn: typeof fetch = fetch,
): Promise<{ ok: boolean; error?: string }> {
  if (!sbUrl || !sbKey) return { ok: false, error: 'Supabase nicht konfiguriert' };
  if (!email || !/.+@.+\..+/.test(email)) {
    return { ok: false, error: 'Ungültige E-Mail' };
  }
  try {
    const r = await fetchFn(sbUrl + '/auth/v1/otp?redirect_to=' + encodeURIComponent(redirectTo), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: sbKey },
      body: JSON.stringify({ email, create_user: true }),
    });
    if (r.ok) return { ok: true };
    const errText = await r.text().catch(() => '');
    return { ok: false, error: errText.slice(0, 120) || 'HTTP ' + r.status };
  } catch (e) {
    return { ok: false, error: (e as Error).message || 'Netzwerkfehler' };
  }
}

/**
 * POSTed /auth/v1/logout — Best-Effort. Kein Throw bei Networkfehler
 * (lokaler Logout muss weiterlaufen, auch wenn der Server nicht erreichbar).
 */
export async function postSignOut(
  sbUrl: string,
  sbKey: string,
  token: string,
  fetchFn: typeof fetch = fetch,
): Promise<void> {
  if (!sbUrl || !token) return;
  try {
    await fetchFn(sbUrl + '/auth/v1/logout', {
      method: 'POST',
      headers: { apikey: sbKey, Authorization: 'Bearer ' + token },
    });
  } catch {
    /* best-effort */
  }
}
