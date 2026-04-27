import { describe, it, expect, beforeEach } from 'vitest';
import { runSelfTest, renderSelfTestResults } from '../selfTest.js';

function setupWorld(opts: {
  bridges?: string[];
  items?: number;
  stairs?: number;
  rules?: number;
  modals?: string[];
  panels?: string[];
  exporters?: string[];
  bimExport?: boolean;
} = {}): void {
  const w = window as unknown as Record<string, unknown>;
  // Bridges
  for (const b of [
    'cscCompliance', 'cscBauantrag', 'cscPricing', 'cscFloors',
    'cscStairs', 'cscBim', 'cscBimUI', 'cscOnboarding',
    'cscKCanG', 'cscStamp', 'cscTouch', 'cscConflictResolver',
  ]) {
    if (!opts.bridges || opts.bridges.includes(b)) w[b] = {};
    else delete w[b];
  }
  // Catalog
  const items = Array.from({ length: opts.items ?? 300 }, (_, i) => ({
    id: 'i' + i,
    type: i < (opts.stairs ?? 5) ? 'stairs' : 'standard',
  }));
  w.cscCatalog = { newItems: items };
  // Compliance
  const ruleArr = Array.from({ length: opts.rules ?? 25 }, (_, i) => ({ id: 'r' + i }));
  w.cscCompliance = { listRules: () => ruleArr };
  // Modals — DOM
  document.body.innerHTML = '';
  for (const id of opts.modals ?? ['m-help', 'm-welcome', 'm-kcang-wizard', 'm-floor-manager']) {
    const div = document.createElement('div');
    div.id = id;
    document.body.appendChild(div);
  }
  // Right-Panel-Tabs
  for (const t of opts.panels ?? ['ai', 'design', 'light', 'save', 'props', 'bim']) {
    const div = document.createElement('div');
    div.id = 'rpanel-' + t;
    document.body.appendChild(div);
  }
  // Exporters
  for (const fn of ['exportToDxf', 'exportGLTF', 'exportToCsv']) {
    if (!opts.exporters || opts.exporters.includes(fn)) w[fn] = () => {};
    else delete w[fn];
  }
  // BIM-Export — cscBimUI muss als Bridge gesetzt sein, damit dieser Pfad
  // gleich aussehen kann.
  if (opts.bimExport !== false) {
    if (!w.cscBimUI) w.cscBimUI = {};
    (w.cscBimUI as { exportIfc?: () => Promise<void> }).exportIfc = async () => {};
  }
}

describe('runSelfTest', () => {
  beforeEach(() => {
    setupWorld();
  });

  it('alle Checks pass mit komplettem Setup', async () => {
    const r = await runSelfTest();
    expect(r.failed).toBe(0);
    expect(r.passed).toBe(r.total);
    expect(r.total).toBe(7);
  });

  it('fail bei fehlender Bridge', async () => {
    setupWorld({ bridges: ['cscCompliance'] }); // nur 1 von 12
    const r = await runSelfTest();
    expect(r.failed).toBeGreaterThan(0);
    const bridges = r.details.find((d) => d.name === 'Window-Bridges');
    expect(bridges?.status).toBe('fail');
    expect(bridges?.error).toMatch(/cscBauantrag/);
  });

  it('fail bei zu wenigen Catalog-Items', async () => {
    setupWorld({ items: 50 });
    const r = await runSelfTest();
    const catalog = r.details.find((d) => d.name === 'Catalog');
    expect(catalog?.status).toBe('fail');
  });

  it('fail bei zu wenigen Compliance-Rules', async () => {
    setupWorld({ rules: 5 });
    const r = await runSelfTest();
    const compliance = r.details.find((d) => d.name === 'Compliance-Rules');
    expect(compliance?.status).toBe('fail');
    expect(compliance?.error).toMatch(/5/);
  });

  it('fail bei fehlendem Modal', async () => {
    setupWorld({ modals: ['m-help'] });
    const r = await runSelfTest();
    const modals = r.details.find((d) => d.name === 'Modal-Templates');
    expect(modals?.status).toBe('fail');
  });

  it('fail bei fehlendem Right-Panel-Tab', async () => {
    setupWorld({ panels: ['ai'] });
    const r = await runSelfTest();
    const panels = r.details.find((d) => d.name === 'Right-Panel-Tabs');
    expect(panels?.status).toBe('fail');
  });

  it('Result-Form: passed/failed/total summieren auf', async () => {
    const r = await runSelfTest();
    expect(r.passed + r.failed).toBe(r.total);
  });

  it('renderSelfTestResults gibt valid HTML mit ✅ wenn alle pass', async () => {
    const r = await runSelfTest();
    const html = renderSelfTestResults(r);
    expect(html).toContain('🩺 Selbsttest');
    expect(html).toContain('✅');
    expect(html).not.toContain('❌');
  });

  it('renderSelfTestResults zeigt ❌ + Fehler bei fail', async () => {
    setupWorld({ rules: 3 });
    const r = await runSelfTest();
    const html = renderSelfTestResults(r);
    expect(html).toContain('❌');
    expect(html).toContain('Compliance-Rules');
  });
});
