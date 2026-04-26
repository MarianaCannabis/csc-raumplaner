// Stripe Phase 2 — Webhook-Endpoint mit Signature-Verification.
//
// Empfängt customer.subscription.{created,updated,deleted}-Events von Stripe,
// upserted in csc_subscriptions via SERVICE_ROLE_KEY (RLS-Bypass).
//
// User-Action für Setup: siehe docs/STRIPE-SETUP.md
//   - STRIPE_SECRET_KEY
//   - STRIPE_WEBHOOK_SECRET
//   - STRIPE_PRICE_FREE / _PRO / _TEAM
//   - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (auto)
//
// Stripe-Webhook-URL in Stripe-Dashboard:
//   https://wvkjkdwahsqozeupoxpj.supabase.co/functions/v1/stripe-webhook

import Stripe from "https://esm.sh/stripe@14";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export function mapPriceIdToPlan(priceId?: string): "free" | "pro" | "team" {
  const map: Record<string, "free" | "pro" | "team"> = {};
  const free = Deno.env.get("STRIPE_PRICE_FREE");
  const pro = Deno.env.get("STRIPE_PRICE_PRO");
  const team = Deno.env.get("STRIPE_PRICE_TEAM");
  if (free) map[free] = "free";
  if (pro) map[pro] = "pro";
  if (team) map[team] = "team";
  return map[priceId ?? ""] ?? "free";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body, sig ?? "", STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.warn("[stripe-webhook] signature verify failed", err);
    return new Response("Signature verification failed", { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = (sub.metadata as Record<string, string>)?.user_id;
        if (!userId) {
          console.warn("[stripe-webhook] sub without user_id metadata", sub.id);
          break;
        }
        const priceId = sub.items.data[0]?.price.id;
        const plan = mapPriceIdToPlan(priceId);
        await supabase.from("csc_subscriptions").upsert({
          user_id: userId,
          plan,
          status: sub.status,
          stripe_customer_id: sub.customer as string,
          stripe_subscription_id: sub.id,
          stripe_price_id: priceId,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }, { onConflict: "user_id" });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase.from("csc_subscriptions").update({
          status: "canceled",
          plan: "free",
        }).eq("stripe_subscription_id", sub.id);
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook] handler error", err);
    return new Response("handler error", { status: 500 });
  }

  return new Response("ok");
});
