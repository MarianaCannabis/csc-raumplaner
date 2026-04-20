# 🌿 CSC Raumplaner Pro

Browser-basierte Planungs-App für **Cannabis Social Clubs (KCanG)** und **Messestände** — 2D + 3D, Compliance-Live-Check, Cloud-Save, KI-Features.

**Live:** https://marianacannabis.github.io/csc-raumplaner/ · **Version:** 1.0.0 · **Lizenz:** MIT

![Version](https://img.shields.io/badge/version-1.0.0-4ade80) ![Bundle gz](https://img.shields.io/badge/bundle-612KB_gz-fbbf24) ![Tests](https://img.shields.io/badge/tests-20_passing-4ade80)

## Was kann's

- **Raum-Planung:** 2D zeichnen, Objekte platzieren, 3D-Vorschau mit PBR-Materialien + HDRI-Environment
- **KCanG-Compliance-Check:** 21 Live-Regeln (Ausgabe, Lager, WC, Sozial, Sicherheit, Flucht, §13-POI-Distance, §14-Sichtschutz, §23-Präventionsbeauftragter, Messe-Höhe …)
- **Messe-Workflow:** 14 Stand-Templates (Mari-Jane, Dmexco, Boot, Gamescom, Showroom) + Budget-Kalkulator + Packliste + DXF-Export
- **260+ Katalog-Items** in 30+ Kategorien mit PBR-Materialien (Kenney, Quaternius, ambientCG — alle CC0)
- **KI-Features:** Grundriss-Analyse + Smart Lighting + **PDF-Messeordnung-Import** via Claude Vision API
- **Multi-User-Kollaboration:** farbige Cursor der anderen User, Avatar-Presence-Bar
- **Cloud-Save:** Magic-Link-Auth (Supabase), Token-Auto-Refresh, 1h-TTL mit silent-keepalive
- **Export:** DXF (5 Layer, CAD-tauglich), PDF, CSV (Detail + Aggregiert), GLTF, IFC (light)
- **PWA:** installierbar, offline-fähig, Auto-Save in IndexedDB alle 30s
- **DSGVO-konform:** Daten-Export (Art. 20), Account-Löschung (Art. 17), nur technisch-notwendige Cookies

## Getting Started

```bash
# Dependencies
npm install --no-audit --no-fund

# Dev-Server (Vite)
npm run dev

# Produktions-Build
npm run build

# Unit-Tests (Vitest, 20 Tests)
npm test

# Coverage-Report
npm run test:coverage
```

## Architektur

- **Frontend:** Vanilla JS Legacy-Core (21k Lines in `index.html`) + progressiver Strangler-Umzug auf TypeScript unter `src/`
- **Bundler:** Vite 8, Build-Output als statische Files für GitHub-Pages
- **3D-Engine:** Three.js r184 (MeshStandardMaterial/MeshPhysicalMaterial, UnrealBloomPass, RGBELoader, GLTFLoader)
- **Compliance-Engine:** eigene Rule-Registry mit 21 Regeln, lebt in `src/compliance/`
- **Backend:** Supabase (Postgres + Auth + Realtime + Edge-Functions), RLS auf allen Tabellen
- **KI-Proxy:** Edge-Function `anthropic-proxy` mit JWT-Verify, Anthropic-API-Key server-side

## Ordner-Struktur

```
src/
  main.ts              # TS-Entry, exportiert Bridges nach window.csc*
  compliance/          # Rule-Registry + 21 Regeln + Metrics
  catalog/items/       # 20+ Kategorie-Files (~260 Items)
  three/               # Primitive-Builder (130+) + Material-Factories
  templates/           # 14 Stand-Templates
  geo/                 # Overpass + Nominatim-Wrapper
  util/                # processUpload, helper

public/
  sw.js                # Service Worker
  manifest.webmanifest # PWA-Manifest
  privacy.html         # Datenschutz
  impressum.html       # §5 TMG
  about.html           # Über die App
  hdri/                # HDRI-Environment-Maps (CC0)
  textures/ambientcg/  # PBR-Texturen (5 Materials + 5 Grounds)
  models/              # Kenney + Quaternius GLBs

supabase/
  migrations/          # 0001_rls, 0002_schema_cleanup, 0003_realtime_sessions
  functions/anthropic-proxy/

docs/
  USER-GUIDE.md        # Vollständige User-Doku
  FUNCTIONS-AUDIT.md   # Audit aller Compute-Funktionen
  BUNDLE-SIZE.md       # Performance-Ausweis
```

## Roadmap

### v1.1+ (Q2–Q3 2026)

- WebP-Konversion der ambientCG-Texturen (-40% Asset-Download)
- Post-Processing + EffectComposer lazy-load (-15 KB gz initial)
- Playwright E2E-Suite (login / create-project / compliance)
- Settings-Panel mit Opt-In-Toggle für Analytics
- IFC4-Export mit Objekt-Geometrie (server-side Conversion)
- Mobile-3D: dediziertes Touch-Orbit-System
- Analytics-Dashboard-Setup (Plausible + Sentry)
- Icons polish: echte Favicons (192/512) + OG-Screenshot

### v2.0 (vielleicht 2026 H2)

- Multi-Floor-Konstruktionen mit 3D-Treppen
- Bauantrag-PDF-Generierung (Grundriss + Positionsplan + Schnitte)
- Integration in BIM-Viewer (ifcViewer)
- Team-Management (Rollen: Admin/Planer/Viewer)

## Contributing

Issues + Feature-Requests: [GitHub Issues](https://github.com/MarianaCannabis/csc-raumplaner/issues)

PR-Guidelines: Squash-merge mit aussagekräftigem Titel (Konvention: `P<phase>.<x>: <kurzer Titel>`). Vitest-Tests für neue TS-Module.

## Credits

- **Poly Haven** — HDRIs (studio_small_08, dikhololo_night) · CC0
- **ambientCG** — PBR-Texturen · CC0
- **Kenney.nl** — Furniture Kit 2.0 · CC0
- **Quaternius** (via Poly Pizza) — Ultimate House Interior Pack · CC0
- **Three.js** — MIT-lizenziert
- **Supabase** — Auth + DB + Realtime
- **Anthropic Claude** — KI-Backend

## Lizenz

App-Code: MIT License. Assets: siehe oben (alle CC0).
