# Test-Reports

Hier liegen Test-Checklisten-Exporte aus `/test.html`.

## Dateinamen-Format

```
test-report-YYYY-MM-DD-HHMM.md
```

Beispiel: `test-report-2026-04-21-1430.md` — Test vom 21. April 2026, 14:30 Uhr.

## Workflow

1. In der App `/test.html` öffnen, Items durchklicken, Notizen/Screenshots anhängen.
2. Button **📤 Report ans Repo pushen** → triggert den `.md`-Download und zeigt die Repo-Push-Anleitung.
3. Datei nach `docs/test-reports/` verschieben.
4. Screenshots (falls vorhanden) nach `docs/test-reports/screenshots/<slug>/` kopieren.
5. `git add docs/test-reports/ && git commit -m "Test-Report <slug>" && git push`.
6. Web-Claude Bescheid geben: **"Test beendet, Datum: YYYY-MM-DD-HHMM"**.

## Screenshots

Optional, pro Report in einem eigenen Unterordner:

```
docs/test-reports/
  test-report-2026-04-21-1430.md
  screenshots/
    2026-04-21-1430/
      1-login-flow.png
      2-room-draw.png
      …
```

Die generierten `.md`-Dateien referenzieren Screenshots zweifach:

- Ein HTML-Kommentar mit dem aspirationellen Repo-Pfad: `<!-- repo-path: docs/test-reports/screenshots/<slug>/<N>-<id>.png -->`
- Direkt darunter ein inline `![alt](data:image/png;base64,...)` als Sofort-Rendern-Fallback.

Für die gepushte Variante kann der User die `data:`-URLs per sed-Replace durch die Repo-Pfade ersetzen — empfohlen wenn die `.md` ohne Screenshots kleiner sein soll (data-URLs blähen das File auf ~50–200 KB pro Screenshot).

## Web-Claude-Zugriff

Web-Claude liest über GitHub-MCP den Repo-Tree. Tippe z.B.:

> Zeig mir den neuesten Test-Report aus docs/test-reports/.

oder

> Vergleich Report 2026-04-21-1430 mit dem davor.
