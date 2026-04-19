import { registerRule } from '../registry.js';

registerRule({
  id: 'rauch',
  label: 'Rauchmelder installiert',
  category: 'fire',
  severity: 'critical',
  check({ objects }) {
    const found = objects.some((o) => o.typeId === 'sec-smoke');
    return { passed: found, details: found ? undefined : 'Kein Rauchmelder platziert' };
  },
});
