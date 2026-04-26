import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  openVisualHistoryModal,
  closeVisualHistoryModal,
  setMode,
  selectForCompare,
  _resetForTests,
  _getMode,
  type VisualHistoryUIDeps,
} from '../visualHistoryUI.js';
import { pushVisualHistory, clearVisualHistoryForTests } from '../changelog.js';

const mkDeps = (overrides: Partial<VisualHistoryUIDeps> = {}): VisualHistoryUIDeps => ({
  restoreFromIndex: vi.fn(),
  toast: vi.fn(),
  ...overrides,
});

function mkCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 200;
  c.height = 100;
  // Mock getContext für jsdom
  (c as unknown as { getContext: () => unknown }).getContext = () => ({
    drawImage: () => {},
  });
  c.toDataURL = () => 'data:image/jpeg;base64,FAKE_THUMB';
  return c;
}

function pushNSnapshots(n: number, baseRooms = 0): void {
  for (let i = 0; i < n; i++) {
    const cv = mkCanvas();
    const state = JSON.stringify({
      rooms: Array.from({ length: baseRooms + i }, (_, k) => ({ id: 'r' + k })),
      objects: [],
      walls: [],
      measures: [],
    });
    pushVisualHistory(state, { fpCv: cv });
  }
}

beforeEach(() => {
  _resetForTests();
  clearVisualHistoryForTests();
  document.body.innerHTML = '';
  // jsdom canvas-Mock für pushVisualHistory (analog zu changelog.test.ts) —
  // pushVisualHistory erzeugt internal ein Canvas via createElement und
  // ruft getContext('2d'), das in jsdom default null returnt.
  (HTMLCanvasElement.prototype as unknown as { getContext: () => unknown }).getContext = () => ({
    drawImage: () => {},
  });
  HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,FAKE';
});

describe('openVisualHistoryModal', () => {
  it('öffnet Modal: display=flex + open-class', () => {
    pushNSnapshots(1);
    openVisualHistoryModal(mkDeps());
    const overlay = document.getElementById('m-visual-history');
    expect(overlay).not.toBeNull();
    expect(overlay!.style.display).toBe('flex');
    expect(overlay!.classList.contains('open')).toBe(true);
  });

  it('Empty changelog: zeigt "Noch keine Snapshots"', () => {
    openVisualHistoryModal(mkDeps());
    const html = document.getElementById('vh-content')!.innerHTML;
    expect(html).toContain('Noch keine Snapshots vorhanden');
  });

  it('Default-Mode: slider', () => {
    pushNSnapshots(2);
    openVisualHistoryModal(mkDeps());
    expect(_getMode()).toBe('slider');
    expect(document.querySelector('.vh-slider')).not.toBeNull();
  });
});

describe('setMode', () => {
  it('grid: rendert Grid-Container', () => {
    pushNSnapshots(3);
    const deps = mkDeps();
    openVisualHistoryModal(deps);
    setMode('grid', deps);
    expect(_getMode()).toBe('grid');
    expect(document.querySelector('.vh-grid')).not.toBeNull();
  });

  it('compare ohne Selection: zeigt Hint + Mini-Slider', () => {
    pushNSnapshots(2);
    const deps = mkDeps();
    openVisualHistoryModal(deps);
    setMode('compare', deps);
    const html = document.getElementById('vh-content')!.innerHTML;
    expect(html).toContain('Wähle einen Snapshot');
    expect(document.querySelector('.vh-mini-slider')).not.toBeNull();
  });

  it('Mode-Wechsel über die Buttons', () => {
    pushNSnapshots(1);
    const deps = mkDeps();
    openVisualHistoryModal(deps);
    expect(_getMode()).toBe('slider');
    document.getElementById('vh-mode-grid')!.click();
    expect(_getMode()).toBe('grid');
    document.getElementById('vh-mode-compare')!.click();
    expect(_getMode()).toBe('compare');
  });
});

describe('selectForCompare', () => {
  it('mit Selection: 2 Thumbnails sichtbar + Diff-Counter', () => {
    pushNSnapshots(3, 1); // 1, 2, 3 rooms
    const deps = mkDeps();
    openVisualHistoryModal(deps);
    selectForCompare(0, deps); // ältester
    const html = document.getElementById('vh-content')!.innerHTML;
    expect(html).toContain('Räume:');
    // Newest (idx 2) hat 3 rooms, selected (idx 0) hat 1 → diff +2
    expect(html).toContain('+2');
    // Sollte 2 img-Tags haben (selected + newest)
    expect(document.querySelectorAll('#vh-content img').length).toBeGreaterThanOrEqual(2);
  });

  it('rendert Diff-Counter mit identisch wenn keine Diff', () => {
    pushNSnapshots(2, 5); // beide haben 5+i rooms
    const deps = mkDeps();
    openVisualHistoryModal(deps);
    selectForCompare(1, deps); // identisch zum newest (idx 1)
    const html = document.getElementById('vh-content')!.innerHTML;
    expect(html).toContain('identisch');
  });
});

describe('Card-Click → Compare', () => {
  it('Click auf Slider-Card: switcht zu compare-Mode mit selectedIdx', () => {
    pushNSnapshots(3);
    const deps = mkDeps();
    openVisualHistoryModal(deps);
    const card = document.querySelector('.vh-card[data-vh-idx="0"]') as HTMLElement;
    expect(card).not.toBeNull();
    card.click();
    expect(_getMode()).toBe('compare');
  });
});

describe('Restore-Button', () => {
  it('Click ruft deps.restoreFromIndex(idx)', () => {
    pushNSnapshots(2);
    const deps = mkDeps();
    openVisualHistoryModal(deps);
    selectForCompare(0, deps);
    const restore = document.getElementById('vh-restore') as HTMLButtonElement;
    restore.click();
    expect(deps.restoreFromIndex).toHaveBeenCalledWith(0);
  });

  it('schließt Modal nach Restore', () => {
    pushNSnapshots(1);
    const deps = mkDeps();
    openVisualHistoryModal(deps);
    selectForCompare(0, deps);
    document.getElementById('vh-restore')!.click();
    const overlay = document.getElementById('m-visual-history');
    expect(overlay!.style.display).toBe('none');
  });

  it('Cancel-Button: zurück zu slider-Mode', () => {
    pushNSnapshots(2);
    const deps = mkDeps();
    openVisualHistoryModal(deps);
    selectForCompare(1, deps);
    document.getElementById('vh-cancel')!.click();
    expect(_getMode()).toBe('slider');
  });
});

describe('closeVisualHistoryModal', () => {
  it('display=none + open-class entfernt', () => {
    pushNSnapshots(1);
    openVisualHistoryModal(mkDeps());
    closeVisualHistoryModal();
    const overlay = document.getElementById('m-visual-history');
    expect(overlay!.style.display).toBe('none');
    expect(overlay!.classList.contains('open')).toBe(false);
  });

  it('Header-Close-Button schließt', () => {
    pushNSnapshots(1);
    openVisualHistoryModal(mkDeps());
    document.getElementById('vh-close')!.click();
    expect(document.getElementById('m-visual-history')!.style.display).toBe('none');
  });
});
