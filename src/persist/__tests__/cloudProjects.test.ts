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

  test('saveCloudProject: existing id → PATCH, type=updated', async () => {
    const fetchFn = vi
      .fn()
      // 1. findProjectByName
      .mockResolvedValueOnce(mkResponse(200, [{ id: 'existing-9' }]))
      // 2. PATCH (204 = no content, fallback-Pfad ohne version-Tracking)
      .mockResolvedValueOnce(mkResponse(204));
    const r = await cloud.saveCloudProject(
      CTX,
      { name: 'P', data: { a: 1 }, owner: 'user-1' },
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    expect(r).toEqual({ type: 'updated', id: 'existing-9' });
    const [patchUrl, patchInit] = fetchFn.mock.calls[1]!;
    expect(patchUrl).toContain('/rest/v1/csc_projects?id=eq.existing-9');
    expect((patchInit as RequestInit).method).toBe('PATCH');
  });

  test('saveCloudProject: kein existing → POST, type=created', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, []))
      .mockResolvedValueOnce(mkResponse(201));
    const r = await cloud.saveCloudProject(
      CTX,
      { name: 'Neu', data: {}, owner: 'user-1' },
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    expect(r.type).toBe('created');
    const [postUrl, postInit] = fetchFn.mock.calls[1]!;
    expect(postUrl).toBe('https://demo.supabase.co/rest/v1/csc_projects');
    expect((postInit as RequestInit).method).toBe('POST');
  });

  test('saveCloudProject INSERT: body enthält owner-Feld (Hotfix v2.6.2 RLS)', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, []))
      .mockResolvedValueOnce(mkResponse(201));
    await cloud.saveCloudProject(
      CTX,
      { name: 'Neu', data: { a: 1 }, owner: 'user-42' },
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    const [, postInit] = fetchFn.mock.calls[1]!;
    const body = JSON.parse((postInit as RequestInit).body as string);
    expect(body.owner).toBe('user-42');
    expect(body.name).toBe('Neu');
  });

  test('saveCloudProject PATCH: body hat KEIN owner-Feld (Hotfix v2.6.2)', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, [{ id: 'existing-7' }]))
      .mockResolvedValueOnce(mkResponse(204));
    await cloud.saveCloudProject(
      CTX,
      { name: 'P', data: { a: 1 }, owner: 'user-42', team_id: 't1' },
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    const [, patchInit] = fetchFn.mock.calls[1]!;
    const body = JSON.parse((patchInit as RequestInit).body as string);
    expect(body).not.toHaveProperty('owner');
    // team_id und andere Felder bleiben erhalten
    expect(body.team_id).toBe('t1');
    expect(body.name).toBe('P');
  });

  test('saveCloudProject: leerer owner-String → früh Error (Hotfix v2.6.3 Runtime-Guard)', async () => {
    const fetchFn = vi.fn();
    await expect(
      cloud.saveCloudProject(
        CTX,
        { name: 'P', data: {}, owner: '' },
        undefined,
        fetchFn as unknown as typeof fetch,
      ),
    ).rejects.toThrow(/owner ist Pflicht/);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  test('saveCloudProject: undefined owner (Untyped-JS-Caller) → früh Error', async () => {
    const fetchFn = vi.fn();
    await expect(
      cloud.saveCloudProject(
        CTX,
        // Simuliert einen untyped JS-Caller der body.owner vergisst
        { name: 'P', data: {} } as unknown as Parameters<typeof cloud.saveCloudProject>[1],
        undefined,
        fetchFn as unknown as typeof fetch,
      ),
    ).rejects.toThrow(/owner ist Pflicht/);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  test('saveCloudProject INSERT: PGRST204 → sprechender Fehler mit Migration-Hinweis (v2.6.4)', async () => {
    const fetchFn = vi
      .fn()
      // 1. findProjectByName → leer, also INSERT
      .mockResolvedValueOnce(mkResponse(200, []))
      // 2. POST → PGRST204
      .mockResolvedValueOnce(
        mkResponse(400, {
          code: 'PGRST204',
          message: "Could not find the 'thumbnail' column of 'csc_projects' in the schema cache",
          hint: null,
        }),
      );
    await expect(
      cloud.saveCloudProject(
        CTX,
        { name: 'P', data: {}, owner: 'user-1', thumbnail: 'data:image/jpeg;base64,/9j/' },
        undefined,
        fetchFn as unknown as typeof fetch,
      ),
    ).rejects.toThrow(/PGRST204[\s\S]*Migration 0008/);
  });

  test('saveCloudProject INSERT: nicht-PGRST204 PostgREST-Fehler wird mit Code rendered', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, []))
      .mockResolvedValueOnce(
        mkResponse(400, { code: 'PGRST123', message: 'Some other error' }),
      );
    await expect(
      cloud.saveCloudProject(
        CTX,
        { name: 'P', data: {}, owner: 'user-1' },
        undefined,
        fetchFn as unknown as typeof fetch,
      ),
    ).rejects.toThrow(/PGRST123[\s\S]*Some other error/);
  });

  test('saveCloudProject PATCH: Eingabe-body wird nicht mutiert (defensive)', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, [{ id: 'x-1' }]))
      .mockResolvedValueOnce(mkResponse(204));
    const input = { name: 'P', data: {}, owner: 'user-9' };
    await cloud.saveCloudProject(
      CTX,
      input,
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    // PATCH-Pfad macht {owner, ...rest}-Destructure — Eingabe-Objekt
    // darf NICHT mutiert werden (Caller-Side-Effect-Kontrakt).
    expect(input.owner).toBe('user-9');
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

  test('loadCloudProject liefert {data, version}', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValue(mkResponse(200, [{ data: { rooms: [] }, version: 7 }]));
    const result = await cloud.loadCloudProject(
      CTX,
      'id-42',
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    expect(result).toEqual({ data: { rooms: [] }, version: 7 });
    const [url] = fetchFn.mock.calls[0]!;
    expect(url).toContain('select=data,version');
  });

  test('loadCloudProject ohne version-Spalte (pre-Migration): version=undefined', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(200, [{ data: { x: 1 } }]));
    const result = await cloud.loadCloudProject(
      CTX,
      'id',
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    expect(result).toEqual({ data: { x: 1 }, version: undefined });
  });

  test('loadCloudProject liefert null wenn Row nicht da', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(200, []));
    const result = await cloud.loadCloudProject(
      CTX,
      'missing',
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    expect(result).toBeNull();
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

  // ── Pfad-D: Optimistic Locking + Conflict Detection ─────────

  test('saveCloudProject mit version: PATCH-URL enthält version=eq.X', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, [{ id: 'p-1' }]))
      .mockResolvedValueOnce(mkResponse(200, [{ version: 6 }]));
    await cloud.saveCloudProject(
      CTX,
      { name: 'P', data: {}, owner: 'user-1', version: 5 },
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    const [patchUrl] = fetchFn.mock.calls[1]!;
    expect(patchUrl).toContain('version=eq.5');
    expect(patchUrl).toContain('select=version');
  });

  test('saveCloudProject ohne version: PATCH-URL hat keinen version-Filter', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, [{ id: 'p-1' }]))
      .mockResolvedValueOnce(mkResponse(204));
    await cloud.saveCloudProject(
      CTX,
      { name: 'P', data: {}, owner: 'user-1' },
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    const [patchUrl] = fetchFn.mock.calls[1]!;
    expect(patchUrl).not.toContain('version=eq');
  });

  test('saveCloudProject mit version: erfolgreicher PATCH returnt {type:updated, version: serverNew}', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, [{ id: 'p-1' }]))
      .mockResolvedValueOnce(mkResponse(200, [{ version: 6 }]));
    const r = await cloud.saveCloudProject(
      CTX,
      { name: 'P', data: {}, owner: 'user-1', version: 5 },
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    expect(r).toEqual({ type: 'updated', id: 'p-1', version: 6 });
  });

  test('saveCloudProject Konflikt: 0 rows → fetchProjectByIdFull → ConflictDetected', async () => {
    const fetchFn = vi
      .fn()
      // 1. findProjectByName
      .mockResolvedValueOnce(mkResponse(200, [{ id: 'p-1' }]))
      // 2. PATCH mit version-filter → 0 rows (Konflikt)
      .mockResolvedValueOnce(mkResponse(200, []))
      // 3. fetchProjectByIdFull
      .mockResolvedValueOnce(
        mkResponse(200, [
          {
            data: { rooms: [{ id: 'r-server' }] },
            thumbnail: 'data:image/jpeg;base64,SERVER',
            version: 8,
            updated_at: '2026-04-26T12:00:00Z',
            author: 'kollege@example.com',
          },
        ]),
      );
    const r = await cloud.saveCloudProject(
      CTX,
      { name: 'P', data: { rooms: [{ id: 'r-local' }] }, owner: 'user-1', version: 5 },
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    expect(r.type).toBe('conflict');
    if (r.type !== 'conflict') throw new Error('TS-narrowing');
    expect(r.serverVersion).toBe(8);
    expect(r.localVersion).toBe(5);
    expect(r.serverThumbnail).toContain('SERVER');
    expect(r.serverAuthor).toBe('kollege@example.com');
    expect((r.serverData as { rooms: { id: string }[] }).rooms[0]!.id).toBe('r-server');
    expect((r.localData as { rooms: { id: string }[] }).rooms[0]!.id).toBe('r-local');
  });

  test('saveCloudProject ohne version + 0 rows: kein Conflict (alter Pfad)', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, [{ id: 'p-1' }]))
      .mockResolvedValueOnce(mkResponse(200, []));
    const r = await cloud.saveCloudProject(
      CTX,
      { name: 'P', data: {}, owner: 'user-1' },
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    // Ohne body.version → kein Conflict-Check; updated mit version=undefined
    expect(r.type).toBe('updated');
  });

  test('fetchProjectByIdFull: Server-State korrekt extrahiert', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      mkResponse(200, [
        {
          data: { x: 1 },
          thumbnail: 'thumb',
          version: 3,
          updated_at: '2026-04-26',
          author: 'me',
        },
      ]),
    );
    const r = await cloud.fetchProjectByIdFull(
      CTX,
      'p-1',
      undefined,
      fetchFn as unknown as typeof fetch,
    );
    expect(r).toEqual({
      data: { x: 1 },
      thumbnail: 'thumb',
      version: 3,
      updated_at: '2026-04-26',
      author: 'me',
    });
  });

  test('fetchProjectByIdFull: Row gelöscht → throws "Project not found"', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(200, []));
    await expect(
      cloud.fetchProjectByIdFull(CTX, 'gone', undefined, fetchFn as unknown as typeof fetch),
    ).rejects.toThrow(/Project not found/);
  });

  test('probeOptimisticLocking: 200 → true', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(200, [{ version: 1 }]));
    const ok = await cloud.probeOptimisticLocking(CTX, fetchFn as unknown as typeof fetch);
    expect(ok).toBe(true);
  });

  test('probeOptimisticLocking: 400 (Spalte fehlt) → false', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(400));
    const ok = await cloud.probeOptimisticLocking(CTX, fetchFn as unknown as typeof fetch);
    expect(ok).toBe(false);
  });

  test('probeOptimisticLocking: network-error → false (graceful)', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('network down'));
    const ok = await cloud.probeOptimisticLocking(CTX, fetchFn as unknown as typeof fetch);
    expect(ok).toBe(false);
  });
});
