# Changelog

Alle bedeutsamen Änderungen an CSC Raumplaner Pro.

Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

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
