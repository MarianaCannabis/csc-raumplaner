import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isStackedView,
  toggleStackedView,
  findFloorConnection,
  getDefaultFloors,
  addFloor,
  validateStairsPlacement,
} from '../floorManager.js';

describe('Stacked-View API (Phase 2 #3)', () => {
  beforeEach(() => {
    delete (window as unknown as { _show3DAllFloors?: boolean })._show3DAllFloors;
    delete (window as unknown as { toggleAllFloors?: unknown }).toggleAllFloors;
  });

  it('isStackedView default false', () => {
    expect(isStackedView()).toBe(false);
  });

  it('isStackedView reflects window._show3DAllFloors', () => {
    (window as unknown as { _show3DAllFloors?: boolean })._show3DAllFloors = true;
    expect(isStackedView()).toBe(true);
  });

  it('toggleStackedView ohne window.toggleAllFloors: fallback flippt _show3DAllFloors', () => {
    expect(toggleStackedView()).toBe(true);
    expect((window as unknown as { _show3DAllFloors?: boolean })._show3DAllFloors).toBe(true);
    expect(toggleStackedView()).toBe(false);
  });

  it('toggleStackedView nutzt window.toggleAllFloors wenn vorhanden', () => {
    const inlineFn = vi.fn(() => {
      const w = window as unknown as { _show3DAllFloors?: boolean };
      w._show3DAllFloors = !w._show3DAllFloors;
    });
    (window as unknown as { toggleAllFloors: typeof inlineFn }).toggleAllFloors = inlineFn;
    toggleStackedView();
    expect(inlineFn).toHaveBeenCalledOnce();
    expect((window as unknown as { _show3DAllFloors?: boolean })._show3DAllFloors).toBe(true);
  });
});

describe('findFloorConnection (Phase 2 #5)', () => {
  it('EG mit OG darüber: returnt {fromFloorId: eg, toFloorId: og}', () => {
    const floors = addFloor(getDefaultFloors(), 'above');
    const og = floors.find((f) => f.order === 1)!;
    const conn = findFloorConnection(floors, 'eg');
    expect(conn).toEqual({ fromFloorId: 'eg', toFloorId: og.id });
  });

  it('Topmost Floor: returnt null', () => {
    const floors = getDefaultFloors();
    const conn = findFloorConnection(floors, 'eg');
    expect(conn).toBeNull();
  });

  it('OG1 mit OG2 darüber: returnt {fromFloorId: og1, toFloorId: og2}', () => {
    let floors = addFloor(getDefaultFloors(), 'above'); // OG1
    floors = addFloor(floors, 'above'); // OG2
    const og1 = floors.find((f) => f.order === 1)!;
    const og2 = floors.find((f) => f.order === 2)!;
    const conn = findFloorConnection(floors, og1.id);
    expect(conn?.toFloorId).toBe(og2.id);
  });

  it('Unbekannter Floor: returnt null', () => {
    expect(findFloorConnection(getDefaultFloors(), 'unknown')).toBeNull();
  });
});

describe('validateStairsPlacement (Phase 3 #2)', () => {
  const eg = { id: 'eg', name: 'EG', height: 3, zOffset: 0, order: 0 };
  const og = { id: 'og', name: 'OG', height: 3, zOffset: 3, order: 1 };
  const ug = { id: 'ug', name: 'UG', height: 3, zOffset: -3, order: -1 };
  const floors = [ug, eg, og];

  const stairsBase = {
    x: 1, y: 1, w: 1.2, d: 4.76,
    connectsFloors: { fromFloorId: 'eg', toFloorId: 'og' },
  };
  const roomEg = { id: 'r1', x: 0, y: 0, w: 5, d: 6, floorId: 'eg' };
  const roomOg = { id: 'r2', x: 0, y: 0, w: 5, d: 6, floorId: 'og' };

  it('Treppe in Raum auf beiden Floors: ok=true, keine Warnings', () => {
    const r = validateStairsPlacement(stairsBase, floors, [roomEg, roomOg]);
    expect(r.ok).toBe(true);
    expect(r.errors).toHaveLength(0);
    expect(r.warnings).toHaveLength(0);
  });

  it('connectsFloors fehlt: ok=false', () => {
    const r = validateStairsPlacement({ x: 1, y: 1, w: 1, d: 1 }, floors, []);
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/connectsFloors fehlt/);
  });

  it('Oberer Floor existiert nicht: error', () => {
    const r = validateStairsPlacement(
      { ...stairsBase, connectsFloors: { fromFloorId: 'eg', toFloorId: 'doesnotexist' } },
      floors,
      [roomEg],
    );
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /nicht gefunden/.test(e))).toBe(true);
  });

  it('Order-Reihenfolge falsch (oben < unten): error', () => {
    const r = validateStairsPlacement(
      { ...stairsBase, connectsFloors: { fromFloorId: 'og', toFloorId: 'eg' } },
      floors,
      [],
    );
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => /muss höher liegen/.test(e))).toBe(true);
  });

  it('Treppe außerhalb des unteren Raums: warning', () => {
    const r = validateStairsPlacement(
      { ...stairsBase, x: 100, y: 100, w: 1, d: 1 },
      floors,
      [roomEg, roomOg],
    );
    expect(r.ok).toBe(true);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it('Floor ohne Räume: warning "endet ins Leere" / "liegt frei"', () => {
    const r = validateStairsPlacement(stairsBase, floors, []);
    expect(r.warnings.length).toBe(2);
  });
});
