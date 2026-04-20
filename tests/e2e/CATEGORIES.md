# E2E Test-Kategorien (Plan)

Playwright-E2E-Suite für P10.1. Aktuell als **Skeleton** dokumentiert — echte Installation + CI-Integration kommt in v2.1, da Browser-Binaries (~100 MB) + headless-Setup den Standard-CI-Workflow signifikant verlangsamt.

## Kategorien

| Kategorie | Spec-File | Happy-Path | Edge-Cases |
|---|---|---|---|
| Auth | `auth.spec.ts` | Magic-Link-Login | Expired token auto-refresh, Logout |
| Räume | `rooms.spec.ts` | Raum zeichnen + umbenennen | Überlappende Räume, Multi-floor |
| Objekte | `objects.spec.ts` | Aus Katalog platzieren | Zero-dims-Fallback (P7), Custom-color |
| Flächen | `grounds.spec.ts` | Material wählen + zeichnen | Rotation, Tint |
| Cloud | `cloud.spec.ts` | Save + Load | 401-Retry, Image-Size-Warn |
| Export | `export.spec.ts` | DXF + CSV + IFC | PDF-Preview, GLTF-Viewer |
| KI | `ai.spec.ts` | Template via KI | Ctrl+K, Context-Prompt |
| Compliance | `compliance.spec.ts` | >500 Members → rot | maxHeight, POI |
| Templates | `templates.spec.ts` | Mari-Jane laden | User-Template-CRUD |
| Teams | `teams.spec.ts` | Create + Invite | Join via ?team=, Roles |
| Walk | `walk.spec.ts` | WASD Pos-Change | Wall-Collision, Exit |

## Install

```bash
npm install --save-dev @playwright/test
npx playwright install chromium firefox webkit
```

Separater CI-Workflow `.github/workflows/e2e.yml` nur auf release-Branches.

## Snapshot-Tests

- 2D: `canvas.screenshot() → toMatchSnapshot('room-layout.png')`
- 3D: `rend3.domElement.toDataURL()` → PNG-compare
- Tolerance 2% (Anti-Aliasing-Drift)
