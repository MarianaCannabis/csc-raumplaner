// P4.2 — Messe/Event items. Each entry declares imageMapFace so the
// property panel renders an image-upload control for user branding.
// P4.3 will extend this list with the full Messebau catalog.

import type { PrimitiveCatalogItem } from './primitives.js';

export const MESSE_ITEMS: PrimitiveCatalogItem[] = [
  { id: 'msg-backwall-2', cat: '🎪 Messe', icon: '🖼️', name: 'Rückwand 2m',
    w: 2.0, d: 0.05, h: 2.5, builder: 'buildBackwall',
    imageMapFace: 'front', imageMapAspect: 'cover' },
  { id: 'msg-backwall-3', cat: '🎪 Messe', icon: '🖼️', name: 'Rückwand 3m',
    w: 3.0, d: 0.05, h: 2.5, builder: 'buildBackwall',
    imageMapFace: 'front', imageMapAspect: 'cover' },
  { id: 'msg-backwall-4', cat: '🎪 Messe', icon: '🖼️', name: 'Rückwand 4m',
    w: 4.0, d: 0.05, h: 2.5, builder: 'buildBackwall',
    imageMapFace: 'front', imageMapAspect: 'cover' },
  { id: 'msg-rollup', cat: '🎪 Messe', icon: '📜', name: 'Roll-up-Display 85×200',
    w: 0.85, d: 0.3, h: 2.0, builder: 'buildRollupBanner',
    imageMapFace: 'front', imageMapAspect: 'stretch' },
  { id: 'msg-counter-front', cat: '🎪 Messe', icon: '🧾', name: 'Info-Theke (bedruckbar)',
    w: 1.8, d: 0.6, h: 1.05, builder: 'buildCounterFront',
    imageMapFace: 'front', imageMapAspect: 'cover' },
  { id: 'msg-led-wall', cat: '🎪 Messe', icon: '📺', name: 'LED-Wand-Modul 1×1',
    w: 1.0, d: 0.1, h: 1.0, builder: 'buildLedWall',
    imageMapFace: 'front', imageMapAspect: 'cover' },
  { id: 'msg-flag', cat: '🎪 Messe', icon: '🚩', name: 'Beachflag (Tropfen, 3m)',
    w: 0.7, d: 0.05, h: 3.0, builder: 'buildFlag',
    imageMapFace: 'both_sides', imageMapAspect: 'cover' },
];
