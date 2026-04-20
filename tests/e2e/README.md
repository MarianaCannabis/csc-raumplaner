# E2E Test Skeleton

Playwright E2E-Tests sind als Nächstes geplant. Dieser Ordner ist ein
Skeleton — der Playwright-Install (+ ~100 MB Browser-Binaries) würde
die npm-install-Zeit in CI signifikant verlängern und lokal spezielle
Setup-Steps brauchen (`npx playwright install chromium`).

**Geplante Coverage:**
- `login.spec.ts` — Magic-Link mit Mock
- `create-project.spec.ts` — Template laden + Cloud-Save
- `compliance.spec.ts` — Mitgliederzahl > 500 → Regel rot

**Setup wenn aktiviert:**
```bash
npm install --save-dev @playwright/test
npx playwright install chromium
npm run e2e
```

Mit separatem CI-Job `.github/workflows/e2e.yml` der nur bei
release-Branches läuft — nicht bei jedem PR, zu schwer.
