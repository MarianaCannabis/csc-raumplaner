// CSC Studio Pro Test-Checkliste — state + rendering + export.
// Pure vanilla JS, no build step. Lives at /test.html alongside index.html
// so it deploys with every Pages push.

const STORAGE_KEY = 'csc-test-report';

const ITEMS = [
  // ── Core Flows (v2.3) ──────────────────────────────────────────────────
  {
    id: 'login-flow',
    section: 'Core-Flows',
    title: 'Magic-Link-Login',
    steps: [
      'Inkognito-Fenster → https://marianacannabis.github.io/csc-raumplaner/',
      'Login-Gate klickt, E-Mail eintragen, "Magic Link senden"',
      'E-Mail öffnen, Link klicken → Gate verschwindet, ✅ Eingeloggt',
    ],
  },
  {
    id: 'project-create',
    section: 'Core-Flows',
    title: 'Neues Projekt erstellen + speichern',
    steps: [
      'Datei-Menü → "🆕 Neues Projekt"',
      'Primary-Save-Button in Topbar sichtbar, leuchtet grün',
      'Ctrl+S speichert direkt, Toast "In Cloud gespeichert"',
      'F5 → Projekt ist nach Reload in der Cloud-Liste',
    ],
  },
  {
    id: 'room-draw',
    section: 'Core-Flows',
    title: 'Raum zeichnen + Objekt platzieren',
    steps: [
      'Mode auf 🏪 Raumplanung',
      'Tool "⬜ Raum" wählen, Rechteck auf Leinwand ziehen',
      'Möbel-Tab → Objekt draggen → auf Raum platzieren',
      '3D-Ansicht: Objekt hat plausible Größe + Materialtextur',
    ],
  },
  {
    id: 'cloud-save-load',
    section: 'Core-Flows',
    title: 'Cloud-Save + Cloud-Load',
    steps: [
      'Nach Änderungen Ctrl+S → Toast bestätigt',
      'Seite neu laden → Projekt-Liste rechts zeigt den Eintrag',
      'Projekt anklicken → Räume + Objekte sind vollständig',
    ],
  },

  // ── Planning-Mode (P11.1 + P12.4 + Bug B Fix) ─────────────────────────
  {
    id: 'planning-mode-switch',
    section: 'Planning-Mode',
    title: 'Room ↔ Event wechselt sichtbar (Sidebar + Katalog)',
    steps: [
      'Topbar: Segmented Control "🏪 Raumplanung / 🎪 Veranstaltungs-Planung" ~36 px hoch',
      'Klick auf Event → Confirm-Dialog, dann Toast "🎪 Veranstaltungs-Planung aktiv"',
      'Aktiver Button hat pulsierenden grünen Glow (alle 2.5s)',
      'Event-Mode: subtile lila Linie am unteren Rand der Topbar',
      'Sidebar: Räume/Möbel/Bau/Sicher verschwinden, Veranst + Eigene bleiben',
      'Katalog-Items: nur Messe/Event-Kategorien sichtbar (NICHT alle 492)',
      'Zurück auf Room → Tabs + Katalog kommen zurück',
    ],
  },
  {
    id: 'mode-hint-toast',
    section: 'Planning-Mode',
    title: 'Onboarding-Tooltip nach erstem Mode-Switch',
    steps: [
      'localStorage "csc-mode-hint-seen" leeren (DevTools)',
      'Mode einmal wechseln → 5s sichtbarer Hint unter Topbar',
      'Hint: "Menu-Items wechseln … Komplettliste mit Ctrl+K"',
      'Zweiter Switch: Hint kommt NICHT nochmal',
    ],
  },
  {
    id: 'compliance-mode-filter',
    section: 'Planning-Mode',
    title: 'Compliance-Regeln nach Mode gefiltert',
    steps: [
      'Room-Mode: KCanG-Dashboard zeigt alle 21 Regeln (inkl. memberLimit, visualScreen, poiCscDistance)',
      'Wechsel zu Event-Mode: KCanG-Button aus Topbar weg',
      'Via Ctrl+K "KCanG" suchen → Dashboard erreichbar, aber nur universale Regeln (13)',
      'Messe-Höhenbegrenzung-Regel nur in Event-Mode aktiv',
    ],
  },

  // ── UI-Mode Tiers (P10.5 + P12.3 + Bug A Fix) ──────────────────────────
  {
    id: 'ui-mode-simple',
    section: 'UI-Mode Tiers',
    title: 'Simple-Mode zeigt nur 20% der Features',
    steps: [
      'UI-Mode-Select auf "🌱 Einfach"',
      'Topbar: ~20% der Buttons weg (Datei-Menü dramatisch gekürzt)',
      'Simple-Badge "⚖ Simple" erscheint klein neben UI-Mode-Select',
      'Badge blockiert KEINE Buttons (kein fullwidth-Banner mehr)',
      'Ctrl+K öffnet Palette → zeigt ALLE 55+ Befehle (unfiltered)',
      'Klick auf Simple-Badge → wechselt zurück auf Standard',
    ],
  },
  {
    id: 'ui-mode-standard',
    section: 'UI-Mode Tiers',
    title: 'Standard zeigt 80% (Default)',
    steps: [
      'UI-Mode-Select auf "⚖ Standard"',
      'Topbar + Menus zeigen normale Feature-Liste',
      'IFC-Export + Flucht-Plan + Security-Report NICHT sichtbar (pro-tier)',
      'Behörden-Paket + Kostenvoranschlag sichtbar',
    ],
  },
  {
    id: 'ui-mode-pro',
    section: 'UI-Mode Tiers',
    title: 'Pro-Mode unlocked alles',
    steps: [
      'UI-Mode-Select auf "🚀 Profi"',
      'Datei-Menü: IFC-Export, Flucht- & Rettungsplan, Sicherheitsbericht sichtbar',
      '.pro-only-debug Elemente sichtbar (falls vorhanden)',
      'Keine Features versteckt',
    ],
  },

  // ── Command-Palette (P10.6 + Bug C Fix) ────────────────────────────────
  {
    id: 'command-palette-all',
    section: 'Command-Palette',
    title: 'Ctrl+K zeigt 55+ Befehle (kein Mode/Tier-Filter)',
    steps: [
      'Ctrl+K (oder Cmd+K) öffnet Palette',
      'Counter oben zeigt "55 von 55 Befehlen · tippen zum Filtern"',
      'Liste scrollt — alle Befehle erreichbar (NICHT mehr auf 12 limitiert)',
      'Pfeil-Tasten navigieren auch >12 Einträge, Selection scrollt mit',
      'Browser-Konsole: window.cscCommandPalette.items.length → 55+',
    ],
  },
  {
    id: 'command-palette-search',
    section: 'Command-Palette',
    title: 'Fuzzy-Search zeigt nur Treffer',
    steps: [
      '"raum" tippen → Counter "X von 55", nur Raum-Treffer',
      '"modus" tippen → 3 UI-Mode-Switcher sichtbar',
      '"sprache" tippen → 2 Sprach-Switcher (DE + EN)',
      'Esc schließt Palette',
    ],
  },
  {
    id: 'command-palette-modes-agnostic',
    section: 'Command-Palette',
    title: 'Palette ignoriert Mode/Tier',
    steps: [
      'UI-Mode auf Simple, Planning-Mode auf Event',
      'Ctrl+K → zeigt trotzdem alle Befehle (KCanG, Messe, IFC, Debug, etc.)',
      'Befehl ausführen funktioniert auch wenn Button ausgeblendet wäre',
    ],
  },

  // ── Sidebar Consolidation (P12.4) ──────────────────────────────────────
  {
    id: 'sidebar-room-tabs',
    section: 'Sidebar',
    title: 'Room-Mode: 5 Tabs sichtbar',
    steps: [
      'Room-Mode: Räume, Möbel, Bau, Sicher, Eigene',
      'Veranst-Label + ib-events unsichtbar',
      'Möbel-Tab aktivieren: Katalog zeigt nur CSC-Items (keine Messe/Stand/Bühne)',
    ],
  },
  {
    id: 'sidebar-event-tabs',
    section: 'Sidebar',
    title: 'Event-Mode: 2 Tabs + Katalog-Filter',
    steps: [
      'Event-Mode: nur Veranst + Eigene sichtbar',
      'Räume/Möbel/Bau/Sicher ausgeblendet',
      'Auto-Switch wenn aktiver Tab beim Mode-Wechsel wegfällt',
      'Veranst-Tab zeigt nur Event-Kategorien (Bühne, Banner, Messe-Items)',
    ],
  },

  // ── Export + Compliance ────────────────────────────────────────────────
  {
    id: 'kcang-dashboard',
    section: 'Compliance',
    title: 'KCanG-Dashboard + Health-Score',
    steps: [
      'Room-Mode aktiv',
      'KCanG-Button in Topbar (grün gehighlighted)',
      'Dashboard öffnet mit Meta-Feldern (Mitglieder, Adresse, Präventionsbeauftragter, Sichtschutz)',
      'Health-Score rechts oben 0-100%',
      '"Alle Fenster foliert" + Präventionsbeauftragter setzen → Score steigt',
    ],
  },
  {
    id: 'poi-200m-check',
    section: 'Compliance',
    title: '§13 KCanG: 200m-Abstand zu Schulen',
    steps: [
      'KCanG-Dashboard → Adresse eintragen (z.B. Alexanderplatz 1, Berlin)',
      '"📍 POIs laden" klicken → Toast mit Anzahl POIs',
      'Regel "Abstand zu Schulen" zeigt passed/failed mit POI-Liste',
    ],
  },
  {
    id: 'export-dxf',
    section: 'Export',
    title: 'DXF-Export (CAD-tauglich)',
    steps: [
      'Datei → 📐 Grundriss .dxf',
      'Download startet, Datei in AutoCAD/LibreCAD öffnen',
      '5 Layer sichtbar (Rooms, Walls, Doors, Furniture, Measurements)',
    ],
  },
  {
    id: 'export-pdf',
    section: 'Export',
    title: 'PDF / Druckvorschau',
    steps: [
      'Datei → 🖨 Druckvorschau',
      'Neuer Tab öffnet mit gerendertem Grundriss',
      'Legende, Maßstab, Raum-Liste enthalten',
    ],
  },
  {
    id: 'export-authority-package',
    section: 'Export',
    title: 'Behörden-Paket (ZIP) in Room-Mode',
    steps: [
      'Room-Mode aktiv (sonst nicht verfügbar per data-mode)',
      'Datei → 📦 Behörden-Paket (.zip)',
      'ZIP enthält Grundriss-PDF, Hygiene-Konzept, Compliance-Bericht',
    ],
  },

  // ── KI-Features ────────────────────────────────────────────────────────
  {
    id: 'ai-chat',
    section: 'KI-Features',
    title: 'KI-Sidebar-Chat',
    steps: [
      'Rechts → 💬 KI-Tab',
      'Frage eingeben: "Was fehlt an Sicherheit?"',
      'Antwort kommt, kein 401/Fehler',
      'Network-Tab: Request an /functions/v1/anthropic-proxy → 200',
    ],
  },
  {
    id: 'ai-floorplan-ocr',
    section: 'KI-Features',
    title: 'KI: Grundriss aus Foto (Vision)',
    steps: [
      'Datei → 🤖 KI: Grundriss aus Foto',
      'Foto hochladen (Skizze oder echter Grundriss)',
      'Claude erkennt Räume, fragt ob platziert werden sollen',
      'Bestätigen → Räume erscheinen auf Leinwand',
    ],
  },

  // ── 3D-Qualität ────────────────────────────────────────────────────────
  {
    id: '3d-pbr',
    section: '3D-Qualität',
    title: 'PBR + HDRI + Bloom',
    steps: [
      '3D-Ansicht aktiv',
      'Metallische Objekte zeigen HDRI-Reflexionen',
      'Stoff-Sitze haben Sheen-Effekt',
      'LED-Panel glowen weich (Bloom)',
    ],
  },
  {
    id: '3d-walk',
    section: '3D-Qualität',
    title: 'Walk-Modus (Ego-Perspektive)',
    steps: [
      '3D → Walk-Button',
      'WASD bewegen, Maus dreht, Space springen',
      'Kollision mit Wänden funktioniert',
      'Esc verlässt Walk-Modus',
    ],
  },

  // ── i18n + a11y ────────────────────────────────────────────────────────
  {
    id: 'i18n-switch',
    section: 'i18n + A11y',
    title: 'Sprach-Umschalter DE/EN/NL/ES',
    steps: [
      'Topbar: Sprach-Select auf 🇬🇧 EN → Topbar-Labels wechseln',
      'Auf 🇳🇱 NL → niederländische Strings',
      'Auf 🇪🇸 ES → spanische Strings',
      'Welcome-Modal zeigt "Welcome to CSC Studio Pro" (EN)',
    ],
  },
  {
    id: 'touch-targets',
    section: 'i18n + A11y',
    title: 'Touch-Targets 44×44 px (WCAG AA)',
    steps: [
      'Chrome DevTools Mobile-Emulation <1024px',
      'Alle Topbar-Buttons min. 44 px hoch',
      'Menu-Items in Dropdowns tap-freundlich',
      'Mode-Switcher nicht zu klein für Daumen',
    ],
  },
  {
    id: 'a11y-keyboard',
    section: 'i18n + A11y',
    title: 'Keyboard-Navigation + Focus-Visible',
    steps: [
      'Tab-Taste navigiert durch Topbar-Buttons',
      'Sichtbarer Focus-Ring (grün) auf aktivem Element',
      'Enter aktiviert den fokussierten Button',
      'Esc schließt Modals',
    ],
  },

  // ── PWA + Offline ──────────────────────────────────────────────────────
  {
    id: 'pwa-install',
    section: 'PWA',
    title: 'PWA installierbar + Offline',
    steps: [
      'Chrome: Adressleiste zeigt Install-Icon',
      'Installieren → App öffnet standalone',
      'Netzwerk offline → App lädt weiterhin (Service Worker)',
      'Auto-Save alle 30s in IndexedDB',
    ],
  },

  // ── Freitext ───────────────────────────────────────────────────────────
  {
    id: 'feedback-missing',
    section: 'Freitext',
    title: 'Was fehlt?',
    steps: ['Welche Features oder Items wurden vermisst?'],
  },
  {
    id: 'feedback-annoying',
    section: 'Freitext',
    title: 'Was nervt?',
    steps: ['Bugs, unklare UI, langsame Interaktionen — freier Text.'],
  },
];


// ── State helpers ───────────────────────────────────────────────────────────

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('[test-checklist] localStorage quota hit — screenshots may need to be downloaded as JSON', err);
    alert('Speicher voll! Screenshots nehmen viel Platz. „💾 Als JSON herunterladen" klicken und ggf. einige Screenshots löschen.');
  }
}

function getItem(id) {
  const state = loadState();
  return state[id] || { status: null, notes: '', screenshots: [] };
}

function setItem(id, patch) {
  const state = loadState();
  state[id] = { ...getItem(id), ...patch };
  saveState(state);
  updateProgress();
}

// ── Rendering ───────────────────────────────────────────────────────────────

function renderAll() {
  const groups = {};
  ITEMS.forEach((item) => {
    if (!groups[item.section]) groups[item.section] = [];
    groups[item.section].push(item);
  });

  const host = document.getElementById('checklist');
  host.innerHTML = '';

  Object.entries(groups).forEach(([section, items]) => {
    const sec = document.createElement('div');
    sec.className = 'section';
    sec.innerHTML = `<h2>${escapeHtml(section)}</h2>`;
    items.forEach((item) => sec.appendChild(renderItem(item)));
    host.appendChild(sec);
  });

  updateProgress();
}

function renderItem(item) {
  const state = getItem(item.id);
  const wrap = document.createElement('div');
  wrap.className = 'item';
  wrap.dataset.id = item.id;

  const header = document.createElement('div');
  header.className = 'item-header';
  header.innerHTML = `<span class="item-title">${escapeHtml(item.title)}</span>`;
  const btnOk = statusButton(item.id, 'ok', '✅ OK', state.status === 'ok');
  const btnIssue = statusButton(item.id, 'issue', '❌ Problem', state.status === 'issue');
  header.appendChild(btnOk);
  header.appendChild(btnIssue);
  wrap.appendChild(header);

  if (item.steps && item.steps.length) {
    const steps = document.createElement('ol');
    steps.className = 'steps';
    item.steps.forEach((s) => {
      const li = document.createElement('li');
      li.textContent = s;
      steps.appendChild(li);
    });
    wrap.appendChild(steps);
  }

  const notes = document.createElement('textarea');
  notes.placeholder = 'Notizen (optional)…';
  notes.value = state.notes || '';
  notes.addEventListener('input', () => setItem(item.id, { notes: notes.value }));
  wrap.appendChild(notes);

  const ssWrap = document.createElement('div');
  ssWrap.className = 'screenshot-wrap';
  ssWrap.id = `ss-${item.id}`;
  renderScreenshots(item.id, ssWrap);
  wrap.appendChild(ssWrap);

  return wrap;
}

function statusButton(itemId, value, label, active) {
  const btn = document.createElement('button');
  btn.className = 'status-btn' + (active ? ' active-' + value : '');
  btn.textContent = label;
  btn.addEventListener('click', () => {
    const current = getItem(itemId);
    const next = current.status === value ? null : value;
    setItem(itemId, { status: next });
    renderAll(); // simple re-render to refresh button states
  });
  return btn;
}

function renderScreenshots(itemId, host) {
  const state = getItem(itemId);
  host.innerHTML = '';
  (state.screenshots || []).forEach((ss, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'screenshot-thumb';
    const img = document.createElement('img');
    img.src = ss.dataUrl;
    img.alt = ss.name || `Screenshot ${idx + 1}`;
    img.title = ss.name || `Screenshot ${idx + 1}`;
    img.addEventListener('click', () => window.open(ss.dataUrl, '_blank'));
    thumb.appendChild(img);
    const del = document.createElement('button');
    del.className = 'screenshot-del';
    del.textContent = '×';
    del.title = 'Entfernen';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      const s = loadState();
      s[itemId] = s[itemId] || { status: null, notes: '', screenshots: [] };
      s[itemId].screenshots = (s[itemId].screenshots || []).filter((_, i) => i !== idx);
      saveState(s);
      renderScreenshots(itemId, host);
    });
    thumb.appendChild(del);
    host.appendChild(thumb);
  });

  const addLabel = document.createElement('label');
  addLabel.className = 'add-ss';
  addLabel.textContent = '＋ Screenshot';
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.addEventListener('change', (e) => handleScreenshots(itemId, e.target.files, host));
  addLabel.appendChild(input);
  host.appendChild(addLabel);
}

function handleScreenshots(itemId, files, host) {
  if (!files || !files.length) return;
  const reads = Array.from(files).map(
    (f) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: f.name, dataUrl: reader.result });
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(f);
      }),
  );
  Promise.all(reads).then((results) => {
    const s = loadState();
    s[itemId] = s[itemId] || { status: null, notes: '', screenshots: [] };
    s[itemId].screenshots = [...(s[itemId].screenshots || []), ...results.filter(Boolean)];
    saveState(s);
    renderScreenshots(itemId, host);
  });
}

function updateProgress() {
  const state = loadState();
  const total = ITEMS.length;
  const done = ITEMS.filter((it) => state[it.id] && state[it.id].status).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const fill = document.getElementById('progress');
  const txt = document.getElementById('progress-text');
  if (fill) fill.style.width = pct + '%';
  if (txt) txt.textContent = `${done} / ${total} getestet (${pct}%)`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── Export ──────────────────────────────────────────────────────────────────

/** YYYY-MM-DD-HHMM in local time — used as the standardized filename slug
 *  that Web-Claude can grep for in docs/test-reports/. */
function reportSlug(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    '-' +
    pad(d.getHours()) +
    pad(d.getMinutes())
  );
}

function buildMarkdownReport() {
  const state = loadState();
  const now = new Date();
  const slug = reportSlug(now);
  let md = `# CSC Studio Pro — Test-Report\n\n`;
  md += `**Datum:** ${now.toLocaleString('de-DE')}  \n`;
  md += `**Slug:** \`${slug}\`  \n`;
  md += `**Getestet:** ${ITEMS.filter((i) => state[i.id]?.status).length} / ${ITEMS.length}\n\n`;

  const groups = {};
  ITEMS.forEach((it) => {
    if (!groups[it.section]) groups[it.section] = [];
    groups[it.section].push(it);
  });

  Object.entries(groups).forEach(([section, items]) => {
    md += `## ${section}\n\n`;
    items.forEach((it) => {
      const s = state[it.id] || {};
      const icon = s.status === 'ok' ? '✅' : s.status === 'issue' ? '❌' : '⚪';
      md += `### ${icon} ${it.title}\n\n`;
      if (s.notes && s.notes.trim()) {
        md += `**Notizen:**\n\n${s.notes.trim()}\n\n`;
      }
      if (s.screenshots && s.screenshots.length) {
        md += `**Screenshots:** ${s.screenshots.length}\n\n`;
        s.screenshots.forEach((ss, idx) => {
          // Two references: repo-path (aspirational, für gepushte Reports)
          // und inline data-URL-Fallback (rendert in GitHub-MD-Viewer sofort).
          const alt = (ss.name || `${it.id}-${idx + 1}`).replace(/[\[\]]/g, '');
          const filename = `${idx + 1}-${it.id}.png`;
          md += `<!-- repo-path: docs/test-reports/screenshots/${slug}/${filename} -->\n`;
          md += `![${alt}](${ss.dataUrl})\n\n`;
        });
      }
    });
  });

  return { md, slug };
}

function copyToClipboard() {
  const { md } = buildMarkdownReport();
  navigator.clipboard
    .writeText(md)
    .then(() => alert(`Bericht (${md.length} Zeichen) in Zwischenablage kopiert!\n\nPaste direkt in den Chat.`))
    .catch(() => {
      alert('Clipboard blockiert — bitte „💾 Als .md herunterladen" benutzen.');
    });
}

/** Triggert einen .md-Download mit standardisiertem Namen. */
function downloadMdReport() {
  const { md, slug } = buildMarkdownReport();
  const blob = new Blob([md], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `test-report-${slug}.md`;
  a.click();
  URL.revokeObjectURL(a.href);
  return slug;
}

/** Zeigt eine Schritt-für-Schritt-Anleitung, wie der Bericht ins Repo
 *  kommt, triggert parallel den .md-Download. */
function pushToRepo() {
  const slug = downloadMdReport();
  const msg =
    `✅ Download läuft: test-report-${slug}.md\n\n` +
    `So geht's ins Repo:\n\n` +
    `1. Heruntergeladene Datei nach docs/test-reports/ verschieben\n` +
    `2. Screenshots (falls vorhanden) nach docs/test-reports/screenshots/${slug}/ kopieren\n` +
    `3. Im Repo:\n` +
    `   git add docs/test-reports/\n` +
    `   git commit -m "Test-Report ${slug}"\n` +
    `   git push\n\n` +
    `4. Web-Claude Bescheid geben:\n` +
    `   "Test beendet, Datum: ${slug}"`;
  // Nach dem Download kurz warten, damit der Browser-Dialog zuerst aufgeht
  // und der alert nicht modal davor blockt.
  setTimeout(() => alert(msg), 250);
}

function downloadJsonReport() {
  const state = loadState();
  const slug = reportSlug();
  const payload = {
    exportedAt: new Date().toISOString(),
    slug,
    items: ITEMS.map((i) => ({ ...i, result: state[i.id] || null })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `test-report-${slug}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function resetAll() {
  if (!confirm('Alle Status, Notizen und Screenshots löschen?')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderAll();
}

// ── Boot ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', renderAll);
window.copyToClipboard = copyToClipboard;
window.downloadMdReport = downloadMdReport;
window.pushToRepo = pushToRepo;
window.downloadJsonReport = downloadJsonReport;
window.resetAll = resetAll;
