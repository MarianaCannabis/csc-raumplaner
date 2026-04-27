# Feature-Roadmap (intern)

Stand: 2026-04-27 · **v2.8.1 · Roadmap v3.0 4/4 ✅**.
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
| ✅ | Touch-Listener-Wire-Up auf fpCv | 2-3h | [#212](https://github.com/MarianaCannabis/csc-raumplaner/pull/212) — Pan/Pinch-Center-Zoom/Tap/Long-Press auf 2D-Canvas. 3D ohne OrbitControls = kein Wire-Up nötig |

## Bedienkonzept

| Status | Item | Aufwand | Notiz |
|---|---|---|---|
| ✅ | **Onboarding-Tour neu strukturieren** | 3-4h | [#196](https://github.com/MarianaCannabis/csc-raumplaner/pull/196) — Phase-State-Machine, Migration alter Keys |
| ✅ | **Konflikt-Resolution Cloud-Save** | 4-6h | [#198](https://github.com/MarianaCannabis/csc-raumplaner/pull/198) — Optimistic Locking via Version-Counter (Migration 0009 PFLICHT-Apply) |
| ✅ | **Compliance-Wizard für KCanG-Antrag** | 6-8h | [#201](https://github.com/MarianaCannabis/csc-raumplaner/pull/201) — Single-Page-Form 7 Sektionen, localStorage + opt-in Cloud-Sync, jsPDF lazy-Export (Migration 0010 PFLICHT-Apply) |
| ✅ | Tastatur-Shortcuts-Editor erweitern | 2-3h | [#209](https://github.com/MarianaCannabis/csc-raumplaner/pull/209) — Konflikt-Detection + 3 Presets + 15 Items |
| ✅ | Hygiene-Compliance-Regel in src/compliance/ | 1-2h | v2.8.2 — `hygienekonzept.ts` prüft 5 Section-D-Items, +4 Vitest |
| ✅ | Suchtberatung-Pflichtfeld als KCanG-Regel | 1-2h | v2.8.2 — `suchtberatung.ts` prüft kontakt_name + Kanal, +7 Vitest |
| ✅ | Mobile/Touch-Optimierung | 4-8h | [#203](https://github.com/MarianaCannabis/csc-raumplaner/pull/203) — touchSupport-Modul mit Pan/Zoom/Tap/Long-Press, Boot-Detection, mobile-CSS |

## Zusatzfunktionen

| Status | Item | Aufwand | Notiz |
|---|---|---|---|
| ✅ | Full Menu-Tagging (158 Items mit data-mode/tier) | 4-6h | [#213](https://github.com/MarianaCannabis/csc-raumplaner/pull/213) — 158/158 fully tagged via Heuristik, Audit-Coverage in audit-functions.mjs |
| ✅ | Snapshot/Visual-History UX | 4-5h | [#210](https://github.com/MarianaCannabis/csc-raumplaner/pull/210) — Slider/Grid/Compare-Modes mit Diff-Counter (computeDiff-Reuse) |
| ✅ | Multi-User-Avatar-Verbesserungen | 3-4h | [#204](https://github.com/MarianaCannabis/csc-raumplaner/pull/204) — colorForUser hash-basiert, Live-Names im Tooltip, Cursor-Glow |
| ✅ | PDF-Messeordnung Multi-Page-Support | 4-6h | [#205](https://github.com/MarianaCannabis/csc-raumplaner/pull/205) — promptForPages-Dialog mit "alle"/"1-3"/"1,3,5" |
| ✅ | Bild-auf-Wand erweitern | 5-7h | [#206](https://github.com/MarianaCannabis/csc-raumplaner/pull/206) — UV 1:1 Stretch, Property-Panel-Upload, Pattern wie objects.imageMap |
| ✅ | Wiederholte Räume / Stempel-Funktion | 3-4h | [#211](https://github.com/MarianaCannabis/coffee-raumplaner/pull/211) — `stampMode.ts` mit Live-Selection-Lookup, Esc-Beenden |

## Roadmap v3.0 — komplett ✅ (Stand v2.8.1)

| Status | Item | Aufwand | Notiz |
|---|---|---|---|
| ✅ | **Multi-Floor mit 3D-Treppen (4/4 Phasen)** | 2-3 Wo | Phase 1+2 #216/[#217](https://github.com/MarianaCannabis/csc-raumplaner/pull/217) (Treppen-Catalog, 3D-Geometrie, Stacked-View, +2 Compliance-Regeln). Phase 3 [#219](https://github.com/MarianaCannabis/csc-raumplaner/pull/219) — Treppen wirklich rendern (`findItem` ergänzt um NEW_CATALOG), `validateStairsPlacement`, Stacked-View-Transparenz, L-Treppen. Phase 4 [#220](https://github.com/MarianaCannabis/csc-raumplaner/pull/220) — Wendeltreppen mit Spiral-Geländer. |
| ✅ | **Bauantrag-PDF-Generierung** | 1-2 Wo | [#214](https://github.com/MarianaCannabis/csc-raumplaner/pull/214) — 10 Sektionen, jsPDF-Lazy-Reuse, KCanG-Wizard-Daten + Compliance + Möbel + Anhang |
| ✅ | **BIM-Viewer Integration (Phase 1+2)** | 1-2 Wo | Phase 1 [#221](https://github.com/MarianaCannabis/csc-raumplaner/pull/221) — IFC-Import via @thatopen/components als lazy-Chunk (~5 MB, kein initial-Bundle-Impact). Phase 2 [#223](https://github.com/MarianaCannabis/csc-raumplaner/pull/223) — IFC-Export via existing `src/export/ifc.ts` (handgeschrieben ~9 KB). Roundtrip Import → Edit → Export funktional. |
| ✅ | **Stripe-Checkout Pro/Team (Phase 1+2)** | 1-2 Wo | Phase 1 [#218](https://github.com/MarianaCannabis/csc-raumplaner/pull/218) — Migration 0011, Pricing-Modal, REST-Wrapper. Phase 2 [#222](https://github.com/MarianaCannabis/csc-raumplaner/pull/222) — Migration 0012 (RLS-Hardening), Edge-Functions `stripe-webhook` + `stripe-checkout` (Test-Mode, alle Pläne 0 €), Soft-Limits, `docs/STRIPE-SETUP.md`. |

## Bonus — Quality-Infrastruktur (post-v3.0)

| Status | Item | Aufwand | Notiz |
|---|---|---|---|
| ✅ | **Doc-Polish v2.8.0** | 3-4h | [#224](https://github.com/MarianaCannabis/csc-raumplaner/pull/224) — README + USER-GUIDE komplett aktualisiert, Bundle-Sektion (initial vs lazy), Was-ist-erledigt + Was-kommen-kann, Version-Bump 2.7.7 → 2.8.0 (Minor wegen v3.0-Milestone). |
| ✅ | **Feature-Selbsttest + 🩺-Button** | 6-10h | [#225](https://github.com/MarianaCannabis/csc-raumplaner/pull/225) — `docs/FEATURE-MANIFEST.json` als Source-of-Truth, `scripts/audit-features.mjs` (statisch, in `audit:all`), `tests/e2e/feature-health.spec.ts` (11 E2E-Tests), `src/legacy/selfTest.ts` + UI-Button im Help-Modal (7 Live-Browser-Checks). „Ist alles noch da?"-Audit von Pflicht-30-Min-Smoke zu Pflicht-30-Sekunden-Click. |

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

User soll vor Sitzungs-Start alle ausstehenden Migrationen applien:

| Migration | Status | Was wenn nicht applied |
|---|---|---|
| **0009 Optimistic Locking** | ❓ ggf. ausstehend | Konflikt-Modal inaktiv, last-writer-wins (graceful) |
| **0010 KCanG-Apps Cloud-Sync** | ❓ ggf. ausstehend | Wizard-Cloud-Sync inaktiv (graceful, localStorage funktioniert) |
| **0011 Subscriptions** | ❓ ggf. ausstehend | Pricing-Modal öffnet, aber Phase-1-Plan-Wechsel scheitert |
| **0012 Subscriptions Stripe-Hardening** | ❓ neu (v2.7.6) | RLS-UPDATE bleibt User-Self-Update statt service_role-only — Anti-Tampering-Lücke |

Apply-URL: https://supabase.com/dashboard/project/wvkjkdwahsqozeupoxpj/sql

Stripe-Setup separat: siehe [`docs/STRIPE-SETUP.md`](STRIPE-SETUP.md) für Account, Webhook-URL, Edge-Function-Secrets, Deploy-Schritte.

Smoke nach Apply:
- [ ] **0009**: Browser 1 + Browser 2 (Inkognito) auf gleiches Projekt → beide ändern + speichern → Konflikt-Modal erscheint
- [ ] **0010**: KCanG-Wizard öffnen → Cloud-Sync-Toggle aktivieren → Save → Supabase Dashboard zeigt `csc_kcang_applications`-Row
- [ ] **0011 + 0012 + Stripe-Setup**: Pricing-Modal → "Pro werden" → Stripe-Checkout-Page öffnet → Test-Karte 4242 4242 4242 4242 → Redirect mit Toast „🎉 Upgrade erfolgreich!" → `csc_subscriptions`-Row hat plan='pro'

## App-Selbsttest (NEU v2.8.1)

User-facing 30-Sekunden-Health-Check: `❓ Hilfe → 🩺 App-Selbsttest → 🩺 Jetzt prüfen`. Prüft 7 Kategorien (Bridges, Catalog, Compliance, Modals, Right-Panel-Tabs, Exports, BIM). Manifest-Drift wird zusätzlich in CI gefangen via `audit:features`.

## Bundle-Status (Stand v2.8.1)

- **Initial gz** ~470 KB (index.html ~351 + JS ~94 + CSS ~19) — unverändert seit v2.7-Sprint
- **Lazy-Chunks on-demand:** BIM-Lib ~5 MB, jsPDF + html2canvas ~127 KB, GLTFExporter ~13 KB, STAND_TEMPLATES ~6 KB, i18n locales ~600 B × 3
- Strategie: <400-KB-Initial nicht aktiv jagen — Lazy-Splits sind die effektivere Hebel
