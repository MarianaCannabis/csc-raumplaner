import { describe, test, expect, beforeEach, vi } from 'vitest';

// magicLink.ts ruft setToken() aus state.js auf. State ist ein Singleton
// mit Module-Scope — wir nutzen vi.resetModules damit jeder Test eine
// frische State-Instanz sieht (auch von localStorage-Hydration isoliert).

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

async function load() {
  const magicLink = await import('../magicLink.js');
  const state = await import('../state.js');
  return { magicLink, state };
}

// Access-Token-Payload für die Tests: base64url-JWT mit sub + email.
// btoa + url-safe char-swap — Buffer ist in jsdom-env nicht verfügbar.
function b64url(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
function mkToken(sub: string, email: string): string {
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const payload = b64url({ sub, email, exp: Math.floor(Date.now() / 1000) + 3600 });
  return `${header}.${payload}.sig`;
}

describe('auth/magicLink — consumeMagicLinkFromHash', () => {
  test('Hash ohne access_token → returnt false, kein State-Write', async () => {
    const { magicLink, state } = await load();
    const result = magicLink.consumeMagicLinkFromHash('');
    expect(result).toBe(false);
    expect(state.getAuthState().isSignedIn).toBe(false);
  });

  test('Hash mit foo=bar (kein Auth) → false', async () => {
    const { magicLink, state } = await load();
    expect(magicLink.consumeMagicLinkFromHash('#foo=bar')).toBe(false);
    expect(state.getAuthState().isSignedIn).toBe(false);
  });

  test('Hash mit access_token → setToken + returnt true', async () => {
    const { magicLink, state } = await load();
    const at = mkToken('user-42', 'a@b.de');
    const result = magicLink.consumeMagicLinkFromHash(`#access_token=${at}&token_type=bearer`);
    expect(result).toBe(true);
    const snap = state.getAuthState();
    expect(snap.isSignedIn).toBe(true);
    expect(snap.token).toBe(at);
    expect(snap.user?.id).toBe('user-42');
    expect(snap.user?.email).toBe('a@b.de');
  });

  test('saveRefresh-Callback mit refresh_token ausgelöst', async () => {
    const { magicLink } = await load();
    const saveRefresh = vi.fn();
    const at = mkToken('u1', 'x@y.de');
    magicLink.consumeMagicLinkFromHash(
      `#access_token=${at}&refresh_token=rt-abc&token_type=bearer`,
      { saveRefresh },
    );
    expect(saveRefresh).toHaveBeenCalledExactlyOnceWith('rt-abc');
  });

  test('kein refresh_token → saveRefresh nicht gerufen', async () => {
    const { magicLink } = await load();
    const saveRefresh = vi.fn();
    const at = mkToken('u1', 'x@y.de');
    magicLink.consumeMagicLinkFromHash(`#access_token=${at}&token_type=bearer`, { saveRefresh });
    expect(saveRefresh).not.toHaveBeenCalled();
  });

  test('replaceHistory-Callback wird gerufen', async () => {
    const { magicLink } = await load();
    const replaceHistory = vi.fn();
    const at = mkToken('u1', 'x@y.de');
    magicLink.consumeMagicLinkFromHash(`#access_token=${at}&token_type=bearer`, { replaceHistory });
    expect(replaceHistory).toHaveBeenCalledOnce();
  });

  test('onSuccess-Callback (Toast) wird gerufen', async () => {
    const { magicLink } = await load();
    const onSuccess = vi.fn();
    const at = mkToken('u1', 'x@y.de');
    magicLink.consumeMagicLinkFromHash(`#access_token=${at}&token_type=bearer`, { onSuccess });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('saveRefresh throw → State bleibt gesetzt, kein Re-Throw', async () => {
    const { magicLink, state } = await load();
    const at = mkToken('u1', 'x@y.de');
    expect(() =>
      magicLink.consumeMagicLinkFromHash(
        `#access_token=${at}&refresh_token=rt&token_type=bearer`,
        { saveRefresh: () => { throw new Error('quota exceeded'); } },
      ),
    ).not.toThrow();
    expect(state.getAuthState().isSignedIn).toBe(true);
  });

  test('replaceHistory throw → State bleibt gesetzt, kein Re-Throw', async () => {
    const { magicLink, state } = await load();
    const at = mkToken('u1', 'x@y.de');
    expect(() =>
      magicLink.consumeMagicLinkFromHash(`#access_token=${at}&token_type=bearer`, {
        replaceHistory: () => { throw new Error('history API unsupported'); },
      }),
    ).not.toThrow();
    expect(state.getAuthState().isSignedIn).toBe(true);
  });

  test('onSuccess throw → State bleibt gesetzt, kein Re-Throw', async () => {
    const { magicLink, state } = await load();
    const at = mkToken('u1', 'x@y.de');
    expect(() =>
      magicLink.consumeMagicLinkFromHash(`#access_token=${at}&token_type=bearer`, {
        onSuccess: () => { throw new Error('toast undefined'); },
      }),
    ).not.toThrow();
    expect(state.getAuthState().isSignedIn).toBe(true);
  });

  test('ohne Callbacks funktioniert (nur State-Write)', async () => {
    const { magicLink, state } = await load();
    const at = mkToken('u1', 'x@y.de');
    expect(magicLink.consumeMagicLinkFromHash(`#access_token=${at}&token_type=bearer`)).toBe(true);
    expect(state.getAuthState().isSignedIn).toBe(true);
  });
});
