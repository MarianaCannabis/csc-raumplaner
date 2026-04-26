# Lighthouse-Baseline — v2.3

Stand: 2026-04-21 · Status: **ungemessen** (lokal auszuführen)

## Scripts

```bash
# 1. Preview-Build hochfahren
npm run build
npm run preview &                    # Port 4173

# 2. Baseline-Run
npm run lighthouse
# oder: node scripts/lighthouse-baseline.mjs

# 3. Server stoppen
kill %1
```

Output:
- `docs/lighthouse-report.html` — Human-readable Report (Chrome öffnet via Double-Click)
- `docs/lighthouse-summary.json` — Scores + Kern-Metriken für Automatisierung
- `docs/lighthouse-full.json` — Roh-Daten, ~3 MB

## Ziel-Scores

| Kategorie | Ziel | Baseline v2.3 |
|---|---|---|
| Performance | ≥ 90 | *ungemessen* |
| Accessibility | ≥ 95 | *ungemessen* (P8.6 + P11.2 + P12.3 vorgearbeitet) |
| Best Practices | ≥ 95 | *ungemessen* |
| SEO | ≥ 90 | *ungemessen* (Meta-Tags + OG in P8.8) |
| PWA | installable | *ungemessen* (manifest + sw.js vorhanden, Favicons in P11.4) |

## Erwartete Pain-Points (vor dem ersten Run)

- **LCP (Largest Contentful Paint):** blockiert durch 1.25 MB raw index.html. Lösung = inline-JS-Split (P17).
- **TBT (Total Blocking Time):** Parse-Zeit von ~21k Zeilen inline JS.
- **Bundle-Size:** 626 KB gz > 400 KB Lighthouse-Faustregel.

## Warum Baseline nicht gemessen

Diese Container-Umgebung hat keinen Chrome-Browser — `npx lighthouse` läuft nicht. Der User muss den Baseline-Run einmalig lokal durchführen:

1. Repository klonen + `npm install`
2. `npm run build && npm run preview &` (läuft im Hintergrund auf Port 4173)
3. `npm run lighthouse`
4. Scores aus `docs/lighthouse-summary.json` in diesen Report kopieren
5. `docs/lighthouse-report.html` als Beweis-Datei committen

## Kein Lighthouse-CI

Bewusst **nicht** in `.github/workflows/` integriert:
- Bundle liegt aktuell bei 626 KB gz (Ziel <400 KB) → Performance-Score wird unter 90 landen, bis P17-JS-Split durch ist
- Flaky Scores durch CI-Maschinen-Variabilität
- Jeder PR würde CI-Laufzeit um 2–3 Min verlängern

**Empfehlung:** Lighthouse-CI nach P17 aufsetzen, wenn ein realistisches Perf-Ziel erreichbar wird.

## Alternative: Unlighthouse (Multi-Page)

```bash
npx unlighthouse --site http://localhost:4173
```

Crawlt durch alle linked-ten Seiten (`/privacy`, `/impressum`, `/about`), produziert Score-Grid. Nützlich für Subseiten-Audit.
