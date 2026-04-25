import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  startTutorial,
  endTutorial,
  tutNav,
  renderTutStep,
  _resetForTests,
  _getCurrentStep,
  TUT_STEP_COUNT,
} from '../tutorial.js';

const FIXTURE = `
  <div id="tutorial-overlay"></div>
  <div id="tut-highlight" style="display:none"></div>
  <div id="tut-tooltip"></div>
  <div id="tut-progress"></div>
  <h2 id="tut-title"></h2>
  <div id="tut-text"></div>
  <button id="tut-prev"></button>
  <button id="tut-next"></button>
`;

beforeEach(() => {
  _resetForTests();
  document.body.innerHTML = FIXTURE;
});

describe('startTutorial', () => {
  it('Step 0 wird gerendert + overlay.active', () => {
    startTutorial();
    expect(_getCurrentStep()).toBe(0);
    expect(document.getElementById('tutorial-overlay')!.classList.contains('active')).toBe(true);
    expect(document.getElementById('tut-title')!.textContent).toContain('Willkommen');
  });

  it('closeHelp callback wird gerufen wenn vorhanden', () => {
    const closeHelp = vi.fn();
    startTutorial({ closeHelp });
    expect(closeHelp).toHaveBeenCalledOnce();
  });

  it('progress zeigt 1 / N', () => {
    startTutorial();
    expect(document.getElementById('tut-progress')!.textContent).toBe('1 / ' + TUT_STEP_COUNT);
  });

  it('prev hidden auf Step 0', () => {
    startTutorial();
    expect((document.getElementById('tut-prev') as HTMLElement).style.display).toBe('none');
  });
});

describe('tutNav', () => {
  it('next: Step 0 → 1', () => {
    startTutorial();
    tutNav(1);
    expect(_getCurrentStep()).toBe(1);
    expect(document.getElementById('tut-progress')!.textContent).toBe('2 / ' + TUT_STEP_COUNT);
  });

  it('prev: Step 1 → 0', () => {
    startTutorial();
    tutNav(1);
    tutNav(-1);
    expect(_getCurrentStep()).toBe(0);
  });

  it('clamp at 0', () => {
    startTutorial();
    tutNav(-5);
    expect(_getCurrentStep()).toBe(0);
  });

  it('clamp at last step', () => {
    startTutorial();
    tutNav(99);
    expect(_getCurrentStep()).toBe(TUT_STEP_COUNT - 1);
    expect(document.getElementById('tut-next')!.textContent).toContain('Fertig');
  });

  it('letzter Step: prev sichtbar', () => {
    startTutorial();
    tutNav(99);
    expect((document.getElementById('tut-prev') as HTMLElement).style.display).toBe('block');
  });
});

describe('endTutorial', () => {
  it('overlay.active entfernt + highlight hidden', () => {
    startTutorial();
    endTutorial();
    expect(document.getElementById('tutorial-overlay')!.classList.contains('active')).toBe(false);
    expect((document.getElementById('tut-highlight') as HTMLElement).style.display).toBe('none');
  });

  it('ohne overlay: kein crash', () => {
    document.body.innerHTML = '';
    expect(() => endTutorial()).not.toThrow();
  });
});

describe('renderTutStep', () => {
  it('mit target-Element: highlight gesetzt', () => {
    document.body.innerHTML += '<div id="left-panel" style="position:absolute;left:10px;top:10px;width:200px;height:300px"></div>';
    _resetForTests();
    tutNav(2); // Step 2 hat target=#left-panel
    expect((document.getElementById('tut-highlight') as HTMLElement).style.display).toBe('block');
  });

  it('ohne target: tooltip zentriert, highlight hidden', () => {
    startTutorial(); // Step 0 hat target=null
    expect((document.getElementById('tut-highlight') as HTMLElement).style.display).toBe('none');
    expect((document.getElementById('tut-tooltip') as HTMLElement).style.display).toBe('block');
  });

  it('renderTutStep mit invalid step: no-op (kein crash)', () => {
    _resetForTests();
    // overschreibe interne _step über tutNav
    tutNav(99);
    tutNav(99); // bleibt am letzten
    expect(() => renderTutStep()).not.toThrow();
  });
});
