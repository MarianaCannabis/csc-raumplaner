import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildStairsMesh, getStairsZRange } from '../stairsGeometry.js';
import type { StairsConfig } from '../types.js';

const DEFAULT_CFG: StairsConfig = {
  shape: 'straight',
  stepHeight: 0.18,
  stepDepth: 0.28,
  stepCount: 17,
  withRailing: true,
};

describe('buildStairsMesh', () => {
  it('returnt eine THREE.Group', () => {
    const m = buildStairsMesh(1.2, DEFAULT_CFG);
    expect(m).toBeInstanceOf(THREE.Group);
  });

  it('userData enthält totalHeight = stepCount × stepHeight', () => {
    const m = buildStairsMesh(1.2, DEFAULT_CFG);
    const data = m.userData as { totalHeight: number; stepCount: number };
    expect(data.totalHeight).toBeCloseTo(17 * 0.18, 4);
    expect(data.stepCount).toBe(17);
  });

  it('totalDepth = stepCount × stepDepth', () => {
    const m = buildStairsMesh(1.2, DEFAULT_CFG);
    const data = m.userData as { totalDepth: number };
    expect(data.totalDepth).toBeCloseTo(17 * 0.28, 4);
  });

  it('mit Geländer: enthält zusätzliche Meshes', () => {
    const withRail = buildStairsMesh(1.2, DEFAULT_CFG);
    const noRail = buildStairsMesh(1.2, { ...DEFAULT_CFG, withRailing: false });
    expect(withRail.children.length).toBeGreaterThan(noRail.children.length);
  });

  it('verschiedene Stufenzahlen produzieren unterschiedliche Höhen', () => {
    const stairs10 = buildStairsMesh(1.2, { ...DEFAULT_CFG, stepCount: 10 });
    const stairs20 = buildStairsMesh(1.2, { ...DEFAULT_CFG, stepCount: 20 });
    const h10 = (stairs10.userData as { totalHeight: number }).totalHeight;
    const h20 = (stairs20.userData as { totalHeight: number }).totalHeight;
    expect(h20).toBeGreaterThan(h10);
    expect(h20 / h10).toBeCloseTo(2.0, 1);
  });

  it('Mesh enthält ein Geometrie-Mesh als child', () => {
    const m = buildStairsMesh(1.2, DEFAULT_CFG);
    const meshChildren = m.children.filter((c) => c instanceof THREE.Mesh);
    expect(meshChildren.length).toBeGreaterThan(0);
  });

  it('Schmale Treppe (Compliance-FAIL Width=0.9) erzeugt trotzdem Geometrie', () => {
    // Geometrie wird erzeugt — Compliance-Check ist separat
    const m = buildStairsMesh(0.9, DEFAULT_CFG);
    expect(m).toBeInstanceOf(THREE.Group);
  });
});

describe('getStairsZRange', () => {
  it('returnt minZ=0 + korrekte maxZ', () => {
    const m = buildStairsMesh(1.2, DEFAULT_CFG);
    const range = getStairsZRange(m);
    expect(range.minZ).toBe(0);
    expect(range.maxZ).toBeCloseTo(17 * 0.28, 4);
    expect(range.height).toBeCloseTo(17 * 0.18, 4);
  });

  it('für leere Group: 0/0/0 (graceful)', () => {
    const empty = new THREE.Group();
    const range = getStairsZRange(empty);
    expect(range.minZ).toBe(0);
    expect(range.maxZ).toBe(0);
    expect(range.height).toBe(0);
  });
});

describe('L-Treppe (Phase 3 #4)', () => {
  it('shape="l" erzeugt 2-Lauf-Geometrie + Podest', () => {
    const m = buildStairsMesh(1.2, { ...DEFAULT_CFG, shape: 'l', stepCount: 16, landingAfter: 8 });
    expect(m).toBeInstanceOf(THREE.Group);
    // Erwartet: Lauf 1 (Group) + Podest (Mesh) + Lauf 2 (Group) + opt. Geländer (Group)
    expect(m.children.length).toBeGreaterThanOrEqual(3);
    const data = m.userData as { shape: string; landingAfter: number; totalHeight: number };
    expect(data.shape).toBe('l');
    expect(data.landingAfter).toBe(8);
    expect(data.totalHeight).toBeCloseTo(16 * 0.18, 4);
  });

  it('L-Treppe ohne explizites landingAfter: nutzt Hälfte', () => {
    const m = buildStairsMesh(1.2, { ...DEFAULT_CFG, shape: 'l', stepCount: 16 });
    expect((m.userData as { landingAfter: number }).landingAfter).toBe(8);
  });

  it('L-Treppe Gesamthöhe entspricht stepCount × stepHeight', () => {
    const m = buildStairsMesh(1.2, { ...DEFAULT_CFG, shape: 'l', stepCount: 14 });
    expect((m.userData as { totalHeight: number }).totalHeight).toBeCloseTo(14 * 0.18, 4);
  });
});
