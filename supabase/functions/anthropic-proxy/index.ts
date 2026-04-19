import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const RATE_LIMIT_PER_MINUTE = 30;

const kv = await Deno.openKv();
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function verifyUser(jwt: string): Promise<string | null> {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${jwt}`, apikey: SUPABASE_ANON_KEY },
  });
  if (!r.ok) return null;
  const u = await r.json();
  return typeof u?.id === "string" ? u.id : null;
}

async function rateLimit(userId: string): Promise<boolean> {
  const minute = Math.floor(Date.now() / 60_000);
  const key = ["rl", userId, minute];
  const cur = await kv.get<number>(key);
  const next = (cur.value ?? 0) + 1;
  if (next > RATE_LIMIT_PER_MINUTE) return false;
  await kv.set(key, next, { expireIn: 90_000 });
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("method not allowed", { status: 405, headers: cors });

  const auth = req.headers.get("Authorization") ?? "";
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const userId = await verifyUser(jwt);
  if (!userId) {
    return new Response(JSON.stringify({ error: "unauthenticated" }), {
      status: 401, headers: { ...cors, "content-type": "application/json" },
    });
  }
  if (!(await rateLimit(userId))) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429, headers: { ...cors, "content-type": "application/json" },
    });
  }
  const apiKey = Deno.env.get("ANTHROPIC_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "proxy_misconfigured" }), {
      status: 500, headers: { ...cors, "content-type": "application/json" },
    });
  }
  const body = await req.text();
  const upstream = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body,
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { ...cors, "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });
});
