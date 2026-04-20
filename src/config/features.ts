// P9.6 — Feature-Flag + Subscription-Framework.
//
// Kein Billing angebunden; das ist bewusst als Vorbereitung. Der tier
// wird aus (a) auth.users.app_metadata.tier gelesen (Supabase-Admin-
// Setting) oder (b) aus csc_subscriptions-Tabelle — beide zurzeit
// manuell; späterer Stripe-Webhook-Pfad schreibt in csc_subscriptions.

export type UserTier = 'free' | 'pro' | 'team' | 'enterprise';

export interface TierLimits {
  projects: number;            // max gespeicherte Projekte
  aiCallsPerMonth: number;     // KI-Quota
  customTemplates: number;     // max eigene Vorlagen
  teamSize: number;            // max Team-Members
  cloudStorageMB: number;      // pro Account
  exportsPerDay: number;       // DXF/IFC/PDF-Exports
  imageMapMB: number;          // Total embedded images per project
}

export const PLANS: Record<UserTier, TierLimits & { label: string; priceEurMonth: number }> = {
  free:       { label: 'Free',       priceEurMonth: 0,    projects: 3,        aiCallsPerMonth: 50,    customTemplates: 1,   teamSize: 1,    cloudStorageMB: 50,    exportsPerDay: 10,   imageMapMB: 5 },
  pro:        { label: 'Pro',        priceEurMonth: 15,   projects: 50,       aiCallsPerMonth: 500,   customTemplates: 50,  teamSize: 1,    cloudStorageMB: 500,   exportsPerDay: 100,  imageMapMB: 50 },
  team:       { label: 'Team',       priceEurMonth: 49,   projects: 500,      aiCallsPerMonth: 2000,  customTemplates: 500, teamSize: 10,   cloudStorageMB: 2048,  exportsPerDay: 1000, imageMapMB: 200 },
  enterprise: { label: 'Enterprise', priceEurMonth: -1,   projects: Infinity, aiCallsPerMonth: Infinity, customTemplates: Infinity, teamSize: Infinity, cloudStorageMB: Infinity, exportsPerDay: Infinity, imageMapMB: Infinity },
};

// Tier aus SB_USER oder Default. SB_USER wird aus dem Legacy-Code
// gelesen (window-Global) — sonst Default 'free'.
export function userTier(): UserTier {
  try {
    const u = (window as unknown as { SB_USER?: { app_metadata?: { tier?: UserTier } } }).SB_USER;
    const t = u?.app_metadata?.tier;
    if (t && ['free', 'pro', 'team', 'enterprise'].includes(t)) return t;
  } catch (e) {}
  return 'free';
}

export function currentLimits(): TierLimits {
  return PLANS[userTier()];
}

// Deklarative Feature-Checks. Usage:
//   if (hasFeature('customTemplates')) { … }
//   if (!hasFeature('ai')) showUpgrade();
export function hasFeature(feature: 'ai' | 'customTemplates' | 'teams' | 'export' | 'imageUpload' | 'realtimeCollab'): boolean {
  const t = userTier();
  switch (feature) {
    case 'ai':              return currentLimits().aiCallsPerMonth > 0;
    case 'customTemplates': return currentLimits().customTemplates > 0;
    case 'teams':           return t !== 'free';
    case 'export':          return true; // alle Tiers
    case 'imageUpload':     return true;
    case 'realtimeCollab':  return t === 'team' || t === 'enterprise';
    default:                return false;
  }
}

// Limit-Enforcement: gibt true zurück wenn unter Limit; sonst zeigt
// einen Toast + returnt false. UI-Code nutzt das als Gate.
export function checkLimit(feature: keyof TierLimits, currentValue: number): boolean {
  const limit = currentLimits()[feature];
  if (currentValue < limit) return true;
  const label = PLANS[userTier()].label;
  const msg = '🔒 Limit erreicht (' + label + '-Plan: ' + (limit === Infinity ? '∞' : limit) +
    '). Upgrade für mehr.';
  try { (window as unknown as { toast?: (t: string, k: string) => void }).toast?.(msg, 'r'); } catch (e) {}
  return false;
}
