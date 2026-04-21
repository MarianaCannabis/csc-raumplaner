// CSC Studio Pro Test-Checkliste — state + rendering + export.
// Pure vanilla JS, no build step. Lives at /test.html alongside index.html
// so it deploys with every Pages push.

const STORAGE_KEY = 'csc-test-report';

const ITEMS = [
  // ── Core-Flows ─────────────────────────────────────────────────────
  {
    id: 'login-flow',
    section: 'Core-Flows',
    title: 'Magic-Link-Login',
    steps: [
      'Inkognito-Fenster öffnen',
      'URL: https://marianacannabis.github.io/csc-raumplaner/',
      'Gate-Overlay klicken → „🔑 Jetzt einloggen"',
      'E-Mail eintragen, „Magic Link senden"',
      'E-Mail öffnen, Link klicken',
      'Zurück im App-Tab: Gate verschwindet, Cloud-Box zeigt ✅ Eingeloggt',
    ],
  },
  {
    id: 'project-create',
    section: 'Core-Flows',
    title: 'Neues Projekt erstellen',
    steps: [
      'Menü → „🆕 Neues Projekt" wählen',
      'Projektname oben im Topbar ändert sich',
      'Leinwand ist leer, keine Räume',
    ],
  },
  {
    id: 'room-draw',
    section: 'Core-Flows',
    title: 'Raum zeichnen',
    steps: [
      'Werkzeug „⬜ Raum" wählen',
      'Diagonal auf der 2D-Leinwand ziehen',
      'Raum erscheint mit Maß-Labels (z. B. „5.0 × 4.0 m")',
      'Raum doppelklicken → Eigenschaften-Panel öffnet',
    ],
  },
  {
    id: 'furniture-place',
    section: 'Core-Flows',
    title: 'Möbel platzieren (Drag-Drop)',
    steps: [
      'Links im Möbelpanel ein Item wählen (z. B. „🪑 Stuhl" oder „💼 Büro (Rich)")',
      'Item auf einen Raum ziehen',
      'Objekt erscheint mit korrekter Größe + Orientierung',
      'Objekt anklicken → Eigenschaften-Panel zeigt Position/Rotation',
    ],
  },
  {
    id: 'view-3d',
    section: 'Core-Flows',
    title: '3D-Ansicht + Schatten',
    steps: [
      'Topbar: „⬛ 3D" klicken',
      'Szene wird in 3D gerendert',
      'Schatten auf Boden sichtbar, PBR-Reflexionen auf Möbeln',
      'Mit Maus drehen/zoomen/verschieben funktioniert',
    ],
  },
  {
    id: 'cloud-save-load',
    section: 'Core-Flows',
    title: 'Cloud-Save + Cloud-Load',
    steps: [
      'Nach ein paar Räumen: rechts „💾 Projekte" → „☁️ Cloud speichern"',
      'Toast: „In Cloud gespeichert"',
      'Seite neu laden (F5)',
      'Rechts → Cloud-Projekte-Liste → das Projekt ist drin',
      'Anklicken → Raumstruktur kommt zurück',
    ],
  },
  // ── KCanG-Compliance ───────────────────────────────────────────────
  {
    id: 'poi-200m',
    section: 'KCanG-Compliance',
    title: '§13 KCanG: 200m-Abstand (Adresse + POIs)',
    steps: [
      'Rechts → „💾 Projekte" → KCanG-Projektdaten',
      'Reale Adresse eintragen (z. B. „Alexanderplatz 1, 10178 Berlin")',
      '„📍 POIs laden" klicken → Toast mit Anzahl POIs',
      'KCanG-Monitor zeigt Status für Abstands-Regel',
      '„🗺️ Bubatzkarte" öffnet externe Karte zum Doppelcheck',
    ],
  },
  {
    id: 'kcang-members',
    section: 'KCanG-Compliance',
    title: 'Mitgliederzahl (§11 KCanG, max 500)',
    steps: [
      'Im KCanG-Projektdaten-Feld „Mitglieder" eine Zahl eintragen',
      'Bei > 500: KCanG-Monitor zeigt Verstoß rot',
      'Bei ≤ 500: grün',
    ],
  },
  {
    id: 'kcang-prev-officer',
    section: 'KCanG-Compliance',
    title: 'Präventionsbeauftragter (§23 KCanG)',
    steps: [
      'Feld „Präventionsbeauftragter (Name)" leer lassen → Regel schlägt an',
      'Namen eintragen → Regel grün',
    ],
  },
  {
    id: 'kcang-window-foil',
    section: 'KCanG-Compliance',
    title: 'Sichtschutzfolie aller Fenster',
    steps: [
      'Mindestens ein Fenster-Objekt platzieren',
      'Checkbox „Alle Fenster mit Sichtschutzfolie ausgestattet" setzen',
      'KCanG-Regel „Sichtschutz" schaltet auf grün',
    ],
  },
  {
    id: 'kcang-score',
    section: 'KCanG-Compliance',
    title: 'Health-Score + KCanG-Monitor',
    steps: [
      'Rechts oben: Health-Score sichtbar (0–100%)',
      'Mehr KCanG-Regeln erfüllen → Score steigt',
      'Menü → „🌿 KCanG Live-Monitor" aktivieren',
      'Live-Anzeige unten zeigt passed/total',
    ],
  },
  // ── KI-Features ────────────────────────────────────────────────────
  {
    id: 'ki-chat',
    section: 'KI-Features',
    title: 'KI-Chat (Anthropic-Proxy)',
    steps: [
      'Rechts → „💬 KI"-Tab',
      'Eine Frage eingeben, z. B. „Was fehlt noch an Sicherheitsausstattung?"',
      'Antwort kommt (kein 401 / kein Fehler)',
      'Network-Tab: Request an /functions/v1/anthropic-proxy, Status 200',
    ],
  },
  {
    id: 'ki-cost',
    section: 'KI-Features',
    title: 'KI-Kostenschätzung',
    steps: [
      'Rechts → „📈 ROI"-Rechner oder Menü „💰 Kostenschätzung"',
      'KI rechnet → Antwort plausibel auf Deutsch',
      'Prompt erwähnt nicht mehr „2024/2025"',
    ],
  },
  {
    id: 'ki-security',
    section: 'KI-Features',
    title: 'KI-Sicherheits-Audit',
    steps: [
      'Menü → „🔐 KI: Sicherheits-Audit"',
      'Analyse läuft, Ergebnis mit konkreten Tipps',
      'Kein JSON-Parse-Fehler in der Konsole',
    ],
  },
  // ── 3D-Qualität ────────────────────────────────────────────────────
  {
    id: 'rich-primitives',
    section: '3D-Qualität',
    title: 'Rich-Primitive-Möbel (Details)',
    steps: [
      'Möbel aus Kategorie „💼 Büro (Rich)" ziehen, z. B. Bürostuhl',
      '3D-Ansicht: 5-Stern-Base, Rollen, Gas-Lift, Stoff-Sitz & -Lehne sichtbar',
      'Textur-Surface auf Stoff (Weave) + Metall (gebürstet) + Holz (Maserung)',
    ],
  },
  {
    id: 'shadows',
    section: '3D-Qualität',
    title: 'Soft-Shadows (PCF)',
    steps: [
      '3D-Ansicht aktiv, mehrere Objekte platziert',
      'Schatten auf dem Boden sind weich (nicht hart-kantig)',
      'Schatten richtet sich nach Sonnen-Position (beweglich via Mood/Sun)',
    ],
  },
  {
    id: 'hdri',
    section: '3D-Qualität',
    title: 'HDRI-Reflexionen + Umschalter',
    steps: [
      'Metallische Objekte (Tresor, Kamera) zeigen HDRI-Reflexionen',
      'Menü → „💡 Beleuchtung: Studio" / „🌙 Abend" wechselt Stimmung',
      'Toast bestätigt Umschalt',
      'Zweiter Wechsel ist sofort (Cache)',
    ],
  },
  {
    id: 'bloom',
    section: '3D-Qualität',
    title: 'Bloom (LEDs / Exit-Signs)',
    steps: [
      'Grow-Tent oder Exit-Schild platzieren',
      '3D-Ansicht: LED-Panel / Schild hat weiche Glow-Aureole',
      'Menü → „✨ Bloom an/aus" toggelt den Effekt',
      'Toast bestätigt',
      'Nicht-emissive Objekte bloomen nicht (kein Wash-out)',
    ],
  },
  // ── Freitext ───────────────────────────────────────────────────────
  {
    id: 'feedback-missing',
    section: 'Freitext',
    title: 'Was fehlt noch?',
    steps: [
      'Freier Text: Features / Items / Regeln die fehlen oder schwer zu finden waren',
    ],
  },
  {
    id: 'feedback-annoying',
    section: 'Freitext',
    title: 'Was nervt?',
    steps: [
      'Freier Text: Bugs, unklare UI, langsame Interaktionen',
    ],
  },
  // ── v2.2 Neue Flows (P11.*) ───────────────────────────────────────────
  {
    id: 'planning-mode-switch',
    section: 'v2.2 Neue Features',
    title: 'Planning-Mode-Switcher (P11.1)',
    steps: [
      'Topbar zeigt Segmented-Control: „🏪 Raumplanung" / „🎪 Veranstaltungs-Planung"',
      '"Raumplanung" ist Default (grün hervorgehoben)',
      'Auf "Veranstaltungs-Planung" klicken → Confirm-Dialog erscheint',
      '→ OK: KCanG-Button verschwindet aus Topbar, Messe-Inputs werden sichtbar',
      'Seite neu laden (F5): Event-Mode bleibt aktiv (localStorage)',
      'Zurück zu Raumplanung: KCanG-Button kommt zurück',
    ],
  },
  {
    id: 'compliance-mode-filter',
    section: 'v2.2 Neue Features',
    title: 'Compliance-Regeln mode-gefiltert',
    steps: [
      'Im "Raumplanung"-Modus: KCanG-Dashboard öffnen',
      '21 Regeln sollten geprüft werden (inkl. memberLimit, poiCscDistance, visualScreen)',
      'Wechsel in "Veranstaltungs-Planung"',
      'KCanG-Dashboard ist ausgeblendet (button hat data-mode="room")',
      'Via Command-Palette "KCanG" suchen → Dashboard erreichbar, aber Regeln zeigen nur universelle (13)',
    ],
  },
  {
    id: 'ui-mode-tiers',
    section: 'v2.2 Neue Features',
    title: 'UI-Mode 3-Tier (Einfach/Standard/Profi)',
    steps: [
      'Topbar: UI-Mode-Select auf „🌱 Einfach"',
      'IFC-Export im Datei-Menü ist ausgeblendet (pro-tier)',
      'Behörden-Paket ist ausgeblendet (standard-tier)',
      'Auf „🚀 Profi" umschalten: alle Einträge sichtbar',
    ],
  },
  {
    id: 'marketplace',
    section: 'v2.2 Neue Features',
    title: 'Template-Marketplace (P9.7)',
    steps: [
      'Eigenes Template speichern',
      'Marketplace-Tab im Template-Modal öffnen',
      'Eigenes Template publishen (status=pending)',
      'Anderes Template aus Community laden — Download-Counter steigt',
    ],
  },
  {
    id: 'team-invite',
    section: 'v2.2 Neue Features',
    title: 'Team-Einladung (P9.5)',
    steps: [
      'Teams-Modal öffnen, neues Team erstellen',
      'Invite-Link kopieren',
      'In anderem Browser (Incognito): Invite-Link öffnen',
      'Einladung annehmen → erscheint als Team-Mitglied',
      'Projekt an Team zuweisen → anderes Mitglied sieht es in der Cloud-Liste',
    ],
  },
  {
    id: 'i18n-switch',
    section: 'v2.2 Neue Features',
    title: 'Sprach-Umschalter (P9.2)',
    steps: [
      'Topbar: Sprach-Select auf 🇬🇧 EN',
      'Mindestens Topbar + Hauptmenü zeigen englische Strings',
      'Auf 🇳🇱 NL: niederländische Strings',
      'Auf 🇪🇸 ES: spanische Strings',
      'Zurück auf 🇩🇪 DE',
    ],
  },
  {
    id: 'command-palette',
    section: 'v2.2 Neue Features',
    title: 'Command Palette (P9.4 / P10.6)',
    steps: [
      'Ctrl+K öffnet die Palette',
      'Tippen: "raum" → zeigt "Raum zeichnen", "Raum-Statistik"',
      'Pfeil-hoch/runter + Enter führt Befehl aus',
      'Esc schließt',
      '"UI-Modus" tippen → 3 Mode-Switcher sichtbar',
    ],
  },
  {
    id: 'touch-targets',
    section: 'v2.2 Neue Features',
    title: 'Touch-Targets 44×44 (P11.2)',
    steps: [
      'Mobile-Emulation in Chrome DevTools (<1024 px Breite)',
      'Alle Topbar-Buttons sind min. 44 px hoch',
      'Tap auf Menu-Items trifft zuverlässig',
      'Segmented Mode-Control nicht zu klein',
    ],
  },
  // ── v2.3 Bedienkonzept (P12.*) ────────────────────────────────────────
  {
    id: 'mode-switch-visible',
    section: 'v2.3 Bedienkonzept',
    title: 'Mode-Switch ist sichtbar und fühlt sich an (P12.2)',
    steps: [
      'Topbar: Segmented Control "🏪 Raumplanung / 🎪 Veranstaltungs-Planung" ist deutlich ~36 px hoch',
      'Aktiver Button hat grünen Glow (pulsierend alle 2.5s)',
      'Klick auf anderen Modus → Confirm-Dialog, dann Toast "🎪 Veranstaltungs-Planung aktiv"',
      'Im Event-Mode: subtile lila Linie am unteren Rand der Topbar',
      'Erstmaliger Wechsel → Onboarding-Tooltip unter Topbar erscheint 5s',
    ],
  },
  {
    id: 'ui-mode-simple',
    section: 'v2.3 Bedienkonzept',
    title: 'UI-Mode Simple zeigt nur Basics (P12.3)',
    steps: [
      'UI-Mode-Select auf "🌱 Einfach"',
      'Gelber Warn-Banner erscheint unter Topbar mit "⚖ Zurück auf Standard"',
      'Topbar zeigt nur Save-Button + Vorlagen + KCanG + Language/UI-Mode-Select + Mode-Switcher',
      'Viele Menu-Items sind ausgeblendet (Datei-Submenü dramatisch kürzer)',
      'Ctrl+K öffnet Palette → dort sind ALLE Befehle weiterhin sichtbar',
      '"Zurück auf Standard"-Button blendet Banner aus, alle Features wieder da',
    ],
  },
  {
    id: 'ui-mode-pro',
    section: 'v2.3 Bedienkonzept',
    title: 'UI-Mode Pro zeigt IFC/Team/Marketplace (P12.3)',
    steps: [
      'UI-Mode-Select auf "🚀 Profi"',
      'Datei-Menü enthält IFC-Export, Flucht- & Rettungsplan, Sicherheitsbericht',
      'Team-Management + Marketplace-Upload sichtbar (falls Buttons im Legacy-Code existieren)',
    ],
  },
  {
    id: 'sidebar-mode-split',
    section: 'v2.3 Bedienkonzept',
    title: 'Sidebar-Tabs passen sich Planungs-Modus an (P12.4)',
    steps: [
      'Room-Mode aktiv: linke Iconbar zeigt Räume/Möbel/Bau/Sicher/Eigene',
      'Wechsel zu Event-Mode → nur Veranst. + Eigene sichtbar',
      'Aktiver Tab ist nicht versehentlich ausgeblendet (Auto-Switch)',
      'Zurück zu Room → 5 Tabs wieder da, sinnvoller Default-Tab aktiv',
    ],
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
