-- P9.3: User-generierte Templates mit Save/Load/Delete.
--
-- Jeder eingeloggte User kann eigene Templates anlegen (aus dem
-- aktuellen Projekt-Zustand) und diese im Template-Modal neben den
-- System-Templates (STAND_TEMPLATES aus src/templates/) finden.
--
-- RLS: Owner sehen + editieren; andere sehen nur veröffentlichte
-- (is_public=true) — Community-Sharing kommt in P9.7.

create table if not exists csc_user_templates (
  id           uuid primary key default gen_random_uuid(),
  owner        uuid references auth.users(id) on delete cascade,
  name         text not null,
  description  text,
  tags         text[] default '{}',
  icon         text default '📋',
  size_label   text,
  data         jsonb not null,              -- { rooms, objects, grounds, meta }
  thumbnail    text,                        -- data-URL JPEG (klein)
  is_public    boolean default false,       -- wird in P9.7 relevant
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create index if not exists csc_user_tpl_owner_idx on csc_user_templates (owner);
create index if not exists csc_user_tpl_public_idx on csc_user_templates (is_public) where is_public = true;

alter table csc_user_templates enable row level security;

drop policy if exists "select_own_or_public" on csc_user_templates;
create policy "select_own_or_public"
  on csc_user_templates
  for select
  using (owner = auth.uid() or is_public = true);

drop policy if exists "insert_own" on csc_user_templates;
create policy "insert_own"
  on csc_user_templates
  for insert
  with check (owner = auth.uid());

drop policy if exists "update_own" on csc_user_templates;
create policy "update_own"
  on csc_user_templates
  for update
  using (owner = auth.uid())
  with check (owner = auth.uid());

drop policy if exists "delete_own" on csc_user_templates;
create policy "delete_own"
  on csc_user_templates
  for delete
  using (owner = auth.uid());

-- Auto-update updated_at bei UPDATE
create or replace function csc_touch_user_templates()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists csc_user_templates_touch on csc_user_templates;
create trigger csc_user_templates_touch
  before update on csc_user_templates
  for each row execute function csc_touch_user_templates();
