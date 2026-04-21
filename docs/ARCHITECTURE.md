# Architektur — CSC Raumplaner Pro (v2.2)

Stand: 2026-04-21 · Zielgruppe: neue Contributors + externe Reviewer

## Top-Level

```
┌──────────────┐      ┌─────────────────┐      ┌────────────────┐
│  Browser     │─────▶│  Supabase       │─────▶│  Anthropic     │
│  (PWA)       │      │  (Auth + DB +   │      │  Claude API    │
│              │      │   Edge-Funcs)   │      │  (via proxy)   │
└──────┬───────┘      └─────────────────┘      └────────────────┘
       │
   ┌───┴─────────────────┐
   │  index.html         │
   │  (21k inline JS)    │◀── Strangler-Migrationsziel
   │  + src/styles/*.css │
   └────────┬────────────┘
            │
            ▼
   ┌─────────────────────┐
   │  src/*.ts           │
   │  (Vite-Bundle)      │
   └─────────────────────┘
```

## Bundle-Layout

Der Build emittet (via Vite 8):

| File | Inhalt | Größe gz |
|---|---|---|
| `dist/index.html` | App-Shell + Legacy inline-JS (21k Zeilen) | ~340 KB |
| `dist/assets/index-<hash>.js` | TS-Entry + Bridges zu `window.csc*` | ~69 KB |
| `dist/assets/index-<hash>.css` | Extracted main CSS | ~16 KB |
| `dist/assets/three.module-<hash>.js` | Three.js r184 (PBR + Bloom + HDRLoader) | ~181 KB |
| `dist/assets/GLTFLoader-<hash>.js` | Chunked (used only at import-time) | ~13 KB |
| `dist/assets/escapeRoute.worker-<hash>.js` | Flucht-Analyse Web-Worker | <1 KB |

**Total: ~624 KB gz.**

## Code-Organisation

### `index.html` (Legacy-Monolith)
~21k Zeilen inline-JS. DOM-Setup, onclick-Handler, alle Rendering-Primitives (Canvas 2D + Three.js 3D), Modal-UI, Cloud-Save, Export. Wird **inkrementell** durch Strangler-Pattern abgelöst — Funktionen wandern in `src/` und werden über `window.csc*`-Bridges wieder sichtbar gemacht.

### `src/` (TypeScript-Migration)

| Modul | Inhalt |
|---|---|
| `src/main.ts` | Vite-Entry, importiert + exponiert Module als `window.csc*`-Bridges |
| `src/styles/main.css` | Extrahiertes CSS (ex-inline) |
| `src/compliance/` | Rule-Registry + 21 Regeln + Metriken (calcCapacity, calcFireSafety, energyCertificate) |
| `src/modes/planningMode.ts` | **P11.1:** room/event Mode-Switcher + isRuleActive-Filter |
| `src/catalog/items/` | ~21 Kategorie-Files, zusammen 492 Items (CSC + Event) |
| `src/catalog/grounds.ts` | 9 Boden-Material-Definitionen |
| `src/three/` | Primitive-Builder, Event-Builder, PBR-Material-Factories, HDRI-Environment |
| `src/templates/index.ts` | 14 System-Templates (Mari-Jane/Dmexco/Boot/Showroom/…) |
| `src/geo/overpass.ts` | Nominatim + Overpass-Wrapper für POI-Abstands-Check (KCanG §13) |
| `src/export/ifc.ts` | Handgeschriebener IFC2x3 STEP-21 Exporter (~200 LOC, kein 24 MB web-ifc-dep) |
| `src/i18n/index.ts` | Mini-i18n ohne Framework, DE/EN/NL/ES Dictionaries |
| `src/config/features.ts` | Feature-Flag-Framework (Free/Pro/Team/Enterprise-Tier-Limits) |
| `src/workers/escapeRoute.worker.ts` | Flucht-Analyse-Worker (BFS über Raum-Graph) |
| `src/util/imageUpload.ts` | Bild-Upload-Processor (Resize + Base64) |

### `src/compliance/rules/` (21 Files)

| File | Kategorie | modes |
|---|---|---|
| alarm, kamera, eingang-sec | security | *universal* |
| feuerloescher, rauchmelder, notausgang, roomSmokeDetector, escapeRoute | fire | *universal* |
| kapazitaet | capacity | *universal* |
| roomDoorWidth, roomMinArea | accessibility | *universal* |
| wc, lager | room | *universal* |
| memberLimit | member | `room` |
| preventionOfficer | member | `room` |
| visualScreen | screen | `room` |
| youthProtection | youth | `room` |
| poiCscDistance | poi | `room` |
| ausgabe, sozial | room | `room` |
| messeHeightLimit | room | `event` |

## Compliance-Pipeline

```
ctx = { rooms, objects, meta, currentRoom? }
 │
 ▼
registerRule(...)         ← 21 Regeln melden sich selbst an
 │
 ▼
listActiveRules(mode)     ← P11.1: filtert nach planning-mode
 │  .filter(scope='project')
 ▼
evaluateAll(ctx)           ← oder evaluateForRoom(ctx, room)
 │
 ▼
[{rule, passed, details}, ...] → UI-Badges / Modal / Autofix
```

Worker-Integration: `scheduleAnalysis(rooms, objects)` → `escapeRoute.worker.ts` läuft BFS, `subscribe(cb)` benachrichtigt Listener, `escapeRoute.ts`-Regel liest `getLatestAnalysis()`.

## UI-Mode × Planning-Mode

Zwei orthogonale Dimensionen via `<body data-*>`:

| Attribut | Werte | Effekt |
|---|---|---|
| `data-ui-mode` | `simple` / `standard` / `pro` | Progressive Disclosure (versteckt via `data-tier` Markierung) |
| `data-planning-mode` | `room` / `event` | Raumplanung vs. Veranstaltung (versteckt via `data-mode` Markierung) |

Elemente **ohne** Tag sind in **beiden** Modi + **allen** Tiers sichtbar.

CSS-Regeln in `src/styles/main.css`:
```css
body[data-ui-mode="simple"] [data-tier="pro"],
body[data-ui-mode="simple"] [data-tier="standard"],
body[data-ui-mode="standard"] [data-tier="pro"] { display:none !important; }

body[data-planning-mode="room"]  [data-mode="event"],
body[data-planning-mode="event"] [data-mode="room"]  { display:none !important; }
```

## Persistenz / Cloud

Supabase-Tables (alle RLS-geschützt):

| Table | Inhalt | Scope |
|---|---|---|
| `csc_projects` | Projekte (JSON) + `team_id` für Team-Projekte | owner OR team-member |
| `csc_user_templates` | User-Created Templates | owner |
| `csc_teams` + `csc_team_members` | Teams (admin/editor/viewer) | member |
| `csc_subscriptions` | Tier + Stripe-IDs | owner (insert via service_role only) |
| `csc_marketplace_templates` | Community-Templates | owner schreibt, alle lesen `status=approved` |
| `csc_sessions` | Realtime-Presence | alle in Project |

Migrations: `supabase/migrations/0001_rls.sql` ... `0007_marketplace.sql`.

## Edge-Functions

- `anthropic-proxy` — JWT-Verify, proxyt an Anthropic Claude API, PDF-Vision-Support für Messeordnung-Import

## Test-Infrastruktur (P11.4)

### Unit-Tests (Vitest)
- `src/**/*.test.ts` — 26 Tests, läuft in jsdom-Env
- Coverage via V8, HTML/LCOV-Report
- Gate: 40 % lines/functions/branches/statements minimum

### E2E-Tests (Playwright, P11.4)
- `tests/e2e/*.spec.ts` — 5 Spec-Files (smoke, planning-mode, ui-mode, command-palette, a11y)
- Chromium-only, webServer-Autostart auf Port 5173
- CI: `.github/workflows/e2e.yml` (PR + nightly)

### Static Analysis
- `scripts/audit-functions.mjs` — Funktions-Inventory aller onclick-Handler + TS-Exports
- `scripts/broken-flow-detect.mjs` — Regex-Cross-Reference: onclick-Calls vs definierte Functions

## Deployment

GitHub Pages (static-host). Kein CI/CD-Step außer E2E — der `main`-Branch wird auto-deployed.

## Performance-Konstanten

- `DEBOUNCE_SAVE_MS = 800` — Projekt-Auto-Save debounce
- `WORKER_TIMEOUT_MS = 5000` — Flucht-Analyse-Timeout
- Cache-Key-Versionierung: `public/sw.js` hat `CACHE_VERSION = 'csc-v1'` (manuelle Bumps bei asset-changes)

## Strangler-Fortschritt

Ratio `src/**/*.ts` vs `index.html`:
- `src/` heute: ~6,700 Zeilen
- `index.html`: 32k Zeilen inkl. CSS (jetzt ausgelagert: HTML+inline-JS: ~30k)
- Ratio: ~22 %

**Nächste Strangler-Ziele (v2.3):**
1. Render-Schleife 2D (`draw2D`) → `src/render/render2d.ts`
2. Render-Schleife 3D (`rebuild3D`) → `src/render/render3d.ts`
3. Cloud-Save/Load → `src/cloud/project-io.ts`
4. Export-Handler (DXF/CSV/PDF) → `src/export/*.ts`
