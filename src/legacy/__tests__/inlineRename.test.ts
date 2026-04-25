import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  startInlineRename,
  doRename,
  startInlineProjectRename,
  finishInlineProjectRename,
  type StartInlineRoomRenameDeps,
  type ProjectRenameDeps,
} from '../inlineRename.js';
import type { CompletedRoom } from '../types.js';

const roomFixture = (): CompletedRoom => ({
  id: 'r1',
  name: 'Empfang',
  x: 0,
  y: 0,
  w: 4,
  d: 3,
  floorId: 'eg',
});

const roomDeps = (rooms: CompletedRoom[]): StartInlineRoomRenameDeps => ({
  rooms,
  wx2cx: (x) => x * 50,
  wy2cy: (y) => y * 50,
  draw2D: vi.fn(),
  renderLeft: vi.fn(),
  snapshot: vi.fn(),
});

describe('startInlineRename (Raum)', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="canvas-wrap"></div>';
  });

  it('input-element wird in canvas-wrap injected', () => {
    const room = roomFixture();
    startInlineRename('r1', 0, 0, roomDeps([room]));
    const inp = document.querySelector('#canvas-wrap input.room-rename-input') as HTMLInputElement;
    expect(inp).not.toBeNull();
    expect(inp.value).toBe('Empfang');
  });

  it('Enter committed: room.name update + draw2D/renderLeft/snapshot', () => {
    const room = roomFixture();
    const deps = roomDeps([room]);
    startInlineRename('r1', 0, 0, deps);
    const inp = document.querySelector('input.room-rename-input') as HTMLInputElement;
    inp.value = 'Lounge';
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(room.name).toBe('Lounge');
    expect(document.querySelector('input.room-rename-input')).toBeNull();
    expect(deps.draw2D).toHaveBeenCalledOnce();
    expect(deps.renderLeft).toHaveBeenCalledOnce();
    expect(deps.snapshot).toHaveBeenCalledOnce();
  });

  it('Escape verwirft: room.name unverändert, input entfernt', () => {
    const room = roomFixture();
    const deps = roomDeps([room]);
    startInlineRename('r1', 0, 0, deps);
    const inp = document.querySelector('input.room-rename-input') as HTMLInputElement;
    inp.value = 'NICHT_COMMITTEN';
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(room.name).toBe('Empfang');
    expect(document.querySelector('input.room-rename-input')).toBeNull();
  });

  it('Blur committed (= Enter-Verhalten)', () => {
    const room = roomFixture();
    const deps = roomDeps([room]);
    startInlineRename('r1', 0, 0, deps);
    const inp = document.querySelector('input.room-rename-input') as HTMLInputElement;
    inp.value = 'NeuerName';
    inp.dispatchEvent(new FocusEvent('blur'));
    expect(room.name).toBe('NeuerName');
  });

  it('Andere Keys: keine Aktion', () => {
    const room = roomFixture();
    const deps = roomDeps([room]);
    startInlineRename('r1', 0, 0, deps);
    const inp = document.querySelector('input.room-rename-input') as HTMLInputElement;
    inp.value = 'A';
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    // input bleibt, name unverändert
    expect(document.querySelector('input.room-rename-input')).not.toBeNull();
    expect(room.name).toBe('Empfang');
  });

  it('roomId nicht gefunden: no-op', () => {
    expect(() => startInlineRename('missing', 0, 0, roomDeps([]))).not.toThrow();
    expect(document.querySelector('input.room-rename-input')).toBeNull();
  });

  it('leerer Input: room.name bleibt (fallback auf alten Namen)', () => {
    const room = roomFixture();
    startInlineRename('r1', 0, 0, roomDeps([room]));
    const inp = document.querySelector('input.room-rename-input') as HTMLInputElement;
    inp.value = '   '; // nur whitespace
    inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(room.name).toBe('Empfang');
  });
});

const projectDeps = (initial = 'Projekt'): { deps: ProjectRenameDeps; getStored: () => string } => {
  let stored = initial;
  return {
    getStored: () => stored,
    deps: {
      setProjName: (n) => {
        stored = n;
      },
      getCurrentProjName: () => stored,
      closeM: vi.fn(),
      snapshot: vi.fn(),
      toast: vi.fn(),
    },
  };
};

describe('doRename (Modal)', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<input id="rename-in" /><span id="proj-lbl"></span>';
  });

  it('liest #rename-in, schreibt via setProjName, callt closeM', () => {
    const { deps, getStored } = projectDeps('Old');
    (document.getElementById('rename-in') as HTMLInputElement).value = 'New';
    doRename(deps);
    expect(getStored()).toBe('New');
    expect(document.getElementById('proj-lbl')!.textContent).toBe('New');
    expect(deps.closeM).toHaveBeenCalledExactlyOnceWith('m-rename');
  });

  it('leerer Input: fallback "Projekt"', () => {
    const { deps, getStored } = projectDeps('Whatever');
    (document.getElementById('rename-in') as HTMLInputElement).value = '';
    doRename(deps);
    expect(getStored()).toBe('Projekt');
  });
});

describe('startInlineProjectRename + finishInlineProjectRename', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<span id="proj-lbl">Old</span>' +
      '<input id="proj-lbl-edit" style="display:none" />' +
      '<button id="proj-lbl-save" style="display:none"></button>';
  });

  it('start: blendet lbl aus, zeigt input + save', () => {
    const { deps } = projectDeps('Old');
    startInlineProjectRename(deps);
    expect((document.getElementById('proj-lbl') as HTMLElement).style.display).toBe('none');
    expect((document.getElementById('proj-lbl-edit') as HTMLElement).style.display).toBe('inline-block');
    expect((document.getElementById('proj-lbl-save') as HTMLElement).style.display).toBe('inline-block');
    expect((document.getElementById('proj-lbl-edit') as HTMLInputElement).value).toBe('Old');
  });

  it('finish: commit changed name → setProjName + snapshot + toast', () => {
    const { deps, getStored } = projectDeps('Old');
    (document.getElementById('proj-lbl-edit') as HTMLInputElement).value = 'Brand New';
    finishInlineProjectRename(deps);
    expect(getStored()).toBe('Brand New');
    expect(document.getElementById('proj-lbl')!.textContent).toBe('Brand New');
    expect(deps.snapshot).toHaveBeenCalledOnce();
    expect(deps.toast).toHaveBeenCalledOnce();
  });

  it('finish: unchanged name → kein snapshot/toast', () => {
    const { deps } = projectDeps('Same');
    (document.getElementById('proj-lbl-edit') as HTMLInputElement).value = 'Same';
    finishInlineProjectRename(deps);
    expect(deps.snapshot).not.toHaveBeenCalled();
    expect(deps.toast).not.toHaveBeenCalled();
  });

  it('finish: restored UI (lbl visible, input/btn hidden)', () => {
    const { deps } = projectDeps('X');
    (document.getElementById('proj-lbl-edit') as HTMLInputElement).value = 'Y';
    finishInlineProjectRename(deps);
    expect((document.getElementById('proj-lbl') as HTMLElement).style.display).toBe('');
    expect((document.getElementById('proj-lbl-edit') as HTMLElement).style.display).toBe('none');
    expect((document.getElementById('proj-lbl-save') as HTMLElement).style.display).toBe('none');
  });
});
