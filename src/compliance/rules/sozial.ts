import { registerRule } from '../registry.js';

registerRule({
  id: 'sozial',
  label: 'Sozialbereich vorhanden',
  category: 'room',
  severity: 'medium',
  check({ rooms }) {
    const found = rooms.some((r) => /sozial|lounge/i.test(r.name));
    return { passed: found, details: found ? undefined : 'Kein Sozialbereich / keine Lounge gefunden' };
  },
});
