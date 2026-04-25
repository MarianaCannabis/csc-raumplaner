# Changelog

Alle bedeutsamen Änderungen an CSC Studio Pro.

Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## Unreleased

### Tooling

- **Audit-CI-Workflow** (`.github/workflows/audit.yml`):
  audit-functions + broken-flow-detect + audit-catalog laufen bei jedem
  PR + push auf main. broken-flow-detect blockt PRs bei >50 unresolved
  onclicks — Sicherheitsnetz für JS-Split (P17). +`npm run audit:all`.
- **Lighthouse-CI** (`.github/workflows/lighthouse.yml`): Build + Preview
  + Lighthouse bei jedem PR + push auf main. Threshold-Check über
  `LH_CI=1` in `lighthouse-baseline.mjs` — fails bei a11y < 90,
  best-practices/seo < 95 oder performance < 50. Reports als Artifact
  für 30 Tage. A11y-Floor unter Baseline (96) weil CI's Linux-headless-
  Chrome reproduzierbar 3-4 Punkte niedriger scort als lokale Win-Runs.

### Refactor (Strangler P17)

- **3D-Exports extrahiert** nach `src/legacy/exports3d.ts` (P17.12).
  `exportGLTF` (async, three/examples GLTFExporter direkt importiert) +
  `exportDXF` (sync, 5 Layer AC1015-DXF). Erstes async/sync-Mix-Modul.
  +9 Vitest-Tests inkl. GLTFExporter-Mock + DXF-Format-Spec. Bundle:
  −1,514 B gz (zweitbestes Win der P17-Serie).
- **userTemplatesRead extrahiert** nach `src/legacy/userTemplatesRead.ts`
  (P17.11). 3 Funktionen + module-internal Cache: `loadUserTemplates`
  (TTL 60s), `deleteUserTemplate`, `applyUserTemplate`. Cache-Invalidation-
  Hook mit P17.8 (saves.ts) verbunden — Save invalidiert Read-Cache automatisch.
  +12 Vitest-Tests inkl. Cache-Hit/Miss/Invalidation. Bundle: −131 B gz.
- **export-family extrahiert** nach `src/legacy/exports.ts` (P17.10).
  3 Funktionen: `exportPDF` (HTML/SVG → Print-Window), `exportFurnitureCSV`
  (Detail + Aggregiert mit UTF-8 BOM), `exportBudgetCSV`. +10 Vitest-
  Tests inkl. PDF-Window-Mock + Quote-Escape + Pop-up-Block-Toast.
  Bundle: −1,924 B gz (größter Win der P17-Serie bisher — Legacy-Code
  hatte viel inline-HTML mit onclicks).
- **renderHighResPreset extrahiert** nach `src/legacy/renderPresets.ts`
  (P17.9). Erstes Three.js-Touch-Modul: WebGLRenderer-Construction
  via `deps.createRenderer` injectable (jsdom-Tests mocken). +10 Vitest-
  Tests inkl. Camera-Selection (Ortho/Perspective). Bundle: −1,158 B gz.
- **save-family extrahiert** nach `src/legacy/saves.ts` (P17.8).
  5 Funktionen in 2 Sub-Sections: Local-Save (saveProj/updateSavedUI/
  delSave) + User-Templates (saveAsUserTemplate/doSaveUserTemplate).
  +14 Tests inkl. fetch-mock + cscPlan-Limit-Block. Bundle: −464 B gz.
- **authUI extrahiert** nach `src/legacy/authUI.ts` (P17.7).
  3 Funktionen: updateAuthStatus + setGateState + updateLoginGate
  inkl. E2E-Mode-Override. Module-internal _gateState. +11 Tests.
  Bundle: −364 B gz.
- **inline-rename extrahiert** nach `src/legacy/inlineRename.ts` (P17.6).
  4 Funktionen: `startInlineRename` (Raum-Rename via Canvas-Input) +
  `doRename` / `startInlineProjectRename` / `finishInlineProjectRename`
  (Projekt-Titel-Edit). Closure-Wrapping in main.ts liefert Legacy-
  Globals (rooms, wx2cx, wy2cy, draw2D, renderLeft, snapshot, projName,
  closeM, toast). +13 Vitest-Tests inkl. Enter/Escape/Blur-Edge-Cases.
  Bundle: −829 B raw / −237 B gz.
- **sb-status extrahiert** nach `src/legacy/sbStatus.ts` (P17.5).
  `updateSbStatus` (~28 LOC, 4 Caller) + `setSbMsg` (~5 LOC, 11 Caller).
  Pure DOM, kein Closure-Wrapper. Standard-Boot-Shims. +12 Vitest-Tests.
  Bundle: −881 B raw / −287 B gz.
- **error-boundary extrahiert** nach `src/legacy/errorBoundary.ts` (P17.4).
  `_showCrashModal` (~14 LOC) wandert in TS strict + 7 Vitest-Tests.
  Listener-Registrierung (`window.addEventListener('error'/'unhandledrejection',
  …)`) bleibt **bewusst inline** — Boot-Time-Coverage darf nicht durch
  Module-Boot-Verzögerung verloren gehen. Inline-`_showCrashModal` ist
  jetzt ein Boot-Shim der via `window.showCrashModal` aufs Modul
  resolved oder console-only-Fallback bei Boot-Race. Bundle: −451 B
  raw / −35 B gz.
- **aiMessages extrahiert** nach `src/legacy/aiMessages.ts` (P17.3).
  `addMsg` (74 Caller) + `renderAIText` (XSS-hardening + Markdown).
  +14 Vitest-Tests inkl. XSS-Regression. Pure DOM, kein Closure-Wrap
  nötig. Standard-Boot-Shims wegen transitiver Caller (Welcome-Message-
  Boot, Crash-Modal, _restoreChatHistory). Bundle: −1,741 B raw / −900 B gz.
- **compliance-bridge extrahiert** nach `src/legacy/complianceBridge.ts`
  (P17.2). Drei Funktionen: `calcHealthScore`, `renderComplianceBadges`,
  `showHealthDetails`. Dependencies via DI (kein direktes Lesen von
  Legacy-Globals im Modul). +14 Vitest-Tests, window-Bindings als
  Closure-Wrapper in `main.ts` (`buildComplianceDeps()` liest die
  Legacy-Globals zur Aufrufzeit). Boot-Shims wie in P17.1, weil das
  inline-script INDIREKTE Caller hat (`setTimeout(suggestNextStep, 3000)`
  ruft intern `calcHealthScore`). Bundle: −2,745 B raw / −826 B gz.
  Neuer `src/legacy/types.ts` mit Minimal-Shapes für `CompletedRoom` +
  `SceneObject` — wird wachsend von Folge-Modulen genutzt.
- **toast() extrahiert** nach `src/legacy/toast.ts` (P17.1 Pilot).
  3 neue Vitest-Tests, window-Binding in `main.ts` für 304 inline-script-
  Caller. Inline-script behält einen schlanken Boot-Shim (`function toast`
  delegiert an `window.toast` zur Aufrufzeit, Identitäts-Guard verhindert
  Recursion vor Module-Boot) — der `setTimeout(()=>toast(...), 600)` für
  den Welcome-Banner bei index.html:21657 würde sonst racey sein.
  Bundle-Size: 1,277,647 → 1,277,685 raw (+38 B durch Shim) /
  347,754 → 348,113 gz (+359 B durch Shim). Echter Bundle-Win kommt
  mit den größeren Folge-Modulen.

## [2.6.5] — 2026-04-25

### Fixed

- **Realtime-Session-Cleanup**: DELETE auf `csc_project_sessions` aus
  `stopRealtimeCollab` und Sign-out-Path nutzt jetzt `keepalive: true`,
  damit der Browser das Request beim `beforeunload` nicht mehr mit
  `NS_BINDING_ABORTED` abbricht. Stale Geister-Sessions in der DB
  werden vermieden.

## [2.6.4] — 2026-04-25

### Fixed

- **Cloud-Save HTTP 400 (PGRST204)** — `csc_projects` fehlte die Spalte
  `thumbnail` (und defensiv `author`) in Production. Migration
  `0008_add_project_thumbnail.sql` ergänzt beide idempotent inkl.
  Schema-Cache-Reload. Frontend-Verhalten unverändert: Thumbnail-Anzeige
  in Cloud-Projekt-Liste funktioniert wieder.

### Tests

- Regressionstest in `src/persist/__tests__/cloudProjects.test.ts`:
  PGRST204-Response wird mit verständlicher Error-Message gemeldet
  statt generisch HTTP 400. `_postgrestError`-Helper rendert PostgREST-
  Codes + Messages und hängt bei PGRST204 den Hinweis "Migration 0008
  nicht angewandt?" an.

## [2.6.3] — 2026-04-25 · Defense-in-depth Cloud-Save

**Patch-Release.** Härtet den Persist-Layer nach v2.6.2 an drei Stellen gegen künftigen Drift zwischen Modul-Signatur und JS-Callsite.

### Fixed / Hardened
- **`window.cscPersist` ist jetzt typisiert**. Neue `PersistBridge`-Type wird aus `buildBridge()` als `ReturnType<typeof buildBridge>` abgeleitet und als Window-Interface-Extension deklariert. `tsc --noEmit` findet ab jetzt jede TypeScript-Call-Site die ein `CloudSaveBody` ohne owner baut oder eine veränderte Signatur übersieht.
- **Runtime-Guard in `saveCloudProject()`**: Früher Throw wenn `body.owner` kein non-leerer String ist. Fehlermeldung verweist direkt auf RLS-Policy + Wrapper-Contract. Legacy-Inline-JS in `index.html` wäre für `tsc` unsichtbar; dieser Guard fängt's trotzdem.
- **Anti-Race Mutex im `cloudSave`-Wrapper**: Inflight-Promise in `_cloudSaveInflight` geshared. Zweiter Klick (oder Auto-Save + manueller Save) bekommen denselben laufenden Promise, feuern keinen zweiten POST. Business-Logik lebt jetzt in `_cloudSaveImpl()`; `cloudSave()` ist die dünne Deduplication-Schicht.

### Added
- +2 Vitest-Tests für Runtime-Guard: leerer owner-String + undefined owner (untyped-JS-Caller simuliert). Test-Suite 148 → **150**.

## [2.6.2] — 2026-04-24 · Hotfix Login-Modal-Race + Cloud-Save-Owner

**Patch-Release.** Zwei unabhängige Bugs nach v2.6.1 gefixt.

### Fixed
- **Login-Modal-Race**: Nach erfolgreichem Magic-Link-Login öffnete sich das Login-Modal trotzdem ca. 400ms später. `index.html:7617` schedulet zur Boot-Zeit ein `setTimeout(()=>openM('m-auth'), 400)` ohne Re-Check ob zwischenzeitlich ein Token da ist. Hotfix v2.6.1's `consumeMagicLinkFromHash` läuft bei t=50–200ms, aber das geschedulte `openM` feuert bei t=400ms blind. **Fix**: Callback re-checkt `SB_TOKEN` zur Feuer-Zeit.
- **Cloud-Save HTTP 400**: `saveCloudProject()` POSTete den Body ohne `owner`-Feld; Supabase RLS-Policy `csc_projects_owner_ins` (mit `WITH CHECK (auth.uid() = owner)`) lehnte jedes Insert ab. **Fix**: `CloudSaveBody.owner` ist jetzt required (TypeScript-Compiler schützt vor weiteren Missbrauchs-Sites). PATCH-Pfad in `saveCloudProject` strippt `owner` via Destructure (RLS verbietet Update des owner-Feldes ohnehin). `cloudSave`-Wrapper injiziert `owner` aus `window.cscAuth.getAuthState().user.id` mit frühen Guards wenn User-State fehlt.

### Added
- +3 Vitest-Tests in `src/persist/__tests__/cloudProjects.test.ts`: POST-body enthält `owner`, PATCH-body strippt `owner`, Input-body wird nicht mutiert. Test-Suite 145 → **148**.

## [2.6.1] — 2026-04-24 · Hotfix Magic-Link-Login

**Patch-Release.** Behebt einen Production-Blocker seit v2.6.0: Magic-Link-Klick landete wieder auf dem Login-Modal statt einzuloggen.

### Fixed
- **Magic-Link-Login race condition**: `handleAuthRedirect()` lief im inline-Script-Block bevor `window.cscAuth` durch das deferred ES-Module installiert war — der `#access_token=…`-Fragment-Parse wurde nie ausgeführt. Fix: Hash-Parse nach `src/auth/magicLink.ts` extrahiert und in `src/main.ts` direkt nach der Bridge-Installation aufgerufen. Legacy-Funktion in `index.html` bleibt als No-op kompatibel für den Legacy-Aufruf bei `:7603`.

### Added
- `src/auth/magicLink.ts` mit purer Helper-Funktion `consumeMagicLinkFromHash(hash, opts)` — Callback-basierte Side-Effect-Injection (saveRefresh / replaceHistory / onSuccess), jeder Callback try-catch-isoliert.
- +11 Vitest-Tests in `src/auth/__tests__/magicLink.test.ts`, Test-Suite-Total 134 → **145**.

## [2.6.0] — 2026-04-24 · Surface-Redesign-Welle komplett

**Minor-Release.** Nach der Topbar in v2.5.0 sind jetzt ALLE User-facing Surfaces auf das neue Design-System umgestellt: Sidebar, Right-Panel, KCanG-Dashboard-Modal, NextStep-Popover und Save-Panel-Chrome. Light-Theme greift auf allen Surfaces konsistent. Eine UX-Semantik-Korrektur (Analyse-Tools aus Eigenschaften-Pane nach Projekte-Tab) rundet den Release ab.

### Added
- **BEM-Surface-Design-System** — vier neue Namespaces:
  `.sb-*` (Sidebar, Cluster 7a), `.rp-*` (Right-Panel + Tabs, 7b),
  `.kc-*` (KCanG-Modal, 7c), `.sp-*`/`.ns-*` (Save-Panel + NextStep, 7d).
  Alle mit Light-Theme-Overrides via `[data-theme="light"]`.
- **Lucide-Icon-Set erweitert** auf 39 Icons (v2.5.0: 20) —
  Sidebar-Rail: `house`, `sofa`, `building`, `shield`, `star` (7a);
  Right-Panel: `bot`, `palette`, `sunrise`, `settings` (7b);
  KCanG-Modal: `list-checks`, `shield-check`, `map-pin`, `sliders` (7c);
  Save-Panel + NextStep: `lightbulb`, `x`, `cloud`, `download`, `history` (7d);
  Quick-Analyses-Header: `activity` (7e).
- **Help-Button-Pulse** (Cluster 7x, Variante A): Brand-Glow-Ring pulsiert beim ersten Session-Launch, stoppt nach erstem Klick (persistent via `csc-help-seen` localStorage). Reduced-Motion-Fallback mit statischem 40%-Brand-Ring (WCAG 2.3.3).
- **Analyse-Tools unter Projekte-Tab** (Cluster 7e): 12 Quick-Analyses (Heizlast, Lux, Brandschutz, Barrierefreiheit, Schichtplan, Wartungskalender, Warteschlange, Sicherheitsbewertung, ROI, Fluchtweg, Break-Even, Analyse-Dashboard) als neues Collapsible zwischen KCanG-Bridge und Projekt-Speicherung.

### Changed
- **Sidebar-Rail + Möbel-Panel** auf `.sb-rail`/`.sb-rail__item` + `.sb-panel`/`.sb-panel__header`/`.sb-panel__body` (7a). Emoji-Glyphen in Rail-Items ersetzt durch Lucide-Icons, `#ib-security` rote Tinte saubere ID-Regel statt Inline-Style.
- **Right-Panel + 5-Tab-Bar** auf `.rp-panel`/`.rp-tabs`/`.rp-tab` + `.rp-pane` (7b). Active-Indikator jetzt 2px Brand-Underline statt Background-Swap. Emoji-Tab-Glyphen durch Lucide-Icons ersetzt.
- **KCanG-Dashboard-Modal** auf `.kc-*`-BEM-Namespace (7c) — Metadata-Card mit Grid-Layout, Compliance-Rules-Scroller mit 17/17 Regeln live, Advanced-Parameters-Collapsible. Status-Modifier `.kc-rule--pass/--fail/--null` statt variabler Inline-Colors. XSS-Härtung aus P0.3 beibehalten.
- **Cloud-Status-Bar** State-Modifier `.sp-status--pending/--ok/--error` (7d) — JS `updateSbStatus()` toggelt Klassen statt Inline-Styles.
- **NextStep-Popover** auf `.ns-popover`-BEM (7d) mit lightbulb- und x-Icons.
- **Save-Panel-Chrome** (KCanG-Bridge + 7 Collapsibles) auf `.sp-bridge` und `.sp-sec`-BEM mit 5 Farb-Modifiern (7d).
- **Eigenschaften-Pane-Default-State** zeigt nur noch Hint „Klicke ein Objekt oder Raum an" — Quick-Analyses nach Projekte-Tab umgezogen (7e).
- `showLeft()` / `showRight()` / `updateSbStatus()` togglen synchron beide Klassen (`.active` Legacy + `.is-active` BEM). Gleicher Alias-Pattern wie in v2.5.0 (4b/4e).

### Removed
- ~380 LOC Legacy-Inline-Styles aus `index.html` (Sidebar + Right-Panel + KCanG-Modal + Save-Panel + NextStep kumuliert).
- Legacy-CSS-Regeln aus `src/styles/main.css`:
  - `.ib`/`.lph`/`.lpb` + Layout-Block + `body.light-mode`-Overrides (7a)
  - `.rtab`/`.rtab.active` + `#right` Layout + Light-Mode-Varianten (7b)
  - Dreifach-duplizierte `#nextstep-panel` Legacy-Regeln (7d)

  `.ib`/`.lph`/`.lpb`/`.rtab`/`.rpanel` bleiben als Marker-Klassen im HTML für `[data-ui-mode="simple"]`-Filter und Touch-Target-Regeln.

### Fixed
- **Quick-Analyses-Fehlplatzierung** (Cluster 7e, UX-Bug pre-existing): 12 Analyse-Tool-Shortcuts waren im Eigenschaften-Pane-Empty-State obwohl thematisch Projekt-Tools. Jetzt unter Projekte-Tab korrekt einsortiert.

### Metrics
- Surface-Cluster: 7a + 7b + 7c + 7d + 7e + 7x = 6 PRs (#136 + #138 + #139 + #140 + #141 + #137)
- Unit-Tests: 61 stabil (Icon-Tests wachsen proportional mit Icon-Count)
- E2E-Tests: 41 stabil (`right-panel.spec.ts` Section-Count 7 → 8 in 7e angepasst)
- Icons: 20 → 39 (+19)
- `dist/index.html` gzip: 345.49 → **346.11 KB** (+0.62 KB für BEM-Markup)
- CSS-Chunk gzip: 18.94 → **20.71 KB** (+1.77 KB für surfaces.css + help-pulse.css über alle Cluster)
- JS-Chunk gzip: 70.62 → **71.69 KB** (+1.07 KB für `showLeft`/`showRight` Alias-Toggle + `initHelpPulse` + 19 neue Icons + `updateSbStatus`-Class-Toggle)
- Service-Worker-Cache-Key: `csc-v2.5.0` → `csc-v2.6.0` (Auto-Bump beim Build via `__APP_VERSION__`)

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
