import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toggleTBMenu, closeTBMenu, getOpenMenu, _resetForTests } from '../tbMenu.js';

const FIXTURE = `
  <div id="tbm-file"><button class="tbm-btn" aria-expanded="false">📁 Datei</button></div>
  <div id="tbmd-file" class="tbm-drop"></div>
  <div id="tbm-view"><button class="tbm-btn" aria-expanded="false">👁 Ansicht</button></div>
  <div id="tbmd-view" class="tbm-drop"></div>
  <div id="tbm-share"><button class="tbm-btn" aria-expanded="false">📤 Teilen</button></div>
  <div id="tbmd-share" class="tbm-drop"></div>
`;

beforeEach(() => {
  _resetForTests();
  document.body.innerHTML = FIXTURE;
});

describe('toggleTBMenu', () => {
  it('öffnet Menu + setzt .open + aria-expanded=true', () => {
    toggleTBMenu('file');
    expect(getOpenMenu()).toBe('file');
    expect(document.getElementById('tbmd-file')!.classList.contains('open')).toBe(true);
    const btn = document.querySelector('#tbm-file .tbm-btn') as HTMLButtonElement;
    expect(btn.classList.contains('open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('zweiter Klick auf gleiches Menu: schließt es', () => {
    toggleTBMenu('file');
    toggleTBMenu('file');
    expect(getOpenMenu()).toBeNull();
    expect(document.getElementById('tbmd-file')!.classList.contains('open')).toBe(false);
  });

  it('anderes Menu öffnen: erstes wird geschlossen', () => {
    toggleTBMenu('file');
    toggleTBMenu('view');
    expect(getOpenMenu()).toBe('view');
    expect(document.getElementById('tbmd-file')!.classList.contains('open')).toBe(false);
    expect(document.getElementById('tbmd-view')!.classList.contains('open')).toBe(true);
  });

  it('updateMenuActiveStates-Callback wird gerufen wenn vorhanden', () => {
    const updateMenuActiveStates = vi.fn();
    toggleTBMenu('file', { updateMenuActiveStates });
    expect(updateMenuActiveStates).toHaveBeenCalledOnce();
  });

  it('unbekannte id: no-op (kein _openMenu-Update)', () => {
    toggleTBMenu('nonexistent');
    expect(getOpenMenu()).toBeNull();
  });
});

describe('closeTBMenu', () => {
  it('schließt offenes Menu', () => {
    toggleTBMenu('file');
    closeTBMenu();
    expect(getOpenMenu()).toBeNull();
    expect(document.querySelectorAll('.tbm-drop.open').length).toBe(0);
  });

  it('aria-expanded zurückgesetzt auf alle Buttons', () => {
    toggleTBMenu('file');
    closeTBMenu();
    document.querySelectorAll('.tbm-btn[aria-expanded]').forEach((b) => {
      expect(b.getAttribute('aria-expanded')).toBe('false');
    });
  });

  it('mehrere offene Menus (edge): alle geschlossen', () => {
    // Direkt manipulieren um den edge-case zu simulieren
    document.querySelectorAll('.tbm-drop').forEach((d) => d.classList.add('open'));
    closeTBMenu();
    expect(document.querySelectorAll('.tbm-drop.open').length).toBe(0);
  });
});
