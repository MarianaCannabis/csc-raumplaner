/**
 * P17.2 — Compliance-Bridge zwischen Legacy-State (rooms, objects, projMeta)
 * und der schon-modularen src/compliance/-API. Deckt Health-Score-Berechnung,
 * Echtzeit-Badges auf der 2D-Canvas und das Health-Details-Panel ab.
 *
 * Dependencies sind explizite Parameter (kein Lesen aus globals) — das
 * macht das Modul testbar und entkoppelt es vom Legacy-Boot.
 *
 * Backwards-Compat: window.calcHealthScore / window.renderComplianceBadges /
 * window.showHealthDetails werden in main.ts gesetzt für die Inline-Caller
 * im index.html.
 */

import type { CompletedRoom, SceneObject } from './types.js';

/** Lose getypte View des src/compliance/-Window-Bridges (siehe main.ts).
 *  Vollständige Typen leben in src/compliance/index.ts; diese Bridge nutzt
 *  nur die zwei genutzten Methoden, mit defensiven Optional-Markern. */
interface ComplianceRegistryView {
  metrics?: {
    calcHealthScore?: (
      input: { rooms: readonly CompletedRoom[]; objects: readonly SceneObject[]; meta: Record<string, unknown> },
      flags: { autosaveEnabled: boolean; cloudConnected: boolean },
    ) => { score: number };
  };
  evaluateForRoom?: (
    input: { rooms: readonly CompletedRoom[]; objects: readonly SceneObject[]; meta: Record<string, unknown> },
    room: CompletedRoom,
  ) => Array<{
    passed?: boolean;
    rule: { icon?: string; label: string };
    details?: string;
  }>;
}

export interface ComplianceBridgeDeps {
  rooms: readonly CompletedRoom[];
  objects: readonly SceneObject[];
  projMeta: Record<string, unknown>;
  curFloor: string;
  currentView: '2d' | '3d';
  realtimeCompliance: boolean;
  cloudConnected: boolean;
  autosaveEnabled: boolean;
  /** Legacy-Checklist-Provider (typisch ~17 Entries). Leer-Array ist
   *  zulässig (Bridge handhabt /0 graceful). */
  getKCaNGChecklist: () => Array<{ passed: boolean; label: string }>;
  /** World→Canvas-Koordinaten — Identity OK in Tests. */
  wx2cx: (wx: number) => number;
  wy2cy: (wy: number) => number;
  /** Optionaler Modern-Compliance-Registry-View. Wenn vorhanden + die
   *  jeweilige Methode existiert, delegiert die Bridge dorthin. Sonst
   *  Legacy-Fallback (gleiche Math wie pre-P2.1a). */
  registry?: ComplianceRegistryView;
  /** UI-Side-Effect-Callbacks (lose Kopplung statt direkter window-Calls). */
  addMsg?: (msg: string, type: string) => void;
  showRight?: (panel: string) => void;
}

/**
 * Berechnet den Health-Score (0-100) und aktualisiert #hs-fill/#hs-label.
 * Delegiert an deps.registry.metrics.calcHealthScore wenn vorhanden,
 * sonst Legacy-Fallback (gleiche Math + Weights wie pre-P2.1a).
 *
 * Returns score; Caller (main.ts) schreibt ihn ins legacy `_healthScore`
 * global.
 */
export function calcHealthScore(deps: ComplianceBridgeDeps): number {
  const flags = { autosaveEnabled: deps.autosaveEnabled, cloudConnected: deps.cloudConnected };
  let score: number | undefined;
  const reg = deps.registry;
  if (reg && reg.metrics && typeof reg.metrics.calcHealthScore === 'function') {
    try {
      const b = reg.metrics.calcHealthScore(
        { rooms: deps.rooms, objects: deps.objects, meta: deps.projMeta },
        flags,
      );
      score = b.score;
    } catch (err) {
      console.warn('[metrics] calcHealthScore delegate failed, using legacy fallback', err);
    }
  }
  if (score == null) {
    // Legacy fallback — pre-P2.1a inline path (identical math + weights),
    // mit defensivem /0-Guard für leere Checklists (z.B. in Unit-Tests).
    score = 0;
    const checks = deps.getKCaNGChecklist();
    if (checks.length > 0) {
      score += (checks.filter((c) => c.passed).length / checks.length) * 40;
    }
    if (deps.rooms.length >= 3) score += 15;
    else if (deps.rooms.length >= 1) score += 7;
    if (deps.objects.length >= 10) score += 15;
    else if (deps.objects.length >= 3) score += 7;
    const secTypes = ['sec-cam-ceil', 'sec-smoke', 'sec-ext'];
    score +=
      (secTypes.filter((t) => deps.objects.some((o) => o.typeId === t)).length / secTypes.length) *
      15;
    if (flags.autosaveEnabled) score += 8;
    if (flags.cloudConnected) score += 7;
    score = Math.round(score);
  }

  const fill = document.getElementById('hs-fill');
  const label = document.getElementById('hs-label');
  const col = score >= 80 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171';
  if (fill) {
    fill.style.width = score + '%';
    fill.style.background = col;
  }
  if (label) {
    label.textContent = score + '%';
    label.style.color = col;
  }
  return score;
}

/**
 * Rendert die Realtime-Compliance-Badges auf der 2D-Canvas.
 * No-op wenn !realtimeCompliance oder currentView !== '2d'.
 * Aktualisiert am Ende den Health-Score (sonst können failing-Rules
 * im UI hängen).
 */
export function renderComplianceBadges(deps: ComplianceBridgeDeps): void {
  if (!deps.realtimeCompliance || deps.currentView !== '2d') return;
  document.querySelectorAll('.comp-badge').forEach((e) => e.remove());
  const wrap = document.getElementById('canvas-wrap');
  if (!wrap) return;

  // Wenn der Compliance-Registry noch nicht geladen ist (deferred module
  // race), trotzdem den Score updaten und auf den nächsten draw2D warten.
  const reg = deps.registry;
  if (!reg || typeof reg.evaluateForRoom !== 'function') {
    calcHealthScore(deps);
    return;
  }

  const BADGE_W = 22; // step zwischen gestackten Badges am selben Raum
  deps.rooms
    .filter((r) => (r.floorId || 'eg') === deps.curFloor)
    .forEach((r) => {
      const results = reg.evaluateForRoom!(
        { rooms: deps.rooms, objects: deps.objects, meta: deps.projMeta },
        r,
      );
      const failing = results.filter((e) => e.passed === false);
      failing.forEach((entry, i) => {
        const cx = deps.wx2cx(r.x + r.w - 0.5) + 2 - i * BADGE_W;
        const cy = deps.wy2cy(r.y + 0.3) + 2;
        const badge = document.createElement('div');
        badge.className = 'comp-badge';
        badge.style.left = cx + 'px';
        badge.style.top = cy + 'px';
        badge.style.cursor = 'default';
        badge.textContent = entry.rule.icon || '⚠️';
        badge.title = entry.rule.label + (entry.details ? '\n' + entry.details : '');
        wrap.appendChild(badge);
      });
    });
  calcHealthScore(deps);
}

/**
 * Öffnet das Health-Details-Panel (rechts) und gibt einen System-Message
 * mit Score + fehlende Anforderungen aus.
 */
export function showHealthDetails(deps: ComplianceBridgeDeps): void {
  const score = calcHealthScore(deps);
  const checks = deps.getKCaNGChecklist();
  const missing = checks.filter((c) => !c.passed).map((c) => c.label);
  const msg =
    '🎯 Projekt-Score: ' +
    score +
    '%\n\n' +
    (missing.length
      ? 'Noch fehlend:\n' + missing.slice(0, 5).map((m) => '• ' + m).join('\n')
      : '✅ Alle wichtigen Anforderungen erfüllt!');
  if (deps.addMsg) deps.addMsg(msg, 'sys');
  if (deps.showRight) deps.showRight('ai');
}
