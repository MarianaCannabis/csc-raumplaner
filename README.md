# 🌿 CSC Studio Pro

Browser-basierter Raum- und Veranstaltungsplaner für **Cannabis Social Clubs (KCanG)** — 2D + 3D, Compliance-Live-Check, Cloud-Save, KI-Features.

**Live:** https://marianacannabis.github.io/csc-raumplaner/ · **Version:** 2.4.0 · **Lizenz:** MIT

![Version](https://img.shields.io/badge/version-2.4.0-4ade80) ![Bundle gz](https://img.shields.io/badge/bundle-626KB_gz-fbbf24) ![Tests](https://img.shields.io/badge/tests-42_passing-4ade80) ![E2E](https://img.shields.io/badge/E2E-29_assertions-blue)

## Was kann's

- **Zwei Planungs-Modi:** Segmented Control in der Topbar wechselt zwischen `🏪 Raumplanung` (KCanG-Clubhaus) und `🎪 Veranstaltungs-Planung` (Messe/Kongress). Sidebar, Katalog, Regeln, Export-Buttons passen sich automatisch an.
- **Raum-Planung:** 2D zeichnen, Objekte platzieren, 3D-Vorschau mit PBR-Materialien + HDRI-Environment
- **KCanG-Compliance-Check:** 21 Live-Regeln (Ausgabe, Lager, WC, Sozial, Sicherheit, Flucht, §13-POI-Distance, §14-Sichtschutz, §23-Präventionsbeauftragter, Messe-Höhe …). Mode-abhängig gefiltert.
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

# Unit-Tests (Vitest, 26 Tests)
npm test

# Coverage-Report
npm run test:coverage

# E2E-Tests (Playwright, einmalig Browser installieren)
npx playwright install chromium
npm run test:e2e

# Lighthouse (lokal, benötigt Chrome)
npm run lighthouse

# Favicons regenerieren (Python + Pillow)
npm run gen:favicons
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

## Quality Gates

### Lighthouse (v2.4.1 Messung)

| Kategorie      | v2.4.1 | Ziel |
|----------------|--------|------|
| Performance    | 61     | ≥ 90 (v2.5 JS-Split) |
| Accessibility  | **96** | ≥ 95 ✅ |
| Best Practices | 100    | ✅    |
| SEO            | 100    | ✅    |

> Performance-Baseline ist v2.4-spezifisch; Hauptoptimierung erfolgt in v2.5 über den in [`docs/P17-JS-SPLIT-PLAN.md`](docs/P17-JS-SPLIT-PLAN.md) dokumentierten JS-Split.

### Lighthouse-Gates (CI)

| Score | Floor | Lokal (Win) | CI (Linux headless) |
|---|---|---|---|
| Accessibility | ≥ 90 | 97 | 93 |
| Best Practices | ≥ 95 | 100 | 100 |
| SEO | ≥ 95 | 100 | 100 |
| Performance | ≥ 50 | 51 | 62 (Ziel v2.5+/JS-Split: 90) |

A11y-Floor ist 90 statt 95: Linux-headless-Chrome im GitHub-Runner gibt
reproduzierbar 3-4 Punkte niedriger als lokale Windows-Runs. Buffer 3
gegen weitere CI-Variance ist defensiver als ein engerer Floor mit
flaky Builds.

CI-Workflow: `.github/workflows/lighthouse.yml`. Lokal:
`npm run build && npm run preview &` + `npm run lighthouse` (kein
Threshold-Fail lokal — nur Reporting).

### Sonstige Gates (v2.5.0)

| Gate | Ziel | Aktuell |
|---|---|---|
| Bundle-Size gz | <400 KB | **~435 KB** (index.html + CSS + JS; index.html-JS-Split weiterhin offen) |
| Unit-Tests | passing | **61/61 ✅** (v2.4.2: 48 → v2.5.0: 61, +13 durch Lucide + Keyboard-Module) |
| E2E-Tests | 41/41 passing | **41/41 ✅** (~1.6 min Laufzeit) |
| TS strict | clean | **✅** (+ noFallthroughCasesInSwitch, noImplicitReturns) |
| WCAG 2.1 AA Touch-Targets | 44×44 px | **✅** (P11.2 + P-Bug-Bash) |
| Topbar-Design-System | Lucide-Icons + `[data-theme]` | **✅** v2.5.0 (6 Cluster 4a–4f + v2-Iteration) |

## Roadmap

### v2.3 (Q2 2026)

- **JS-Split:** 21k-Zeilen inline-JS aus `index.html` nach `src/legacy/*.ts` — eröffnet <400 KB Bundle-Ziel
- **Full Menu-Tagging:** restliche ~140 Items mit `data-mode`/`data-tier` (aktuell 17 getaggt)
- **Lighthouse-CI-Integration** nach erstem grünen Baseline-Run
- **Purgecss** für src/styles/main.css (geschätzt −20 KB gz)

### v3.0 (2026 H2)

- Multi-Floor-Konstruktionen mit 3D-Treppen
- Bauantrag-PDF-Generierung (Grundriss + Positionsplan + Schnitte)
- BIM-Viewer (ifcViewer) Integration
- Stripe-Checkout für Pro/Team-Pläne (v2.2 hat Infrastruktur, nicht Payment)

## Contributing

Issues + Feature-Requests: [GitHub Issues](https://github.com/MarianaCannabis/csc-raumplaner/issues)

PR-Guidelines: Squash-merge mit aussagekräftigem Titel (Konvention: `P<phase>.<x>: <kurzer Titel>`). Vitest-Tests für neue TS-Module.

### Dependency-Updates (CDN-Scripts)

Die vier CDN-Scripts in `index.html` (three.js, pdf.js, mammoth, jszip) sind mit **Subresource-Integrity-Hashes** (SHA-384) gehärtet. Ein kompromittierter CDN kann keinen alternativen Payload mehr ausliefern — der Browser verwirft das Script bei Hash-Mismatch.

**Wenn die CDN-URL (Version) geändert wird, MUSS der Hash neu berechnet werden**:

```bash
# Ein Script neu hashen (Beispiel: jszip auf v3.11.0 bumpen)
curl -sL "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.11.0/jszip.min.js" \
  | openssl dgst -sha384 -binary \
  | openssl base64 -A

# Alle vier auf einmal
for url in \
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" \
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js" \
  "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js" \
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; do
  echo "=== $url ==="
  curl -sL "$url" | openssl dgst -sha384 -binary | openssl base64 -A
  echo
done
```

Dann `integrity="sha384-..."` im jeweiligen `<script>`-Tag in `index.html` aktualisieren.

**Staging-Test nach Bump**:
- Dev-Server starten (`npm run dev`)
- DevTools-Console öffnen
- Prüfen: KEIN `Failed to find a valid digest in the 'integrity' attribute`-Error
- 3D-Szene (three.js), PDF-Upload (pdf.js), DOCX-Import (mammoth), ZIP-Export (jszip) alle funktional

Der pdf.js-Worker (`pdf.worker.min.js`, in JS als `workerSrc` gesetzt) wird via `new Worker()` geladen — SRI-Attribute wirken nicht auf Worker-Scripts. Gleiche URL-Domain + Version wie die Haupt-Library macht das trotzdem konsistent.

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
