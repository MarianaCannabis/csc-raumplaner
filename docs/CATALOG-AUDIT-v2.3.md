# Catalog Audit — 2026-04-26 (v2.3)

**Gescannt:** 485 Items in 21 Dateien.

## Zusammenfassung

- Items mit Größen-/Material-Issues: **0**
- Duplicate-IDs: **0** (kritisch)
- Duplicate-Names: **5** (warn)

## Duplicate-Names (Warnung)

| Name | Count | IDs |
|---|---|---|
| sofa 2-sitzer | 2 | kn-sofa, p-sofa-2 |
| sofa 3-sitzer | 2 | kn-sofa-long, p-sofa-3 |
| schreibtisch | 2 | kn-desk, p-desk |
| teppich rund | 2 | kn-rug-round, qn-round-rug |
| mülleimer | 2 | kn-trashcan, qn-trash |

## Kategorien-Coverage

| Kategorie | Count |
|---|---|
| 🌱 Pflanzen & Deko | 25 |
| 🌿 Anbau | 21 |
| 🪑 Bestuhlung | 21 |
| 🎭 Bühne | 20 |
| 📡 Technik | 20 |
| 🔊 Beschallung | 20 |
| 🍽 Catering | 20 |
| 🌿 Deko | 20 |
| 📚 Workshop | 20 |
| ⚙ Equipment | 20 |
| 💡 Licht | 19 |
| 🚪 Eingang | 19 |
| ⛺ Outdoor | 19 |
| 💼 Büro | 17 |
| 🏪 Ausgabe | 16 |
| 💡 Beleuchtung | 15 |
| 🍳 Küche | 13 |
| 🛁 Sanitär | 13 |
| 🚪 Türen+ | 12 |
| 🛋 Sofas | 12 |
| 🪵 Tische | 12 |
| 🪑 Stühle | 11 |
| 🔐 Sicherheit | 10 |
| 📦 Lager | 8 |
| 🛋 Sozial | 8 |
| 🌿 Anbau (Rich) | 8 |
| 🔐 Sicherheit (Rich) | 8 |
| 🚻 Sanitär | 7 |
| 🎪 Messe | 7 |
| 💼 Büro (Rich) | 6 |
| 🏪 Empfang (Rich) | 5 |
| 🏗 Bau (Rich) | 5 |
| 🌱 Deko (Rich) | 5 |
| 🪜 Treppen | 5 |
| 🪟 Fenster+ | 5 |
| 🛋 Sozial (Rich) | 4 |
| 🔐 CSC-Sicherheit | 3 |
| 🔥 Brandschutz+ | 3 |
| 🍳 Küche (Rich) | 3 |

## Methodik + Einschränkungen

- **Size-Ranges** sind pragmatische Plausibilitäts-Checks, keine physikalischen Limits. Ein Range-Outlier ist nicht zwingend falsch (z.B. ein besonders schmaler Steh-Tisch mit w=0.35 statt 0.4), sondern markiert Review-würdige Fälle.
- **Material-Hints** werden nur für Primitive-Items geprüft (Items ohne `modelUrl`). GLB/GLTF-Assets kommen mit eigenen Materialien.
- **Builder-Referenzen** werden nicht geprüft — die `BUILDER_MAP` lebt im Legacy-Block von `index.html` und ist für dieses Node-Script nicht importierbar. Fallback: Unit-Test in `src/catalog/__tests__/catalog.test.ts` prüft TS-Exports.
- **Mehrzeilige Items** werden vom Regex übersprungen (heute sind alle Items one-line). Wenn die Zeilen-Count-Differenz zu `npm run audit:catalog` wächst, die Regex auf multiline anpassen.

## Läuft via

```bash
node scripts/audit-catalog.mjs
```
