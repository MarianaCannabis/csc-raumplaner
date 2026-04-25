/**
 * P17.6 — Inline-Rename UI für Räume und Projekt-Titel.
 *
 * Zwei zusammenhängende Inline-Edit-Flows, semantisch ein Modul:
 * - startInlineRename(roomId): Doppelklick auf Raum → Input über
 *   Canvas-Position erscheinen lassen. Enter committed, Escape
 *   verwirft, Blur committed (= Enter-Verhalten).
 * - doRename / startInlineProjectRename / finishInlineProjectRename:
 *   Projekt-Titel-Edit über Modal (#m-rename) oder Inline (#proj-lbl).
 *
 * Beide Familien nutzen Closure-Wrapping in main.ts (mehrere Legacy-
 * Globals: rooms, wx2cx, wy2cy, draw2D, renderLeft, snapshot bzw.
 * projName, closeM).
 */

import type { CompletedRoom } from './types.js';

// ── Raum-Rename ─────────────────────────────────────────────────────

export interface StartInlineRoomRenameDeps {
  rooms: CompletedRoom[];
  wx2cx: (wx: number) => number;
  wy2cy: (wy: number) => number;
  draw2D: () => void;
  renderLeft: () => void;
  snapshot: () => void;
}

/**
 * Öffnet das Inline-Input für Raum-Rename.
 * canvasX/canvasY sind im Original-Code ungenutzt (Position kommt aus
 * room.x/y + wx2cx/wy2cy), aber Param-Namen bleiben für Caller-Kompat.
 */
export function startInlineRename(
  roomId: string,
  _canvasX: number,
  _canvasY: number,
  deps: StartInlineRoomRenameDeps,
): void {
  const r = deps.rooms.find((rm) => rm.id === roomId);
  if (!r) return;
  const wrap = document.getElementById('canvas-wrap');
  if (!wrap) return;
  const inp = document.createElement('input');
  inp.className = 'room-rename-input';
  inp.value = r.name ?? '';
  const cx = deps.wx2cx(r.x + r.w / 2);
  const cy = deps.wy2cy(r.y + r.d / 2);
  inp.style.cssText =
    'position:absolute;left:' + (cx - 60) + 'px;top:' + (cy - 12) + 'px;width:120px';
  // Legacy-1:1: blur + keydown teilen sich den Handler. Blur committed
  // (kein e.key), Enter committed, Escape verwirft. Andere Keys: no-op.
  const handler = (e: Event) => {
    const ke = e as KeyboardEvent;
    if (e.type === 'keydown' && ke.key !== 'Enter' && ke.key !== 'Escape') return;
    if (ke.key !== 'Escape') r.name = inp.value.trim() || r.name;
    inp.remove();
    deps.draw2D();
    deps.renderLeft();
    deps.snapshot();
  };
  inp.onblur = handler as (this: GlobalEventHandlers, ev: FocusEvent) => void;
  inp.onkeydown = handler as (this: GlobalEventHandlers, ev: KeyboardEvent) => void;
  wrap.appendChild(inp);
  inp.focus();
  inp.select();
}

// ── Projekt-Rename ──────────────────────────────────────────────────

export interface ProjectRenameDeps {
  /** Wird beim Beenden geschrieben. Caller muss diesen Wert dann ins
   *  legacy `projName` global zurückschreiben. */
  setProjName: (name: string) => void;
  /** Aktueller Wert für Init der Input-Field. */
  getCurrentProjName: () => string;
  closeM: (id: string) => void;
  /** Optional: snapshot aufrufen nach erfolgreichem Rename. */
  snapshot?: () => void;
  /** Optional: Toast-Notification. */
  toast?: (msg: string, type: string) => void;
}

/**
 * Modal-basiertes Rename: liest aus #rename-in, schreibt via
 * setProjName und schließt #m-rename.
 */
export function doRename(deps: ProjectRenameDeps): void {
  const inp = document.getElementById('rename-in') as HTMLInputElement | null;
  const lbl = document.getElementById('proj-lbl');
  const newName = (inp?.value || '').trim() || 'Projekt';
  deps.setProjName(newName);
  if (lbl) lbl.textContent = newName;
  deps.closeM('m-rename');
}

/**
 * Topbar-Inline-Edit start: blendet #proj-lbl aus, zeigt
 * #proj-lbl-edit + #proj-lbl-save, fokussiert das Input.
 */
export function startInlineProjectRename(deps: ProjectRenameDeps): void {
  const lbl = document.getElementById('proj-lbl');
  const inp = document.getElementById('proj-lbl-edit') as HTMLInputElement | null;
  const btn = document.getElementById('proj-lbl-save');
  if (!lbl || !inp || !btn) return;
  inp.value = deps.getCurrentProjName() || 'Projekt';
  lbl.style.display = 'none';
  inp.style.display = 'inline-block';
  btn.style.display = 'inline-block';
  inp.focus();
  inp.select();
}

/**
 * Topbar-Inline-Edit finish: liest #proj-lbl-edit, commit wenn
 * geändert (snapshot + toast), restored UI.
 */
export function finishInlineProjectRename(deps: ProjectRenameDeps): void {
  const lbl = document.getElementById('proj-lbl');
  const inp = document.getElementById('proj-lbl-edit') as HTMLInputElement | null;
  const btn = document.getElementById('proj-lbl-save');
  if (!lbl || !inp || !btn) return;
  const newName = (inp.value || '').trim() || 'Projekt';
  const current = deps.getCurrentProjName();
  if (newName !== current) {
    deps.setProjName(newName);
    lbl.textContent = newName;
    if (deps.snapshot) deps.snapshot();
    if (deps.toast) deps.toast('📝 Projekt umbenannt: ' + newName, 'g');
  }
  lbl.style.display = '';
  inp.style.display = 'none';
  btn.style.display = 'none';
}
