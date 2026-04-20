import { describe, it, expect } from 'vitest';
import { buildPackList } from './packlist.js';

describe('buildPackList', () => {
  it('aggregiert duplicate typeIds zu einer Zeile mit count', () => {
    const r = buildPackList([
      { typeId: 'chair', w: 0.5, d: 0.5, h: 1 },
      { typeId: 'chair', w: 0.5, d: 0.5, h: 1 },
      { typeId: 'chair', w: 0.5, d: 0.5, h: 1 },
      { typeId: 'table', w: 1.2, d: 0.7, h: 0.75 },
    ]);
    expect(r.totalItems).toBe(4);
    const chair = r.rows.find((x) => x.typeId === 'chair');
    expect(chair?.count).toBe(3);
  });

  it('Total-Volumen = Summe aller w·d·h × count', () => {
    const r = buildPackList([
      { typeId: 'a', w: 1, d: 1, h: 1 },
      { typeId: 'b', w: 2, d: 1, h: 1 },
    ]);
    expect(r.totalVolumeM3).toBeCloseTo(3, 2);
  });

  it('Markdown-Render enthält Gesamt-Zeile', () => {
    const r = buildPackList([{ typeId: 'x', w: 1, d: 1, h: 1 }]);
    expect(r.markdown).toContain('Gesamt');
    expect(r.markdown).toMatch(/\| \d+ \|/);
  });
});
