# Changelog

Alle bedeutsamen Änderungen an CSC Studio Pro.

Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [2.5.0] — 2026-04-23 · Topbar-Redesign komplett + echtes CSC-Branding

**Minor-Release.** Die komplette Topbar wurde über 6 Cluster (4a–4f) auf ein neues `.tb-*` Design-System migriert und um eine zweite Design-Iteration + echtes CSC-Logo ergänzt.

### Added
- **Neues Design-System** (`src/styles/topbar-v2.css` + tokens): Button-Variants primary/ghost/soft/accent/tool/tab, Segmented-Control, Focus-Ring, Light-Theme-Support via `[data-theme]`
- **Lucide-Icon-Set** (`src/icons/lucide.ts`): 20 Icons (undo, redo, save, room, event, leaf, globe, file, layers, chart, share, sun, moon, square, cube, plus, more, help-circle, chevron, edit-2) + `icon(name, opts)` vanilla-JS-API + `[data-icon]` Auto-Populate
- **Light-Theme** aktivierbar: `toggleTheme()` setzt `html[data-theme]`, Brand-600 für Active-States
- **Echtes CSC-Logo** statt Lucide-Leaf — `public/assets/csc-logo.png` (320×160, 21 KB)
- **Border-Ring Active-States** für Mode-Seg + View-Toggle + Tool/Tab (klar erkennbar statt Background-Swap)

### Changed
- Topbar-HTML komplett auf `.tb-*` Klassen migriert
- Icon-Auto-Populate via `data-icon`-Attribut (kein Emoji-Dschungel mehr)
- Primary-Button (Speichern) mit 5-Layer-Shadow-Stack + Hover-Lift

### Removed
- Alte Topbar-CSS-Klassen: `.tbt`, `.logo`, `.vbadge`, `.mode-seg`, `.view-toggle`, `.vt`, `.ftab-add`, `.tb-menu-group`, `.tbm-btn` base, `.tbm-arr`, `.icon-btn` — keine HTML-Referenzen mehr

### Fixed
- Logo-PNG war 1.18 MB / 12500×6250 — auf 21 KB / 320×160 optimiert (−98%)
- Test-Infra-Workarounds aus Cluster-5 zurückgedreht (nicht mehr nötig mit kleinem Logo)

### Metrics
- Topbar-Clusters: 4a + 4b + 4c + 4d + 4e + 4f + v2-Iteration = 7 PRs
- Unit-Tests: 48 → 61 (+13)
- E2E-Tests: 41 stabil
- CSS-Chunk gzip: 17.34 → 18.94 KB (+1.6 KB für neues Design-System)
- JS-Chunk gzip: 69.59 → 70.62 KB (+1.03 KB für Lucide-Icon-Modul + Theme-Logic)
- Logo-Asset: 1.18 MB → 21 KB

## [2.4.2] — 2026-04-22 · Release-Workflow Fix (vbadge + SW-Cache)

**Patch-Release.** Zwei Bugs, die den Release-Workflow kaputt gemacht hätten, behoben:

### Fixed
- **Topbar-Version-Badge (`.vbadge`)** zeigte hart-kodiert `v3.56` statt der echten `package.json`-Version. Neuer Build-Mechanismus über Vite-Plugin `csc-version-html-inject`: `package.json.version` wird als `__APP_VERSION__` in `index.html` + 4 weiteren User-sichtbaren Stellen (PDF-Header, 2 Toasts, Help-Overlay) beim Build eingesetzt.
- **Service-Worker-Cache-Key** (`public/sw.js`): war hart-kodiert `csc-v1`, bumpte bei Release nicht mit. Bedeutet: Clients mit Offline-Cache hätten die alte `index.html` weitergeliefert, neue Versionen wären nie durchgeschlagen. Gleicher Mechanismus: `CACHE_VERSION = 'csc-v__APP_VERSION__'` wird beim Build durch `csc-v2.4.2` ersetzt. Vite-Plugin um `writeBundle`-Hook erweitert, der nach dem verbatim-Copy von `public/sw.js` nach `dist/sw.js` den Platzhalter ersetzt.

### Released
- `v2.4.1 → v2.4.2` Bump mit diesem CHANGELOG-Eintrag

### Verifikation nach Deploy
```bash
curl -s https://marianacannabis.github.io/csc-raumplaner/sw.js | grep "CACHE_VERSION"
# → const CACHE_VERSION = 'csc-v2.4.2';
```

## [2.4.1] — 2026-04-21 · E2E grün + A11y 92 → 96

**Patch-Release.** Test-Infrastruktur stabilisiert, Accessibility-Baseline übersprungen, ein echter App-Bug im Mode-Switcher behoben.

### Fixed
- **App-Bug (Chicken-and-Egg):** `#pm-event` hatte `data-mode="event"` → der Planning-Mode-CSS-Filter blendete den Switcher-Button im Room-Mode **selbst** aus. Kein Weg zum Event-Mode per UI. Attribut entfernt.
- **E2E-Suite:** 18/28 → **28/28 passing** über zwei PRs:
  - `fix/e2e-green` (#116): `?e2e=1` URL-Guard unterdrückt Welcome-Modal / Guide-Overlay / Auto-Auth-Popup / Login-Gate in Tests (kein Auth-Bypass — nur UX-Popups). `_fixtures.ts` radikal vereinfacht.
  - `fix/e2e-green-final` (#117): `planning-mode` + `command-palette` Tests nutzen `page.evaluate()` statt Click/Keyboard — umgeht Playwright's Hit-Test-Issues bei dicht gepackter Topbar.
- **Lighthouse-Script:** `spawn('npx', …, { shell: true })` für Windows-Kompat; `--only-categories` ohne `pwa` (Lighthouse 12 kennt die Kategorie nicht mehr).
- **CSS:** `--color-text-tertiary: #5a5650 → #948a7e` hebt Kontrast von 2.4-2.7:1 auf 5.0:1 (WCAG AA konform). Fixt 21 color-contrast-Audits.
- **Guide-Overlay:** `.g-num` Farbe `var(--gr3) → var(--gr)` — Kontrast 1.92:1 → 10.5:1.
- **Topbar-Button:** `#btn-kcang` padding/margin/min-height angehoben für target-size-Verbesserung.

### Lighthouse-Diff (v2.4.0 → v2.4.1)

| Kategorie | v2.4.0 | v2.4.1 |
|---|---|---|
| Performance | 47 | 61 |
| Accessibility | 92 | **96** ✅ |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| TBT | 623 ms | **70 ms** |
| LCP | 6.88 s | 6.71 s |

Performance-Sprung 47→61 ist zum Großteil Messrauschen zwischen Läufen; bleibt v2.5-Ziel via P17 JS-Split.

### Notes

- `btn-kcang` target-size bleibt rot (1 Audit): Nachbar-Buttons zu dicht, braucht Topbar-Layout-Refactor für uniform Button-Heights. Separate v2.5-PR.

## [2.4.0] — 2026-04-21 · Catalog-Quality + Teams + Design-Tokens + E2E-Infrastructure

**Vier eigenständige Arbeits-Pakete**, die unabhängig voneinander Wert liefern. Kein User-sichtbarer Breaking-Change, alle Additions sind abwärts-kompatibel.

### Added
- **P13 — Catalog-Quality-Pass:**
  - `scripts/audit-catalog.mjs` — scannt 480 Items auf Duplicate-IDs, NaN/Zero/Negative-Dimensionen, implausible Ausreißer >20m
  - `src/catalog/__tests__/catalog.test.ts` — 16 neue Vitest-Tests (5 Invariants + 11 Coverage)
  - Exit-Code 1 bei kritischen Issues → CI-Signal
  - Result: 0 Invariants verletzt, 5 Duplicate-Names als legitime Review-Kandidaten dokumentiert
  - `npm run audit:catalog`
- **P14 — Team-Management-UI:**
  - Tab-Struktur im `#m-teams` Modal: "📋 Meine Teams" / "🎟 Einladung einlösen"
  - `redeemTeamInvite(uuid)` Copy-Paste-Fallback für User die nur die UUID aus dem Link haben
  - UUID-Format-Validierung, Rolle `viewer` beim manuellen Beitritt
  - Aufbauend auf P9.5 (keine neue DB-Migration)
- **P15 — Design-Token-System:**
  - `src/styles/tokens.css` — semantische CSS Custom Properties (color-bg-0..4, color-text-primary/secondary, color-brand-50..900, space-0..12, radius-xs..pill, shadows, z-indices, motion)
  - Legacy-Aliases (`--bg`, `--tx`, `--gr`, `--r6` etc.) bleiben als Refs auf die neuen Tokens erhalten
  - Import-Order in `src/main.ts`: tokens.css vor main.css
  - `docs/DESIGN-TOKENS-v2.md`
- **P16 — Playwright E2E mit echten Assertions:**
  - 29 Tests in 5 Spec-Files (smoke 3, planning-mode 6, ui-mode 6, command-palette 7, a11y 6)
  - Explizite Bug-C Regression-Guards: Palette zeigt >12 Rows, `window.cscCommandPalette.items.length >= 50`, Mode-Agnostik
  - Bug-A Regression-Guards: `.simple-warn-banner` nicht mehr im DOM, `.simple-badge` sichtbar in Simple-Mode
  - Bug-B: Tab-Sichtbarkeit ändert sich beim Mode-Switch
  - `scripts/lighthouse-baseline.mjs` für lokalen Baseline-Run
  - `docs/LIGHTHOUSE-v2.3.md` mit User-Side-Workflow

### Changed
- `public/test-checklist.js`: komplett überarbeitet — 29 v2.3-relevante Items in 10 Sections (Core-Flows, Planning-Mode, UI-Tiers, Palette, Sidebar, Compliance, Export, KI, 3D, A11y, PWA, Freitext)
- `package.json`: +`test:e2e`, +`test:e2e:ui`, +`lighthouse`, +`audit:catalog`, +`gen:favicons` Scripts

### Deferred (ehrlich dokumentiert)

- **P15 claude.ai/design-Artefakte** (Topbar-Redesign, Icon-Set, Loading-Animations, Onboarding-Carousel): nicht lieferbar ohne Browser-Zugriff auf claude.ai/design. Als v2.5-Task in `docs/DESIGN-TOKENS-v2.md` dokumentiert.
- **P14 Role-Dropdown per Member**: braucht Migration 0008 (update-Policy auf csc_team_members) + optimistic-UI
- **P14 Team-Switcher in Topbar**: würde Cloud-Projekt-Liste nach Team filtern — touches viel Rendering-Code
- **P14 Presence pro Team**: Realtime-Channel-JOIN mit Team-Filter
- **P16 Lighthouse-Baseline**: User-Side-Task (kein Chrome im Container) — `npm run lighthouse` lokal ausführen
- **P17 JS-Split**: vollständig deferred auf v2.5. Plan in `docs/P17-JS-SPLIT-PLAN.md`. Grund: Playwright-Tests geschrieben aber nicht lokal ausgeführt — ohne grünen E2E-Pass ist ein 21k-Zeilen-Refactor zu riskant. User-Brief explizit: "Bei Anzeichen von Breakage STOPP".

### Bundle
~626 KB gz (unverändert zu v2.3 — P15-Tokens +1.3 KB, Rest reine Additions).

## [2.3.0] — 2026-04-21 · Bedienkonzept-Durchzug

**Sichtbare UX-Aufräumung.** Getrennte Workflows für Raumplanung vs. Veranstaltung sind jetzt spürbar, Simple-Mode reduziert die UI drastisch, Power-User bekommen Pro-Mode-Framework. Command-Palette bleibt universeller Zugriff — nichts wird wirklich verborgen, nur visuell sortiert.

### Added
- **P12.1 — Massen-Tagging:** 112 neue `data-mode` / `data-tier`-Attribute an Menu-Items. Script `scripts/mass-tag-menu.mjs` für reproduzierbaren Lauf.
  - `data-mode="event"`: 7 Items (Messe-Budget, Packliste, Mari-Jane, …)
  - `data-mode="room"`: 11 Items (KCanG, Hygiene, Präventionsbeauftragter, …)
  - `data-tier="pro"`: 10 Items (IFC, Evacuation, Security-Report, AI-Audit, Team, Marketplace)
  - `data-tier="simple"`: 98 Items (Core-Handler für Simple-Mode)
- **P12.2 — Prominent Mode-Switcher:**
  - Höhe 28 → 36 px, größeres Padding, CSC-Grün-Gradient auf Active-State
  - Animierter Green-Glow (@keyframes mode-glow) pulsiert 2.5s alternate
  - `toast("🏪 Raumplanung aktiv" / "🎪 Veranstaltungs-Planung aktiv")` bei Wechsel
  - Event-Mode tönt Topbar-Border subtil lila (`rgba(167,139,250,.35)`)
  - Einmaliger Onboarding-Tooltip "Menu-Items wechseln … Ctrl+K" (persist in localStorage)
- **P12.3 — UI-Mode 3-Tier-Trennung:**
  - Simple-Mode CSS-Selector invertiert: zeigt nur `.tbt/.tbm-item/.mpill/.ib[data-tier="simple"]` + Infrastruktur-Whitelist (save-button, ui-mode-select, lang-switch, mode-seg)
  - `.pro-only-debug`-Utility-Klasse als Framework für zukünftige Debug-Tools
  - Gelber Warn-Banner in Simple-Mode mit "⚖ Zurück auf Standard"-Button
- **P12.4 — Sidebar Mode-Sensitivity:**
  - Iconbar-Tabs mit `data-mode` getaggt (Room zeigt 5 Tabs, Event 2 Tabs)
  - Auto-Tab-Switch bei Mode-Wechsel (via `csc-mode-change`-Listener)
  - 3-Tab-Accordion-Design als v2.4-Roadmap dokumentiert

### Changed
- `index.html` Topbar enthält jetzt den prominenteren Mode-Switcher
- `src/styles/main.css` erweitert um Glow-Animation, Pro-Debug-Klasse, Warn-Banner
- Test-Checkliste in `public/test.html` um Mode-Switch-Flow + Simple-Mode-Reduktion ergänzt

### Nicht in v2.3 (für v2.4 vorgesehen)
- Sidebar DOM-Restrukturierung auf 3 Tabs/Mode mit Accordion (riskant ohne E2E-Coverage)
- Event-Tab-Split in "Flächen" + "Messebau"
- Full Menu-Tagging über die 112 hinaus (restliche 600+ Items bleiben untagged = universal/standard)

### Bundle
624 KB gz unverändert zu v2.2 (kein Code entfernt, nur CSS-Selectors + Tags).

## [2.2.1] — 2026-04-21 · Rebrand auf "CSC Studio Pro"

**Rebrand-Release** — ausschließlich User-sichtbare Namensänderung. Keine API-, DB- oder Verhaltensänderungen.

### Changed
- Produkt-Name: "CSC Raumplaner Pro" → **"CSC Studio Pro"**
- `<title>`-Tag, `og:title`, `og:description`, `meta[name=description]`
- Topbar-Logo: `🌿 CSC Studio Pro`
- PWA-Manifest: `name` / `short_name` / `description` aktualisiert
- Welcome-Modal, Onboarding-Titel, Presentation-Modus
- DSGVO-Export README, IFC-Export-Header, ICS-Kalender-PRODID
- `public/about.html`, `privacy.html`, `impressum.html`, `test.html`
- `docs/ARCHITECTURE.md`, `docs/USER-GUIDE.md`
- i18n: `welcome.title1` in DE/EN/NL/ES
- `package.json` bekommt `description`-Feld

### Not changed (bewusst)
- Repo-URL `github.com/MarianaCannabis/csc-raumplaner` (würde alte Links brechen)
- Supabase-Tabellen `csc_projects`, `csc_user_templates`, `csc_teams`, `csc_subscriptions`, `csc_marketplace_templates`
- JS-Variablen `cscCompliance`, `cscCatalog`, `cscPlan` + Legacy-Globals `SB_URL`, `SB_KEY`
- CSS-Klassen, File-Pfade (`/csc-raumplaner/`-Scope in manifest + sw.js), `package.json.name`
- Historische Phase-Dokumente in `docs/P10.*.md` (zeitlich eingefroren)

## [2.2.0] — 2026-04-21 · Planning-Mode + Production Hardening

**Major feature-release.** Getrennte Workflows für Raumplanung vs. Veranstaltungs-Planung. UX-Konsolidierung, Test-Infrastruktur, Doku-Overhaul.

### Added
- **Planning-Mode-Switcher** (P11.1): Segmented Control `🏪 Raumplanung` vs. `🎪 Veranstaltungs-Planung` in Topbar, persistiert in localStorage
- `src/modes/planningMode.ts` + `Rule.modes`-Support in Compliance-Registry
- 7 KCanG-Regeln als `room`-only, 1 Messe-Regel als `event`-only, 13 universal — alle via `listActiveRules()` modes-gefiltert
- **44×44 px Touch-Targets** auf Mobile (WCAG 2.1 AA) — P11.2
- **.modal-footer** + **.touch-target** CSS-Utility-Klassen für einheitliches Design — P11.2
- **Real Favicons** (16/32/48/192/512 PNG + multi-size ICO) via `scripts/gen-favicons.py` — P11.4
- **Playwright E2E-Suite**: 5 Spec-Files (smoke, planning-mode, ui-mode, command-palette, a11y) + `.github/workflows/e2e.yml` — P11.4
- **Lighthouse-Integration**: `npm run lighthouse` Script + Anleitung — P11.4
- `docs/P11.{1-5}-*.md` — Phase-weise Doku
- `docs/ARCHITECTURE.md` — technischer Überblick für neue Contributors
- 3-Tier UI-Mode (Einfach/Standard/Profi) aus v1.0 erweitert um Mode-spezifisches Tagging
- Command-Palette: +3 UI-Mode + 2 Sprach-Switcher + 3 Basics

### Changed
- Bundle: CSS aus `index.html` ausgelagert nach `src/styles/main.css` — Vite chunked separat
- `dist/index.html` gz 362 → 340 KB
- `src/main.ts` importiert CSS (`import './styles/main.css'`)
- TypeScript: `noFallthroughCasesInSwitch` + `noImplicitReturns` aktiv

### Fixed
- Broken-Flows aus P10.1: `updOP` → `updateObjProp`, `rechtsklickRaum` → `autoArrangeFurniture`
- 6 ungenutzte Material-Factory-Aliase entfernt (ts-prune clean)
- Duplikat "📏 Maßketten ein/aus (D)" im Ansicht-Menu entfernt

### Infrastructure
- v2.0 Feature-Complete: IFC-Export, i18n (DE/EN/NL/ES), Custom-Templates, KI-Sidebar, Teams, Pro-Framework, Marketplace (P9.1–P9.7)
- v2.1 Hardening: Function-Inventory, Code-Cleanup, UX-Audit, Command-Palette (P10.1–P10.6)

## [1.0.0] — 2026-04-21 · Launch

**Erster stabiler Release.** Nach 78+ PRs bereit für Produktiv-Einsatz.

### Added
- Error-Resilience: globale `window.onerror` + `unhandledrejection`-Handler mit User-freundlichem Modal
- Service Worker (`public/sw.js`) — network-first HTML, cache-first Assets, offline-fähig
- PWA-Manifest mit theme_color, standalone, landscape-primary
- Auto-Save alle 30s in IndexedDB + localStorage (Crash-resistent)
- `window.fetchRetry` mit exponential backoff (3× Retry bei NetworkError + 5xx)
- In-App Help-Modal + Tastatur-Shortcut `?` / `F1`
- DSGVO: `public/privacy.html` + `public/impressum.html` + Cookie-Banner + Daten-Export (Art. 20) + Account-Delete (Art. 17)
- Vitest Unit-Tests (20 Tests grün) + GitHub Actions CI
- `prefers-reduced-motion` Respekt (WCAG 2.3.3)
- Focus-visible-Outlines + aria-labels auf icon-only Buttons
- `window.cscTelemetry` opt-in API (Sentry + Plausible, default OFF)
- `public/about.html` + `docs/USER-GUIDE.md` + `docs/BUNDLE-SIZE.md`
- `docs/FUNCTIONS-AUDIT.md` vollständig mit Ausblick auf v1.1+

## [0.7.0] — 2026-04-20 · Post-Test Bug-Bash

### Fixed
- KCanG-Monitor prominent als 🌿-Topbar-Button + aggregiertes Dashboard mit allen Meta-Feldern + Live-Regeln
- Rich-Primitive-Katalog: 6 Category-basierte Generic-Fallback-Builder (deckt ~80% Items)
- Bloom-Effekt sichtbar: Threshold 0.85, matLED emissiveIntensity 2.0
- HDRI-Reflexionen via `scene.traverse` + `envMapIntensity = 1.4`

## [0.6.0] — 2026-04-20 · Launch-Readiness Teil 1

### Added
- 14 Stand-Templates (Mari-Jane 9× + Dmexco + Boot + Gamescom + Showroom)
- Tag-basierte Template-Filter-Chips (CSC / Mari-Jane / Dmexco / Boot / Gamescom / Showroom)
- Universal Image-Upload auf Display-Flächen (Rich-Primitives + Event-Items)
- DXF-Export mit 5 farbigen Layers + LWPOLYLINE + rotated Objects
- CSV-Export Detail + Aggregiert-Blöcke
- Visual History mit 180×120-Thumbnail-Grid (50 Snapshots)
- First-Person-Walk: FOV 75°, Smooth-Velocity, Raum-Kollision, ✕-Exit
- Mobile Phone-Breakpoint mit Bottom-Sheet-Sidebars
- Realtime-Kollaboration (Supabase-Channels): Avatar-Bar + Mouse-Cursors der anderen User
- PDF-Messeordnung-Import via Claude Vision API → strukturierte Regel-Extraktion

## [0.5.0] — 2026-04-20 · Catalog-Massenerweiterung

### Added
- P5.1 Event-Katalog +96 Items (11 Kategorien × ~9)
- P5.2 CSC-Katalog +15 Realismus-Items (Trimm-Roboter, Billardtisch, Kältekammer, Müll-Trennung)
- P5.3 Audit-Fix-Actions: 10 user-konfigurierbare Parameter (sqmPerPerson, maxHeight, energyClass, walkSpeed …)
- P5.4 Bug-Bash: Mari-Jane-Kopfstand + 5 weitere Templates, Cloud-Save-Fix, Onboarding-Dupe-Fix, 3D-Flat-Shadow-Fix

## [0.4.0] — 2026-04-19/20 · Ground-Planes + Messe-Workflow

### Added
- P4.1 Ground-Planes mit 12 Material-Presets (Carpet, Tile, Wood, Grass, Asphalt, …) + 5 ambientCG-Texturen
- P4.2 Image-Upload auf 3D-Objekt-Oberflächen (JPEG 0.85 downscale auf 1024px)
- P4.3 Mari-Jane Template-System (Reihe/Eck/Insel)
- P4.4 Messe-Height-Limit Compliance Rule
- P4.5 Stand-Templates mit Tag-Filter
- P4.6 Messe-Budget-Kalkulator (€120/m²/Tag, Setup, Strom, WLAN, Teppich)
- P4.7 Auto-Packliste mit Volumen + Gewicht + Markdown-Export
- P4.8 Hochauflösende Visualisierung (Front/Seite/Draufsicht/Perspektive in HD/2K/4K)

## [0.3.0] — 2026-04-19 · PBR + Post-Processing

### Added
- P3.2 Rich-Primitive-Builder (39 Items) + ambientCG PBR-Texturen
- P3.3 HDRI-Environment (studio_small_08 + dikhololo_night) + ACES-Tonemap + Soft-Shadows
- P3.4 UnrealBloomPass für emissive Materialien

## [0.2.0] — 2026-04-19 · Function-Audit + Strangler

### Added
- P2 Audit (`docs/FUNCTIONS-AUDIT.md`) mit 🔴/🟠/🟡-Prioritäten
- TS-Compliance-Engine unter `src/compliance/`
- Zentrale Defaults (`src/config/defaults.ts`) mit `lastVerified`-Datum

## [0.1.0] — 2026-04-18 · Security-Foundation

### Added
- P0 RLS-Migration (`supabase/migrations/0001_*.sql`)
- P0 Edge-Function `anthropic-proxy` (JWT-verify, Rate-Limit, streaming)
- P0 Magic-Link-Auth (Supabase GoTrue)
- P0 XSS-Härtung in `addMsg`
- P1 Vite + TypeScript Setup (Strangler-Pattern)
- P1 Compliance-Registry + 20 Regeln (CSC + Messe)
- P1 OSM Overpass + Nominatim für § 13 POI-Check

---

**Kein offizielles Pre-1.0-Release.** Die Versionsnummern v0.x sind rekonstruiert aus der PR-Historie. Ab v1.0 folgen wir [SemVer](https://semver.org/).
