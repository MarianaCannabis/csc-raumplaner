import type { CatalogItem } from '../types.js';

const KN = import.meta.env.BASE_URL + 'models/kenney/furniture/sofas/';
const QN = import.meta.env.BASE_URL + 'models/quaternius/interior/';
const KENNEY = 'Kenney Furniture Kit 2.0 — CC0';
const QUATERNIUS = 'Quaternius via Poly Pizza — CC0';

export const SOFAS: CatalogItem[] = [
  // Kenney
  { id: 'kn-sofa',              cat: '🛋 Sofas', icon: '🛋', name: 'Sofa 2-Sitzer',      w: 1.8, d: 0.9, h: 0.85, modelUrl: KN + 'loungeSofa.glb',              modelAttribution: KENNEY },
  { id: 'kn-sofa-long',         cat: '🛋 Sofas', icon: '🛋', name: 'Sofa 3-Sitzer',      w: 2.4, d: 0.9, h: 0.85, modelUrl: KN + 'loungeSofaLong.glb',          modelAttribution: KENNEY },
  { id: 'kn-sofa-corner',       cat: '🛋 Sofas', icon: '🛋', name: 'Ecksofa',            w: 2.2, d: 2.2, h: 0.85, modelUrl: KN + 'loungeSofaCorner.glb',        modelAttribution: KENNEY },
  { id: 'kn-sofa-ottoman',      cat: '🛋 Sofas', icon: '🛋', name: 'Sofa mit Ottomane',  w: 2.2, d: 1.6, h: 0.85, modelUrl: KN + 'loungeSofaOttoman.glb',       modelAttribution: KENNEY },
  { id: 'kn-sofa-design',       cat: '🛋 Sofas', icon: '🛋', name: 'Design-Sofa',        w: 2.0, d: 0.9, h: 0.85, modelUrl: KN + 'loungeDesignSofa.glb',        modelAttribution: KENNEY },
  { id: 'kn-sofa-design-corner',cat: '🛋 Sofas', icon: '🛋', name: 'Design-Ecksofa',    w: 2.2, d: 2.2, h: 0.85, modelUrl: KN + 'loungeDesignSofaCorner.glb',  modelAttribution: KENNEY },
  // Quaternius
  { id: 'qn-couch-large',       cat: '🛋 Sofas', icon: '🛋', name: 'Couch groß',         w: 2.4, d: 0.9, h: 0.85, modelUrl: QN + 'couch-large.glb',              modelAttribution: QUATERNIUS },
  { id: 'qn-couch-medium',      cat: '🛋 Sofas', icon: '🛋', name: 'Couch mittel',       w: 1.8, d: 0.9, h: 0.85, modelUrl: QN + 'couch-medium.glb',             modelAttribution: QUATERNIUS },
  { id: 'qn-couch-medium-2',    cat: '🛋 Sofas', icon: '🛋', name: 'Couch mittel V2',    w: 1.8, d: 0.9, h: 0.85, modelUrl: QN + 'couch-medium-fFfoi1LNKY.glb',  modelAttribution: QUATERNIUS },
  { id: 'qn-couch-small',       cat: '🛋 Sofas', icon: '🛋', name: 'Couch klein',        w: 1.2, d: 0.9, h: 0.85, modelUrl: QN + 'couch-small.glb',              modelAttribution: QUATERNIUS },
  { id: 'qn-couch-small-2',     cat: '🛋 Sofas', icon: '🛋', name: 'Couch klein V2',     w: 1.2, d: 0.9, h: 0.85, modelUrl: QN + 'couch-small-X9msj0gtb5.glb',   modelAttribution: QUATERNIUS },
  { id: 'qn-l-couch',           cat: '🛋 Sofas', icon: '🛋', name: 'L-Couch',            w: 2.2, d: 2.2, h: 0.85, modelUrl: QN + 'l-couch.glb',                  modelAttribution: QUATERNIUS },
];
