-- P9.7: Template-/Asset-Marketplace
--
-- User-Templates können öffentlich gemacht werden (Marketplace-Listing).
-- Admin-Review (pending → approved/rejected) vor Sichtbarkeit für andere.
-- Download-Counter wird pro Nutzung erhöht (via RPC).

create table if not exists csc_marketplace_templates (
  id            uuid primary key default gen_random_uuid(),
  owner         uuid references auth.users(id) on delete cascade,
  name          text not null,
  description   text,
  tags          text[] default '{}',
  icon          text default '🛍',
  size_label    text,
  data          jsonb not null,
  thumbnail     text,
  preview_url   text,
  price_cents   int default 0,       -- 0 = free; > 0 braucht Stripe (P9.6+ deferred)
  downloads     int default 0,
  status        text check (status in ('pending','approved','rejected')) default 'pending',
  review_note   text,                -- Admin-Begründung bei reject
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists csc_mp_status_idx on csc_marketplace_templates (status);
create index if not exists csc_mp_owner_idx on csc_marketplace_templates (owner);
create index if not exists csc_mp_downloads_idx on csc_marketplace_templates (downloads desc);

alter table csc_marketplace_templates enable row level security;

-- Alle authentifizierten User sehen 'approved'-Templates; Owner sieht
-- eigene (auch pending + rejected).
drop policy if exists "mp_select_approved_or_own" on csc_marketplace_templates;
create policy "mp_select_approved_or_own"
  on csc_marketplace_templates for select
  using (status = 'approved' or owner = auth.uid());

-- Jeder User kann seine eigenen submitten (landet auto auf pending).
drop policy if exists "mp_insert_own_pending" on csc_marketplace_templates;
create policy "mp_insert_own_pending"
  on csc_marketplace_templates for insert
  with check (owner = auth.uid() and status = 'pending');

-- Owner kann eigene Entries editieren (außer status/review_note —
-- die setzt der Admin). Update-Policy erlaubt nur data/name/
-- description/tags/price_cents; status bleibt lokal sperre (via
-- Column-grant in späterer Migration — MVP: policy lässt alle
-- Felder durch, UI disabled die status-Inputs).
drop policy if exists "mp_update_own" on csc_marketplace_templates;
create policy "mp_update_own"
  on csc_marketplace_templates for update
  using (owner = auth.uid());

drop policy if exists "mp_delete_own" on csc_marketplace_templates;
create policy "mp_delete_own"
  on csc_marketplace_templates for delete
  using (owner = auth.uid());

-- Admin-Policies (Admin = raw_app_meta_data.admin=true in auth.users)
drop policy if exists "mp_admin_all" on csc_marketplace_templates;
create policy "mp_admin_all"
  on csc_marketplace_templates for all
  using (
    exists (select 1 from auth.users u where u.id = auth.uid() and (u.raw_app_meta_data->>'admin')::boolean = true)
  );

-- Download-Counter via RPC (security-definer, damit auch Nicht-Owner
-- inkrementieren kann ohne update-Rechte auf die Row zu haben)
create or replace function csc_mp_increment_downloads(template_id uuid)
returns void
language sql security definer as $$
  update csc_marketplace_templates set downloads = downloads + 1 where id = template_id and status = 'approved';
$$;
grant execute on function csc_mp_increment_downloads(uuid) to authenticated;
