import { describe, test, expect, beforeEach, vi } from 'vitest';

// Module hat internen Singleton-State — vi.resetModules + localStorage.clear
// pro Test, damit Queue-Zustand nicht zwischen Tests leakt.
beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
});

async function load() {
  return await import('../offlineQueue.js');
}

describe('persist/offlineQueue', () => {
  test('queueAction + getQueueSize + listQueue', async () => {
    const oq = await load();
    expect(oq.getQueueSize()).toBe(0);
    oq.queueAction('cloud_save', { foo: 1 });
    oq.queueAction('cloud_save', { foo: 2 });
    expect(oq.getQueueSize()).toBe(2);
    const list = oq.listQueue();
    expect(list).toHaveLength(2);
    expect(list[0]?.type).toBe('cloud_save');
    expect(list[0]?.data).toEqual({ foo: 1 });
  });

  test('queueAction persistiert in localStorage', async () => {
    const oq = await load();
    oq.queueAction('cloud_save', { x: 1 });
    const raw = localStorage.getItem('csc-offline-queue');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].type).toBe('cloud_save');
  });

  test('flushQueue: Handler-success → Action aus Queue entfernt', async () => {
    const oq = await load();
    const handler = vi.fn().mockResolvedValue(undefined);
    oq.registerHandler('cloud_save', handler);
    oq.queueAction('cloud_save', { id: 1 });
    oq.queueAction('cloud_save', { id: 2 });
    const count = await oq.flushQueue();
    expect(count).toBe(2);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(oq.getQueueSize()).toBe(0);
  });

  test('flushQueue: Handler nicht registriert → Action bleibt in Queue', async () => {
    const oq = await load();
    oq.queueAction('unknown_type', { x: 1 });
    const count = await oq.flushQueue();
    expect(count).toBe(0);
    expect(oq.getQueueSize()).toBe(1);
  });

  test('flushQueue: Handler-Fehler → attempts++ und bleibt in Queue', async () => {
    const oq = await load();
    const handler = vi.fn().mockRejectedValue(new Error('network down'));
    oq.registerHandler('cloud_save', handler);
    oq.queueAction('cloud_save', { id: 1 });
    await oq.flushQueue();
    await oq.flushQueue();
    expect(oq.getQueueSize()).toBe(1);
    const list = oq.listQueue();
    expect(list[0]?.attempts).toBe(2);
  });

  test('flushQueue: MAX_ATTEMPTS überschritten → Action verworfen', async () => {
    const oq = await load();
    const handler = vi.fn().mockRejectedValue(new Error('permanent'));
    oq.registerHandler('cloud_save', handler);
    oq.queueAction('cloud_save', { id: 1 });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (let i = 0; i < 6; i++) await oq.flushQueue();
    expect(oq.getQueueSize()).toBe(0);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test('flushQueue: offline → no-op', async () => {
    const oq = await load();
    const handler = vi.fn().mockResolvedValue(undefined);
    oq.registerHandler('cloud_save', handler);
    oq.queueAction('cloud_save', { id: 1 });
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const count = await oq.flushQueue();
    expect(count).toBe(0);
    expect(handler).not.toHaveBeenCalled();
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  test('clearQueue leert Queue + localStorage', async () => {
    const oq = await load();
    oq.queueAction('cloud_save', { x: 1 });
    oq.clearQueue();
    expect(oq.getQueueSize()).toBe(0);
    expect(localStorage.getItem('csc-offline-queue')).toBe('[]');
  });

  test('Module-Init lädt persistierte Queue aus localStorage', async () => {
    localStorage.setItem(
      'csc-offline-queue',
      JSON.stringify([{ type: 'cloud_save', data: { x: 1 }, ts: 12345, attempts: 0 }]),
    );
    const oq = await load();
    expect(oq.getQueueSize()).toBe(1);
    const list = oq.listQueue();
    expect(list[0]?.data).toEqual({ x: 1 });
  });
});
