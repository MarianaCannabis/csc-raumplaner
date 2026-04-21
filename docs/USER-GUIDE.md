# CSC Studio Pro — User-Guide

Version 1.0 · Stand 2026-04-21

## Inhalt

1. [Erste Schritte](#erste-schritte)
2. [Räume & Objekte](#räume--objekte)
3. [Flächen (Ground-Materials)](#flächen-ground-materials)
4. [Messestände planen](#messestände-planen)
5. [KCanG-Compliance](#kcang-compliance)
6. [Bild-Upload auf Oberflächen](#bild-upload-auf-oberflächen)
7. [Cloud-Save & Login](#cloud-save--login)
8. [Export (DXF/PDF/CSV/GLTF/IFC)](#export)
9. [3D-Rundgang](#3d-rundgang)
10. [Realtime-Kollaboration](#realtime-kollaboration)
11. [PDF-Messeordnung importieren](#pdf-messeordnung-importieren)
12. [Tastenkürzel](#tastenkürzel)
13. [Troubleshooting](#troubleshooting)

## Erste Schritte

Beim ersten Start zeigt dir ein 3-Step-Welcome die Hauptoptionen:

- **📋 Vorlage laden** — 18 fertige Templates (Mari-Jane, Dmexco, Boot, Gamescom, CSC-Größen)
- **⬜ Leer starten** — Räume selbst zeichnen
- **📂 Projekt laden** — aus lokaler Datei oder Cloud

Die Welcome-Overlay lässt sich mit `Nicht mehr anzeigen` dauerhaft ausblenden. Jederzeit wiedererreichbar via `Hilfe-Menü → ▶ Illustriertes Intro`.

## Räume & Objekte

- **Raum zeichnen:** Toolbar unten `⬜ Raum zeichnen` → auf 2D-Plan ziehen.
- **Objekt platzieren:** Linke Sidebar → Kategorie auswählen → Item auf Plan ziehen.
- **Selektieren:** Klick auf ein Objekt/Raum. Rechte Sidebar zeigt Eigenschaften.
- **Drehen:** Taste `R` (90°-Schritte) oder Rotation-Input im Property-Panel.
- **Duplizieren:** Rechte Sidebar → `⧉ Duplizieren` oder `Strg+D`.
- **Löschen:** `Del` / `Backspace`.

## Flächen (Ground-Materials)

- Toolbar `🟫 Fläche` öffnet den Material-Picker mit 12 Presets (Teppich, Fliesen, Holz, Beton, Rasen, Schotter, Erde, Asphalt, Gummi, Bühne, Linoleum, Einfarbig).
- Rechteck ziehen → Fläche wird erstellt.
- Im Property-Panel: Name, Größe, Rotation, Material umschalten, Farb-Tint (Farbe mixt sich mit Textur).

## Messestände planen

1. `📋 Vorlagen` → Chip-Filter auf `Mari-Jane` / `Dmexco` / `Boot` / `Gamescom` → passende Größe wählen.
2. Template ersetzt aktuelle Räume + setzt `maxHeight` + `messeDays` auto.
3. KCanG-Regel `messeHeightLimit` wird aktiv — jedes Objekt über dem Höhen-Cap erscheint als ❌ in der Compliance-Liste.
4. Eigene Objekte aus `🎪 Messe`-Kategorie (Rückwand, Roll-up, Info-Theke, LED-Wand, Flag) hinzufügen.
5. **💰 Messe-Kosten schätzen** (Projekt-Panel) → Standmiete + Setup + Strom + WLAN + Teppich-Breakdown.
6. **📦 Packliste generieren** → Markdown-Export für Logistiker (Stück × Volumen × Gewicht pro Item).

## KCanG-Compliance

Neuer **🌿 KCanG-Button** in der Topbar öffnet das Dashboard mit:

- **Metadaten:** Mitgliederzahl, Adresse (+ POI-Check Button), Präventionsbeauftragter, Altersprüfung, Sichtschutzfolie
- **Live-Regel-Liste:** alle 21 aktiven Regeln mit ✅/❌/⚪-Status
- **Score** oben rechts (N/Total + Prozent)
- **Erweiterte Parameter** (collapsible): m²/Person, Personenzahl, Dämmstandard, Evakuierungs-Gehgeschwindigkeit etc.

Regel-Kategorien: Räume (Ausgabe/Lager/WC/Sozial), Sicherheit (Kamera/Rauchmelder/Notausgang/Feuerlöscher/Alarm), Flucht, Kapazität, Mitglieder-Limit, Jugendschutz, Sichtschutz, POI-Abstand (§13), Präventionsbeauftragter (§23), Messe-Höhe.

## Bild-Upload auf Oberflächen

Nicht jedes Objekt, sondern nur Items mit deklarierter Display-Fläche (Rückwand, Roll-up, Counter-Front, LED-Wand, Flag, Whiteboard, Info-Pult, etc.):

1. Item selektieren → Rechte Sidebar → `🖼️ Bild auf Oberfläche`
2. `📁 Bild wählen` → JPEG/PNG/WebP max 10 MB
3. Auto-downscale auf 1024 px + JPEG Q 0.85 → landet in `o.imageMap`
4. 2D-Thumbnail erscheint im Footprint, 3D-Material auf der Front-Seite

Bei Items ohne `imageMapFace` steht eine Info-Box „Dieses Objekt unterstützt keinen Bild-Upload" + Verweis auf die `🎪 Messe`-Kategorie.

## Cloud-Save & Login

- **Login:** Rechts `💾 Projekte` → `🔑 Einloggen` → Magic-Link per Mail → Klick im Mail-Link → eingeloggt.
- **Token-Auto-Refresh:** 1h-Access-Token wird alle 5 Min still erneuert. Refresh-Token lebt ~2 Wochen.
- **Cloud speichern:** `☁️ Cloud speichern` → Projekt landet in Supabase. Mehrere Benutzer können dasselbe Projekt laden (über den Namen).
- **Cloud-Projekte laden:** `📂 Cloud laden` zeigt Projekt-Liste.

## Export

Alle im Projekt-Panel → Export-Sektion:

- **📥 JSON** — komplettes Projekt, re-importierbar
- **🖨 PDF** — Druckvorschau mit Grundriss + KCanG-Status-Tabelle
- **📊 Möbelliste CSV** — Detail (pro Instanz) + Aggregiert (typeId-gruppiert)
- **💰 Budget CSV**
- **🏗 GLTF** — 3D-Modell für Blender/Three-Viewer
- **📐 DXF** — CAD-Export mit 5 Layers (ROOMS/GROUNDS/OBJECTS/FREE_WALLS/MEASURES)
- **🏗 IFC** — BIM-Light (nur Räume; kein IFC4)
- **📸 Hochauflösende Visualisierung** — 4 Preset-Kameras (Front/Seite/Draufsicht/Perspektive) in HD/2K/4K als PNG

## 3D-Rundgang

Topbar `🎬` oder Ansicht-Menü `3D-Rundgang starten`:

- Klick auf Canvas → Pointer-Lock aktiviert
- **WASD** / Pfeiltasten zum Bewegen
- **Shift** hält für Sprint
- **Maus** zum Umsehen
- **ESC** beendet Pointer-Lock
- **✕ Zurück zur Übersicht**-Button oben mittig schließt Walk-Mode
- Kollision gegen Raum-Grenzen; Kopfhöhe konstant 1.70 m

## Realtime-Kollaboration

Wenn ein zweiter User eingeloggt ist und dasselbe Projekt öffnet:

- **Avatar-Bar** oben rechts: 👥 N online + farbige Initialen der anderen User
- **Mouse-Cursor der anderen** als farbiger Pfeil mit Email-Label im 2D-Canvas
- Heartbeat alle 5s, Poll alle 3s
- Stale Sessions (>15s kein Ping) werden ausgeblendet

*Setup-Hinweis: Supabase-Migration `0003_realtime_sessions.sql` muss eingespielt sein. Ohne Migration fallbackt der Client silent (Console-Warning, kein Crash).*

## PDF-Messeordnung importieren

1. Projekt-Panel → Collapsible `📄 Messeordnung` → `PDF importieren`
2. PDF max 20 MB → wird base64 an Claude-Proxy geschickt
3. Claude extrahiert: Höhenlimits, Abstände, Elektro-Regeln, Brandschutz, Materialklassen → als JSON
4. `👁 Regeln ansehen` → Modal mit farbcodierter Liste (🔴 critical / 🟠 high / 🟡 medium / ⚪ low)
5. Regeln persistieren in `projMeta.regulationRules` (speichern/laden inkludiert sie)

## Tastenkürzel

| Taste | Aktion |
|---|---|
| `Strg+Z` | Rückgängig |
| `Strg+Y` / `Strg+Shift+Z` | Wiederholen |
| `Del` / `Backspace` | Selektion löschen |
| `R` | Objekt/Raum 90° drehen |
| `H` | Hilfe |
| `I` | Statistiken |
| `Z` | Zoom auf Selektion |
| `ESC` | Cancel Drawing / Close Modal / Exit Pointer-Lock |
| `Leertaste` + Drag | Canvas pannen |
| `Strg+S` | Lokal speichern |
| `Mausrad` | Zoom (2D + 3D) |

## Troubleshooting

**App zeigt Welcome-Overlay bei jedem Start** — LocalStorage-Check `csc-welcome-never` nicht gesetzt. Im Welcome-Modal Checkbox `Nicht mehr anzeigen` aktivieren.

**Cloud-Save funktioniert nicht** — eingeloggt? `🔑 Einloggen`-Button im Save-Panel. Falls 401-Fehler: Token abgelaufen, Auto-Refresh läuft alle 5 Min. Notfalls neu einloggen.

**Items werden als flache Box gerendert** — seit P7 nicht mehr (Category-basierte Generic-Builder greifen). Falls doch: Item meldet in Console `[csc] builder failed`, Root-Cause ist wahrscheinlich fehlende Katalog-Dimension (w/d/h = 0). Numeric-Safety in build3DObj fängt das ab.

**Bloom-Effekt nicht sichtbar** — `Ansicht → ✨ Bloom an/aus` prüfen. Nur echte Emissives (matLED > threshold 0.85) triggern jetzt — LED-Wand-Modul, Exit-Sign, Stehlampe.

**3D-Welt wirkt washed-out** — war P6.5 Fix. Falls immer noch: HDRI-Laden in Console prüfen; applyEnvironment setzt envMapIntensity 1.4 auf allen MeshStandard-Materials.

**Zwei User sehen sich nicht live** — Supabase-Migration 0003 fehlt. User-Doku für Ops: `supabase db push` oder SQL-Editor direkt.

---

**Issues + Feature-Requests:** https://github.com/MarianaCannabis/csc-raumplaner/issues
