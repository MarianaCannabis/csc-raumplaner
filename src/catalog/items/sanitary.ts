import type { CatalogItem } from '../types.js';

const KN = import.meta.env.BASE_URL + 'models/kenney/furniture/sanitary/';
const QN = import.meta.env.BASE_URL + 'models/quaternius/interior/';
const KENNEY = 'Kenney Furniture Kit 2.0 — CC0';
const QUATERNIUS = 'Quaternius via Poly Pizza — CC0';

export const SANITARY: CatalogItem[] = [
  // Kenney
  { id: 'kn-bathtub',          cat: '🛁 Sanitär', icon: '🛁', name: 'Badewanne',       w: 1.7, d: 0.75, h: 0.6, modelUrl: KN + 'bathtub.glb',         modelAttribution: KENNEY },
  { id: 'kn-toilet',           cat: '🛁 Sanitär', icon: '🚽', name: 'WC rund',         w: 0.4, d: 0.7, h: 0.8, modelUrl: KN + 'toilet.glb',          modelAttribution: KENNEY },
  { id: 'kn-toilet-square',    cat: '🛁 Sanitär', icon: '🚽', name: 'WC eckig',        w: 0.4, d: 0.7, h: 0.8, modelUrl: KN + 'toiletSquare.glb',    modelAttribution: KENNEY },
  { id: 'kn-bath-sink',        cat: '🛁 Sanitär', icon: '🚰', name: 'Waschbecken',     w: 0.6, d: 0.45, h: 0.85, modelUrl: KN + 'bathroomSink.glb',  modelAttribution: KENNEY },
  { id: 'kn-bath-cabinet',     cat: '🛁 Sanitär', icon: '🗄', name: 'Bad-Unterschrank',w: 0.6, d: 0.35, h: 0.7, modelUrl: KN + 'bathroomCabinet.glb', modelAttribution: KENNEY },
  { id: 'kn-bath-mirror',      cat: '🛁 Sanitär', icon: '🪞', name: 'Bad-Spiegel',     w: 0.6, d: 0.05, h: 0.6, modelUrl: KN + 'bathroomMirror.glb',  modelAttribution: KENNEY },
  // Quaternius
  { id: 'qn-bath-sink',        cat: '🛁 Sanitär', icon: '🚰', name: 'Waschbecken (Variante)', w: 0.6, d: 0.45, h: 0.85, modelUrl: QN + 'bathroom-sink.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-bath-tub',         cat: '🛁 Sanitär', icon: '🛁', name: 'Badewanne (Variante)',  w: 1.7, d: 0.75, h: 0.6, modelUrl: QN + 'bathtub.glb',     modelAttribution: QUATERNIUS },
  { id: 'qn-toilet',           cat: '🛁 Sanitär', icon: '🚽', name: 'WC (Variante)',         w: 0.4, d: 0.7, h: 0.8, modelUrl: QN + 'toilet.glb',      modelAttribution: QUATERNIUS },
  { id: 'qn-toilet-paper',     cat: '🛁 Sanitär', icon: '🧻', name: 'Toilettenpapier',      w: 0.15, d: 0.1, h: 0.12, modelUrl: QN + 'bathroom-toilet-paper.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-toilet-paper-st',  cat: '🛁 Sanitär', icon: '🧻', name: 'Toilettenpapier-Stapel',w: 0.15, d: 0.15, h: 0.3, modelUrl: QN + 'toilet-paper-stack.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-towel-rack',       cat: '🛁 Sanitär', icon: '🧺', name: 'Handtuchhalter',        w: 0.6, d: 0.1, h: 0.3, modelUrl: QN + 'towel-rack.glb',    modelAttribution: QUATERNIUS },
  { id: 'qn-washing-machine',  cat: '🛁 Sanitär', icon: '🧼', name: 'Waschmaschine',         w: 0.6, d: 0.6, h: 0.85, modelUrl: QN + 'washing-machine.glb', modelAttribution: QUATERNIUS },
];
