import { registerRule } from '../registry.js';

registerRule({
  id: 'ausgabe',
  label: 'Ausgaberaum vorhanden',
  category: 'room',
  severity: 'critical',
  modes: ['room'],
  check({ rooms }) {
    const found = rooms.some((r) => /ausgab/i.test(r.name));
    return { passed: found, details: found ? undefined : 'Kein Raum mit "Ausgabe" im Namen gefunden' };
  },
});
