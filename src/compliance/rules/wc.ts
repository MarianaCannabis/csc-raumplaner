import { registerRule } from '../registry.js';

registerRule({
  id: 'wc',
  label: 'WC vorhanden',
  category: 'room',
  severity: 'high',
  check({ rooms }) {
    const found = rooms.some((r) => /wc|toilet/i.test(r.name));
    return { passed: found, details: found ? undefined : 'Kein WC/Toilettenraum gefunden' };
  },
});
