# CSC Studio Pro — Claude-Code-Kontext

Du arbeitest am Browser-basierten Raum-/Veranstaltungsplaner für Cannabis Social Clubs (KCanG).
Diese Datei ist dein Dauer-Kontext bei jedem Session-Start. Lies sie zuerst, dann frage gezielt nach.

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

- **Version:** 2.6.3
- **Default-Branch:** main
- **Letzte Welle:** Auth-/Cloud-Save-Hotfixes v2.6.1 → v2.6.3

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
- KEIN git push --force außer User fordert es
- KEINE neuen Dependencies ohne User-Freigabe (Bundle-Budget!)
- KEINE nicht-idempotente Migration
- KEINE Tabelle ohne RLS
- KEIN --no-verify bei Commits
- KEINE Inline-Komplettrewrites von index.html — immer targeted Edit

## Session-Hygiene

- /compact bei langen Sessions
- /resume für noch lebende Sessions
- Crashed Sessions sind nicht resumebar — CLAUDE.md + CHANGELOG.md + Git-Log sind die Anker
- CHANGELOG-Einträge sind Pflicht bei jedem Release (Langzeitgedächtnis)
