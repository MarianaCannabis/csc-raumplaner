/**
 * P17.14 — View-Controls (setView/fitViewToRooms/switchFloor) extrahiert
 * aus index.html:4468 + 5473 + 13928.
 *
 * setView ist boot-relevant (initial-View bei App-Start). Alle 3 Funktionen
 * sind tightly-coupled mit Three.js camera/scene und 2D-Canvas — die
 * Render-Side-Effects laufen via Callback-Deps.
 */

import type { CompletedRoom } from './types.js';

export type ViewMode = '2d' | '3d' | 'walk';

export interface SetViewDeps {
  /** Setter für currentView (legacy global). */
  setCurrentView: (v: ViewMode) => void;
  fpCv: HTMLCanvasElement | null;
  tCv: HTMLCanvasElement | null;
  /** Pointer-Lock-Cleanup beim View-Wechsel (sofern aktiv). */
  exitPointerLock?: () => void;
  draw2D: () => void;
  /** 3D-Cam-Swap: walk = first-person, sonst orbit. */
  setCam3: (cam: unknown) => void;
  fpCam3: unknown;
  oCam: unknown;
  /** Grid-Helper-Mesh.visible toggle. */
  setGrid3Visible: (v: boolean) => void;
}

export interface FitViewDeps {
  rooms: readonly CompletedRoom[];
  fpCv: HTMLCanvasElement | null;
  setVpZoom: (v: number) => void;
  setVpX: (v: number) => void;
  setVpY: (v: number) => void;
  draw2D: () => void;
  toast: (msg: string, type?: string) => void;
}

export interface SwitchFloorDeps {
  setCurFloor: (id: string) => void;
  setSel: (selId: null, isRoom: boolean, isWall: boolean) => void;
  floors: ReadonlyArray<{ id: string; name: string }>;
  renderFloorTabs: () => void;
  renderLeft: () => void;
  draw2D: () => void;
  rebuild3D: () => void;
  updateSelBotBar: () => void;
  toast: (msg: string, type?: string) => void;
}

/** View-Wechsel: 2D ↔ 3D ↔ walk. Setzt currentView, toggelt die
 *  Tab-Buttons, swappt Canvas-Sichtbarkeit und 3D-Cam. */
export function setView(v: ViewMode, deps: SetViewDeps): void {
  deps.setCurrentView(v);
  const h = document.getElementById('view-hint-3d');
  if (h) h.style.display = v === '3d' ? 'inline' : 'none';
  // Dual-class-toggle (.active + .is-active) wie in Cluster 7a/8a/8c.
  (['2d', '3d', 'walk'] as const).forEach((x) => {
    const el = document.getElementById('vt-' + x);
    if (!el) return;
    el.classList.toggle('active', x === v);
    el.classList.toggle('is-active', x === v);
  });
  const is2d = v === '2d';
  if (deps.fpCv) deps.fpCv.style.display = is2d ? 'block' : 'none';
  if (deps.tCv) deps.tCv.style.display = is2d ? 'none' : 'block';
  const pills = document.getElementById('mode-pills');
  if (pills) pills.style.display = is2d ? 'flex' : 'none';

  const fph = document.getElementById('fp-walk');
  if (v === 'walk') {
    deps.setCam3(deps.fpCam3);
    if (fph) fph.classList.add('vis');
    deps.setGrid3Visible(false);
  } else if (v === '3d') {
    deps.setCam3(deps.oCam);
    if (fph) fph.classList.remove('vis');
    deps.setGrid3Visible(true);
    if (deps.exitPointerLock) deps.exitPointerLock();
  } else {
    if (deps.exitPointerLock) deps.exitPointerLock();
    deps.draw2D();
  }
}

/** Fit-to-Content: berechnet vpZoom/vpX/vpY aus rooms-Bounds. */
export function fitViewToRooms(deps: FitViewDeps): void {
  if (!deps.rooms.length) return;
  if (!deps.fpCv) return;
  const allX = deps.rooms.flatMap((r) => [r.x, r.x + r.w]);
  const allY = deps.rooms.flatMap((r) => [r.y, r.y + r.d]);
  const minX = Math.min(...allX) - 1;
  const maxX = Math.max(...allX) + 1;
  const minY = Math.min(...allY) - 1;
  const maxY = Math.max(...allY) + 1;
  const pw = deps.fpCv.width - 60;
  const ph = deps.fpCv.height - 60;
  const vpZoom = Math.min(pw / (maxX - minX), ph / (maxY - minY), 80);
  deps.setVpZoom(vpZoom);
  deps.setVpX(deps.fpCv.width / 2 - ((minX + maxX) / 2) * vpZoom);
  deps.setVpY(deps.fpCv.height / 2 - ((minY + maxY) / 2) * vpZoom);
  deps.draw2D();
  deps.toast('🎯 Ansicht angepasst', 'b');
}

/** Floor-Switch: setzt curFloor, deselectiert, re-rendered alles. */
export function switchFloor(id: string, deps: SwitchFloorDeps): void {
  deps.setCurFloor(id);
  deps.setSel(null, false, false);
  deps.renderFloorTabs();
  deps.renderLeft();
  deps.draw2D();
  deps.rebuild3D();
  deps.updateSelBotBar();
  const f = deps.floors.find((fl) => fl.id === id);
  deps.toast('🏢 Etage: ' + (f?.name ?? id), 'b');
}
