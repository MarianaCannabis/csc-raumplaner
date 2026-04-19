import { registerRule } from '../registry.js';

registerRule({
  id: 'notausgang',
  label: 'Notausgang-Schild',
  category: 'fire',
  severity: 'high',
  check({ objects }) {
    const found = objects.some((o) => o.typeId === 'sec-sign-exit');
    return { passed: found, details: found ? undefined : 'Kein Notausgang-Schild platziert' };
  },
});
