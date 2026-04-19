import { registerRule } from '../registry.js';
import { getLatestAnalysis } from '../escapeAnalysis.js';

// Replaces the P1.2 placeholder (id='flucht'). Reads the cached result of
// the escape-route worker; stays passed:null until the first analysis lands.
// Legacy code schedules the worker via window.cscEscape.schedule(...) on
// room/object changes — when the result comes back the subscribe() hook
// repaints the badges, and this rule then sees a concrete answer.

const MIN_WIDTH_M = 1.2;

registerRule({
  id: 'flucht',
  label: 'Fluchtweg ≥ 1.2m frei',
  category: 'escape',
  severity: 'critical',
  check({ rooms }) {
    const data = getLatestAnalysis();
    if (!data) {
      return { passed: null, details: 'Analyse läuft…' };
    }
    if (rooms.length === 0) {
      return { passed: null, details: 'Keine Räume — nichts zu prüfen' };
    }
    type V = { roomId: string; name: string; hasExit: boolean; minWidth: number };
    const violations: V[] = [];
    for (const r of rooms) {
      const res = data.perRoom[r.id];
      if (!res) continue;
      if (!res.hasExit || res.minWidth < MIN_WIDTH_M) {
        violations.push({
          roomId: r.id,
          name: r.name,
          hasExit: res.hasExit,
          minWidth: res.minWidth,
        });
      }
    }
    if (violations.length === 0) {
      return {
        passed: true,
        details: `Alle ${rooms.length} Räume: Fluchtweg ≥ ${MIN_WIDTH_M} m frei`,
      };
    }
    const sample = violations
      .slice(0, 3)
      .map((v) =>
        !v.hasExit
          ? `${v.name}: kein Exit erreichbar`
          : `${v.name}: nur ${v.minWidth.toFixed(2)} m`,
      )
      .join(', ');
    return {
      passed: false,
      details: `${violations.length} Raum/Räume mit Problem — ${sample}${violations.length > 3 ? ', …' : ''}`,
    };
  },
});
