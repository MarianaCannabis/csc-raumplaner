#!/usr/bin/env node
// Feature-Selbsttest (Mega-Sammel #7-12) — prüft FEATURE-MANIFEST.json gegen
// die tatsächliche Codebase. Source-of-Truth ist `docs/FEATURE-MANIFEST.json`;
// wenn ein Feature dort gelistet ist und im Code fehlt, exit 1.
//
// Läuft als Teil von `npm run audit:all`. Bei jedem PR + push.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

const manifest = JSON.parse(read('docs/FEATURE-MANIFEST.json'));
const indexHtml = read('index.html');
const mainTs = read('src/main.ts');
const complianceIndex = read('src/compliance/index.ts');

const issues = [];

// ── 1. Catalog-Items (zähl items via cat:-Pattern in items/*.ts) ─────
{
  const itemsDir = join(ROOT, 'src/catalog/items');
  let total = 0;
  let stairsCount = 0;
  for (const f of readdirSync(itemsDir)) {
    if (!f.endsWith('.ts') || f.endsWith('.test.ts')) continue;
    const src = read(`src/catalog/items/${f}`);
    total += (src.match(/\bcat:\s*'/g) ?? []).length;
    if (f === 'stairs.ts') stairsCount = (src.match(/id:\s*'stairs-/g) ?? []).length;
  }
  if (total < manifest.categories.catalog.expected_min_items) {
    issues.push(`Catalog: ${total} items < expected_min ${manifest.categories.catalog.expected_min_items}`);
  }
  if (stairsCount < manifest.categories.catalog.expected_stairs_items) {
    issues.push(`Stairs-Catalog: ${stairsCount} items < expected ${manifest.categories.catalog.expected_stairs_items}`);
  }
  console.log(`✓ Catalog: ${total} items (stairs: ${stairsCount})`);
}

// ── 2. Compliance-Rules (count `import './rules/...'` in compliance/index.ts) ─
{
  const ruleImports = (complianceIndex.match(/^import\s+'\.\/rules\//gm) ?? []).length;
  if (ruleImports < manifest.categories.compliance.expected_min_rule_imports) {
    issues.push(`Compliance: ${ruleImports} rule imports < expected ${manifest.categories.compliance.expected_min_rule_imports}`);
  }
  console.log(`✓ Compliance: ${ruleImports} rule imports`);
}

// ── 3. Modals — index.html muss alle erwarteten id="m-XXX" enthalten ─
{
  let missing = 0;
  for (const id of manifest.categories.modals.expected_ids) {
    if (!indexHtml.includes(`id="${id}"`) && !indexHtml.includes(`id='${id}'`)) {
      issues.push(`Modal #${id} fehlt in index.html`);
      missing++;
    }
  }
  console.log(`✓ Modals: ${manifest.categories.modals.expected_ids.length - missing}/${manifest.categories.modals.expected_ids.length} present`);
}

// ── 4. Window-Bridges — main.ts muss alle erwarteten window.cscX = haben ──
{
  let missing = 0;
  for (const bridge of manifest.categories.window_bridges.expected) {
    if (!mainTs.includes(`window.${bridge}`)) {
      issues.push(`Bridge window.${bridge} fehlt in src/main.ts`);
      missing++;
    }
  }
  console.log(`✓ Bridges: ${manifest.categories.window_bridges.expected.length - missing}/${manifest.categories.window_bridges.expected.length} present`);
}

// ── 5. Right-Panel-Tabs — index.html muss data-tab + showRight-Liste haben ──
{
  let missing = 0;
  for (const tab of manifest.categories.right_panel_tabs.expected) {
    if (!indexHtml.includes(`showRight('${tab}')`)) {
      issues.push(`Right-Panel-Tab '${tab}' onclick fehlt in index.html`);
      missing++;
    }
  }
  console.log(`✓ Right-Panel-Tabs: ${manifest.categories.right_panel_tabs.expected.length - missing}/${manifest.categories.right_panel_tabs.expected.length} present`);
}

// ── 6. Migrations — alle expected files existieren ────────────────────
{
  let missing = 0;
  for (const mig of manifest.categories.migrations.expected_files) {
    if (!existsSync(join(ROOT, 'supabase/migrations', mig))) {
      issues.push(`Migration ${mig} fehlt in supabase/migrations/`);
      missing++;
    }
  }
  console.log(`✓ Migrations: ${manifest.categories.migrations.expected_files.length - missing}/${manifest.categories.migrations.expected_files.length} present`);
}

// ── 7. Edge-Functions — expected dirs existieren ──────────────────────
{
  let missing = 0;
  for (const fn of manifest.categories.edge_functions.expected) {
    const fnFile = join(ROOT, 'supabase/functions', fn, 'index.ts');
    if (!existsSync(fnFile)) {
      issues.push(`Edge-Function ${fn} fehlt (kein supabase/functions/${fn}/index.ts)`);
      missing++;
    }
  }
  console.log(`✓ Edge-Functions: ${manifest.categories.edge_functions.expected.length - missing}/${manifest.categories.edge_functions.expected.length} present`);
}

// ── Report ────────────────────────────────────────────────────────────
console.log('');
if (issues.length === 0) {
  console.log(`✅ Feature-Audit: alle Manifest-Items vorhanden (v${manifest.version})`);
  process.exit(0);
} else {
  console.log(`❌ Feature-Audit: ${issues.length} Issue(s)`);
  for (const i of issues) console.log(`  - ${i}`);
  process.exit(1);
}
