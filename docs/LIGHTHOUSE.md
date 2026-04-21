# Lighthouse-Audit — CSC-Raumplaner

Stand: 2026-04-21 · P11.4

## Baseline (manuell zu erheben)

Dieser Repo-Container hat keinen installierten Chrome — Lighthouse muss daher vom User lokal oder aus CI gefahren werden. Die Baseline ist aktuell **nicht gemessen**; sobald sie gemessen ist, tragen wir die Scores in `README.md` unter "Quality Gates" ein.

## Lokaler Lauf

Voraussetzungen: Node ≥ 20, Chrome / Chromium installiert.

```bash
# 1. Preview-Build hochfahren
npm run build
npm run preview &     # Port 4173 (Vite-Default für preview)

# 2. Audit starten
npx -y lighthouse http://localhost:4173 \
  --output=html --output=json \
  --output-path=./docs/lighthouse-report \
  --chrome-flags="--headless"

# 3. Ergebnis öffnen
#    docs/lighthouse-report.report.html
```

Der npm-Script `npm run lighthouse` zielt auf den Dev-Server (Port 5173). Für realistische Scores (Prod-Build, komprimierter Assets) bitte den Preview-Server (4173) nutzen — siehe oben.

## Ziel-Scores

| Kategorie | Ziel | Aktuell |
|---|---|---|
| Performance | ≥ 90 | *ungemessen* |
| Accessibility | ≥ 95 | *ungemessen* (P8.6 + P11.2 haben viel vorgearbeitet) |
| Best Practices | ≥ 95 | *ungemessen* |
| SEO | ≥ 90 | *ungemessen* (Meta-Tags aus P8.8 vorhanden) |
| PWA | ✅ (installable) | *ungemessen* (manifest + sw.js vorhanden) |

## CI-Integration

Lighthouse-CI wurde **nicht** in `.github/workflows/e2e.yml` integriert, weil:
- Die Bundle-Size liegt aktuell bei 624 KB gz (Ziel <400 KB) — Performance-Score wird unter 90 landen, bis der inline-JS-Split durch ist
- Flaky Scores durch CI-Maschinen-Variabilität
- Jeder PR würde die CI-Laufzeit um 2–3 Min verlängern

Empfehlung: Lighthouse-CI **nach** P11.3 Phase-2 (JS-Split) aufsetzen, wenn ein realistisches Perf-Ziel erreichbar ist.

## Unlighthouse (Multi-Page)

Alternativ für Deep-Crawl:

```bash
npx unlighthouse --site http://localhost:4173
```

Läuft durch alle öffentlich linked-ten Seiten und produziert einen HTML-Report mit Score-Grid. Nützlich wenn `/privacy`, `/impressum`, `/about` mit aufgenommen werden sollen.

## Erwartete Pain-Points

- **LCP (Largest Contentful Paint):** Wird durch die 1,25 MB raw index.html langsam. Lösung = inline-JS-Split (v1.1).
- **TBT (Total Blocking Time):** Parse-Time der ~21k Zeilen inline-JS.
- **CLS (Cumulative Layout Shift):** Service Worker + Login-Gate könnten initiale Re-Layouts triggern.

Sobald die Baseline gemessen ist, werden konkrete Optimierungs-Tasks daraus abgeleitet.
