/**
 * Stripe-Phase-1 (Mega-Sammel #9) — Subscription-Persistenz.
 *
 * REST-Wrapper um csc_subscriptions-Tabelle. Phase 1: User schreibt direkt
 * (RLS owner_upd). Phase 2 wird das auf service_role-only umstellen, sodass
 * nur Stripe-Webhook ändern darf — diese Module bleiben dann lese-only.
 */

import type { CloudContext, RefreshFn } from './cloudProjects.js';

export type PlanId = 'free' | 'pro' | 'team';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Subscription {
  id?: string;
  user_id: string;
  plan: PlanId;
  status: SubscriptionStatus;
  current_period_end?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
}

function buildHeaders(ctx: CloudContext, extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: ctx.key,
    Authorization: 'Bearer ' + (ctx.token || ctx.key),
    ...extra,
  };
}

/**
 * Lädt die Subscription des angemeldeten Users. Returnt null wenn kein
 * Eintrag (= 'free' Default).
 */
export async function fetchSubscription(
  ctx: CloudContext,
  userId: string,
  fetchFn: typeof fetch = fetch,
): Promise<Subscription | null> {
  const url =
    ctx.url +
    '/rest/v1/csc_subscriptions?user_id=eq.' +
    encodeURIComponent(userId) +
    '&select=*';
  const r = await fetchFn(url, { headers: buildHeaders(ctx) });
  if (!r.ok) {
    if (r.status === 404 || r.status === 406) return null;
    throw new Error('fetchSubscription HTTP ' + r.status);
  }
  const rows = await r.json();
  return Array.isArray(rows) && rows[0] ? (rows[0] as Subscription) : null;
}

/**
 * Setzt den Plan des Users (Phase 1: symbolisch). Upsert: existiert kein
 * Eintrag → INSERT. Existiert → UPDATE.
 *
 * Phase 2 wird das deprecated und User können nur via Stripe-Checkout
 * umsteigen.
 */
export async function setUserPlan(
  ctx: CloudContext,
  userId: string,
  plan: PlanId,
  refresh?: RefreshFn,
  fetchFn: typeof fetch = fetch,
): Promise<void> {
  // Erst checken ob Eintrag existiert
  const existing = await fetchSubscription(ctx, userId, fetchFn);
  const headers = buildHeaders(ctx, {
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  });
  if (existing) {
    const r = await fetchFn(
      ctx.url + '/rest/v1/csc_subscriptions?user_id=eq.' + encodeURIComponent(userId),
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ plan }),
      },
    );
    if (r.status === 401 && refresh) {
      const newToken = await refresh();
      if (newToken) {
        const ctx2 = { ...ctx, token: newToken };
        const r2 = await fetchFn(
          ctx2.url + '/rest/v1/csc_subscriptions?user_id=eq.' + encodeURIComponent(userId),
          {
            method: 'PATCH',
            headers: buildHeaders(ctx2, {
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            }),
            body: JSON.stringify({ plan }),
          },
        );
        if (!r2.ok && r2.status !== 204) {
          throw new Error('setUserPlan PATCH HTTP ' + r2.status);
        }
        return;
      }
    }
    if (!r.ok && r.status !== 204) {
      throw new Error('setUserPlan PATCH HTTP ' + r.status);
    }
    return;
  }
  // INSERT
  const r = await fetchFn(ctx.url + '/rest/v1/csc_subscriptions', {
    method: 'POST',
    headers,
    body: JSON.stringify({ user_id: userId, plan, status: 'active' }),
  });
  if (!r.ok && r.status !== 201 && r.status !== 204) {
    throw new Error('setUserPlan POST HTTP ' + r.status);
  }
}

/**
 * Plan-Lookup für UI-Display. Returnt 'free' wenn kein Eintrag.
 */
export async function getCurrentPlan(
  ctx: CloudContext,
  userId: string,
  fetchFn: typeof fetch = fetch,
): Promise<PlanId> {
  const sub = await fetchSubscription(ctx, userId, fetchFn);
  return sub?.plan ?? 'free';
}
