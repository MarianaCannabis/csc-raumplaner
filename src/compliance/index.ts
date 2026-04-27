// KCanG-Stand: April 2024 (Ursprungsfassung, BGBl. 2024 I Nr. 109).
// Bestätigt Stand 2026-04-19: keine Novelle durch die seit Mai 2025 amtierende
// Bundesregierung. Letzte Prüfung: 2026-04-19 durch Projektbetreiber.
//
// Bei einer späteren Novelle: Regeln in ./rules/ anfassen, hier Datum
// aktualisieren, und FUNCTIONS-AUDIT.md §C revalidieren.

// Side-effect imports: each module calls registerRule() at load time.
import './rules/ausgabe.js';
import './rules/lager.js';
import './rules/wc.js';
import './rules/sozial.js';
import './rules/eingang-sec.js';
import './rules/rauchmelder.js';
import './rules/kamera.js';
import './rules/notausgang.js';
import './rules/feuerloescher.js';
import './rules/alarm.js';
import './rules/escapeRoute.js';
import './rules/kapazitaet.js';
import './rules/memberLimit.js';
import './rules/youthProtection.js';
import './rules/visualScreen.js';
import './rules/poiCscDistance.js';
import './rules/preventionOfficer.js';
import './rules/messeHeightLimit.js';
// Per-room (scope: 'room') — drive the canvas badge overlay.
import './rules/roomSmokeDetector.js';
import './rules/roomMinArea.js';
import './rules/roomDoorWidth.js';
// Multi-Floor Phase 2 (Mega-Sammel #4): Treppen-Compliance.
import './rules/stairsMinWidth.js';
import './rules/stairsConnection.js';
// v2.8.2: KCanG-Wizard-Section-D + -E als Compliance-Regeln.
import './rules/hygienekonzept.js';
import './rules/suchtberatung.js';

export * as escapeAnalysis from './escapeAnalysis.js';
export * as metrics from './metrics.js';

export { evaluateAll, listRules, registerRule, evaluateForRoom } from './registry.js';
export type { EvaluationEntry } from './registry.js';
export type { Rule, RuleContext, RuleResult, RuleCategory, RuleSeverity, Room, PlacedObject, ProjectMeta, Poi } from './types.js';
