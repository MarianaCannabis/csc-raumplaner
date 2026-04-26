# Module-Bridge-Audit (Sitzung G Schritt 0)

Stand: 2026-04-26. Lehre aus dem 3D-Bug (v2.7.2 / PR #202): TS-Wrapper in
`src/main.ts` lesen Inline-Script-Variablen via `(window as any).X`. Wenn
diese Variablen mit `let` oder `const` deklariert sind, landen sie NICHT
auf `window` — die Wrapper kriegen `undefined` und fallen auf
Default-Werte zurück, ohne Fehler zu werfen. **Silent-Fail-Pattern.**

## Audit-Methode

1. `grep -oE "w\.[a-zA-Z_][a-zA-Z0-9_]*" src/main.ts` → 152 Reads.
2. Pro Variable in index.html geprüft:
   - `var X = ...` → ✅ auf window
   - `function X() {}` (Top-Level) → ✅ auf window
   - `let X = ...` / `const X = ...` → ❌ **Silent-Fail-Candidate**
3. Empirisch verifiziert via `tests/e2e/_audit-bridges.spec.ts` —
   `typeof window.X !== 'undefined'` für jede Variable.

## Befund (vor Fix)

**14 Silent-Fail-Candidates gefunden, alle als `let` deklariert:**

| Variable | Zeile | Wo gelesen (main.ts) | Auswirkung |
|---|---|---|---|
| `rooms` | 2827 | buildExportDeps, buildComplianceDeps, ... | Exports/Compliance auf leerem Array |
| `objects` | 2829 | buildExportDeps, buildComplianceDeps | Exports zeigen keine Möbel |
| `walls` | 2830 | DXF-Export, complianceBridge | DXF-Export ohne Wände |
| `measures` | 2831 | DXF-Export | DXF ohne Maße |
| `grounds` | 2828 | DXF-Export | DXF ohne Grounds |
| `floors` | 2832 | switchFloor-Wrapper | Floor-Switch ohne Floor-Liste |
| `curFloor` | 2833 | buildExportDeps, buildComplianceDeps | Export/Compliance fix auf 'eg' |
| `projName` | 2826 | buildLocalSaveDeps, buildTemplateSaveDeps, buildExportDeps | **Saves heißen immer „Projekt"!** |
| `selId` / `selIsRoom` / `selIsWall` | 2834-2836 | viewControls.switchFloor (setSel) | Floor-Switch konnte Selection nicht clearen |
| `vpZoom` / `vpX` / `vpY` | 2896-2897 | fitViewToRooms-Wrapper (setVpZoom) | Fit-View funktional nicht (in main.ts) |

## Fix

`let` → `var` für alle 14 Top-Level-Variablen in `index.html` (Z. 2826-2836,
2896-2897). `var`-Deklarationen am Top-Level eines Script-Tags landen automatisch
auf `window`. Reassignments (`rooms = newArray`) propagieren transparent.
Mutationen (`rooms.push(x)`) waren ohnehin schon korrekt.

**Risiko-Bewertung:**
- `let` vs. `var` semantisch unterschiedlich (block-scope vs. function-scope, hoisting).
- Diese 14 Variablen werden ausschließlich am Top-Level deklariert + verwendet,
  kein Block-Scope, kein hoisting-Konflikt. Wechsel ist semantisch transparent.
- Kein Risiko: function-scope ist hier identisch zum globalen-script-scope.

## Verifikation

`tests/e2e/_audit-bridges.spec.ts` — vor Fix 14 off-window, nach Fix 0 off-window
(38/38 on window).

Diese Spec bleibt als **permanenter Regression-Schutz** bestehen unter
`tests/e2e/audit-bridges.spec.ts` (ohne Underscore-Präfix).

## Function-Decls (zur Bestätigung)

Folgende Top-Level `function X() {}`-Deklarationen sind durch Standard-JS-
Verhalten auf `window`:

`findItem`, `getPD`, `loadPD`, `snapshot`, `draw2D`, `rebuild3D`,
`renderLeft`, `updateSelBotBar`, `wx2cx`, `wy2cy`, `cx2wx`, `cy2wy`,
`getObjPrice`, `renderFloorTabs`. Alle ✅ verifiziert.

## v2.7.2 3D-Bug-Bridges (zur Bestätigung)

Nach PR #202 explizit gebridged: `fpCv`, `tCv`, `scene`, `oCam`, `fpCam3`,
`topCam`, `grid3`, `cam3`, `rend3`. Alle ✅ verifiziert.

## Empfehlung für künftige Refactors

Beim Hinzufügen neuer Top-Level-Variablen in `index.html`:
- **Default `var`** verwenden, wenn die Variable von `src/main.ts`
  oder externen Skripten gelesen wird.
- `let`/`const` nur, wenn die Variable strikt block-/script-internal ist
  und nicht bridged werden soll.
- Bei Unsicherheit: `tests/e2e/audit-bridges.spec.ts` erweitern um die
  neue Variable, dann beim nächsten Audit-Lauf wird sie automatisch geprüft.
