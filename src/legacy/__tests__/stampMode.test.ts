import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  activateStampMode,
  deactivateStampMode,
  toggleStampMode,
  isStampActive,
  _resetForTests,
  type StampDeps,
  type StampRoomTemplate,
} from '../stampMode.js';

const SAMPLE_TEMPLATE: StampRoomTemplate = {
  id: 'r1',
  name: 'Lager',
  w: 5,
  d: 4,
  h: 2.8,
  floorId: 'eg',
};

const mkDeps = (overrides: Partial<StampDeps> = {}): StampDeps => ({
  getSelectedRoom: vi.fn(() => SAMPLE_TEMPLATE),
  addRoom: vi.fn(),
  canvasToWorld: vi.fn((cx, cy) => ({ wx: cx / 40, wy: cy / 40 })),
  snapshot: vi.fn(),
  toast: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  _resetForTests();
  document.body.innerHTML = '<canvas id="fp-canvas" width="800" height="600"></canvas>';
  // Mock getBoundingClientRect für Canvas-Coords
  const canvas = document.getElementById('fp-canvas') as HTMLCanvasElement;
  canvas.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0 }) as DOMRect;
});

describe('activateStampMode', () => {
  it('ohne Selection: toast(r) + returnt false', () => {
    const deps = mkDeps({ getSelectedRoom: () => null });
    const result = activateStampMode(deps);
    expect(result).toBe(false);
    expect(deps.toast).toHaveBeenCalledWith('Wähle zuerst einen Raum aus zum Stempeln', 'r');
    expect(isStampActive()).toBe(false);
  });

  it('mit Selection: returnt true, _stampActive=true, cursor=crosshair', () => {
    const deps = mkDeps();
    const result = activateStampMode(deps);
    expect(result).toBe(true);
    expect(isStampActive()).toBe(true);
    expect(document.body.style.cursor).toBe('crosshair');
    expect(deps.toast).toHaveBeenCalledWith(expect.stringContaining('Stempel-Modus aktiv'), 'b');
  });

  it('idempotent: zweiter activate-Call returnt true ohne Re-Init', () => {
    const deps = mkDeps();
    activateStampMode(deps);
    const callsBefore = (deps.toast as ReturnType<typeof vi.fn>).mock.calls.length;
    const result = activateStampMode(deps);
    expect(result).toBe(true);
    // Kein zusätzlicher toast — idempotent
    expect((deps.toast as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsBefore);
  });
});

describe('Click auf Canvas im Stamp-Mode', () => {
  it('Click triggert addRoom mit Template-Werten + Click-Position', () => {
    const deps = mkDeps();
    activateStampMode(deps);
    const canvas = document.getElementById('fp-canvas') as HTMLCanvasElement;
    canvas.dispatchEvent(
      new MouseEvent('click', { clientX: 200, clientY: 80, bubbles: true }),
    );
    expect(deps.addRoom).toHaveBeenCalledOnce();
    const arg = (deps.addRoom as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(arg.w).toBe(5);
    expect(arg.d).toBe(4);
    expect(arg.h).toBe(2.8);
    expect(arg.floorId).toBe('eg');
    expect(arg.name).toBe('Lager (Kopie)');
    // canvasToWorld(200, 80) → 5, 2 (siehe mock)
    expect(arg.x).toBe(5);
    expect(arg.y).toBe(2);
    expect(deps.snapshot).toHaveBeenCalledOnce();
  });

  it('Click außerhalb Canvas: kein addRoom', () => {
    const deps = mkDeps();
    activateStampMode(deps);
    document.dispatchEvent(new MouseEvent('click', { clientX: 200, clientY: 80, bubbles: true }));
    expect(deps.addRoom).not.toHaveBeenCalled();
  });

  it('Mehrfach-Clicks: addRoom je Click', () => {
    const deps = mkDeps();
    activateStampMode(deps);
    const canvas = document.getElementById('fp-canvas') as HTMLCanvasElement;
    for (let i = 0; i < 3; i++) {
      canvas.dispatchEvent(
        new MouseEvent('click', { clientX: 100 + i * 50, clientY: 80, bubbles: true }),
      );
    }
    expect(deps.addRoom).toHaveBeenCalledTimes(3);
    expect(deps.snapshot).toHaveBeenCalledTimes(3);
  });
});

describe('Escape-Handling', () => {
  it('Escape-Key beendet Mode', () => {
    const deps = mkDeps();
    activateStampMode(deps);
    expect(isStampActive()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(isStampActive()).toBe(false);
    expect(document.body.style.cursor).toBe('');
  });

  it('Andere Keys: kein Effekt', () => {
    const deps = mkDeps();
    activateStampMode(deps);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(isStampActive()).toBe(true);
  });
});

describe('toggleStampMode', () => {
  it('1. Aufruf aktiviert (true), 2. deaktiviert (false)', () => {
    const deps = mkDeps();
    expect(toggleStampMode(deps)).toBe(true);
    expect(isStampActive()).toBe(true);
    expect(toggleStampMode(deps)).toBe(false);
    expect(isStampActive()).toBe(false);
  });
});

describe('deactivateStampMode', () => {
  it('Cursor reset + Listener entfernt', () => {
    const deps = mkDeps();
    activateStampMode(deps);
    deactivateStampMode(deps);
    expect(isStampActive()).toBe(false);
    expect(document.body.style.cursor).toBe('');
    // Click nach deactivate sollte nichts mehr machen
    const canvas = document.getElementById('fp-canvas') as HTMLCanvasElement;
    canvas.dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 100, bubbles: true }));
    expect(deps.addRoom).not.toHaveBeenCalled();
  });

  it('idempotent: zweiter deactivate-Call ist no-op', () => {
    const deps = mkDeps();
    activateStampMode(deps);
    deactivateStampMode(deps);
    expect(() => deactivateStampMode(deps)).not.toThrow();
  });
});

describe('Live-Selection', () => {
  it('User wechselt Selection während Stamp-Mode: addRoom nutzt aktuelle Selection', () => {
    let currentSel: StampRoomTemplate = SAMPLE_TEMPLATE;
    const deps = mkDeps({ getSelectedRoom: () => currentSel });
    activateStampMode(deps);
    // User wechselt Selection
    currentSel = { id: 'r2', name: 'Aufenthaltsraum', w: 8, d: 6 };
    const canvas = document.getElementById('fp-canvas') as HTMLCanvasElement;
    canvas.dispatchEvent(new MouseEvent('click', { clientX: 50, clientY: 50, bubbles: true }));
    const arg = (deps.addRoom as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(arg.w).toBe(8);
    expect(arg.d).toBe(6);
    expect(arg.name).toBe('Aufenthaltsraum (Kopie)');
  });
});
