# Design Tokens — CSC Studio Pro

Stand: 2026-04-20 · Single Source of Truth für Farben, Spacing, Radien.

## Farb-Tokens (CSS custom properties, definiert in index.html)

### Hintergründe
| Token | Hex | Verwendung |
|---|---|---|
| `--bg`  | #111 | App-Hintergrund |
| `--bg2` | #191919 | Panel-Hintergrund |
| `--bg3` | #212121 | Button-default, Card-Hintergrund |
| `--bg4` | #2a2a2a | Button-hover |

### Rahmen
| Token | Hex | Verwendung |
|---|---|---|
| `--bd`  | #2e2e2e | Standard-Border |
| `--bd2` | #3a3a3a | Hover-Border, stärkerer Akzent |

### Text
| Token | Hex | Verwendung |
|---|---|---|
| `--tx`  | #e8e4d8 | Primär-Text |
| `--tx2` | #9a9288 | Sekundär-Text, Label |
| `--tx3` | #5a5650 | Platzhalter, Badges |

### Akzent-Farben (Semantic)
| Token | Rolle | Nutzung |
|---|---|---|
| `--gr`, `--gr3` | CSC-Grün | Primary-Actions, Success-States, Key-Brand-Elemente (Speichern, Vorlagen, KCanG) |
| `--ok` | Success | Grün (Bestätigungen, erledigte Checks) |
| `--warn` | Warning | Orange (Überfüllte Räume, Limit-Warnungen) |
| `--err` | Error | Rot (Compliance-Verstöße, Upload-Fehler) |

## Spacing / Border-Radius Tokens
| Token | Wert | Verwendung |
|---|---|---|
| `--r6` | 6px | Small-Buttons, Input-Fields |
| `--r8` | 8px | Icon-Buttons, Sidepanel-Cards |

## Button-Patterns

### Primary Action (CSC-Grün, prominent)
```html
<button class="tbt" style="border:1px solid var(--gr3);background:rgba(74,222,128,0.08);color:var(--gr);font-weight:600">
  💾 Speichern
</button>
```

Einsatz: Save-Button, Vorlagen-Button, KCanG-Dashboard-Button.

### Secondary Action (neutral)
```html
<button class="tbt">📂 Öffnen</button>
```

Einsatz: Alle nicht-kritischen Topbar-Actions, Submenu-Items.

### Icon-Only Button (mit aria-label)
```html
<button class="tbt icon-btn" aria-label="Rückgängig" title="Rückgängig (Ctrl+Z)">↩</button>
```

Einsatz: Undo/Redo, Help. Immer mit `aria-label` und `title`.

## Konsistenz-Regeln

1. **Button-Hierarchie:** max. 3 Primary-Buttons pro Topbar — sonst verliert sich die Aufmerksamkeit.
2. **Icons:** Emoji-first. Dinge, die grün gestrichelt sind (Vorlagen, KCanG, Speichern) gehören ins 💾/📋/🌿-Register.
3. **Text-Farben:** Niemals `color:#<hex>` inline — immer `var(--tx|tx2|tx3)`.
4. **Hintergründe:** Keine neuen Graustufen — immer `--bg`/`--bg2`/`--bg3`/`--bg4`.
5. **Icon-Only-Buttons** brauchen immer `aria-label` + `title` (siehe P8.6).

## Anti-Patterns (vermeiden)

| ❌ Anti-Pattern | ✅ Ersatz |
|---|---|
| `style="color:#ccc"` | `style="color:var(--tx2)"` |
| `style="background:#222"` | `style="background:var(--bg3)"` |
| Button ohne Label-Text UND ohne aria-label | `<button aria-label="...">icon</button>` |
| Primary-Style auf 5+ Topbar-Buttons | Max 3, Rest Secondary |

## Offene Schulden (v2.1)

- CSS ist inline in `index.html` (~2500 Zeilen `<style>`-Block). Ausgliedern nach `src/styles/*.css`, damit purgecss greifen kann.
- Button-Klassen `.tbt`, `.mbt`, `.ib` teilweise redundant — in v2.1 zu einem `.btn`-Pattern mit Modifier-Klassen konsolidieren.
- Dark-Mode-Only heute. Light-Mode-Tokens fehlen (`toggleTheme` togglet Scene-Beleuchtung, nicht UI-Farben).
