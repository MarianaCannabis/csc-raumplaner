import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setView,
  fitViewToRooms,
  switchFloor,
  type SetViewDeps,
  type FitViewDeps,
  type SwitchFloorDeps,
  type ViewMode,
} from '../viewControls.js';
import type { CompletedRoom } from '../types.js';

const setViewDeps = (overrides: Partial<SetViewDeps> = {}): SetViewDeps => ({
  setCurrentView: vi.fn(),
  fpCv: document.createElement('canvas'),
  tCv: document.createElement('canvas'),
  exitPointerLock: vi.fn(),
  draw2D: vi.fn(),
  setCam3: vi.fn(),
  fpCam3: { type: 'fp' },
  oCam: { type: 'o' },
  setGrid3Visible: vi.fn(),
  ...overrides,
});

const fitDeps = (rooms: CompletedRoom[], overrides: Partial<FitViewDeps> = {}): FitViewDeps => {
  const cv = document.createElement('canvas');
  cv.width = 800;
  cv.height = 600;
  return {
    rooms,
    fpCv: cv,
    setVpZoom: vi.fn(),
    setVpX: vi.fn(),
    setVpY: vi.fn(),
    draw2D: vi.fn(),
    toast: vi.fn(),
    ...overrides,
  };
};

const switchDeps = (overrides: Partial<SwitchFloorDeps> = {}): SwitchFloorDeps => ({
  setCurFloor: vi.fn(),
  setSel: vi.fn(),
  floors: [{ id: 'eg', name: 'EG' }, { id: 'og', name: 'OG' }],
  renderFloorTabs: vi.fn(),
  renderLeft: vi.fn(),
  draw2D: vi.fn(),
  rebuild3D: vi.fn(),
  updateSelBotBar: vi.fn(),
  toast: vi.fn(),
  ...overrides,
});

const FIXTURE = `
  <div id="view-hint-3d" style="display:none"></div>
  <button id="vt-2d"></button>
  <button id="vt-3d"></button>
  <button id="vt-walk"></button>
  <div id="mode-pills"></div>
  <div id="fp-walk"></div>
`;

describe('setView', () => {
  beforeEach(() => {
    document.body.innerHTML = FIXTURE;
  });

  it("setView('2d'): fpCv visible, tCv hidden, mode-pills visible, draw2D called", () => {
    const deps = setViewDeps();
    setView('2d', deps);
    expect(deps.setCurrentView).toHaveBeenCalledWith('2d');
    expect(deps.fpCv?.style.display).toBe('block');
    expect(deps.tCv?.style.display).toBe('none');
    expect(document.getElementById('mode-pills')!.style.display).toBe('flex');
    expect(deps.draw2D).toHaveBeenCalledOnce();
    expect(document.getElementById('vt-2d')?.classList.contains('active')).toBe(true);
    expect(document.getElementById('vt-2d')?.classList.contains('is-active')).toBe(true);
  });

  it("setView('3d'): tCv visible, mode-pills hidden, oCam set, grid3 visible", () => {
    const deps = setViewDeps();
    setView('3d', deps);
    expect(deps.fpCv?.style.display).toBe('none');
    expect(deps.tCv?.style.display).toBe('block');
    expect(document.getElementById('mode-pills')!.style.display).toBe('none');
    expect(deps.setCam3).toHaveBeenCalledWith(deps.oCam);
    expect(deps.setGrid3Visible).toHaveBeenCalledWith(true);
    expect(deps.exitPointerLock).toHaveBeenCalledOnce();
    expect(document.getElementById('view-hint-3d')!.style.display).toBe('inline');
  });

  it("setView('walk'): fpCam3 set, fp-walk shows .vis, grid3 hidden", () => {
    const deps = setViewDeps();
    setView('walk', deps);
    expect(deps.setCam3).toHaveBeenCalledWith(deps.fpCam3);
    expect(document.getElementById('fp-walk')?.classList.contains('vis')).toBe(true);
    expect(deps.setGrid3Visible).toHaveBeenCalledWith(false);
  });

  it('Tab-Buttons toggle .active + .is-active konsistent', () => {
    const deps = setViewDeps();
    setView('3d', deps);
    expect(document.getElementById('vt-2d')?.classList.contains('active')).toBe(false);
    expect(document.getElementById('vt-3d')?.classList.contains('active')).toBe(true);
    expect(document.getElementById('vt-walk')?.classList.contains('active')).toBe(false);
  });
});

describe('fitViewToRooms', () => {
  it('rooms leer: no-op (kein draw2D, kein toast)', () => {
    const deps = fitDeps([]);
    fitViewToRooms(deps);
    expect(deps.draw2D).not.toHaveBeenCalled();
    expect(deps.toast).not.toHaveBeenCalled();
  });

  it('happy: vpZoom + vpX + vpY werden gesetzt + draw2D + toast', () => {
    const deps = fitDeps([
      { id: 'r1', name: 'A', x: 0, y: 0, w: 5, d: 4 },
      { id: 'r2', name: 'B', x: 5, y: 0, w: 4, d: 3 },
    ]);
    fitViewToRooms(deps);
    expect(deps.setVpZoom).toHaveBeenCalled();
    expect(deps.setVpX).toHaveBeenCalled();
    expect(deps.setVpY).toHaveBeenCalled();
    expect(deps.draw2D).toHaveBeenCalled();
    expect(deps.toast).toHaveBeenCalledWith('🎯 Ansicht angepasst', 'b');
  });

  it('fpCv null: no-op auch wenn rooms da', () => {
    const deps = fitDeps(
      [{ id: 'r1', name: 'A', x: 0, y: 0, w: 5, d: 4 }],
      { fpCv: null },
    );
    fitViewToRooms(deps);
    expect(deps.draw2D).not.toHaveBeenCalled();
  });
});

describe('switchFloor', () => {
  it('setzt curFloor + deselectiert + alle Render-Callbacks gerufen', () => {
    const deps = switchDeps();
    switchFloor('og', deps);
    expect(deps.setCurFloor).toHaveBeenCalledWith('og');
    expect(deps.setSel).toHaveBeenCalledWith(null, false, false);
    expect(deps.renderFloorTabs).toHaveBeenCalled();
    expect(deps.renderLeft).toHaveBeenCalled();
    expect(deps.draw2D).toHaveBeenCalled();
    expect(deps.rebuild3D).toHaveBeenCalled();
    expect(deps.updateSelBotBar).toHaveBeenCalled();
    expect(deps.toast).toHaveBeenCalledWith('🏢 Etage: OG', 'b');
  });

  it('id nicht in floors: toast mit id-Fallback statt name', () => {
    const deps = switchDeps();
    switchFloor('unknown', deps);
    expect(deps.toast).toHaveBeenCalledWith('🏢 Etage: unknown', 'b');
  });
});
