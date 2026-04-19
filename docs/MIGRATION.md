# P0 Security Migration — Manual Steps

Diese Änderung entfernt den im Client eingebetteten Anthropic API Key, ersetzt
die bisherige `"Public access"`-RLS-Policy durch besitzergebundene Policies
(`auth.uid() = owner`) und leitet alle KI-Requests über eine authentifizierte
Supabase Edge Function um.

**Die folgenden Schritte müssen manuell in Supabase ausgeführt werden — der
Code-Rollout alleine genügt nicht.**

## Reihenfolge

1. Supabase Anon-Key rotieren
2. RLS-Migration einspielen
3. Edge Function deployen
4. `ANTHROPIC_KEY` als Secret setzen
5. Email-Auth aktivieren
6. Verifikation

---

## 1. Supabase Anon-Key rotieren

Der alte Anon-Key (`eyJhbGciOi…`) war im `index.html` eingebettet und muss als
kompromittiert betrachtet werden.

1. Supabase Dashboard → **Project Settings → API → Project API keys**
2. Beim `anon` Key auf **Rotate** klicken, neuen Key kopieren.
3. Im Dashboard → **Authentication → URL Configuration** sicherstellen, dass
   die Redirect-URL auf die GitHub-Pages-Domain zeigt
   (`https://<user>.github.io/csc-raumplaner/`).
4. Der neue anon-Key wird im Browser via UI (`sb-key`-Input) gesetzt — er ist
   nach dieser Änderung nur noch für JWT-Transport relevant, nicht mehr für
   Datenzugriff.

## 2. RLS-Migration einspielen

Datei: `supabase/migrations/0001_rls_owner.sql`

Variante A — Supabase CLI:

```bash
supabase link --project-ref wvkjkdwahsqozeupoxpj
supabase db push
```

Variante B — SQL Editor:

- Supabase Dashboard → **SQL Editor → New query**
- Inhalt von `supabase/migrations/0001_rls_owner.sql` einfügen und ausführen.
- Die Migration ist idempotent.

**Achtung:** Bestehende Zeilen in `csc_projects` und `csc_shared_furniture`
haben `owner = NULL` und sind nach der Migration für niemanden mehr sichtbar.
Bei Bedarf vorher einen Backfill durchführen (`UPDATE csc_projects SET owner = '<uuid>' …`).

## 3. Edge Function deployen

Datei: `supabase/functions/anthropic-proxy/index.ts`

```bash
supabase functions deploy anthropic-proxy
```

`supabase/config.toml` erzwingt `verify_jwt = true` — Requests ohne gültiges
User-JWT werden von der Plattform abgewiesen, bevor der Function-Code läuft.

## 4. `ANTHROPIC_KEY` als Secret setzen

```bash
supabase secrets set ANTHROPIC_KEY=sk-ant-…
```

Verifizieren:

```bash
supabase secrets list
```

Der Key darf **niemals** im Client-Code, in einem Commit oder in einer
`.env.local` landen, die mit dem Frontend ausgeliefert wird.

## 5. Email-Auth aktivieren

Supabase Dashboard → **Authentication → Providers → Email**:

- **Enable Email provider**: an
- **Confirm email**: an (empfohlen)
- **Enable Magic Link**: an

Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://<user>.github.io/csc-raumplaner/`
- **Redirect URLs**: gleiche URL zu erlaubten Redirects hinzufügen.

Die Client-Logik (`cloudSignIn`) verwendet `signInWithOtp`, der Magic-Link
leitet an dieselbe Domain zurück und wird in `handleAuthRedirect()` geparst.

## 6. Verifikation

1. Seite im Inkognito-Modus öffnen → Cloud-Box zeigt **„Nicht eingeloggt"**.
2. Klick auf **Einloggen**, E-Mail eintragen, Magic Link aus der Mail öffnen.
3. Nach Redirect: Status zeigt **„Eingeloggt als …"**, `csc-sb-token` liegt im
   `localStorage`.
4. Chat-Nachricht an die KI senden → Request geht an
   `/functions/v1/anthropic-proxy`, Antwort kommt wie gewohnt.
5. Browser-Devtools → Network prüfen: **keine** Requests mehr gegen
   `api.anthropic.com`, **kein** `x-api-key`-Header im Client.
6. Zweiten User anlegen, prüfen dass User A die Projekte von User B **nicht**
   sieht (`csc_projects`-RLS).
7. Rate-Limit testen: > 30 KI-Requests/Min von einem User → Response `429`.

## Rollback

Falls Probleme auftreten:

- Edge Function stoppen: `supabase functions delete anthropic-proxy`
- RLS wieder öffnen (**nur als Notfall**):

  ```sql
  ALTER TABLE csc_projects DISABLE ROW LEVEL SECURITY;
  ALTER TABLE csc_shared_furniture DISABLE ROW LEVEL SECURITY;
  ```

- `claude/p0-security`-Branch revertieren.

Im Rollback-Fall muss der Anon-Key nochmals rotiert werden, weil sonst die
alte Version des `index.html` wieder den (jetzt ggf. neu gesetzten) Key
einbettet.
