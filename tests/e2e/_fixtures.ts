// E2E test fixtures.
//
// Der Trick in v2.4: index.html hat einen ?e2e=1 URL-Guard (siehe dort am
// Anfang des ersten <script>-Blocks). Alle Tests laden die Seite mit dem
// Query-Parameter, dadurch:
//   - Welcome-Modal #m-welcome öffnet nicht auto
//   - Auth-Modal #m-auth öffnet nicht auto bei fehlendem Token
//   - Login-Gate bleibt unsichtbar
//
// Kein Auth-Bypass in App-Logik. Authentifizierte API-Calls schlagen
// weiterhin 401 fehl — Tests testen UI-State, keine Server-Integration.

import { test as base, expect as baseExpect } from '@playwright/test';

export const test = base.extend<{}>({
  page: async ({ page, baseURL }, use) => {
    page.on('dialog', (d) => d.accept().catch(() => {}));

    // Playwright's baseURL + ?e2e=1 — einmalig beim ersten goto() relevant.
    // Tests die später page.goto('/') oder page.reload() aufrufen müssen
    // den Guard selbst neu setzen (via page.goto(pageWithE2E)). Reload
    // behält URL inkl. Query-String.
    //
    // P15 Cluster 5: waitUntil-Default auf 'domcontentloaded' gesetzt —
    // das 1.18 MB große Logo-PNG in public/assets/ blockiert sonst den
    // load-Event unter paralleler Test-Ausführung lang genug für
    // Test-Timeouts. Für UI-State-Tests reicht DOMContentLoaded: inline
    // Scripts + IIFEs (Planning-Mode-Bootstrap, ?e2e-Guard) sind dann
    // alle gelaufen, nur Images/Fonts noch nicht fertig — was keine
    // unserer Tests prüft.
    const origGoto = page.goto.bind(page);
    page.goto = async (url: string, opts?: Parameters<typeof origGoto>[1]) => {
      if (!url.includes('e2e=')) {
        url = url.includes('?') ? `${url}&e2e=1` : `${url}?e2e=1`;
      }
      return origGoto(url, { waitUntil: 'domcontentloaded', ...opts });
    };

    await use(page);
  },
});

export const expect = baseExpect;
