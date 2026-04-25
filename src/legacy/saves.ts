/**
 * P17.8 — Save-Family extrahiert aus index.html:5224-5244 + 9438-9482.
 *
 * Section A — Local-Save (synchron, IndexedDB-bzw-localStorage-via-Bridge):
 *   saveProj, updateSavedUI, delSave
 *
 * Section B — User-Templates (async, Cloud via Supabase REST):
 *   saveAsUserTemplate, doSaveUserTemplate
 *
 * Beide Sections nutzen DI-Closure-Wrapping in main.ts. Section B's
 * Module-Cache (`_userTemplatesCache`, `_userTemplatesLoadedAt`) lebt
 * weiter inline-script-seitig (nur dort gelesen von `loadUserTemplates`,
 * was später ein eigenes P17-Modul wird) — die Invalidierung kommt via
 * `invalidateTemplatesCache`-Callback in den Deps.
 */

// ── Section A: Local-Save ────────────────────────────────────────────

export interface SavedRecord {
  data: unknown;
  at: number;
}

export interface LocalSaveDeps {
  projName: string;
  getPD: () => unknown;
  localSave: (name: string, data: unknown) => void;
  localLoadAll: () => Record<string, SavedRecord>;
  localDelete: (name: string) => void;
  localCountExcluding: (name: string) => number;
  toast: (msg: string, type?: string) => void;
  /** Optional: Soft-Limit-Check (Free-Tier max 3 Projekte). */
  cscPlan?: { check: (kind: string, count: number) => boolean };
  /** Optional: telemetry hook. */
  cscTelemetry?: { track: (event: string, props: Record<string, unknown>) => void };
}

export function saveProj(deps: LocalSaveDeps): void {
  // P9.6: Soft-Limit-Check (Free-Tier: max 3 Projekte) — abbrechen wenn Plan rejects.
  if (deps.cscPlan) {
    if (!deps.cscPlan.check('projects', deps.localCountExcluding(deps.projName))) return;
  }
  deps.localSave(deps.projName, deps.getPD());
  updateSavedUI(deps);
  deps.toast('💾 Gespeichert: ' + deps.projName, 'g');
  if (deps.cscTelemetry) deps.cscTelemetry.track('project_saved', { target: 'local' });
}

export function updateSavedUI(deps: LocalSaveDeps): void {
  const el = document.getElementById('saved-list');
  if (!el) return;
  const saves = deps.localLoadAll();
  const keys = Object.keys(saves);
  if (!keys.length) {
    el.innerHTML =
      '<div style="font-size:11px;color:var(--tx3);padding:8px">Keine gespeicherten Projekte.</div>';
    return;
  }
  // 1:1 Legacy-innerHTML: data-Embed via JSON.stringify mit <-Escape, onclick-
  // Strings für loadPD/delSave. Refactor weg von innerHTML wäre P17.X future-work.
  el.innerHTML = keys
    .map((k) => {
      const s = saves[k]!;
      return (
        '<div class="sitem" onclick="loadPD(' +
        JSON.stringify(s.data).replace(/</g, '&lt;') +
        ')">' +
        '<div class="ri"><div class="rn">' +
        k +
        '</div><div class="rd">' +
        new Date(s.at).toLocaleString('de-DE') +
        '</div></div>' +
        "<button class=\"sdel\" onclick=\"delSave('" +
        k +
        "');event.stopPropagation()\">🗑</button>" +
        '</div>'
      );
    })
    .join('');
}

export function delSave(name: string, deps: LocalSaveDeps): void {
  deps.localDelete(name);
  updateSavedUI(deps);
}

// ── Section B: User-Templates (Cloud) ────────────────────────────────

export interface TemplateSaveDeps {
  projName: string;
  /** Default-Projektname-Check — wenn true, Vorlage-Name initial leer. */
  isDefaultProjName: (n: string) => boolean;
  /** Canvas-Referenz für thumbnail. fpCv.toDataURL — Caller-provided weil Three-bound. */
  fpCv: HTMLCanvasElement | null;
  getPD: () => { rooms?: Array<{ w: number; d: number }> };
  openM: (id: string) => void;
  closeM: (id: string) => void;
  toast: (msg: string, type?: string) => void;
  // Cloud-Auth-Context
  sbUrl: string;
  sbKey: string;
  sbToken: string | null;
  sbUser: { id?: string } | null;
  /** Cache-Invalidierung. Wird nach erfolgreichem Save gerufen, damit
   *  loadUserTemplates beim nächsten Aufruf neu fetched. */
  invalidateTemplatesCache?: () => void;
  /** Test-injection: fetch-Mock. Default = global fetch. */
  fetchFn?: typeof fetch;
}

export function saveAsUserTemplate(deps: TemplateSaveDeps): void {
  if (!deps.sbToken) {
    deps.toast('Erst einloggen — User-Vorlagen werden in der Cloud gespeichert', 'r');
    return;
  }
  const nameInput = document.getElementById('tpl-save-name') as HTMLInputElement | null;
  const descInput = document.getElementById('tpl-save-desc') as HTMLInputElement | null;
  const tagsInput = document.getElementById('tpl-save-tags') as HTMLInputElement | null;
  if (nameInput) {
    nameInput.value = deps.isDefaultProjName(deps.projName) ? '' : deps.projName;
  }
  if (descInput) descInput.value = '';
  if (tagsInput) tagsInput.value = '';
  deps.openM('m-save-template');
}

export async function doSaveUserTemplate(deps: TemplateSaveDeps): Promise<void> {
  if (!deps.sbToken) {
    deps.toast('Nicht eingeloggt', 'r');
    return;
  }
  const nameInput = document.getElementById('tpl-save-name') as HTMLInputElement | null;
  const descInput = document.getElementById('tpl-save-desc') as HTMLInputElement | null;
  const tagsInput = document.getElementById('tpl-save-tags') as HTMLInputElement | null;
  const name = (nameInput?.value || '').trim();
  if (!name) {
    deps.toast('Name erforderlich', 'r');
    return;
  }
  const desc = (descInput?.value || '').trim();
  const tagsStr = (tagsInput?.value || '').trim();
  const tags = tagsStr ? tagsStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
  // Thumbnail vom 2D-Canvas
  let thumb = '';
  try {
    if (deps.fpCv && typeof deps.fpCv.toDataURL === 'function') {
      thumb = deps.fpCv.toDataURL('image/jpeg', 0.5);
    }
  } catch {
    /* canvas-not-ready oder tainted — nicht-Blocker */
  }
  const data = deps.getPD();
  const totalM2 = ((data.rooms || []) as Array<{ w: number; d: number }>).reduce(
    (s, r) => s + r.w * r.d,
    0,
  );
  const fetchFn = deps.fetchFn ?? fetch;
  try {
    const r = await fetchFn(deps.sbUrl + '/rest/v1/csc_user_templates', {
      method: 'POST',
      headers: {
        apikey: deps.sbKey,
        Authorization: 'Bearer ' + deps.sbToken,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        owner: deps.sbUser?.id,
        name,
        description: desc,
        tags,
        icon: '📋',
        size_label: totalM2 ? totalM2.toFixed(1) + ' m²' : null,
        data,
        thumbnail: thumb,
      }),
    });
    if (r.status === 404 || r.status === 406) {
      deps.toast('❌ Tabelle fehlt — Migration 0004_user_templates.sql einspielen', 'r');
      return;
    }
    if (!r.ok) throw new Error('API ' + r.status);
    deps.closeM('m-save-template');
    if (deps.invalidateTemplatesCache) deps.invalidateTemplatesCache();
    deps.toast('✅ Als Vorlage gespeichert: ' + name, 'g');
  } catch (e) {
    deps.toast('Speichern fehlgeschlagen: ' + (e as Error).message, 'r');
  }
}
