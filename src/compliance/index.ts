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
import './rules/fluchtweg.js';
import './rules/kapazitaet.js';

export { evaluateAll, listRules, registerRule } from './registry.js';
export type { EvaluationEntry } from './registry.js';
export type { Rule, RuleContext, RuleResult, RuleCategory, RuleSeverity, Room, PlacedObject, ProjectMeta, Poi } from './types.js';
