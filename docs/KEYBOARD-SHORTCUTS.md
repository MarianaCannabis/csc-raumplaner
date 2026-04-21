# Keyboard Shortcuts — CSC-Raumplaner

Stand: 2026-04-20 · v1.0+

## Global (funktioniert überall)

| Taste | Aktion |
|---|---|
| `Ctrl+K` (`Cmd+K`) | Befehlspalette öffnen |
| `Ctrl+S` | Projekt speichern |
| `Ctrl+Z` | Rückgängig |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Wiederholen |
| `F1` / `?` | Hilfe-Modal öffnen |
| `Esc` | Modal / Tool / Palette schließen |

## Tools (nur wenn kein Input-Feld fokussiert)

| Taste | Aktion |
|---|---|
| `R` | Tool: Raum zeichnen |
| `W` | Tool: Wand zeichnen |
| `M` | Tool: Maß setzen |
| `D` | Maßketten ein/aus |
| `H` | Hilfe / Anleitung |
| `I` | Raum-Statistik anzeigen |

## Ansicht

| Taste | Aktion |
|---|---|
| `1` | 2D-Ansicht |
| `2` | 3D-Ansicht |
| `3` | Walkthrough (Egoperspektive) |

## Walk-Mode (in Egoperspektive)

| Taste | Aktion |
|---|---|
| `W` / `↑` | Vorwärts |
| `S` / `↓` | Rückwärts |
| `A` / `←` | Links |
| `D` / `→` | Rechts |
| `Space` | Springen |
| `Shift` | Laufen |
| `Esc` | Walk-Mode verlassen |

## Command Palette (nach Ctrl+K)

| Taste | Aktion |
|---|---|
| `↑` / `↓` | Ergebnis wählen |
| `Enter` | Befehl ausführen |
| `Esc` | Palette schließen |

## Command-Palette verfügbare Befehle (Auswahl)

Tippe im Palette-Input einfach los:

- `"raum"` → Raum zeichnen, Raum-Statistik, Reinigungsplan
- `"export"` → JSON, DXF, GLTF, CSV, IFC (falls Profi-Modus aktiv)
- `"ki"` → KI-Optimierung, Sicherheits-Audit, Raum beschreiben
- `"modus"` → UI-Modus Einfach/Standard/Profi
- `"sprache"` → DE/EN/NL/ES
- `"brandschutz"` → DIN-Berechnung
- `"kosten"` → Budget, Kostenvoranschlag

## Eingebauter Shortcut-Modal (in-App)

Öffnet sich über:
- Hilfe-Button `❓` in der Topbar → Tab "Tastenkürzel"
- Command Palette → "Shortcuts-Übersicht"
- Modal-ID: `m-shortcuts`

## Ergänzungen durch den User (P10.6 vorbereitet)

Eigene Shortcuts können via `_customShortcuts` registriert werden:

```js
// In index.html bereits vorhanden:
_customShortcuts['f'] = 'focusSelection';  // F fokussiert Selektion
_customShortcuts['b'] = 'toggleBudget';    // B togglet Budget-Panel
```

Ein UI zur Custom-Shortcut-Pflege ist in v1.1 geplant.

## Accessibility

- **Alle Shortcuts** respektieren `:focus-visible` — bei Keyboard-Navigation erscheint ein sichtbarer Fokus-Ring (P8.6).
- **Screen-Reader-Label:** Shortcut-Hinweise sind in `aria-label` + `title` aller Topbar-Buttons.
- **Reduced-Motion:** Panels öffnen ohne Animation, wenn `prefers-reduced-motion: reduce`.

## Bekannte Konflikte

- Browser-Default `Ctrl+S` speichert die HTML-Seite — die App überschreibt das mit `preventDefault` und speichert das Projekt stattdessen.
- `Ctrl+K` kollidiert in Chrome mit "Fokus auf Adressleiste" nicht — Chrome nutzt `Ctrl+L` dafür.
- In Firefox hat `Alt+D` eine Browser-Meaning; die App nutzt `D` ohne Modifier, daher safe.
