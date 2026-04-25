import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calcHealthScore,
  renderComplianceBadges,
  showHealthDetails,
  type ComplianceBridgeDeps,
} from '../complianceBridge.js';

const baseDeps = (): ComplianceBridgeDeps => ({
  rooms: [],
  objects: [],
  projMeta: {},
  curFloor: 'eg',
  currentView: '2d',
  realtimeCompliance: true,
  cloudConnected: false,
  autosaveEnabled: false,
  getKCaNGChecklist: () => [],
  wx2cx: (x: number) => x,
  wy2cy: (y: number) => y,
});

describe('calcHealthScore', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="hs-fill"></div><div id="hs-label"></div>';
  });

  it('returns a number 0-100', () => {
    const score = calcHealthScore(baseDeps());
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('updates #hs-fill width und #hs-label text', () => {
    calcHealthScore(baseDeps());
    expect(document.getElementById('hs-fill')!.style.width).toMatch(/%$/);
    expect(document.getElementById('hs-label')!.textContent).toMatch(/%$/);
  });

  it('boosts score wenn cloudConnected + autosaveEnabled', () => {
    const a = calcHealthScore(baseDeps());
    const b = calcHealthScore({ ...baseDeps(), cloudConnected: true, autosaveEnabled: true });
    expect(b).toBeGreaterThan(a);
  });

  it('delegates to registry.metrics.calcHealthScore wenn vorhanden', () => {
    const stub = vi.fn().mockReturnValue({ score: 77 });
    const score = calcHealthScore({
      ...baseDeps(),
      registry: { metrics: { calcHealthScore: stub } },
    });
    expect(score).toBe(77);
    expect(stub).toHaveBeenCalledOnce();
    expect(document.getElementById('hs-label')!.textContent).toBe('77%');
  });

  it('färbt fill grün bei ≥80, gelb bei ≥50, rot sonst', () => {
    // jsdom konvertiert hex auf rgb() beim Read von .style.background.
    // #4ade80 = rgb(74,222,128) · #fbbf24 = rgb(251,191,36) · #f87171 = rgb(248,113,113)
    const stub = (s: number) => vi.fn().mockReturnValue({ score: s });
    const fill = () => (document.getElementById('hs-fill') as HTMLElement).style.background;
    calcHealthScore({ ...baseDeps(), registry: { metrics: { calcHealthScore: stub(85) } } });
    expect(fill()).toBe('rgb(74, 222, 128)'); // grün
    document.body.innerHTML = '<div id="hs-fill"></div><div id="hs-label"></div>';
    calcHealthScore({ ...baseDeps(), registry: { metrics: { calcHealthScore: stub(60) } } });
    expect(fill()).toBe('rgb(251, 191, 36)'); // gelb
    document.body.innerHTML = '<div id="hs-fill"></div><div id="hs-label"></div>';
    calcHealthScore({ ...baseDeps(), registry: { metrics: { calcHealthScore: stub(30) } } });
    expect(fill()).toBe('rgb(248, 113, 113)'); // rot
  });

  it('fällt auf Legacy-Math zurück wenn registry-delegate wirft', () => {
    const stub = vi.fn().mockImplementation(() => { throw new Error('boom'); });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const score = calcHealthScore({
      ...baseDeps(),
      registry: { metrics: { calcHealthScore: stub } },
    });
    expect(Number.isFinite(score)).toBe(true);
    warn.mockRestore();
  });
});

describe('renderComplianceBadges', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="canvas-wrap"></div><div id="hs-fill"></div><div id="hs-label"></div>';
  });

  it('no-op wenn currentView !== "2d"', () => {
    renderComplianceBadges({ ...baseDeps(), currentView: '3d' });
    expect(document.querySelectorAll('.comp-badge').length).toBe(0);
  });

  it('no-op wenn realtimeCompliance disabled', () => {
    renderComplianceBadges({ ...baseDeps(), realtimeCompliance: false });
    expect(document.querySelectorAll('.comp-badge').length).toBe(0);
  });

  it('clears existing badges before re-rendering', () => {
    document.getElementById('canvas-wrap')!.innerHTML =
      '<div class="comp-badge">stale</div>';
    renderComplianceBadges(baseDeps()); // rooms=[], no new badges
    expect(document.querySelectorAll('.comp-badge').length).toBe(0);
  });

  it('rendert ein Badge pro failing rule pro Raum (registry vorhanden)', () => {
    const room = { id: 'r1', x: 0, y: 0, w: 5, d: 5, floorId: 'eg' };
    const evaluateForRoom = vi.fn().mockReturnValue([
      { passed: false, rule: { icon: '🚪', label: 'Notausgang fehlt' } },
      { passed: false, rule: { icon: '🔥', label: 'Feuerlöscher fehlt' } },
      { passed: true, rule: { label: 'OK' } }, // wird gefiltert
    ]);
    renderComplianceBadges({
      ...baseDeps(),
      rooms: [room],
      registry: { evaluateForRoom },
    });
    const badges = document.querySelectorAll('.comp-badge');
    expect(badges.length).toBe(2);
    expect(badges[0]?.textContent).toBe('🚪');
    expect(badges[1]?.textContent).toBe('🔥');
  });

  it('aktualisiert Score auch wenn registry fehlt (race-condition path)', () => {
    renderComplianceBadges({ ...baseDeps() }); // kein registry
    expect(document.getElementById('hs-label')!.textContent).toMatch(/%$/);
  });
});

describe('showHealthDetails', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="hs-fill"></div><div id="hs-label"></div>';
  });

  it('calls addMsg + showRight mit dem Score', () => {
    const addMsg = vi.fn();
    const showRight = vi.fn();
    showHealthDetails({ ...baseDeps(), addMsg, showRight });
    expect(addMsg).toHaveBeenCalledOnce();
    const [msg, kind] = addMsg.mock.calls[0]!;
    expect(msg).toMatch(/%/);
    expect(kind).toBe('sys');
    expect(showRight).toHaveBeenCalledExactlyOnceWith('ai');
  });

  it('listet bis zu 5 fehlende Anforderungen', () => {
    const addMsg = vi.fn();
    const checklist = [
      { passed: false, label: 'A' },
      { passed: false, label: 'B' },
      { passed: false, label: 'C' },
      { passed: false, label: 'D' },
      { passed: false, label: 'E' },
      { passed: false, label: 'F' }, // wird abgeschnitten
    ];
    showHealthDetails({
      ...baseDeps(),
      getKCaNGChecklist: () => checklist,
      addMsg,
    });
    const msg = addMsg.mock.calls[0]![0] as string;
    expect(msg).toMatch(/A/);
    expect(msg).toMatch(/E/);
    expect(msg).not.toMatch(/F/);
  });

  it('zeigt "alle erfüllt" wenn keine missing', () => {
    const addMsg = vi.fn();
    showHealthDetails({
      ...baseDeps(),
      getKCaNGChecklist: () => [{ passed: true, label: 'X' }],
      addMsg,
    });
    const msg = addMsg.mock.calls[0]![0] as string;
    expect(msg).toMatch(/erfüllt/);
  });
});
