# P15 — Right-Panel Cleanup-Plan

Stand: 2026-04-22 · Kein Code-Change in diesem Doc, nur Inventar + Vorschlag.

## 1. Inventar (5 Tabs)

### 1a. Tab-Header

| Tab-ID | Label | Panel-ID | Default-Aktiv? |
|---|---|---|---|
| `rtab-ai` | 🤖 KI-Assistent | `rpanel-ai` | — |
| `rtab-design` | 🎨 Design | `rpanel-design` | — |
| `rtab-light` | 🌅 Licht | `rpanel-light` | — |
| `rtab-save` | 💾 Projekte | `rpanel-save` | — |
| `rtab-props` | ⚙ Eigenschaften | `rpanel-props` | ✅ (durch Boot-setTimeout + init HTML-Klasse) |

### 1b. `rpanel-ai` — KI-Assistent

| Element | Zweck | Alt-Zugang |
|---|---|---|
| Chat-Scrollbereich `#ai-msgs` | Historie KI ↔ User | — |
| Eingabefeld `#ai-inp` (textarea) | Prompt-Eingabe | Ctrl+K (öffnet Palette, nicht Chat) |
| Send-Button `#ai-send` ↑ | Schicken | Enter-Taste |
| 6 Quick-Chips | Foto/CSC-Anlage/Layout/Kosten/Rechtliches/Nächste Schritte | — |

**Bewertung:** sauber, in sich geschlossen. **Kein Änderungsbedarf.**

### 1c. `rpanel-light` — Licht-Panel

| Gruppe | Inhalt | Alt-Zugang |
|---|---|---|
| Stimmungs-Presets | 6 Buttons (Tag/Golden/Abend/Nacht/Gemütlich/Professionell) | — |
| KI-Stimmung-Prompt | `aiLightPrompt()` | KI-Tab (generell) |
| Sonne | on/off, color, str, azimut, höhe, shadows | Ansicht-Menü (toggle-Items) |
| Umgebungslicht | on, sky-color, gnd-color, str | — |
| Fülllicht | on, color, str | — |
| Raumlichter & Rendering | room-str, room-col, exposure, fog-dens, sky-color | — |

**Bewertung:** strukturiert, präzise Labels, sinnvolle Gruppierung. **Kein Änderungsbedarf.**

### 1d. `rpanel-design` — Design-Panel

Dynamisch via `renderDesignPanelFull()` populated (JS-gerendert, nicht statisch im HTML). Zeigt Material-Optionen abhängig vom selektierten Objekt/Raum. **Out-of-scope** für diesen Plan (bräuchte eigenen Deep-Dive).

### 1e. `rpanel-save` — Projekte-Tab (🔴 HAUPTPROBLEM)

Inhalt aktuell:

| # | Element | Zweck | Thematisch passend? |
|---|---|---|---|
| 1 | `#cloud-status-bar` | Verbindungs-Indikator | ✅ |
| 2 | `.api-box` — **Anthropic-API-Key** | KI-Key eingeben/testen | ❌ gehört in KI-Tab oder Settings |
| 3 | "Meine Identität" Box — **Username + TeamID** | Persönliche Inputs | ❌ gehört in Settings-Modal |
| 4 | **KCanG-Projektdaten-Block** — ~15 Inputs | Mitglieder, Adresse, POIs, Bubatzkarte, Altersprüfung, Präventionsbeauftragter, Max-Höhe, Messetage, sqmPerPerson, plannedPeopleCount, energyClass, budgetCap, securityThreshold, Messe-Kosten, Packliste, Visualisierung, WindowsFilmed | ❌ **gehört ins KCanG-Dashboard** (`openKCaNGDashboard`, via Topbar 🌿-Button erreichbar) |
| 5 | `<details>` "💾 Speichern" | saveProj + openTemplates + saveAsUserTemplate + .json-Upload | ✅ Core |
| 6 | `<details>` "📤 Export" | PDF/JSON/CSV/GLTF/DXF/IFC — 7 Buttons | ✅ Core |
| 7 | `<details>` "📜 Historie" | showChangelog + openVisualHistory | ✅ Core |
| 8 | `<details>` "📄 Messeordnung" | PDF-Import via Claude | ⚠ Event-mode-spezifisch, hier OK aber könnte in Event-Mode-Context |
| 9 | Supabase-Cloud-Box | sb-status, sign-in/out, cloud-url | ✅ Core |
| 10 | `#sb-save-btn` + `#sb-load-btn` | Cloud-Save + Cloud-Load-Trigger | ✅ Core |
| 11 | `#cloud-list` | Liste Cloud-Projekte | ✅ Core |
| 12 | Versionen-Section + `saveVersion()` | Named-Version-Bookmarks | ✅ Core |
| 13 | "Lokal gespeicherte Projekte" + `#saved-list` | localStorage-Liste | ✅ Core |
| 14 | `<details>` "👥 Teams" | **openTeamsModal** (→ öffnet Modal) | ❌ Duplikat-Navigation — Button nutzt `openTeamsModal`, Modal ist auch via Datei-Menü/Ctrl+K erreichbar |
| 15 | `<details>` "🔒 Datenschutz / DSGVO" | exportMyData + deleteAccount + Privacy-Links | ✅ OK |
| 16 | Credits-Button | openCredits() | ✅ OK |

**Bewertung:** 3 von 16 Inhalten (Nr. 2, 3, 4, 14) sind **thematisch falsch platziert**. Das Panel heißt "Projekte" — sollte also Speichern/Laden/Export/Historie/Cloud-Sync sein. API-Key, User-Identity, KCanG-Meta und Teams-Modal-Trigger sind Fremdkörper.

### 1f. `rpanel-props` — Eigenschaften

Dynamisch via `renderRoomProps()` / `renderObjProps()`. Zeigt Eigenschaften des aktuell selektierten Elements. **Kein Änderungsbedarf** — semantisch sauber.

---

## 2. Redundanzen + Kern-Problem

### Echte Dopplungen

| Feature | Right-Panel | Primär-Zugang |
|---|---|---|
| KCanG-Projektdaten | Im `rpanel-save` Block (15 Inputs) | `#btn-kcang` → `openKCaNGDashboard` → **`#m-kcang-dashboard`-Modal** — dort existiert **das gleiche Block!** Beide schreiben in `projMeta.*`, wechseln sich in gegenseitiger Synchronisation |
| Teams-Management | `<details>` "👥 Teams" mit einem Button `openTeamsModal` | Datei-Menü + Ctrl+K → öffnet dasselbe Modal |
| API-Key-Eingabe | `.api-box` im Save-Panel | — (nirgends sonst) |
| User-Identity | Box im Save-Panel | — (nirgends sonst) |

### Kern-Problem

Der Save-Panel ist im Laufe der Entwicklung zum **Catch-All für alles-was-kein-anderes-Panel-hat** geworden. Drei Sinnbereiche vermischen sich:

1. **Speichern / Laden / Export** (das eigentliche Thema, ~8 von 16 Elementen)
2. **Projekt-Metadaten** (KCanG-Regeln, ~1 von 16 Elementen, aber ~60% des Platzes)
3. **App-Settings** (API-Key, Identity, Credits, ~4 von 16 Elementen)

---

## 3. Soll-Zustand (Vorschlag)

### Variante A — Nur Dopplungen entfernen (niedrig-Risiko)

| Change | Wo |
|---|---|
| Teams-Collapsible entfernen | Save-Panel |
| Credits-Button behalten (OK) | Save-Panel |
| DSGVO-Collapsible behalten | Save-Panel |

**Impact:** minimal. User verliert einen redundanten Zugangspunkt zum Teams-Modal; das Modal bleibt via Datei-Menü + Ctrl+K erreichbar.

**UX-Grenzfall:** keine echten. Teams-Button ist eindeutig Duplikat-Navigation.

### Variante B — Kern-Problem adressieren (UX-kritisch)

| Change | Begründung | UX-Grenzfall |
|---|---|---|
| KCanG-Block aus `rpanel-save` entfernen | Existiert 1:1 im `m-kcang-dashboard` | ⚠ **User hat sich daran gewöhnt**, beim Speichern auch Meta zu pflegen. Trennung bricht Workflow. |
| API-Key + Identity in neues `m-settings`-Modal | Aktuell einzige Zugangspunkte via Save-Panel | ⚠ **User weiß nicht** wo API-Key sonst ist. Migration braucht Hinweis + Shortcut. |
| Messeordnung-Collapsible ins Event-Mode-Panel | Event-spezifisch | — |

**UX-Grenzfälle:** 2 von 3 Punkten. Hier würde ich Variante B **NICHT** ohne User-Freigabe durchziehen.

### Variante C — Progressive Disclosure (mittleres Risiko)

Statt Inhalte zu verschieben, sie **besser gruppieren** mit `<details>`:

- 💾 Projekt-Speicherung (default auf)
- 📤 Export (default zu)
- ☁ Cloud (default zu, außer wenn aktiv genutzt)
- 📜 Historie (default zu)
- ⚙ **Projekt-Metadaten (KCanG)** — collapse als `<details>`, Inhalt unverändert (default zu)
- 🔑 **Meine Einstellungen** — neuer `<details>` umklappt API-Key + Identity (default zu)
- 🔒 DSGVO (default zu)

**Impact:** selbes Panel, bessere Scanbarkeit. Zero Feature-Verlust, zero Navigation-Regression.

**UX-Grenzfälle:** keine. Wenn User die Sections zuklappt, sind sie weg — wenn er sie braucht, ein Klick.

### Variante D — Hybrid (meine Empfehlung für spätere Umsetzung)

- Variante A sofort (Teams raus)
- Variante C parallel (alles in `<details>`, alles bleibt erreichbar)
- Variante B später als eigene PR mit User-Feedback-Loop

---

## 4. Risiko-Analyse

### Niedrig-Risiko (Variante A, C)

| Risiko | Bewertung |
|---|---|
| Feature-Verlust | 0 — alles erreichbar |
| E2E-Test-Breaks | minimal — `right-panel.spec.ts` testet Tab-Switching, nicht Panel-Inhalt |
| Muscle-Memory | okay — User klickt weiterhin denselben Tab, findet seine Inhalte dort |

### Hoch-Risiko (Variante B)

| Risiko | Bewertung |
|---|---|
| KCanG-Workflow bricht | 🔴 User der beim Speichern auch Meta pflegt, muss jetzt zwei Stellen besuchen |
| API-Key-Migration | 🟠 User findet Key nicht mehr, bis er im neuen Settings-Modal schaut |
| Teams-Button | 🟢 Klar redundant, kein Workflow-Break |

### E2E-Impact

`tests/e2e/right-panel.spec.ts` testet:
- Alle 4 Cleanup-Tabs + Props sind per `showRight()` aktivierbar
- Mutual-Exclusive (nur ein Panel aktiv)

Keine Panel-Inhalt-Tests. Panel-Content kann refactored werden ohne Test-Breaks — solange `#rpanel-save` weiterhin existiert und `showRight('save')` es aktiviert.

Neue Tests wären sinnvoll für Variante B:
- Assert KCanG-Inputs existieren (wo auch immer sie jetzt sind)
- Assert API-Key-Input existiert und speichert
- Assert DSGVO-Links funktionieren

---

## 5. STOP — Empfehlung für weiteres Vorgehen

**Plan ist NICHT no-brainer.** Es gibt UX-Grenzfälle die User-Freigabe brauchen:

1. **Teams-Collapsible entfernen (Variante A)** — OK ohne Freigabe, Duplikat
2. **Alle Sections als `<details>`-Collapsible gruppieren (Variante C)** — OK ohne Freigabe, nur Layout
3. **KCanG-Block aus Save-Panel entfernen** — ❌ **braucht User-Freigabe**
4. **API-Key + Identity in neues Settings-Modal verschieben** — ❌ **braucht User-Freigabe**

Daher: Aufgabe 2 der Batch wird **nicht automatisch** ausgeführt. Folgender Vorschlag für User-Freigabe:

### Entscheidungs-Fragen für User

1. Soll das Teams-Collapsible aus dem Save-Panel raus? (niedriges Risiko, klar Duplikat)
2. Sollen KCanG-Projektdaten AUSSCHLIEßLICH im KCanG-Dashboard existieren (im Save-Panel entfernen)? Oder duplizieren lassen, weil User-Workflow?
3. Sollen API-Key + Username/Team in ein eigenes Settings-Modal wandern? Wenn ja, wo öffnet man es (Topbar-Icon? Ctrl+K?)
4. Variante C (alles in `<details>` mit gutem Default-offen/zu) als Quick-Win sofort ausliefern — OK oder braucht Feedback-Runde?

Wenn Antworten vorliegen → eigener Branch `p15/right-panel-cleanup` + Umsetzung.

---

## 6. Nicht-Inhalt des Plans (bewusst weggelassen)

- **Design-Panel-Content** (`renderDesignPanelFull`) — dynamisch, bräuchte Code-Level-Analyse, out-of-scope
- **Props-Panel-Content** — dito, dynamisch via `renderRoomProps`/`renderObjProps`
- **Light-Panel-Groupings** — funktioniert bereits gut
- **AI-Panel-Groupings** — funktioniert bereits gut

Diese 4 Tabs bleiben wie sie sind.
