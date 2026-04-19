import { registerRule } from '../registry.js';

registerRule({
  id: 'kamera',
  label: 'Überwachungskamera',
  category: 'security',
  severity: 'high',
  check({ objects }) {
    const found = objects.some((o) => typeof o.typeId === 'string' && o.typeId.startsWith('sec-cam'));
    return { passed: found, details: found ? undefined : 'Keine Überwachungskamera platziert' };
  },
});
