import { describe, test, expect, beforeEach, vi } from 'vitest';

// Wichtig: wir müssen das state-Modul JEDES Mal frisch importieren, weil
// es Module-Scope-State hat (der hydrate + storage-Listener). vi.resetModules
// gibt uns saubere Module-Caches zwischen Tests.

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

async function loadState() {
  return await import('../state.js');
}

describe('auth/state', () => {
  test('getAuthState: default state (kein Token) → isSignedIn false', async () => {
    const state = await loadState();
    expect(state.getAuthState()).toEqual({ token: '', user: null, isSignedIn: false });
  });

  test('setToken → getAuthState liefert neuen Wert', async () => {
    const state = await loadState();
    state.setToken('tok-xyz', { id: 'u1', email: 'a@b.de' });
    expect(state.getAuthState()).toEqual({
      token: 'tok-xyz',
      user: { id: 'u1', email: 'a@b.de' },
      isSignedIn: true,
    });
  });

  test('setToken persistiert in localStorage', async () => {
    const state = await loadState();
    state.setToken('tok', { id: 'u1', email: 'x@y.de' });
    expect(localStorage.getItem('csc-sb-token')).toBe('tok');
    expect(JSON.parse(localStorage.getItem('csc-sb-user')!)).toEqual({ id: 'u1', email: 'x@y.de' });
  });

  test('clearAuth → token leer, localStorage clean', async () => {
    const state = await loadState();
    state.setToken('tok', { id: 'u', email: 'e@m.de' });
    state.clearAuth();
    expect(state.getAuthState().isSignedIn).toBe(false);
    expect(localStorage.getItem('csc-sb-token')).toBeNull();
    expect(localStorage.getItem('csc-sb-user')).toBeNull();
  });

  test('subscribe feuert bei setToken', async () => {
    const state = await loadState();
    const fn = vi.fn();
    state.subscribe(fn);
    state.setToken('new-tok', { id: 'u', email: 'e@m.de' });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({
      token: 'new-tok',
      user: { id: 'u', email: 'e@m.de' },
      isSignedIn: true,
    });
  });

  test('Unsubscribe (Return-Value) stoppt Notifications', async () => {
    const state = await loadState();
    const fn = vi.fn();
    const unsub = state.subscribe(fn);
    state.setToken('a', { id: '1', email: 'x@y.de' });
    expect(fn).toHaveBeenCalledTimes(1);
    unsub();
    state.setToken('b', { id: '2', email: 'x@y.de' });
    expect(fn).toHaveBeenCalledTimes(1); // unchanged
  });

  test('Subscriber-Throw darf andere Subscriber nicht blockieren', async () => {
    const state = await loadState();
    const bad = vi.fn(() => { throw new Error('boom'); });
    const good = vi.fn();
    state.subscribe(bad);
    state.subscribe(good);
    // Konsolen-Warn hier erwartet — nicht fatal
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    state.setToken('tok', null);
    expect(bad).toHaveBeenCalled();
    expect(good).toHaveBeenCalled();
    warn.mockRestore();
  });

  test('Module-Init hydriert aus localStorage', async () => {
    localStorage.setItem('csc-sb-token', 'prehydrated');
    localStorage.setItem('csc-sb-user', JSON.stringify({ id: 'pre', email: 'p@h.de' }));
    const state = await loadState();
    expect(state.getAuthState().token).toBe('prehydrated');
    expect(state.getAuthState().user).toEqual({ id: 'pre', email: 'p@h.de' });
    expect(state.getAuthState().isSignedIn).toBe(true);
  });

  test('Module-Init mit defektem csc-sb-user → user bleibt null', async () => {
    localStorage.setItem('csc-sb-token', 'tok');
    localStorage.setItem('csc-sb-user', '{not-json');
    const state = await loadState();
    expect(state.getAuthState().token).toBe('tok');
    expect(state.getAuthState().user).toBeNull();
  });

  test('Cross-Tab Sync: storage-Event mit neuem Token → Listener feuert', async () => {
    const state = await loadState();
    const fn = vi.fn();
    state.subscribe(fn);
    // User im anderen „Tab" setzen:
    localStorage.setItem('csc-sb-user', JSON.stringify({ id: 'xtab', email: 'x@t.de' }));
    // Storage-Event mit relevantem key feuern
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'csc-sb-token',
      newValue: 'xtab-token',
    }));
    expect(fn).toHaveBeenCalled();
    expect(state.getAuthState().token).toBe('xtab-token');
    expect(state.getAuthState().user?.id).toBe('xtab');
  });

  test('Cross-Tab Sync: logout in anderem Tab → Listener feuert, State clean', async () => {
    const state = await loadState();
    state.setToken('tok', { id: 'u', email: 'e@m.de' });
    const fn = vi.fn();
    state.subscribe(fn);
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'csc-sb-token',
      newValue: '',
    }));
    expect(fn).toHaveBeenCalled();
    expect(state.getAuthState().isSignedIn).toBe(false);
  });

  test('Storage-Event für andere Keys wird ignoriert', async () => {
    const state = await loadState();
    const fn = vi.fn();
    state.subscribe(fn);
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'csc-other-key',
      newValue: 'foo',
    }));
    expect(fn).not.toHaveBeenCalled();
  });
});
