import { registerRule } from '../registry.js';

// Placeholder — the legacy checklist has this as a manual check (check:()=>true).
// Real geometry evaluation (min. 1.2 m clear width, shortest path under max
// distance, door-swing clearance) lands in the P1.3 Fluchtweg module.
registerRule({
  id: 'flucht',
  label: 'Fluchtweg ≥ 1.2m frei',
  category: 'escape',
  severity: 'critical',
  check() {
    return { passed: true, details: 'Manuelle Prüfung bis P1.3 Fluchtweg-Geometrie' };
  },
});
