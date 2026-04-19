import type { CatalogItem } from './types.js';

/**
 * Pipeline-Test items — purely to exercise the GLTF loader end-to-end.
 * Drop this file (and the catalog bridge that registers it) in P3.2 once
 * real CC0/CC-BY furniture assets are integrated.
 */
export const TEST_ITEMS: CatalogItem[] = [
  {
    id: 'test-duck',
    cat: 'Test',
    icon: '🦆',
    name: 'Duck (Pipeline-Test)',
    w: 0.5,
    d: 0.5,
    h: 0.5,
    modelUrl: import.meta.env.BASE_URL + 'models/test/duck.glb',
    modelAttribution: 'Khronos glTF Sample Models — CC-BY 4.0 (Sony / Intel)',
  },
];
