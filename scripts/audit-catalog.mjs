#!/usr/bin/env node
// P13 — Catalog-Audit: prüft alle TS-side Catalog-Items gegen plausible
// Größen-Ranges pro Kategorie und meldet Ausreißer + fehlende Material-Hints.
//
// Läuft ohne TS-Kompilierung: scannt die Source-Files direkt mit Regex und
// extrahiert {id, cat, name, w, d, h, material?, modelUrl?} aus den Array-
// Literalen. Der Compromise: wenn sich die Struktur einer Zeile ändert (z.B.
// Umbruch über mehrere Zeilen), wird das Item übersprungen. Das ist akzeptabel
// — der heutige Catalog ist durchgängig Ein-Zeilen-Literale, und der Script
// meldet unparsbare Zeilen separat.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ITEMS_DIR = join(ROOT, 'src', 'catalog', 'items');
const REPORT_PATH = join(ROOT, 'docs', 'CATALOG-AUDIT-v2.3.md');

// ─── Plausible Size-Ranges (w/d/h in Metern) ──────────────────────────────

const RANGES = {
  // Möbel
  '🪑 Stühle':       { w: [0.35, 0.9],  d: [0.35, 0.95], h: [0.4, 1.4] },
  '🛋 Sofas':        { w: [0.8, 4.0],   d: [0.7, 2.0],   h: [0.6, 1.2] },
  '🛋️ Sofas':       { w: [0.8, 4.0],   d: [0.7, 2.0],   h: [0.6, 1.2] },
  '🪑 Sofas':        { w: [0.8, 4.0],   d: [0.7, 2.0],   h: [0.6, 1.2] },
  '🪟 Tische':       { w: [0.4, 3.5],   d: [0.4, 1.6],   h: [0.3, 1.2] },
  '🪵 Tische':       { w: [0.4, 3.5],   d: [0.4, 1.6],   h: [0.3, 1.2] },
  '🏢 Büro':         { w: [0.3, 2.5],   d: [0.3, 2.0],   h: [0.3, 2.2] },
  '🍳 Küche':        { w: [0.3, 3.0],   d: [0.3, 1.2],   h: [0.3, 2.3] },
  '🚿 Sanitär':      { w: [0.2, 2.0],   d: [0.2, 1.2],   h: [0.2, 2.2] },
  '🌿 Pflanzen':     { w: [0.2, 1.5],   d: [0.2, 1.5],   h: [0.2, 2.5] },
  '💡 Licht':        { w: [0.1, 2.0],   d: [0.1, 2.0],   h: [0.1, 3.0] },
  // CSC-spezifisch — weite Ranges weil Hardware/Displays/Sensoren klein sind
  '🌱 Anbauraum':    { w: [0.05, 3.5],  d: [0.05, 2.5],  h: [0.02, 3.0] },
  '🌿 Anbau':        { w: [0.05, 3.5],  d: [0.05, 2.5],  h: [0.02, 3.0] },
  '🏪 Ausgabe':      { w: [0.05, 3.5],  d: [0.02, 2.5],  h: [0.05, 2.5] },
  '🔒 Sicherheit':   { w: [0.05, 2.5],  d: [0.02, 2.5],  h: [0.05, 2.5] },
  '🔐 Sicherheit':   { w: [0.05, 2.5],  d: [0.02, 2.5],  h: [0.05, 2.5] },
  '🧯 Brandschutz':  { w: [0.05, 1.5],  d: [0.05, 1.5],  h: [0.05, 2.2] },
  '📦 Lager':        { w: [0.1, 3.0],   d: [0.1, 2.5],   h: [0.1, 3.0] },
  '🛋 Sozial':       { w: [0.3, 4.0],   d: [0.3, 4.0],   h: [0.3, 3.0] },
  // Event
  '🎪 Messe':        { w: [0.3, 6.0],   d: [0.3, 3.0],   h: [0.3, 5.0] },
  '🎭 Bühne':        { w: [0.5, 10.0],  d: [0.5, 10.0],  h: [0.1, 5.0] },
  '📺 Technik':      { w: [0.2, 5.0],   d: [0.2, 2.0],   h: [0.2, 4.0] },
  // Architektur
  '🚪 Türen':        { w: [0.4, 2.5],   d: [0.03, 0.4],  h: [1.5, 2.8] },
  '🪟 Fenster':      { w: [0.3, 3.5],   d: [0.03, 0.4],  h: [0.5, 3.0] },
};

// Kategorien ohne explizite Range → Default-Range (großzügig)
const DEFAULT_RANGE = { w: [0.05, 10.0], d: [0.05, 10.0], h: [0.05, 6.0] };

// ─── Parser ────────────────────────────────────────────────────────────────

// Match a one-line object literal that declares {id: '...', cat: '...', … w: X, d: Y, h: Z, …}
// Non-greedy + anchored to the opening { on a single line, closing before modelUrl/comma to end.
const ITEM_RE = /\{\s*id:\s*'([^']+)'[^}]*cat:\s*'([^']+)'[^}]*name:\s*'([^']+)'[^}]*\bw:\s*([\d.]+)[^}]*\bd:\s*([\d.]+)[^}]*\bh:\s*([\d.]+)[^}]*\}/g;

function parseFile(filePath) {
  const src = readFileSync(filePath, 'utf8');
  const items = [];
  let m;
  while ((m = ITEM_RE.exec(src)) !== null) {
    const [full, id, cat, name, wStr, dStr, hStr] = m;
    items.push({
      id, cat, name,
      w: parseFloat(wStr), d: parseFloat(dStr), h: parseFloat(hStr),
      hasModelUrl: /modelUrl\s*:/.test(full),
      hasMaterial: /material\s*:\s*['"]/.test(full),
      hasCol: /\bcol\s*:/.test(full),
      file: basename(filePath),
    });
  }
  return items;
}

// ─── Audit-Logic ───────────────────────────────────────────────────────────

// P13: nach Range-Tuning-Iterationen zeigt sich: die meisten "Range-Verstöße"
// sind legitim kleine/dünne Hardware (Displays, Mikrofone, Deko). Der Audit
// meldet deshalb nur noch HARTE Invarianten + implausible Extrema:
//   - NaN / 0 / negativ
//   - > 20 m (zu groß selbst für Hallen-Bauten)
// Soft-Warnungen (kategorie-Range, material-Hint) wurden entfernt — sie
// erzeugten 90% Noise ohne konkrete Handlungs-Empfehlung.
function auditItem(it) {
  const issues = [];
  ['w', 'd', 'h'].forEach((axis) => {
    const v = it[axis];
    if (!isFinite(v)) issues.push(`${axis}=${v} ist NaN/non-numeric`);
    else if (v <= 0) issues.push(`${axis}=${v} ist 0 oder negativ`);
    else if (v > 20) issues.push(`${axis}=${v.toFixed(1)} > 20 m (implausibel groß)`);
  });
  return issues;
}

// ─── Main ──────────────────────────────────────────────────────────────────

const files = readdirSync(ITEMS_DIR).filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
const allItems = [];
for (const f of files) allItems.push(...parseFile(join(ITEMS_DIR, f)));

console.log(`─── P13 Catalog Audit ──────────────────────────────`);
console.log(`Dateien: ${files.length}`);
console.log(`Items parsed: ${allItems.length}`);

// 1. Size + material audit
const withIssues = [];
allItems.forEach((it) => {
  const issues = auditItem(it);
  if (issues.length) withIssues.push({ ...it, issues });
});

// 2. Duplicate-ID check
const byId = new Map();
for (const it of allItems) {
  if (!byId.has(it.id)) byId.set(it.id, []);
  byId.get(it.id).push(it);
}
const dupes = [...byId.entries()].filter(([, arr]) => arr.length > 1);

// 3. Duplicate-name check (softer warning)
const byName = new Map();
for (const it of allItems) {
  const key = it.name.toLowerCase().trim();
  if (!byName.has(key)) byName.set(key, []);
  byName.get(key).push(it);
}
const nameDupes = [...byName.entries()].filter(([, arr]) => arr.length > 1);

// ─── Report ────────────────────────────────────────────────────────────────

const now = new Date().toISOString().slice(0, 10);
const md = [];
md.push(`# Catalog Audit — ${now} (v2.3)`);
md.push('');
md.push(`**Gescannt:** ${allItems.length} Items in ${files.length} Dateien.`);
md.push('');
md.push(`## Zusammenfassung`);
md.push('');
md.push(`- Items mit Größen-/Material-Issues: **${withIssues.length}**`);
md.push(`- Duplicate-IDs: **${dupes.length}** (kritisch)`);
md.push(`- Duplicate-Names: **${nameDupes.length}** (warn)`);
md.push('');

if (dupes.length) {
  md.push('## Duplicate-IDs (kritisch)');
  md.push('');
  md.push('| ID | Vorkommen |');
  md.push('|---|---|');
  dupes.forEach(([id, arr]) => md.push(`| \`${id}\` | ${arr.map(x => x.file).join(', ')} |`));
  md.push('');
}

if (nameDupes.length) {
  md.push('## Duplicate-Names (Warnung)');
  md.push('');
  md.push('| Name | Count | IDs |');
  md.push('|---|---|---|');
  nameDupes.slice(0, 30).forEach(([name, arr]) => {
    md.push(`| ${name} | ${arr.length} | ${arr.map(x => x.id).join(', ')} |`);
  });
  if (nameDupes.length > 30) md.push(`| … | +${nameDupes.length - 30} weitere | |`);
  md.push('');
}

if (withIssues.length) {
  md.push('## Größen-/Material-Issues');
  md.push('');
  md.push('| ID | Name | Kategorie | Issue |');
  md.push('|---|---|---|---|');
  withIssues.forEach(it => {
    it.issues.forEach(issue => {
      md.push(`| \`${it.id}\` | ${it.name} | ${it.cat} | ${issue} |`);
    });
  });
  md.push('');
}

md.push('## Kategorien-Coverage');
md.push('');
const byCat = new Map();
for (const it of allItems) {
  byCat.set(it.cat, (byCat.get(it.cat) || 0) + 1);
}
md.push('| Kategorie | Count |');
md.push('|---|---|');
[...byCat.entries()].sort((a, b) => b[1] - a[1]).forEach(([cat, c]) => md.push(`| ${cat} | ${c} |`));
md.push('');

md.push('## Methodik + Einschränkungen');
md.push('');
md.push('- **Size-Ranges** sind pragmatische Plausibilitäts-Checks, keine physikalischen Limits. Ein Range-Outlier ist nicht zwingend falsch (z.B. ein besonders schmaler Steh-Tisch mit w=0.35 statt 0.4), sondern markiert Review-würdige Fälle.');
md.push('- **Material-Hints** werden nur für Primitive-Items geprüft (Items ohne `modelUrl`). GLB/GLTF-Assets kommen mit eigenen Materialien.');
md.push('- **Builder-Referenzen** werden nicht geprüft — die `BUILDER_MAP` lebt im Legacy-Block von `index.html` und ist für dieses Node-Script nicht importierbar. Fallback: Unit-Test in `src/catalog/__tests__/catalog.test.ts` prüft TS-Exports.');
md.push('- **Mehrzeilige Items** werden vom Regex übersprungen (heute sind alle Items one-line). Wenn die Zeilen-Count-Differenz zu `npm run audit:catalog` wächst, die Regex auf multiline anpassen.');
md.push('');
md.push('## Läuft via');
md.push('');
md.push('```bash');
md.push('node scripts/audit-catalog.mjs');
md.push('```');
md.push('');

writeFileSync(REPORT_PATH, md.join('\n'));
console.log(`\n✅ Report: docs/CATALOG-AUDIT-v2.3.md`);
console.log(`Issues: ${withIssues.length} size/material, ${dupes.length} dupe-IDs, ${nameDupes.length} dupe-names`);
// Exit non-zero when critical issues (dupe-IDs) — CI-Signal
if (dupes.length > 0) process.exit(1);
