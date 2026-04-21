import { describe, it, expect, beforeEach, vi } from 'vitest';
import { currentMode, setMode, onModeChange, isRuleActive } from './planningMode.js';

describe('planningMode', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.removeAttribute('data-planning-mode');
  });

  it('defaults to room when nothing persisted', () => {
    expect(currentMode()).toBe('room');
  });

  it('persists + applies body attribute on setMode', () => {
    setMode('event');
    expect(localStorage.getItem('csc-planning-mode')).toBe('event');
    expect(document.body.dataset.planningMode).toBe('event');
    expect(currentMode()).toBe('event');
  });

  it('normalizes unknown persisted values to room', () => {
    localStorage.setItem('csc-planning-mode', 'trash' as any);
    expect(currentMode()).toBe('room');
  });

  it('fires csc-mode-change event on setMode', () => {
    const spy = vi.fn();
    const off = onModeChange(spy);
    setMode('event');
    expect(spy).toHaveBeenCalledWith('event');
    off();
  });

  it('isRuleActive: undefined modes = active everywhere', () => {
    expect(isRuleActive(undefined, 'room')).toBe(true);
    expect(isRuleActive(undefined, 'event')).toBe(true);
  });

  it('isRuleActive: filters by declared modes', () => {
    expect(isRuleActive(['room'], 'room')).toBe(true);
    expect(isRuleActive(['room'], 'event')).toBe(false);
    expect(isRuleActive(['room', 'event'], 'event')).toBe(true);
  });
});
