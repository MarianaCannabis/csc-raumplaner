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
import './rules/poi100m.js';
// Per-room (scope: 'room') — drive the canvas badge overlay.
import './rules/roomSmokeDetector.js';
import './rules/roomMinArea.js';
import './rules/roomDoorWidth.js';

export * as escapeAnalysis from './escapeAnalysis.js';

export { evaluateForRoom } from './registry.js';

export { evaluateAll, listRules, registerRule } from './registry.js';
export type { EvaluationEntry } from './registry.js';
export type { Rule, RuleContext, RuleResult, RuleCategory, RuleSeverity, Room, PlacedObject, ProjectMeta, Poi } from './types.js';
