// Roadmap-v3.0-Test (v2.8.1) — Standalone Test-Runner.
// Pure vanilla JS, keine Build-Schritt. Liegt unter /public, deployt
// mit GitHub-Pages parallel zu index.html. Lädt App in iframe und
// nutzt direct window-access (gleicher Origin).

const STORAGE_KEY = 'csc-test-v2.8.1';

// ── State ─────────────────────────────────────────────────────────────
const state = {
  autoResults: [],
  manualStatus: {},   // { itemId: 'ok' | 'issue' | undefined }
  manualNotes: {},    // { itemId: string }
  bootError: null,
};

function load() {
  try { Object.assign(state, JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')); }
  catch { /* fresh */ }
}
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota */ }
}

// ── Auto-Tests Definition ─────────────────────────────────────────────
// Jeder Test bekommt das iframe-window und gibt {pass, detail, error?}
const AUTO_TESTS = [
  {
    id: 'boot-no-error',
    name: 'Boot ohne JS-Errors',
    run: (win) => {
      const errs = win.__testCapturedErrors || [];
      return {
        pass: errs.length === 0,
        detail: errs.length === 0 ? 'keine Fehler' : `${errs.length} Errors`,
        error: errs.length ? errs.slice(0, 3).map((e) => e.message || String(e)).join(' | ') : null,
      };
    },
  },
  {
    id: 'window-bridges',
    name: 'Window-Bridges (14 erwartet)',
    run: (win) => {
      const expected = [
        'cscCompliance', 'cscBauantrag', 'cscPricing', 'cscFloors',
        'cscStairs', 'cscBim', 'cscBimUI', 'cscOnboarding', 'cscKCanG',
        'cscStamp', 'cscTouch', 'cscConflictResolver', 'cscCollab', 'cscPdfPages',
      ];
      const missing = expected.filter((b) => typeof win[b] === 'undefined');
      return {
        pass: missing.length === 0,
        detail: `${expected.length - missing.length}/${expected.length}`,
        error: missing.length ? 'Fehlt: ' + missing.join(', ') : null,
      };
    },
  },
  {
    id: 'modal-ids',
    name: 'Modal-Templates (8 erwartet)',
    run: (win) => {
      const expected = ['m-help', 'm-rename', 'm-templates', 'm-welcome',
                        'm-kcang-wizard', 'm-floor-manager', 'm-changelog', 'm-credits'];
      const doc = win.document;
      const missing = expected.filter((id) => !doc.getElementById(id));
      return {
        pass: missing.length === 0,
        detail: `${expected.length - missing.length}/${expected.length}`,
        error: missing.length ? 'Fehlt: ' + missing.join(', ') : null,
      };
    },
  },
  {
    id: 'right-panel-tabs',
    name: 'Right-Panel-Tabs (6 erwartet)',
    run: (win) => {
      const expected = ['ai', 'design', 'light', 'save', 'props', 'bim'];
      const doc = win.document;
      const missing = expected.filter((t) => !doc.getElementById('rpanel-' + t));
      return {
        pass: missing.length === 0,
        detail: `${expected.length - missing.length}/${expected.length}`,
        error: missing.length ? 'Fehlt: ' + missing.join(', ') : null,
      };
    },
  },
  {
    id: 'catalog-items',
    name: 'Catalog-Items (≥150 TS-Subset, ≥4 Treppen)',
    run: (win) => {
      const items = win.cscCatalog?.newItems || [];
      const stairs = items.filter((i) => i?.type === 'stairs').length;
      const ok = items.length >= 150 && stairs >= 4;
      return {
        pass: ok,
        detail: `${items.length} Items / ${stairs} Treppen`,
        error: !ok ? `Erwartet ≥150 / ≥4, gefunden ${items.length} / ${stairs}` : null,
      };
    },
  },
  {
    id: 'compliance-rules',
    name: 'Compliance-Rules (≥25 erwartet)',
    run: (win) => {
      const c = win.cscCompliance;
      let count = -1;
      if (typeof c?.listRules === 'function') count = c.listRules().length;
      else if (typeof c?.getRules === 'function') count = c.getRules().length;
      else if (Array.isArray(c?.rules)) count = c.rules.length;
      return {
        pass: count >= 25,
        detail: count >= 0 ? `${count} Regeln` : 'API unklar',
        error: count < 25 ? `Nur ${count}/25 — fehlen Rules?` : null,
      };
    },
  },
  {
    id: 'export-fns',
    name: 'Export-Funktionen (DXF, GLTF, CSV)',
    run: (win) => {
      const expected = ['exportToDxf', 'exportGLTF', 'exportToCsv'];
      const missing = expected.filter((fn) => typeof win[fn] !== 'function');
      return {
        pass: missing.length === 0,
        detail: `${expected.length - missing.length}/${expected.length}`,
        error: missing.length ? 'Fehlt: ' + missing.join(', ') : null,
      };
    },
  },
  {
    id: 'bim-export-bridge',
    name: 'BIM-Export-Bridge (cscBimUI.exportIfc)',
    run: (win) => {
      const ok = typeof win.cscBimUI?.exportIfc === 'function';
      return {
        pass: ok,
        detail: ok ? 'verfügbar' : 'Bridge fehlt',
        error: !ok ? 'cscBimUI.exportIfc nicht gefunden' : null,
      };
    },
  },
  {
    id: 'bauantrag-bridge',
    name: 'Bauantrag-Bridge (cscBauantrag.exportPdf)',
    run: (win) => {
      const ok = typeof win.cscBauantrag?.exportPdf === 'function';
      return {
        pass: ok,
        detail: ok ? 'verfügbar' : 'Bridge fehlt',
        error: !ok ? 'cscBauantrag.exportPdf nicht gefunden' : null,
      };
    },
  },
  {
    id: 'pricing-bridge',
    name: 'Pricing-Bridge (cscPricing.open)',
    run: (win) => {
      const ok = typeof win.cscPricing?.open === 'function';
      return {
        pass: ok,
        detail: ok ? 'verfügbar' : 'Bridge fehlt',
        error: !ok ? 'cscPricing.open nicht gefunden' : null,
      };
    },
  },
  {
    id: 'floors-bridge',
    name: 'Multi-Floor-Bridge (cscFloors + cscStairs)',
    run: (win) => {
      const ok = typeof win.cscFloors?.add === 'function' && typeof win.cscStairs === 'object';
      return {
        pass: ok,
        detail: ok ? 'cscFloors.add + cscStairs aktiv' : 'Bridge unvollständig',
        error: !ok ? 'cscFloors.add oder cscStairs fehlt' : null,
      };
    },
  },
  {
    id: 'self-test',
    name: 'Eingebauter Selbsttest läuft (cscSelfTest.run)',
    run: async (win) => {
      if (typeof win.cscSelfTest?.run !== 'function') {
        return { pass: false, detail: 'API fehlt', error: 'cscSelfTest.run nicht gefunden' };
      }
      const result = await win.cscSelfTest.run('__non_existing_container__');
      return {
        pass: result.failed === 0,
        detail: `${result.passed}/${result.total}`,
        error: result.failed > 0
          ? result.details.filter((d) => d.status === 'fail').map((d) => d.name).join(', ')
          : null,
      };
    },
  },
];

// ── Manual-Test-Items ─────────────────────────────────────────────────
// id, section, title, steps[], expect (was sollte passieren)
const MANUAL_ITEMS = [
  // Multi-Floor
  {
    id: 'mf-add-floor', section: 'Multi-Floor (Roadmap v3.0 #1, 4 Phasen)',
    title: 'Stockwerk hinzufügen via Floor-Manager',
    steps: [
      'In der App: Topbar → 🏢 oder Menü „Etagen / Floors"',
      'Floor-Manager-Modal öffnet sich',
      'Klick „➕ Etage hinzufügen", neuer Eintrag „EG / 1.OG / 2.OG"',
    ],
    expect: 'Modal listet alle Etagen, aktive ist hervorgehoben',
  },
  {
    id: 'mf-stairs-place', section: 'Multi-Floor (Roadmap v3.0 #1, 4 Phasen)',
    title: 'Treppe platzieren (5 Treppen-Typen aus Catalog)',
    steps: [
      'Möbel-Tab → Filter „Treppen"',
      'Geraden-Treppe + L-Treppe + Wendeltreppe je einmal aufs Canvas ziehen',
      'In 3D-Ansicht wechseln → alle drei Geometrien sichtbar',
      'Stacked-View toggle → andere Etagen halbtransparent',
    ],
    expect: 'Mind. 5 Treppen-Catalog-Items, Wendeltreppe spiraliert sichtbar',
  },
  {
    id: 'mf-compliance', section: 'Multi-Floor (Roadmap v3.0 #1, 4 Phasen)',
    title: 'Treppen-Compliance-Regeln greifen',
    steps: [
      'Eine Treppe so platzieren, dass sie NICHT Etagen verbindet',
      'Compliance-Dashboard öffnen',
      'Regel „stairsConnection" zeigt rot/Warnung',
      'Treppe an korrekte Position bewegen → Regel grün',
    ],
    expect: '+2 neue Compliance-Regeln (stairsConnection + stairsMinWidth)',
  },

  // Bauantrag-PDF
  {
    id: 'ba-wizard-fill', section: 'Bauantrag-PDF (Roadmap v3.0 #2)',
    title: 'KCanG-Wizard 7 Sektionen ausfüllen',
    steps: [
      'Menü → KCanG-Wizard (oder Ctrl+K → „KCanG")',
      'Section A Vereinsdaten: Name + Adresse + Mitgliederzahl',
      'Section D Hygienekonzept: alle 5 Häkchen setzen',
      'Section E Suchtberatung: Kontakt-Name + E-Mail eintragen',
      'Speichern (lokal-Mode reicht)',
    ],
    expect: 'Wizard speichert in localStorage, Cloud-Sync optional',
  },
  {
    id: 'ba-export-pdf', section: 'Bauantrag-PDF (Roadmap v3.0 #2)',
    title: 'Bauantrag-PDF generieren (10 Sektionen)',
    steps: [
      'Im Wizard oder Datei-Menü: „Bauantrag als PDF exportieren"',
      'jsPDF lädt lazy (kann 1-2s dauern beim ersten Mal)',
      'Download-Dialog erscheint, .pdf öffnen',
      'PDF hat Deckblatt + 10 Sektionen (Adresse, Räume, Compliance, Möbel-Liste, …)',
    ],
    expect: 'PDF nicht leer, KCanG-Wizard-Daten + Räume aus Plan vorhanden',
  },

  // BIM
  {
    id: 'bim-import', section: 'BIM-Roundtrip (Roadmap v3.0 #3, 2 Phasen)',
    title: 'IFC-Datei importieren (Phase 1)',
    steps: [
      'Right-Panel → 🏗 BIM-Tab',
      'Klick „IFC-Datei laden", IFC-Beispiel auswählen',
      '@thatopen-Lib lädt lazy (~5 MB beim ersten Mal)',
      'Geometrie wird im 3D-View angezeigt',
    ],
    expect: 'Lazy-Chunk ~5 MB nur on-demand, Boot-Bundle bleibt schlank',
  },
  {
    id: 'bim-export', section: 'BIM-Roundtrip (Roadmap v3.0 #3, 2 Phasen)',
    title: 'IFC-Export aktueller Plan (Phase 2)',
    steps: [
      'Plan mit 2-3 Räumen + Möbeln vorbereiten',
      'Datei-Menü → „IFC-Export" (oder BIM-Tab → Export)',
      '.ifc-Datei wird heruntergeladen',
      'In externem IFC-Viewer (z.B. usBIM.viewer+) prüfen → Geometrie + Räume drin',
    ],
    expect: 'Roundtrip Import → Edit → Export funktioniert end-to-end',
  },

  // Stripe
  {
    id: 'stripe-pricing', section: 'Stripe-Checkout (Roadmap v3.0 #4, 2 Phasen)',
    title: 'Pricing-Modal öffnen',
    steps: [
      'Topbar → Account-Icon oder Ctrl+K → „Pricing"',
      'Pricing-Modal zeigt 3 Pläne: Free / Pro / Team',
      'Aktueller Plan ist hervorgehoben',
    ],
    expect: '3 Pläne sichtbar, Feature-Liste pro Tier deutlich',
  },
  {
    id: 'stripe-checkout', section: 'Stripe-Checkout (Roadmap v3.0 #4, 2 Phasen)',
    title: 'Test-Mode-Checkout durchziehen',
    steps: [
      'WICHTIG: Migration 0011 + 0012 müssen applied sein, sonst 404',
      'Im Pricing-Modal: „Pro-Plan auswählen"',
      'Stripe-Checkout-Page öffnet (Test-Mode, 0 €)',
      'Test-Karte 4242 4242 4242 4242, beliebiges zukünftiges Datum, CVC 123',
      'Erfolgreich → zurück zur App, Plan-Badge zeigt „Pro"',
    ],
    expect: 'Webhook → Supabase, Subscription-Row sichtbar in csc_subscriptions',
    warn: 'Stripe-Setup nötig (siehe docs/STRIPE-SETUP.md). Optional bis Pro/Team genutzt werden soll.',
  },

  // Selbsttest
  {
    id: 'selftest-button', section: 'Feature-Selbsttest (Bonus, v2.8.1)',
    title: '🩺 Selbsttest-Button im Help-Modal',
    steps: [
      'Topbar → ❓ Hilfe',
      'Help-Modal hat unten den Button „🩺 App-Selbsttest"',
      'Klick → 🩺 Jetzt prüfen',
      '7 Checks laufen ab: Bridges, Catalog, Compliance, Modals, Tabs, Exports, BIM',
    ],
    expect: 'Alle 7 ✅ → feiern! Sonst rote Items als Bug-Liste',
  },
];

const USER_ACTIONS = [
  {
    id: 'mig-0009', title: 'Migration 0009 — Optimistic Locking',
    why: 'Konflikt-Modal bei gleichzeitiger Bearbeitung von 2 Browsern. Ohne: last-writer-wins (graceful, keine Kritikalität).',
  },
  {
    id: 'mig-0010', title: 'Migration 0010 — KCanG-Wizard Cloud-Sync',
    why: 'Wizard-Daten in Supabase synchen. Ohne: localStorage funktioniert weiter.',
  },
  {
    id: 'mig-0011', title: 'Migration 0011 — Subscriptions',
    why: 'Pricing-Modal speichert Plan-Wechsel. Ohne: Pricing-UI öffnet, aber Plan-Wechsel scheitert.',
  },
  {
    id: 'mig-0012', title: 'Migration 0012 — Subscriptions Stripe',
    why: 'Stripe-Checkout-Bridge. Ohne: Test-Mode-Checkout-Klick scheitert.',
  },
  {
    id: 'stripe-setup', title: 'Stripe-Setup (optional)',
    why: 'Siehe docs/STRIPE-SETUP.md — Test-Mode-Account, 3 Products, Webhook, Edge-Function-Secrets, Deploy. Nur wenn Pro/Team aktiv geschaltet werden soll.',
  },
];

// Apply-URL für Migrations
const SUPABASE_SQL_URL = 'https://supabase.com/dashboard/project/wvkjkdwahsqozeupoxpj/sql';

// ── Boot-Logic ────────────────────────────────────────────────────────
function loadAppIntoIframe() {
  const iframe = document.getElementById('app-iframe');
  const status = document.getElementById('boot-status');
  status.textContent = 'lädt …';
  status.className = 'pill pill-pending';
  iframe.src = './index.html';
  iframe.addEventListener('load', () => {
    try {
      const win = iframe.contentWindow;
      // Inject Error-Capture (idempotent)
      if (!win.__testCapturedErrors) {
        win.__testCapturedErrors = [];
        win.addEventListener('error', (e) => win.__testCapturedErrors.push({
          message: e.message, source: e.filename, line: e.lineno,
        }));
        win.addEventListener('unhandledrejection', (e) => win.__testCapturedErrors.push({
          message: 'Promise: ' + (e.reason?.message || String(e.reason)),
        }));
      }
      // Warte bis Bridges geladen sind (bis zu 8s)
      pollUntilReady(win, 8000).then((ready) => {
        if (ready) {
          status.textContent = 'geladen ✓';
          status.className = 'pill pill-pass';
          document.getElementById('btn-run-auto').disabled = false;
        } else {
          status.textContent = 'Boot-Timeout (Bridges fehlen)';
          status.className = 'pill pill-fail';
          state.bootError = 'Bridges nicht innerhalb 8s verfügbar';
          save();
        }
      });
    } catch (err) {
      status.textContent = 'Cross-Origin / Sandbox-Fehler';
      status.className = 'pill pill-fail';
      state.bootError = err.message;
      save();
    }
  }, { once: true });
}

function pollUntilReady(win, timeoutMs) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const tick = () => {
      if (typeof win.cscSelfTest?.run === 'function') return resolve(true);
      if (Date.now() - t0 > timeoutMs) return resolve(false);
      setTimeout(tick, 200);
    };
    tick();
  });
}

// ── Auto-Tests ausführen ──────────────────────────────────────────────
async function runAutoTests() {
  const iframe = document.getElementById('app-iframe');
  const win = iframe.contentWindow;
  const container = document.getElementById('auto-results');
  container.innerHTML = '';
  state.autoResults = [];

  for (const test of AUTO_TESTS) {
    const row = renderTestRow(test.name, 'pending', 'läuft …', null);
    container.appendChild(row);
    let result;
    try {
      result = await test.run(win);
    } catch (err) {
      result = { pass: false, detail: 'Crash', error: err.message };
    }
    state.autoResults.push({ id: test.id, name: test.name, ...result });
    row.replaceWith(renderTestRow(test.name, result.pass ? 'pass' : 'fail', result.detail, result.error));
  }
  save();
  updateSummary();
}

function renderTestRow(name, status, detail, error) {
  const row = document.createElement('div');
  row.className = 'test-row';
  const pillCls = status === 'pass' ? 'pill-pass' : status === 'fail' ? 'pill-fail' : 'pill-pending';
  const icon = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⋯';
  row.innerHTML =
    `<span class="test-name">${escape(name)}</span>` +
    `<span class="pill ${pillCls}">${icon} ${escape(detail || '')}</span>`;
  if (error) {
    const e = document.createElement('div');
    e.className = 'test-detail err';
    e.textContent = error;
    e.style.flexBasis = '100%';
    row.appendChild(e);
  }
  return row;
}

// ── Manual-Tests rendern ──────────────────────────────────────────────
function renderManualList() {
  const container = document.getElementById('manual-list');
  container.innerHTML = '';
  let lastSection = '';
  for (const item of MANUAL_ITEMS) {
    if (item.section !== lastSection) {
      const h = document.createElement('h3');
      h.textContent = item.section;
      container.appendChild(h);
      lastSection = item.section;
    }
    container.appendChild(renderManualItem(item));
  }
}

function renderManualItem(item) {
  const wrap = document.createElement('div');
  wrap.style.padding = '8px 0';
  wrap.style.borderBottom = '1px solid #2d3748';
  const status = state.manualStatus[item.id] || '';
  const okCls = status === 'ok' ? ' active-ok' : '';
  const issueCls = status === 'issue' ? ' active-issue' : '';
  wrap.innerHTML =
    `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
      <span style="flex:1;font-weight:600;font-size:13px;min-width:200px">${escape(item.title)}</span>
      <button class="status-btn${okCls}" data-id="${item.id}" data-st="ok">✓ OK</button>
      <button class="status-btn${issueCls}" data-id="${item.id}" data-st="issue">✗ Problem</button>
    </div>
    <ol class="steps">${item.steps.map((s) => '<li>' + escape(s) + '</li>').join('')}</ol>
    <div class="expect">Erwartung: ${escape(item.expect)}</div>` +
    (item.warn ? `<div class="warn">⚠ ${escape(item.warn)}</div>` : '') +
    `<textarea placeholder="Notizen (optional)" data-note="${item.id}">${escape(state.manualNotes[item.id] || '')}</textarea>`;
  return wrap;
}

function renderUserActions() {
  const c = document.getElementById('user-actions');
  c.innerHTML =
    `<div class="hint">Apply-URL: <a href="${SUPABASE_SQL_URL}" target="_blank" style="color:#4ade80">Supabase SQL-Editor öffnen</a> — alle 4 Migrations sind idempotent.</div>` +
    USER_ACTIONS.map((a) => {
      const status = state.manualStatus[a.id] || '';
      const okCls = status === 'ok' ? ' active-ok' : '';
      const issueCls = status === 'issue' ? ' active-issue' : '';
      return `<div style="padding:8px 0;border-bottom:1px solid #2d3748">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span style="flex:1;font-weight:600;font-size:13px;min-width:200px">${escape(a.title)}</span>
          <button class="status-btn${okCls}" data-id="${a.id}" data-st="ok">✓ Erledigt</button>
          <button class="status-btn${issueCls}" data-id="${a.id}" data-st="issue">— offen</button>
        </div>
        <div style="font-size:12px;color:#a0aec0;margin-top:4px">${escape(a.why)}</div>
      </div>`;
    }).join('');
}

function updateSummary() {
  const autoPass = state.autoResults.filter((r) => r.pass).length;
  const autoTotal = state.autoResults.length;
  const manualPass = Object.values(state.manualStatus).filter((s) => s === 'ok').length;
  const manualTotal = MANUAL_ITEMS.length + USER_ACTIONS.length;
  document.getElementById('auto-pass').textContent = `${autoPass}/${AUTO_TESTS.length}`;
  document.getElementById('auto-pass').className = 'pill ' + (autoTotal > 0 && autoPass === AUTO_TESTS.length ? 'pill-pass' : 'pill-pending');
  document.getElementById('manual-pass').textContent = `${manualPass}/${manualTotal}`;
  document.getElementById('manual-pass').className = 'pill ' + (manualPass === manualTotal && manualTotal > 0 ? 'pill-pass' : 'pill-pending');
  const totalDone = autoPass + manualPass;
  const totalAll = AUTO_TESTS.length + manualTotal;
  document.getElementById('progress').style.width = totalAll > 0 ? `${(totalDone / totalAll) * 100}%` : '0%';
}

function escape(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Event-Wiring ──────────────────────────────────────────────────────
function wireEvents() {
  document.getElementById('btn-load-app').addEventListener('click', loadAppIntoIframe);
  document.getElementById('btn-run-auto').addEventListener('click', runAutoTests);
  document.getElementById('btn-copy').addEventListener('click', () => copyReport());
  document.getElementById('btn-download').addEventListener('click', () => downloadReport());
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Wirklich alles zurücksetzen?')) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
  // Status-Buttons (manual + user-actions, delegated)
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.status-btn[data-id]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const st = btn.getAttribute('data-st');
    state.manualStatus[id] = state.manualStatus[id] === st ? undefined : st;
    save();
    renderManualList();
    renderUserActions();
    updateSummary();
  });
  // Notes (delegated)
  document.body.addEventListener('input', (e) => {
    if (e.target.matches('textarea[data-note]')) {
      state.manualNotes[e.target.getAttribute('data-note')] = e.target.value;
      save();
    }
  });
}

// ── Markdown-Export ───────────────────────────────────────────────────
function buildMarkdown() {
  const ts = new Date().toISOString();
  const autoPass = state.autoResults.filter((r) => r.pass).length;
  const autoTotal = state.autoResults.length;
  const manualPass = Object.values(state.manualStatus).filter((s) => s === 'ok').length;
  const manualTotal = MANUAL_ITEMS.length + USER_ACTIONS.length;

  let md = `# CSC Studio Pro — Roadmap-v3.0-Test (v2.8.1)\n\n`;
  md += `**Stand:** ${ts}\n\n`;
  md += `## Score\n\n`;
  md += `- Auto-Tests: **${autoPass}/${AUTO_TESTS.length}** ${autoPass === AUTO_TESTS.length ? '✅' : '⚠'}\n`;
  md += `- Manuell + User-Actions: **${manualPass}/${manualTotal}** ${manualPass === manualTotal && manualTotal > 0 ? '✅' : '⚠'}\n\n`;
  if (state.bootError) md += `**Boot-Error:** \`${state.bootError}\`\n\n`;

  md += `## Auto-Tests\n\n`;
  if (state.autoResults.length === 0) md += `_Noch nicht gelaufen._\n\n`;
  for (const r of state.autoResults) {
    md += `- ${r.pass ? '✅' : '❌'} **${r.name}** — ${r.detail || ''}`;
    if (r.error) md += ` _(${r.error})_`;
    md += '\n';
  }

  md += `\n## Manuelle Tests\n\n`;
  let lastSection = '';
  for (const item of MANUAL_ITEMS) {
    if (item.section !== lastSection) { md += `\n### ${item.section}\n\n`; lastSection = item.section; }
    const st = state.manualStatus[item.id];
    const icon = st === 'ok' ? '✅' : st === 'issue' ? '❌' : '⏳';
    md += `- ${icon} **${item.title}**`;
    const note = state.manualNotes[item.id]?.trim();
    if (note) md += ` — _${note.replace(/\n/g, ' ')}_`;
    md += '\n';
  }

  md += `\n## User-Actions\n\n`;
  for (const a of USER_ACTIONS) {
    const st = state.manualStatus[a.id];
    const icon = st === 'ok' ? '✅' : st === 'issue' ? '⏳' : '⏳';
    md += `- ${icon} **${a.title}** — ${a.why}\n`;
  }
  md += `\nSupabase SQL: ${SUPABASE_SQL_URL}\n`;
  return md;
}

async function copyReport() {
  const md = buildMarkdown();
  try {
    await navigator.clipboard.writeText(md);
    alert('Bericht in Zwischenablage kopiert.');
  } catch {
    prompt('Clipboard-API nicht verfügbar — manuell kopieren:', md);
  }
}

function downloadReport() {
  const md = buildMarkdown();
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `csc-test-v2.8.1-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Init ──────────────────────────────────────────────────────────────
load();
wireEvents();
renderManualList();
renderUserActions();
updateSummary();
// Auto-Results beim Reload anzeigen falls vorhanden
if (state.autoResults.length > 0) {
  const c = document.getElementById('auto-results');
  for (const r of state.autoResults) {
    c.appendChild(renderTestRow(r.name, r.pass ? 'pass' : 'fail', r.detail, r.error));
  }
}
