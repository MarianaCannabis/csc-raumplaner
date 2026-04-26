/**
 * Multi-Floor Phase 2 (Mega-Sammel #1) — Treppen-Catalog-Items.
 *
 * Phase 2: nur straight-Treppen. L/Wendel kommen Phase 3.
 *
 * Standard-Werte sind an Bauordnung orientiert:
 *   - Mindestbreite 1.20 m (Notausgang-Pflicht)
 *   - Stufenhöhe max 0.19 m
 *   - Stufentiefe min 0.26 m
 *
 * `stepCount * stepHeight ≈ Floor-Höhe`. Default: 17 × 0.18 = 3.06 m
 * für eine typische 3.0 m EG-Höhe (mit kleinem Spielraum).
 */

import type { CatalogItem } from '../types.js';

export const STAIRS: CatalogItem[] = [
  {
    id: 'stairs-straight-standard',
    cat: '🪜 Treppen',
    icon: '🪜',
    name: 'Gerade Treppe (Standard)',
    w: 1.2, // Mindestbreite Bauordnung Notausgang
    d: 4.76, // 17 × 0.28 m Tiefe
    h: 3.06, // 17 × 0.18 m Höhe
    type: 'stairs',
    stairsConfig: {
      shape: 'straight',
      stepHeight: 0.18,
      stepDepth: 0.28,
      stepCount: 17,
      withRailing: true,
    },
  },
  {
    id: 'stairs-straight-narrow',
    cat: '🪜 Treppen',
    icon: '🪜',
    name: 'Schmale Treppe (Privatbereich)',
    w: 0.9, // unter Bauordnung-Mindest — triggert Compliance-Regel als FAIL
    d: 3.6,
    h: 2.7,
    type: 'stairs',
    stairsConfig: {
      shape: 'straight',
      stepHeight: 0.18,
      stepDepth: 0.24,
      stepCount: 15,
      withRailing: true,
    },
  },
  {
    id: 'stairs-straight-keller',
    cat: '🪜 Treppen',
    icon: '🪜',
    name: 'Kellertreppe (kompakt)',
    w: 1.2,
    d: 3.5,
    h: 2.5, // 14 × ~0.18m
    type: 'stairs',
    stairsConfig: {
      shape: 'straight',
      stepHeight: 0.18,
      stepDepth: 0.25,
      stepCount: 14,
      withRailing: false,
    },
  },
];
