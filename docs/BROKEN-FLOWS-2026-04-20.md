# Broken Flows — 2026-04-20

Statische Analyse: alle `onclick="X(…)"` gegen definierte Functions gemuxt.

## Ergebnis

- Geprüfte onclick-Handler: 729
- ✅ Resolved (Function ist definiert): 726
- ❌ Unresolved: 3

## Unresolved (Potential Broken Flows)

| Handler | Funktion | File:Line |
|---|---|---|
| `try{localStorage.setItem(\'csc-cookie-dismissed\',\'1\')}catch(e){};this.parentN` | `try` | index.html:4012 |
| `updOP('${o.id}','foilColor','${p.col}')` | `updOP` | index.html:8475 |
| `rechtsklickRaum(rooms.find(r=>r.id===\''+r.id+'\'))` | `rechtsklickRaum` | index.html:22900 |

**Hinweis:** Unresolved kann False-Positive sein wenn die Funktion via `<script src>` kommt (pdf.js, mammoth, JSZip-CDN) oder zur Laufzeit via `window.X = …` zugewiesen wird nachdem der HTML-Parser die Handler-Strings schon gelesen hat. Manuell prüfen.