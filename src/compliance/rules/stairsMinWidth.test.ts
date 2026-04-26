import { describe, it, expect } from 'vitest';
import { listRules } from '../registry.js';
import './stairsMinWidth.js';
import './stairsConnection.js';

const stairsRule = (id: string) => listRules().find((r) => r.id === id)!;

describe('stairs-min-width rule', () => {
  it('keine Treppen → passed=null (N/A)', () => {
    const rule = stairsRule('stairs-min-width');
    const r = rule.check({ rooms: [], objects: [] });
    expect(r.passed).toBeNull();
  });

  it('Treppe mit w=1.20 → passed=true', () => {
    const rule = stairsRule('stairs-min-width');
    const r = rule.check({
      rooms: [],
      objects: [{ id: 's1', typeId: 'stairs-straight-standard', x: 0, y: 0, w: 1.2 }],
    });
    expect(r.passed).toBe(true);
  });

  it('Treppe mit w=1.10 → passed=false (Critical-Fail)', () => {
    const rule = stairsRule('stairs-min-width');
    const r = rule.check({
      rooms: [],
      objects: [{ id: 's1', typeId: 'stairs-straight-narrow', x: 0, y: 0, w: 0.9 }],
    });
    expect(r.passed).toBe(false);
    expect(r.details).toContain('1.2');
  });

  it('Mix: 1 OK + 1 zu schmal → failed mit Anzahl', () => {
    const rule = stairsRule('stairs-min-width');
    const r = rule.check({
      rooms: [],
      objects: [
        { id: 's1', typeId: 'stairs-straight-standard', x: 0, y: 0, w: 1.2 },
        { id: 's2', typeId: 'stairs-straight-narrow', x: 5, y: 0, w: 0.9 },
      ],
    });
    expect(r.passed).toBe(false);
    expect(r.details).toContain('1 ');
  });

  it('Nicht-Treppen-Objects ignoriert', () => {
    const rule = stairsRule('stairs-min-width');
    const r = rule.check({
      rooms: [],
      objects: [
        { id: 'o1', typeId: 'sofa-1', x: 0, y: 0, w: 0.5 },
        { id: 'o2', typeId: 'tisch-1', x: 5, y: 0, w: 0.7 },
      ],
    });
    expect(r.passed).toBeNull();
  });

  it('severity = critical', () => {
    expect(stairsRule('stairs-min-width').severity).toBe('critical');
  });
});

describe('stairs-connection rule', () => {
  it('1 Floor → passed=null (N/A)', () => {
    const rule = stairsRule('stairs-connection');
    const r = rule.check({
      rooms: [{ id: 'r1', name: 'X', x: 0, y: 0, w: 5, d: 5, h: 3, floorId: 'eg' }],
      objects: [],
    });
    expect(r.passed).toBeNull();
  });

  it('2 Floors + keine Treppe → passed=false', () => {
    const rule = stairsRule('stairs-connection');
    // Dummy-Objects über window.objects bereitstellen — pragmatisch im Test
    (globalThis as unknown as { window: { objects: unknown[] } }).window = { objects: [] };
    const r = rule.check({
      rooms: [
        { id: 'r1', name: 'EG', x: 0, y: 0, w: 5, d: 5, h: 3, floorId: 'eg' },
        { id: 'r2', name: 'OG', x: 0, y: 0, w: 5, d: 5, h: 3, floorId: 'og1' },
      ],
      objects: [],
    });
    expect(r.passed).toBe(false);
    expect(r.details).toContain('2');
  });

  it('2 Floors + Treppe → passed=true', () => {
    const rule = stairsRule('stairs-connection');
    (globalThis as unknown as { window: { objects: unknown[] } }).window = {
      objects: [{ id: 's1', typeId: 'stairs-straight-standard', x: 0, y: 0, w: 1.2 }],
    };
    const r = rule.check({
      rooms: [
        { id: 'r1', name: 'EG', x: 0, y: 0, w: 5, d: 5, h: 3, floorId: 'eg' },
        { id: 'r2', name: 'OG', x: 0, y: 0, w: 5, d: 5, h: 3, floorId: 'og1' },
      ],
      objects: [],
    });
    expect(r.passed).toBe(true);
  });

  it('severity = critical', () => {
    expect(stairsRule('stairs-connection').severity).toBe('critical');
  });
});
