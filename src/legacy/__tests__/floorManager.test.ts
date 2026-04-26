import { describe, it, expect } from 'vitest';
import {
  getDefaultFloors,
  recomputeZOffsets,
  addFloor,
  removeFloor,
  renameFloor,
  setFloorHeight,
  validateFloors,
  getFloorById,
  getFloorAbove,
  getFloorBelow,
  DEFAULT_FLOOR_HEIGHT,
  type Floor,
} from '../floorManager.js';

describe('getDefaultFloors', () => {
  it('liefert genau 1 Floor (EG)', () => {
    const f = getDefaultFloors();
    expect(f.length).toBe(1);
    expect(f[0]!.id).toBe('eg');
    expect(f[0]!.order).toBe(0);
    expect(f[0]!.zOffset).toBe(0);
    expect(f[0]!.height).toBe(DEFAULT_FLOOR_HEIGHT);
  });
});

describe('addFloor', () => {
  it('above: neuer Floor mit order=+1, zOffset=height des EG', () => {
    const floors = addFloor(getDefaultFloors(), 'above');
    expect(floors.length).toBe(2);
    const og1 = floors.find((f) => f.order === 1);
    expect(og1).toBeDefined();
    expect(og1!.zOffset).toBe(DEFAULT_FLOOR_HEIGHT);
    expect(og1!.name).toBe('1. OG');
  });

  it('below: neuer Floor mit order=-1, zOffset=-height', () => {
    const floors = addFloor(getDefaultFloors(), 'below');
    expect(floors.length).toBe(2);
    const kg = floors.find((f) => f.order === -1);
    expect(kg).toBeDefined();
    expect(kg!.zOffset).toBe(-DEFAULT_FLOOR_HEIGHT);
    expect(kg!.name).toBe('Keller');
  });

  it('mehrere above: order steigt jeweils um 1', () => {
    let floors = getDefaultFloors();
    floors = addFloor(floors, 'above'); // OG1
    floors = addFloor(floors, 'above'); // OG2
    floors = addFloor(floors, 'above'); // OG3
    const orders = floors.map((f) => f.order).sort();
    expect(orders).toEqual([0, 1, 2, 3]);
  });

  it('mehrere below: order sinkt jeweils um 1', () => {
    let floors = getDefaultFloors();
    floors = addFloor(floors, 'below'); // KG
    floors = addFloor(floors, 'below'); // 2. UG
    const orders = floors.map((f) => f.order).sort((a, b) => a - b);
    expect(orders).toEqual([-2, -1, 0]);
  });
});

describe('recomputeZOffsets', () => {
  it('EG bleibt bei zOffset=0', () => {
    const floors: Floor[] = [
      { id: 'eg', name: 'EG', height: 3, zOffset: 999, order: 0 },
      { id: 'og', name: 'OG', height: 3, zOffset: 0, order: 1 },
    ];
    const r = recomputeZOffsets(floors);
    expect(r.find((f) => f.id === 'eg')!.zOffset).toBe(0);
  });

  it('OG1 = EG.height', () => {
    const floors: Floor[] = [
      { id: 'eg', name: 'EG', height: 3.0, zOffset: 0, order: 0 },
      { id: 'og1', name: 'OG1', height: 2.5, zOffset: 0, order: 1 },
      { id: 'og2', name: 'OG2', height: 2.5, zOffset: 0, order: 2 },
    ];
    const r = recomputeZOffsets(floors);
    expect(r.find((f) => f.id === 'og1')!.zOffset).toBe(3.0);
    expect(r.find((f) => f.id === 'og2')!.zOffset).toBe(5.5);
  });

  it('KG: zOffset = -height', () => {
    const floors: Floor[] = [
      { id: 'kg', name: 'KG', height: 2.5, zOffset: 0, order: -1 },
      { id: 'eg', name: 'EG', height: 3, zOffset: 0, order: 0 },
    ];
    const r = recomputeZOffsets(floors);
    expect(r.find((f) => f.id === 'kg')!.zOffset).toBe(-2.5);
    expect(r.find((f) => f.id === 'eg')!.zOffset).toBe(0);
  });

  it('Höhen-Änderung an EG: über+unter werden recomputed', () => {
    let floors: Floor[] = [
      { id: 'kg', name: 'KG', height: 2.5, zOffset: 0, order: -1 },
      { id: 'eg', name: 'EG', height: 3.0, zOffset: 0, order: 0 },
      { id: 'og', name: 'OG', height: 3.0, zOffset: 0, order: 1 },
    ];
    floors = recomputeZOffsets(floors);
    expect(floors.find((f) => f.id === 'og')!.zOffset).toBe(3.0);
    floors = setFloorHeight(floors, 'eg', 4.0);
    expect(floors.find((f) => f.id === 'og')!.zOffset).toBe(4.0);
    expect(floors.find((f) => f.id === 'kg')!.zOffset).toBe(-2.5); // KG unverändert
  });
});

describe('removeFloor', () => {
  it('entfernt Floor aus Array', () => {
    const floors = addFloor(getDefaultFloors(), 'above');
    const next = removeFloor(floors, floors[1]!.id);
    expect(next.length).toBe(1);
    expect(next[0]!.id).toBe('eg');
  });

  it('letzten Floor: returnt unverändert (mind. 1 muss bleiben)', () => {
    const floors = getDefaultFloors();
    const next = removeFloor(floors, 'eg');
    expect(next).toEqual(floors);
  });

  it('recomputed zOffsets nach remove', () => {
    let floors: Floor[] = [
      { id: 'eg', name: 'EG', height: 3, zOffset: 0, order: 0 },
      { id: 'og1', name: 'OG1', height: 3, zOffset: 0, order: 1 },
      { id: 'og2', name: 'OG2', height: 3, zOffset: 0, order: 2 },
    ];
    floors = recomputeZOffsets(floors);
    expect(floors.find((f) => f.id === 'og2')!.zOffset).toBe(6);
    // OG1 entfernen → OG2 sollte zOffset=3 haben (rückt nach unten in der Stack-Logik)
    const next = removeFloor(floors, 'og1');
    expect(next.length).toBe(2);
    // OG2 bleibt bei order=2 → zOffset = EG.height + (kein OG1 mehr) = 3
    expect(next.find((f) => f.id === 'og2')!.zOffset).toBe(3);
  });
});

describe('renameFloor', () => {
  it('updated nur den name', () => {
    let floors = addFloor(getDefaultFloors(), 'above');
    const og1 = floors.find((f) => f.order === 1)!;
    floors = renameFloor(floors, og1.id, 'Dachgeschoss');
    expect(floors.find((f) => f.id === og1.id)!.name).toBe('Dachgeschoss');
  });

  it('andere Felder bleiben unverändert', () => {
    let floors = addFloor(getDefaultFloors(), 'above');
    const before = floors.find((f) => f.order === 1)!;
    floors = renameFloor(floors, before.id, 'X');
    const after = floors.find((f) => f.id === before.id)!;
    expect(after.height).toBe(before.height);
    expect(after.zOffset).toBe(before.zOffset);
    expect(after.order).toBe(before.order);
  });
});

describe('setFloorHeight', () => {
  it('updated height + recompute zOffsets', () => {
    let floors = addFloor(getDefaultFloors(), 'above');
    floors = setFloorHeight(floors, 'eg', 4.0);
    const og1 = floors.find((f) => f.order === 1)!;
    expect(og1.zOffset).toBe(4.0);
  });

  it('ungültige Höhe (0 oder negativ): unverändert', () => {
    const floors = getDefaultFloors();
    const next = setFloorHeight(floors, 'eg', 0);
    expect(next).toEqual(floors);
    const next2 = setFloorHeight(floors, 'eg', -1);
    expect(next2).toEqual(floors);
  });
});

describe('validateFloors', () => {
  it('Default-Floors: keine Issues', () => {
    expect(validateFloors(getDefaultFloors())).toEqual([]);
  });

  it('leeres Array: Issue', () => {
    expect(validateFloors([])).toContain('Mindestens ein Floor erforderlich');
  });

  it('doppelte ID: Issue', () => {
    const floors: Floor[] = [
      { id: 'eg', name: 'EG', height: 3, zOffset: 0, order: 0 },
      { id: 'eg', name: 'EG2', height: 3, zOffset: 0, order: 1 },
    ];
    const issues = validateFloors(floors);
    expect(issues.some((i) => /Doppelte Floor-ID/.test(i))).toBe(true);
  });

  it('Höhe 0: Issue', () => {
    const floors: Floor[] = [
      { id: 'eg', name: 'EG', height: 0, zOffset: 0, order: 0 },
    ];
    const issues = validateFloors(floors);
    expect(issues.some((i) => /ungültige Höhe/.test(i))).toBe(true);
  });
});

describe('getFloorAbove / getFloorBelow', () => {
  it('Above: returnt nächsten höheren Floor', () => {
    let floors = addFloor(getDefaultFloors(), 'above'); // OG1
    floors = addFloor(floors, 'above'); // OG2
    const above = getFloorAbove(floors, 'eg');
    expect(above?.order).toBe(1);
  });

  it('Above von topmost: returnt null', () => {
    const floors = getDefaultFloors();
    expect(getFloorAbove(floors, 'eg')).toBeNull();
  });

  it('Below: returnt nächsten tieferen Floor', () => {
    let floors = addFloor(getDefaultFloors(), 'below'); // KG
    floors = addFloor(floors, 'below'); // UG2
    const below = getFloorBelow(floors, 'eg');
    expect(below?.order).toBe(-1);
  });

  it('Below von bottommost: returnt null', () => {
    const floors = getDefaultFloors();
    expect(getFloorBelow(floors, 'eg')).toBeNull();
  });
});

describe('getFloorById', () => {
  it('returnt Floor wenn gefunden', () => {
    const floors = getDefaultFloors();
    expect(getFloorById(floors, 'eg')!.id).toBe('eg');
  });

  it('returnt null wenn nicht gefunden', () => {
    expect(getFloorById(getDefaultFloors(), 'unknown')).toBeNull();
  });
});
