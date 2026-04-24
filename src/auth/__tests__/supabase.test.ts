import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  parseTokenPayload,
  tokenExpired,
  parseAuthRedirectFragment,
  buildRedirectUrl,
  performTokenRefresh,
  postMagicLink,
  postSignOut,
} from '../supabase.js';

// Helper: build a minimal JWT with the given payload claims. Supabase-
// Tokens sind Standard-Base64; wir parsen mit atob. Header + Signature
// sind unbedeutend für die Tests.
function jwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

describe('auth/supabase — pure helpers', () => {
  test('parseTokenPayload: valid JWT', () => {
    const t = jwt({ sub: 'user-123', email: 'a@b.de', exp: 9999999999 });
    expect(parseTokenPayload(t)).toEqual({ sub: 'user-123', email: 'a@b.de', exp: 9999999999 });
  });

  test('parseTokenPayload: invalid → null', () => {
    expect(parseTokenPayload('')).toBeNull();
    expect(parseTokenPayload('not.a.jwt')).toBeNull();
    expect(parseTokenPayload('only-one-part')).toBeNull();
  });

  test('tokenExpired: fresh token (exp far in future) → false', () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(tokenExpired(jwt({ exp: future }))).toBe(false);
  });

  test('tokenExpired: already-expired → true', () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    expect(tokenExpired(jwt({ exp: past }))).toBe(true);
  });

  test('tokenExpired: within buffer window → true', () => {
    // exp in 60s, buffer 120s → expired
    const soon = Math.floor((Date.now() + 60_000) / 1000);
    expect(tokenExpired(jwt({ exp: soon }), 120_000)).toBe(true);
  });

  test('tokenExpired: empty / defect → true', () => {
    expect(tokenExpired('')).toBe(true);
    expect(tokenExpired('garbage')).toBe(true);
  });

  test('parseAuthRedirectFragment: access_token vorhanden', () => {
    const at = jwt({ sub: 'u1', email: 'x@y.de' });
    const result = parseAuthRedirectFragment(`#access_token=${at}&refresh_token=rt123&token_type=bearer`);
    expect(result?.accessToken).toBe(at);
    expect(result?.refreshToken).toBe('rt123');
    expect(result?.user).toEqual({ id: 'u1', email: 'x@y.de' });
  });

  test('parseAuthRedirectFragment: ohne access_token → null', () => {
    expect(parseAuthRedirectFragment('')).toBeNull();
    expect(parseAuthRedirectFragment('#foo=bar')).toBeNull();
  });

  test('buildRedirectUrl: strippt index.html + ensures trailing slash', () => {
    expect(buildRedirectUrl('https://foo.com', '/csc/index.html')).toBe('https://foo.com/csc/');
    expect(buildRedirectUrl('https://foo.com', '/csc/')).toBe('https://foo.com/csc/');
    expect(buildRedirectUrl('https://foo.com', '/csc')).toBe('https://foo.com/csc/');
  });
});

describe('auth/supabase — async cores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('performTokenRefresh: success → ok:true + new token/user', async () => {
    const newToken = jwt({ sub: 'u1', email: 'a@b.de', exp: 9999999999 });
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: newToken, refresh_token: 'new-rt' }),
    } as Response);

    const result = await performTokenRefresh('https://sb', 'key', 'old-rt', fetchMock as unknown as typeof fetch);
    expect(result.ok).toBe(true);
    expect(result.token).toBe(newToken);
    expect(result.refreshToken).toBe('new-rt');
    expect(result.user).toEqual({ id: 'u1', email: 'a@b.de' });

    // Verify fetch was called mit korrekten Args
    expect(fetchMock).toHaveBeenCalledWith(
      'https://sb/auth/v1/token?grant_type=refresh_token',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: 'key' },
        body: JSON.stringify({ refresh_token: 'old-rt' }),
      }),
    );
  });

  test('performTokenRefresh: HTTP-Error → ok:false', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 401 } as Response);
    const result = await performTokenRefresh('https://sb', 'key', 'rt', fetchMock as unknown as typeof fetch);
    expect(result.ok).toBe(false);
  });

  test('performTokenRefresh: Network-Throw → ok:false', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('network down'));
    const result = await performTokenRefresh('https://sb', 'key', 'rt', fetchMock as unknown as typeof fetch);
    expect(result.ok).toBe(false);
  });

  test('performTokenRefresh: empty-url → ok:false ohne fetch', async () => {
    const fetchMock = vi.fn();
    const result = await performTokenRefresh('', 'key', 'rt', fetchMock as unknown as typeof fetch);
    expect(result.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('postMagicLink: success → ok:true', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true } as Response);
    const result = await postMagicLink('https://sb', 'key', 'a@b.de', 'https://app/', fetchMock as unknown as typeof fetch);
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/v1/otp?redirect_to=https%3A%2F%2Fapp%2F'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@b.de', create_user: true }),
      }),
    );
  });

  test('postMagicLink: invalid email → ok:false, kein fetch', async () => {
    const fetchMock = vi.fn();
    const result = await postMagicLink('https://sb', 'key', 'not-an-email', 'https://app/', fetchMock as unknown as typeof fetch);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Ungültige/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('postMagicLink: missing config → ok:false', async () => {
    const result = await postMagicLink('', 'key', 'a@b.de', 'https://app/');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/konfiguriert/);
  });

  test('postMagicLink: server error → ok:false + error-Text', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    } as Response);
    const result = await postMagicLink('https://sb', 'key', 'a@b.de', 'https://app/', fetchMock as unknown as typeof fetch);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Internal Server Error');
  });

  test('postSignOut: fires POST mit Bearer-Header', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true } as Response);
    await postSignOut('https://sb', 'key', 'token-xyz', fetchMock as unknown as typeof fetch);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://sb/auth/v1/logout',
      expect.objectContaining({
        method: 'POST',
        headers: { apikey: 'key', Authorization: 'Bearer token-xyz' },
      }),
    );
  });

  test('postSignOut: Network-Throw wird geschluckt (Best-Effort)', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('offline'));
    // Soll NICHT throwen — Best-Effort-Semantik
    await expect(
      postSignOut('https://sb', 'key', 'token-xyz', fetchMock as unknown as typeof fetch),
    ).resolves.toBeUndefined();
  });

  test('postSignOut: kein Token → early-return ohne fetch', async () => {
    const fetchMock = vi.fn();
    await postSignOut('https://sb', 'key', '', fetchMock as unknown as typeof fetch);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
