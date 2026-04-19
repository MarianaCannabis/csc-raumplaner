import type { Rule, RuleContext, RuleResult } from './types.js';

const rules = new Map<string, Rule>();

export function registerRule(r: Rule): void {
  if (rules.has(r.id)) console.warn('[compliance] duplicate rule id', r.id);
  rules.set(r.id, r);
}

export function listRules(): Rule[] {
  return [...rules.values()];
}

export interface EvaluationEntry extends RuleResult {
  rule: Rule;
}

export function evaluateAll(ctx: RuleContext): EvaluationEntry[] {
  return listRules().map((rule) => {
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
  });
}
