import { describe, it, expect } from 'vitest';
import { calcMesseBudget, fmtEUR } from './budget.js';

describe('calcMesseBudget', () => {
  it('leeres Projekt → nur Strom + WLAN (Pauschalen)', () => {
    const r = calcMesseBudget({ rooms: [], objects: [] });
    expect(r.standRent).toBe(0);
    expect(r.setupCost).toBe(0);
    expect(r.totalEUR).toBeGreaterThan(0); // electricity + wifi
  });

  it('6×4 m² × 3 Tage × 120 €/m²/Tag = 8640 € Standmiete', () => {
    const r = calcMesseBudget({
      rooms: [{ w: 6, d: 4 }],
      objects: [],
      meta: { messeDays: 3 },
    });
    expect(r.standRent).toBe(8640);
    expect(r.areaQm).toBe(24);
  });

  it('messe-items + rich-primitives werden fürs Setup gezählt', () => {
    const r = calcMesseBudget({
      rooms: [{ w: 4, d: 3 }],
      objects: [
        { typeId: 'msg-backwall-3' },
        { typeId: 'msg-counter-front' },
        { typeId: 'p-sofa-2' },
        { typeId: 'unbekannt' },
      ],
    });
    // 3 messe-relevant × 40 € = 120 €
    expect(r.setupCost).toBe(120);
  });

  it('Carpet-Kosten nur für bodenbelag-Materials', () => {
    const r = calcMesseBudget({
      rooms: [{ w: 3, d: 2 }],
      objects: [],
      grounds: [
        { w: 2, d: 2, material: 'carpet' },   // → 4 m² × 12 = 48 €
        { w: 2, d: 2, material: 'grass' },    // ignoriert (outdoor)
      ],
    });
    expect(r.carpetCost).toBe(48);
  });
});

describe('fmtEUR', () => {
  it('Tausender-Trennung in de-DE', () => {
    expect(fmtEUR(1234)).toBe('1.234 €');
    expect(fmtEUR(0)).toBe('0 €');
  });
});
