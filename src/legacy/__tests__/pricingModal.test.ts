import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  openPricingModal,
  closePricingModal,
  PRICING_PLANS,
  type PricingModalDeps,
} from '../pricingModal.js';

const mkDeps = (overrides: Partial<PricingModalDeps> = {}): PricingModalDeps => ({
  currentPlan: 'free',
  onSelectPlan: vi.fn().mockResolvedValue(undefined),
  toast: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  document.body.innerHTML = '';
  // confirm-Dialog auto-accepted
  window.confirm = vi.fn(() => true);
});

describe('openPricingModal', () => {
  it('rendert 3 Plan-Cards', () => {
    openPricingModal(mkDeps());
    const cards = document.querySelectorAll('.pricing-card');
    expect(cards.length).toBe(3);
  });

  it('Modal-ID = m-pricing', () => {
    openPricingModal(mkDeps());
    expect(document.getElementById('m-pricing')).not.toBeNull();
  });

  it('currentPlan-Card hat disabled-Button mit "Aktueller Plan"', () => {
    openPricingModal(mkDeps({ currentPlan: 'pro' }));
    const cards = document.querySelectorAll('.pricing-card');
    // Pro ist 2. Card (Index 1)
    const proCard = cards[1] as HTMLElement;
    const btn = proCard.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toContain('Aktueller');
  });

  it('Phase-2-Hinweis-Banner sichtbar (Test-Mode)', () => {
    openPricingModal(mkDeps());
    const html = document.getElementById('m-pricing')!.innerHTML;
    expect(html).toContain('Phase 2');
    expect(html).toContain('Test-Mode');
  });

  it('Plan-Wechsel-Click auf "free" ruft onSelectPlan + toast', async () => {
    const deps = mkDeps({ currentPlan: 'pro' });
    openPricingModal(deps);
    const freeBtn = document.querySelector('button[data-plan="free"]') as HTMLButtonElement;
    freeBtn.click();
    await new Promise((r) => setTimeout(r, 50));
    expect(deps.onSelectPlan).toHaveBeenCalledWith('free');
    expect(deps.toast).toHaveBeenCalledWith(expect.stringContaining('Free'), 'g');
  });

  it('Plan-Wechsel-Click auf "pro" ruft onSelectPlan ohne Toast (Redirect erwartet)', async () => {
    const deps = mkDeps({ currentPlan: 'free' });
    openPricingModal(deps);
    const proBtn = document.querySelector('button[data-plan="pro"]') as HTMLButtonElement;
    proBtn.click();
    await new Promise((r) => setTimeout(r, 50));
    expect(deps.onSelectPlan).toHaveBeenCalledWith('pro');
    // Pro-Plan: kein Toast (Redirect-Pfad), nur onSelectPlan-Call.
    const toastCalls = (deps.toast as ReturnType<typeof vi.fn>).mock.calls;
    const successToast = toastCalls.find((c) => c[1] === 'g');
    expect(successToast).toBeUndefined();
  });

  it('User-Cancel im confirm: kein onSelectPlan', () => {
    window.confirm = vi.fn(() => false);
    const deps = mkDeps();
    openPricingModal(deps);
    (document.querySelector('button[data-plan="pro"]') as HTMLButtonElement).click();
    expect(deps.onSelectPlan).not.toHaveBeenCalled();
  });

  it('onSelectPlan-Fail: Button wieder enabled + toast', async () => {
    const deps = mkDeps({
      onSelectPlan: vi.fn().mockRejectedValue(new Error('Network down')),
    });
    openPricingModal(deps);
    const proBtn = document.querySelector('button[data-plan="pro"]') as HTMLButtonElement;
    proBtn.click();
    await new Promise((r) => setTimeout(r, 50));
    expect(deps.toast).toHaveBeenCalledWith(expect.stringContaining('fehlgeschlagen'), 'r');
    expect(proBtn.disabled).toBe(false);
  });

  it('Close-Button schließt Modal', () => {
    openPricingModal(mkDeps());
    (document.getElementById('pricing-close') as HTMLButtonElement).click();
    expect(document.getElementById('m-pricing')).toBeNull();
  });

  it('doppelter open: ersetzt vorhandenes Modal', () => {
    openPricingModal(mkDeps({ currentPlan: 'free' }));
    openPricingModal(mkDeps({ currentPlan: 'pro' }));
    const overlays = document.querySelectorAll('#m-pricing');
    expect(overlays.length).toBe(1);
  });
});

describe('PRICING_PLANS-Konstante', () => {
  it('hat 3 Pläne free/pro/team', () => {
    expect(PRICING_PLANS.length).toBe(3);
    const ids = PRICING_PLANS.map((p) => p.id);
    expect(ids).toEqual(['free', 'pro', 'team']);
  });

  it('Pro ist als highlight markiert', () => {
    const pro = PRICING_PLANS.find((p) => p.id === 'pro');
    expect(pro?.highlight).toBe(true);
  });

  it('alle Pläne haben mindestens 3 Features', () => {
    for (const p of PRICING_PLANS) {
      expect(p.features.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('closePricingModal', () => {
  it('idempotent', () => {
    expect(() => closePricingModal()).not.toThrow();
    openPricingModal(mkDeps());
    closePricingModal();
    closePricingModal();
    expect(document.getElementById('m-pricing')).toBeNull();
  });
});
