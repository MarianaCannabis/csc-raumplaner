import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveProj,
  updateSavedUI,
  delSave,
  saveAsUserTemplate,
  doSaveUserTemplate,
  type LocalSaveDeps,
  type TemplateSaveDeps,
} from '../saves.js';

// ── Section A: Local-Save ────────────────────────────────────────────

const localDeps = (overrides: Partial<LocalSaveDeps> = {}): LocalSaveDeps => ({
  projName: 'TestProj',
  getPD: () => ({ rooms: [{ id: 'r1' }] }),
  localSave: vi.fn(),
  localLoadAll: () => ({}),
  localDelete: vi.fn(),
  localCountExcluding: () => 0,
  toast: vi.fn(),
  ...overrides,
});

describe('saveProj', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="saved-list"></div>';
  });

  it('happy-path: localSave called + toast + telemetry', () => {
    const cscTelemetry = { track: vi.fn() };
    const deps = localDeps({ cscTelemetry });
    saveProj(deps);
    expect(deps.localSave).toHaveBeenCalledWith('TestProj', { rooms: [{ id: 'r1' }] });
    expect(deps.toast).toHaveBeenCalledWith('💾 Gespeichert: TestProj', 'g');
    expect(cscTelemetry.track).toHaveBeenCalledWith('project_saved', { target: 'local' });
  });

  it('cscPlan.check=false: localSave NICHT called, kein toast', () => {
    const cscPlan = { check: vi.fn().mockReturnValue(false) };
    const deps = localDeps({ cscPlan });
    saveProj(deps);
    expect(deps.localSave).not.toHaveBeenCalled();
    expect(deps.toast).not.toHaveBeenCalled();
  });

  it('ohne cscTelemetry: kein Crash', () => {
    expect(() => saveProj(localDeps())).not.toThrow();
  });
});

describe('updateSavedUI', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="saved-list"></div>';
  });

  it('leere saves: zeigt "Keine gespeicherten Projekte"', () => {
    updateSavedUI(localDeps());
    expect(document.getElementById('saved-list')!.innerHTML).toContain('Keine gespeicherten');
  });

  it('mit 2 saves: rendert 2 .sitem-Divs', () => {
    const deps = localDeps({
      localLoadAll: () => ({
        A: { data: { x: 1 }, at: 1700000000000 },
        B: { data: { x: 2 }, at: 1700000000001 },
      }),
    });
    updateSavedUI(deps);
    expect(document.querySelectorAll('#saved-list .sitem').length).toBe(2);
    expect(document.getElementById('saved-list')!.innerHTML).toContain('A');
    expect(document.getElementById('saved-list')!.innerHTML).toContain('B');
  });

  it('ohne #saved-list: no-op', () => {
    document.body.innerHTML = '';
    expect(() => updateSavedUI(localDeps())).not.toThrow();
  });
});

describe('delSave', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="saved-list"></div>';
  });

  it('ruft localDelete + updateSavedUI', () => {
    const deps = localDeps();
    delSave('foo', deps);
    expect(deps.localDelete).toHaveBeenCalledWith('foo');
    // updateSavedUI rendert "Keine gespeicherten" (loadAll returnt {})
    expect(document.getElementById('saved-list')!.innerHTML).toContain('Keine gespeicherten');
  });
});

// ── Section B: User-Templates ────────────────────────────────────────

const FIXTURE_TPL = `
  <input id="tpl-save-name" />
  <input id="tpl-save-desc" />
  <input id="tpl-save-tags" />
`;

const tplDeps = (overrides: Partial<TemplateSaveDeps> = {}): TemplateSaveDeps => ({
  projName: 'MyProj',
  isDefaultProjName: (n) => n === 'Neue Ausgabestelle',
  fpCv: null,
  getPD: () => ({ rooms: [{ w: 4, d: 3 }] }),
  openM: vi.fn(),
  closeM: vi.fn(),
  toast: vi.fn(),
  sbUrl: 'https://demo.supabase.co',
  sbKey: 'anon-xyz',
  sbToken: 'tok-abc',
  sbUser: { id: 'user-1' },
  ...overrides,
});

describe('saveAsUserTemplate', () => {
  beforeEach(() => {
    document.body.innerHTML = FIXTURE_TPL;
  });

  it('ohne Token: toast-Hinweis, kein openM', () => {
    const deps = tplDeps({ sbToken: null });
    saveAsUserTemplate(deps);
    expect(deps.toast).toHaveBeenCalledWith(expect.stringContaining('Erst einloggen'), 'r');
    expect(deps.openM).not.toHaveBeenCalled();
  });

  it('mit Token: setzt #tpl-save-name auf projName, öffnet Modal', () => {
    const deps = tplDeps({ projName: 'CoolProj' });
    saveAsUserTemplate(deps);
    expect((document.getElementById('tpl-save-name') as HTMLInputElement).value).toBe('CoolProj');
    expect(deps.openM).toHaveBeenCalledWith('m-save-template');
  });

  it('mit Default-projName: leerer Name', () => {
    const deps = tplDeps({ projName: 'Neue Ausgabestelle' });
    saveAsUserTemplate(deps);
    expect((document.getElementById('tpl-save-name') as HTMLInputElement).value).toBe('');
  });
});

describe('doSaveUserTemplate', () => {
  beforeEach(() => {
    document.body.innerHTML = FIXTURE_TPL;
  });

  it('leerer name: toast "Name erforderlich", kein fetch', async () => {
    const fetchFn = vi.fn();
    (document.getElementById('tpl-save-name') as HTMLInputElement).value = '';
    const deps = tplDeps({ fetchFn: fetchFn as unknown as typeof fetch });
    await doSaveUserTemplate(deps);
    expect(deps.toast).toHaveBeenCalledWith('Name erforderlich', 'r');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('happy: fetch POST mit owner/name/data/thumbnail', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    const invalidateTemplatesCache = vi.fn();
    (document.getElementById('tpl-save-name') as HTMLInputElement).value = 'My Template';
    (document.getElementById('tpl-save-desc') as HTMLInputElement).value = 'Eine Beschreibung';
    (document.getElementById('tpl-save-tags') as HTMLInputElement).value = 'cafe, wohnzimmer';
    const deps = tplDeps({
      fetchFn: fetchFn as unknown as typeof fetch,
      invalidateTemplatesCache,
    });
    await doSaveUserTemplate(deps);
    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toContain('/rest/v1/csc_user_templates');
    expect((init as RequestInit).method).toBe('POST');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.name).toBe('My Template');
    expect(body.owner).toBe('user-1');
    expect(body.tags).toEqual(['cafe', 'wohnzimmer']);
    expect(body.size_label).toMatch(/m²/);
    expect(deps.toast).toHaveBeenCalledWith(expect.stringContaining('gespeichert'), 'g');
    expect(deps.closeM).toHaveBeenCalledWith('m-save-template');
    expect(invalidateTemplatesCache).toHaveBeenCalledOnce();
  });

  it('404/406: Migrations-Hinweis-Toast', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    (document.getElementById('tpl-save-name') as HTMLInputElement).value = 'X';
    const deps = tplDeps({ fetchFn: fetchFn as unknown as typeof fetch });
    await doSaveUserTemplate(deps);
    expect(deps.toast).toHaveBeenCalledWith(expect.stringContaining('Migration 0004'), 'r');
  });

  it('ohne Token: toast "Nicht eingeloggt"', async () => {
    const fetchFn = vi.fn();
    const deps = tplDeps({ sbToken: null, fetchFn: fetchFn as unknown as typeof fetch });
    await doSaveUserTemplate(deps);
    expect(deps.toast).toHaveBeenCalledWith('Nicht eingeloggt', 'r');
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
