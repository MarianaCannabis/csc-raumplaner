-- P9.5: Team-Management — Teams + Member-Rollen + Projekt-Zuweisung
--
-- Rollen: admin (alles), editor (projects bearbeiten), viewer (nur lesen).
-- Invite-Flow: Admin kopiert Invite-Link (magic-link?team_id=X).

create table if not exists csc_teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  owner      uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);
create index if not exists csc_teams_owner_idx on csc_teams (owner);

create table if not exists csc_team_members (
  team_id   uuid references csc_teams(id) on delete cascade,
  user_id   uuid references auth.users(id) on delete cascade,
  user_email text, -- cached für UI-Anzeige (RLS sieht auth.users.email nicht immer)
  role      text check (role in ('admin','editor','viewer')) default 'viewer',
  joined_at timestamptz default now(),
  primary key (team_id, user_id)
);

-- Projekt-Team-Zuweisung (optional pro Projekt)
alter table csc_projects add column if not exists team_id uuid references csc_teams(id) on delete set null;
create index if not exists csc_projects_team_idx on csc_projects (team_id) where team_id is not null;

-- RLS

alter table csc_teams enable row level security;
drop policy if exists "select_teams_as_member" on csc_teams;
create policy "select_teams_as_member"
  on csc_teams for select
  using (
    owner = auth.uid()
    or exists (select 1 from csc_team_members m where m.team_id = csc_teams.id and m.user_id = auth.uid())
  );
drop policy if exists "insert_team_any" on csc_teams;
create policy "insert_team_any"
  on csc_teams for insert
  with check (owner = auth.uid());
drop policy if exists "update_team_owner" on csc_teams;
create policy "update_team_owner"
  on csc_teams for update
  using (owner = auth.uid());
drop policy if exists "delete_team_owner" on csc_teams;
create policy "delete_team_owner"
  on csc_teams for delete
  using (owner = auth.uid());

alter table csc_team_members enable row level security;
drop policy if exists "select_members_if_in_team" on csc_team_members;
create policy "select_members_if_in_team"
  on csc_team_members for select
  using (
    user_id = auth.uid()
    or exists (select 1 from csc_team_members m2 where m2.team_id = csc_team_members.team_id and m2.user_id = auth.uid())
    or exists (select 1 from csc_teams t where t.id = csc_team_members.team_id and t.owner = auth.uid())
  );
drop policy if exists "insert_member_as_admin_or_owner" on csc_team_members;
create policy "insert_member_as_admin_or_owner"
  on csc_team_members for insert
  with check (
    exists (select 1 from csc_teams t where t.id = team_id and t.owner = auth.uid())
    or exists (select 1 from csc_team_members m where m.team_id = csc_team_members.team_id and m.user_id = auth.uid() and m.role = 'admin')
  );
drop policy if exists "delete_member_self_or_admin" on csc_team_members;
create policy "delete_member_self_or_admin"
  on csc_team_members for delete
  using (
    user_id = auth.uid()  -- selbst leaven
    or exists (select 1 from csc_teams t where t.id = team_id and t.owner = auth.uid())
    or exists (select 1 from csc_team_members m where m.team_id = csc_team_members.team_id and m.user_id = auth.uid() and m.role = 'admin')
  );

-- csc_projects RLS erweitern: Team-Members dürfen lesen; Team-Editor+
-- dürfen editieren. (Alte Policies bleiben für owner=auth.uid() bestehen.)
drop policy if exists "csc_projects_select_team" on csc_projects;
create policy "csc_projects_select_team"
  on csc_projects for select
  using (
    team_id is not null
    and exists (select 1 from csc_team_members m where m.team_id = csc_projects.team_id and m.user_id = auth.uid())
  );
drop policy if exists "csc_projects_update_team_editor" on csc_projects;
create policy "csc_projects_update_team_editor"
  on csc_projects for update
  using (
    team_id is not null
    and exists (select 1 from csc_team_members m where m.team_id = csc_projects.team_id and m.user_id = auth.uid() and m.role in ('admin','editor'))
  );
