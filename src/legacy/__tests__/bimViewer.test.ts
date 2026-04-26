import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBimViewer, type BimComponentsModule, type BimViewerDeps } from '../bimViewer.js';

interface MockInstance { init: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; dispose: ReturnType<typeof vi.fn>; }
function makeMockOBC(instanceOverride?: Partial<MockInstance>): { obc: BimComponentsModule; instance: MockInstance } {
  const instance: MockInstance = {
    init: vi.fn(),
    get: vi.fn(() => ({})),
    dispose: vi.fn(),
    ...instanceOverride,
  };
  class Components {
    init = instance.init; get = instance.get; dispose = instance.dispose;
  }
  return {
    obc: {
      Components: Components as unknown as BimComponentsModule['Components'],
      Worlds: {} as unknown,
      SimpleScene: {} as unknown,
      SimpleRenderer: class {} as unknown as BimComponentsModule['SimpleRenderer'],
      SimpleCamera: class {} as unknown as BimComponentsModule['SimpleCamera'],
      IfcLoader: {} as unknown,
    },
    instance,
  };
}

function makeDeps(loadResult?: BimComponentsModule): BimViewerDeps {
  const obc = loadResult ?? makeMockOBC().obc;
  return {
    containerEl: document.createElement('div'),
    toast: vi.fn(),
    loadBimComponents: vi.fn(() => Promise.resolve(obc)),
  };
}

describe('createBimViewer (Phase 1)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('ruft loadBimComponents beim Erstellen', async () => {
    const deps = makeDeps();
    await createBimViewer(deps);
    expect(deps.loadBimComponents).toHaveBeenCalledOnce();
  });

  it('toast wird aufgerufen wenn der Lazy-Load startet', async () => {
    const deps = makeDeps();
    await createBimViewer(deps);
    expect(deps.toast).toHaveBeenCalled();
    const firstCall = (deps.toast as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(firstCall).toMatch(/BIM-Viewer/);
  });

  it('isReady ist true nach erfolgreichem Init', async () => {
    const inst = await createBimViewer(makeDeps());
    expect(inst.isReady()).toBe(true);
  });

  it('exportToIfc Phase 1 wirft "noch nicht implementiert"', async () => {
    const inst = await createBimViewer(makeDeps());
    await expect(inst.exportToIfc()).rejects.toThrow(/noch nicht implementiert/);
  });

  it('loadIfcFile ruft IfcLoader.load wenn vorhanden', async () => {
    const loadFn = vi.fn().mockResolvedValue(undefined);
    const { obc, instance } = makeMockOBC();
    instance.get = vi.fn(() => ({ load: loadFn }));
    const inst = await createBimViewer(makeDeps(obc));
    const file = new File(['mock'], 'test.ifc');
    await inst.loadIfcFile(file);
    expect(loadFn).toHaveBeenCalled();
  });

  it('dispose ruft components.dispose', async () => {
    const { obc, instance } = makeMockOBC();
    const inst = await createBimViewer(makeDeps(obc));
    inst.dispose();
    expect(instance.dispose).toHaveBeenCalled();
  });
});
