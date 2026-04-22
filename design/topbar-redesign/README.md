# Topbar-Redesign — Reference from claude.ai/design

Quelle: claude.ai/design-Session, 2026-04-22
Ausgangsmaterial: 2 Screenshots der bestehenden Topbar (CSC Studio Pro v2.4.2)

---

## Was in diesem Ordner ist

| Datei | Zweck | Produktions-tauglich? |
|-------|-------|------------------------|
| `topbar.css` | Design-Tokens + Button-Variants + Segmented-Control + Responsive-Overrides | ✅ **Ja** — CSS ist frameworkfrei |
| `topbar.jsx` | Referenz-Implementierung inkl. 24 Lucide-Stil Inline-SVG-Icons | ⚠ **Reine Referenz** — React-JSX, muss nach vanilla HTML portiert werden |

---

## Integrations-Kontrakt (WICHTIG — für lokalen Claude)

Die claude.ai/design-Ausgabe ist ein **Design-System**, **kein** Drop-in-Ersatz für unsere `index.html`-Topbar. Das Mapping zwischen Design und App stimmt an mehreren Stellen nicht. Folgende Regeln gelten für die Integration:

### ✅ 1:1 übernehmen

- **Design-Tokens** (`:root` + `[data-theme="light"]`) — alles ab `--brand-500` bis `--touch: 44px`. In `src/styles/tokens.css` mergen (Duplikate deduplizieren).
- **Button-Variants** (`.tb-btn`, `.tb-btn--primary/ghost/soft/accent/tool/tab`, `.tb-btn.is-active`).
- **Segmented-Control** (`.tb-seg`, `.tb-seg__item`, `.tb-seg__item.is-active`).
- **Focus-Ring** (`.tb-btn:focus-visible`-Regel mit box-shadow).
- **Responsive-Overrides** (`.tb--narrow-single`).
- **Die 24 Inline-SVG-Icons** aus `topbar.jsx` — als **vanilla-JS-Modul** portieren: `src/icons/lucide.ts` mit `icon(name, opts): string` → gibt SVG-String zurück. KEIN React, KEINE JSX-Factory.

### ❌ NICHT übernehmen

| Was | Warum |
|-----|-------|
| „KGarG"-Schreibweise | claude.ai/design-Tippfehler. Echtes Gesetz: **KCanG**. NIEMALS ändern. |
| „v2.22" hardcoded | Wir nutzen `__APP_VERSION__` (Vite-Build-time, aktuell v2.4.2). |
| Row 2: „Auswählen / Wand / Raum / Fläche / Maß / Verschieben / Zentrieren" | Das ist unsere **Schnell-Toolbar über dem Canvas**, separate Komponente. |
| Row 2: „Assets / Projekte / Eigenschaften" | Das sind unsere **Right-Panel-Tabs** (`#rtab-*`). Gehören ins rechte Panel, nicht in die Topbar. |
| „+ Neue Ausgabestelle" als grüner Button | In unserer App ist „Neue Ausgabestelle" der **editierbare Projektname** mit Edit-Pen. Nicht als CTA missverstehen. |
| „Zeit"-Dropdown (Clock-Icon) | Existiert nicht in unserer App. |
| „Standard"-View-Preset | Ist in Wirklichkeit **UI-Mode-Select** (Simple/Standard/Pro) — struktureller Unterschied. |
| React/Babel-Setup | Unsere App ist vanilla JS. JSX nur als visueller Leitfaden. |
| `design-canvas.jsx` | Figma-Wrapper der claude.ai/design-Umgebung. |

### 🚨 Features die im Design fehlen, aber erhalten bleiben MÜSSEN

1. **KCanG-Button** (`#btn-kcang`, grün-umrandet, `data-mode="room"`, `onclick="openKCaNGDashboard()"`)
2. **UI-Mode-Select** (`#ui-mode-select` — Simple/Standard/Pro)
3. **Help-Button** `❓` (`#btn-help`)
4. **Floor-Tabs** (`#floor-tabs` + `.ftab-add +`-Button)
5. **Walk-Modus** `🚶` als dritter Segment-Item im 2D/3D-Toggle

---

## Emoji → Icon Mapping

| Emoji (alt) | Icon (neu) | Verwendung |
|-------------|------------|------------|
| ↶ | `undo` | Rückgängig |
| ↷ | `redo` | Wiederholen |
| 💾 | `save` | Speichern |
| 🏪 | `room` | Raumplanung-Mode |
| 🎪 | `event` | Veranstaltungs-Mode |
| 🌿 | `leaf` | KCanG (nicht KGarG!) |
| 🇩🇪 | `globe` | Sprach-Select |
| 📁 | `file` | Datei-Menü |
| 👁 | `layers` | Ansicht-Menü |
| 📊 | `chart` | Analyse-Menü |
| 🔗 | `share` | Teilen-Menü |
| ☀/🌙 | `sun` / `moon` | Light/Dark |
| ⬛ | `square` | 2D |
| 🟦 | `cube` | 3D |
| 🚶 | (kein Lucide) | Walk — Emoji oder custom SVG behalten |
| ❓ | `help-circle` | Hilfe |
| ➕ | `plus` | Floor-Add |
| ⋯ | `more` | Overflow |

Icons für Row-2 in `topbar.jsx` (`Cursor`, `Wall`, `RoomDraw`, `Area`, `Ruler`, `Move`, `Center`, `Box`, `Folder`, `Sliders`) **nicht** in `src/icons/lucide.ts` übernehmen — gehören nicht zur Topbar.

---

## Empfohlener Integrations-Ablauf

1. Token-Merge in `src/styles/tokens.css`
2. `src/icons/lucide.ts` mit `icon(name, opts): string`
3. Button-Variants in `src/styles/main.css` oder neue `src/styles/topbar-v2.css`
4. Topbar-HTML in `index.html` cluster-für-cluster umbauen (nie Big-Bang), nach jedem Cluster E2E grün
5. Light-Theme aktivieren (`toggleTheme()` → `data-theme`-Attribut)
6. Alte `.tbt`-Klassen + Emoji-Referenzen entfernen

Gates nach jedem Schritt: Unit + E2E + Build + tsc grün.
