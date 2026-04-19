import { registerRule } from '../registry.js';

// KCanG §11: max. 500 members per CSC.
registerRule({
  id: 'memberLimit',
  label: 'Max. 500 Mitglieder',
  category: 'member',
  severity: 'critical',
  check({ meta }) {
    const n = meta?.memberCount;
    if (n == null) return { passed: null, details: 'Mitgliederzahl nicht gesetzt' };
    return {
      passed: n <= 500,
      details: n <= 500 ? `${n} Mitglieder — Limit eingehalten` : `${n} Mitglieder — Limit von 500 überschritten`,
    };
  },
});
