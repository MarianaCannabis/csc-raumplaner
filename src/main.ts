// P1 entry — loaded alongside the legacy inline script in index.html.
// Modules under src/ live here; legacy globals stay in index.html until
// they get strangled one by one.
import * as compliance from './compliance/index.js';
import * as geo from './geo/overpass.js';

console.info('[csc] vite entry alive', import.meta.env.MODE);
console.info('[csc] compliance rules registered:', compliance.listRules().length);

// Legacy bridge: expose modules on window so index.html can call
// window.cscCompliance.evaluateAll(...) / window.cscGeo.geocode(...)
// in P1.4 without a build round-trip.
declare global {
  interface Window {
    cscCompliance: typeof compliance;
    cscGeo: typeof geo;
  }
}
window.cscCompliance = compliance;
window.cscGeo = geo;
