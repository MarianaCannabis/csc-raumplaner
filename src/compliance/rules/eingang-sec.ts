import { registerRule } from '../registry.js';

registerRule({
  id: 'eingang',
  label: 'Eingangstür (RC2)',
  category: 'security',
  severity: 'critical',
  check({ objects }) {
    const found = objects.some((o) => o.typeId === 'at-sec');
    return { passed: found, details: found ? undefined : 'Keine RC2-Sicherheitseingangstür platziert (typeId=at-sec)' };
  },
});
