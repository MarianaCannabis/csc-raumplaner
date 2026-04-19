import type { CatalogItem } from '../types.js';

const BASE = import.meta.env.BASE_URL + 'models/kenney/furniture/sanitary/';
const ATTR = 'Kenney Furniture Kit 2.0 — CC0';

export const SANITARY: CatalogItem[] = [
  { id: 'kn-bathtub',          cat: '🛁 Sanitär', icon: '🛁', name: 'Badewanne',       w: 1.7, d: 0.75, h: 0.6, modelUrl: BASE + 'bathtub.glb',         modelAttribution: ATTR },
  { id: 'kn-toilet',           cat: '🛁 Sanitär', icon: '🚽', name: 'WC rund',         w: 0.4, d: 0.7, h: 0.8, modelUrl: BASE + 'toilet.glb',          modelAttribution: ATTR },
  { id: 'kn-toilet-square',    cat: '🛁 Sanitär', icon: '🚽', name: 'WC eckig',        w: 0.4, d: 0.7, h: 0.8, modelUrl: BASE + 'toiletSquare.glb',    modelAttribution: ATTR },
  { id: 'kn-bath-sink',        cat: '🛁 Sanitär', icon: '🚰', name: 'Waschbecken',     w: 0.6, d: 0.45, h: 0.85, modelUrl: BASE + 'bathroomSink.glb',  modelAttribution: ATTR },
  { id: 'kn-bath-cabinet',     cat: '🛁 Sanitär', icon: '🗄', name: 'Bad-Unterschrank',w: 0.6, d: 0.35, h: 0.7, modelUrl: BASE + 'bathroomCabinet.glb', modelAttribution: ATTR },
  { id: 'kn-bath-mirror',      cat: '🛁 Sanitär', icon: '🪞', name: 'Bad-Spiegel',     w: 0.6, d: 0.05, h: 0.6, modelUrl: BASE + 'bathroomMirror.glb',  modelAttribution: ATTR },
];
