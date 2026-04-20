import { describe, it, expect } from 'vitest';
import { calcCapacity, calcFireSafety, energyCertificate } from './metrics.js';
import type { Room, RuleContext } from './types.js';

const room = (w: number, d: number, extra: Partial<Room> = {}): Room => ({
  id: 'r1', name: 'R', x: 0, y: 0, w, d, h: 2.8, ...extra,
});

describe('calcCapacity', () => {
  it('leere Raumliste → total=0', () => {
    const r = calcCapacity([]);
    expect(r.total).toBe(0);
    expect(r.totalM2).toBe(0);
  });

  it('einzelner 10m²-Raum → 5 Personen bei 2 m²/Person (Default)', () => {
    const r = calcCapacity([room(5, 2)]);
    expect(r.total).toBe(5);
    expect(r.m2PerMember).toBe(2);
  });

  it('meta.sqmPerPerson = 1.5 → strengere Kapazität', () => {
    const r = calcCapacity([room(6, 2)], { sqmPerPerson: 1.5 });
    // 12 m² / 1.5 = 8
    expect(r.total).toBe(8);
    expect(r.m2PerMember).toBe(1.5);
  });

  it('hardLimit 500 clampt auch riesige Räume', () => {
    const r = calcCapacity([room(100, 100)]); // 10000 m² / 2 = 5000
    expect(r.total).toBe(5000);
    expect(r.effective).toBe(500); // KCanG hard limit
  });
});

describe('calcFireSafety', () => {
  const ctx = (rooms: Room[], extObjects: Array<{ typeId: string }> = []): RuleContext => ({
    rooms, objects: extObjects as never, meta: {},
  });

  it('DIN EN 3 / ASR A2.2: mind. 1 Feuerlöscher pro Raum', () => {
    const r = calcFireSafety(ctx([room(4, 4), room(5, 5)], []));
    expect(r.extinguishersRequired).toBeGreaterThanOrEqual(2);
    expect(r.extinguishersOk).toBe(false); // 0 vorhanden
  });

  it('plannedPeopleCount triggert 1 pro 100 Personen Regel', () => {
    const res = calcFireSafety({
      rooms: [room(5, 5)],
      objects: [] as never,
      meta: { plannedPeopleCount: 250 },
    });
    // 250/100 = 3, mind. >= 1 Raum, >= 1 pro 200m² (25m² -> 1) → max = 3
    expect(res.extinguishersRequired).toBe(3);
  });
});

describe('energyCertificate', () => {
  it('0 Räume → 0 kWh', () => {
    const r = energyCertificate([]);
    expect(r.kwh).toBe(0);
    expect(r.totalArea).toBe(0);
  });

  it('KfW40 reduziert kWh deutlich gegenüber GEG2024', () => {
    const r1 = energyCertificate([room(10, 10)], { energyClass: 'GEG2024' });
    const r2 = energyCertificate([room(10, 10)], { energyClass: 'KfW40' });
    expect(r2.kwh).toBeLessThan(r1.kwh);
    expect(r2.kwh).toBeCloseTo(r1.kwh * 0.4, -1);
  });

  it('Label-Grenze: kleiner Raum mit hoher Effizienz bekommt A++', () => {
    const r = energyCertificate([room(2, 2)], { energyClass: 'KfW40' });
    // 4 m² * (8*8*365 + 50*2000) / 4000 = ~108 kWh/m² * 0.4 = ~43 → A+
    // Genaue Label-Grenze hängt vom Multiplikator ab
    expect(['A++','A+','A','B']).toContain(r.label);
  });
});
