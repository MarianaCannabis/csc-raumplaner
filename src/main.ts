// P1 entry — loaded alongside the legacy inline script in index.html.
// Modules under src/ live here; legacy globals stay in index.html until
// they get strangled one by one.
import * as compliance from './compliance/index.js';

console.info('[csc] vite entry alive', import.meta.env.MODE);
console.info('[csc] compliance rules registered:', compliance.listRules().length);

// Legacy bridge: expose the registry on window so index.html can call
// window.cscCompliance.evaluateAll(...) in P1.4 without a build step.
declare global {
  interface Window {
    cscCompliance: typeof compliance;
  }
}
window.cscCompliance = compliance;
