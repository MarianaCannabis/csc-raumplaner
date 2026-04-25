import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  logChange,
  getChangelog,
  loadChangelog,
  clearChangelog,
  showChangelog,
  pushVisualHistory,
  openVisualHistory,
  restoreFromVisualHistory,
  getVisualHistorySize,
  clearVisualHistoryForTests,
} from '../changelog.js';

// jsdom liefert kein echtes 2d-Context. Wir mocken auf Prototype-Ebene
// damit ALLE canvases (auch die intern in pushVisualHistory erzeugten)
// betroffen sind.
const origGetContext = HTMLCanvasElement.prototype.getContext;
const origToDataURL = HTMLCanvasElement.prototype.toDataURL;

beforeEach(() => {
  (HTMLCanvasElement.prototype as unknown as { getContext: () => unknown }).getContext = () => ({
    drawImage: () => {},
  });
  HTMLCanvasElement.prototype.toDataURL = () => 'data:image/jpeg;base64,FAKE';
  clearChangelog();
  clearVisualHistoryForTests();
  localStorage.clear();
  document.body.innerHTML = '';
});

function makeMockCanvas(w = 800, h = 600): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  return cv;
}

describe('Changelog (Section A)', () => {
  const baseDeps = { rooms: { length: 0 }, objects: { length: 0 }, curFloor: 'eg' };

  it('logChange unshift (newest first)', () => {
    logChange('first', baseDeps);
    logChange('second', baseDeps);
    expect(getChangelog()[0]?.msg).toBe('second');
    expect(getChangelog()[1]?.msg).toBe('first');
  });

  it('Max 50 Einträge: 51. cap der älteste', () => {
    for (let i = 0; i < 55; i++) logChange('msg' + i, baseDeps);
    expect(getChangelog().length).toBe(50);
    // Erste/neueste = msg54, letzte/älteste = msg5 (msg0-4 wurden gepoppt)
    expect(getChangelog()[0]?.msg).toBe('msg54');
    expect(getChangelog()[49]?.msg).toBe('msg5');
  });

  it('localStorage Persistenz', () => {
    logChange('persist-test', { rooms: { length: 3 }, objects: { length: 7 }, curFloor: 'og' });
    const stored = localStorage.getItem('csc-changelog');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed[0].msg).toBe('persist-test');
    expect(parsed[0].rooms).toBe(3);
    expect(parsed[0].floor).toBe('og');
  });

  it('loadChangelog populates aus localStorage', () => {
    localStorage.setItem('csc-changelog', JSON.stringify([{ ts: 1, msg: 'restored', rooms: 0, objects: 0, floor: 'eg' }]));
    clearVisualHistoryForTests(); // clear in-memory
    loadChangelog();
    expect(getChangelog()[0]?.msg).toBe('restored');
  });

  it('clearChangelog leert Cache + localStorage', () => {
    logChange('test', baseDeps);
    expect(localStorage.getItem('csc-changelog')).toBeTruthy();
    clearChangelog();
    expect(getChangelog().length).toBe(0);
    expect(localStorage.getItem('csc-changelog')).toBeNull();
  });

  it('showChangelog leer: zeigt "Noch keine Änderungen"', () => {
    document.body.innerHTML = '<div id="changelog-list"></div>';
    const openM = vi.fn();
    showChangelog({ openM });
    expect(document.getElementById('changelog-list')!.innerHTML).toContain('Noch keine');
    expect(openM).toHaveBeenCalledWith('m-changelog');
  });

  it('showChangelog mit Einträgen: rendert .changelog-entry-Divs', () => {
    document.body.innerHTML = '<div id="changelog-list"></div>';
    logChange('Raum hinzugefügt', baseDeps);
    logChange('Möbel rotiert', baseDeps);
    showChangelog({ openM: vi.fn() });
    const html = document.getElementById('changelog-list')!.innerHTML;
    expect(html).toContain('Raum hinzugefügt');
    expect(html).toContain('Möbel rotiert');
    expect(document.querySelectorAll('.changelog-entry').length).toBe(2);
  });

  it('showChangelog ohne #changelog-list: nur openM', () => {
    const openM = vi.fn();
    showChangelog({ openM });
    expect(openM).toHaveBeenCalledWith('m-changelog');
  });
});

describe('Visual-History (Section B)', () => {
  it('pushVisualHistory ohne fpCv: no-op', () => {
    pushVisualHistory('state', { fpCv: null });
    expect(getVisualHistorySize()).toBe(0);
  });

  it('pushVisualHistory mit fpCv: speichert thumb', () => {
    const cv = makeMockCanvas();
    pushVisualHistory('state-1', { fpCv: cv });
    expect(getVisualHistorySize()).toBe(1);
  });

  it('Max 50: 51. cap der älteste', () => {
    const cv = makeMockCanvas(100, 100);
    for (let i = 0; i < 55; i++) pushVisualHistory('s' + i, { fpCv: cv });
    expect(getVisualHistorySize()).toBe(50);
  });

  it('openVisualHistory leerer Stack: zeigt "Noch kein Verlauf"', () => {
    const openM = vi.fn();
    openVisualHistory({ openM });
    const grid = document.getElementById('visual-history-grid');
    expect(grid).not.toBeNull();
    expect(grid!.innerHTML).toContain('Noch kein Verlauf');
    expect(openM).toHaveBeenCalledWith('m-visual-history');
  });

  it('openVisualHistory mit Einträgen: rendert thumbnails (newest first)', () => {
    const cv = makeMockCanvas(100, 100);
    pushVisualHistory('s1', { fpCv: cv });
    pushVisualHistory('s2', { fpCv: cv });
    openVisualHistory({ openM: vi.fn() });
    const html = document.getElementById('visual-history-grid')!.innerHTML;
    expect(html).toContain('<img');
    expect(html).toContain('#2'); // newest is #2
  });

  it('restoreFromVisualHistory: ruft restoreSnapshot + closeM + toast', () => {
    const cv = makeMockCanvas(100, 100);
    pushVisualHistory('STATE_X', { fpCv: cv });
    const restoreSnapshot = vi.fn();
    const closeM = vi.fn();
    const toast = vi.fn();
    restoreFromVisualHistory(0, { restoreSnapshot, closeM, toast });
    expect(restoreSnapshot).toHaveBeenCalledWith('STATE_X');
    expect(closeM).toHaveBeenCalledWith('m-visual-history');
    expect(toast).toHaveBeenCalledWith(expect.stringContaining('Snapshot'), 'g');
  });

  it('restoreFromVisualHistory invalid idx: no-op', () => {
    const restoreSnapshot = vi.fn();
    restoreFromVisualHistory(99, {
      restoreSnapshot,
      closeM: vi.fn(),
      toast: vi.fn(),
    });
    expect(restoreSnapshot).not.toHaveBeenCalled();
  });
});
