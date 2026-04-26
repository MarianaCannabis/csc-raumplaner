import { describe, it, expect, beforeEach, vi } from 'vitest';
import { attachTouchHandlers, isTouchDevice, type TouchSupportDeps } from '../touchSupport.js';

// jsdom liefert kein TouchEvent — wir konstruieren Plain-Object-Events,
// die vom dispatchEvent angenommen werden (cast über unknown).
function mkTouch(x: number, y: number): Touch {
  return {
    identifier: 1,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    screenX: x,
    screenY: y,
    radiusX: 0,
    radiusX_unused: undefined,
    radiusY: 0,
    rotationAngle: 0,
    force: 1,
    target: document.body,
  } as unknown as Touch;
}

function fireTouchEvent(
  el: HTMLElement,
  type: 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel',
  touches: Touch[],
): void {
  const evt = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(evt, 'touches', { value: touches });
  Object.defineProperty(evt, 'targetTouches', { value: touches });
  Object.defineProperty(evt, 'changedTouches', { value: touches });
  el.dispatchEvent(evt);
}

const mkCanvas = (): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  // jsdom liefert für getBoundingClientRect ein DOMRect — wir override-en
  // damit Coords vorhersagbar sind (left=0, top=0).
  c.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0 }) as DOMRect;
  document.body.appendChild(c);
  return c;
};

const mkDeps = (
  canvas: HTMLCanvasElement,
  overrides: Partial<TouchSupportDeps> = {},
): TouchSupportDeps => ({
  canvas,
  onPan: vi.fn(),
  onZoom: vi.fn(),
  onTap: vi.fn(),
  onLongPress: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('attachTouchHandlers', () => {
  it('returnt eine Cleanup-Funktion', () => {
    const c = mkCanvas();
    const cleanup = attachTouchHandlers(mkDeps(c));
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('Single-Touch-Drag → onPan called mit korrekten dx/dy', () => {
    const c = mkCanvas();
    const deps = mkDeps(c);
    attachTouchHandlers(deps);
    fireTouchEvent(c, 'touchstart', [mkTouch(100, 100)]);
    // Move muss > moveThreshold (8 px) sein damit als Pan erkannt
    fireTouchEvent(c, 'touchmove', [mkTouch(120, 130)]); // dx=20, dy=30
    expect(deps.onPan).toHaveBeenCalled();
    const [dx, dy] = (deps.onPan as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(dx).toBe(20);
    expect(dy).toBe(30);
  });

  it('Tap (touchstart + touchend ohne Move) → onTap called', () => {
    const c = mkCanvas();
    const deps = mkDeps(c);
    attachTouchHandlers(deps);
    fireTouchEvent(c, 'touchstart', [mkTouch(50, 50)]);
    fireTouchEvent(c, 'touchend', []);
    expect(deps.onTap).toHaveBeenCalledOnce();
    const [x, y] = (deps.onTap as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(x).toBe(50);
    expect(y).toBe(50);
  });

  it('Tap NACH Move-beyond-Threshold → KEIN onTap', () => {
    const c = mkCanvas();
    const deps = mkDeps(c);
    attachTouchHandlers(deps);
    fireTouchEvent(c, 'touchstart', [mkTouch(0, 0)]);
    fireTouchEvent(c, 'touchmove', [mkTouch(20, 20)]);
    fireTouchEvent(c, 'touchend', []);
    expect(deps.onTap).not.toHaveBeenCalled();
  });

  it('Long-Press (>=300ms ohne Move) → onLongPress called', async () => {
    vi.useFakeTimers();
    const c = mkCanvas();
    const deps = mkDeps(c);
    attachTouchHandlers(deps);
    fireTouchEvent(c, 'touchstart', [mkTouch(150, 200)]);
    vi.advanceTimersByTime(310);
    expect(deps.onLongPress).toHaveBeenCalledOnce();
    const [x, y] = (deps.onLongPress as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(x).toBe(150);
    expect(y).toBe(200);
    vi.useRealTimers();
  });

  it('Two-Finger-Pinch → onZoom called mit scale', () => {
    const c = mkCanvas();
    const deps = mkDeps(c);
    attachTouchHandlers(deps);
    // Initial-Pinch: 100 px Abstand
    fireTouchEvent(c, 'touchstart', [mkTouch(100, 100), mkTouch(200, 100)]);
    // Auf 150 px erweitert (zoom-in 1.5x)
    fireTouchEvent(c, 'touchmove', [mkTouch(75, 100), mkTouch(225, 100)]);
    expect(deps.onZoom).toHaveBeenCalled();
    const [scale, cx, cy] = (deps.onZoom as ReturnType<typeof vi.fn>).mock.calls[0]!;
    expect(scale).toBeCloseTo(1.5, 1);
    // Center bleibt bei 150 (Mittelpunkt 75 ↔ 225)
    expect(cx).toBe(150);
    expect(cy).toBe(100);
  });

  it('Cleanup-Function entfernt alle Listener', () => {
    const c = mkCanvas();
    const deps = mkDeps(c);
    const cleanup = attachTouchHandlers(deps);
    cleanup();
    fireTouchEvent(c, 'touchstart', [mkTouch(50, 50)]);
    fireTouchEvent(c, 'touchend', []);
    expect(deps.onTap).not.toHaveBeenCalled();
  });
});

describe('isTouchDevice', () => {
  it('jsdom-Default: returnt false oder true je nach navigator.maxTouchPoints', () => {
    // Wir asserten nur dass kein crash + ein boolean returnt wird.
    expect(typeof isTouchDevice()).toBe('boolean');
  });
});
