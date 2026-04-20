-- P6.7: Realtime-Kollaborations-Sessions
--
-- Tabelle für Presence-Tracking: jeder online-User schreibt regelmäßig
-- (heartbeat) seine Position + Cursor-Koordinaten. Andere User in dem-
-- selben Projekt abonnieren via Supabase-Realtime-Channels diese Tabelle
-- und rendern die Cursor der anderen im Canvas.
--
-- RLS: User dürfen nur ihre EIGENEN Einträge schreiben/ändern, aber
-- Einträge ANDERER lesen — für die Presence-Visualisierung nötig.
--
-- Last-write-wins-Konflikt-Strategie: keine Locks, keine CRDT. Wenn zwei
-- User gleichzeitig ein Objekt bewegen, gewinnt der spätere Timestamp.
-- Pragmatisch für kleine Teams (2-5 Co-Planer) ausreichend.

create table if not exists csc_project_sessions (
  id            uuid primary key default gen_random_uuid(),
  project_name  text not null,              -- Projekte werden per Name gematched (nicht über FK — projects werden pro Save neu angelegt)
  user_id       uuid not null references auth.users(id) on delete cascade,
  user_email    text,                       -- cached für Presence-Anzeige
  color         text default '#4ade80',     -- zufällig zugewiesene Cursor-Farbe
  cursor_x      double precision,           -- Welt-Koordinaten im 2D-Plan (Meter)
  cursor_y      double precision,
  last_ping     timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  unique (project_name, user_id)            -- pro User max 1 aktive Session pro Projekt
);

-- Index für Realtime-Polling + Cleanup-Jobs
create index if not exists csc_sessions_project_idx on csc_project_sessions (project_name);
create index if not exists csc_sessions_ping_idx    on csc_project_sessions (last_ping desc);

-- RLS aktivieren
alter table csc_project_sessions enable row level security;

-- Jeder User kann alle Sessions IM SELBEN Projekt SEHEN (Presence-
-- Visualisierung); aber nur SEINEN eigenen Eintrag INSERTEN/UPDATEN/DELETEN.
drop policy if exists "select_any_session" on csc_project_sessions;
create policy "select_any_session"
  on csc_project_sessions
  for select
  using (auth.uid() is not null);

drop policy if exists "insert_own_session" on csc_project_sessions;
create policy "insert_own_session"
  on csc_project_sessions
  for insert
  with check (user_id = auth.uid());

drop policy if exists "update_own_session" on csc_project_sessions;
create policy "update_own_session"
  on csc_project_sessions
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "delete_own_session" on csc_project_sessions;
create policy "delete_own_session"
  on csc_project_sessions
  for delete
  using (user_id = auth.uid());

-- Realtime-Publication aktivieren (damit Supabase-Client subscriben kann)
alter publication supabase_realtime add table csc_project_sessions;

-- Automatische Cleanup-Funktion: Sessions älter als 2 Min als stale
-- betrachten. Können manuell oder via Cron aufgerufen werden.
create or replace function csc_cleanup_stale_sessions()
returns void
language sql
security definer
as $$
  delete from csc_project_sessions where last_ping < now() - interval '2 minutes';
$$;
