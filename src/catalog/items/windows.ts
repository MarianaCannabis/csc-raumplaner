import type { CatalogItem } from '../types.js';

const QN = import.meta.env.BASE_URL + 'models/quaternius/interior/';
const QUATERNIUS = 'Quaternius via Poly Pizza — CC0';

// Fenster-Spezialvarianten. Die Legacy-BUILTIN hat schon aw-sm/md/lg etc.
// Hier nur: echte Zusatz-Typen (Kipp+Schwing, VSG) + Quaternius-Low-Poly.
export const WINDOWS: CatalogItem[] = [
  // CSC-Primitive (aus P3.2a)
  { id: 'aw-lueftungs',  cat: '🪟 Fenster+', icon: '🌬', name: 'Lüftungsfenster (Kipp+Schwing)', w: 1.0, d: 0.15, h: 1.1, col: 0x88ccff, arch: 'window', material: 'glass' },
  { id: 'aw-sicher-vsg', cat: '🪟 Fenster+', icon: '🛡', name: 'VSG-Sicherheitsfenster (P6B)',   w: 1.2, d: 0.18, h: 1.3, col: 0x99ccff, arch: 'window', material: 'glass' },
  // Quaternius
  { id: 'qn-window-lg',  cat: '🪟 Fenster+', icon: '🪟', name: 'Fenster groß (Low-Poly)',       w: 1.8, d: 0.15, h: 1.4, modelUrl: QN + 'window-large.glb',   modelAttribution: QUATERNIUS },
  { id: 'qn-window-sm',  cat: '🪟 Fenster+', icon: '🪟', name: 'Fenster klein (Low-Poly)',      w: 0.8, d: 0.15, h: 1.0, modelUrl: QN + 'window-small.glb',    modelAttribution: QUATERNIUS },
  { id: 'qn-window-rd',  cat: '🪟 Fenster+', icon: '⭕', name: 'Rundfenster (Low-Poly)',         w: 0.8, d: 0.15, h: 0.8, modelUrl: QN + 'window-round.glb',    modelAttribution: QUATERNIUS },
];
