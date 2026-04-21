// Shared test fixtures for the E2E suite.
//
// Central Setup, damit jeder Spec-File die gleiche Ausgangs-Situation hat:
//   - Welcome-Modal nicht dazwischenfunken (csc-onboarded=1)
//   - Cookie-Banner weg (csc-cookie-dismissed=1)
//   - Optional: UI-Mode + Planning-Mode reset pro Spec
//
// Usage in einem spec-file:
//   import { test, expect } from './_fixtures.js';
//   test('…', async ({ page }) => { … });
//
// Das base-`test` aus @playwright/test wird erweitert um einen beforeEach,
// der die localStorage-Flags VOR dem ersten Paint setzt (addInitScript
// läuft bei jedem navigation-event, inkl. page.goto).

import { test as base, expect as baseExpect } from '@playwright/test';

export const test = base.extend<{}>({
  page: async ({ page }, use) => {
    // Alle Dialoge (confirm) akzeptieren, damit Mode-Switch + Invite-Flows
    // nicht hängenbleiben.
    page.on('dialog', (d) => d.accept().catch(() => {}));

    // Vor dem ersten goto: Onboarding-Flags setzen + Mode-State bereinigen.
    await page.addInitScript(() => {
      try {
        localStorage.setItem('csc-onboarded', '1');
        localStorage.setItem('csc-cookie-dismissed', '1');
        localStorage.setItem('csc-walk-tutorial-seen', '1');
        localStorage.setItem('csc-welcome-never', '1');
        // Mode-State zurücksetzen, damit Tests immer bei Default-Standard starten.
        localStorage.removeItem('csc-ui-mode');
        localStorage.removeItem('csc-planning-mode');
        localStorage.removeItem('csc-mode-hint-seen');
      } catch {}
    });

    await use(page);
  },
});

export const expect = baseExpect;
