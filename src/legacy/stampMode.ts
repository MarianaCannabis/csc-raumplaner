/**
 * Stempel-Funktion (Sitzung G Schritt 3 / Zusatzfunktion).
 *
 * User wählt Raum aus → klickt „🔁 Stempeln" → Cursor wird crosshair →
 * Click auf 2D-Canvas platziert eine Kopie an Click-Position. Mehrere
 * Klicks = mehrere Stempel. Esc oder Toggle-Button beendet.
 *
 * Beschleunigt Layouts mit vielen identischen Räumen (z.B. Lager-Reihen
 * in CSC-Vereinen oder identische Stand-Bauten auf Messen).
 */

export interface StampRoomTemplate {
  id: string;
  name: string;
  w: number;
  d: number;
  h?: number;
  floorId?: string;
  floorColor?: string;
  wallColor?: string;
  ceilColor?: string;
}

export interface StampDeps {
  /** Liefert den aktuell selektierten Raum oder null. */
  getSelectedRoom: () => StampRoomTemplate | null;
  /** Erzeugt einen neuen Raum (delegiert an Inline-`addRoom()`). */
  addRoom: (cfg: {
    x: number;
    y: number;
    w: number;
    d: number;
    h?: number;
    name?: string;
    floorId?: string;
    floorColor?: string;
    wallColor?: string;
    ceilColor?: string;
  }) => void;
  /** Konvertiert Canvas-Pixel-Koordinaten zu Welt-Koordinaten (Meter). */
  canvasToWorld: (cx: number, cy: number) => { wx: number; wy: number };
  /** Triggert undo-Snapshot nach jedem Stempel-Click. */
  snapshot: () => void;
  /** Toast-Feedback. */
  toast: (msg: string, type?: string) => void;
}

let _stampActive = false;
let _stampClickHandler: ((e: MouseEvent) => void) | null = null;
let _stampEscHandler: ((e: KeyboardEvent) => void) | null = null;
let _depsRef: StampDeps | null = null;

export function isStampActive(): boolean {
  return _stampActive;
}

/**
 * Aktiviert den Stempel-Modus. Returnt true bei Erfolg, false wenn keine
 * Selection (User-Hint via toast).
 */
export function activateStampMode(deps: StampDeps): boolean {
  if (_stampActive) return true; // Idempotent
  const template = deps.getSelectedRoom();
  if (!template) {
    deps.toast('Wähle zuerst einen Raum aus zum Stempeln', 'r');
    return false;
  }

  _stampActive = true;
  _depsRef = deps;
  document.body.style.cursor = 'crosshair';
  deps.toast('🔁 Stempel-Modus aktiv — klick auf Canvas, Esc zum Beenden.', 'b');

  _stampClickHandler = (e: MouseEvent): void => {
    const canvas = document.getElementById('fp-canvas') as HTMLCanvasElement | null;
    if (!canvas || e.target !== canvas) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const { wx, wy } = deps.canvasToWorld(cx, cy);
    // Aktuell selektierten Raum zur Stempel-Zeit nochmal lesen — falls User
    // zwischendurch einen anderen Raum selektiert hat, übernimmt das.
    const liveTemplate = deps.getSelectedRoom() || template;
    deps.addRoom({
      x: wx,
      y: wy,
      w: liveTemplate.w,
      d: liveTemplate.d,
      h: liveTemplate.h,
      name: liveTemplate.name + ' (Kopie)',
      floorId: liveTemplate.floorId,
      floorColor: liveTemplate.floorColor,
      wallColor: liveTemplate.wallColor,
      ceilColor: liveTemplate.ceilColor,
    });
    deps.snapshot();
    deps.toast('🔁 Raum gestempelt', 'g');
  };
  // Capture-Phase — wir wollen vor anderen click-Handlern (Object-Select etc.) feuern.
  document.addEventListener('click', _stampClickHandler, true);

  _stampEscHandler = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && _depsRef) deactivateStampMode(_depsRef);
  };
  document.addEventListener('keydown', _stampEscHandler);

  return true;
}

export function deactivateStampMode(deps: StampDeps): void {
  if (!_stampActive) return;
  _stampActive = false;
  document.body.style.cursor = '';
  if (_stampClickHandler) {
    document.removeEventListener('click', _stampClickHandler, true);
    _stampClickHandler = null;
  }
  if (_stampEscHandler) {
    document.removeEventListener('keydown', _stampEscHandler);
    _stampEscHandler = null;
  }
  _depsRef = null;
  deps.toast('Stempel-Modus beendet', 'b');
}

export function toggleStampMode(deps: StampDeps): boolean {
  if (_stampActive) {
    deactivateStampMode(deps);
    return false;
  }
  return activateStampMode(deps);
}

/** Test-Helper. */
export function _resetForTests(): void {
  if (_stampClickHandler) {
    document.removeEventListener('click', _stampClickHandler, true);
    _stampClickHandler = null;
  }
  if (_stampEscHandler) {
    document.removeEventListener('keydown', _stampEscHandler);
    _stampEscHandler = null;
  }
  _stampActive = false;
  _depsRef = null;
  document.body.style.cursor = '';
}
