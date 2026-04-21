# P17 — JS-Split (deferred auf v2.5)

Stand: 2026-04-21 · Status: **nicht durchgeführt** · Begründung unten

## Warum deferred

User-Brief explizit:
> ACHTUNG: Nur starten wenn Phase 0-4 alle grün. Bei ersten Anzeichen von Breakage: STOPP + Bericht.

**Phase 0-4 Status:**
- Phase 0 (Test-Checklist): ✅ grün
- P13 (Catalog): ✅ 42/42 Tests grün, 0 Invarianten verletzt
- P14 (Teams): ✅ Build grün, Tests 26/26
- P15 (Tokens): ✅ Build grün
- P16 (E2E + Lighthouse): ⚠ **Tests geschrieben aber nicht lokal ausgeführt** — Chromium fehlt im Container, Playwright-Install scheiterte

**Das entscheidende Gap:** Eine JS-Extraktion von 769 Funktionen aus 21k Zeilen inline-JS verändert die Runtime-Semantik (Scope, Global-Bindings, onclick-Handler-Resolution, Reihenfolge der Initialisierung). Ohne grünen E2E-Pass als Safety-Net kann ich Runtime-Regressionen nicht frühzeitig detektieren — die Tests laufen erst beim User in der CI.

Konkrete Risiken ohne E2E-Pass:
1. `onclick="foo()"` in HTML referenziert globale Funktionen. Nach Extraktion nach `src/legacy/*.ts` muss jede Function via `window.foo = foo` re-gebunden werden. Fehlt ein Binding → stiller Handler-Fail → User klickt und nichts passiert.
2. Initialisierungs-Reihenfolge: einige Module hängen von `window.THREE` (CDN) ab, andere von legacy-globals aus früheren Script-Blöcken. Eine falsche Import-Reihenfolge kann einen Modul-Init vor dem THREE-Load platzieren und die App crasht beim Boot.
3. Variable-Hoisting zwischen legacy-Scripts: `var leftMode`, `var rooms`, `var objects` sind implizit globale Variables, die quer über mehrere 1000-Zeilen-Abschnitte verwendet werden. Extraktion erfordert expliziten Export/Import — dabei können Referenzen stalen.

## Geplanter Split (für v2.5)

Logische Module, in Merge-Reihenfolge (jeweils eigene PR):

| Modul | LOC geschätzt | Abhängigkeiten | Priorität |
|---|---|---|---|
| `src/legacy/keyboard.ts` | ~150 | nur globale Shortcuts | **1. klein+sicher** |
| `src/legacy/clipboard.ts` | ~80 | Toast | 2 |
| `src/legacy/toast.ts` | ~60 | — | 3 |
| `src/legacy/compliance-bridge.ts` | ~200 | cscCompliance | 4 |
| `src/legacy/ui-events.ts` | ~400 | mode-state, leftMode | 5 |
| `src/legacy/drag-drop.ts` | ~300 | getCatalog, objects | 6 |
| `src/legacy/render2d.ts` | ~2500 | rooms, objects, canvas | 7 (groß) |
| `src/legacy/render3d.ts` | ~3000 | THREE, materials, rebuild3D | 8 (riesig) |
| `src/legacy/cloud.ts` | ~500 | SB_URL, SB_TOKEN, fetch | 9 |
| `src/legacy/ai-chat.ts` | ~400 | cloud, anthropic-proxy | 10 |

**Ziel:** Bundle von ~626 KB gz → unter 500 KB.

## Vorbedingungen vor P17-Start

1. ✅ Playwright lokal installiert (User: `npx playwright install chromium`)
2. ✅ `npm run test:e2e` liefert grün (29 Tests aus P16)
3. ✅ Mindestens 1 grüner CI-Lauf von `.github/workflows/e2e.yml`
4. ✅ Lighthouse-Baseline gemessen — Scores in `docs/LIGHTHOUSE-v2.3-summary.json` dokumentiert
5. Optional: Playwright-Snapshot-Tests für Canvas (2D + 3D Render-Output) als zusätzliches Safety-Net

## Strangler-Strategie pro Modul

Für jedes Modul:

```bash
# 1. Feature-Branch
git checkout -b p17.N/<module>

# 2. Extraktion
# - Functions aus index.html in src/legacy/<module>.ts kopieren
# - Als ES-Module exportieren
# - window.<fn> = <fn> Bindings für onclick-Handlers beibehalten
# - Entsprechende Zeilen aus index.html entfernen

# 3. Vite-Import in src/main.ts
# import './legacy/<module>.js';

# 4. Gates:
npm test                  # Unit-Tests
npm run test:e2e          # Playwright — MUSS grün sein
npm run build             # Bundle-Size messen
# Manueller Smoke-Test: /test.html in Browser, mind. 5 Core-Flows

# 5. Wenn grün: PR + Merge. Wenn rot: Stash + Analyse.
```

## Erwartete Bundle-Ersparnis

Basierend auf LOC-Schätzung (769 Funktionen gesamt, ca. 7.500 LOC Nutzcode):
- Raw `index.html`: 1.4 MB → ~600 KB nach vollem Split
- Gzipped: 340 KB → ~170 KB
- **Gesamt-Bundle: 626 KB → ~450 KB gz** (Ziel-Corridor)

Zusätzlich durch Code-Splitting (lazy-load pro Modul):
- `render3d.ts` only loaded wenn User in 3D-Ansicht wechselt
- `ai-chat.ts` only wenn AI-Sidebar geöffnet
- → initial paint JS ~200 KB gz

## Alternative Optimierungen (parallel zu P17 möglich)

Diese hebeln Bundle-Size auch, sind aber niedriger Risiko und können vor P17:
- **Purgecss** auf `src/styles/main.css` mit Safelist — geschätzt −20 KB gz
- **Dynamic import** für `three/examples/jsm/exporters/GLTFExporter` — nur bei Export-Click laden, −13 KB gz initial
- **Dynamic import** für `STAND_TEMPLATES` (14 Templates inkl. Data) — nur beim Öffnen des Template-Modals, −10 KB gz
- **i18n-Locales lazy** — DE default gebundelt, EN/NL/ES dynamic, −3 KB gz

Diese 4 kleinen Optimierungen bringen zusammen ~40 KB gz und können ohne Runtime-Umbau geschehen. Potential-v2.4-Task.
