import type { CatalogItem } from '../types.js';

const BASE = import.meta.env.BASE_URL + 'models/kenney/furniture/sofas/';
const ATTR = 'Kenney Furniture Kit 2.0 — CC0';

export const SOFAS: CatalogItem[] = [
  { id: 'kn-sofa',              cat: '🛋 Sofas', icon: '🛋', name: 'Sofa 2-Sitzer',      w: 1.8, d: 0.9, h: 0.85, modelUrl: BASE + 'loungeSofa.glb',              modelAttribution: ATTR },
  { id: 'kn-sofa-long',         cat: '🛋 Sofas', icon: '🛋', name: 'Sofa 3-Sitzer',      w: 2.4, d: 0.9, h: 0.85, modelUrl: BASE + 'loungeSofaLong.glb',          modelAttribution: ATTR },
  { id: 'kn-sofa-corner',       cat: '🛋 Sofas', icon: '🛋', name: 'Ecksofa',            w: 2.2, d: 2.2, h: 0.85, modelUrl: BASE + 'loungeSofaCorner.glb',        modelAttribution: ATTR },
  { id: 'kn-sofa-ottoman',      cat: '🛋 Sofas', icon: '🛋', name: 'Sofa mit Ottomane',  w: 2.2, d: 1.6, h: 0.85, modelUrl: BASE + 'loungeSofaOttoman.glb',       modelAttribution: ATTR },
  { id: 'kn-sofa-design',       cat: '🛋 Sofas', icon: '🛋', name: 'Design-Sofa',        w: 2.0, d: 0.9, h: 0.85, modelUrl: BASE + 'loungeDesignSofa.glb',        modelAttribution: ATTR },
  { id: 'kn-sofa-design-corner',cat: '🛋 Sofas', icon: '🛋', name: 'Design-Ecksofa',    w: 2.2, d: 2.2, h: 0.85, modelUrl: BASE + 'loungeDesignSofaCorner.glb',  modelAttribution: ATTR },
];
