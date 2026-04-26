# Stripe Phase 2 — Setup-Anleitung

> **TL;DR:** Stripe-Test-Mode-Account anlegen, 3 Products mit 0€-Prices, Webhook-Endpoint im Stripe-Dashboard registrieren, Edge-Function-Secrets in Supabase setzen.

## 0. Migration 0012 anwenden

Vor Stripe-Setup: `supabase/migrations/0012_subscriptions_stripe.sql` im Supabase SQL-Editor ausführen. Migration ist idempotent (mehrfaches Apply harmlos).

## 1. Stripe-Account (Test-Mode reicht)

1. https://dashboard.stripe.com → Test-Mode aktivieren (Toggle oben rechts)
2. Products → Add Product, dreimal:
   - **Free** — Recurring, 0 €/Monat
   - **Pro** — Recurring, 0 €/Monat (später Live-Pricing aktivierbar)
   - **Team** — Recurring, 0 €/Monat
3. Price-IDs notieren (Format `price_...`):
   - `STRIPE_PRICE_FREE`
   - `STRIPE_PRICE_PRO`
   - `STRIPE_PRICE_TEAM`
4. Developers → API keys → **Secret key** notieren (Format `sk_test_...`)

## 2. Webhook in Stripe-Dashboard

Developers → Webhooks → Add endpoint:

- **URL:** `https://wvkjkdwahsqozeupoxpj.supabase.co/functions/v1/stripe-webhook`
- **Events:**
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- **Webhook-Signing-Secret** notieren (Format `whsec_...`).

## 3. Supabase-Edge-Function-Secrets

Supabase-Dashboard → Project Settings → Edge Functions → Manage secrets:

| Secret | Wert |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` aus Schritt 1.4 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` aus Schritt 2 |
| `STRIPE_PRICE_FREE` | `price_...` aus Schritt 1.3 |
| `STRIPE_PRICE_PRO` | `price_...` aus Schritt 1.3 |
| `STRIPE_PRICE_TEAM` | `price_...` aus Schritt 1.3 |
| `STRIPE_SUCCESS_URL` *(optional)* | Default: GitHub-Pages-URL mit `?upgraded=true` |
| `STRIPE_CANCEL_URL` *(optional)* | Default: GitHub-Pages-URL mit `?upgrade_canceled=true` |

`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` und `SUPABASE_ANON_KEY` sind automatisch verfügbar.

## 4. Edge-Functions deployen

Supabase-CLI lokal:

```bash
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy stripe-checkout
```

`stripe-webhook` braucht `--no-verify-jwt`, da Stripe selbst kein Supabase-JWT mitschickt (eigene Signature-Verification via `STRIPE_WEBHOOK_SECRET`).

`stripe-checkout` benötigt User-JWT — Standard-Verify aktiv.

## 5. Smoke-Test

1. App öffnen → Login → Topbar-Hilfe-Menu → "💎 Plan & Preise"
2. **Pro werden** klicken → Confirm-Dialog bestätigen
3. Browser redirected zu Stripe-Checkout (Test-Mode-Banner sichtbar)
4. Test-Karte eingeben: `4242 4242 4242 4242`, beliebiges Zukunftsdatum, beliebige CVC
5. Nach Submit: Redirect zur App mit `?upgraded=true` → Toast "🎉 Upgrade erfolgreich!"
6. Stripe-Dashboard → Customers → Eintrag mit metadata.user_id
7. Stripe-Dashboard → Webhooks → Last events grün
8. Supabase → Table Editor → csc_subscriptions → Eintrag mit plan='pro', status='active'

## 6. Live-Pricing aktivieren (später)

Wenn echte Preise gewünscht: Stripe-Dashboard → Live-Mode aktivieren → Products mit echten Preisen anlegen → neue Price-IDs in Edge-Function-Secrets setzen → Webhook neu konfigurieren mit Live-Endpoint. Code-Änderung am Frontend/Backend nicht nötig.
