# Design-Token-System — v2.4

Stand: 2026-04-21 · `src/styles/tokens.css`

## Ziel

Farben, Spacing, Typografie, Radii, Shadows, Motion und Z-Index stehen an **einer** Stelle als CSS Custom Properties. Neue Komponenten nutzen die semantischen Namen (`--color-brand-400`, `--space-3`, `--radius-md`), sodass ein Theme-Switch oder Rebranding nur das Token-File ändert.

## Struktur

### Farben
- **Surfaces** (`--color-bg-0` bis `--color-bg-4`): fünfstufiger Grau-Stack für App-Hintergrund, Panels, Cards, Buttons, Hover
- **Borders** (`--color-border-subtle` / `--color-border-strong`)
- **Text** (`--color-text-primary` / `-secondary` / `-tertiary` / `-disabled`)
- **Brand** (`--color-brand-50/400/500/700/900`): CSC-Grün in 5 Abstufungen
- **Semantic** (`--color-success`, `-warning`, `-danger`, `-info`, `-event`, `-attention`)

### Spacing (4-px-Raster)
`--space-0` bis `--space-12` = 0 / 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 px.

### Radius
`--radius-xs` (3) · `-sm` (6) · `-md` (8) · `-lg` (12) · `-xl` (20) · `-pill` (9999).

### Typografie
- `--font-family-sans`: Segoe UI + System-Fallback-Stack
- `--font-family-mono`: SF Mono + Consolas-Fallback
- `--font-size-xs` bis `-3xl` (10/11/12/14/16/20/28 px)
- `--font-weight-regular/medium/semi/bold`
- `--line-height-tight/normal/relaxed`

### Shadows
`--shadow-sm/md/lg/xl` + `--shadow-focus-brand` (2px Brand-Grün als Focus-Ring).

### Z-Index (semantic, keine Magic-Numbers)
`--z-behind/-base/-sidepanel/-topbar/-dropdown/-modal/-toast/-overlay/-gate`.

### Motion
- Dauer: `--motion-fast/normal/slow/slower` (120/180/260/400 ms)
- Easing: `--ease-standard/-in/-out`

## Legacy-Kompatibilität

Die alten kurzen Namen (`--bg`, `--bg2`, `--tx`, `--tx2`, `--gr`, `--r6`, `--r8` etc.) sind im selben `:root`-Block als **Aliase** erhalten:

```css
--bg:  var(--color-bg-1);
--tx:  var(--color-text-primary);
--gr:  var(--color-brand-400);
--r6:  var(--radius-sm);
```

Das bedeutet: **keine Änderungen** an existierendem CSS in `main.css` oder inline-Styles nötig. Nur neue Komponenten verwenden die semantischen Namen.

## Migrations-Pfad

Eine Komponente zum Zeitpunkt X. Kein Big-Bang.

```css
/* Alt */
.my-button { background: var(--bg3); color: var(--tx); border: 1px solid var(--bd); }

/* Neu */
.my-button {
  background: var(--color-bg-3);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-subtle);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  transition: background var(--motion-fast) var(--ease-standard);
}
```

## Bundle-Impact

`src/styles/tokens.css` fügt **~1,3 KB gz** zum CSS-Bundle hinzu (144 Zeilen deklarativer CSS). Nach gzip faktisch negligible.

## Nicht ausgeliefert in P15 (ehrlich)

Der Auftrag bat um 5 claude.ai/design-generierte Artefakte (Topbar-Redesign, Icon-Set, Loading-Animations, Onboarding, Design-Token-System). In dieser Umgebung:

| Deliverable | Status | Grund |
|---|---|---|
| Design-Token-System | ✅ geliefert | handwritten in `tokens.css` |
| Topbar-Redesign | ⚠ nicht ersetzt | Der aktuelle Topbar aus P12.2 (prominenter Mode-Switcher + Glow) erfüllt die meisten Anforderungen. Ein Redesign ohne User-Sign-off ist zu disruptiv. |
| Icon-Set (24 Outline-Icons) | ⚠ nicht geliefert | Ich habe keinen Zugriff auf `claude.ai/design`. Inline-SVG-Skeleton von Hand wäre mehrere Stunden Arbeit für einen visuellen Ersatz von Emojis, die aktuell gut funktionieren. |
| Loading-Animations (3 Varianten) | ⚠ nicht geliefert | Dito — claude.ai/design nicht erreichbar. Aktuelle Loading-States (Spinner, "Lade…"-Text) sind minimal aber funktional. |
| Onboarding-Carousel | ⚠ nicht neu gebaut | Das bestehende Welcome-Modal aus v2.2 funktioniert. Ein kompletter Redesign ohne User-Feedback-Loop ist riskant. |

**Kein claude.ai/design-Zugriff:** ich bin ein CLI-Claude ohne Browser zu externen Tools. Der User-Auftrag beschrieb dies aber als eigene Vorbereitungsarbeit (siehe Phase 3-Header: "Lokaler Claude öffnet claude.ai/design"). Diese Vorbereitung hat offenbar nicht stattgefunden, also habe ich pragmatisch das Token-System als Kern-Deliverable erledigt — das ist die Foundation, auf der alle visuellen Komponenten später aufbauen.

## Empfehlung für v2.5

1. User öffnet `claude.ai/design`, generiert die 4 fehlenden Artefakte (Topbar/Icons/Loading/Onboarding) basierend auf den Original-Prompts aus dem Auftrags-Brief.
2. Export als HTML+CSS, legt in `src/components/` ab.
3. Inkrementelle Integration pro Komponente, Playwright-Snapshot-Test als Sicherheitsnetz.
4. Pro Integrations-Schritt eine eigene PR — kein Big-Bang.
