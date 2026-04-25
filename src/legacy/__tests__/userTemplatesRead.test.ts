import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadUserTemplates,
  deleteUserTemplate,
  applyUserTemplate,
  invalidateUserTemplatesCache,
  getUserTemplatesCacheSnapshot,
  type UserTemplate,
  type UserTemplatesDeps,
  type UserTemplatesUIDeps,
} from '../userTemplatesRead.js';

const baseDeps = (overrides: Partial<UserTemplatesDeps> = {}): UserTemplatesDeps => ({
  sbUrl: 'https://demo.supabase.co',
  sbKey: 'anon',
  sbToken: 'tok',
  ...overrides,
});

const uiDeps = (overrides: Partial<UserTemplatesUIDeps> = {}): UserTemplatesUIDeps => ({
  ...baseDeps(),
  closeM: vi.fn(),
  refreshTemplatesUI: vi.fn(),
  toast: vi.fn(),
  loadPD: vi.fn(),
  confirmFn: () => true,
  ...overrides,
});

const tpls = (n: number): UserTemplate[] =>
  Array.from({ length: n }, (_, i) => ({ id: 'tpl-' + i, name: 'T' + i, data: { i } }));

beforeEach(() => {
  invalidateUserTemplatesCache();
});

describe('loadUserTemplates', () => {
  it('ohne Token: returnt []', async () => {
    const out = await loadUserTemplates(baseDeps({ sbToken: null }));
    expect(out).toEqual([]);
  });

  it('Cache-Miss: fetcht + befüllt Cache', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tpls(3)),
    });
    const out = await loadUserTemplates({
      ...baseDeps(),
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    expect(out.length).toBe(3);
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it('Cache-Hit: kein zweiter fetch innerhalb TTL', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tpls(2)),
    });
    await loadUserTemplates({ ...baseDeps(), fetchFn: fetchFn as unknown as typeof fetch });
    await loadUserTemplates({ ...baseDeps(), fetchFn: fetchFn as unknown as typeof fetch });
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it('invalidateUserTemplatesCache → nächster Call fetcht erneut', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(tpls(1)),
    });
    await loadUserTemplates({ ...baseDeps(), fetchFn: fetchFn as unknown as typeof fetch });
    invalidateUserTemplatesCache();
    await loadUserTemplates({ ...baseDeps(), fetchFn: fetchFn as unknown as typeof fetch });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('fetch fail (status 500): returnt []', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 500, json: () => Promise.resolve(null) });
    const out = await loadUserTemplates({
      ...baseDeps(),
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    expect(out).toEqual([]);
  });

  it('fetch throws: returnt [] (kein crash)', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('network'));
    const out = await loadUserTemplates({
      ...baseDeps(),
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    expect(out).toEqual([]);
  });

  it('order-Parameter im fetch-URL', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
    await loadUserTemplates({ ...baseDeps(), fetchFn: fetchFn as unknown as typeof fetch });
    const [url] = fetchFn.mock.calls[0]!;
    expect(url).toContain('order=updated_at.desc');
  });
});

describe('deleteUserTemplate', () => {
  it('confirm=false → kein fetch', async () => {
    const fetchFn = vi.fn();
    await deleteUserTemplate('id1', uiDeps({
      confirmFn: () => false,
      fetchFn: fetchFn as unknown as typeof fetch,
    }));
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('confirm=true: fetch DELETE + invalidate + refreshUI + toast', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: true });
    const refreshTemplatesUI = vi.fn();
    const toast = vi.fn();
    // Cache vorher mit Daten — danach soll er leer sein
    invalidateUserTemplatesCache();
    await deleteUserTemplate('id1', uiDeps({
      fetchFn: fetchFn as unknown as typeof fetch,
      refreshTemplatesUI,
      toast,
    }));
    expect(fetchFn).toHaveBeenCalledOnce();
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toContain('id=eq.id1');
    expect((init as RequestInit).method).toBe('DELETE');
    expect(refreshTemplatesUI).toHaveBeenCalledOnce();
    expect(toast).toHaveBeenCalledWith(expect.stringContaining('gelöscht'), 'b');
  });
});

describe('applyUserTemplate', () => {
  it('Cache leer / id nicht vorhanden: toast(r), kein loadPD', () => {
    const deps = uiDeps();
    applyUserTemplate('missing', deps);
    expect(deps.toast).toHaveBeenCalledWith('Vorlage nicht gefunden', 'r');
    expect(deps.loadPD).not.toHaveBeenCalled();
  });

  it('Cache hat id, confirm=true: closeM + loadPD + toast(g)', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 'X', name: 'TestT', data: { foo: 1 } }]),
    });
    await loadUserTemplates({ ...baseDeps(), fetchFn: fetchFn as unknown as typeof fetch });
    expect(getUserTemplatesCacheSnapshot().length).toBe(1);
    const deps = uiDeps();
    applyUserTemplate('X', deps);
    expect(deps.closeM).toHaveBeenCalledWith('m-templates');
    expect(deps.loadPD).toHaveBeenCalledWith({ foo: 1 });
    expect(deps.toast).toHaveBeenCalledWith(expect.stringContaining('geladen'), 'g');
  });

  it('confirm=false: kein loadPD', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 'Y', name: 'T', data: {} }]),
    });
    await loadUserTemplates({ ...baseDeps(), fetchFn: fetchFn as unknown as typeof fetch });
    const deps = uiDeps({ confirmFn: () => false });
    applyUserTemplate('Y', deps);
    expect(deps.loadPD).not.toHaveBeenCalled();
  });
});
