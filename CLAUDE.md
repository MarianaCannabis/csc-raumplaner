# CSC Studio Pro — Claude-Code-Kontext

Du arbeitest am Browser-basierten Raum-/Veranstaltungsplaner für Cannabis Social Clubs (KCanG).
Diese Datei ist dein Dauer-Kontext bei jedem Session-Start. Lies sie zuerst, dann frage gezielt nach.

## ⚠ Pflicht-Reihenfolge bei Session-Start

1. **`SESSION-CONTEXT.md`** lesen — der lebendige Stand: aktueller Branch, was läuft,
   Blocker, offene User-Actions. Das ist der primäre Kompass für jede neue Instanz
   (Web-Claude UND Lokal-Claude). Bei Änderungen am Stand: vor Antwort-Ende aktualisieren.
2. **`SESSION-LOG.md`** kurz checken (letzte 5 Einträge) — Audit-Trail vom Stop-Hook.
3. Diese `CLAUDE.md` als Hintergrund-Wissen (Stack, Konventionen, Don'ts).
4. Erst dann auf den User-Prompt antworten.

## Stack

- **Frontend:** Vanilla-JS-Legacy-Core (`index.html`, ~21k Zeilen, ~1.19 MB) +
  progressiver Strangler-Umzug nach TypeScript unter `src/`.
- **Bundler:** Vite 8 → statische Files für GitHub-Pages
- **TypeScript:** strict + noUncheckedIndexedAccess + noImplicitReturns + noFallthroughCasesInSwitch + noImplicitOverride
- **3D:** Three.js r184 (PBR, Bloom, HDRI, GLTF)
- **Tests:** Vitest unit (150+) · Playwright E2E (41)
- **Backend:** Supabase Postgres + Auth (Magic-Link) + Realtime + Edge Functions
  - Production-Instanz: wvkjkdwahsqozeupoxpj.supabase.co
  - RLS auf allen Tabellen, owner-Policies in supabase/migrations/0001_rls_owner.sql
- **KI-Proxy:** Edge Function anthropic-proxy mit JWT-Verify, Anthropic-Key server-side

## Aktueller Stand

- **Version:** 2.8.2
- **Default-Branch:** main
- **Letzte Welle:** Compliance-Doppelwelle Hygiene + Suchtberatung (KCanG
  § 14 + § 23) — `hygienekonzept.ts` + `suchtberatung.ts` lesen aus
  Wizard Section D + E, +11 Vitest, rule-imports 23 → 25. Davor
  Roadmap v3.0 komplett (4/4) — Multi-Floor 4 Phasen, Bauantrag-PDF,
  BIM-Viewer Roundtrip, Stripe-Checkout 2 Phasen + Bonus Doc-Polish
  und Feature-Selbsttest mit 🩺-Button. PRs #214–#228.

## Workflow — Rollenverteilung

- **Web-Claude (claude.ai/code)** = Architekt: analysiert Code, schreibt Specs.
  Liest Repo-Files, kann lokal committen, **kann NICHT remote pushen** (Proxy-403).
- **Lokale Claude-Code-Instanz** = Implementer: setzt Specs um, pusht, opens PRs, merged.
- Specs werden im Chat übergeben — nicht im Repo abgelegt.

### Autonomie-Vorgabe

User-Wunsch: so wenig User-Eingriff wie möglich. Beide KI dürfen
End-to-End-Cycles eigenständig fahren (Branch → Implement → Test →
Commit → Push → PR → Merge → Release-Tag), bei langen Sessions selbst
/compact ausführen, Quality-Gates eigenständig korrigieren.

Eskalation an User nur bei: destruktiven Aktionen (force-push, reset --hard,
Branch-Delete), Architektur-Änderungen über mehrere Module, neuen
Dependencies (Bundle-Budget!), Migrationen die Production-Daten anfassen
(DROP COLUMN, RENAME, …).

## Hotfix-Routine

1. Spec-Übergabe → Branch `hotfix/v<X.Y.Z>-<kurz>`
2. Implementierung + Tests + CHANGELOG-Eintrag + Version-Bump in package.json
3. PR mit Title: `hotfix(<scope>): <Titel> — v<X.Y.Z>`
4. Quality-Gates grün: npm test · npx tsc --noEmit · npm run test:e2e · npm run build
5. Squash-Merge → Release-Commit `chore(release): v<X.Y.Z>` + GitHub-Release-Tag

## Dev-Patterns

- **Test vor Code-Änderung** bei Bugs (failing-Test der den Bug reproduziert)
- **Targeted Edits** mit präzisem old_string statt Volltext-Rewrites von index.html (1.19 MB)
- **PostgREST-Errors lesen**: Header `proxy-status: PostgREST; error=PGRST<NNN>`.
  PGRST204 = Spalte fehlt im Schema-Cache · PGRST116 = mehrere Rows bei Single ·
  PGRST200 = FK-Embedding nicht gefunden · 22P02 = Postgres-Cast-Fehler
- **Migration-Idempotenz**: alle SQL-Migrations mit IF NOT EXISTS / DROP IF EXISTS
- **Schema-Cache nach Migration**: `NOTIFY pgrst, 'reload schema';` am Ende
- **RLS-Disziplin**: jede neue Tabelle bekommt ENABLE ROW LEVEL SECURITY + per-User-Policies
- **Health-Check index.html**: ~1.19 MB. >1.5 MB = Duplikat-Bug.

## P17 — JS-Split-Schema (validiert in PR #159 + #160)

Beim Extrahieren einer Function aus `index.html` nach `src/legacy/<modul>.ts`:

| Schritt | Wann | Tool |
|---|---|---|
| Vorab-Grep direct | immer | `grep -nE '^(setTimeout\|setInterval\|window\.addEventListener)\(.*\b<funcName>\(' index.html` |
| Vorab-Grep transitiv | bei Modulen >30 LOC oder vielen Callern | Caller-Functions identifizieren, rekursiv prüfen ob sie in Top-Level-Schedulern auftauchen |
| Boot-Shim einplanen | **als Standard, nicht Sonderfall** — Kosten ~80-150 B gz, eliminiert ganze Race-Klasse | `function <name>(...args){ if(typeof window.<name>==='function' && window.<name>!==<name>) return window.<name>(...args); }` |
| Closure-Wrap in main.ts | wenn Module >1 legacy-global liest | `buildXDeps()` Helper, deklarativ + type-safe |
| Type-Files erweitern | wenn neue Datenstruktur | `src/legacy/types.ts` (gemeinsamer Pool) |
| Manual-Smoke-Spec | jeder PR | `tests/e2e/_<feature>-smoke.spec.ts` (vor Commit löschen) |

**Bundle-Win-Erwartung:** Module unter ~30 LOC sind durch Shim-Overhead
oft net-negativ (Pilot toast: +359 B gz). Ab ~50 LOC kippt es ins
Positive (compliance-bridge: −826 B gz mit 3 Shims).

**Quality-Gates pro PR:** `tsc clean` · `vitest grün` · `npm run audit:all`
(broken-flow-detect Exit-Code, unresolved-Count) · `npm run build` ·
`npm run test:e2e` · manueller 5-Flow Smoke.

**Stopp-Bedingungen** (= NICHT pushen, Bericht):
- broken-flow-detect unresolved-Count steigt
- vitest unerwartete Failures
- Bundle +5 KB gz oder mehr
- E2E-Tests die vorher grün waren rot
- Smoke: vorher arbeitende Feature liefert NaN/falsche Werte

## Konventionen

- Commit-Stil: `<type>(<scope>): <kurz>`, DE/EN gemischt OK
- PR-Title = Commit-Title; Squash-Merge
- CHANGELOG.md bei jedem Release manuell ergänzt (oben einfügen)
- User-facing Sprache: Deutsch primär, Englisch toggle
- Code-Kommentare: Deutsch oder Englisch — beides existiert
- Emojis nur im UI (toasts, addMsg, button-labels), NICHT im Source-Code

## Don'ts (oberste Regel zuerst)

- **KEIN Feature ENTFERNEN ohne expliziten User-OK.** Default ist erhalten,
  refactoren, dokumentieren. Gilt auch für Catalog-Items, Compliance-Regeln,
  Templates, KI-Features, Export-Formate, Shortcuts, UI-Buttons, Dialoge.
- **Force-Push**: erlaubt auf eigenen Feature-Branches zur Korrektur (z.B.
  versehentlich committete gitignored-Dateien, Build-Artifacts, falscher
  Co-Author) **vor** PR-Merge. Verboten auf `main`, auf shared-branches, oder
  als Workaround für fehlgeschlagene Hooks. Bevorzugt: NEUEN Commit obendrauf
  schieben statt amend+force. Force-Push muss immer im PR-Bericht erwähnt
  werden mit Grund + Auswirkung (z.B. „revertet versehentlich-committete
  Lighthouse-Artifacts").
- KEINE neuen Dependencies ohne User-Freigabe (Bundle-Budget!)
- KEINE nicht-idempotente Migration
- KEINE Tabelle ohne RLS
- KEIN --no-verify bei Commits
- KEINE Inline-Komplettrewrites von index.html — immer targeted Edit

## Session-Hygiene

- /compact bei langen Sessions
- /resume für noch lebende Sessions
- Crashed Sessions sind nicht resumebar — `SESSION-CONTEXT.md` + `SESSION-LOG.md` +
  `CHANGELOG.md` + Git-Log sind die Anker
- CHANGELOG-Einträge sind Pflicht bei jedem Release (Langzeitgedächtnis)
- **`SESSION-CONTEXT.md` aktualisieren bevor du eine Antwort beendest**, falls sich
  Branch / Blocker / nächster Schritt geändert haben. Das ist der einzige Mechanismus
  der Web-Claude bei API-Crash absichert.

## Resilience-Setup (für beide Claude-Varianten)

Drei Bausteine, in `.claude/` + Repo-Root:

| Datei | Zweck | Wer pflegt |
|---|---|---|
| `SESSION-CONTEXT.md` | Lebendiger Stand-Kompass — Branch, was läuft, Blocker, nächster Schritt | Manuell von Web/Lokal vor Antwort-Ende |
| `SESSION-LOG.md` | Append-only Audit-Trail (1 Zeile pro Stop) | Lokal-Claude via Stop-Hook (auto) |
| `.claude/settings.json` | SessionStart + Stop Hooks für Lokal-Claude | Einmal-Setup, selten geändert |
| `.claude/scripts/session-start.sh` | Zeigt Stand bei jedem Lokal-Claude-Start | Einmal-Setup |
| `.claude/scripts/session-stop.sh` | Schreibt Log-Zeile bei jedem Lokal-Claude-Stop | Einmal-Setup |

Web-Claude hat keine Hooks, aber durch die Pflicht-Reihenfolge oben (zuerst
`SESSION-CONTEXT.md` lesen) ist der Effekt äquivalent: jede neue Web-Instanz ist
nach 30 Sekunden orientiert, ohne dass der User die ganze Vorgeschichte erklären muss.
