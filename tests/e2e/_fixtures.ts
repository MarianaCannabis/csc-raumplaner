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
    const origGoto = page.goto.bind(page);
    page.goto = async (url: string, opts?: Parameters<typeof origGoto>[1]) => {
      // Wenn url relative + kein ?e2e drin: anhängen
      if (!url.includes('e2e=')) {
        url = url.includes('?') ? `${url}&e2e=1` : `${url}?e2e=1`;
      }
      return origGoto(url, opts);
    };

    await use(page);
  },
});

export const expect = baseExpect;
