# CSC Raumplaner — Funktions-Audit

**Stand:** 2026-04-19
**Quelle:** `index.html` (~21 700 Zeilen) + `src/` (Vite/TS, Stand nach P1.5)
**Scope:** Jede Funktion, die Analysen / Berechnungen / KI-Auswertungen / Report- oder Zertifikatsgenerierung durchführt — und deren Ergebnis-Qualität direkt an den mitgegebenen Parametern hängt.

---

## Executive Summary

- **30 Kern-Funktionen** vollständig auditiert (plus ~15 kleinere Helfer).
- **12 Funktionen** haben keinen oder unzureichenden UI-Input für entscheidende Parameter — Ergebnisse hängen an Hardcode-Defaults.
- **8 Funktionen** nutzen unrealistische oder veraltete Defaults (2024/2025 im KI-Prompt, 2800 €/FTE, 50 W/m³ Heizlast, …).
- **3 Duplikate** (identische Zweit-Implementierungen) — konkreter Bug-Kandidat.
- **10 Funktionen** sind sauber — Daten kommen aus Rooms/Objects/Meta mit sinnvollen Fallbacks.
- **Zeit-Sensitivität** (Abschnitt am Ende): 19 Fundstellen mit veraltetem Modell `claude-sonnet-4-5`, 3 Prompts mit hardcoded "2024/2025", 1 CO₂-Basis "DE 2024", ~50 KCanG-Referenzen zur Revalidierung gegen Stand 04/2026.

### 🚨 Kritisch: Code-Duplikate

| Funktion | Zeilen | Status |
|---|---|---|
| `calcAISecurityScore` | 17407 **und** 17942 | Beide `async`, beide rufen `/anthropic-proxy` — wird je nach Aufruf doppelt gefeuert |
| `generateFullReport` | 17557 **und** 18006 | Beide `async`, beide bauen identischen KI-Prompt |
| `calcCleaningScore` | 17349 **und** 17915 | Beide synchron, leicht unterschiedliche Implementierung — welches Ergebnis der Caller sieht hängt von Definition-Reihenfolge ab |

**Priorität 🔴** — Dedupe in einem separaten PR. Ein einziger Deploy mit versehentlichem Aufruf beider Varianten treibt API-Kosten und generiert widersprüchliche Ergebnisse.

---

## 1. Score- und Health-Berechnungen

### 1.1 `calcCapacity` — `index.html:9413`

**Zweck:** Summiert die Personen-Kapazität über alle Räume des aktuellen Stockwerks (2 m²/Person).

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| `rooms` | Room[] | globaler State | ❌ derived | n/a | ✅ |
| Faktor 2 m²/Person | hardcoded | im Code | ❌ | 2 | ✅ ASR A1.2 |

**Empfehlung:** Optionaler UI-Schalter "dichte / normal / großzügig" (1,5 / 2 / 3 m²/Person) für Szenario-Vergleich.
**Priorität:** 🟡

---

### 1.2 `calcHealthScore` — `index.html:14897`

**Zweck:** Composite-Score 0–100 % aus KCanG-Compliance (40 %), Raum-Count (15 %), Möbel-Count (15 %), Sicherheits-Typen (15 %), Backup-Status (15 %).

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| `checks` | []{passed} | `getKCaNGChecklist()` | ❌ derived | 16 rules | ✅ (post P1.4) |
| Gewichte 40/15/15/15/15 | number | hardcoded | ❌ | — | ⚠️ willkürlich |
| Schwellwerte `rooms>=3`, `objects>=10` | number | hardcoded | ❌ | — | ⚠️ willkürlich |
| Backup-Zählung | boolean | `localStorage + SB_URL && SB_KEY` | ❌ | false | ⚠️ misst Anwesenheit, nicht tatsächliche Sync-Erfolge |

**Empfehlung:** Gewichte in `projMeta.scoreWeights` extern machen; Backup-Check an echten Cloud-Save-Timestamp hängen statt an Config-Presence.
**Priorität:** 🟠

---

### 1.3 `calcROI` — `index.html:13684`

**Zweck:** Monatsgewinn, Break-Even-Mitglieder, Amortisations-Monate aus Mitgliedsbeitrag-Modell.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| `members` | number | `#roi-members` | ✅ | 100 | ✅ |
| `fee` | €/Monat | `#roi-fee` | ✅ | 35 | ✅ |
| `rent` | €/Monat | `#roi-rent` | ✅ | 1200 | ✅ |
| `staff` | €/Monat | `#roi-staff` | ✅ | 2000 | ⚠️ zu niedrig für 1–2 FTE |
| `other` | €/Monat | `#roi-other` | ✅ | 500 | ⚠️ vage (Strom? Versicherung?) |
| `setup` | € einmalig | `#roi-setup` oder `Σ getObjPrice` | ✅ | 0 | ⚠️ Fallback liefert 0 wenn Preiskatalog unvollständig |
| Amortisations-Cap | months | hardcoded `999` | ❌ | 999 | ✅ Sentinel für unrentabel |

**Empfehlung:** `staff` Default auf 3000–3500 € (realistisch für Teilzeit-Aufsicht + Kassa); `other` aufsplitten in Strom/Versicherung/Marketing; Warnung anzeigen wenn `getObjPrice` für >20 % der Objekte 0 liefert.
**Priorität:** 🟠

---

### 1.4 `calcBreakEven` — `index.html:18868`

**Zweck:** Monatsfix-Break-Even und ROI-Zeitstrahl (Profit-Chart).

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| `fixedCosts` | €/Monat | `prompt()` | ❌ modal | 3000 | ⚠️ alles gebündelt, keine Aufteilung |
| `feePerMember` | € | `prompt()` | ❌ modal | 35 | ✅ |
| `setupCosts` | € | `Σ getObjPrice` | ❌ derived | 0 | ⚠️ Preiskatalog-Löcher → 0 |

**Empfehlung:** `prompt()` durch Modal-Dialog ersetzen; `fixedCosts` in Miete/Personal/Sonstiges aufteilen.
**Priorität:** 🟠

---

### 1.5 `calcCleaningScore` — `index.html:17349` **+ 17915 (DUPLIKAT)**

**Zweck:** Reinigungs-Aufwand 0–100 aus Boden-Material, Möbeldichte, Raum-Anzahl.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Boden-Tabelle | number | hardcoded `{carpet:20, tile:95, …}` | ❌ | 'plank'=75 | ✅ plausibel |
| Gewichte `{floor:2, furniture:1.5, corners:1}` | number | hardcoded | ❌ | — | ⚠️ willkürlich |
| Raum-Malus `-8 pt` pro Raum | number | hardcoded | ❌ | — | ⚠️ bestraft kleine Räume unfair |

**Empfehlung:** Dedupe (siehe oben). Gewichte exponieren. Raum-Malus durch Fläche-pro-Raum ersetzen.
**Priorität:** 🔴 wegen Duplikat, sonst 🟠

---

## 2. Brand- und Sicherheitsberechnungen

### 2.1 `calcFireSafety` — `index.html:11909`

**Zweck:** HTML-Summary: Feuerlöscher/Rauchmelder/Exits vs. Soll.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Fl.-Soll | `max(rooms.length, ceil(totalArea/200))` | hardcoded | ❌ | — | ✅ DIN EN 3 / ASR A2.2 |
| Rauch-Soll | `rooms.length` | hardcoded | ❌ | — | ✅ §15 MBO |
| Notlicht-Schwellwert | keiner | — | ❌ | — | ⚠️ Existenz nur gezählt, nicht Lux-Niveau |

**Empfehlung:** Notlicht-Prüfung um Lux-Minimum (1 lx ASR A3.4/3) erweitern — Input gibt es bereits über `analyzeLux`.
**Priorität:** 🟡

---

### 2.2 `calcAISecurityScore` — `index.html:17407` **+ 17942 (DUPLIKAT)**

**Zweck:** 0–100 Security-Posture über Kameras (25), Brandschutz (25), Zutritt (25), Notfall (25), plus KI-Tipps wenn < 90.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Kamera-Punkte | `ceil(camCount*6)` clamped | hardcoded | ❌ | — | ⚠️ kein Flächenbezug |
| Fire-Punkte | `smoke*5 + extCoverage*12 + sprinkler*5 + RWA*3` | hardcoded | ❌ | — | ⚠️ keine DIN-Referenzierung |
| Zutritts-Punkte | `codeschloss*8 + fingerprint*10 + schleuse*7 + intercom*5 + sec-door*8` | hardcoded | ❌ | — | ⚠️ MFA fehlt |
| Notfall-Punkte | `exit*8 + emlight*6 + first-aid*5 + AED*6 + emergency-phone*4` | hardcoded | ❌ | — | ⚠️ keine Norm-Bindung |
| KI-Prompt | hardcoded | ❌ | — | ⚠️ JSON-Regex `/\[[\s\S]*\]/` multi-line kann falsch matchen | |

**Empfehlung:** Punktzahl-Gewichte nach DIN VDE 0833-1 / DIN EN 50131 neu kalibrieren; JSON-Parsing mit strikter Matching.
**Priorität:** 🔴 wegen Duplikat, sonst 🟠

---

### 2.3 `calcAccessibilityScore` — `index.html:17822`

**Zweck:** 0–100 auf 6 DIN-18040-Kriterien: Türbreite, WC, Rampe, 150-cm-Wendekreis, Exit-Schilder, Automatiktüren.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Punkte pro Kriterium | `{20,15,15,20,15,15}` | hardcoded | ❌ | — | ✅ |
| Wendekreis-Check | `alle Räume ≥ 2×2 m` | hardcoded | ❌ | — | ⚠️ zu streng (nur Gemeinschaftsbereiche brauchen das) |

**Empfehlung:** Wendekreis-Check nur auf Empfang/Ausgabe/Sozial einschränken (per Namens-Regex); partial credit statt all-or-nothing.
**Priorität:** 🟠

---

### 2.4 `analyzeEscapeRoutes` — `index.html:17007`

**Zweck:** Exits-Soll nach DIN EN 13637 (≥ max(2, ceil(capacity/60))).

Alle Inputs derived aus `rooms`, `objects`, `calcCapacity()`. **Realismus: ✅** Formel korrekt, aber die Registry-Regel `flucht` (P1.3 Web-Worker) ist genauer (prüft min. Korridorbreite). Beide laufen parallel.

**Empfehlung:** Dieser Dashboard-Block sollte auf `window.cscEscape.getLatest()` umgezogen werden, damit User eine einheitliche Quelle sehen.
**Priorität:** 🟡

---

### 2.5 `runEmergencyScenario` — `index.html:17095`

**Zweck:** Gesamt-Evakuierungszeit = Gehzeit + Exit-Durchlaufzeit.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| `walkTime` | `10 m / 0.6 m/s ≈ 17s` | hardcoded | ❌ | 17 | ⚠️ ignoriert Layout/Panik |
| `exitTime` | `capacity / exits / 1.5 pers/s` | hardcoded | ❌ | — | ⚠️ keine Tür-Breite berücksichtigt |
| Toleranz | `totalTime < 150s` | hardcoded | ❌ | 150 | ✅ Standard |

**Empfehlung:** `walkTime` an tatsächliche Escape-Worker-Pfadlänge hängen (liegt schon in `projMeta._escapeCache` aus P1.3); Tür-Durchsatz nach DIN 18040-1 Breite skalieren.
**Priorität:** 🟠

---

## 3. Physik / Simulation

### 3.1 `calcAcoustics` — `index.html:11967`

**Zweck:** Nachhallzeit T60 (Sabine) pro Raum.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Boden-Material | string | `#ac-floor-{roomId}` | ✅ | 'tile' | ✅ |
| Wand-Absorption α | `0.05` | hardcoded | ❌ | 0.05 | ⚠️ nimmt Putz an, immer |
| Decken-Absorption | — | nicht modelliert | ❌ | 0 | ⚠️ fehlt |
| Möblierungs-Einfluss | — | nicht modelliert | ❌ | 0 | ⚠️ fehlt |

**Empfehlung:** Wand- + Decken-Material als `r.wallMaterial` / `r.ceilMaterial` modellieren (Catalog gibt's schon); mittlere Möbel-Absorption (~0,05·Möbelfläche) addieren.
**Priorität:** 🟠

---

### 3.2 `calcEnergy` — `index.html:11995`

**Zweck:** Jahres-kWh + Kosten für Beleuchtung + Heizung.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Beleuchtungs-Typ | string | `#en-light` | ✅ | 'led' | ✅ |
| Betriebsstunden | h/Tag | `#en-hours` | ✅ | 8 | ✅ |
| Heizungs-Typ | string | `#en-heat` | ✅ | 'gas' | ✅ |
| Strompreis | €/kWh | `#en-price` | ✅ | 0,32 | ✅ |
| W/m² LED/Halogen/Mixed | `{8, 35, 20}` | hardcoded | ❌ | — | ✅ |
| Heiz-Kostenmultiplikator | `{gas:0.08, pump:0.22, electric:0.32, district:0.12}` | hardcoded | ❌ | — | ⚠️ **unabhängig vom UI-Strompreis!** |
| Heizlast-Schätzung | `50 W/m³ · 2000 HDD` | hardcoded | ❌ | — | ⚠️ Deutsche Mittelwerte, kein U-Wert-Input |

**Empfehlung:** Strompreis-Input auch für Heizung nutzen wenn `heat-pump/electric`; U-Wert-Eingabe oder Auswahl "Altbau / EnEV / Passivhaus".
**Priorität:** 🟠

---

### 3.3 `calcHeatLoad` — `index.html:19545`

**Zweck:** Heizlast W/Raum nach DIN EN 12831 (vereinfacht).

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Außentemp | °C | hardcoded `-12` | ❌ | -12 | ✅ DE Auslegung |
| Innentemp | °C | hardcoded `20` | ❌ | 20 | ✅ |
| U-Werte `{wall:0.24, window:1.1, floor:0.3, ceil:0.2}` | W/m²K | hardcoded | ❌ | — | ⚠️ Nimmt EnEV-Neubau an |
| Luftwechselrate | `0.5 /h` | hardcoded | ❌ | 0.5 | ⚠️ ignoriert tatsächliche Lüftung |
| Fensterfläche | m² | aus `objects` mit `arch==='window'` | ❌ derived | — | ✅ |

**Empfehlung:** U-Wert-Preset-Dropdown (Altbau/Bestand/Neubau/Passivhaus); ACH-Input; Solar-Gewinne über Fenster-Orientierung.
**Priorität:** 🟠

---

### 3.4 `calcRoomLux` + `analyzeLux` — `index.html:19610 + 19676`

**Zweck:** Beleuchtung (Lux) pro Raum aus Fenstern + künstlichem Licht; Vergleich mit ASR A3.4.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Fensterhöhe-Fallback | `1.1 m` | hardcoded | ❌ | 1.1 | ⚠️ |
| Himmel-Referenz | `3000 lx` (overcast) | hardcoded | ❌ | 3000 | ⚠️ kein clear-sky / Orientierung |
| Leuchten-Tabelle `{al-str:2400, al-pt:800, …}` | Lumen | hardcoded | ❌ | 800 | ⚠️ Lumen ≠ Lux |
| **artificialLux = lumens / area** | — | — | ❌ | — | ❌ **fehlt Reflexionsgrad 0.3–0.5** |

**Empfehlung:** `artificialLux = Σ lumens · utilization · maintenance / area` mit `utilization ≈ reflectance·0.7`. Kritisch — aktuelle Formel überschätzt Lux um ~2× für dunkle Räume.
**Priorität:** 🔴

---

### 3.5 `analyzeNoise` — `index.html:17534`

**Zweck:** Grob-Schätzung dB(A) pro Raum.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Grundrauschen | `42 dB` | hardcoded | ❌ | 42 | ⚠️ (background HVAC ~35–40) |
| Quellen-Malus | `+5 dB` je Gerät | hardcoded | ❌ | 5 | ⚠️ Kühlschrank ~50, Spülmaschine ~80 |
| Teppich-Bonus | `-5 dB` | hardcoded | ❌ | 5 | ⚠️ kein Wand/Decke |
| Cap | `85 dB` | hardcoded | ❌ | 85 | ⚠️ |

**Empfehlung:** Gerätespezifische dB-Werte aus Katalog-Metadaten; Raum-Absorption aus `calcAcoustics` reused.
**Priorität:** 🟡 (eher kosmetisch)

---

### 3.6 `renderVisitorFlow` + `generateMemberHeatData` — `index.html:17245 + 12172`

**Zweck:** Agent-basierte Besucherströme + Heatmap-Punkte.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Agent-Count | `min(40, max(8, round(cap·0.3)))` | hardcoded | ❌ | — | ⚠️ 30 % Concurrency-Annahme |
| Raum-Verkehrsdichte | `{Ausgabe:4, Empfang:3, …}` | hardcoded | ❌ | — | ⚠️ subjektiv |
| Dwell-Zeit | 1–5 s random | hardcoded | ❌ | — | ⚠️ keine Queue-Bildung |

**Empfehlung:** Dekorativ — OK als visueller Effekt; sollte NICHT in Ergebnisse/Reports einfließen (tut's auch nicht). Kein Fix nötig.
**Priorität:** 🟡

---

### 3.7 `analyzeWaitQueue` — `index.html:18409`

**Zweck:** Erlang-C-Warteschlangenmodell für Kassen.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| `members` | number | `prompt()` | ❌ modal | 100 | ✅ |
| `openH` | Std/Tag | hardcoded `8` | ❌ | 8 | ⚠️ |
| Besuchsrate | `members · 0,15` | hardcoded | ❌ | — | ⚠️ 15 %-Tagesrate pauschal |
| Service-Rate | `counters · 20 /h` | hardcoded | ❌ | — | ⚠️ 3 min/Person, Produktmix ignoriert |

**Empfehlung:** `openH`, Besuchsrate (5–30 %), Service-Rate (10–30/h) als UI-Inputs; Peak-Hour-Faktor (1.5–2.5).
**Priorität:** 🟠

---

## 4. KI-gestützte Analysen

### 4.1 `estimateCosts` — `index.html:9506`

**Zweck:** Claude schätzt Einrichtungskosten.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Raum-Zusammenfassung | derived | automatisch | ❌ | — | ✅ |
| **Prompt-Datum** | string | hardcoded `"Realistisch für 2024/2025"` | ❌ | — | ⚠️ **veraltet ab 2026** |
| Model | `claude-sonnet-4-5` | hardcoded | ❌ | — | ✅ |
| `max_tokens` | 600 | hardcoded | ❌ | — | ✅ |

**Empfehlung:** Prompt-Datum durch `new Date().getFullYear()` dynamisch einsetzen. Alle 17 KI-Prompts haben ähnliches Muster — sollte zentral gemacht werden.
**Priorität:** 🟠

---

### 4.2 `generateFullReport` — `index.html:17557` **+ 18006 (DUPLIKAT)**

**Zweck:** 3–4-Absatz-Kurzgutachten durch KI.

Inputs alle derived (score, capacity, checks, rooms). Prompt abstrakt — **enthält keine konkreten Compliance-Fehler** in Aufzählungsform.

**Empfehlung:**
1. Dedupe
2. Prompt mit `checks.filter(c=>!c.passed).map(c=>c.label)` anreichern, damit KI konkret eingehen kann.
**Priorität:** 🔴 wegen Duplikat

---

### 4.3 Weitere KI-Funktionen (Zusammenfassung)

`aiDescribeRoom` (11400), `aiSecurityAudit` (11421), `aiAccessibleRebuild` (11448), `aiLightPrompt` (7340), `autoLabelRooms` (12484), `recommendStyle` (13466), `writeProtocol` (13487), `optimizeRoom` (9643), `analyzeFloorplan` (9408), `aiAutoOptimize` (12275), `aiMoodApply` (20069), `aiRoomDescribe` (11400), `aiCreateCustomObject` (20560) — alle nutzen `aiFetch(body)` (P0.1-Bridge) bzw. direktes `/anthropic-proxy`.

**Gemeinsame Schwächen:**
- `model` + `max_tokens` überall hardcoded, keine UI-Steuerung.
- Prompts enthalten teils feste Jahreszahlen ("2024/2025") oder vage Formulierungen ("realistisch", "modern").
- JSON-Response-Parsing via Regex `/\[[\s\S]*?\]|\{[\s\S]*?\}/` — keine Schema-Validierung. Schlägt bei mehrzeiliger Prosa in JSON fehl.

**Empfehlung:** Prompt-Registry unter `src/ai/prompts.ts` mit `buildPrompt(ctx, opts)`-Helfer der aktuelles Jahr/Datum + typed Checks injiziert.
**Priorität:** 🟠

---

## 5. Report- und Zertifikats-Generierung

### 5.1 `generateAuthorityPackage` — `index.html:13514`

**Zweck:** ZIP mit SVG-Plan, KCanG-HTML, Inventar-CSV, Brandschutz-HTML, Projekt-JSON.

Alles derived. Realistisch ✅. Einziger Hinweis: SVG 800×600 px hardcoded — bei großen Grundrissen komprimiert stark.

**Empfehlung:** SVG-Dimensions aus Bounding-Box skalieren (min 800, max 2400 px Breite).
**Priorität:** 🟡

---

### 5.2 `generateEnergyCertificate` — `index.html:17897`

**Zweck:** GEG-Energielabel A++ bis D + CO₂/Jahr.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| kWh-Formel | `(area·8/1000·8·365)+(area·50/1000·2000)` | hardcoded | ❌ | — | ⚠️ übernimmt `calcEnergy`-Issues |
| Label-Schwellwerte `{A++:<30, A+:<50, A:<75, B:<100, C:<130, D:rest}` | kWh/m²a | hardcoded | ❌ | — | ⚠️ **Wohnbau-Skala, nicht Gewerbe** |
| CO₂-Faktor | `0.4 kg/kWh` | hardcoded | ❌ | 0.4 | ⚠️ DE-Mix 2024, kein Green-Tarif-Option |

**Empfehlung:** Gewerbe-Skala nach GEG §86 (~130 kWh/m²a A+, ~250 C); CO₂-Faktor aus Strompreis-Input abgeleitet oder User-Dropdown.
**Priorität:** 🟠

---

### 5.3 `generateCostReport` — `index.html:18693`

**Zweck:** HTML-Kostenangebot per Möbel-Kategorie + Baukosten.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| Möbelpreis | `getObjPrice(typeId)` | Katalog | ❌ | 0 falls fehlend | ⚠️ Fallback auf 0 lautlos |
| Baukosten | `800 €/m²` | hardcoded | ❌ | 800 | ⚠️ neubau turnkey; Renovation 200–500, Vollausbau 1500+ |

**Empfehlung:** Baukosten-Dropdown (Renovation/Turnkey/Premium); Warnung bei >20 % Katalog-Lücken im Preisfeld.
**Priorität:** 🟠

---

### 5.4 `generateShiftPlan` — `index.html:18913`

**Zweck:** Schichtplan + FTE-Kalkulation.

| Name | Typ | Quelle | UI-Input? | Default | Realismus |
|---|---|---|---|---|---|
| `openHours` | Std | `prompt()` | ❌ modal | 10 | ✅ |
| `openFrom` | Std | `prompt()` | ❌ modal | 10 | ✅ |
| `staffPerShift` | `max(1, ceil(counters·1.2))` | hardcoded | ❌ | 1 | ⚠️ |
| Shift-Logik | `≤6h=1, ≤10h=1, >10h=2` | hardcoded | ❌ | — | ⚠️ keine geteilten Schichten |
| FTE-Gehalt | `2800 €/Monat` | hardcoded | ❌ | 2800 | ⚠️ **zu niedrig — realistisch 3200–3800 € inkl. Sozialabgaben** |
| Rollen | `['Ausgabe','Aufsicht','Lager']` | hardcoded | ❌ | — | ⚠️ inflexibel |

**Empfehlung:** FTE-Gehalt aus Tarif-Dropdown (TVöD, Branchen-Tarif, Mindestlohn+); benutzerdefinierte Rollen.
**Priorität:** 🟠

---

### 5.5 `generateSecurityReport` + `generateMaintenanceCalendar` — `18740 + 18979`

Beide derived aus `objects` + hardcoded Normtabellen (DIN 14675, BGG 936, DGUV). Realistisch ✅, gut referenziert.

**Empfehlung:** Keine. Solide.
**Priorität:** ✅

---

## 6. Compliance-Engine (TS, Stand P1.5)

### 6.1 `src/compliance/registry.ts` + 19 Regeln

16 project-scope + 3 room-scope Rules. Inputs alle aus RuleContext (`rooms`, `objects`, `meta`, `currentRoom`). **Realismus ✅** — strikt typed, `passed: null` für n/a, try/catch um jede Regel.

**Bekannte Schwächen (für spätere Phasen dokumentiert):**
- `kapazitaet.ts` nutzt nicht `calcCapacity()` (Legacy) sondern eigene Formel → könnte divergieren wenn Legacy seine Formel ändert.
- `visualScreen.ts` Fenster-Erkennung per `typeId /^aw-/` — würde bei Catalog-Umbenennung brechen.
- `poi100m.ts` nutzt `projMeta.geocode` als Referenzpunkt; das ist die Adress-Koordinate, nicht das Raum-Zentroid — kann um 10–30 m abweichen bei großen Grundstücken.

**Empfehlung:** Kapazitäts-Formel zentral in `src/compliance/metrics.ts` (P2.x vorgesehen); Fenster-Typen als Catalog-Metadatum exponieren (`isWindow: true`).
**Priorität:** 🟡

---

## Prioritätsliste

### 🔴 Dringend — falsche Ergebnisse oder Duplikat-Bug

1. **`calcAISecurityScore` Duplikat** (17407 + 17942) — doppelte KI-Calls möglich
2. **`generateFullReport` Duplikat** (17557 + 18006) — doppelte KI-Calls möglich
3. **`calcCleaningScore` Duplikat** (17349 + 17915) — inkonsistente Ergebnisse je nach Definition-Reihenfolge
4. **`calcRoomLux`** — Formel `artificialLux = lumens / area` ist physikalisch falsch (fehlt Reflexionsgrad); überschätzt Lux ~2× für dunkle Räume

### 🟠 Mittel — Defaults zu vage / UI-Input fehlt

5. `calcHealthScore` — Gewichte 40/15/15/15/15 willkürlich
6. `calcROI` — Staff-Default zu niedrig; `other` unklar
7. `calcBreakEven` — nutzt `prompt()` statt Modal; Fixed-Costs gebündelt
8. `calcAcoustics` — Wand/Decke/Möbel nicht modelliert
9. `calcEnergy` — Strompreis-Input greift nicht für Heizung
10. `calcHeatLoad` — U-Werte und ACH fix
11. `runEmergencyScenario` — Walking-Time pauschal 17 s
12. `analyzeWaitQueue` — Besuchsrate 15 %, Service-Rate 20/h ohne UI
13. `calcAccessibilityScore` — Wendekreis-Check zu streng
14. `estimateCosts` + 15 weitere KI-Funktionen — Prompt-Jahr "2024/2025" hardcoded
15. `generateFullReport` — Prompt erwähnt keine konkreten Compliance-Fehler
16. `generateEnergyCertificate` — Wohnbau-Skala statt Gewerbe
17. `generateCostReport` — Baukosten 800 €/m² fix
18. `generateShiftPlan` — FTE-Gehalt 2800 € zu niedrig

### 🟡 Nice-to-have

19. `calcCapacity` — optionaler Dichte-Schalter
20. `calcFireSafety` — Notlicht-Lux-Check ergänzen
21. `analyzeEscapeRoutes` — auf `window.cscEscape.getLatest()` umziehen
22. `analyzeNoise` — gerätespezifische dB aus Katalog
23. `renderVisitorFlow` + `generateMemberHeatData` — rein dekorativ, kein Fix nötig
24. `generateAuthorityPackage` — SVG-Dimensions adaptiv
25. Registry-Hinweise (Fenster-Typ im Catalog, Kapazitäts-Formel zentralisieren)

---

## Architektur-Beobachtungen

### Wiederkehrende Muster

- **`getObjPrice(typeId)` → 0-Fallback** — von ROI/BreakEven/Cost-Report stumm genutzt. Sollte einmal warnen und weiterhin die anderen Features nicht blockieren.
- **`prompt()` für Ein-Parameter-Modals** — bricht iOS-Safari, sieht nicht nativ aus. `calcBreakEven`, `analyzeWaitQueue`, `generateShiftPlan` betroffen.
- **KI-Prompt-Jahreszahlen** — 17 Funktionen betroffen. Zentrales `buildPrompt({year})` fehlt.
- **`{id, label, passed}`-Shape-Erwartung** — 17 Callsites von `getKCaNGChecklist()` erwarten dies. P1.4 hat Bridge geliefert; weitere Felder (z. B. `severity`) würden ohne Typ-Check hinzugefügt.
- **Duplikate entstehen durch Editor-Paste** — 3 identifiziert, vermutlich Copy-Paste während iterativer Entwicklung. Ein Lint-Check `no-duplicate-function-names` würde sie fangen.

### Input-Hygiene

Funktionen, die **strikt auf UI-Inputs angewiesen** sind, fallen bei leeren Feldern meistens auf `0`/`null`/`undefined` ohne User-Hinweis. Empfehlung für P2+: Defensive `requireInput(id, fallback, warnIfEmpty)` Helfer, der leere Felder loggt und einen "Daten unvollständig"-Toast zeigt bei Report-Generation.

### Priorisierungslogik für P2

P2.1 sollte die **drei Duplikate** dedupen + dazu passende ESLint-Regel. Das ist harmlos, gut isoliert, und behebt einen echten Kosten-Bug (doppelte KI-Calls).

P2.2 sollte `calcRoomLux` physikalisch korrigieren — direkter Einfluss auf alle Beleuchtungs-Reports, inklusive `analyzeLux`-Panel und `generateEnergyCertificate`.

P2.3+ kann dann die UI-Input-Lücken schließen (Staff-Kosten, Baukosten, ACH, U-Werte, Wendekreis-Scope).

---

## Zeit-bezogene Anpassungen

Stichtag für diese Prüfung: **19. April 2026.** Alle unten aufgeführten Fundstellen sollten bei einem Patch-Cycle aktualisiert werden.

### A. Veraltete KI-Modell-Referenzen

Aktuell im Code: `claude-sonnet-4-5` — dieses Modell existiert weiterhin, aber die produktiv empfohlene Sonnet-Generation ist **`claude-sonnet-4-6`**. Empfohlene Bulk-Ersetzung.

| Datei | Zeile | Zeitbezug | Stand | Empfehlung |
|---|---|---|---|---|
| `index.html` | 3541 | `const model=opts.model\|\|'claude-sonnet-4-5';` (Default für `callAI`) | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 7486 | `aiLightPrompt` | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 8960 | `sendAI` (chat) | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 9518 | `estimateCosts` | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 9695 | `analyzeFloorplan` | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 9932 | `optimizeRoom` | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 11693 | `aiDescribeRoom` | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 11714 | `aiSecurityAudit` | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 11739 | `aiAccessibleRebuild` | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 12787 | `autoLabelRooms` | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 13768 | `recommendStyle` | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 13789 | `writeProtocol` | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 17489 | `calcAISecurityScore` (KI-Teil) | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 17567 | `generateFullReport` #1 | veraltet | → `'claude-sonnet-4-6'` (nach Dedupe weg) |
| `index.html` | 18013 | `generateFullReport` #2 | veraltet | → `'claude-sonnet-4-6'` (nach Dedupe weg) |
| `index.html` | 18182 | KI-Floorplan-Erkennung | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 18370 | `optimizeRoom` #2 | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 20381 | `aiMoodApply` | veraltet | → `'claude-sonnet-4-6'` |
| `index.html` | 20888 | `aiCreateCustomObject` | veraltet | → `'claude-sonnet-4-6'` |

**Nicht anfassen:** `supabase/functions/anthropic-proxy/index.ts:4` — `ANTHROPIC_VERSION = "2023-06-01"` ist die Anthropic-API-Contract-Version, kein Modell. Aktueller Stable.

**Haiku für kleine Calls?** Manche Calls (z. B. `autoLabelRooms`, `aiMoodApply`, `recommendStyle`) geben nur wenige Tokens zurück. Wechsel auf `claude-haiku-4-5-20251001` würde Latency + Kosten drücken. Sollte in eigener PR getestet werden, nicht im Bulk-Update.

---

### B. Hardcoded Jahreszahlen in Prompts / UI

| Datei | Zeile | Zeitbezug | Stand | Empfehlung |
|---|---|---|---|---|
| `index.html` | 9524 | `estimateCosts` Prompt: "…Realistisch für 2024/2025." | **veraltet** | → dynamisch: `"Realistisch für ${new Date().getFullYear()}."`, oder zeitlos: "auf aktuellem Preisniveau" |
| `index.html` | 21624 | Help-Panel: "KI schätzt realistische Einrichtungskosten basierend auf Fläche und Möbeln (Stand 2024/2025)." | **veraltet** | → "Stand aktuell" oder Template-Placeholder |
| `index.html` | 16993 | Energy-Certificate footer: "Basis: 400g CO₂/kWh (DE 2024) · LED-Beleuchtung" | **veraltet** | → Bundesamt-Strommix 2025/2026 checken (derzeit ~350 g/kWh und fallend); Jahr durch `new Date().getFullYear()` ersetzen, Wert aus Umweltbundesamt-API ziehen (idealerweise) |

**Nicht zu ändern (reine Platzhalter):**
- `index.html:2621` — `placeholder="z.B. © CSC Marburg 2025"` im Watermark-Input. Endnutzer überschreibt — reiner Beispieltext.

---

### C. KCanG-Referenzen zur Revalidierung (04/2026)

KCanG wurde am **01.04.2024** wirksam; seitdem sind mehrere Anpassungen diskutiert worden (konkrete Novellen sind nach Stand dieses Audits zu prüfen). Die folgenden Code-Stellen verankern **numerische KCanG-Thresholds** und brauchen einen Fact-Check gegen den aktuellen Gesetzestext:

| Datei | Zeile | Numerische Bindung | Aktuelle Rechtslage prüfen |
|---|---|---|---|
| `src/compliance/rules/memberLimit.ts` | 3 | `max. 500 Mitglieder pro CSC` — KCanG §11 | Stand 04/2026 unverändert? Weiterhin 500? |
| `src/compliance/rules/poi100m.ts` | 4 | `≥ 100 m zu Schulen/Kitas/Spielplätzen/Sportstätten` — KCanG §5 Abs. 2 | Distanz konstant? Weitere POI-Kategorien hinzugekommen (z. B. Jugendeinrichtungen)? |
| `src/compliance/rules/visualScreen.ts` | 4 | Sichtschutz-Pflicht (qualitativ, keine numerische Bindung) | Wurde konkretisiert (z. B. Mindestdichte Milchglas)? |
| `src/compliance/rules/kapazitaet.ts` | — | `totalArea / 2 ≥ 10` (2 m²/Person, min. 10 Personen) | 2 m²-Schätzung ist Ableitung, nicht direkter Gesetzestext. Prüfen. |
| `index.html:21727` | Help-Page | "Der Planer berechnet automatisch nach dem Grundsatz **2m² pro Person** (nach KCanG)." | Gleiche Quelle wie oben. |

**Qualitative KCanG-Referenzen** (UI-Labels, Button-Texte, Hilfe-Seite, AI-Prompts die "KCanG" erwähnen) — ca. 50 Fundstellen in `index.html`. Keine einzelne Aktualisierung nötig, solange die zugrunde liegenden numerischen Werte stimmen. Bei einer Novellen-Änderung **zentral prüfen**:

- `index.html:3000` Guide-Button Text
- `index.html:9699, 11721, 12570, 14564, 15186, 19928` — AI-Prompt-Einbettungen ("nach KCanG", "prüft KCanG", …)
- `index.html:21139, 21217, 21237, 21619, 21692–21727` — Hilfe-Seite `csc-rules`
- `index.html:13274, 16418, 21534` — hardcoded Beispiel-Counts "10/12 KCanG ✓" oder "8/12" in SVG-Illustrationen → nach Regel-Count-Änderung (P1 hat auf 16 erweitert) nicht mehr stimmig. **Separate Aufgabe:** SVGs regenerieren oder Count dynamisch einsetzen.

---

### D. Preis-/Kostenannahmen mit Zeitbezug

Nicht explizit jahres-gelabelt, aber faktisch altert:

| Ort | Wert | Drift in ~2 Jahren |
|---|---|---|
| `#roi-staff` default | 2000 €/Monat | Mindestlohn-Entwicklung → ~2400 realistischer |
| `#roi-rent` default | 1200 €/Monat | je Region 1500–3000, stark gestiegen |
| `#roi-fee` default | 35 €/Monat | Marktpreis für CSC-Mitgliedsbeiträge in DE 2026 tendiert 40–60 € |
| `#en-price` default | 0,32 €/kWh | Strompreis 2026 DE Haushaltstarif ~0,35–0,40 € |
| `800 €/m²` Baukosten (`generateCostReport`) | fix | Baupreisindex +~18 % seit 2024 → ~950 €/m² |
| `2800 €/FTE/Monat` (`generateShiftPlan`) | fix | mit Sozialabgaben + Mindestlohn 2026: 3000–3800 € |
| `400g CO₂/kWh` DE-Strommix | fix (siehe B) | tendiert ~340 g/kWh |

**Empfehlung:** Konstanten in ein zentrales `src/config/defaults.ts` mit Kommentar `// last-verified: 2026-04` — so ist beim nächsten Audit auf einen Blick sichtbar wann was revalidiert gehört.

---

### Empfohlener PR-Schnitt für die Zeitbezug-Updates

- **P2.0a (klein):** Bulk-sed `claude-sonnet-4-5` → `claude-sonnet-4-6` über alle 19 Fundstellen. Ein Commit, low-risk.
- **P2.0b (klein):** 3 hardcoded Jahreszahlen fixen (9524, 16993, 21624). Zentraler Helfer `currentYear()` oder `new Date().getFullYear()` in den 2 Prompts + dynamischer Energie-Certificate-Footer.
- **P2.0c (Legal-Review):** `KCANG_NUMERIC_THRESHOLDS` nachschlagen (500, 100m, 2m²) gegen Stand 04/2026. Falls unverändert: kurzer Commit `// KCanG thresholds re-checked 2026-04-XX, unchanged` in den 4 Regel-Modulen.
- **P2.0d (Daten):** Preis-Konstanten in `src/config/defaults.ts` ziehen mit `last-verified` Kommentaren.
