import { registerRule } from '../registry.js';
import { getLatestAnalysis } from '../escapeAnalysis.js';

// Replaces the P1.2 placeholder (id='flucht'). Reads the cached result of
// the escape-route worker; stays passed:null until the first analysis lands.
// Legacy code schedules the worker via window.cscEscape.schedule(...) on
// room/object changes — when the result comes back the subscribe() hook
// repaints the badges, and this rule then sees a concrete answer.
//
// Width threshold per ASR A2.3 / DIN 18040:
//   ≤ 200 Personen: 1.2 m lichte Breite
//   > 200 Personen: 1.8 m (bzw. 1.2 m je 200 Personen, aufgerundet) —
//   wir nutzen die einfachere Zweistufen-Heuristik, die für CSC-Größen
//   (KCanG § 11 Obergrenze 500) genügt.

const CSC_THRESHOLD_PERSONS = 200;

registerRule({
  id: 'flucht',
  label: 'Fluchtweg frei (ASR A2.3)',
  category: 'escape',
  severity: 'critical',
  check({ rooms, meta }) {
    const data = getLatestAnalysis();
    if (!data) return { passed: null, details: 'Analyse läuft…' };
    if (rooms.length === 0) {
      return { passed: null, details: 'Keine Räume — nichts zu prüfen' };
    }

    const capacity = meta?.memberCount ?? 0;
    const minRequired =
      capacity > CSC_THRESHOLD_PERSONS ? 1.8 : 1.2;
    const scaleLabel =
      capacity > CSC_THRESHOLD_PERSONS ? 'ab 201 Pers.' : 'bis 200 Pers.';

    type V = { roomId: string; name: string; hasExit: boolean; minWidth: number };
    const violations: V[] = [];
    for (const r of rooms) {
      const res = data.perRoom[r.id];
      if (!res) continue;
      if (!res.hasExit || res.minWidth < minRequired) {
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
        details: `Alle ${rooms.length} Räume: Fluchtweg ≥ ${minRequired} m frei (${scaleLabel})`,
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
      details: `Min-Breite ≥ ${minRequired} m (${scaleLabel}) — ${violations.length} Raum/Räume mit Problem — ${sample}${violations.length > 3 ? ', …' : ''}`,
    };
  },
});
