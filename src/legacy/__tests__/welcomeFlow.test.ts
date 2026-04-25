import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  startWelcomeFlow,
  welcomeStep,
  closeWelcomeFlow,
  renderWelcomeStep,
  _resetForTests,
  _getCurrentIdx,
  WELCOME_STEP_COUNT,
  type WelcomeFlowDeps,
} from '../welcomeFlow.js';

const FIXTURE = `
  <div id="welcome-step-content"></div>
  <div id="welcome-dots"></div>
  <button id="welcome-back"></button>
  <button id="welcome-next"></button>
  <input type="checkbox" id="welcome-never" />
`;

const baseDeps = (overrides: Partial<WelcomeFlowDeps> = {}): WelcomeFlowDeps => ({
  openM: vi.fn(),
  closeM: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  _resetForTests();
  document.body.innerHTML = FIXTURE;
  localStorage.clear();
});

describe('startWelcomeFlow', () => {
  it('e2eMode=true: kein Render, kein openM', () => {
    const deps = baseDeps({ e2eMode: true });
    startWelcomeFlow(deps);
    expect(deps.openM).not.toHaveBeenCalled();
  });

  it('happy: Step 0 wird gerendert + openM(m-welcome)', () => {
    const deps = baseDeps();
    startWelcomeFlow(deps);
    expect(_getCurrentIdx()).toBe(0);
    expect(deps.openM).toHaveBeenCalledWith('m-welcome');
    expect(document.getElementById('welcome-step-content')!.innerHTML).toContain('Willkommen');
  });

  it('initial: back-button hidden', () => {
    startWelcomeFlow(baseDeps());
    expect((document.getElementById('welcome-back') as HTMLElement).style.display).toBe('none');
  });
});

describe('welcomeStep navigation', () => {
  it('advance Step 0 → 1: dots + content update', () => {
    const deps = baseDeps();
    startWelcomeFlow(deps);
    welcomeStep(1, deps);
    expect(_getCurrentIdx()).toBe(1);
    expect(document.getElementById('welcome-step-content')!.innerHTML).toContain('Was der Planner');
  });

  it('back: Step 1 → 0', () => {
    const deps = baseDeps();
    startWelcomeFlow(deps);
    welcomeStep(1, deps);
    welcomeStep(-1, deps);
    expect(_getCurrentIdx()).toBe(0);
  });

  it('clamped at 0 (kein -1)', () => {
    const deps = baseDeps();
    startWelcomeFlow(deps);
    welcomeStep(-5, deps);
    expect(_getCurrentIdx()).toBe(0);
  });

  it('clamped at last step (kein über length)', () => {
    const deps = baseDeps();
    startWelcomeFlow(deps);
    welcomeStep(99, deps);
    expect(_getCurrentIdx()).toBe(WELCOME_STEP_COUNT - 1);
  });

  it('letzter Step: next-button text "Fertig"', () => {
    const deps = baseDeps();
    startWelcomeFlow(deps);
    welcomeStep(WELCOME_STEP_COUNT - 1, deps);
    expect((document.getElementById('welcome-next') as HTMLButtonElement).textContent).toContain('Fertig');
  });
});

describe('closeWelcomeFlow', () => {
  it('mark=true: localStorage csc-onboarded gesetzt + closeM', () => {
    const deps = baseDeps();
    closeWelcomeFlow(deps, true);
    expect(localStorage.getItem('csc-onboarded')).toBe('1');
    expect(deps.closeM).toHaveBeenCalledWith('m-welcome');
  });

  it('checkbox checked: csc-welcome-never gesetzt', () => {
    const deps = baseDeps();
    (document.getElementById('welcome-never') as HTMLInputElement).checked = true;
    closeWelcomeFlow(deps, true);
    expect(localStorage.getItem('csc-welcome-never')).toBe('1');
  });

  it('mark=false: kein localStorage-Write', () => {
    const deps = baseDeps();
    closeWelcomeFlow(deps, false);
    expect(localStorage.getItem('csc-onboarded')).toBeNull();
    expect(deps.closeM).toHaveBeenCalled();
  });
});

describe('renderWelcomeStep', () => {
  it('mit cta-Step: Buttons im Content', () => {
    _resetForTests();
    welcomeStep(99, baseDeps()); // ans Ende = cta-Step
    const html = document.getElementById('welcome-step-content')!.innerHTML;
    expect(html).toContain('Vorlage');
    expect(html).toContain('Leer');
    expect(html).toContain('Laden');
  });

  it('ohne cta: keine Buttons', () => {
    startWelcomeFlow(baseDeps()); // Step 0 = no cta
    const html = document.getElementById('welcome-step-content')!.innerHTML;
    expect(html).not.toContain('📋 Vorlage');
  });
});
