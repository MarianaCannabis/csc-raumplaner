import { describe, it, expect } from 'vitest';
import { haversineM } from './overpass.js';

describe('haversineM', () => {
  it('gleicher Punkt → 0 m', () => {
    expect(haversineM(52.5, 13.4, 52.5, 13.4)).toBeCloseTo(0, 1);
  });

  it('Berlin Zentrum → Potsdamer Platz ≈ realistische Kilometer', () => {
    // Brandenburger Tor: 52.5163, 13.3777
    // Potsdamer Platz:  52.5096, 13.3759
    const dist = haversineM(52.5163, 13.3777, 52.5096, 13.3759);
    expect(dist).toBeGreaterThan(600);
    expect(dist).toBeLessThan(900);
  });

  it('200m-KCanG-Check Nord-Süd-Kante triggert korrekt', () => {
    // Schul-Adresse 250 m nördlich von CSC-Adresse
    const lat1 = 52.5000, lat2 = 52.5023; // ~255 m Nord
    const dist = haversineM(lat1, 13.4, lat2, 13.4);
    expect(dist).toBeGreaterThan(200);
    expect(dist).toBeLessThan(300);
  });
});
