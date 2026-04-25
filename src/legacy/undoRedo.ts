/**
 * P17.13 — Undo/Redo Stack-Management extrahiert aus index.html:5343-5414.
 *
 * Module-internal State (`_stack`, `_idx`). Inline-`snapshot()` serialisiert
 * weiter selbst (60+ Caller, plus Side-Effects wie autosave.write, logChange,
 * _pushVisualHistory, init-Cruft) — wir extrahieren NUR das Stack-Management.
 *
 * `pushSnapshot(state)` schiebt ein neues Snapshot-JSON aufs Stack, slice't
 * etwaige Redo-Future, enforced MAX_HISTORY=50, updated den Idx und feuert
 * den update-Buttons-Callback.
 *
 * `undo()`/`redo()` returnen den NEUEN current-state als JSON-String oder
 * null wenn nicht möglich. Inline-`_restoreSnapshot(json)` deserialisiert
 * dann + ruft scene.remove/rebuild3D/etc. — diese Side-Effects bleiben
 * Caller-side, weil sie auf scene/rooms/objects-Globals zugreifen.
 */

const MAX_HISTORY = 50;
let _stack: string[] = [];
let _idx = -1;
let _onUpdateButtons: () => void = () => {};

/** Setzt den Callback der nach jedem Stack-Wechsel feuert (für #undo-btn/#redo-btn disabled-Sync). */
export function setUpdateButtonsCallback(fn: () => void): void {
  _onUpdateButtons = fn;
}

/** Push einen neuen Snapshot. Discard'd Redo-Future, enforced MAX_HISTORY. */
export function pushSnapshot(state: string): void {
  _stack = _stack.slice(0, _idx + 1);
  _stack.push(state);
  if (_stack.length > MAX_HISTORY) _stack.shift();
  _idx = _stack.length - 1;
  _onUpdateButtons();
}

/** Undo: schiebt _idx eins zurück, returnt den state am neuen Idx (oder null). */
export function undo(): string | null {
  if (_idx <= 0) return null;
  _idx--;
  _onUpdateButtons();
  return _stack[_idx] ?? null;
}

/** Redo: schiebt _idx eins vor, returnt den state am neuen Idx (oder null). */
export function redo(): string | null {
  if (_idx >= _stack.length - 1) return null;
  _idx++;
  _onUpdateButtons();
  return _stack[_idx] ?? null;
}

export function canUndo(): boolean {
  return _idx > 0;
}

export function canRedo(): boolean {
  return _idx < _stack.length - 1;
}

export function getStackSize(): number {
  return _stack.length;
}

export function getCurrentIdx(): number {
  return _idx;
}

/** Test-Helper: kompletter Reset. */
export function _resetForTests(): void {
  _stack = [];
  _idx = -1;
  _onUpdateButtons = () => {};
}

export const MAX_HISTORY_LIMIT = MAX_HISTORY;
