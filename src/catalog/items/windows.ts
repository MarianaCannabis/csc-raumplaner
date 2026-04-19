import type { CatalogItem } from '../types.js';

// Spezialisierte Fenster-Varianten neben aw-sm/md/lg etc. Zwei echte
// neue Typen — Lüftungs-Kipp-Schwing und VSG-Sicherheit.
export const WINDOWS: CatalogItem[] = [
  { id: 'aw-lueftungs',  cat: '🪟 Fenster+', icon: '🌬', name: 'Lüftungsfenster (Kipp+Schwing)', w: 1.0, d: 0.15, h: 1.1, col: 0x88ccff, arch: 'window', material: 'glass' },
  { id: 'aw-sicher-vsg', cat: '🪟 Fenster+', icon: '🛡', name: 'VSG-Sicherheitsfenster (P6B)',   w: 1.2, d: 0.18, h: 1.3, col: 0x99ccff, arch: 'window', material: 'glass' },
];
