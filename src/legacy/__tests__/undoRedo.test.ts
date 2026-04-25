import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  pushSnapshot,
  undo,
  redo,
  canUndo,
  canRedo,
  getStackSize,
  getCurrentIdx,
  setUpdateButtonsCallback,
  _resetForTests,
  MAX_HISTORY_LIMIT,
} from '../undoRedo.js';

beforeEach(() => {
  _resetForTests();
});

describe('pushSnapshot', () => {
  it('initialer push: stack=1, idx=0, canUndo=false, canRedo=false', () => {
    pushSnapshot('a');
    expect(getStackSize()).toBe(1);
    expect(getCurrentIdx()).toBe(0);
    expect(canUndo()).toBe(false);
    expect(canRedo()).toBe(false);
  });

  it('zweite push: stack=2, idx=1, canUndo=true', () => {
    pushSnapshot('a');
    pushSnapshot('b');
    expect(getStackSize()).toBe(2);
    expect(canUndo()).toBe(true);
    expect(canRedo()).toBe(false);
  });

  it('updateButtons-Callback feuert pro push', () => {
    const fn = vi.fn();
    setUpdateButtonsCallback(fn);
    pushSnapshot('a');
    pushSnapshot('b');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('MAX_HISTORY: 51. push verwirft den ältesten', () => {
    for (let i = 0; i < MAX_HISTORY_LIMIT + 5; i++) pushSnapshot(String(i));
    expect(getStackSize()).toBe(MAX_HISTORY_LIMIT);
  });

  it('push nach undo verwirft Redo-Future', () => {
    pushSnapshot('a');
    pushSnapshot('b');
    pushSnapshot('c');
    expect(undo()).toBe('b');
    expect(undo()).toBe('a');
    pushSnapshot('d');
    expect(getStackSize()).toBe(2); // ['a', 'd']
    expect(canRedo()).toBe(false);
  });
});

describe('undo / redo', () => {
  it('undo bei idx<=0: returnt null, idx unverändert', () => {
    pushSnapshot('a');
    expect(undo()).toBeNull();
    expect(getCurrentIdx()).toBe(0);
  });

  it('undo nach 3 push: state = vorvorletzter', () => {
    pushSnapshot('a');
    pushSnapshot('b');
    pushSnapshot('c');
    expect(undo()).toBe('b');
    expect(undo()).toBe('a');
  });

  it('redo nach undo: state = der vor-undo-state', () => {
    pushSnapshot('a');
    pushSnapshot('b');
    undo(); // idx=0, state='a'
    expect(redo()).toBe('b');
  });

  it('redo bei top: null', () => {
    pushSnapshot('a');
    expect(redo()).toBeNull();
  });

  it('undo→redo→undo→redo Zyklus konsistent', () => {
    pushSnapshot('a');
    pushSnapshot('b');
    expect(undo()).toBe('a');
    expect(redo()).toBe('b');
    expect(undo()).toBe('a');
    expect(redo()).toBe('b');
  });

  it('updateButtons feuert auch bei undo + redo', () => {
    const fn = vi.fn();
    pushSnapshot('a');
    pushSnapshot('b');
    setUpdateButtonsCallback(fn);
    undo();
    redo();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('canUndo / canRedo', () => {
  it('leerer Stack: beide false', () => {
    expect(canUndo()).toBe(false);
    expect(canRedo()).toBe(false);
  });

  it('1 Element: canUndo=false (kein vorheriger state)', () => {
    pushSnapshot('a');
    expect(canUndo()).toBe(false);
  });

  it('Mitte des Stacks: beide true', () => {
    pushSnapshot('a');
    pushSnapshot('b');
    pushSnapshot('c');
    undo(); // idx=1
    expect(canUndo()).toBe(true);
    expect(canRedo()).toBe(true);
  });
});
