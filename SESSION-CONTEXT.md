# Session-Context — CSC Studio Pro

> **Pflicht-Lesung bei jedem Session-Start.** Web-Claude (claude.ai/code) und
> Lokal-Claude (Claude Code CLI) lesen diese Datei zuerst, bevor sie auf den
> ersten User-Prompt antworten. Wer eine Antwort beendet, an deren Ende sich
> der Stand geändert hat, aktualisiert die Sektionen unten **bevor** der
> Stop-Hook feuert.
>
> Format-Regeln:
> - „Letzte Aktualisierung" immer mit ISO-Datum + Quelle (web/lokal)
> - „Was läuft gerade" max. 3 Bullets, Telegrammstil
> - „Blocker" leer lassen, wenn nichts blockt — nicht „—" oder „n/a"
> - Verweise auf PR-Nummern + Commit-SHAs (kurz, 7 Zeichen) wo sinnvoll

---

## Letzte Aktualisierung

**2026-04-28** · von Lokal-Claude · Resilience-Setup gemerged

## Aktueller Branch

`main` (nach Merge)

## Repo-Stand

- `main` HEAD: nach Merge (kurzer SHA hier eintragen)
- Letzter Release-Tag: **v2.8.2** (2026-04-27, Compliance-Doppelwelle)
- Roadmap v3.0: ✅ komplett (4/4 + Bonus)

## Was läuft gerade

- Resilience-Setup live, User startet Schritt-1-Plan

## Nächster Schritt

- Schritt 1: Browser-Smoke der App (lädt? 🩺 alle 7 ✅?)
- Schritt 2: 🩺-Selbsttest klicken
- Schritt 3: DB-Diagnose-Query in Supabase
- Schritt 4: Fehlende Migrations applizieren

## Blocker

- Migrations-Stand 0001–0008 unbekannt. Beim Apply-Versuch von 0009 kam
  „relation csc_user_templates does not exist" → Migration 0004 fehlt.
  Lösung folgt in Schritt 3 + 4 des Neustart-Plans.

## Offene User-Actions (chronologisch)

- [ ] Browser-Smoke der App (lädt? 🩺-Button alle 7 ✅?)
- [ ] DB-Diagnose-Query in Supabase laufen lassen
- [ ] Migrations 0001–0012 in korrekter Reihenfolge applizieren (nach Diagnose)
- [ ] Stripe-Setup — nur falls Pro/Team aktiv geschaltet werden soll (optional)

## Rollenverteilung

- **Web-Claude** (claude.ai/code) = Architekt: liest Code, schreibt Specs.
  Kann lokal committen, **kann NICHT remote pushen** (Sandbox-403).
- **Lokal-Claude** (Claude Code CLI) = Implementer: setzt Specs um, pusht,
  opens PRs, merged.
- Übergaben in einem Code-Block (User muss nur einmal copy-paste).
- Bericht-Anfrage am Ende jedes Local-Claude-Auftrags (Format unten).

## Wo wir heute waren (chronologisch)

- 2026-04-27: Roadmap v3.0 abgerundet (BIM-Roundtrip, Doc-Polish,
  Selbsttest), PR #226 closed, Compliance-Doppelwelle v2.8.2 (#228),
  Doc-Restdaten (#229), Migrations-Apply gestoppt
- 2026-04-28: Resilience-Setup (A+B+C)

## Bericht-Format für Local-Claude

Jeder größere Local-Claude-Auftrag endet mit einem solchen Block:

```
═══════════════════════════════════════════════════════════════════════
BERICHT FÜR WEB-CLAUDE — Stand <Datum + Uhrzeit>
═══════════════════════════════════════════════════════════════════════

## Task — <Titel>
- Status: ✅ done | ⚠ partial | ❌ blocked | ⏳ läuft noch
- PR-Nummer: #___
- PR-URL: https://github.com/MarianaCannabis/csc-raumplaner/pull/___
- Merge-Commit auf main: ___ (kurzer SHA)
- Quality-Gates: tsc=___ vitest=___/___ audit=___ build=___ e2e=___/___
- Anmerkungen: ___

## Offene User-Actions
- ___
═══════════════════════════════════════════════════════════════════════
```

User klebt den Block in den Chat. SESSION-CONTEXT.md muss danach
aktualisiert werden.

## Wichtige Files (Stand-Anker)

- `CLAUDE.md` — Projekt-Übersicht, Stack, Konventionen
- `CHANGELOG.md` — Release-Historie (oben einfügen bei neuem Release)
- `docs/FEATURE-ROADMAP.md` — Tracking aller Themen, ⏳/🔧/✅
- `docs/FEATURE-MANIFEST.json` — Source-of-Truth für audit:features
- `SESSION-CONTEXT.md` — diese Datei, lebendiger Stand
- `SESSION-LOG.md` — Auto-Append-Audit-Trail (von Stop-Hook gepflegt)

## Schnell-Referenz

- Supabase-SQL-URL: https://supabase.com/dashboard/project/wvkjkdwahsqozeupoxpj/sql
- Pages-Deploy: https://marianacannabis.github.io/csc-raumplaner/
- Test-Page: https://marianacannabis.github.io/csc-raumplaner/test-v2.8.1.html
- 🩺-Selbsttest in App: ❓ Hilfe → 🩺 App-Selbsttest → 🩺 Jetzt prüfen
