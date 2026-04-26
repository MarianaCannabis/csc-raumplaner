import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  autoStartTourIfNew,
  startTour,
  skipTour,
  onWelcomeDone,
  onWelcomeCtaChosen,
  onBridgeYes,
  onBridgeNo,
  onTutorialDone,
  getTourState,
  _resetForTests,
  type TourDeps,
} from '../onboardingTour.js';

const baseDeps = (overrides: Partial<TourDeps> = {}): TourDeps => ({
  startWelcome: vi.fn(),
  startTutorial: vi.fn(),
  toast: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  _resetForTests();
  localStorage.clear();
  document.body.innerHTML = '';
});

describe('autoStartTourIfNew', () => {
  it('frische User: setzt state=welcome + ruft startWelcome', () => {
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    expect(getTourState()).toBe('welcome');
    expect(deps.startWelcome).toHaveBeenCalledOnce();
  });

  it('skip=1: kein-op (keine startWelcome-Call)', () => {
    localStorage.setItem('csc-onboarding-skip', '1');
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    expect(deps.startWelcome).not.toHaveBeenCalled();
  });

  it('state=done: kein-op', () => {
    localStorage.setItem('csc-onboarding-state', 'done');
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    expect(deps.startWelcome).not.toHaveBeenCalled();
    expect(getTourState()).toBe('done');
  });

  it('Migration: csc-welcome-never=1 → csc-onboarding-skip=1', () => {
    localStorage.setItem('csc-welcome-never', '1');
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    expect(localStorage.getItem('csc-onboarding-skip')).toBe('1');
    expect(deps.startWelcome).not.toHaveBeenCalled();
  });

  it('Migration: csc-onboarded=1 (alter Welcome-Done) → state=done, kein Re-Show', () => {
    localStorage.setItem('csc-onboarded', '1');
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    expect(localStorage.getItem('csc-onboarding-state')).toBe('done');
    expect(deps.startWelcome).not.toHaveBeenCalled();
  });

  it('Migration ist idempotent: läuft 2× ohne neue Keys zu überschreiben', () => {
    localStorage.setItem('csc-welcome-never', '1');
    localStorage.setItem('csc-onboarding-skip', 'EXISTING');
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    expect(localStorage.getItem('csc-onboarding-skip')).toBe('EXISTING');
  });
});

describe('startTour (explicit)', () => {
  it('resettet auch wenn state=done', () => {
    localStorage.setItem('csc-onboarding-state', 'done');
    const deps = baseDeps();
    startTour(deps);
    expect(getTourState()).toBe('welcome');
    expect(deps.startWelcome).toHaveBeenCalledOnce();
  });

  it('aus skipped: User-Override — Tour startet trotzdem', () => {
    localStorage.setItem('csc-onboarding-skip', '1');
    localStorage.setItem('csc-onboarding-state', 'skipped');
    const deps = baseDeps();
    startTour(deps);
    expect(getTourState()).toBe('welcome');
    expect(deps.startWelcome).toHaveBeenCalledOnce();
  });
});

describe('Phase-Transitions', () => {
  it('onWelcomeDone (von welcome): → bridge + Modal sichtbar', () => {
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    onWelcomeDone(deps);
    expect(getTourState()).toBe('bridge');
    const overlay = document.getElementById('m-onboarding-bridge');
    expect(overlay).not.toBeNull();
    expect(overlay!.style.display).toBe('flex');
  });

  it('onWelcomeDone (von idle): defensiv kein-op', () => {
    const deps = baseDeps();
    // state ist initial idle (nicht welcome) — Hook darf nichts tun
    onWelcomeDone(deps);
    expect(getTourState()).not.toBe('bridge');
  });

  it('onWelcomeCtaChosen: state → done (kein Tutorial)', () => {
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    onWelcomeCtaChosen();
    expect(getTourState()).toBe('done');
    expect(deps.startTutorial).not.toHaveBeenCalled();
  });

  it('onBridgeYes: bridge → tutorial + ruft startTutorial', () => {
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    onWelcomeDone(deps);
    onBridgeYes(deps);
    expect(getTourState()).toBe('tutorial');
    expect(deps.startTutorial).toHaveBeenCalledOnce();
  });

  it('onBridgeYes: schließt Bridge-Modal', () => {
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    onWelcomeDone(deps);
    onBridgeYes(deps);
    const overlay = document.getElementById('m-onboarding-bridge');
    expect(overlay!.style.display).toBe('none');
  });

  it('onBridgeNo: bridge → done', () => {
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    onWelcomeDone(deps);
    onBridgeNo();
    expect(getTourState()).toBe('done');
  });

  it('onTutorialDone (von tutorial): → done + toast', () => {
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    onWelcomeDone(deps);
    onBridgeYes(deps);
    onTutorialDone(deps);
    expect(getTourState()).toBe('done');
    expect(deps.toast).toHaveBeenCalledWith(
      expect.stringContaining('Tour abgeschlossen'),
      'g',
    );
  });

  it('onTutorialDone (von done): defensiv kein-op', () => {
    const deps = baseDeps();
    onTutorialDone(deps);
    expect(deps.toast).not.toHaveBeenCalled();
  });
});

describe('skipTour', () => {
  it('aus welcome: state=skipped + localStorage=skip', () => {
    const deps = baseDeps();
    autoStartTourIfNew(deps);
    skipTour();
    expect(getTourState()).toBe('skipped');
    expect(localStorage.getItem('csc-onboarding-skip')).toBe('1');
  });

  it('aus done: state=skipped (zwingt User-Override)', () => {
    localStorage.setItem('csc-onboarding-state', 'done');
    skipTour();
    expect(getTourState()).toBe('skipped');
  });

  it('idempotent: 2× ist harmlos', () => {
    skipTour();
    skipTour();
    expect(getTourState()).toBe('skipped');
    expect(localStorage.getItem('csc-onboarding-skip')).toBe('1');
  });
});

describe('getTourState', () => {
  it('ohne localStorage: returnt idle', () => {
    expect(getTourState()).toBe('idle');
  });

  it('aus localStorage: returnt persistierten State', () => {
    localStorage.setItem('csc-onboarding-state', 'tutorial');
    expect(getTourState()).toBe('tutorial');
  });

  it('invalid value: fällt auf in-memory zurück', () => {
    localStorage.setItem('csc-onboarding-state', 'BOGUS');
    expect(getTourState()).toBe('idle');
  });
});
