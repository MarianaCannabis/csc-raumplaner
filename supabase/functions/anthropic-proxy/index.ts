// Supabase Edge Function: anthropic-proxy
//
// Server-side proxy that keeps the Anthropic API key out of the browser.
//
// - Verifies the caller's Supabase JWT (auth.uid must exist).
// - Enforces a 30 requests/minute sliding window per authenticated user.
// - Forwards the request body 1:1 to https://api.anthropic.com/v1/messages.
//
// Required secrets (set via `supabase secrets set`):
//   ANTHROPIC_KEY           — Anthropic API key (server-only).
//   SUPABASE_URL            — provided automatically by the platform.
//   SUPABASE_ANON_KEY       — provided automatically by the platform.
//   SUPABASE_SERVICE_ROLE_KEY — provided automatically; unused here but kept
//                              for parity with other functions.
//
// Deploy:   supabase functions deploy anthropic-proxy
// Invoke:   POST {SUPABASE_URL}/functions/v1/anthropic-proxy
//           Headers: Authorization: Bearer <user-jwt>

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

// In-memory sliding-window per-user rate limiter. Edge Function instances are
// short-lived, so this is a best-effort soft limit. Use an external store
// (e.g. Upstash/KV) if you need hard guarantees across instances.
const rateBuckets = new Map<string, number[]>();

function allowRequest(userId: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const bucket = (rateBuckets.get(userId) ?? []).filter((t) => t > cutoff);
  if (bucket.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(userId, bucket);
    return false;
  }
  bucket.push(now);
  rateBuckets.set(userId, bucket);
  return true;
}

function json(status: number, body: unknown, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
      ...extra,
    },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json(405, { error: { message: "Method not allowed" } });
  }

  const anthropicKey = Deno.env.get("ANTHROPIC_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");

  if (!anthropicKey) {
    return json(500, { error: { message: "ANTHROPIC_KEY not configured" } });
  }
  if (!supabaseUrl || !supabaseAnon) {
    return json(500, { error: { message: "Supabase env not configured" } });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json(401, { error: { message: "Missing bearer token" } });
  }

  const sb = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData?.user) {
    return json(401, { error: { message: "Invalid or expired token" } });
  }
  const userId = userData.user.id;

  if (!allowRequest(userId)) {
    return json(
      429,
      { error: { message: "Rate limit exceeded (30 req/min)" } },
      { "Retry-After": "60" },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: { message: "Invalid JSON body" } });
  }

  try {
    const upstream = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json(502, { error: { message: "Upstream error: " + msg } });
  }
});
