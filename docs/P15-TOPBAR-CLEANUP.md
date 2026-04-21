# P15 — Topbar-Cleanup-Plan

Stand: 2026-04-22 · Kein Code-Change in diesem Doc, nur Inventar + Vorschlag.

## 1. Inventar (in DOM-Reihenfolge)

### 1a. Logo + Undo/Redo (top-level, bleibt)

| # | Element | Sichtbarer Text | Funktion | Wo sonst erreichbar |
|---|---|---|---|---|
| 1 | `.logo` | 🌿 CSC **Studio Pro** | Branding, kein Click-Handler | — |
| 2 | `.vbadge` | v3.56 | Version, kein Click-Handler | — |
| 3 | `#undo-btn` | ↩ | `undo()` | Ctrl+Z |
| 4 | `#redo-btn` | ↪ | `redo()` | Ctrl+Y |

### 1b. Primary-Actions (top-level, bleibt)

| # | Element | Sichtbarer Text | Funktion | Wo sonst erreichbar |
|---|---|---|---|---|
| 5 | `#btn-save-primary` | 💾 Speichern | `saveProj()` lokal | Datei-Menü, Ctrl+S |
| 6 | `.mode-seg #pm-room` | 🏪 Raumplanung | `cscSwitchPlanningMode('room')` | Ctrl+K |
| 7 | `.mode-seg #pm-event` | 🎪 Veranstaltungs-Planung | `cscSwitchPlanningMode('event')` | Ctrl+K |

### 1c. Sekundäre Topbar-Buttons

| # | Element | Sichtbarer Text | Funktion | Wo sonst erreichbar |
|---|---|---|---|---|
| 8 | `#btn-templates` | 📋 Vorlagen | `openTemplates()` | `#tbm-tpl` Topbar-Menü, Ctrl+K |
| 9 | `#btn-kcang` | 🌿 KCanG | `openKCaNGDashboard()` | Ansicht-Menü "🌿 KCanG Live-Monitor", Ctrl+K |
| 10 | `#btn-help` | ❓ | `openHelpModal()` | Zweite Hilfe-Taste (#28), F1, ? |
| 11 | `#lang-switch` | 🇩🇪/🇬🇧/🇳🇱/🇪🇸 | `cscI18n.setLang()` | Ctrl+K |
| 12 | `#ui-mode-select` | 🌱/⚖/🚀 | `setUIMode()` | Ctrl+K |
| 13 | `.simple-badge` | ⚖ Simple | `setUIMode('standard')` — nur in Simple-Mode sichtbar | — |

### 1d. Dropdown-Menüs (bleiben top-level)

| # | Element | Sichtbarer Text | Inhalt | Wo sonst erreichbar |
|---|---|---|---|---|
| 14 | `#tbm-file` | 📁 Datei ▾ | ~30 Items (Neu/Save/Export/Druck/Behörde) | — |
| 15 | `#tbm-view` | 👁 Ansicht ▾ | ~50 Items (3D/2D/Wetter/Licht/Layer) | — |
| 16 | `#tbm-analyse` | 📊 Analyse ▾ | ~55 Items (Compliance/KI/Berechnungen) | — |
| 17 | `#tbm-share` | 🔗 Teilen ▾ | ~7 Items (Share-Link/QR/Changelog) | — |
| 18 | `#tbm-tpl` | 🏗 Vorlagen | Öffnet Templates-Modal (kein echtes Dropdown, nur Button mit tbm-btn-Styling) | Button #8 |

### 1e. "Mood + KI — immer sichtbar"-Block (Hauptproblem — 10 Icon-Buttons)

| # | Element | Sichtbarer Text | Funktion | Wo sonst erreichbar |
|---|---|---|---|---|
| 19 | `.tbt` (🌅) | 🌅 | `toggleMoodPanel()` | Button #36 `showRight('light')`, Ansicht-Menü |
| 20 | `.tbt` (🤖) | 🤖 | `openM('m-wizard')` — KI-Möbel-Wizard | Analyse-Menü, Ctrl+K |
| 21 | `#btn-guided` | 🧭 | `toggleGuidedMode()` | **Nur hier** |
| 22 | `#btn-undotl` | 🕐 | `toggleUndoTimeline()` | **Nur hier** |
| 23 | `.tbt` (⌨) | ⌨ | `openCmdPalette()` | Ctrl+K |
| 24 | `.tbt` (👥) | 👥 | `toggleVisitorFlow()` | Analyse-Menü |
| 25 | `.tbt` (🎬) | 🎬 | `start3DTour()` | Ansicht-Menü |
| 26 | `.tbt` (✨) | ✨ | `openPostFXSettings()` | Ansicht-Menü (Bloom + Beleuchtung) |
| 27 | `#theme-toggle` | 🌙 Dark | `toggleTheme()` | Ansicht-Menü "🌙 Hell/Dunkel" |
| 28 | `.tbt` (❓) | ❓ | `openHelp()` | Button #10 `#btn-help`, F1, ? |

### 1f. Etagen + View-Toggle (bleiben)

| # | Element | Sichtbarer Text | Funktion | Wo sonst erreichbar |
|---|---|---|---|---|
| 29 | `#floor-tabs` | EG, 1.OG, 2.OG, ... | Etagen-Switch | — |
| 30 | `.ftab-add` | ＋ | `openM('m-floor')` | — |
| 31 | `#vt-2d` | ⊞ 2D | `setView('2d')` | Ctrl+K, Shortcut `1` |
| 32 | `#vt-3d` | ⬛ 3D | `setView('3d')` | Ctrl+K, Shortcut `2` |
| 33 | `#vt-walk` | 🚶 | `setView('walk')` | Ctrl+K, Shortcut `3` |

### 1g. Duplikat-Navigation (USER-EXPLIZIT ZU LÖSCHEN)

| # | Element | Sichtbarer Text | Funktion | Wo sonst erreichbar |
|---|---|---|---|---|
| 34 | `#ki-dropdown-btn` | 🤖 KI-Assistent ▾ | `toggleKIDropdown()` | **Rechts-Panel-Tab `#rtab-ai`** (index.html Zeile 607) |
| 35 | `.tbt` (🎨) | 🎨 Design | `showRight('design')` | **Rechts-Panel-Tab `#rtab-design`** (Zeile 608) |
| 36 | `.tbt` (🌅) | 🌅 Licht | `showRight('light')` | **Rechts-Panel-Tab `#rtab-light`** (Zeile 609) |
| 37 | `.tbt` (💾) | 💾 Projekt | `showRight('save')` | **Rechts-Panel-Tab `#rtab-save`** (Zeile 610) |

### 1h. Projekt-Name + Rename (bleibt)

| # | Element | Sichtbarer Text | Funktion | Wo sonst erreichbar |
|---|---|---|---|---|
| 38 | `#proj-lbl` + Edit-Input | "Neue Ausgabestelle" | Klick → inline-rename | — |
| 39 | `.tbt.icon-btn` (✏️) | ✏️ | `openM('m-rename')` | — |

**Gesamt: ~39 interaktive Elemente in der Topbar.**

---

## 2. Redundanzen

### Echte Duplikate — identische Aktion existiert zweimal

| Feature | Topbar-Copy | Haupt-Zugang | Empfehlung |
|---|---|---|---|
| **KI-Assistent öffnen** | `#ki-dropdown-btn` (#34) | Rechts-Panel-Tab 🤖 (`#rtab-ai`) | **Topbar-Button weg** |
| **Design-Panel** | `showRight('design')` (#35) | Rechts-Panel-Tab 🎨 (`#rtab-design`) | **Topbar-Button weg** |
| **Licht-Panel** | `showRight('light')` (#36) | Rechts-Panel-Tab 🌅 (`#rtab-light`) | **Topbar-Button weg** |
| **Projekte-Panel** | `showRight('save')` (#37) | Rechts-Panel-Tab 💾 (`#rtab-save`) | **Topbar-Button weg** |
| **Hilfe** | `#btn-help` (#10) + ❓ (#28) | Zwei verschiedene Handler (`openHelpModal` vs. `openHelp`) — funktional äquivalent | **#28 weg, #10 bleibt** (prominenter positioniert) |
| **Vorlagen** | `#btn-templates` (#8) + `#tbm-tpl` (#18) | Dasselbe Modal (`openTemplates()`) | **#tbm-tpl weg** — #8 ist grün-gestylt und prominenter |
| **Mood/Licht-Quickbutton** | 🌅 (#19) + 🌅 Licht (#36) | Beide öffnen das Licht-Panel | **Beide weg** — Licht-Tab im Rechts-Panel reicht |

### In Menüs bereits verfügbar — Topbar-Shortcut redundant

| Feature | Topbar-Shortcut | Alternativer Pfad | Vorschlag |
|---|---|---|---|
| KI-Möbel-Wizard | 🤖 (#20) | Analyse-Menü + Ctrl+K | **Weg** |
| Besucherfluss | 👥 (#24) | Analyse → "Besucherfluss-Animation" | **Weg** |
| 3D-Rundgang | 🎬 (#25) | Ansicht → "3D-Rundgang starten" | **Weg** |
| Effekte/PostFX | ✨ (#26) | Ansicht → "Bloom" + "Beleuchtung" | **Weg** |
| Ctrl+K-Palette-Button | ⌨ (#23) | Tastatur Ctrl+K | **Weg** — Shortcut ist Power-User-Tool, Button-Duplikat unnötig |

### Nur-in-Topbar-Features (müssen in ein Menü, sonst verloren)

| Feature | Topbar-ID | Neuer Ort |
|---|---|---|
| Geführter Modus | `#btn-guided` (#21) | **NEU in Ansicht-Menü:** "🧭 Geführter Modus" |
| Undo-Timeline | `#btn-undotl` (#22) | **NEU in Ansicht-Menü:** "🕐 Verlaufs-Timeline" |

### Behalten wie sie sind

- Logo + Version-Badge
- Undo/Redo (sehr häufig, Topbar-Sichtbarkeit gerechtfertigt)
- Primary-Save + Mode-Seg (Core-Actions)
- KCanG (#9 — Haupt-Compliance-Einstieg in Raumplanung-Mode)
- Datei/Ansicht/Analyse/Teilen-Dropdowns
- Lang-Switch + UI-Mode-Select (Preferences, selten aber wichtig)
- Etagen-Tabs + View-Toggle (Core-Funktion)
- Projekt-Name + Rename

### Diskussionswürdig (keine starke Empfehlung)

- **Theme-Toggle 🌙 Dark (#27)**: Dark/Light-Switch ist ein häufiger Anwendungsfall — Topbar-Zugang ist UX-Win. Alternativ ins Ansicht-Menü (wo der Eintrag schon existiert) und aus Topbar entfernen. **Vorschlag: Behalten.**

---

## 3. Soll-Zustand (Topbar nach Cleanup)

### Primary-Bereich (links)

```
[🌿 CSC Studio Pro] [v3.56]
  [↩] [↪]
  [💾 Speichern]
  [🏪 Raumplanung | 🎪 Veranstaltungs-Planung]
  [📋 Vorlagen]
  [🌿 KCanG]   ← nur im Room-Mode sichtbar
```
**7–8 Elemente** je nach Mode.

### Mitte — Dropdown-Menüs

```
  [📁 Datei ▾]  [👁 Ansicht ▾]  [📊 Analyse ▾]  [🔗 Teilen ▾]
```
**4 Dropdowns** (`#tbm-tpl` weg).

### Rechts — Preferences + Projekt + View

```
  [🇬🇧 Sprache ▾]  [⚖ UI-Mode ▾]  [❓ Hilfe]  [🌙 Dark]
  [Etagen-Tabs] [+]
  [⊞ 2D | ⬛ 3D | 🚶]
  [Neue Ausgabestelle ✏️]
```

### Komplett entfallen

| Button | Neuer Ort |
|---|---|
| 🌅 Mood (#19) | Rechts-Panel 🌅 Licht-Tab (existiert) |
| 🤖 Wizard (#20) | Analyse-Menü + Rechts-Panel 🤖 KI-Tab |
| 🧭 Guided-Mode (#21) | **NEU** Ansicht-Menü: "🧭 Geführter Modus" |
| 🕐 Undo-Timeline (#22) | **NEU** Ansicht-Menü: "🕐 Verlaufs-Timeline" |
| ⌨ Palette (#23) | Nur Ctrl+K (Shortcut reicht) |
| 👥 Flow (#24) | Analyse-Menü (bereits dort) |
| 🎬 Tour (#25) | Ansicht-Menü (bereits dort) |
| ✨ PostFX (#26) | Ansicht-Menü (bereits dort) |
| ❓ Help doppelt (#28) | `#btn-help` (#10) reicht |
| 🤖 KI-Assistent-Dropdown (#34) | Rechts-Panel 🤖 KI-Tab |
| 🎨 Design (#35) | Rechts-Panel 🎨 Design-Tab |
| 🌅 Licht (#36) | Rechts-Panel 🌅 Licht-Tab |
| 💾 Projekt (#37) | Rechts-Panel 💾 Projekte-Tab |
| 🏗 `#tbm-tpl` (#18) | `#btn-templates` (#8) reicht |

---

## 4. Zusammenfassung nach Cleanup

- **Topbar interaktive Elemente:** 39 → **~19** (−51 %)
- **Primary-Buttons (ohne Dropdown-Header, View-Toggle, Floor-Tabs):** ≤ 10 ✅
- **Neue Menu-Items in bestehenden Menüs:** 2 (Guided-Mode + Undo-Timeline)
- **Gelöschte Buttons:** 14
- **Features verloren:** 0 — alles erreichbar via Menü / Ctrl+K / Rechts-Panel-Tabs

## 5. Konkrete Edits (Vorschau)

1. **index.html Zeilen 407–416** (Mood+KI-Block): 10 Buttons entfernen, davor 2 neue Menu-Items im Ansicht-Menü einfügen.
2. **index.html Zeilen 436–442** (Duplikat-Navigation): 4 Buttons entfernen.
3. **index.html Zeile 397–400** (`#tbm-tpl`): ganzes Menü-Element entfernen.
4. **Kein JS-Funktions-Change** — die aufgerufenen Funktionen bleiben alle erhalten (nur ihre Buttons werden entfernt).

### Risiko
- **Niedrig:** Alle Zielfunktionen bleiben erreichbar. Keine Funktion verschwindet.
- **UX-Learn-Curve:** User die sich an `🎨 Design`-Button gewöhnt haben, müssen kurz lernen dass das Rechts-Panel-Tab "Design" denselben Zugang bietet. Abfedern via einmaligen Toast bei erstem Start nach Update: "ℹ Design / Licht / KI / Projekte sind jetzt im rechten Panel."

### E2E-Tests (Regression-Check)
- `tests/e2e/` referenziert keinen der zu löschenden Buttons. Die vorhandenen Selektoren (`#pm-event`, `#btn-save-primary`, `#btn-help`, `#ui-mode-select`, `#lang-switch`, `.simple-badge`, `#ib-furn`, `#ib-rooms`, `#ib-events`) bleiben alle intakt.

---

## Plan OK, soll ich umsetzen?

Wenn ja: neuer Branch `p15/topbar-cleanup`, alle Edits in einem Commit, `npm test` + `npm run build` + `npm run test:e2e` zur Verifikation, PR + Link.
