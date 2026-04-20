import { registerRule } from '../registry.js';

// P4.4 — Messe-Mode height-limit check. Trade-fair exhibitors must respect
// the hall's maximum booth height (typically 2.5 m for Reihenstand/closed,
// 4 m for Eckstand/Insel with open ceiling, varies by hall). When the
// operator sets meta.maxHeight, any placed object whose top edge exceeds
// the cap flags this rule.
//
// Not a legal/KCanG rule — a practical production rule. Result is null
// (not applicable) when meta.maxHeight is unset, so it only surfaces on
// Messe projects where the operator deliberately opts in.

interface HeightObject {
  py?: unknown;
  h?: unknown;
  name?: unknown;
  typeId?: unknown;
}

function topEdge(o: HeightObject): number {
  const py = typeof o.py === 'number' ? o.py : 0;
  const h = typeof o.h === 'number' ? o.h : 0;
  return py + h;
}

registerRule({
  id: 'messeHeightLimit',
  label: 'Messe-Höhenbegrenzung (meta.maxHeight)',
  category: 'room',
  severity: 'high',
  scope: 'project',
  icon: '📏',
  check({ objects, meta }) {
    const cap = meta?.maxHeight;
    if (cap == null || !isFinite(cap) || cap <= 0) {
      return { passed: null, details: 'Keine Höhenbegrenzung gesetzt' };
    }
    const over = (objects as HeightObject[]).filter((o) => topEdge(o) > cap);
    if (over.length === 0) {
      return {
        passed: true,
        details: `Alle Objekte ≤ ${cap.toFixed(1)} m`,
      };
    }
    const worst = over.slice().sort((a, b) => topEdge(b) - topEdge(a));
    const top3 = worst.slice(0, 3).map((o) => {
      const name = typeof o.name === 'string' ? o.name : String(o.typeId ?? 'Objekt');
      return `${name} (${topEdge(o).toFixed(2)} m)`;
    });
    return {
      passed: false,
      details: `${over.length} Objekt(e) > ${cap.toFixed(1)} m: ${top3.join(', ')}${
        over.length > 3 ? ', …' : ''
      }`,
    };
  },
});
