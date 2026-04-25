# Broken Flows — 2026-04-25

Statische Analyse: alle `onclick="X(…)"` gegen definierte Functions gemuxt.

## Ergebnis

- Geprüfte onclick-Handler: 723
- ✅ Resolved (Function ist definiert): 722
- ❌ Unresolved: 1

## Unresolved (Potential Broken Flows)

| Handler | Funktion | File:Line |
|---|---|---|
| `try{localStorage.setItem(\'csc-cookie-dismissed\',\'1\')}catch(e){};this.parentN` | `try` | index.html:2395 |

**Hinweis:** Unresolved kann False-Positive sein wenn die Funktion via `<script src>` kommt (pdf.js, mammoth, JSZip-CDN) oder zur Laufzeit via `window.X = …` zugewiesen wird nachdem der HTML-Parser die Handler-Strings schon gelesen hat. Manuell prüfen.