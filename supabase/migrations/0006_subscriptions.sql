-- P9.6: Subscription-Framework — User-Plan-Info in eigener Tabelle.
-- Noch keine Zahlungs-Integration; diese Tabelle ist Vorbereitung für
-- spätere Stripe/Paddle-Anbindung. Der tier-Default 'free' gilt für
-- alle User die KEIN Subscription-Entry haben (impliziter Fallback im Client).

create table if not exists csc_subscriptions (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  tier           text check (tier in ('free','pro','team','enterprise')) default 'free',
  stripe_customer_id   text,
  stripe_subscription_id text,
  current_period_end   timestamptz,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

alter table csc_subscriptions enable row level security;

drop policy if exists "select_own_sub" on csc_subscriptions;
create policy "select_own_sub"
  on csc_subscriptions for select
  using (user_id = auth.uid());

-- Insert/Update NUR via Service-Role (Webhook von Stripe). Keine
-- client-RLS erlaubt das Schreiben — Nutzer kann sich nicht selbst
-- hochstufen.
