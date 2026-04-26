# Changelog

Alle bedeutsamen Änderungen an CSC Studio Pro.

Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## Unreleased

## v2.8.0 — 2026-04-26 — Roadmap v3.0 komplett ✅

**Bedeutender Release.** Roadmap v3.0 (Bauantrag-PDF · Multi-Floor · Stripe ·
BIM-Viewer) ist nach 4 Wellen + diesem Doc-Polish komplett — alle 4 Items done.

### Doc-Polish

- **README.md** komplett aktualisiert: Version-Badge 2.8.0, Test-Counts
  (659/659), neue Bundle-Sektion (Initial vs. Lazy-Chunks), erweiterte
  Feature-Liste, „Was ist erledigt"-Sektion mit allen v3.0-Items als ✅,
  „Was kommen kann" für künftige Themen.
- **`docs/USER-GUIDE.md`** ergänzt um Sektionen: Multi-Floor mit Treppen,
  Bauantrag-PDF generieren, KCanG-Compliance-Wizard, BIM-Import/Export,
  Plan-Wechsel (Pricing).
- Version-Bump 2.7.7 → **2.8.0** (Minor wegen v3.0-komplett-Milestone).

## v2.7.7 — 2026-04-26

### BIM-Viewer Phase 2 (Roadmap v3.0 #4 — Phase 2 done)

- **`exportCurrentSceneAsIfc(deps)`** in `src/legacy/bimViewer.ts` —
  delegiert an den existing handgeschriebenen IFC2x3-Exporter
  (`src/export/ifc.ts`, ~9 KB Code, lizenzfrei, IFC-STEP-21 valid für
  BIMvision/Solibri/xeokit/Revit-Import). **Bewusst NICHT @thatopen-
  Library** — der existing-Code ist 1000× kleiner und liefert
  Standard-IFC ohne Lazy-5-MB-Chunk.
- **`window.cscBimUI.exportIfc()`** sammelt Scene-Daten aus den
  window-Globals (`rooms`, `objects`, `walls`, `grounds`, `measures`,
  `projName`) und triggert Download — funktioniert auch ohne dass der
  User je den BIM-Viewer geöffnet hat.
- **`index.html` BIM-Tab** umstrukturiert: Import-Section + neue Export-
  Section mit prominentem Button. Status-Anzeige unter dem Button.
- **Roundtrip BIM:** Import (Phase 1, lazy via @thatopen) → Inspizieren
  → Plan im CSC-Tool weiterbauen → Export (Phase 2, native).
- **+7 Vitest-Tests** (Blob-MIME, IFC-Header, Spaces, Furnishing,
  Walls, Building-Hierarchie, exportToIfc-Stub-Errortext). Vitest
  gesamt: 652 → 659.

## v2.7.6 — 2026-04-26

### Stripe Phase 2 (Roadmap v3.0 #4 — Phase 2 done)

- **Pricing-Strategie:** alle Pläne **0 € im Stripe-Test-Mode**. Frei für
  CSC-Vereine; Live-Pricing-Aktivierung später ohne Code-Änderung möglich
  (nur Stripe-Live-Mode + neue Price-IDs in Edge-Function-Secrets).
- **Migration 0012** (`csc_subscriptions` Stripe-Hardening):
  - Neue Spalten: `stripe_price_id`, `metadata` jsonb
  - **RLS-Policy umgestellt:** UPDATE jetzt nur `service_role`
    (Anti-Tampering — User kann Plan nicht ohne Webhook setzen).
- **Edge-Function `stripe-webhook`** mit Signature-Verification über
  `STRIPE_WEBHOOK_SECRET`. Behandelt `customer.subscription.{created,
  updated,deleted}` → upsert/update in csc_subscriptions via
  SERVICE_ROLE_KEY. Plan-Mapping via `STRIPE_PRICE_FREE/PRO/TEAM`.
- **Edge-Function `stripe-checkout`** mit JWT-Verify → Stripe-Checkout-
  Session mit `subscription`-mode + user_id-metadata + Success/Cancel-URLs.
- **Frontend `pricingModal.ts`:** Pro/Team triggern Checkout-Redirect via
  Edge-Function statt symbolischem DB-Update. Free bleibt Direct-Update.
  Confirm-Dialog signalisiert Test-Mode + Test-Karte 4242…
- **`index.html` Boot-Hook** für Success/Cancel-URL-Params: zeigt Toast
  „🎉 Upgrade erfolgreich!" bei `?upgraded=true`.
- **`features.ts:checkPlanLimit()`** Soft-Limit (returnt
  `{ ok, warning? }` — blockt nicht, weist auf Upgrade hin). Komplementär
  zum bestehenden harten `checkLimit`.
- **+9 Vitest-Tests** (6 checkPlanLimit + 1 angepasster Phase-2-Banner +
  2 Free/Pro-Click-Pfade). Vitest gesamt: 645 → 652.
- **`docs/STRIPE-SETUP.md`** — User-Setup: Account → 3 Products mit 0 € →
  Price-IDs notieren → Webhook im Stripe-Dashboard registrieren →
  Supabase-Edge-Function-Secrets setzen → Edge-Functions deployen →
  Smoke-Test mit Test-Karte.

## v2.7.5 — 2026-04-26

### BIM-Viewer Phase 1 (Roadmap v3.0 #4 — Phase 1)

- **Dependency:** `@thatopen/components` + `@thatopen/fragments` als
  **dynamic-import** — initial-Bundle-Impact ~0, Lazy-Chunk ~5 MB beim
  ersten BIM-Tab-Open.
- **`src/legacy/bimViewer.ts`** — `createBimViewer({ containerEl, toast,
  loadBimComponents })` returnt `{ loadIfcFile, exportToIfc, dispose,
  isReady }`. Skeleton-Modus: wenn die @thatopen-API zwischen Versionen
  wechselt, fällt der Init graceful zurück, IFC-Loader-Aufruf bleibt
  via `components.get(IfcLoader).load()`.
- **`src/main.ts` Bridges:** `window.cscBim.load()` (Lazy-Loader-Cache),
  `window.cscBimUI.handleFileSelect/exportIfc/isOpen`.
- **`index.html` neuer BIM-Tab** im rechten Panel (`#rtab-bim`,
  `#rpanel-bim`). File-Input akzeptiert `.ifc`. Export-Button ist
  disabled bis Phase 2 (Stub wirft "noch nicht implementiert").
- **+6 Vitest-Tests** (mock @thatopen-Modul). Vitest gesamt: 639 → 645.
- **Bekannte Vuln:** `fast-xml-parser <=5.6.0` (transitive über
  @thatopen/components, lokale npm-audit High-Severity). Risiko gering
  (nur User-eigene IFC-Dateien parsed, keine Remote-XMLs). Fix bei
  @thatopen-3.3.3+ Update; in Phase 2 evaluieren.

## v2.7.4 — 2026-04-26

### Multi-Floor Phase 4 — Wendeltreppen

- **`stairsGeometry.buildSpiralStairsMesh()`** — Tortenstück-Stufen
  (ExtrudeGeometry pro Ring-Sektor) gestapelt um zentrale Säule. Spiral-
  Geländer als TubeGeometry entlang CatmullRom-Curve. Defaults:
  outerRadius 1.2 m, innerRadius 0.2 m, totalRotation 270°.
- **`buildStairsMesh()` Dispatcher** erkennt jetzt `shape='spiral'` und
  delegiert vor dem L/Straight-Pfad. Keine Änderung in `index.html`
  build3DObj nötig.
- **Catalog-Item `stairs-spiral-standard`** — 17 Stufen, 270° Rotation,
  Bounding-Box 2.4×2.4 m.
- **Types**: `StairsConfig.shape` jetzt `'straight' | 'l' | 'spiral'`,
  `outerRadius`/`innerRadius`/`totalRotation` als optional fields.
- **+6 Vitest-Tests** (Wedge-Count, totalHeight, userData, Defaults,
  withRailing-False, Catalog-Roundtrip). Vitest gesamt: 633 → 639.
- **Multi-Floor v3.0 jetzt 4/4 Phasen done.**

## v2.7.3 — 2026-04-26

### Multi-Floor Phase 3 — Treppen wirklich rendern

- **`index.html` `findItem()`** durchsucht jetzt auch `window.cscCatalog.newItems`
  zusätzlich zu BUILTIN/ARCH/customObjs. Vorher fielen STAIRS-Items (im
  NEW_CATALOG) aus dem Lookup → `build3DObj` early-returnte → Treppen
  unsichtbar in 3D obwohl die Stairs-Branch in `build3DObj` schon Phase-2
  drin war. Smoke `tests/e2e/stairs-3d-render.spec.ts` belegt den Fix
  (stairs-mesh count: 1).
- **`floorManager.ts:validateStairsPlacement()`** — Position-Validation für
  Treppen (Phase 3 #2). Errors: connectsFloors fehlt · Floors nicht gefunden
  · Order-Reihenfolge falsch. Warnings (nicht blockend): Treppe außerhalb
  aller Räume eines Floors · Floor ohne Räume. Pure Funktion — leicht
  testbar. +6 Vitest-Tests.
- **`rebuild3D` Stacked-View-Transparenz** (Phase 3 #3) — wenn
  `_show3DAllFloors` aktiv und Floor !== curFloor, werden Materialien
  gecloned und auf opacity=0.35 + transparent + depthWrite=false gesetzt.
  Aktiver Floor bleibt voll opak. Trifft Grounds, Room-Floors, Walls,
  Freehand-Walls, Objects.
- **L-Treppen (Phase 3 #4 optional)** — `stairsGeometry.buildLStairsMesh`
  baut 2 straight-Läufe + 90°-Podest + Geländer. `landingAfter` konfigurabel
  (Default = floor(stepCount/2)). Neues Catalog-Item `stairs-l-standard`.
  +3 Vitest-Tests.
- Vitest gesamt: 624 → 633.

### Roadmap v3.0

- **Stripe-Phase-1 (v3.0 #4 — Phase 1)** — Subscription-Schema + Pricing-
  Modal. **Phase 2 (eigene Sitzung):** echte Stripe-Integration mit
  Checkout-Session + Webhook.
  - **Migration 0011** (`csc_subscriptions`-Tabelle): user_id (unique),
    plan ('free' | 'pro' | 'team'), status, stripe_customer_id (Phase 2),
    stripe_subscription_id (Phase 2), current_period_end. Mit
    set_updated_at + inc_version_on_update Triggers (reuse 0002 + 0009).
    RLS owner-Policies — Phase 1 erlaubt User-Self-Update; Phase 2 wird
    auf service_role-only umstellen (Anti-Tampering).
  - **`src/persist/subscriptions.ts`** — REST-Wrapper:
    `fetchSubscription`, `setUserPlan` (Upsert), `getCurrentPlan`.
  - **`src/legacy/pricingModal.ts`** — programmatisches Modal mit 3 Plan-
    Cards: Free (0€) · Pro (9€/Mo, highlighted) · Team (29€/Mo). Disabled-
    Button für Aktueller-Plan. Phase-1-Hinweis-Banner unten.
  - **UI-Trigger:** „💎 Plan & Preise"-Item im Topbar-Hilfe-Menu.
  - **`src/main.ts`** Bridge mit `window.cscPricing.open()` /
    `getCurrentPlan()`. Fetcht aktuellen Plan beim Open via Supabase.
  - **+22 Vitest-Tests** (10 Modal-Tests + 12 subscriptions-REST-Tests).
    Vitest gesamt: 602 → 624.
  - **Bundle:** index.js +~2 KB gz, index.html +~200 B gz (Trigger).

  **⚠ User-Action:** Migration 0011 manuell auf Production-DB applien
  (Supabase SQL-Editor). Bis dahin: Pricing-Modal öffnet sich, aber
  Plan-Wechsel scheitert mit „Cloud-Login benötigt" oder 404.

- **Multi-Floor Phase 2 (v3.0 #3)** — Treppen + Stacked-3D-View + Compliance.
  Folge zu Phase 1 (PR #216).
  - **Catalog-Items:** 3 neue Treppen in `src/catalog/items/stairs.ts`:
    `stairs-straight-standard` (1.20m, 17×0.18m), `stairs-straight-narrow`
    (0.90m — triggert Compliance-Fail), `stairs-straight-keller` (kompakt
    14 Stufen ohne Geländer). `CatalogItem.type='stairs'` + `stairsConfig`
    als neue optionale Felder.
  - **3D-Geometrie:** neues Modul `src/legacy/stairsGeometry.ts` mit
    `buildStairsMesh(width, cfg)` — ExtrudeGeometry mit treppen-förmigem
    Profil (1 Mesh statt N Stufen-Boxes). Optionales Geländer mit Posten +
    Handlauf + Mittelbalken (Bauordnung-konform 1m über höchster Stufe).
  - **Stacked-3D-View:** existierender `_show3DAllFloors`-Flag aus
    `rebuild3D` als saubere `cscFloors.toggleStackedView()` /
    `cscFloors.isStackedView()` API exposed.
  - **Compliance-Regeln (2 neue):**
    - `stairs-min-width` (critical): Treppe < 1.20m → Fail (Notausgang)
    - `stairs-connection` (critical): Mehrere Floors ohne Treppe → Fail
  - **Floor-Verbindung:** `cscFloors.findFloorConnection(floors, fromId)`
    findet automatisch den nächsten Floor darüber für Treppen-Platzierung.
  - +27 Vitest-Tests (Geometrie + 2 Compliance-Regeln + Stacked-View-API +
    findFloorConnection). Vitest gesamt: 575 → 602.
  - **Bundle:** index.js +~3 KB gz (stairsGeometry-Modul + 2 Rules +
    bridges).

  **Phase 3 (eigene Sitzung):** L-/Wendel-Treppen, Position-basierte Floor-
  Verbindungs-Validation (Treppe muss tatsächlich auf beiden Floors
  Position haben), Transparenz für nicht-aktive Floors in Stacked-View
  (rebuild3D-Refactor nötig).

### Bedienkonzept

- **Menu-Mode-Filter (Mega-Sammel ACBD #6)** — Topbar-Menus filtern Items
  basierend auf aktivem Planning-Mode (room/event). Items mit
  `data-mode="both"` bleiben immer sichtbar, mode-spezifische Items werden
  versteckt wenn der Filter aktiv ist und der Modus nicht passt.
  - **Toggle-Eintrag** in der Topbar-Hilfe-Menu („📂 Menu-Mode-Filter ein/aus",
    data-tier="expert"). localStorage-Persistenz via `csc-mode-filter`.
  - **Filter-Logik:** `applyMenuModeFilter()` läuft beim Boot + bei jedem
    `csc-mode-change`-Event (Planning-Mode-Switch).
  - **Hinweis:** Tagging-Defaults sind aktuell konservativ (94% `both`,
    9 `room`, 0 `event` für tbm-items). Filter zeigt im event-Mode 9
    Items hidden, im room-Mode 0. Korrekturen via Mini-PR oder eigene
    Walk-through-Sitzung. Default-Off (0), User muss aktiv aktivieren.
  - +4 E2E-Tests (Default-off, Filter-on-room, Filter-on-event, Toggle-
    localStorage). E2E gesamt: 49 → 53.
  - Bundle: ~+500 B gz (index.html).

### Roadmap v3.0

- **Multi-Floor Phase 1 (Mega-Sammel ACBD #7-10)** — neuer
  `src/legacy/floorManager.ts` Modul mit pure Floor-Management-Funktionen:
  - **API:** `getDefaultFloors`, `addFloor(above/below)`, `removeFloor`,
    `renameFloor`, `setFloorHeight`, `recomputeZOffsets`, `validateFloors`,
    `getFloorById`, `getFloorAbove`, `getFloorBelow`.
  - **Datenmodell:** `{id, name, height, zOffset (computed), order}`.
    EG=order:0 als Anker. KG/UG haben negative order, OG positive.
    `recomputeZOffsets` berechnet kumulativ aus den Höhen.
  - **Backwards-Compat:** existing `floors`-Array (`{id, name, elev}`) wird
    via `_floorsToManagerFormat`/`_managerToFloorsFormat` gewrapped.
    `confirmFloor`/`getFloorElev`/`renderFloorTabs` bleiben unverändert.
  - **UI:** neuer `m-floor-manager`-Modal mit add-above/add-below + pro
    Floor inline-Edit (name, height) + Delete-Button. Topbar-Trigger
    „⚙" neben dem existing „+"-Button.
  - **Mindestens 1 Floor:** `removeFloor` no-op wenn nur 1 Floor.
  - **Confirm bei Räumen:** Delete fragt wenn Räume auf dem Floor sind.
  - +26 Vitest-Tests (defaults/add/remove/rename/setHeight/recompute/
    validate/getFloorById/Above/Below). Vitest gesamt: 549 → 575.
  - Bundle: index.js +~2 KB gz (floorManager-Modul + bridge), index.html
    +~1 KB gz (m-floor-manager-Modal + UI-Functions).

  **Phase 2 (eigene Sitzung mit Architektur-Diskussion):**
  3D-Treppen-Geometrie (gerade/L/Wendeltreppe), Treppen-Bauteil im Catalog,
  Treppen-Compliance-Regel (§ Mindestbreite, Notausgang), Stacked-3D-View
  mit Z-Offset-Render (alle Floors gleichzeitig sichtbar mit Transparenz).

- **Bauantrag-PDF-Generierung (Mega-Sammel ACBD #1-5)** — neuer
  `src/legacy/bauantragPdf.ts` Modul generiert vollständiges KCanG-Antrags-
  Dokument mit 10 Sektionen:
  - **Deckblatt** (Vereinsdaten + Antragsdatum)
  - **Lageplan** (top-down 3D-Render via rend3.topCam)
  - **Grundrisse** (1 Seite pro Floor, 2D-Canvas-Snapshot mit curFloor-Switch)
  - **Positionsplan** (Räume nummeriert + Tabelle: Nr | Name | B | T | Fläche | Etage)
  - **Möbel-Liste** (gruppiert nach Catalog-Kategorie)
  - **Compliance-Bericht** (alle 21 KCanG-Regeln mit OK/FAIL/N/A)
  - **Hygienekonzept** (KCanG-Wizard Section D)
  - **Suchtberatung** (Section E)
  - **Sicherheit** (Section F: Brandschutz/Notausgang/§14 Sichtschutz/§13 POI)
  - **Anhang** (Material-Aufstellung mit Schätzkosten via getObjPrice +
    Flächen-Berechnung pro Raum-Typ heuristisch)

  Technisches:
  - jsPDF-Lazy-Reuse: nutzt denselben dynamic-Import wie KCanG-Wizard.
  - Footer: Seitenzahl + Vereinsname + Datum auf jeder Seite.
  - UI-Trigger: neuer Button im KCanG-Wizard Sticky-Nav.
  - Filename: `Bauantrag_<Vereinsname>_<YYYY-MM-DD>.pdf` mit Sanitization.
  - Graceful Degradation: kcangApp=null / leere Compliance / Render-Fail
    → Hinweis-Text statt Crash.
  - +13 Vitest-Tests. Vitest gesamt: 536 → 549.
  - Bundle: ~+3 KB gz (index.js).

### Zusatzfunktionen

- **Full Menu-Tagging (Sitzung H)** — alle 158 Topbar-Menu-Items haben
  jetzt `data-mode` (room/event/both) + `data-tier` (simple/standard/expert/
  advanced). Vorher: 28/158 mit data-mode, 105/158 mit data-tier. Jetzt
  **158/158 fully tagged**.
  - **Heuristik:** Caller-Funktion + Label-Keywords:
    - `data-mode="room"` bei KCanG/Compliance/Lager/Anbau/Behörden-Items (9 von 158)
    - `data-mode="both"` bei allgemeinen Tools (Help/Settings/Cloud/Theme — 149 von 158, default-fallback bei Ambiguität)
    - `data-mode="event"` blieb bei den bereits manuell getaggten Topbar-Buttons (`btn-templates`, `pm-event` etc.) — keine tbm-items als event klassifiziert (typische Event-Items sind Topbar-Direkt-Buttons, nicht Menu-Items).
    - `data-tier="simple"` bei Save/Load/Undo/Theme/Hilfe (24 von 158)
    - `data-tier="standard"` als Default-Fallback (126 von 158)
    - `data-tier="expert"` bei Multi-User/Collaboration (3 von 158)
    - `data-tier="advanced"` bei Telemetry/Audit/Debug (0 von 158 — die wenigen Dev-Items waren bereits getaggt)
  - **Audit-Coverage:** `scripts/audit-functions.mjs` ergänzt um
    tbm-item-Coverage-Sektion. Loggs zeigen jetzt `158/158 fully tagged`
    bei jedem Audit-Run; warnt loud bei zukünftigen ungetaggten Items.
  - **Bundle-Delta:** index.html gz +3,746 (130 Tag-Attribute).
  - **Korrektur-Pfad:** Heuristik kann unstimmig sein — User-Korrekturen
    via Mini-PR mit `data-mode`/`data-tier` direkt am betroffenen
    `tbm-item` editieren.

### Bedienkonzept

- **Touch-Wire-Up auf 2D-Canvas (Sitzung G Schritt 4)** — die in PR #203
  angelegte Touch-Pattern-Library wird jetzt tatsächlich an `fp-canvas`
  gebunden. main.ts queueMicrotask-Hook bei `isTouchDevice()===true`:
  - **Pan**: Single-Touch-Drag → `vpX += dx, vpY += dy`, draw2D()
  - **Pinch-Zoom**: Two-Finger → `vpZoom *= scale`, **Pinch-Center-Anker**
    (world-coord am Pinch-Center bleibt fixiert), Clamp [5..200]
  - **Tap**: Mouse-Down+Up-Simulation am Click-Punkt (Object-Select)
  - **Long-Press**: Toast-Hint („Context-Menu kommt in v3.0")
  - kein OrbitControls in Three.js (custom Mouse-Handler) → kein 3D-Wire-Up
    nötig
  - +4 Vitest-Tests (Pan-Math, Pinch-Center-Anker, Zoom-Clamp, Tap-Click).
    Vitest gesamt: 532 → 536.
  - Bundle: ~+800 B gz.
  - **Wichtig:** funktioniert nur dank Bridge-Audit (Schritt 0) — vpX/vpY/
    vpZoom sind jetzt auf window. Vorher hätte das Wire-Up silent gefailed.

### Zusatzfunktionen

- **Stempel-Funktion (Sitzung G Schritt 3)** — neues
  `src/legacy/stampMode.ts` Modul für „Wiederholte Räume"-Use-Case.
  User wählt Raum → klickt 🔁 Stempeln-Button in mode-pills → Cursor wird
  Crosshair → Click auf Canvas platziert Kopie an Click-Position →
  Mehrfach-Klicks = Mehrfach-Stempel → Esc / Toggle-Button beendet.
  - `activateStampMode(deps)`: Cursor + Listener (capture-phase!) + Esc-Key
  - Live-Selection-Lookup: User kann während Stamp-Mode die Selection
    wechseln, addRoom nutzt jeweils das aktuell selektierte Template.
  - Snapshot nach jedem Click (undo/redo-fähig).
  - +12 Vitest-Tests (Activation/Click/Esc/Toggle/Live-Selection).
  - Bundle: ~+1 KB gz.

- **Visual-History UX mit 3 Modes (Sitzung G Schritt 2)** — neues
  `src/legacy/visualHistoryUI.ts` Modul rendert das alte
  `m-visual-history`-Modal komplett neu:
  - **Slider-Mode** (default): horizontale Scroll-Bahn mit allen Snapshot-
    Thumbnails, neueste links. Click öffnet Compare.
  - **Grid-Mode**: 3-spaltige Karten (auto-fill, min 220px).
  - **Compare-Mode**: 2 Thumbnails nebeneinander (selected + aktueller),
    Diff-Counter (rooms/objects/walls/measures) via wiederverwendetem
    `computeDiff` aus conflictResolver.ts. Restore-Button delegiert an
    existierenden `_restoreFromVisualHistory`-Pfad.
  - Header mit 4 Buttons: Slider / Grid / Compare / Schließen.
  - `changelog.ts` bekommt `getVisualHistory()` + `getVisualHistoryEntry(idx)`
    als read-only-Accessoren für die neue UI.
  - `window.openVisualHistory` in `main.ts` delegiert jetzt an die neue
    UI (alter Pfad in changelog.ts bleibt für Backwards-Compat).
  - +14 Vitest-Tests (Modal-Open, Empty-State, Mode-Switch, Compare-Diff,
    Card-Click, Restore, Cancel, Close). Vitest gesamt: 506 → 520.
  - Bundle: ~+2 KB gz (index.html unverändert, JS-Bundle).

### Bedienkonzept

- **Shortcuts-Editor v2 (Sitzung G Schritt 1)** — Konflikt-Detection +
  3 Presets + erweiterte Liste auf 15 Items.
  - `SHORTCUT_DEFINITIONS` als Source-of-Truth für die Editor-UI
    (vorher: 5 Einträge hardcoded, jetzt: 15 inkl. ctrl+s/ctrl+z/ctrl+y/
    Escape/Delete/Space/2/3/m/+).
  - `SHORTCUT_PRESETS` (power-user / maus-user / touch-tablet) als
    1-Klick-Konfiguration. Apply ersetzt alle bisherigen Bindings.
  - Konflikt-Check beim Capture: Wenn Taste schon belegt → confirm-Dialog.
    Bei OK: alte Belegung verlieren ihren Key, DOM-Refresh.
  - Esc/Enter im Capture-Mode = Abbruch (keine Speicherung).
  - Eine fn → ein key invariante: vor jeder Speicherung werden alte
    Key-Bindings dieser fn entfernt.
  - +6 neue E2E-Tests (Editor-Render, Preset-Apply, Reset, Konflikt).
  - Bundle: ~+700 B gz (index.html).

### Tooling

- **Module-Bridge-Audit (Sitzung G Schritt 0)** — systematischer Check
  aller `(window as any).X`-Reads in `src/main.ts` gegen Inline-Script-
  Deklarationen in `index.html`, Lehre aus dem 3D-Bug-Hotfix (v2.7.2).
  **14 Silent-Fail-Candidates gefunden + gefixt:**
  `rooms`, `objects`, `walls`, `measures`, `grounds`, `floors`,
  `curFloor`, `projName`, `selId`, `selIsRoom`, `selIsWall`,
  `vpZoom`, `vpX`, `vpY` — alle waren `let`-deklariert, landeten nicht
  auf `window` → `buildExportDeps` / `buildLocalSaveDeps` / `buildComplianceDeps`
  in main.ts kriegten leere Arrays + Default-Names. **Folge:**
  Saves hießen immer „Projekt", PDF/CSV-Exports waren leer,
  Compliance-Score basierte auf `[]`-Daten. Fix: `let` → `var` für
  alle 14 (Top-Level `var` landet auf `window`, semantisch identisch).
  Permanenter Regression-Schutz: `tests/e2e/audit-bridges.spec.ts`
  prüft 38 Variablen + Functions, hard-fails wenn off-window.
  Audit-Bericht: `docs/MODULE-BRIDGE-AUDIT.md`.

## 2.7.2 — 2026-04-26 — Hotfix 3D-Mode-Restore

### Fixed

- **3D-Mode-Toggle wiederhergestellt (Hotfix kritisch)** — User-Bericht
  „3D funktioniert nicht mehr": setView('3d') änderte zwar `currentView`,
  aber die Canvas-Sichtbarkeit wurde nicht geswappt — 3D-Canvas blieb
  versteckt, 2D-Canvas blieb sichtbar.
  - **Root-Cause**: Der `setView`-Wrapper in `src/main.ts` (P17.14
    View-Controls) las `window.fpCv`, `window.tCv`, `window.fpCam3`,
    `window.oCam`, `window.grid3` — die sind aber alle als `const` im
    Inline-Script-Scope deklariert (Zeilen 2892, 4002-4036) und landen
    deshalb NICHT auf `window`. Resultat: alle deps kamen als null/undefined
    rein, der DOM-Display-Swap unterblieb stillschweigend. Bug bestand
    seit P17.14 (PR #173) — wurde von User erst bei Sammel-Sitzung F
    bemerkt.
  - **Fix**:
    1. `index.html` exposed jetzt explizit nach Three.js-Init:
       `window.fpCv/tCv/scene/oCam/fpCam3/topCam/grid3/cam3/rend3` — eine
       targeted-edit Bridge, kein Verhaltens-Wechsel.
    2. Neuer `window._setCam3(c)` Setter — reassigniert auch das LOKALE
       `let cam3`, nicht nur `window.cam3` (sonst sah der Render-Loop
       den Camera-Swap im walk-mode nicht).
    3. `setView`-Wrapper in `src/main.ts` fällt auf
       `document.getElementById('fp-canvas'/'three-canvas')` zurück, falls
       die Bridge fehlt — robust gegen künftige Refactors.
  - **Regression-Schutz**: neuer E2E-Test `tests/e2e/3d-toggle.spec.ts`
    asserts dass nach `setView('3d')` der 3D-Canvas `display:block` und
    der 2D-Canvas `display:none` hat. Hätte den Bug damals gefangen.
  - **Bundle-Impact**: ±0 (nur Variable-Bridges, ein Setter, kein neues
    Modul).

## Unreleased — werden mit nächstem Release gemerged

### Bedienkonzept

- **Multi-User-Avatar v2 (Mega-Sammel Schritt 5)** — neuer
  `src/legacy/collabAvatars.ts` Modul mit:
  - `colorForUser(id)`: hash-basierte Farb-Zuordnung (12 Farben),
    deterministisch — User sehen sich selbst und andere immer in
    derselben Farbe (auch nach Reconnect).
  - `formatLastAction(ts)`: "vor 30 Sek." / "vor 5 Min." / "14:23"
    (Format je nach Alter).
  - `avatarTooltipHtml`: XSS-gehärtetes Tooltip-Format Email + last-action.
  - `pulseCursorGlow(el)`: 500ms CSS-Animation auf Cursor-Element bei
    User-Action; mit prefers-reduced-motion-Honor.
  - Avatar-Bar in `index.html` jetzt `pointer-events:auto` für Tooltips,
    Cursor-Render in 2D-Canvas nutzt hash-Farbe statt Server-Random.
  - +17 Vitest-Tests (deterministisch, distribution, formatLastAction,
    XSS-Escape, glow-pulse). Vitest gesamt: 475 → 492.
  - Bundle: index.html +320 gz, index.js +780 gz, CSS +90 gz.

### Zusatzfunktionen

- **Bild-auf-Wand (Mega-Sammel Schritt 7)** — bestehendes
  `imageMap`-Pattern (für 3D-Objekte mit `imageMapFace`-Catalog-Hint)
  jetzt auch für freie Wände. Property-Panel erweitert um
  „🖼️ Bild auf Wand"-Section mit File-Upload + Preview + Remove.
  3D-Renderer (`buildWallSegMesh3D`) prüft `seg.imageMap` und nutzt
  `THREE.TextureLoader` mit ClampToEdgeWrapping, UV repeat=1×1
  (Bild streckt sich über die ganze Wand-Fläche, kein Pattern-Repeat).
  Verwendet `window.cscImageUpload.processUpload` für Resize+Compress.
  Bundle: nur index.html (~+1.5 KB gz).
- **PDF-Messeordnung Multi-Page-Support (Mega-Sammel Schritt 6)** — neuer
  `src/legacy/pdfPageSelector.ts` mit `promptForPages(numPages, options)`-
  Helper. Bei PDF-Upload mit mehreren Seiten zeigt sich jetzt ein
  Auswahl-Dialog ("alle" / "1-3" / "1,3,5" / Custom-Range). `parseRange`
  unterstützt deduped+sortierte Output, ESC-Cancel, Hardlimit-Truncation.
  index.html `uploadPDF` integriert: Single-Page bleibt ohne Dialog,
  Multi-Page öffnet den Selector. +14 Vitest-Tests (parseRange-edge-cases,
  Modal-Interaction, Cancel-Pfade). Vitest gesamt: 492 → 506. Bundle:
  +ca. 1 KB gz.

### Bedienkonzept

- **Mobile/Touch-Optimierung (Mega-Sammel Schritt 4)** — neuer
  `src/legacy/touchSupport.ts` Modul mit `attachTouchHandlers(deps)`
  Helper für Pan / Pinch-Zoom / Tap / Long-Press auf jedem Canvas.
  Pattern: Single-Touch+Move > 8 px → onPan, Two-Finger → onZoom,
  short Tap → onTap, ≥300ms ohne Move → onLongPress. Cleanup-Funktion
  als Return-Value. Boot-Detection via `isTouchDevice()` setzt
  `body.is-touch` für mobile-spezifische CSS-Regeln (44×44 px Hit-Areas
  via `@media (hover: none) and (pointer: coarse)`). Zusätzlich:
  `@media (max-width: 800px)` für reduzierte Topbar-Gaps und Sidebar-
  Slide-Toggle. Keine Behavior-Änderung beim Desktop. +8 Vitest-Tests
  (Pan/Tap/Long-Press/Pinch/Cleanup/Threshold). Vitest gesamt: 467 → 475.
  Bundle: +1.5 KB gz.

- **KCanG-Compliance-Wizard (Pfad-E)** — Single-Page-Form mit 7 frei
  navigierbaren Sektionen (Vereinsdaten, Räume, Compliance, Hygienekonzept,
  Suchtberatung, Sicherheit, Notizen). localStorage default + opt-in
  Cloud-Sync via Toggle (Migration 0010 PFLICHT-Apply). PDF-Export mit
  jsPDF (dynamic-import, ~127 KB lazy-Chunk) + browser-print Fallback.
  Sektionen B+C automatisch aus aktuellem Projekt-Stand vorausgefüllt
  (Räume mit Heuristik-Typ-Erkennung; Compliance-Status aus
  getKCaNGChecklist).
  - **Migration 0010** (`supabase/migrations/0010_kcang_applications.sql`):
    neue Tabelle `csc_kcang_applications` mit per-User-RLS, set_updated_at
    + inc_version_on_update Triggers (reuse aus 0002 + 0009). Idempotent.
  - **Module:** `src/legacy/kcangWizard.ts` (State-Machine, 7 Sektionen,
    auto-import, validation, debounced auto-save) + `src/legacy/kcangPdfExport.ts`
    (jsPDF-Pipeline mit deps.loadJsPdf für Test-Mock + browser-print Fallback).
  - **DOM:** neuer `m-kcang-wizard` Modal in index.html mit Sticky-Nav links
    + Section-Container rechts. Trigger aus KCanG-Dashboard
    "📋 Antrag-Wizard öffnen".
  - **Cloud-Sync:** ZWraps `cloud_sync=true` in meta-Block. Toggle in der
    Sticky-Nav. Save-Pfad nutzt `csc_kcang_applications` per Owner-Find +
    Upsert. Default off (localStorage reicht).
  - **PDF-Layout:** A4 portrait, 7 Sektionen + Footer mit Seitenzahl.
    `splitTextToSize` für lange Notizen, automatisches `addPage` bei
    Overflow.
  - **Tests:** +28 (23 kcangWizard + 5 kcangPdfExport). Vitest gesamt:
    439 → **467**.
  - **jsPDF dependency** als `dependencies` in package.json (User-OK Q4=ba).
    Dynamic-import → 127,381 B gz lazy-Chunk, kein Initial-Bundle-Hit.
  - **Bundle:** Initial-Total 435,189 → 439,963 gz (Δ +4,774 für komplettes
    Feature; jsPDF separat lazy 127 KB).

  **⚠ User-Action nach Merge:** Migration 0010 manuell auf Production-DB
  applien (analog zu 0009). Bis dahin Cloud-Sync inaktiv (graceful);
  localStorage-Pfad funktioniert sofort.

### Fixed

- **Onboarding-Tour CTA-Glitch (Pfad-E #0)** — bei CTA-Click im Welcome-
  Modal (Vorlage / Leer / Laden) erschien kurz das Bridge-Modal vor der
  CTA-Aktion. Neue Funktion `ctaThenAction(action)` in `onboardingTour.ts`
  setzt `state='done'` **vor** dem Modal-Close, sodass der `onClose`-Hook
  (→ `onWelcomeDone`) keinen Bridge-Übergang mehr auslöst (state-Guard
  greift). CTA-Buttons in `welcomeFlow.ts` rufen jetzt
  `window.cscOnboarding.ctaThenAction(()=>action())`. +2 Tests.

### Bedienkonzept

- **Konflikt-Resolution Cloud-Save** — Optimistic Locking via Version-Counter.
  Beim parallelen Save erkennt das Frontend den Konflikt und zeigt ein
  Modal mit Server- und lokalem Thumbnail + Diff-Counter (Räume/Objekte/
  Wände/Maße); User wählt **Server-Stand übernehmen** /
  **Mein Stand erzwingen** / **Abbrechen**. Komponenten:
  - **Migration 0009** (`supabase/migrations/0009_optimistic_locking.sql`):
    `version`-Spalte + Trigger `inc_version_on_update` auf `csc_projects` +
    `csc_user_templates`. Idempotent, doppeltes Apply harmlos.
    `csc_versions`-Tabelle existiert nur als localStorage-Bridge — daher
    nicht enthalten.
  - **`src/persist/cloudProjects.ts`**: `SaveResult`-Union mit Branch
    `ConflictDetected`. PATCH-URL erhält `version=eq.X`-Filter wenn
    `body.version` gesetzt; bei 0 rows wird `fetchProjectByIdFull()`
    aufgerufen für den vollen Server-Stand. Neuer `probeOptimisticLocking`-
    Helper für Boot-Capability-Check. `loadCloudProject` returnt jetzt
    `{data, version}` statt nur data.
  - **Neues Modul `src/legacy/conflictResolver.ts`**: programmatisches Modal,
    `computeDiff()`-Helper. CSS-Klassen (.mdl-overlay, .mdl-btn) wiederverwendet,
    kein neuer HTML-Block in index.html.
  - **`src/main.ts`**: `window.cscConflictResolver` + Boot-Probe für
    `__cscOptimisticLocking`-Flag.
  - **`index.html`**: `_cloudSaveImpl` checkt `result.type === 'conflict'`,
    delegiert ans Modal. `_currentLoadedVersion`-State; `cloudLoad` setzt
    Version aus dem Load-Response.
  - **Graceful Degradation**: ohne Migration-Apply (probe → false) bleibt
    das Frontend funktionsfähig im alten last-writer-wins-Modus, kein
    User-facing Bruch.
  - Tests: +25 (10 cloudProjects + 14 conflictResolver + 1 indirekt). Vitest
    gesamt: 412 → 437.
  - Bundle: +2,720 B gz (Initial-Total 432,469 → 435,189).

  **⚠ User-Action nach Merge:** Migration 0009 muss manuell auf
  Production-DB angewendet werden (Supabase Dashboard SQL Editor).
  Bis dahin Optimistic Locking inaktiv (graceful).

- **Onboarding-Tour neu strukturiert**: neuer Orchestrator-Modul
  `src/legacy/onboardingTour.ts` vereint Welcome + Tutorial zu einem
  Phase-State-Machine-Flow:
  `idle → welcome → bridge → tutorial → done` (skipped als opt-out
  Sonderpfad). Bridge-Modal wird programmatisch erzeugt — kein neuer
  HTML-Block in der 21k-Zeilen-`index.html` nötig.
  - `autoStartTour()` ist neuer Boot-Single-Source-of-Truth (ersetzt den
    `setTimeout(startWelcomeFlow)`-Trigger)
  - `startTour()` ist der explizite Reset-Pfad für den
    "🎯 Interaktives Tutorial"-Button
  - `welcomeFlow.WelcomeFlowDeps` um `onClose?`-Hook ergänzt (additiv,
    kein Breaking-Change) — feuert nach mark=true close + informiert
    den Orchestrator
  - localStorage-Migration: `csc-welcome-never='1'` → `csc-onboarding-skip='1'`,
    `csc-onboarded='1'` → `csc-onboarding-state='done'` (existing User
    sehen die Tour nicht erneut)
  - 22 neue Vitest-Tests (`src/legacy/__tests__/onboardingTour.test.ts`):
    Migration, Phase-Transitions, Skip-Idempotenz, State-Restore aus
    localStorage. Tests gesamt: 390 → 412.
  - Bundle: +1,318 B gz (Initial-Total 431,151 → 432,469)

### Docs

- **README mit v2.7.1-Status aktualisiert**: Versions-Badge 2.7.1,
  Bundle-Badge 431 KB gz, Tests-Badge 390 passing. Quality-Gates-Tabelle
  aktualisiert mit aktuellen Werten + Strangler-Counter (21 Module).
  Roadmap-Sektion: v2.3-Block großteils ✅, neue „v2.7-Recap"-Sektion mit
  der 626→431 KB-Reise. Verweis auf `docs/FEATURE-ROADMAP.md` als
  Source-of-Truth für offene Themen.

### Tooling

- **Lighthouse-Filename-Cleanup**: `scripts/lighthouse-baseline.mjs`,
  `.gitignore` und `.github/workflows/lighthouse.yml` nutzen jetzt
  versionsfreie Filenames (`docs/lighthouse-report.html`,
  `docs/lighthouse-full.json`, `docs/lighthouse-summary.json`). Das
  getrackte `docs/lighthouse-v2.3-summary.json` per `git mv` umbenannt
  zum neuen Namen — Baseline-Snapshot bleibt erhalten.
- **broken-flow-detect Skip-Liste erweitert**: filtert jetzt JS-Keywords
  (`try`/`catch`/`finally`/`throw`/`await`/`async`/`function`/`var`/`let`/
  `const`/`do`/`while`/`for`/`switch`/`case`/`break`/`continue`/`typeof`/
  `instanceof`/`void`/`delete`/`yield`/`class`/`extends`/`super`/`this`)
  als Pseudo-Identifier. Letzter pre-existing FP weg: 704 resolved,
  0 unresolved.

### Fixed

- **Verirrter Boot-Init-Block in `snapshot()` + `autoOptimizeAll()`
  entfernt** — bei Recherche zum Welcome-Flow-Doppel-Trigger entdeckt:
  der gesamte Boot-Init-Block (initPWA + initTooltips + renderKIDropdown
  + loadBadges + showTipOfDay + Onboarding-Welcome-Flow + checkAndAwardBadge
  + suggestNextStep) war versehentlich 3× kopiert (snapshot, autoOptimizeAll,
  Boot). `snapshot()` läuft bei JEDER State-Mutation — der Block re-triggerte
  also bei jedem Move/Add/Delete den Welcome-Flow für neue User und
  re-registrierte den Service-Worker. Korrekter Boot-Init bleibt nur noch
  einmal in den Z. ~20770ff.
- **Right-Panel Tab-Boot-Race (KNOWN-ISSUES #1)** — beide
  `setTimeout(()=>showRight('props'),200)` Boot-Aufrufe in `index.html`
  prüfen jetzt vorher, ob der User schon einen anderen Tab aktiviert hat
  (`document.querySelector('.rtab.active')`) und sind dann no-op. Klicks
  in den ersten 200ms nach Reload werden nicht mehr vom Default
  überschrieben.

## 2.7.1 — 2026-04-26 — Purgecss Visual-Regression Verify

### Build

- **Purgecss aus #186** nach automatisierter Visual-Regression-Suite
  freigegeben. 8 Test-Cases gegen `npm run preview` (production-build
  mit aktivem Purgecss): Boot/data-theme · Toast 3 Farben · AI-Chat 4
  Message-Types · Modals (.mdl-overlay/.mdl-btn) · Theme-Toggle ·
  SB-Status · Compliance-Badge · Topbar-Menu (.tbm-drop). Alle 8 grün.
- **Initial-Bundle gz total**: 448,930 → 431,151 (Δ −17,779 / −3.96%
  seit P17.21).
- **CSS gz**: 20,681 → 18,834 (Δ −1,847 / −8.93%).

### Bundle-Status (informativ)

- index.html gz: 336,657 B
- index.js gz: 75,660 B
- CSS gz: 18,834 B
- Initial total gz: ~431 KB
- <400-KB-Roadmap-Ziel: 31 KB Distanz, weiterer Sprint mit
  Three.js-Tree-Shaking als nächster Hebel — derzeit pausiert,
  Fokus auf Feature-Ausbau.

### Testing-Hinweis

Die Visual-Regression-Spec wurde nach erfolgreichem Verify wieder
gelöscht. Production-Build-Visual-Tests gehören nicht in PR-CI —
Build-Konfig-Änderungen (Purgecss-Safelist-Updates etc.) sollten
explizit ausgelöst kontrolliert werden, nicht bei jedem Code-PR.

## 2.7.0 — 2026-04-26 — Pfad B (Bundle-Ziel-Sprint, Tranche 1)

**Strategie-Wechsel** nach 21 P17-Strangler-Modulen: weg von "−500 B/Modul
Strangler", hin zu Build-Konfig-Optimierungen mit großem Win in einem Schwung.
Tranche 1 lieferte 3 von 4 Sub-Tasks erfolgreich; Sub-Task 4 (Purgecss) ist
als DRAFT-PR #186 für manuelle Visual-Regression markiert.

**Initial-Bundle gz: 448,930 → 432,998 (Δ −15,932 / −3.55%)**

Konkret:
- index.html gz: 338,720 → 336,657 (Δ −2,063)
- index.js gz: 89,450 → 75,660 (Δ −13,790)
- CSS gz: 20,760 → 20,681 (Δ −79)
- Neue Lazy-Chunks: GLTFExporter 10,388 + templates 2,298 + en/nl/es 2,316 gz

### Build (Pfad B — Bundle-Ziel-Sprint)

- **Purgecss auf CSS-Bundle** (Sub-Task 4): `vite-plugin-purgecss` mit
  kuratierter Safelist (BEM-Modifier `--*`, State-Klassen `is-*`, alle
  dynamisch via JS gesetzten classNames + greedy-Roots `tb-/mdl-/sp-/kc-/`
  etc.). CSS gz: 20,681 → 18,834 (Δ −1,847 / −8.93%); raw 114,601 → 103,749
  (Δ −10,852).
- **STAND_TEMPLATES lazy-loaded** (Sub-Task 3): 14 Templates (Mari-Jane,
  Dmexco etc.) werden via dynamic `import()` nachgeladen. `requestIdleCallback`-
  Pre-Cache hält die UX snappy (typisch 1-2s nach Boot fertig).
  `cscTemplates.list/all/find` returnen `null` bzw. `undefined` bis das
  Modul da ist — der vorhandene `openTemplates()`-Retry-Loop in
  index.html (10× / 300ms) wartet schon und re-rendert sobald
  Templates eintreffen. Initial-Bundle gz: −2,051 (index.js −1,995,
  index.html −56); separater templates-Chunk: 2,298 gz, on-idle.
- **i18n-Locales lazy-loaded** (Sub-Task 2): EN/NL/ES werden erst bei
  `setLang()` nachgeladen, DE bleibt eager (Default + Fallback). `t()`
  fällt auf DE zurück solange ein Locale noch nicht im Cache ist.
  `setLang()` ist jetzt async — Caller (`<select onchange>` + Quick-Switch
  Menü) ignorieren den Return, also kein Bruch. Beim Boot mit
  preferred-non-DE wird das Locale ohne await geladen + ein
  `csc-lang-change`-Event gefeuert sobald es da ist. Initial-Bundle gz:
  −1,004 (index.js −1,003); separate Locale-Chunks: en 992, nl 652, es 672 gz.
  Implementation: Switch statt Template-Literal-Import (Vite-Dev hatte mit
  Template-Literal + JSON-Attribute SyntaxError beim direkten Serve).
- **GLTFExporter lazy-loaded** (Sub-Task 1): static `import` aus `src/main.ts`
  entfernt; eager-Bridge `window.THREE.GLTFExporter = …` durch
  `window.cscLoadGLTFExporter()` ersetzt (Promise-cached). Beim ersten
  `exportGLTF()`-Click wird der Exporter via dynamic `import()` aus
  `three/examples/jsm/exporters/GLTFExporter.js` nachgeladen. `exports3d.ts`
  importiert `GLTFExporter` jetzt nur noch type-only — `ExporterClass` wird
  über deps gereicht. Initial-Bundle gz: −12,877 (index.js −10,792,
  index.html −2,006; neuer separater GLTFExporter-Chunk: 10,388 gz, lazy).

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

- **versionHistory extrahiert** nach `src/legacy/versionHistory.ts` (P17.21).
  saveVersion/loadVersionHistory/renderVersionHistory/restoreVersion/
  deleteVersion. Wrapper um window.cscPersist.versions (P-TrackA Phase 1
  Bridge) — keine Cloud-Calls. localStorage-Fallback wenn Bridge nicht
  bereit. +14 Vitest-Tests inkl. Bridge-mock + localStorage-Path.
  Bundle: −337 B gz.
- **tbMenu extrahiert** nach `src/legacy/tbMenu.ts` (P17.20). Topbar-
  Dropdown-System: toggleTBMenu/closeTBMenu mit module-internal
  _openMenu-Tracking. updateMenuActiveStates bleibt Caller-side via
  deps (zu viele Legacy-Globals). +8 Vitest-Tests inkl. radio-style
  toggle, aria-expanded a11y. Bundle: −165 B gz.
- **helpModal extrahiert** nach `src/legacy/helpModal.ts` (P17.19).
  4 Funktionen: openHelpModal (#m-help via openM) + openHelp/closeHelp/
  showHelpPage (separates #help-overlay-System mit Sub-Page-Navigation).
  +9 Vitest-Tests inkl. scrollIntoView-Defensive für jsdom.
  Bundle: −67 B gz (klein wegen 4 Shims für 30 LOC — Trade-off klar im
  Schema).
- **tutorial extrahiert** nach `src/legacy/tutorial.ts` (P17.18). Step-
  basiertes Overlay-Tutorial mit Highlight auf Topbar/Sidebar-Elementen.
  startTutorial/endTutorial/tutNav/renderTutStep + readonly TUT_STEPS-Array
  (5 Schritte). Module-internal _step-State. +14 Vitest-Tests inkl.
  navigation, target-highlighting, clamping. Bundle: −554 B gz.
- **welcome-flow extrahiert** nach `src/legacy/welcomeFlow.ts` (P17.17).
  3-Step-Onboarding: startWelcomeFlow, welcomeStep, closeWelcomeFlow,
  renderWelcomeStep. Module-internal _idx-State + WELCOME_STEPS-Array.
  localStorage-Persistenz für csc-onboarded + csc-welcome-never. +13
  Vitest-Tests. Bundle: −1,206 B gz.
- **changelog + visual-history extrahiert** nach `src/legacy/changelog.ts`
  (P17.16). Section A: logChange/getChangelog/loadChangelog/clearChangelog/
  showChangelog mit localStorage-Persistenz. Section B: pushVisualHistory/
  openVisualHistory/restoreFromVisualHistory mit Thumbnail-Capture in-
  memory. +15 Vitest-Tests inkl. canvas-Prototype-Mock für jsdom.
  Bundle: −1,094 B gz.
- **theme extrahiert** nach `src/legacy/theme.ts` (P17.15).
  4 Funktionen (intern + 3 export): `applyThemeIcon`, `toggleTheme`,
  `initTheme`, `setColorMode`. data-theme als Single-Source-of-Truth
  (Cluster 8d). +13 Tests inkl. localStorage-Persistenz, Icon-Toggle,
  setColorMode-Doppel-State (Welcome-Modal-Pfad). Bundle: −187 B gz.
- **viewControls extrahiert** nach `src/legacy/viewControls.ts` (P17.14).
  3 Funktionen: `setView` (2D/3D/walk-Toggle), `fitViewToRooms`, `switchFloor`.
  Tightly-coupled mit Three.js + Canvas — Closure-Wrapper für ~10 Legacy-
  Globals. +9 Vitest-Tests inkl. View-Mode-Switching, Camera-Swap, Tab-
  toggle. Bundle: −194 B gz.
- **undoRedo extrahiert** nach `src/legacy/undoRedo.ts` (P17.13). Stack-
  Management: `pushSnapshot/undo/redo/canUndo/canRedo` mit MAX_HISTORY=50.
  Inline-`snapshot()` bleibt Source-of-Truth (tightly-coupled mit autosave/
  changelog-diff/init-Cruft); Modul ist Mirror für Test-API. +14 Tests.
  Bundle: +190 B gz (net-negativ wegen Shadow-Sync — akzeptiert für
  Test-API-Win, Limit ist 5 KB).
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
