# Feature-Roadmap (intern)

Stand: 2026-04-26. Tracking aller Themen für den Software-Ausbau-Marathon.
Wird live gepflegt — pro abgeschlossenem PR wird der Status aktualisiert.

## Status-Legende

- ⏳ offen
- 🔧 in arbeit
- ✅ done (PR-Link)
- ⏸ pausiert (Grund)

---

## Polish & Bug-Fixes

| Status | Item | Aufwand | PR / Notiz |
|---|---|---|---|
| ⏳ | Right-Panel Tab-Boot-Race | 10 min | KNOWN-ISSUES #1 |
| ⏳ | NS_BINDING_ABORTED → sendBeacon | 30 min | nice-to-have aus v2.6.5 |
| ⏳ | broken-flow-detect FP `try{...}` :2395 | 5 min | Audit |
| ⏳ | Lighthouse-Filename-Cleanup (`v2.3-` → ohne) | 15 min | Bonus aus #158 |
| ⏳ | README-Update v2.7.x + Bundle-Stand | 20 min | jetzt nötig |
| ⏳ | Doppel-Aufruf `setTimeout startWelcomeFlow` (Z. 5382+13095) | 10 min | bei Recherche entdeckt |

## Bedienkonzept

| Status | Item | Aufwand | Notiz |
|---|---|---|---|
| ⏳ | **Onboarding-Tour neu strukturieren** | 3-4h | welcomeFlow + tutorial vereinen |
| ⏳ | Konflikt-Resolution Cloud-Save | 4-6h | last-writer-wins → merge/diff |
| ⏳ | Compliance-Wizard für KCanG-Antrag | 6-8h | geführter Flow durch 21 Regeln |
| ⏳ | Tastatur-Shortcuts-Editor erweitern | 2-3h | Konflikt-Detection + Presets |
| ⏳ | Mobile/Touch-Optimierung | 4-8h | Tablet-Workflow Audit |

## Zusatzfunktionen

| Status | Item | Aufwand | Notiz |
|---|---|---|---|
| ⏳ | Full Menu-Tagging (140 Items mit data-mode/tier) | 4-6h | Roadmap v2.3 |
| ⏳ | Snapshot/Visual-History UX | 4-5h | Time-Travel-UI mit Thumbnails |
| ⏳ | Multi-User-Avatar-Verbesserungen | 3-4h | Realtime-Kollab-Polish |
| ⏳ | PDF-Messeordnung Multi-Page-Support | 4-6h | aktuell single-page |
| ⏳ | Bild-auf-Wand erweitern | 5-7h | Pattern wie Boden auf Wände/Decken |
| ⏳ | Wiederholte Räume / Stempel-Funktion | 3-4h | Beschleunigt große Layouts |

## Roadmap v3.0

| Status | Item | Aufwand | Notiz |
|---|---|---|---|
| ⏳ | Multi-Floor mit 3D-Treppen | 2-3 Wo | eigene Spec mit Vorab-Diskussion |
| ⏳ | Bauantrag-PDF-Generierung | 1-2 Wo | bestehende PDF-Infra ausbauen |
| ⏳ | BIM-Viewer (ifcViewer) Integration | 1-2 Wo | externe Library + Bundle-Impact |
| ⏳ | Stripe-Checkout Pro/Team | 1-2 Wo | + Subscription-Tabelle Supabase |

## Code-Qualität (parkiert für Bedarfsfall)

- ⏸ HIGH-Risk Strangler-Module (Room-Manipulation, 2D-Render-Helpers, AI-Foto-Pipeline) — eigene Spec mit Sub-Modul-Split, niedrige Priorität nach v2.7.0
- ⏸ Three.js-Tree-Shaking Audit — wenn Bundle-Ziel <400 KB wieder dringend wird

## Bundle-Status (informativ)

- v2.7.1 (aktuell): ~431 KB total gz, Distance zu <400-KB-Roadmap-Ziel: 31 KB
- Strategie: nicht aktiv jagen, Diminishing Returns nach Bundle-Sprint
