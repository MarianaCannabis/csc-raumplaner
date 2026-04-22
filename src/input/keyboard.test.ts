import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { registerGlobalShortcuts } from './keyboard.js';

// jsdom liefert document, addEventListener und KeyboardEvent frei Haus —
// wir brauchen keinen zusätzlichen Setup. Jeder Test registriert frisch
// (mit seinen eigenen Stub-Actions) und disposed sauber am Ende.
let dispose: (() => void) | undefined;

function fireKey(key: string, init: Partial<KeyboardEventInit> = {}) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  document.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  dispose = undefined;
});

afterEach(() => {
  dispose?.();
});

describe('registerGlobalShortcuts', () => {
  test('F1 triggert sowohl Modal- als auch Overlay-Help und prevents default', () => {
    const openHelpModal = vi.fn();
    const openHelp = vi.fn();
    dispose = registerGlobalShortcuts({ openHelpModal, openHelp });

    const e = fireKey('F1');

    expect(openHelpModal).toHaveBeenCalledTimes(1);
    expect(openHelp).toHaveBeenCalledTimes(1);
    expect(e.defaultPrevented).toBe(true);
  });

  test('? verhält sich identisch zu F1 (historische Doppel-Bindung)', () => {
    const openHelpModal = vi.fn();
    const openHelp = vi.fn();
    dispose = registerGlobalShortcuts({ openHelpModal, openHelp });

    fireKey('?');

    expect(openHelpModal).toHaveBeenCalled();
    expect(openHelp).toHaveBeenCalled();
  });

  test('Single-Key-Shortcuts F/V/L/D/N dispatchen die passenden Actions', () => {
    const actions = {
      fitView: vi.fn(),
      selectTool: vi.fn(),
      toggleRuler: vi.fn(),
      toggleDimensions: vi.fn(),
      toggleNoteMode: vi.fn(),
    };
    dispose = registerGlobalShortcuts(actions);

    fireKey('f');
    fireKey('V'); // Groß/Kleinschreibung egal
    fireKey('l');
    fireKey('D');
    fireKey('n');

    expect(actions.fitView).toHaveBeenCalledTimes(1);
    expect(actions.selectTool).toHaveBeenCalledTimes(1);
    expect(actions.toggleRuler).toHaveBeenCalledTimes(1);
    expect(actions.toggleDimensions).toHaveBeenCalledTimes(1);
    expect(actions.toggleNoteMode).toHaveBeenCalledTimes(1);
  });

  test('Shortcuts feuern nicht, wenn das Event-Target ein Input ist', () => {
    const fitView = vi.fn();
    dispose = registerGlobalShortcuts({ fitView });

    // jsdom: append input an document.body, dispatch event von dort
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'f', bubbles: true }),
    );
    document.body.removeChild(input);

    expect(fitView).not.toHaveBeenCalled();
  });

  test('Ctrl+K fokussiert AI; Ctrl+Shift+K fällt NICHT durch zu AI', () => {
    const focusAI = vi.fn();
    const fitView = vi.fn();
    dispose = registerGlobalShortcuts({ focusAI, fitView });

    fireKey('k', { ctrlKey: true });
    expect(focusAI).toHaveBeenCalledTimes(1);

    fireKey('k', { ctrlKey: true, shiftKey: true });
    expect(focusAI).toHaveBeenCalledTimes(1); // unchanged

    // F mit Ctrl triggert fitView nicht (Modifier-Guard)
    fireKey('f', { ctrlKey: true });
    expect(fitView).not.toHaveBeenCalled();
  });

  test('Präsentations-Mode: ArrowRight/Space → next, ArrowLeft → prev, Esc → exit', () => {
    const presentNext = vi.fn();
    const presentPrev = vi.fn();
    const exitPresentation = vi.fn();
    const fitView = vi.fn();
    const isPresenting = vi.fn(() => true);
    dispose = registerGlobalShortcuts({
      isPresenting,
      presentNext,
      presentPrev,
      exitPresentation,
      fitView,
    });

    fireKey('ArrowRight');
    fireKey(' ');
    fireKey('ArrowLeft');
    fireKey('Escape');

    expect(presentNext).toHaveBeenCalledTimes(2);
    expect(presentPrev).toHaveBeenCalledTimes(1);
    expect(exitPresentation).toHaveBeenCalledTimes(1);
    // F/V/L/D/N laufen auch im Präsi-Mode weiter — das entspricht dem
    // Ursprung-Verhalten aus index.html (zwei unabhängige Listener).
    fireKey('f');
    expect(fitView).toHaveBeenCalledTimes(1);
  });

  test('Esc bei offenem Help-Overlay ruft closeHelp (aber return-t nicht)', () => {
    const closeHelp = vi.fn();
    const isHelpOverlayOpen = vi.fn(() => true);
    dispose = registerGlobalShortcuts({ closeHelp, isHelpOverlayOpen });

    fireKey('Escape');

    expect(closeHelp).toHaveBeenCalledTimes(1);
    // Wenn das Overlay geschlossen gemeldet wird, soll closeHelp NICHT feuern
    isHelpOverlayOpen.mockReturnValue(false);
    fireKey('Escape');
    expect(closeHelp).toHaveBeenCalledTimes(1); // unchanged
  });

  test('Dispose entfernt den Listener sauber', () => {
    const fitView = vi.fn();
    const d = registerGlobalShortcuts({ fitView });
    d();
    fireKey('f');
    expect(fitView).not.toHaveBeenCalled();
  });
});
