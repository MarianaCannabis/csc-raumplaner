#!/usr/bin/env node
// P16 — Lighthouse-Baseline-Runner.
//
// Läuft lokal (User muss Chrome haben). Gegen preview-Build (Port 4173),
// nicht Dev-Server — der Dev-Mode ist nicht repräsentativ für Prod-Perf.
//
// Usage:
//   npm run build && npm run preview &   # preview läuft im Hintergrund
//   node scripts/lighthouse-baseline.mjs
//   kill %1                               # preview stoppen
//
// Output:
//   docs/lighthouse-v2.3-report.html    (Human-readable)
//   docs/lighthouse-v2.3-summary.json   (Scores zum Automatisieren)
//
// Scores werden konsolenlog-ausgegeben im Format "perf: 92 / a11y: 98 / ..."

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const URL = process.env.LH_URL || 'http://localhost:4173';
const OUT_HTML = join(ROOT, 'docs/lighthouse-v2.3-report.html');
const OUT_JSON_FULL = join(ROOT, 'docs/lighthouse-v2.3-full.json');
const OUT_SUMMARY = join(ROOT, 'docs/lighthouse-v2.3-summary.json');

console.log(`🚦 Lighthouse-Baseline läuft gegen ${URL}`);
console.log('(Sicherstellen: npm run preview läuft im Hintergrund auf Port 4173)');
console.log();

const args = [
  '-y', 'lighthouse',
  URL,
  '--output=html', '--output=json',
  `--output-path=${OUT_HTML.replace(/\.html$/, '')}`,
  '--chrome-flags=--headless=new --no-sandbox',
  // PWA wurde in Lighthouse 12 entfernt — nur noch die 4 Core-Categorien.
  '--only-categories=performance,accessibility,best-practices,seo',
  '--quiet',
];

// fix/e2e-green Bug C: Windows spawn braucht shell:true damit npx.cmd/npx.ps1
// via PATHEXT gefunden werden. Linux/macOS ist shell:true harmlos.
const proc = spawn('npx', args, { stdio: 'inherit', shell: true });

proc.on('exit', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Lighthouse exit ${code}`);
    process.exit(code || 1);
  }
  // Lighthouse writes <path>.report.json — extract scores
  const jsonPath = OUT_HTML.replace(/\.html$/, '') + '.report.json';
  if (!existsSync(jsonPath)) {
    console.error(`❌ Kein Report gefunden: ${jsonPath}`);
    process.exit(2);
  }
  const report = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const summary = {
    url: URL,
    runAt: new Date().toISOString(),
    scores: {
      performance:   Math.round((report.categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((report.categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((report.categories['best-practices']?.score ?? 0) * 100),
      seo:           Math.round((report.categories.seo?.score ?? 0) * 100),
    },
    metrics: {
      fcp:   report.audits['first-contentful-paint']?.numericValue,
      lcp:   report.audits['largest-contentful-paint']?.numericValue,
      cls:   report.audits['cumulative-layout-shift']?.numericValue,
      tbt:   report.audits['total-blocking-time']?.numericValue,
      si:    report.audits['speed-index']?.numericValue,
    },
  };
  // Full JSON als Backup, dann auf summary reduzieren (JSON ist groß, ~3 MB)
  writeFileSync(OUT_JSON_FULL, JSON.stringify(report, null, 2));
  writeFileSync(OUT_SUMMARY, JSON.stringify(summary, null, 2));

  const { performance: p, accessibility: a, bestPractices: b, seo: s } = summary.scores;
  console.log();
  console.log(`✅ perf: ${p} · a11y: ${a} · best-practices: ${b} · seo: ${s}`);
  console.log(`📊 ${OUT_SUMMARY}`);
  console.log(`📄 ${OUT_HTML}`);
});
