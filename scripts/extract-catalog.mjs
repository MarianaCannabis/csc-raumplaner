#!/usr/bin/env node
// One-shot extractor: liest BUILTIN + ARCH aus index.html (Zeilen 2845-3284
// und 3286-3510 aktuell) und schreibt sie als JSON nach data/builtin.json
// und data/arch.json.
//
// Konvertiert Hex-Color-Literale (0xRRGGBB) in Decimal-Integer, damit sie
// JSON-kompatibel sind. Alle anderen Felder (strings, numbers) bleiben 1:1.
//
// Safe: `eval` der Array-Literale in einem isolierten VM-Context, keine
// I/O in dem Snippet selbst. Data hat vorab manuell geprüft: keine
// Funktionen, keine Dynamik, nur Objekt-Literale.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const HTML = join(ROOT, 'index.html');
const DATA_DIR = join(ROOT, 'data');

function extractArrayBlock(src, markerStart, markerEnd) {
  const startIdx = src.indexOf(markerStart);
  if (startIdx < 0) throw new Error('Start-Marker nicht gefunden: ' + markerStart);
  const endIdx = src.indexOf(markerEnd, startIdx);
  if (endIdx < 0) throw new Error('End-Marker nicht gefunden: ' + markerEnd);
  // Include the closing ];
  return src.slice(startIdx, endIdx + markerEnd.length);
}

function evalArrayLiteral(source) {
  // source = "const NAME = [ ... ];"
  // Wrap with return to get value out
  const wrapped = `(() => { ${source} return ${source.match(/^const\s+(\w+)/)[1]}; })()`;
  const script = new vm.Script(wrapped);
  return script.runInNewContext({});
}

function toJson(items) {
  // Hex-Preservation: JSON.stringify schreibt 0xb86c1a als dezimal 12085786.
  // Das ist korrekt — der Consumer-Code (new THREE.Color(col)) akzeptiert
  // beides. Kein Datenverlust.
  return JSON.stringify(items, null, 2);
}

const html = readFileSync(HTML, 'utf8');

const builtinSrc = extractArrayBlock(html, 'const BUILTIN = [', '];');
const archSrc    = extractArrayBlock(html, 'const ARCH = [',    '];');

const BUILTIN = evalArrayLiteral(builtinSrc);
const ARCH    = evalArrayLiteral(archSrc);

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(join(DATA_DIR, 'builtin.json'), toJson(BUILTIN), 'utf8');
writeFileSync(join(DATA_DIR, 'arch.json'),    toJson(ARCH),    'utf8');

console.log(`✅ data/builtin.json: ${BUILTIN.length} Items`);
console.log(`✅ data/arch.json:    ${ARCH.length} Items`);
