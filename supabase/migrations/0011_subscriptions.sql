-- Stripe-Subscription-Schema (Mega-Sammel #7-9 / Roadmap v3.0 #4 — Phase 1).
--
-- Phase 1: nur DB-Schema + UI für Plan-Wechsel.
-- Phase 2 (eigene Sitzung): Stripe-API + Checkout-Session + Webhook-Endpoint.
--
-- Idempotent: alle Statements mit IF NOT EXISTS / DROP POLICY IF EXISTS /
-- DROP TRIGGER IF EXISTS. Doppeltes Apply harmlos.
--
-- Reused functions:
--   - set_updated_at() — aus Migration 0002
--   - inc_version_on_update() — aus Migration 0009

BEGIN;

CREATE TABLE IF NOT EXISTS csc_subscriptions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan            text        NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'team')),
  status          text        NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id      text,         -- Phase 2 von Stripe gefüllt
  stripe_subscription_id  text,         -- Phase 2 von Stripe gefüllt
  current_period_end      timestamptz,  -- Phase 2 für Renewal-Tracking
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  version         integer     NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS csc_subscriptions_user_idx ON csc_subscriptions(user_id);

ALTER TABLE csc_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "csc_subscriptions_owner_sel" ON csc_subscriptions;
DROP POLICY IF EXISTS "csc_subscriptions_owner_ins" ON csc_subscriptions;
DROP POLICY IF EXISTS "csc_subscriptions_owner_upd" ON csc_subscriptions;

CREATE POLICY "csc_subscriptions_owner_sel" ON csc_subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "csc_subscriptions_owner_ins" ON csc_subscriptions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- UPDATE: Phase 1 erlaubt User-Self-Update (symbolisches Plan-Wechseln).
-- Phase 2 wird das auf service_role umstellen, sodass nur der Stripe-Webhook
-- ändern darf (Anti-Tampering — User soll Pro nicht ohne Zahlung setzen).
CREATE POLICY "csc_subscriptions_owner_upd" ON csc_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
-- Kein DELETE-Policy: Subscriptions werden nur via Stripe-Webhook (Phase 2)
-- oder via auth.users-CASCADE (Account-Löschung) entfernt.

DROP TRIGGER IF EXISTS csc_subscriptions_set_updated_at ON csc_subscriptions;
CREATE TRIGGER csc_subscriptions_set_updated_at
  BEFORE UPDATE ON csc_subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS csc_subscriptions_inc_version ON csc_subscriptions;
CREATE TRIGGER csc_subscriptions_inc_version
  BEFORE UPDATE ON csc_subscriptions
  FOR EACH ROW EXECUTE FUNCTION inc_version_on_update();

COMMIT;

NOTIFY pgrst, 'reload schema';
