// Stripe Phase 2 — Checkout-Session-Endpoint.
//
// Frontend ruft POST mit { plan: 'pro'|'team' } auf, JWT im Authorization-Header.
// Wir verifizieren den User, mappen Plan→PriceId, erstellen eine
// Stripe-Checkout-Session und returnen die `url`. Frontend redirected auf url.

import Stripe from "https://esm.sh/stripe@14";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUCCESS_URL = Deno.env.get("STRIPE_SUCCESS_URL")
  ?? "https://marianacannabis.github.io/csc-raumplaner/?upgraded=true";
const CANCEL_URL = Deno.env.get("STRIPE_CANCEL_URL")
  ?? "https://marianacannabis.github.io/csc-raumplaner/?upgrade_canceled=true";

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function mapPlanToPriceId(plan: string): string | null {
  const map: Record<string, string | undefined> = {
    pro: Deno.env.get("STRIPE_PRICE_PRO"),
    team: Deno.env.get("STRIPE_PRICE_TEAM"),
  };
  return map[plan] ?? null;
}

async function verifyUser(jwt: string): Promise<string | null> {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${jwt}`, apikey: SUPABASE_ANON_KEY },
  });
  if (!r.ok) return null;
  const u = await r.json();
  return typeof u?.id === "string" ? u.id : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: cors });
  }
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) {
    return new Response(JSON.stringify({ error: "missing auth" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  }
  const userId = await verifyUser(jwt);
  if (!userId) {
    return new Response(JSON.stringify({ error: "invalid token" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const { plan } = await req.json().catch(() => ({ plan: null }));
  const priceId = mapPlanToPriceId(plan);
  if (!priceId) {
    return new Response(JSON.stringify({ error: "invalid plan" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL,
      metadata: { user_id: userId },
      subscription_data: { metadata: { user_id: userId } },
    });
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[stripe-checkout]", err);
    return new Response(JSON.stringify({ error: "stripe error" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
