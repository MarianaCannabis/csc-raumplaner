# Known Issues

Sammlung bekannter, nicht-kritischer Bugs und UX-Defizite für die Produktions-App. Jede Entry hat Status / Priorität / Repro / Fix-Skizze, damit ein späterer Contributor in 2 Minuten versteht, was zu tun ist.

---

## #1 — Right-Panel Tab-Boot-Race

- **Status:** offen
- **Priorität:** niedrig (kosmetisch, aber real)
- **Entdeckt:** 2026-04-22 beim Schreiben von `tests/e2e/right-panel.spec.ts` (P15 Topbar-Cleanup)

### Symptom

Wenn der User innerhalb der ersten ~200 ms nach einem Seiten-Reload auf einen der rechten Panel-Tabs (`#rtab-ai` / `-design` / `-light` / `-save`) klickt, wird der Klick **überschrieben**: das Panel wechselt kurz zum gewünschten Tab und springt dann zurück auf `#rtab-props` (Eigenschaften).

In der Praxis nur bei schnellen Power-Usern direkt nach F5 bemerkbar. Bei normaler Bedienung fällt es nicht auf, weil User selten in den ersten 200 ms klicken.

### Root Cause

`index.html` Zeile 22068 und 22077:
```js
setTimeout(()=>showRight('props'),200);
```

Beide Zeilen werden beim Boot unbedingt ausgeführt und setzen den "Eigenschaften"-Tab als Default-View, **egal ob der User in der Zwischenzeit schon einen anderen Tab aktiviert hat**. Es gibt keinen Guard, der prüft ob bereits ein anderer Tab aktiv ist.

### Workaround

E2E-Tests umgehen das Problem aktuell durch direkten Funktionsaufruf statt Click:
```js
// tests/e2e/right-panel.spec.ts
await page.evaluate((id) => (window as any).showRight(id), tabId);
```

Das ist für Tests OK. Für reale User bleibt der 200-ms-Race bestehen.

### Empfohlener Fix

Vor dem setTimeout prüfen, ob ein anderer Tab schon aktiv ist. Nur wenn kein `.rtab.active` existiert (oder ein `data-user-selected`-Flag nicht gesetzt ist), das Default auf props setzen:

```js
setTimeout(function(){
  const hasActive = document.querySelector('.rtab.active');
  if (!hasActive) showRight('props');
}, 200);
```

Oder sauberer: ein Boot-Flag `_userInteracted = false`, das bei erstem Tab-Click gesetzt wird — das setTimeout respektiert es dann.

Beide setTimeout-Aufrufe (Zeile 22068 und 22077) sollten den Guard bekommen — der eine ist ein Duplikat des anderen, könnte auch zu einem konsolidiert werden.

### Aufwand

~10 Min: zwei Zeilen index.html anpassen + E2E-Tests können zurück auf Click statt `page.evaluate()` falls gewünscht.

---

<!-- Neue Issues hier unten anfügen, gleiches Format. -->
