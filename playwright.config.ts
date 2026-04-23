// P11.4 — Playwright configuration for E2E regression-suite.
//
// Installation: `npm install --save-dev @playwright/test`
//               `npx playwright install chromium`  (~100 MB)
// Run:          `npm run test:e2e`
// CI:           .github/workflows/e2e.yml (nightly on main + on PR to main).
//
// Snapshot-Tests: 2D-Canvas via toMatchSnapshot('room-layout.png'),
// 3D-Viewer via rend3r.toDataURL() + PNG-diff mit 2% Toleranz (Anti-
// Aliasing-Drift über Systeme hinweg).

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
