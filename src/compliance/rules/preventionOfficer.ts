import { registerRule } from '../registry.js';

// KCanG § 23: a named Präventionsbeauftragter is required per CSC to
// anchor addiction-prevention and youth-protection duties. We check for
// an organisational assignment only — the name goes into projMeta via
// the Projekt-Panel. The actual qualification (Schulung, IHK-Kurs etc.)
// is out of scope for the planner.
registerRule({
  id: 'preventionOfficer',
  label: 'Präventionsbeauftragter benannt (§ 23 KCanG)',
  category: 'member',
  severity: 'high',
  check({ meta }) {
    const name = meta?.preventionOfficer?.trim();
    if (name) return { passed: true, details: `Eingetragen: ${name}` };
    return {
      passed: false,
      details: 'Kein Präventionsbeauftragter in Projekt-Meta eingetragen',
    };
  },
});
