# 🌿 CSC Studio Pro

Browser-basierter Raum- und Veranstaltungsplaner für **Cannabis Social Clubs (KCanG)** — 2D + 3D, Compliance-Live-Check, Cloud-Save, BIM-Roundtrip, KI-Features.

**Live:** https://marianacannabis.github.io/csc-raumplaner/ · **Version:** 2.8.0 · **Lizenz:** MIT

![Version](https://img.shields.io/badge/version-2.8.0-4ade80) ![Tests](https://img.shields.io/badge/tests-659_passing-4ade80) ![E2E](https://img.shields.io/badge/E2E-54_passing-blue) ![Roadmap](https://img.shields.io/badge/v3.0%20Roadmap-4%2F4%20done-22c55e)

## Features (v2.8.0)

### Räume + Compliance
- **2D + 3D Multi-Floor** mit gerade/L/Wendel-Treppen, Stacked-View mit Floor-Transparenz
- **23 Compliance-Regeln** (KCanG: Ausgabe, Lager, WC, Sozial, Sicherheit, Flucht, §13-POI-Distance, §14-Sichtschutz, §23-Präventionsbeauftragter; Bauordnung: Treppen-Mindestbreite, Stufenhöhe, Messe-Höhe …). Mode-abhängig gefiltert.
- **Bild-auf-Boden + Bild-auf-Wand** (User-Uploads, IndexedDB-cached)
- **Visual-History** mit Slider/Grid/Compare-Modes (Time-Travel-UI)
- **Stempel-Funktion** für identische Räume

### Wizards + Antrag
- **KCanG-Compliance-Wizard** mit 7 Sektionen (Vereinsdaten, Räume, Hygiene, Suchtberatung, Sicherheit, …) + Cloud-Sync (opt-in)
- **Bauantrag-PDF-Generator** — 10 Sektionen (Deckblatt, Lageplan, Grundrisse, Compliance-Bericht, …)
- **Onboarding-Tour** mit Phase-State-Machine

### Cloud + Multi-User
- **Magic-Link-Auth** (Supabase) + Token-Auto-Refresh
- **Cloud-Save mit Optimistic Locking** + Konflikt-Diff-Modal
- **Realtime-Multi-User** mit konsistenten Cursor-Farben + Live-Avatar-Bar

### Export
- DXF (5 Layer, CAD-tauglich)
- PDF (Bauantrag + Standard-Print)
- CSV (Möbel + Budget)
- GLTF (3D-Format, lazy GLTFExporter)
- **IFC** — Import via @thatopen/components (lazy) + Export via handgeschriebenem IFC2x3-Writer (aktueller Plan → Datei für Revit/BIMvision/Solibri)

### Subscription (Stripe Phase 2)
- 3 Pläne (Free/Pro/Team) — alle 0 € im Test-Mode (CSC-frei)
- Stripe-Checkout-Pipeline aktiv (Webhook + Edge-Functions); Live-Pricing per Config-Switch
- Soft-Limits-Enforcement (`checkPlanLimit`)

### Tooling + DX
- TypeScript strict (5 strict-Flags: `strict`, `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noImplicitOverride`)
- **659 Vitest** Unit-Tests · **54 Playwright** E2E
- 4 CI-Workflows: Tests, E2E, Lighthouse, Audit
- Audit: Functions-Inventory, Broken-Flow-Detect, Catalog-Audit, Menu-Coverage, Module-Bridge-Audit, Feature-Manifest

## Bundle (v2.8.0)

| File | Initial gz | Lazy (on-demand) |
|---|---|---|
| index.html | ~351 KB | – |
| index.js | ~94 KB | – |
| CSS | ~19 KB | – |
| **Initial total** | **~470 KB** | – |
| jsPDF + html2canvas | – | ~127 KB (Bauantrag-PDF) |
| @thatopen/components + web-ifc-Worker | – | ~5 MB (BIM-Import) |
| GLTFExporter | – | ~13 KB (3D-Export) |
| STAND_TEMPLATES | – | ~6 KB (Template-Modal) |
| i18n locales | – | ~600 B × 3 (EN/NL/ES) |

## Getting Started

```bash
# Dependencies
npm install --no-audit --no-fund

# Dev-Server (Vite)
npm run dev

# Produktions-Build
npm run build

# Unit-Tests (Vitest, 659 Tests)
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

### Audit-Gates (CI)

| Gate | Quelle | Verhalten |
|---|---|---|
| Function-Inventory | `scripts/audit-functions.mjs` | generiert Doc, kein Fail |
| Broken-Flow-Detection | `scripts/broken-flow-detect.mjs` | **fails CI bei >50 unresolved onclicks** |
| Catalog-Audit | `scripts/audit-catalog.mjs` | generiert Doc, kein Fail |

Lokal: `npm run audit:all`. Reports landen in `docs/`.

### Sonstige Gates (v2.8.0)

| Gate | Ziel | Aktuell |
|---|---|---|
| Bundle-Initial gz | <500 KB | **~470 KB** |
| Bundle-Lazy chunks | unbounded | BIM-Lib ~5 MB, jsPDF ~127 KB, GLTFExporter ~13 KB |
| Unit-Tests | passing | **659/659 ✅** |
| E2E-Tests | passing | **54/54 ✅** (~1.7 min Laufzeit) |
| TS strict | clean | **✅** (+ noUncheckedIndexedAccess, noFallthroughCasesInSwitch, noImplicitReturns, noImplicitOverride) |
| WCAG 2.1 AA Touch-Targets | 44×44 px | **✅** |
| Topbar-Design-System | Lucide-Icons + `[data-theme]` | **✅** Single-Source-of-Truth |
| Audit | 0 unresolved | **✅** |
| Strangler-Module | extract from index.html | **22+ Module ✅** in `src/legacy/` |

## Was ist erledigt (Stand v2.8.0)

### v3.0-Roadmap — komplett ✅

- ✅ **Bauantrag-PDF-Generierung** (10-Sektionen-Generator)
- ✅ **Multi-Floor mit Treppen** (alle 4 Phasen): Floor-Manager, gerade Treppen, L-Treppen, Wendeltreppen, Stacked-3D-View, +2 Compliance-Regeln
- ✅ **Stripe Phase 1+2**: Pricing-Modal + Edge-Functions (`stripe-checkout`, `stripe-webhook`) + Webhook-Signature-Verify + RLS-Hardening (Migration 0012). Test-Mode aktiv, alle Pläne 0 € (CSC-frei).
- ✅ **BIM-Viewer Phase 1+2**: IFC-Import via @thatopen/components (lazy), IFC-Export via handgeschriebenem IFC2x3-Writer. Roundtrip-Editing.

### v2.7-Recap

659 Vitest-Tests · 54 Playwright-E2E · audit:all 0 unresolved · Lighthouse-CI + Audit-CI aktiv. 21 Strangler-Module in `src/legacy/`. 4 CI-Workflows.

## Was kommen kann

- Wendeltreppen-Compliance-Erweiterung
- Stripe Live-Mode-Aktivierung (wenn Pricing fest)
- BIM-Roundtrip-In-Viewer-Edit (jetzt nur Import + Export, kein Live-Edit im 3D)
- Mobile-Native-App (PWA-Wrap statt Browser-only)
- Touch-/Pen-optimierte Eingabe

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
