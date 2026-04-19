import { registerRule } from '../registry.js';

// Simplified capacity: total floor area / 2 m² per member ≥ 10 members.
// The legacy version called calcCapacity().total; that accounts for per-room
// exclusions (tech/storage rooms don't count). When that helper is ported to
// src/, swap this rule's formula to it.
registerRule({
  id: 'kapaz',
  label: 'Min. 2m² pro Mitglied',
  category: 'capacity',
  severity: 'high',
  check({ rooms }) {
    const totalArea = rooms.reduce((s, r) => s + r.w * r.d, 0);
    const capacity = totalArea / 2;
    const passed = capacity >= 10;
    return {
      passed,
      details: passed
        ? undefined
        : `Kapazität bei 2 m²/Mitglied: ${capacity.toFixed(1)} — mindestens 10 gefordert`,
    };
  },
});
