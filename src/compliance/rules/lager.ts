import { registerRule } from '../registry.js';

registerRule({
  id: 'lager',
  label: 'Lagerraum vorhanden',
  category: 'room',
  severity: 'high',
  check({ rooms }) {
    const found = rooms.some((r) => /lager/i.test(r.name));
    return { passed: found, details: found ? undefined : 'Kein Lagerraum gefunden' };
  },
});
