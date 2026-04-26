/**
 * Stripe-Phase-1 (Mega-Sammel #8) — Pricing-Modal.
 *
 * Phase 1: UI + DB-Update via Supabase REST. Kein echtes Stripe.
 * Phase 2 (eigene Sitzung) wird Stripe-Checkout-Session + Webhook anbinden;
 * Plan-Wechsel ist dann nur via Stripe-Webhook möglich (Anti-Tampering).
 *
 * Modal wird programmatisch erzeugt — kein neuer HTML-Block in index.html
 * nötig (analog conflictResolver/pdfPageSelector).
 */

export type PlanId = 'free' | 'pro' | 'team';

export interface PricingModalDeps {
  /** Aktueller Plan des Users — wird beim Open() vom Caller geladen. */
  currentPlan: PlanId;
  /** Phase 1: symbolisches Plan-Update (Supabase REST PATCH).
   *  Phase 2: Redirect zu Stripe-Checkout-Session. */
  onSelectPlan: (plan: PlanId) => Promise<void>;
  /** Toast für Feedback. */
  toast?: (msg: string, type?: string) => void;
}

interface PlanDef {
  id: PlanId;
  name: string;
  price: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export const PRICING_PLANS: readonly PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    price: '0 €',
    features: ['1 aktives Projekt', 'Lokal-Save', 'Basis-Export', 'Compliance-Live-Check'],
    cta: 'Free starten',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '0 € (Test-Mode)',
    features: [
      'Unbegrenzt Projekte',
      'Cloud-Save + Sync',
      'Bauantrag-PDF',
      'KCanG-Wizard',
      'Priority-Support',
    ],
    cta: 'Pro werden',
    highlight: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: '0 € (Test-Mode)',
    features: [
      'Pro-Features',
      'Multi-User-Kollaboration',
      'Team-Templates',
      'Audit-Log',
      'SLA',
    ],
    cta: 'Team-Plan',
  },
];

const MODAL_ID = 'm-pricing';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPlanCard(plan: PlanDef, isCurrent: boolean): string {
  const borderColor = plan.highlight ? 'var(--gr)' : 'var(--bd)';
  const bgColor = isCurrent ? 'var(--bg2)' : plan.highlight ? 'rgba(74, 222, 128, 0.05)' : 'var(--bg)';
  return (
    '<div class="pricing-card" style="border:2px solid ' +
    borderColor +
    ';background:' +
    bgColor +
    ';border-radius:8px;padding:20px;display:flex;flex-direction:column;gap:10px">' +
    (plan.highlight
      ? '<div style="font-size:10px;color:var(--gr);text-transform:uppercase;letter-spacing:1px;font-weight:700">Empfohlen</div>'
      : '<div style="font-size:10px;color:var(--tx3)">&nbsp;</div>') +
    '<h3 style="margin:0;font-size:18px">' + escapeHtml(plan.name) + '</h3>' +
    '<div style="font-size:24px;font-weight:700;color:var(--tx)">' + escapeHtml(plan.price) + '</div>' +
    '<ul style="list-style:none;padding:0;margin:8px 0;flex:1;font-size:11px;color:var(--tx2)">' +
    plan.features.map((f) => '<li style="padding:3px 0">✓ ' + escapeHtml(f) + '</li>').join('') +
    '</ul>' +
    (isCurrent
      ? '<button class="mdl-btn" disabled style="opacity:0.5;cursor:default">✓ Aktueller Plan</button>'
      : '<button class="mdl-btn ' +
        (plan.highlight ? 'mdl-btn--primary' : '') +
        '" data-plan="' +
        plan.id +
        '">' +
        escapeHtml(plan.cta) +
        '</button>') +
    '</div>'
  );
}

export function openPricingModal(deps: PricingModalDeps): void {
  closePricingModal(); // idempotent
  const overlay = document.createElement('div');
  overlay.id = MODAL_ID;
  overlay.className = 'mdl-overlay';
  overlay.style.cssText =
    'display:flex;align-items:center;justify-content:center;' +
    'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55)';

  const cards = PRICING_PLANS.map((p) => renderPlanCard(p, p.id === deps.currentPlan)).join('');

  overlay.innerHTML =
    '<div class="mdl-dialog" style="max-width:1000px;width:95vw;max-height:85vh;overflow-y:auto;padding:24px;background:var(--bg);border:1px solid var(--bd);border-radius:8px">' +
    '<div style="display:flex;align-items:center;margin-bottom:6px">' +
    '<h2 style="margin:0;font-size:18px;flex:1">💎 Pläne & Preise</h2>' +
    '<button id="pricing-close" class="mdl-btn">✕</button>' +
    '</div>' +
    '<div style="font-size:11px;color:var(--tx2);margin-bottom:16px">' +
    'Aktueller Plan: <b>' +
    escapeHtml(PRICING_PLANS.find((p) => p.id === deps.currentPlan)?.name || deps.currentPlan) +
    '</b>' +
    '</div>' +
    '<div id="pricing-cards" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:14px">' +
    cards +
    '</div>' +
    '<div style="margin-top:14px;padding:10px 12px;background:var(--bg2);border:1px solid var(--bd);border-radius:4px;font-size:10px;color:var(--tx2)">' +
    '<b>Phase 2 (Test-Mode):</b> Stripe-Checkout aktiv, alle Pläne mit 0 € als Test. ' +
    'Pro/Team triggert echten Stripe-Checkout-Flow (Karten-Eingabe optional in Test-Mode). ' +
    'Real-Pricing-Aktivierung später, Infrastruktur ist live.' +
    '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  // Card-Click-Handler
  overlay.querySelectorAll<HTMLButtonElement>('button[data-plan]').forEach((btn) => {
    btn.onclick = async () => {
      const plan = btn.dataset.plan as PlanId;
      const planDef = PRICING_PLANS.find((p) => p.id === plan);
      const confirmMsg = plan === 'free'
        ? 'Auf Free-Plan zurücksetzen?'
        : 'Stripe-Checkout für "' + (planDef?.name || plan) + '" öffnen?\n\n' +
          'Test-Mode: 0 € — Karte ist optional (Test-Karte: 4242 4242 4242 4242).';
      const ok = window.confirm(confirmMsg);
      if (!ok) return;
      btn.disabled = true;
      btn.textContent = plan === 'free' ? '⏳ Wechsle…' : '⏳ Öffne Checkout…';
      try {
        await deps.onSelectPlan(plan);
        if (plan === 'free' && deps.toast) {
          deps.toast('✅ Plan auf "Free" gesetzt', 'g');
          closePricingModal();
        }
        // Bei pro/team führt onSelectPlan einen Redirect aus → kein Toast nötig.
      } catch (e) {
        if (deps.toast) deps.toast('Checkout fehlgeschlagen: ' + (e as Error).message, 'r');
        btn.disabled = false;
        btn.textContent = planDef?.cta || 'Plan wählen';
      }
    };
  });

  const close = overlay.querySelector('#pricing-close') as HTMLButtonElement | null;
  if (close) close.onclick = () => closePricingModal();
}

export function closePricingModal(): void {
  const el = document.getElementById(MODAL_ID);
  if (el) el.remove();
}
