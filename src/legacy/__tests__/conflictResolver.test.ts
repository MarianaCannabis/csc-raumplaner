import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  showConflictModal,
  closeConflictModal,
  computeDiff,
  type ConflictResolverDeps,
} from '../conflictResolver.js';
import type { ConflictDetected } from '../../persist/cloudProjects.js';

const mkConflict = (overrides: Partial<ConflictDetected> = {}): ConflictDetected => ({
  type: 'conflict',
  serverData: {
    rooms: [{ id: 'rs1' }, { id: 'rs2' }],
    objects: [],
    walls: [],
    measures: [],
  },
  serverThumbnail: 'data:image/jpeg;base64,SERVER_THUMB',
  serverVersion: 7,
  serverUpdatedAt: '2026-04-26T10:00:00Z',
  serverAuthor: 'kollege@example.com',
  localData: {
    rooms: [{ id: 'rl1' }, { id: 'rl2' }, { id: 'rl3' }],
    objects: [{ typeId: 'sofa' }],
    walls: [],
    measures: [],
    thumbnail: 'data:image/jpeg;base64,LOCAL_THUMB',
  },
  localVersion: 5,
  ...overrides,
});

const mkDeps = (overrides: Partial<ConflictResolverDeps> = {}): ConflictResolverDeps => ({
  onDiscardLocal: vi.fn(),
  onForceOverwrite: vi.fn(),
  onCancel: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('computeDiff', () => {
  it('positive Diffs (lokal hat mehr)', () => {
    const local = { rooms: [1, 2, 3], objects: [], walls: [1, 2], measures: [] };
    const server = { rooms: [1], objects: [], walls: [], measures: [] };
    expect(computeDiff(local, server)).toEqual({
      rooms: 2,
      objects: 0,
      walls: 2,
      measures: 0,
    });
  });

  it('negative Diffs (Server hat mehr)', () => {
    const local = { rooms: [], objects: [], walls: [], measures: [] };
    const server = { rooms: [1, 2], objects: [1], walls: [], measures: [] };
    expect(computeDiff(local, server)).toEqual({
      rooms: -2,
      objects: -1,
      walls: 0,
      measures: 0,
    });
  });

  it('null/undefined: alle 0', () => {
    expect(computeDiff(null, null)).toEqual({ rooms: 0, objects: 0, walls: 0, measures: 0 });
    expect(computeDiff(undefined, undefined)).toEqual({
      rooms: 0,
      objects: 0,
      walls: 0,
      measures: 0,
    });
  });

  it('non-array Felder werden als 0 gezählt', () => {
    expect(computeDiff({ rooms: 'not-array' }, { rooms: null })).toEqual({
      rooms: 0,
      objects: 0,
      walls: 0,
      measures: 0,
    });
  });
});

describe('showConflictModal', () => {
  it('rendert Modal mit korrekten Klassen + ID', () => {
    showConflictModal(mkConflict(), mkDeps());
    const overlay = document.getElementById('m-cloud-conflict');
    expect(overlay).not.toBeNull();
    expect(overlay!.classList.contains('mdl-overlay')).toBe(true);
    expect(overlay!.querySelector('.mdl-dialog')).not.toBeNull();
  });

  it('rendert beide Thumbnails sichtbar mit korrekten src-Attributen', () => {
    showConflictModal(mkConflict(), mkDeps());
    const serverImg = document.getElementById('otc-thumb-server') as HTMLImageElement | null;
    const localImg = document.getElementById('otc-thumb-local') as HTMLImageElement | null;
    expect(serverImg).not.toBeNull();
    expect(localImg).not.toBeNull();
    expect(serverImg!.src).toContain('SERVER_THUMB');
    expect(localImg!.src).toContain('LOCAL_THUMB');
  });

  it('zeigt Versions-Header (server v7, lokal v5)', () => {
    showConflictModal(mkConflict(), mkDeps());
    const html = document.getElementById('m-cloud-conflict')!.innerHTML;
    expect(html).toContain('v7');
    expect(html).toContain('v5');
  });

  it('zeigt Diff-Counter mit korrekten Zahlen', () => {
    showConflictModal(mkConflict(), mkDeps());
    const diffEl = document.getElementById('otc-diff');
    expect(diffEl).not.toBeNull();
    // local hat 3 rooms, server hat 2 → +1 Räume; local hat 1 object, server 0 → +1 Objekte
    expect(diffEl!.textContent).toContain('+1 Räume');
    expect(diffEl!.textContent).toContain('+1 Objekte');
  });

  it('Verwerfen-Button → onDiscardLocal mit serverData', () => {
    const deps = mkDeps();
    const conflict = mkConflict();
    showConflictModal(conflict, deps);
    const btn = document.getElementById('otc-discard') as HTMLButtonElement;
    btn.click();
    expect(deps.onDiscardLocal).toHaveBeenCalledOnce();
    expect(deps.onDiscardLocal).toHaveBeenCalledWith(conflict.serverData);
    // Modal schließt
    expect(document.getElementById('m-cloud-conflict')).toBeNull();
  });

  it('Erzwingen-Button → onForceOverwrite mit serverVersion', () => {
    const deps = mkDeps();
    showConflictModal(mkConflict({ serverVersion: 9 }), deps);
    const btn = document.getElementById('otc-force') as HTMLButtonElement;
    btn.click();
    expect(deps.onForceOverwrite).toHaveBeenCalledWith(9);
    expect(document.getElementById('m-cloud-conflict')).toBeNull();
  });

  it('Cancel-Button → onCancel', () => {
    const deps = mkDeps();
    showConflictModal(mkConflict(), deps);
    const btn = document.getElementById('otc-cancel') as HTMLButtonElement;
    btn.click();
    expect(deps.onCancel).toHaveBeenCalledOnce();
    expect(document.getElementById('m-cloud-conflict')).toBeNull();
  });

  it('ESC-Key → onCancel', () => {
    const deps = mkDeps();
    showConflictModal(mkConflict(), deps);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(deps.onCancel).toHaveBeenCalledOnce();
    expect(document.getElementById('m-cloud-conflict')).toBeNull();
  });

  it('doppelter Aufruf: ersetzt altes Modal (kein State-Leak)', () => {
    showConflictModal(mkConflict({ serverVersion: 1 }), mkDeps());
    showConflictModal(mkConflict({ serverVersion: 99 }), mkDeps());
    const overlays = document.querySelectorAll('#m-cloud-conflict');
    expect(overlays.length).toBe(1);
    expect(overlays[0]!.innerHTML).toContain('v99');
  });

  it('closeConflictModal: idempotent', () => {
    showConflictModal(mkConflict(), mkDeps());
    closeConflictModal();
    closeConflictModal(); // zweiter Aufruf darf nicht throwen
    expect(document.getElementById('m-cloud-conflict')).toBeNull();
  });
});
