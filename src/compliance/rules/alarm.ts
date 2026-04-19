import { registerRule } from '../registry.js';

registerRule({
  id: 'alarm',
  label: 'Alarmanlage installiert',
  category: 'security',
  severity: 'high',
  check({ objects }) {
    const found = objects.some((o) => o.typeId === 'sec-alarm');
    return { passed: found, details: found ? undefined : 'Keine Alarmanlage platziert' };
  },
});
