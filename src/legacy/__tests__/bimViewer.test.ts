import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBimViewer, exportCurrentSceneAsIfc, type BimComponentsModule, type BimViewerDeps } from '../bimViewer.js';

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

  it('exportToIfc auf Instance verweist auf exportCurrentSceneAsIfc', async () => {
    const inst = await createBimViewer(makeDeps());
    await expect(inst.exportToIfc()).rejects.toThrow(/exportCurrentSceneAsIfc/);
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

  it('exportToIfc auf BimViewerInstance wirft (use exportCurrentSceneAsIfc)', async () => {
    const inst = await createBimViewer(makeDeps());
    await expect(inst.exportToIfc()).rejects.toThrow(/exportCurrentSceneAsIfc/);
  });
});

describe('exportCurrentSceneAsIfc (Phase 2)', () => {
  it('returnt Blob mit MIME application/x-step', async () => {
    const blob = await exportCurrentSceneAsIfc({
      rooms: [{ id: 'r1', name: 'Hauptraum', x: 0, y: 0, w: 5, d: 4 }],
      objects: [],
      walls: [],
      grounds: [],
      measures: [],
      projName: 'Test',
    });
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/x-step');
  });

  it('Blob-Inhalt enthält IFC-Header (ISO-10303-21)', async () => {
    const blob = await exportCurrentSceneAsIfc({
      rooms: [{ id: 'r1', name: 'Raum', x: 0, y: 0, w: 5, d: 4 }],
      objects: [],
      projName: 'Test',
    });
    const txt = await blob.text();
    expect(txt).toContain('ISO-10303-21;');
    expect(txt).toContain('END-ISO-10303-21;');
    expect(txt).toContain('IFC2X3');
  });

  it('Rooms → IFCSPACE-Entries mit Namen', async () => {
    const blob = await exportCurrentSceneAsIfc({
      rooms: [
        { id: 'r1', name: 'Konsumraum', x: 0, y: 0, w: 5, d: 4 },
        { id: 'r2', name: 'Anbauraum', x: 6, y: 0, w: 5, d: 4 },
      ],
      objects: [],
      projName: 'Test',
    });
    const txt = await blob.text();
    expect(txt).toContain('IFCSPACE');
    expect(txt).toContain('Konsumraum');
    expect(txt).toContain('Anbauraum');
  });

  it('Objects → IFCFURNISHINGELEMENT', async () => {
    const blob = await exportCurrentSceneAsIfc({
      rooms: [],
      objects: [{ id: 'o1', typeId: 'sofa-001', x: 1, y: 1, w: 2, d: 1 }],
      projName: 'Test',
    });
    const txt = await blob.text();
    expect(txt).toContain('IFCFURNISHINGELEMENT');
    expect(txt).toContain('sofa-001');
  });

  it('Walls → IFCWALLSTANDARDCASE', async () => {
    const blob = await exportCurrentSceneAsIfc({
      rooms: [],
      objects: [],
      walls: [{ id: 'w1', x1: 0, z1: 0, x2: 5, z2: 0 }],
      projName: 'Test',
    });
    const txt = await blob.text();
    expect(txt).toContain('IFCWALLSTANDARDCASE');
  });

  it('Building/Storey-Hierarchie immer vorhanden', async () => {
    const blob = await exportCurrentSceneAsIfc({
      rooms: [], objects: [], projName: 'Empty',
    });
    const txt = await blob.text();
    expect(txt).toContain('IFCPROJECT');
    expect(txt).toContain('IFCSITE');
    expect(txt).toContain('IFCBUILDING');
    expect(txt).toContain('IFCBUILDINGSTOREY');
  });
});
