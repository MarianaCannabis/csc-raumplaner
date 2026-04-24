import { describe, test, expect, vi } from 'vitest';
import * as cloud from '../cloudProjects.js';

const CTX = { url: 'https://demo.supabase.co', key: 'anon-xyz', token: 'user-tok' };

function mkResponse(status: number, body: unknown = null): Response {
  return new Response(body === null ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('persist/cloudProjects', () => {
  test('findProjectByName liefert id wenn Row vorhanden', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(200, [{ id: 'abc-123' }]));
    const id = await cloud.findProjectByName(CTX, 'Projekt 1', undefined, fetchFn as unknown as typeof fetch);
    expect(id).toBe('abc-123');
    expect(fetchFn).toHaveBeenCalledOnce();
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toContain('/rest/v1/csc_projects?name=eq.Projekt%201');
    expect((init as RequestInit).method).toBe('GET');
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers.apikey).toBe('anon-xyz');
    expect(headers.Authorization).toBe('Bearer user-tok');
  });

  test('findProjectByName liefert null wenn Liste leer', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(200, []));
    const id = await cloud.findProjectByName(CTX, 'missing', undefined, fetchFn as unknown as typeof fetch);
    expect(id).toBeNull();
  });

  test('findProjectByName wirft TableMissingError bei 404', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(404));
    await expect(
      cloud.findProjectByName(CTX, 'x', undefined, fetchFn as unknown as typeof fetch),
    ).rejects.toBeInstanceOf(cloud.TableMissingError);
  });

  test('saveCloudProject: existing id → PATCH mit created=false', async () => {
    const fetchFn = vi
      .fn()
      // 1. findProjectByName
      .mockResolvedValueOnce(mkResponse(200, [{ id: 'existing-9' }]))
      // 2. PATCH
      .mockResolvedValueOnce(mkResponse(204));
    const r = await cloud.saveCloudProject(
      CTX,
      { name: 'P', data: { a: 1 } },
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    expect(r).toEqual({ id: 'existing-9', created: false });
    const [patchUrl, patchInit] = fetchFn.mock.calls[1]!;
    expect(patchUrl).toContain('/rest/v1/csc_projects?id=eq.existing-9');
    expect((patchInit as RequestInit).method).toBe('PATCH');
  });

  test('saveCloudProject: kein existing → POST mit created=true', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, []))
      .mockResolvedValueOnce(mkResponse(201));
    const r = await cloud.saveCloudProject(
      CTX,
      { name: 'Neu', data: {} },
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    expect(r.created).toBe(true);
    const [postUrl, postInit] = fetchFn.mock.calls[1]!;
    expect(postUrl).toBe('https://demo.supabase.co/rest/v1/csc_projects');
    expect((postInit as RequestInit).method).toBe('POST');
  });

  test('fetchAllCloudProjects returnt array', async () => {
    const rows = [
      { id: 'a', name: 'A', updated_at: '2026-01-01' },
      { id: 'b', name: 'B', updated_at: '2026-01-02' },
    ];
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(200, rows));
    const list = await cloud.fetchAllCloudProjects(CTX, undefined, fetchFn as unknown as typeof fetch);
    expect(list).toEqual(rows);
    const [url] = fetchFn.mock.calls[0]!;
    expect(url).toContain('order=updated_at.desc');
    expect(url).toContain('limit=20');
  });

  test('fetchAllCloudProjects returnt [] bei 404 (Tabelle fehlt)', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(404));
    const list = await cloud.fetchAllCloudProjects(CTX, undefined, fetchFn as unknown as typeof fetch);
    expect(list).toEqual([]);
  });

  test('loadCloudProject liefert data-Feld', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(200, [{ data: { rooms: [] } }]));
    const data = await cloud.loadCloudProject(CTX, 'id-42', undefined, fetchFn as unknown as typeof fetch);
    expect(data).toEqual({ rooms: [] });
  });

  test('loadCloudProject liefert null wenn Row nicht da', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(200, []));
    const data = await cloud.loadCloudProject(CTX, 'missing', undefined, fetchFn as unknown as typeof fetch);
    expect(data).toBeNull();
  });

  test('deleteCloudProject: 204 resolves', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(204));
    await expect(
      cloud.deleteCloudProject(CTX, 'abc', undefined, fetchFn as unknown as typeof fetch),
    ).resolves.toBeUndefined();
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toContain('id=eq.abc');
    expect((init as RequestInit).method).toBe('DELETE');
  });

  test('401-Retry: refresh liefert neuen Token → Retry mit Bearer new', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(401))
      .mockResolvedValueOnce(mkResponse(200, [{ id: 'retried' }]));
    const refresh = vi.fn().mockResolvedValue('new-token');
    const id = await cloud.findProjectByName(CTX, 'P', refresh, fetchFn as unknown as typeof fetch);
    expect(id).toBe('retried');
    expect(refresh).toHaveBeenCalledOnce();
    const [, secondInit] = fetchFn.mock.calls[1]!;
    const headers = (secondInit as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer new-token');
  });

  test('401-Retry: refresh liefert null → AuthError', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(401));
    const refresh = vi.fn().mockResolvedValue(null);
    await expect(
      cloud.findProjectByName(CTX, 'P', refresh, fetchFn as unknown as typeof fetch),
    ).rejects.toBeInstanceOf(cloud.AuthError);
  });

  test('401-Retry: zweiter 401 nach refresh → AuthError', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(401))
      .mockResolvedValueOnce(mkResponse(401));
    const refresh = vi.fn().mockResolvedValue('new-token');
    await expect(
      cloud.findProjectByName(CTX, 'P', refresh, fetchFn as unknown as typeof fetch),
    ).rejects.toBeInstanceOf(cloud.AuthError);
  });
});
