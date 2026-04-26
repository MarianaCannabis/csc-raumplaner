import { describe, it, expect, vi } from 'vitest';
import {
  fetchSubscription,
  setUserPlan,
  getCurrentPlan,
} from '../subscriptions.js';

const CTX = { url: 'https://demo.supabase.co', key: 'KEY', token: 'TOKEN' };

function mkResponse(status: number, body?: unknown): Response {
  const r = new Response(body !== undefined ? JSON.stringify(body) : null, { status });
  return r;
}

describe('fetchSubscription', () => {
  it('returnt Subscription-Object wenn vorhanden', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      mkResponse(200, [{ id: 's1', user_id: 'u1', plan: 'pro', status: 'active' }]),
    );
    const r = await fetchSubscription(CTX, 'u1', fetchFn as unknown as typeof fetch);
    expect(r?.plan).toBe('pro');
  });

  it('returnt null wenn 404 (Tabelle fehlt)', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(404));
    const r = await fetchSubscription(CTX, 'u1', fetchFn as unknown as typeof fetch);
    expect(r).toBeNull();
  });

  it('returnt null wenn leeres Array (kein Eintrag)', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(200, []));
    const r = await fetchSubscription(CTX, 'u1', fetchFn as unknown as typeof fetch);
    expect(r).toBeNull();
  });
});

describe('getCurrentPlan', () => {
  it('returnt plan aus Subscription', async () => {
    const fetchFn = vi.fn().mockResolvedValue(
      mkResponse(200, [{ user_id: 'u1', plan: 'team', status: 'active' }]),
    );
    const plan = await getCurrentPlan(CTX, 'u1', fetchFn as unknown as typeof fetch);
    expect(plan).toBe('team');
  });

  it('returnt "free" wenn kein Eintrag', async () => {
    const fetchFn = vi.fn().mockResolvedValue(mkResponse(200, []));
    const plan = await getCurrentPlan(CTX, 'u1', fetchFn as unknown as typeof fetch);
    expect(plan).toBe('free');
  });
});

describe('setUserPlan', () => {
  it('UPDATE wenn Eintrag existiert', async () => {
    const fetchFn = vi
      .fn()
      // 1. fetchSubscription returnt existierenden
      .mockResolvedValueOnce(mkResponse(200, [{ user_id: 'u1', plan: 'free', status: 'active' }]))
      // 2. PATCH 204
      .mockResolvedValueOnce(mkResponse(204));
    await setUserPlan(CTX, 'u1', 'pro', undefined, fetchFn as unknown as typeof fetch);
    const [patchUrl, patchInit] = fetchFn.mock.calls[1]!;
    expect((patchInit as RequestInit).method).toBe('PATCH');
    expect(patchUrl).toContain('user_id=eq.u1');
    const body = JSON.parse((patchInit as RequestInit).body as string);
    expect(body.plan).toBe('pro');
  });

  it('INSERT wenn kein Eintrag', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, []))
      .mockResolvedValueOnce(mkResponse(201));
    await setUserPlan(CTX, 'u1', 'team', undefined, fetchFn as unknown as typeof fetch);
    const [, postInit] = fetchFn.mock.calls[1]!;
    expect((postInit as RequestInit).method).toBe('POST');
    const body = JSON.parse((postInit as RequestInit).body as string);
    expect(body.user_id).toBe('u1');
    expect(body.plan).toBe('team');
    expect(body.status).toBe('active');
  });

  it('PATCH-Fehler wirft Error', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, [{ user_id: 'u1', plan: 'free', status: 'active' }]))
      .mockResolvedValueOnce(mkResponse(403));
    await expect(
      setUserPlan(CTX, 'u1', 'pro', undefined, fetchFn as unknown as typeof fetch),
    ).rejects.toThrow(/PATCH HTTP 403/);
  });

  it('POST-Fehler wirft Error', async () => {
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(mkResponse(200, []))
      .mockResolvedValueOnce(mkResponse(400));
    await expect(
      setUserPlan(CTX, 'u1', 'pro', undefined, fetchFn as unknown as typeof fetch),
    ).rejects.toThrow(/POST HTTP 400/);
  });
});
