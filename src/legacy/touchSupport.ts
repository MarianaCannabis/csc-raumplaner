/**
 * Touch-Support für 2D/3D-Canvas (Mega-Sammel Schritt 4 / Bedienkonzept Mobile).
 *
 * Pattern:
 *   - Single-Touch + Move → onPan(dx, dy)
 *   - Two-Finger touchmove → onZoom(scaleDelta, centerX, centerY)
 *   - Tap (touchstart+touchend < 200ms, no significant move) → onTap(x, y)
 *   - Long-Press (touchstart > 300ms, no significant move) → onLongPress(x, y)
 *
 * Returns Cleanup-Function — bei Tear-Down (z.B. View-Wechsel oder Test)
 * aufrufen damit Listener entfernt werden.
 *
 * Design-Notes:
 *   - touchstart preventDefault — verhindert Browser-Pinch-Zoom auf Canvas
 *     (User-Wunsch: Pinch zoomt vpZoom, nicht Browser).
 *   - Move-Threshold 8 Pixel: kleine Wackler beim Tap werden NICHT als
 *     Pan interpretiert.
 *   - Tap-Window 200ms: typisch für Touch-UX (Material 175ms, iOS 200ms).
 *   - Long-Press 300ms: kompromiss zwischen "schnell genug" und "klar
 *     intentional" (Drag-and-Drop-Standard).
 */

export interface TouchSupportDeps {
  /** Canvas-Element auf das die Touch-Listener gebunden werden. */
  canvas: HTMLCanvasElement;
  /** Single-Touch-Pan: dx/dy in Pixel relativ zum letzten Move. */
  onPan: (dx: number, dy: number) => void;
  /** Two-Finger-Pinch: scale-delta (>1 zoom-in, <1 zoom-out), Center in
   *  Canvas-Koordinaten (Pixel). */
  onZoom: (scale: number, cx: number, cy: number) => void;
  /** Single-Tap (kurz, kein Move): Canvas-Koordinaten (Pixel). */
  onTap: (x: number, y: number) => void;
  /** Long-Press (>=300ms ohne signifikanten Move): Canvas-Koordinaten. */
  onLongPress?: (x: number, y: number) => void;
  /** Threshold in Pixel für „kein Move". Default 8. */
  moveThresholdPx?: number;
  /** Long-Press-Dauer in ms. Default 300. */
  longPressMs?: number;
  /** Tap-Maxdauer in ms. Default 200. */
  tapMaxMs?: number;
}

interface ActiveTouch {
  startX: number;
  startY: number;
  startTime: number;
  lastX: number;
  lastY: number;
  movedBeyondThreshold: boolean;
  longPressTimer: ReturnType<typeof setTimeout> | null;
}

function distance(t1: Touch, t2: Touch): number {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.hypot(dx, dy);
}

function midpoint(t1: Touch, t2: Touch): { x: number; y: number } {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  };
}

export function attachTouchHandlers(deps: TouchSupportDeps): () => void {
  const canvas = deps.canvas;
  const moveThreshold = deps.moveThresholdPx ?? 8;
  const longPressMs = deps.longPressMs ?? 300;
  const tapMaxMs = deps.tapMaxMs ?? 200;

  let active: ActiveTouch | null = null;
  let pinchStartDistance: number | null = null;

  const cancelLongPress = (): void => {
    if (active?.longPressTimer) {
      clearTimeout(active.longPressTimer);
      active.longPressTimer = null;
    }
  };

  const toCanvasCoords = (
    clientX: number,
    clientY: number,
  ): { x: number; y: number } => {
    const r = canvas.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0]!;
      active = {
        startX: t.clientX,
        startY: t.clientY,
        startTime: Date.now(),
        lastX: t.clientX,
        lastY: t.clientY,
        movedBeyondThreshold: false,
        longPressTimer: null,
      };
      if (deps.onLongPress) {
        active.longPressTimer = setTimeout(() => {
          // Long-Press fires nur wenn nicht moved + Touch noch aktiv
          if (active && !active.movedBeyondThreshold) {
            const c = toCanvasCoords(active.lastX, active.lastY);
            deps.onLongPress?.(c.x, c.y);
            // Markieren, sodass nachfolgendes touchend KEIN Tap auslöst
            active.startTime = -1; // Sentinel: long-press already fired
          }
        }, longPressMs);
      }
    } else if (e.touches.length === 2) {
      cancelLongPress();
      pinchStartDistance = distance(e.touches[0]!, e.touches[1]!);
    }
  };

  const handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length === 1 && active) {
      const t = e.touches[0]!;
      const dx = t.clientX - active.lastX;
      const dy = t.clientY - active.lastY;
      const totalDx = t.clientX - active.startX;
      const totalDy = t.clientY - active.startY;
      if (Math.abs(totalDx) > moveThreshold || Math.abs(totalDy) > moveThreshold) {
        if (!active.movedBeyondThreshold) {
          active.movedBeyondThreshold = true;
          cancelLongPress();
        }
      }
      if (active.movedBeyondThreshold) {
        deps.onPan(dx, dy);
      }
      active.lastX = t.clientX;
      active.lastY = t.clientY;
    } else if (e.touches.length === 2 && pinchStartDistance !== null) {
      const t1 = e.touches[0]!;
      const t2 = e.touches[1]!;
      const newDist = distance(t1, t2);
      const scale = newDist / pinchStartDistance;
      const mid = midpoint(t1, t2);
      const c = toCanvasCoords(mid.x, mid.y);
      deps.onZoom(scale, c.x, c.y);
      pinchStartDistance = newDist;
    }
  };

  const handleTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length === 0) {
      cancelLongPress();
      if (active) {
        const elapsed = Date.now() - active.startTime;
        // Tap: kein move, schnell, keine Long-Press-Trigger
        if (
          active.startTime !== -1 &&
          !active.movedBeyondThreshold &&
          elapsed <= tapMaxMs
        ) {
          const c = toCanvasCoords(active.lastX, active.lastY);
          deps.onTap(c.x, c.y);
        }
        active = null;
      }
      pinchStartDistance = null;
    } else if (e.touches.length === 1) {
      // 2→1 Finger: Pinch beendet, weiter mit Single-Touch
      pinchStartDistance = null;
      const t = e.touches[0]!;
      active = {
        startX: t.clientX,
        startY: t.clientY,
        startTime: Date.now(),
        lastX: t.clientX,
        lastY: t.clientY,
        movedBeyondThreshold: true, // Direkt als moved markieren — kein Tap nach Pinch
        longPressTimer: null,
      };
    }
  };

  const handleTouchCancel = (): void => {
    cancelLongPress();
    active = null;
    pinchStartDistance = null;
  };

  // passive:false damit preventDefault wirkt
  const opts: AddEventListenerOptions = { passive: false };
  canvas.addEventListener('touchstart', handleTouchStart, opts);
  canvas.addEventListener('touchmove', handleTouchMove, opts);
  canvas.addEventListener('touchend', handleTouchEnd, opts);
  canvas.addEventListener('touchcancel', handleTouchCancel, opts);

  return () => {
    canvas.removeEventListener('touchstart', handleTouchStart, opts);
    canvas.removeEventListener('touchmove', handleTouchMove, opts);
    canvas.removeEventListener('touchend', handleTouchEnd, opts);
    canvas.removeEventListener('touchcancel', handleTouchCancel, opts);
    cancelLongPress();
    active = null;
    pinchStartDistance = null;
  };
}

/**
 * Touch-Device-Detection. Verwendet beim Boot um body.is-touch zu setzen,
 * was Mobile-CSS-Klassen aktiviert.
 */
export function isTouchDevice(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0)
  );
}
