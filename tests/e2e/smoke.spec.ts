// P11.4 + P16 + fix/e2e-green — Smoke test: App-Boot, Brand, keine Console-Errors.
// _fixtures.ts setzt csc-onboarded damit das Welcome-Modal nicht blockiert.
import { test, expect } from './_fixtures.js';

test('app boots and shows topbar', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    // Die Fake-JWT im Test-Fixture (tests/e2e/_fixtures.ts) löst erwartete
    // 401s von Supabase aus. Diese Netzwerk-Fehler zählen nicht als App-Bug.
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/401|Failed to load resource/i.test(text)) return;
    errors.push(text);
  });

  await page.goto('/');
  await expect(page.locator('#topbar')).toBeVisible();
  await expect(page.locator('.logo')).toContainText('CSC');
  // P16: verify rebrand — the logo should say "Studio Pro" not "Raumplaner"
  await expect(page.locator('.logo em')).toContainText('Studio Pro');
  expect(errors, `unexpected runtime errors: ${errors.join(' | ')}`).toEqual([]);
});

test('page title is CSC Studio Pro', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/CSC Studio Pro/);
});

test('main app container renders', async ({ page }) => {
  await page.goto('/');
  // dismissOverlays läuft nicht für diesen Test — wir wollen sehen,
  // dass #app UND eines der Overlays gerendert sind (Login-Gate ODER App).
  // Im e2e-Setup ist login-gate ausgeblendet, #app sollte da sein.
  await expect(page.locator('#app')).toBeAttached();
});
