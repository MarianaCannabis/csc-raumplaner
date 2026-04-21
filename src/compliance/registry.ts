import type { Rule, RuleContext, RuleResult, Room } from './types.js';
import { currentMode, isRuleActive } from '../modes/planningMode.js';

const rules = new Map<string, Rule>();

export function registerRule(r: Rule): void {
  if (rules.has(r.id)) console.warn('[compliance] duplicate rule id', r.id);
  rules.set(r.id, r);
}

export function listRules(): Rule[] {
  return [...rules.values()];
}

/** P11.1: Sub-Set filtered by planning-mode. Rules without `modes` apply
 *  everywhere (back-compat). */
export function listActiveRules(mode = currentMode()): Rule[] {
  return listRules().filter((r) => isRuleActive(r.modes, mode));
}

export interface EvaluationEntry extends RuleResult {
  rule: Rule;
}

function runRule(rule: Rule, ctx: RuleContext): EvaluationEntry {
  try {
    return { rule, ...rule.check(ctx) };
  } catch (e) {
    console.error('[compliance] rule crashed', rule.id, e);
    return {
      rule,
      passed: null,
      details: 'Regel-Fehler: ' + (e instanceof Error ? e.message : String(e)),
    };
  }
}

/** Evaluate every project-scoped rule. Room-scoped rules are skipped.
 *  P11.1: honors planning-mode filter (see Rule.modes). */
export function evaluateAll(ctx: RuleContext): EvaluationEntry[] {
  return listActiveRules()
    .filter((r) => (r.scope ?? 'project') === 'project')
    .map((rule) => runRule(rule, ctx));
}

/** Evaluate every room-scoped rule against one specific room. */
export function evaluateForRoom(ctx: RuleContext, room: Room): EvaluationEntry[] {
  const scoped: RuleContext = { ...ctx, currentRoom: room };
  return listActiveRules()
    .filter((r) => r.scope === 'room')
    .map((rule) => runRule(rule, scoped));
}
