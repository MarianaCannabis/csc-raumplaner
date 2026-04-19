import { registerRule } from '../registry.js';

registerRule({
  id: 'loescher',
  label: 'Feuerlöscher vorhanden',
  category: 'fire',
  severity: 'critical',
  check({ objects }) {
    const found = objects.some((o) => o.typeId === 'sec-ext');
    return { passed: found, details: found ? undefined : 'Kein Feuerlöscher platziert' };
  },
});
