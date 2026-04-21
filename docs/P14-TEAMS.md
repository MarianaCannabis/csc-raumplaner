# P14 — Team-Management-UI

Stand: 2026-04-21 · v2.4-dev

## Ausgangslage (vor P14)

P9.5 hatte bereits die DB-Infrastruktur + Basic-UI:
- `csc_teams` + `csc_team_members` Tabellen mit RLS
- `csc_projects.team_id`-Spalte für Projekt-Zuweisung
- `openTeamsModal`, `createTeam`, `deleteTeam`, `assignProjectToTeam`, `_renderTeamsList`, `_loadTeamMembers`
- Auto-Redeem via `?team=UUID`-URL-Parameter (IIFE beim DOMContentLoaded)

## Ausgeliefert in P14

### Tab-Struktur im Modal
`#m-teams` hat jetzt zwei Tabs mit `switchTeamsTab('list'|'invite')`:

**Tab 1 — "📋 Meine Teams"** (Default):
- Liste aller Teams mit Owner-Badge, Invite-Link-Button, Mitglieder-Count
- "Neues Team erstellen"-Form (bleibt unverändert aus P9.5)

**Tab 2 — "🎟 Einladung einlösen"**:
- Input für Team-UUID aus einem Invite-Link
- UUID-Format-Validierung (Regex `^[0-9a-f-]{30,40}$`)
- `redeemTeamInvite(teamId)` POST zu `csc_team_members` mit Rolle `viewer`
- Erfolg → Toast + Switch zurück zu Tab 1 mit aktualisierter Liste

### Fallback für User ohne Invite-Link
Use-Case: Team-Admin kopiert den Link und versendet ihn manuell (WhatsApp, Signal). Der Empfänger kann entweder den Link direkt öffnen (Auto-Redeem via existing IIFE), oder die Team-UUID kopieren und im Modal einfügen.

### Bereits vorhandene, funktionierende Bits
- Auto-Redeem bei `?team=UUID` beim App-Boot bleibt intakt
- `assignProjectToTeam` im aktiven Projekt funktioniert

## Nicht ausgeliefert in P14 (ehrlich deferred)

### Role-Dropdown per Member
**Grund:** erfordert neuen PATCH-Endpoint-Aufruf + optimistic-UI + RLS-Check ob der aktuelle User überhaupt berechtigt ist (nur Owner + Admin). Die bestehende RLS-Policy erlaubt `update` auf `csc_team_members` nicht — müsste in Migration 0008_role_update.sql ergänzt werden.

### Team-Switcher in Topbar
**Grund:** würde die Cloud-Projekt-Liste nach `active_team_id` filtern. Braucht eigenen State + Listener-Kette. Zu viel Logik für diesen Batch ohne E2E-Coverage.

### Presence (wer online im Projekt)
**Grund:** P6.7 hat bereits `csc_project_sessions` + Mouse-Cursor-Presence. Team-scoped Presence-Anzeige wäre Erweiterung mit Realtime-Channel-JOIN. Separate v2.4-PR.

### Email-Cache-Refresh
`user_email` wird beim Insert gecached — bei Mail-Änderung stale. Fix defer.

## Use-Cases (End-to-End)

### 1. Admin erstellt Team + lädt ein
```
1. Datei → 👥 Teams verwalten
2. Tab "Meine Teams"
3. Name "Mein CSC" eintippen → ➕ Erstellen
4. Team erscheint in Liste (als Owner markiert)
5. 🔗 Invite klicken → Link in Zwischenablage
6. Link per WhatsApp/Signal an Kollegen schicken
```

### 2. Kollege löst Invite ein (Happy Path)
```
1. Kollege öffnet den Link im Browser
2. Magic-Link-Login (falls noch nicht eingeloggt)
3. Auto-Redeem-IIFE fängt ?team=X ab, zeigt Confirm
4. OK → POST zu csc_team_members als role=editor
5. Toast "✅ Team beigetreten", URL-Param entfernt
```

### 3. Kollege löst Invite ein (UUID-Copy-Paste-Fallback)
```
1. Kollege kopiert NUR die UUID aus dem Link
2. In CSC Studio Pro einloggen, Datei → Teams
3. Tab "🎟 Einladung einlösen"
4. UUID einfügen → ✅ Beitreten
5. Toast, Switch zu Tab "Meine Teams", neues Team in Liste
```

## DB-Status

Keine Migration-Änderung in P14. Alle Tabellen + RLS-Policies aus `0005_teams.sql` (P9.5) reichen — kein `supabase db push` nötig.
