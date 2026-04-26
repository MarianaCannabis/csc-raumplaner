import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isStackedView,
  toggleStackedView,
  findFloorConnection,
  getDefaultFloors,
  addFloor,
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
