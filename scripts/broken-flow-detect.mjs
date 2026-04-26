#!/usr/bin/env node
// P10.1 — Broken-Flow-Detector (static, ohne Headless-Browser).
//
// Strategie:
// 1. Sammle alle onclick-Handler aus HTML-Dateien (regex-extract).
// 2. Extrahiere den ersten call: "fooBar(…)" → "fooBar".
// 3. Sammle alle definierten Funktionen (HTML + TS + window.X-Bindings).
// 4. Match: jedes onclick-Call muss entweder eine globale Funktion oder
//    ein window.X-Hook sein.
// 5. Report: unresolved Handler in docs/BROKEN-FLOWS-<datum>.md.
//
// Limitierung: findet nicht Runtime-Fehler (null refs, late-bound APIs)
// — dafür bräuchte es einen echten Headless-Browser. Diese statische
// Analyse fängt aber typische Refactor-Lücken (umbenannte Funktionen,
// vergessene Bindings).

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

// 1. Definierte Funktionen + window-Bindings sammeln
const defined = new Set();
// Built-in browser APIs / common globals — ignoriere die
const BUILTINS = new Set([
  'alert', 'confirm', 'prompt', 'console', 'fetch', 'parseInt', 'parseFloat',
  'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 'Date', 'encodeURIComponent',
  'decodeURIComponent', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'document', 'window', 'location', 'navigator', 'localStorage', 'sessionStorage',
  'event', 'this', 'e',
]);
BUILTINS.forEach((b) => defined.add(b));

for (const p of walk(ROOT)) {
  if (!/\.(html|ts|mjs|js)$/.test(p)) continue;
  if (p.includes('/node_modules/') || p.includes('/dist/')) continue;
  const src = readFileSync(p, 'utf8');
  // function foo(...)
  for (const m of src.matchAll(/\bfunction\s+([A-Za-z_][\w$]*)\s*\(/g)) defined.add(m[1]);
  // const foo = / let foo =
  for (const m of src.matchAll(/\b(?:const|let|var)\s+([A-Za-z_][\w$]*)\s*=/g)) defined.add(m[1]);
  // window.foo = / window['foo'] =
  for (const m of src.matchAll(/window\.([A-Za-z_][\w$]*)\s*=/g)) defined.add(m[1]);
}

// 2. onclick-Handler sammeln + Root-Call extrahieren
const unresolved = [];
const resolved = [];
for (const p of walk(ROOT)) {
  if (!p.endsWith('.html') || p.includes('/dist/')) continue;
  const src = readFileSync(p, 'utf8');
  src.split('\n').forEach((line, i) => {
    const lineNum = i + 1;
    for (const m of line.matchAll(/onclick="([^"]+)"/g)) {
      const handler = m[1];
      // Extrahiere den ersten Identifier am Anfang (vor Klammer oder Punkt)
      const callMatch = handler.match(/^\s*([A-Za-z_][\w$]*)/);
      if (!callMatch) continue;
      const callName = callMatch[1];
      // Skip: JS-Keywords + Pseudo-Identifier — diese sind nie aufrufbare
      // Funktionen, sondern Statement-Starter (`try{...}`, `throw new X()`,
      // `await foo()` etc.). Ohne diese Skip-Liste meldet der Detector
      // false-positives für inline-onclick-Handler die mit Statements
      // beginnen statt mit Function-Calls.
      if ([
        'return', 'if', 'else', 'true', 'false', 'null', 'undefined', 'new',
        'try', 'catch', 'finally', 'throw', 'await', 'async', 'function',
        'var', 'let', 'const', 'do', 'while', 'for', 'switch', 'case',
        'break', 'continue', 'typeof', 'instanceof', 'void', 'delete',
        'yield', 'class', 'extends', 'super', 'this',
      ].includes(callName)) continue;
      const row = { file: rel(p), line: lineNum, callName, handler: handler.slice(0, 80) };
      if (defined.has(callName)) resolved.push(row);
      else unresolved.push(row);
    }
  });
}

// 3. Report
const now = new Date().toISOString().slice(0, 10);
const md = [];
md.push(`# Broken Flows — ${now}`);
md.push('');
md.push('Statische Analyse: alle `onclick="X(…)"` gegen definierte Functions gemuxt.');
md.push('');
md.push(`## Ergebnis`);
md.push('');
md.push(`- Geprüfte onclick-Handler: ${resolved.length + unresolved.length}`);
md.push(`- ✅ Resolved (Function ist definiert): ${resolved.length}`);
md.push(`- ❌ Unresolved: ${unresolved.length}`);
md.push('');
if (unresolved.length > 0) {
  md.push('## Unresolved (Potential Broken Flows)');
  md.push('');
  md.push('| Handler | Funktion | File:Line |');
  md.push('|---|---|---|');
  // Dedupe auf callName
  const seen = new Set();
  for (const u of unresolved) {
    if (seen.has(u.callName)) continue;
    seen.add(u.callName);
    md.push(`| \`${u.handler.replace(/\|/g, '\\|')}\` | \`${u.callName}\` | ${u.file}:${u.line} |`);
  }
  md.push('');
  md.push('**Hinweis:** Unresolved kann False-Positive sein wenn die Funktion via `<script src>` kommt (pdf.js, mammoth, JSZip-CDN) oder zur Laufzeit via `window.X = …` zugewiesen wird nachdem der HTML-Parser die Handler-Strings schon gelesen hat. Manuell prüfen.');
} else {
  md.push('✅ Keine unresolved Handler gefunden.');
}

writeFileSync(join(ROOT, `docs/BROKEN-FLOWS-${now}.md`), md.join('\n'));
console.log(`✅ ${resolved.length} resolved, ${unresolved.length} potentiell broken → docs/BROKEN-FLOWS-${now}.md`);
if (unresolved.length > 50) process.exit(1); // CI-Signal bei vielen Regressions
