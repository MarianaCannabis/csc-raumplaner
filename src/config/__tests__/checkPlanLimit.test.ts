import { describe, it, expect, beforeEach } from 'vitest';
import { checkPlanLimit } from '../features.js';

describe('checkPlanLimit (Stripe Phase 2 Soft-Limit)', () => {
  beforeEach(() => {
    delete (window as unknown as { SB_USER?: unknown }).SB_USER;
  });

  it('Free + 1 project: ok ohne warning (limit free=3)', () => {
    const r = checkPlanLimit('projects', 1);
    expect(r.ok).toBe(true);
    expect(r.warning).toBeUndefined();
  });

  it('Free + 3 projects (limit erreicht): ok=true mit warning', () => {
    const r = checkPlanLimit('projects', 3);
    expect(r.ok).toBe(true);
    expect(r.warning).toMatch(/Limit/);
    expect(r.warning).toMatch(/Free/);
  });

  it('Pro: warning erst ab 50 (Pro-Limit)', () => {
    (window as unknown as { SB_USER?: unknown }).SB_USER = { app_metadata: { tier: 'pro' } };
    expect(checkPlanLimit('projects', 49).warning).toBeUndefined();
    expect(checkPlanLimit('projects', 50).warning).toMatch(/Pro/);
  });

  it('Enterprise: nie warning (Infinity-Limits)', () => {
    (window as unknown as { SB_USER?: unknown }).SB_USER = { app_metadata: { tier: 'enterprise' } };
    expect(checkPlanLimit('projects', 9999).warning).toBeUndefined();
  });

  it('aiCallsPerMonth-Feature: Free=50', () => {
    expect(checkPlanLimit('aiCallsPerMonth', 49).ok).toBe(true);
    expect(checkPlanLimit('aiCallsPerMonth', 49).warning).toBeUndefined();
    expect(checkPlanLimit('aiCallsPerMonth', 50).warning).toMatch(/aiCallsPerMonth/);
  });

  it('soft: ok bleibt true auch bei warning', () => {
    expect(checkPlanLimit('projects', 100).ok).toBe(true);
  });
});
