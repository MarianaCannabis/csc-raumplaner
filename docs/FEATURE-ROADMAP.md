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
| ✅ | Right-Panel Tab-Boot-Race | 10 min | [#190](https://github.com/MarianaCannabis/csc-raumplaner/pull/190) — KNOWN-ISSUES #1 behoben |
| ✅ | NS_BINDING_ABORTED → sendBeacon | 30 min | [#191](https://github.com/MarianaCannabis/csc-raumplaner/pull/191) — kein Action-Item, KNOWN-ISSUES #2 |
| ✅ | broken-flow-detect FP `try{...}` | 5 min | [#192](https://github.com/MarianaCannabis/csc-raumplaner/pull/192) — JS-Keywords-Filter, 0 unresolved |
| ✅ | Lighthouse-Filename-Cleanup (`v2.3-` → ohne) | 15 min | [#193](https://github.com/MarianaCannabis/csc-raumplaner/pull/193) |
| ✅ | README-Update v2.7.x + Bundle-Stand | 20 min | [#194](https://github.com/MarianaCannabis/csc-raumplaner/pull/194) |
| ✅ | Doppel-Aufruf `setTimeout startWelcomeFlow` | 10 min | [#195](https://github.com/MarianaCannabis/csc-raumplaner/pull/195) — **3×-Init-Block-Bug**: kompletter Boot-Init bei jeder State-Mutation, major Performance-Win |
| ✅ | Onboarding-Tour CTA-Glitch (Bridge-Modal kurz sichtbar nach Vorlage/Leer/Laden-Click) | 30 min | [#199](https://github.com/MarianaCannabis/csc-raumplaner/pull/199) — `ctaThenAction` setzt state=done VOR Modal-Close |
| ✅ | CLAUDE.md-Force-Push-Regel verfeinern (erlauben auf eigenen Feature-Branches, weiterhin verboten auf main) | 15 min | [#200](https://github.com/MarianaCannabis/csc-raumplaner/pull/200) — Lehre aus Sitzung C umgesetzt |
| ✅ | **3D-Mode-Hotfix (KRITISCH)** | 3h | [#202](https://github.com/MarianaCannabis/csc-raumplaner/pull/202) — `setView`-Wrapper las `window.fpCv/tCv/...` (lokale const, nicht auf window) → Canvas-Display-Swap unterblieb 5+ Wochen. v2.7.2 released |
| ✅ | **Module-Bridge-Audit** (Lehre aus 3D-Bug) | 2-3h | [#208](https://github.com/MarianaCannabis/csc-raumplaner/pull/208) — **14 Silent-Fail-Candidates gefunden + gefixt!** Saves heißen jetzt richtig, Exports/Compliance arbeiten mit echten Daten. `docs/MODULE-BRIDGE-AUDIT.md` |
| ⏳ | Touch-Listener-Wire-Up auf fpCv/tCv | 2-3h | Folge zu PR #203 — Pattern-Library steht, tatsächlicher Wire-Up fehlt |

## Bedienkonzept

| Status | Item | Aufwand | Notiz |
|---|---|---|---|
| ✅ | **Onboarding-Tour neu strukturieren** | 3-4h | [#196](https://github.com/MarianaCannabis/csc-raumplaner/pull/196) — Phase-State-Machine, Migration alter Keys |
| ✅ | **Konflikt-Resolution Cloud-Save** | 4-6h | [#198](https://github.com/MarianaCannabis/csc-raumplaner/pull/198) — Optimistic Locking via Version-Counter (Migration 0009 PFLICHT-Apply) |
| ✅ | **Compliance-Wizard für KCanG-Antrag** | 6-8h | [#201](https://github.com/MarianaCannabis/csc-raumplaner/pull/201) — Single-Page-Form 7 Sektionen, localStorage + opt-in Cloud-Sync, jsPDF lazy-Export (Migration 0010 PFLICHT-Apply) |
| ⏳ | Tastatur-Shortcuts-Editor erweitern | 2-3h | Konflikt-Detection + Presets |
| ⏳ | Hygiene-Compliance-Regel in src/compliance/ | 1-2h | analog zu §23 Präventionsbeauftragter; Daten kommen jetzt aus KCanG-Wizard Section D |
| ⏳ | Suchtberatung-Pflichtfeld als KCanG-Regel | 1-2h | Kontakt-Validierung; Daten aus Wizard Section E |
| ✅ | Mobile/Touch-Optimierung | 4-8h | [#203](https://github.com/MarianaCannabis/csc-raumplaner/pull/203) — touchSupport-Modul mit Pan/Zoom/Tap/Long-Press, Boot-Detection, mobile-CSS |

## Zusatzfunktionen

| Status | Item | Aufwand | Notiz |
|---|---|---|---|
| ⏳ | Full Menu-Tagging (140 Items mit data-mode/tier) | 4-6h | Roadmap v2.3 |
| ⏳ | Snapshot/Visual-History UX | 4-5h | Time-Travel-UI mit Thumbnails |
| ✅ | Multi-User-Avatar-Verbesserungen | 3-4h | [#204](https://github.com/MarianaCannabis/csc-raumplaner/pull/204) — colorForUser hash-basiert, Live-Names im Tooltip, Cursor-Glow |
| ✅ | PDF-Messeordnung Multi-Page-Support | 4-6h | [#205](https://github.com/MarianaCannabis/csc-raumplaner/pull/205) — promptForPages-Dialog mit "alle"/"1-3"/"1,3,5" |
| ✅ | Bild-auf-Wand erweitern | 5-7h | [#206](https://github.com/MarianaCannabis/csc-raumplaner/pull/206) — UV 1:1 Stretch, Property-Panel-Upload, Pattern wie objects.imageMap |
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

## Performance-Beobachtungen (post-PR #195)

User soll in den nächsten Tagen prüfen:
- [ ] Drag-and-Drop fühlt sich geschmeidiger an
- [ ] Tooltips „flackern" nicht mehr beim Bewegen
- [ ] Welcome-Modal taucht nicht mehr unerwartet auf
- [ ] App-Boot fühlt sich schneller an

Falls Verhalten unverändert: Ursache war woanders, neuer Audit nötig.

## Migration-Status (User-Aktion-Reminder)

User soll vor Sitzungs-Start beider Migrations applien (falls noch nicht):

| Migration | Status | Was wenn nicht applied |
|---|---|---|
| **0009 Optimistic Locking** | ❓ ggf. ausstehend | Konflikt-Modal inaktiv, last-writer-wins (graceful) |
| **0010 KCanG-Apps Cloud-Sync** | ❓ ggf. ausstehend | Wizard-Cloud-Sync inaktiv (graceful, localStorage funktioniert) |

Apply-URL: https://supabase.com/dashboard/project/wvkjkdwahsqozeupoxpj/sql

Smoke nach Apply:
- [ ] **0009**: Browser 1 + Browser 2 (Inkognito) auf gleiches Projekt → beide ändern + speichern → Konflikt-Modal erscheint
- [ ] **0010**: KCanG-Wizard öffnen → Cloud-Sync-Toggle aktivieren → Save → Supabase Dashboard zeigt csc_kcang_applications-Row

## Bundle-Status (informativ)

- v2.7.2 (aktuell): ~445 KB total gz, Distance zu <400-KB-Roadmap-Ziel: ~45 KB
- Strategie: nicht aktiv jagen, Diminishing Returns nach Bundle-Sprint
