-- Stripe Phase 2 (Roadmap v3.0 #4 — Phase 2): RLS-Hardening + Stripe-IDs.
--
-- Phase 1 hatte csc_subscriptions mit owner_upd-Policy: User durfte selbst
-- den Plan setzen (symbolisch). Phase 2 stellt das auf service_role um, sodass
-- nur die stripe-webhook Edge-Function (mit SERVICE_ROLE_KEY) Plan/Status
-- ändern kann. Anti-Tampering: User soll Pro nicht ohne Zahlung setzen.
--
-- Idempotent: ALTER TABLE ADD COLUMN IF NOT EXISTS, DROP POLICY IF EXISTS,
-- CREATE POLICY (eindeutige Namen).

BEGIN;

-- Stripe-spezifische Felder ergänzen — csc_subscriptions hat schon
-- stripe_customer_id + stripe_subscription_id aus Migration 0011.
-- Phase 2 ergänzt stripe_price_id (für Plan-Mapping & historisches Tracking)
-- und metadata jsonb (für free-form Stripe-Webhook-Payloads).
ALTER TABLE csc_subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id text;
ALTER TABLE csc_subscriptions ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- RLS-Policy-Update: UPDATE jetzt nur via service_role (Webhook).
-- INSERT bleibt für authenticated (User legt Free-Subscription beim ersten
-- Login an — das passiert via REST mit user-token, nicht im Webhook).
-- SELECT bleibt für authenticated (eigene Subscription lesen für Plan-Anzeige).

DROP POLICY IF EXISTS "csc_subscriptions_owner_upd" ON csc_subscriptions;
DROP POLICY IF EXISTS "csc_subscriptions_service_upd" ON csc_subscriptions;

CREATE POLICY "csc_subscriptions_service_upd" ON csc_subscriptions
  FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);

-- DELETE bleibt nicht erlaubt (Subscriptions werden nur via Stripe-Webhook
-- → status='canceled' UPDATE oder via auth.users-CASCADE entfernt).

COMMIT;

NOTIFY pgrst, 'reload schema';
