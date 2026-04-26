import { describe, it, expect, beforeEach, vi } from 'vitest';
import { attachTouchHandlers } from '../touchSupport.js';

// Sitzung G Schritt 4 — Wire-Up-Pattern-Tests. Wir testen direkt die
// erwartete Math-Logik aus main.ts (kein Test gegen den globalen
// queueMicrotask in main.ts — das wäre Integration-Test).

function mkCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.id = 'fp-canvas';
  c.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0 }) as DOMRect;
  document.body.appendChild(c);
  return c;
}

function fireTouch(
  el: HTMLElement,
  type: 'touchstart' | 'touchmove' | 'touchend',
  touches: Array<{ x: number; y: number }>,
): void {
  const evt = new Event(type, { bubbles: true, cancelable: true });
  const tArr = touches.map((t) => ({
    identifier: 0,
    clientX: t.x,
    clientY: t.y,
    pageX: t.x,
    pageY: t.y,
    target: el,
  }));
  Object.defineProperty(evt, 'touches', { value: tArr });
  Object.defineProperty(evt, 'targetTouches', { value: tArr });
  Object.defineProperty(evt, 'changedTouches', { value: tArr });
  el.dispatchEvent(evt);
}

describe('Touch Wire-Up Math (Sitzung G #4)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('Pan-Math: vpX/vpY werden um dx/dy erhöht', () => {
    const canvas = mkCanvas();
    const state = { vpX: 100, vpY: 80 };
    attachTouchHandlers({
      canvas,
      onPan: (dx, dy) => { state.vpX += dx; state.vpY += dy; },
      onZoom: () => {},
      onTap: () => {},
    });
    fireTouch(canvas, 'touchstart', [{ x: 0, y: 0 }]);
    fireTouch(canvas, 'touchmove', [{ x: 50, y: 30 }]); // delta 50, 30 (>8px)
    expect(state.vpX).toBe(150);
    expect(state.vpY).toBe(110);
  });

  it('Zoom-Math: Pinch-Center-Anker hält world-coord stabil', () => {
    const canvas = mkCanvas();
    let vpX = 0, vpY = 0, vpZoom = 40;
    const onZoom = (scale: number, cx: number, cy: number): void => {
      const wxBefore = (cx - vpX) / vpZoom;
      const wyBefore = (cy - vpY) / vpZoom;
      const newZoom = Math.max(5, Math.min(200, vpZoom * scale));
      vpZoom = newZoom;
      vpX = cx - wxBefore * newZoom;
      vpY = cy - wyBefore * newZoom;
    };
    attachTouchHandlers({
      canvas,
      onPan: () => {},
      onZoom,
      onTap: () => {},
    });
    // Pinch von 100→150 px (1.5×), Center bei (200, 100)
    fireTouch(canvas, 'touchstart', [{ x: 150, y: 100 }, { x: 250, y: 100 }]);
    fireTouch(canvas, 'touchmove', [{ x: 125, y: 100 }, { x: 275, y: 100 }]);
    // World-coord am Center vor zoom: ((200-0)/40, (100-0)/40) = (5, 2.5)
    // Nach zoom 1.5×: vpZoom=60. Center muss bei world (5, 2.5) bleiben:
    //   200 = 0 + 5*60 → vpX=200-5*60=-100. Aber vpX ist Pan-Offset; berechnet:
    //   vpX_new = 200 - 5 * 60 = -100
    //   vpY_new = 100 - 2.5 * 60 = -50
    expect(vpZoom).toBeCloseTo(60, 1);
    expect(vpX).toBeCloseTo(-100, 0);
    expect(vpY).toBeCloseTo(-50, 0);
    // World-coord am Center nach zoom: ((200-(-100))/60, (100-(-50))/60) = (5, 2.5) ✓
  });

  it('Zoom-Clamp: vpZoom bleibt in [5, 200]', () => {
    const canvas = mkCanvas();
    let vpZoom = 40;
    const onZoom = (scale: number): void => {
      vpZoom = Math.max(5, Math.min(200, vpZoom * scale));
    };
    attachTouchHandlers({ canvas, onPan: () => {}, onZoom, onTap: () => {} });
    // Übermäßiger Zoom-In
    fireTouch(canvas, 'touchstart', [{ x: 100, y: 100 }, { x: 200, y: 100 }]);
    fireTouch(canvas, 'touchmove', [{ x: 0, y: 100 }, { x: 1000, y: 100 }]);
    expect(vpZoom).toBeLessThanOrEqual(200);
    expect(vpZoom).toBeGreaterThanOrEqual(5);
  });

  it('Tap → simulierter Mouse-Click', () => {
    const canvas = mkCanvas();
    const tapHandler = vi.fn();
    let mouseDownFired = false;
    canvas.addEventListener('mousedown', () => { mouseDownFired = true; });
    attachTouchHandlers({
      canvas,
      onPan: () => {},
      onZoom: () => {},
      onTap: (x, y) => {
        tapHandler(x, y);
        // Wire-Up dispatcht mousedown+mouseup auf canvas
        const rect = canvas.getBoundingClientRect();
        canvas.dispatchEvent(new MouseEvent('mousedown', {
          clientX: x + rect.left,
          clientY: y + rect.top,
          bubbles: true,
        }));
      },
    });
    fireTouch(canvas, 'touchstart', [{ x: 50, y: 50 }]);
    fireTouch(canvas, 'touchend', []);
    expect(tapHandler).toHaveBeenCalledWith(50, 50);
    expect(mouseDownFired).toBe(true);
  });
});
