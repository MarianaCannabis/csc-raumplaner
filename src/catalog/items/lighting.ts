import type { CatalogItem } from '../types.js';

const QN = import.meta.env.BASE_URL + 'models/quaternius/interior/';
const QUATERNIUS = 'Quaternius via Poly Pizza — CC0';

// Dedicated category for lamps / ceiling lights / chandeliers. Distinct
// from the legacy BUILTIN 'arch: light' items (those are architectural
// built-in lights); these are placeable decorative fixtures.
export const LIGHTING: CatalogItem[] = [
  { id: 'qn-lamp',              cat: '💡 Beleuchtung', icon: '💡', name: 'Lampe',              w: 0.3, d: 0.3, h: 0.6, modelUrl: QN + 'lamp.glb',                      modelAttribution: QUATERNIUS },
  { id: 'qn-table-lamp',        cat: '💡 Beleuchtung', icon: '🪔', name: 'Tischlampe',         w: 0.25, d: 0.25, h: 0.5, modelUrl: QN + 'table-lamp.glb',             modelAttribution: QUATERNIUS },
  { id: 'qn-light-desk',        cat: '💡 Beleuchtung', icon: '💡', name: 'Schreibtisch-Lampe', w: 0.2, d: 0.2, h: 0.6, modelUrl: QN + 'light-desk.glb',               modelAttribution: QUATERNIUS },
  { id: 'qn-light-floor',       cat: '💡 Beleuchtung', icon: '💡', name: 'Stehlampe',          w: 0.35, d: 0.35, h: 1.6, modelUrl: QN + 'light-floor.glb',            modelAttribution: QUATERNIUS },
  { id: 'qn-light-floor-2',     cat: '💡 Beleuchtung', icon: '💡', name: 'Stehlampe 2',        w: 0.35, d: 0.35, h: 1.6, modelUrl: QN + 'light-floor-eBQtooeh43.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-light-stand',       cat: '💡 Beleuchtung', icon: '💡', name: 'Ständerlampe',       w: 0.3, d: 0.3, h: 1.4, modelUrl: QN + 'light-stand.glb',              modelAttribution: QUATERNIUS },
  { id: 'qn-light-ceiling',     cat: '💡 Beleuchtung', icon: '💡', name: 'Deckenlampe',        w: 0.5, d: 0.5, h: 0.2, modelUrl: QN + 'light-ceiling.glb',            modelAttribution: QUATERNIUS },
  { id: 'qn-light-ceiling-2',   cat: '💡 Beleuchtung', icon: '💡', name: 'Deckenlampe 2',      w: 0.5, d: 0.5, h: 0.2, modelUrl: QN + 'light-ceiling-NNlnaiDJIh.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-light-ceiling-3',   cat: '💡 Beleuchtung', icon: '💡', name: 'Deckenlampe 3',      w: 0.5, d: 0.5, h: 0.2, modelUrl: QN + 'light-ceiling-ToOLJDO5FI.glb', modelAttribution: QUATERNIUS },
  { id: 'qn-light-ceiling-sgl', cat: '💡 Beleuchtung', icon: '💡', name: 'Deckenlampe einzeln',w: 0.3, d: 0.3, h: 0.25, modelUrl: QN + 'light-ceiling-single.glb',   modelAttribution: QUATERNIUS },
  { id: 'qn-ceiling-light',     cat: '💡 Beleuchtung', icon: '💡', name: 'Deckenleuchte',      w: 0.4, d: 0.4, h: 0.15, modelUrl: QN + 'ceiling-light.glb',           modelAttribution: QUATERNIUS },
  { id: 'qn-chandelier',        cat: '💡 Beleuchtung', icon: '🕯', name: 'Kronleuchter',      w: 0.8, d: 0.8, h: 0.8, modelUrl: QN + 'light-chandelier.glb',          modelAttribution: QUATERNIUS },
  { id: 'qn-light-cube',        cat: '💡 Beleuchtung', icon: '🟦', name: 'Würfellampe',       w: 0.3, d: 0.3, h: 0.3, modelUrl: QN + 'light-cube.glb',                modelAttribution: QUATERNIUS },
  { id: 'qn-light-cube-2',      cat: '💡 Beleuchtung', icon: '🟦', name: 'Würfellampe 2',     w: 0.3, d: 0.3, h: 0.3, modelUrl: QN + 'light-cube-oyyy82ElHM.glb',     modelAttribution: QUATERNIUS },
  { id: 'qn-light-icosa',       cat: '💡 Beleuchtung', icon: '🔷', name: 'Ikosaeder-Lampe',   w: 0.4, d: 0.4, h: 0.4, modelUrl: QN + 'light-icosahedron.glb',         modelAttribution: QUATERNIUS },
];
