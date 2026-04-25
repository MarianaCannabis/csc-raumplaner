import { describe, it, expect, beforeEach, vi } from 'vitest';
import { openHelpModal, openHelp, closeHelp, showHelpPage } from '../helpModal.js';

const FIXTURE = `
  <div id="help-overlay">
    <div id="hp-start" class="help-page"></div>
    <div id="hp-faq" class="help-page"></div>
    <div id="hp-shortcuts" class="help-page"></div>
    <a class="help-item" data-page="start"></a>
    <a class="help-item" data-page="faq"></a>
    <a class="help-item" data-page="shortcuts"></a>
  </div>
`;

beforeEach(() => {
  document.body.innerHTML = FIXTURE;
});

describe('openHelpModal', () => {
  it('callt openM mit m-help', () => {
    const openM = vi.fn();
    openHelpModal({ openM });
    expect(openM).toHaveBeenCalledWith('m-help');
  });
});

describe('openHelp', () => {
  it('overlay bekommt .open', () => {
    openHelp();
    expect(document.getElementById('help-overlay')!.classList.contains('open')).toBe(true);
  });

  it('default page=start aktiviert', () => {
    openHelp();
    expect(document.getElementById('hp-start')!.classList.contains('active')).toBe(true);
  });

  it('mit page-Argument aktiviert spezifische page', () => {
    openHelp('faq');
    expect(document.getElementById('hp-faq')!.classList.contains('active')).toBe(true);
    expect(document.getElementById('hp-start')!.classList.contains('active')).toBe(false);
  });
});

describe('closeHelp', () => {
  it('overlay verliert .open', () => {
    openHelp();
    closeHelp();
    expect(document.getElementById('help-overlay')!.classList.contains('open')).toBe(false);
  });

  it('ohne overlay: kein crash', () => {
    document.body.innerHTML = '';
    expect(() => closeHelp()).not.toThrow();
  });
});

describe('showHelpPage', () => {
  it('versteckt andere pages, zeigt Ziel-page', () => {
    showHelpPage('shortcuts');
    expect(document.getElementById('hp-shortcuts')!.classList.contains('active')).toBe(true);
    expect(document.getElementById('hp-start')!.classList.contains('active')).toBe(false);
    expect(document.getElementById('hp-faq')!.classList.contains('active')).toBe(false);
  });

  it('aktiviert Sidebar-item via data-page', () => {
    showHelpPage('faq');
    const item = document.querySelector('[data-page="faq"]');
    expect(item!.classList.contains('active')).toBe(true);
  });

  it('unbekannte id: no-op (kein crash)', () => {
    expect(() => showHelpPage('nonexistent')).not.toThrow();
  });
});
