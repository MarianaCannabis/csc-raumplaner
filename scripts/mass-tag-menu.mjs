#!/usr/bin/env node
// P12.1 — Massen-Tagging aller onclick-Elemente in index.html.
//
// Regeln:
//   data-mode="event" → Element-Kontext enthält Messe/Mari-Jane/Packlist/…
//   data-mode="room"  → Element-Kontext enthält KCanG/Mitglied/Hygiene/…
//   kein data-mode    → universal (Speichern, 2D/3D, Maße, …)
//
//   data-tier="pro"    → IFC/CAD/Debug/Raw/Security-Report/…
//   data-tier="simple" → explizite Whitelist (Core-Actions)
//   kein data-tier     → standard (Default)
//
// Das Skript:
//   1. Lässt Elemente in Ruhe, die bereits getaggt sind
//   2. Tagt nur EXAKT die Elemente, deren Kontext eindeutig matcht
//   3. Druckt am Ende die Zähler nach Kategorie
//
// Absicht: kein false-positive. Im Zweifelsfall bleibt das Item untagged
// (= sichtbar in beiden Modi, Standard-Tier). Die Command-Palette ist der
// Universal-Zugriff und ignoriert diese Tags grundsätzlich.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const HTML = join(ROOT, 'index.html');

// ─── Regex-Pattern ──────────────────────────────────────────────────────────

const EVENT_PATTERNS = [
  /Messe/i,
  /Mari-?Jane/i,
  /Dmexco/i,
  /Gamescom/i,
  /openPacklist/,
  /exportPacklist/,
  /Packliste/i,
  /Veranstaltung/i,
  /openMesseBudget/,
  /calcMesseBudget/,
  /Stehtisch/i,
  /Rollup/i,
  /Messeordnung/i,
  /regulationRules/,
  /openStandPreview/,
  /openBoothHeight/,
];

const ROOM_PATTERNS = [
  /KCanG/,
  /Hygiene/,
  /Präventionsbeauftragter/,
  /preventionOfficer/,
  /generateAuthorityPackage/,
  /generateSessionProtocol/,
  /generateOpeningHoursSign/,
  /openSetupWizard/,
  /windowsFilmed/,
  /visualScreen/,
  /youthProtection/,
  /poiCscDistance/,
  /Mitgliederzahl/,
  /memberCount/,
  /Mitgliederverwaltung/,
  /openKCaNG/,
  /toggleKCaNG/,
  /Bubatzkarte/,
  // deliberately NOT matching pure "Ausgabe" — too ambiguous
];

// Elements that are pro-tier (advanced/power-user features)
const PRO_PATTERNS = [
  /exportIFC/,
  /downloadIfc/,
  /exportEvacuationPlan/,
  /generateSecurityReport/,
  /aiSecurityAudit/,
  /aiAccessibleRebuild/,
  /optimizeFurnitureInRoom/,
  /printBarcodeLabel/,
  /exportFBX/,
  /adminSQL/,
  /rawDB/,
  /cscDebug/,
  /developerMode/,
  /openRawJSON/,
  /openDebugConsole/,
  /openTeamsModal/,
  /teams\./,
  /openMarketplaceUpload/,
  /publishToMarketplace/,
];

// Explicit whitelist of simple-tier (core actions — every user needs these)
const SIMPLE_HANDLERS = new Set([
  'newProj',
  'saveProj',
  'loadProj',
  'openTemplates',
  'setView',
  'set2DTool',
  'undo',
  'redo',
  'toggleTheme',
  'openHelpModal',
  'openHelp',
  'signOut',
  'logout',
  'closeM',
  'openM',
  'showMod',
  'closeMod',
  'closeTBMenu',
  'toggleTBMenu',
  'dlJSON', // very basic export
]);

// ─── Helper ────────────────────────────────────────────────────────────────

/** Extract the first function-call from an onclick string. */
function handlerName(onclickValue) {
  const m = onclickValue.match(/^\s*([A-Za-z_][\w$]*)\s*\(/);
  return m ? m[1] : '';
}

function matchesAny(patterns, text) {
  return patterns.some((re) => re.test(text));
}

/** Inject data-mode/data-tier into a tag's attribute-list if absent. */
function inject(tagMatch, modeValue, tierValue) {
  // tagMatch is the full opening-tag string, e.g. `<div class="tbm-item" onclick="foo()">`
  let out = tagMatch;
  if (modeValue && !/\sdata-mode=/.test(out)) {
    out = out.replace(/\sonclick=/, ` data-mode="${modeValue}" onclick=`);
  }
  if (tierValue && !/\sdata-tier=/.test(out)) {
    out = out.replace(/\sonclick=/, ` data-tier="${tierValue}" onclick=`);
  }
  return out;
}

// ─── Main ──────────────────────────────────────────────────────────────────

let src = readFileSync(HTML, 'utf8');
const stats = {
  total: 0,
  untouched: 0,
  addedMode: { event: 0, room: 0 },
  addedTier: { simple: 0, pro: 0 },
  skipped: 0,
};

// Match any opening-tag that contains onclick="...". Greedy would eat
// across lines — we allow attributes across lines but stop at the first >.
// Non-greedy plus the exclusion of > inside the attribute value.
const TAG_RE = /<(?:div|button|a|span|li|details|summary|input|select|option)\b[^>]*\sonclick="([^"]+)"[^>]*>/gi;

src = src.replace(TAG_RE, (fullTag, onclickValue) => {
  stats.total += 1;

  const handler = handlerName(onclickValue);
  const hasMode = /\sdata-mode=/.test(fullTag);
  const hasTier = /\sdata-tier=/.test(fullTag);

  // Decide mode
  let modeValue = null;
  if (!hasMode) {
    if (matchesAny(EVENT_PATTERNS, fullTag)) modeValue = 'event';
    else if (matchesAny(ROOM_PATTERNS, fullTag)) modeValue = 'room';
  }

  // Decide tier
  let tierValue = null;
  if (!hasTier) {
    if (matchesAny(PRO_PATTERNS, fullTag)) tierValue = 'pro';
    else if (SIMPLE_HANDLERS.has(handler)) tierValue = 'simple';
  }

  if (!modeValue && !tierValue) {
    if (hasMode || hasTier) stats.untouched += 1;
    else stats.skipped += 1;
    return fullTag;
  }

  if (modeValue) stats.addedMode[modeValue] += 1;
  if (tierValue) stats.addedTier[tierValue] += 1;

  return inject(fullTag, modeValue, tierValue);
});

writeFileSync(HTML, src);

console.log('─── P12.1 Mass-Tagging Report ───────────────────────────');
console.log(`Total onclick-bearing tags scanned: ${stats.total}`);
console.log(`Already tagged (preserved):          ${stats.untouched}`);
console.log(`Untagged (universal/standard):       ${stats.skipped}`);
console.log(`Added data-mode="event":             ${stats.addedMode.event}`);
console.log(`Added data-mode="room":              ${stats.addedMode.room}`);
console.log(`Added data-tier="pro":               ${stats.addedTier.pro}`);
console.log(`Added data-tier="simple":            ${stats.addedTier.simple}`);
