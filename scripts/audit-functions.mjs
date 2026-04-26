#!/usr/bin/env node
// P10.1 — Function-Inventory-Generator.
//
// Scannt index.html + src/ und extrahiert:
// - onclick=-Handler in HTML (mit Text-Label für UI-Kontext)
// - addEventListener-Bindings
// - Top-Level function-Deklarationen (index.html + src/)
// - TS-export-Functions (src/**/*.ts)
//
// Output: docs/FUNCTIONS-INVENTORY-v2.md (automatisch generiert, diff-bar)

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === 'node_modules' || entry === 'dist' || entry === '.git') continue;
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function rel(p) { return relative(ROOT, p).replace(/\\/g, '/'); }

const results = {
  onclickHandlers: [],       // { file, line, handler, context }
  eventListeners: [],        // { file, line, event, handler }
  htmlFunctions: [],         // { file, line, name }
  tsExports: [],             // { file, line, name }
  // Sitzung H: tbm-item Coverage — alle Topbar-Menu-Items sollten
  // data-mode + data-tier haben (Mode-Filter + Tier-Filter im UI).
  tbmCoverage: { total: 0, withMode: 0, withTier: 0, fullyTagged: 0 },
};

// HTML-Scan (index.html + public/*.html)
const htmlFiles = [];
for (const p of walk(ROOT)) {
  if (p.endsWith('.html') && !p.includes('/dist/')) htmlFiles.push(p);
}

for (const f of htmlFiles) {
  const src = readFileSync(f, 'utf8');
  src.split('\n').forEach((line, i) => {
    const lineNum = i + 1;
    // onclick="foo(...)" mit optional Label innerhalb des gleichen tag
    for (const m of line.matchAll(/onclick="([^"]+)"/g)) {
      const handler = m[1].split(';')[0].trim();
      const labelMatch = line.match(/>([^<>{}\[\]]+)</);
      const context = labelMatch ? labelMatch[1].trim().slice(0, 40) : '';
      results.onclickHandlers.push({ file: rel(f), line: lineNum, handler, context });
    }
    for (const m of line.matchAll(/addEventListener\(['"`]([a-z]+)['"`]/g)) {
      results.eventListeners.push({ file: rel(f), line: lineNum, event: m[1] });
    }
    // Top-level function ... mit grobem Pattern
    for (const m of line.matchAll(/^(?:async\s+)?function\s+([A-Za-z_][\w$]*)\s*\(/g)) {
      results.htmlFunctions.push({ file: rel(f), line: lineNum, name: m[1] });
    }
    // Sitzung H: tbm-item-Coverage — pro Zeile checken ob class="tbm-item"
    // existiert + ob data-mode/data-tier gesetzt sind.
    if (/class="tbm-item"/.test(line)) {
      results.tbmCoverage.total++;
      const hasMode = /data-mode="[^"]+"/.test(line);
      const hasTier = /data-tier="[^"]+"/.test(line);
      if (hasMode) results.tbmCoverage.withMode++;
      if (hasTier) results.tbmCoverage.withTier++;
      if (hasMode && hasTier) results.tbmCoverage.fullyTagged++;
    }
  });
}

// TS-Scan
const tsFiles = [];
for (const p of walk(join(ROOT, 'src'))) {
  if ((p.endsWith('.ts') && !p.endsWith('.test.ts'))) tsFiles.push(p);
}

for (const f of tsFiles) {
  const src = readFileSync(f, 'utf8');
  src.split('\n').forEach((line, i) => {
    const lineNum = i + 1;
    for (const m of line.matchAll(/^export\s+(?:async\s+)?function\s+([A-Za-z_][\w$]*)/g)) {
      results.tsExports.push({ file: rel(f), line: lineNum, name: m[1] });
    }
    for (const m of line.matchAll(/^export\s+const\s+([A-Za-z_][\w$]*)\s*=/g)) {
      results.tsExports.push({ file: rel(f), line: lineNum, name: m[1] });
    }
  });
}

// Render Markdown
const now = new Date().toISOString().slice(0, 10);
const md = [];
md.push('# Functions Inventory v2');
md.push(`Stand: ${now} — auto-generiert via \`node scripts/audit-functions.mjs\`.`);
md.push('');
md.push(`## Zusammenfassung`);
md.push('');
md.push(`- **onclick-Handler:** ${results.onclickHandlers.length}`);
md.push(`- **addEventListener-Bindings:** ${results.eventListeners.length}`);
md.push(`- **HTML-Top-Level-Functions:** ${results.htmlFunctions.length}`);
md.push(`- **TS-Exports:** ${results.tsExports.length}`);
const tc = results.tbmCoverage;
md.push(
  `- **tbm-item-Coverage:** ${tc.fullyTagged}/${tc.total} fully tagged ` +
  `(data-mode: ${tc.withMode}/${tc.total}, data-tier: ${tc.withTier}/${tc.total})`,
);
md.push('');

md.push('## onclick-Handler (Top 80 — Kontext zeigt Button-Text)');
md.push('');
md.push('| Handler | File:Line | Button-Text |');
md.push('|---|---|---|');
const uniqHandlers = new Map();
for (const h of results.onclickHandlers) {
  const key = h.handler.replace(/\s+/g, '').slice(0, 60);
  if (!uniqHandlers.has(key)) uniqHandlers.set(key, h);
}
Array.from(uniqHandlers.values()).slice(0, 80).forEach(h => {
  md.push(`| \`${h.handler.slice(0, 80).replace(/\|/g, '\\|')}\` | ${h.file}:${h.line} | ${h.context.replace(/\|/g, '\\|')} |`);
});
md.push('');

md.push('## TS-Exports pro File');
md.push('');
const byFile = new Map();
for (const e of results.tsExports) {
  if (!byFile.has(e.file)) byFile.set(e.file, []);
  byFile.get(e.file).push(e);
}
for (const [file, items] of [...byFile.entries()].sort()) {
  md.push(`### ${file}`);
  md.push('');
  items.forEach(i => md.push(`- \`${i.name}\` (line ${i.line})`));
  md.push('');
}

md.push('## HTML-Functions (Top 60 Legacy-Block in index.html)');
md.push('');
md.push('| Function | Line |');
md.push('|---|---|');
results.htmlFunctions.slice(0, 60).forEach(f => md.push(`| \`${f.name}\` | ${f.line} |`));
md.push('');

md.push('---');
md.push('');
md.push('**Hinweis:** Dieses Inventory ist ein Rohbild — Legacy-JS in `index.html` hat viele Helper-Functions, die sich über ~21k Lines erstrecken. Migration nach `src/` erfolgt inkrementell (Strangler-Pattern).');

writeFileSync(join(ROOT, 'docs/FUNCTIONS-INVENTORY-v2.md'), md.join('\n'));
console.log(`✅ ${results.onclickHandlers.length} onclicks, ${results.tsExports.length} TS-exports, ${results.htmlFunctions.length} HTML-fns → docs/FUNCTIONS-INVENTORY-v2.md`);
console.log(
  `ℹ️  tbm-item Coverage: ${tc.fullyTagged}/${tc.total} fully tagged ` +
  `(mode: ${tc.withMode}, tier: ${tc.withTier})`,
);
// CI-Signal: bei <100% Coverage exit 0 aber loud-warning. Kein Hardfail —
// neue Items dürfen ungetaggt landen, der Audit zeigt's.
if (tc.fullyTagged < tc.total) {
  console.warn(
    `⚠️  ${tc.total - tc.fullyTagged} tbm-item(s) ohne vollständige Tags. ` +
    `Folge-PR mit data-mode + data-tier nötig.`,
  );
}
