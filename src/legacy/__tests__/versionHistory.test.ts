import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveVersion,
  loadVersionHistory,
  renderVersionHistory,
  restoreVersion,
  deleteVersion,
  type VersionEntry,
  type VersionHistoryDeps,
} from '../versionHistory.js';

const mockBridge = (initial: VersionEntry[] = []) => {
  let store = initial.slice();
  return {
    list: vi.fn(() => store.slice()),
    push: vi.fn((data: unknown, label?: string) => {
      const entry: VersionEntry = {
        label: label || 'X',
        data: data as VersionEntry['data'],
        ts: Date.now(),
      };
      store = [entry, ...store];
      return store;
    }),
    remove: vi.fn((idx: number) => {
      store.splice(idx, 1);
      return store;
    }),
  };
};

const baseDeps = (overrides: Partial<VersionHistoryDeps> = {}): VersionHistoryDeps => ({
  getPD: () => ({ rooms: [{ id: 'r1' }], objects: [] }),
  loadPD: vi.fn(),
  toast: vi.fn(),
  confirmFn: () => true,
  versionsBridge: mockBridge(),
  ...overrides,
});

beforeEach(() => {
  document.body.innerHTML = '<div id="version-list"></div>';
  localStorage.clear();
});

describe('saveVersion', () => {
  it('mit Bridge: ruft bridge.push + toast + render', () => {
    const bridge = mockBridge();
    const deps = baseDeps({ versionsBridge: bridge });
    saveVersion('Meilenstein 1', deps);
    expect(bridge.push).toHaveBeenCalledOnce();
    expect(deps.toast).toHaveBeenCalledWith('📌 Version gespeichert', 'g');
    expect(document.getElementById('version-list')!.innerHTML).toContain('Meilenstein 1');
  });

  it('ohne Bridge: localStorage-Fallback', () => {
    const deps = baseDeps({ versionsBridge: undefined });
    saveVersion('Local-Save', deps);
    const stored = localStorage.getItem('csc-versions');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed[0].label).toBe('Local-Save');
  });

  it('default-Label: timestamp wenn label leer', () => {
    const bridge = mockBridge();
    const deps = baseDeps({ versionsBridge: bridge });
    saveVersion(undefined, deps);
    const [, label] = bridge.push.mock.calls[0]!;
    // toLocaleString German format
    expect(label).toMatch(/\d/);
  });
});

describe('loadVersionHistory', () => {
  it('returnt list von der Bridge', () => {
    const bridge = mockBridge([
      { label: 'A', data: {}, ts: 1 },
      { label: 'B', data: {}, ts: 2 },
    ]);
    const out = loadVersionHistory(baseDeps({ versionsBridge: bridge }));
    expect(out.length).toBe(2);
  });

  it('ohne Bridge: liest aus localStorage', () => {
    localStorage.setItem('csc-versions', JSON.stringify([{ label: 'L', data: {}, ts: 1 }]));
    const out = loadVersionHistory(baseDeps({ versionsBridge: undefined }));
    expect(out.length).toBe(1);
    expect(out[0]?.label).toBe('L');
  });
});

describe('renderVersionHistory', () => {
  it('leere Liste: zeigt "Keine Versionen"', () => {
    const deps = baseDeps();
    renderVersionHistory(deps);
    expect(document.getElementById('version-list')!.innerHTML).toContain('Keine Versionen');
  });

  it('mit Versionen: rendert .sitem-Divs', () => {
    const bridge = mockBridge([
      { label: 'V1', data: { rooms: [{ id: '1' }], objects: [] }, ts: 1 },
      { label: 'V2', data: { rooms: [], objects: [{ typeId: 'sofa' }] }, ts: 2 },
    ]);
    renderVersionHistory(baseDeps({ versionsBridge: bridge }));
    expect(document.querySelectorAll('#version-list .sitem').length).toBe(2);
  });

  it('zeigt Räume + Objekte-Counts', () => {
    const bridge = mockBridge([
      { label: 'V1', data: { rooms: [{ id: '1' }, { id: '2' }], objects: [{ typeId: 'a' }] }, ts: 1 },
    ]);
    renderVersionHistory(baseDeps({ versionsBridge: bridge }));
    const html = document.getElementById('version-list')!.innerHTML;
    expect(html).toContain('2 Räume');
    expect(html).toContain('1 Objekte');
  });

  it('ohne #version-list: no-op', () => {
    document.body.innerHTML = '';
    expect(() => renderVersionHistory(baseDeps())).not.toThrow();
  });
});

describe('restoreVersion', () => {
  it('confirm=true: ruft loadPD + toast', () => {
    const bridge = mockBridge([{ label: 'V1', data: { test: 1 }, ts: 1 }]);
    const deps = baseDeps({ versionsBridge: bridge });
    restoreVersion(0, deps);
    expect(deps.loadPD).toHaveBeenCalledWith({ test: 1 });
    expect(deps.toast).toHaveBeenCalledWith('🔄 Version wiederhergestellt', 'g');
  });

  it('confirm=false: kein loadPD', () => {
    const bridge = mockBridge([{ label: 'V', data: {}, ts: 1 }]);
    const deps = baseDeps({ versionsBridge: bridge, confirmFn: () => false });
    restoreVersion(0, deps);
    expect(deps.loadPD).not.toHaveBeenCalled();
  });

  it('invalid idx: no-op', () => {
    const deps = baseDeps();
    restoreVersion(99, deps);
    expect(deps.loadPD).not.toHaveBeenCalled();
  });
});

describe('deleteVersion', () => {
  it('mit Bridge: ruft bridge.remove + render', () => {
    const bridge = mockBridge([
      { label: 'V1', data: {}, ts: 1 },
      { label: 'V2', data: {}, ts: 2 },
    ]);
    const deps = baseDeps({ versionsBridge: bridge });
    deleteVersion(0, deps);
    expect(bridge.remove).toHaveBeenCalledWith(0);
  });

  it('ohne Bridge: localStorage-splice', () => {
    localStorage.setItem(
      'csc-versions',
      JSON.stringify([{ label: 'a', data: {}, ts: 1 }, { label: 'b', data: {}, ts: 2 }]),
    );
    const deps = baseDeps({ versionsBridge: undefined });
    deleteVersion(0, deps);
    const stored = JSON.parse(localStorage.getItem('csc-versions')!);
    expect(stored.length).toBe(1);
    expect(stored[0].label).toBe('b');
  });
});
