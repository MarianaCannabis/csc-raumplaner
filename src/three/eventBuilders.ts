// P5.1 — Event-Katalog-Builder (~110 Items über 11 Kategorien).
//
// Jeder Builder ist kompakt und erkennbar, nicht hyperdetailliert — Fokus
// liegt auf Proportion + Material, damit ein Catwalk als Catwalk lesbar
// ist und ein Mischpult als Mischpult. PBR-Materialien aus
// ./materials.js; keine neuen Texturen.
//
// Konvention: Group-Ursprung wie in build3DObj (x=0/z=0 Zentrum, y=0
// Boden). Alle Meshes werden via addMeshes() als cast/receive-shadow
// markiert.

import {
  Group,
  Mesh,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  TorusGeometry,
  PlaneGeometry,
  ConeGeometry,
  DoubleSide,
} from 'three';
import {
  matWood,
  matMetal,
  matFabric,
  matPlastic,
  matGlassPhys,
  matLED,
  matConcrete,
  matLeather,
} from './materials.js';

function addMeshes(g: Group, meshes: Mesh[]): Group {
  for (const m of meshes) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
  return g;
}

// =============================================================================
// 1. BÜHNE & PODIUM
// =============================================================================

export function buildStageModule(w: number, d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new BoxGeometry(w, 0.05, d), matWood(0x3a2a1a));
  top.position.y = h - 0.025;
  const skirt = new Mesh(new BoxGeometry(w, h - 0.05, d), matFabric(0x222222));
  skirt.position.y = (h - 0.05) / 2;
  // Corner legs
  const legMat = matMetal(0x444444);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = new Mesh(new BoxGeometry(0.05, h - 0.05, 0.05), legMat);
    leg.position.set(sx * (w / 2 - 0.03), (h - 0.05) / 2, sz * (d / 2 - 0.03));
    g.add(leg);
  }
  return addMeshes(g, [top, skirt]);
}

export function buildStageStep(w: number, d: number, h: number): Group {
  const g = new Group();
  const steps = 3;
  const stepH = h / steps;
  const stepD = d / steps;
  for (let i = 0; i < steps; i++) {
    const s = new Mesh(new BoxGeometry(w, stepH, stepD), matWood(0x3a2a1a));
    s.position.set(0, stepH / 2 + i * stepH, -d / 2 + stepD / 2 + i * stepD);
    g.add(s);
  }
  return addMeshes(g, []);
}

export function buildStageRamp(w: number, d: number, h: number): Group {
  const g = new Group();
  const ramp = new Mesh(new BoxGeometry(w, 0.04, d), matWood(0x3a2a1a));
  ramp.position.y = h / 2;
  ramp.rotation.x = -Math.atan(h / d);
  g.add(ramp);
  const sideL = new Mesh(new BoxGeometry(0.03, h, d), matMetal(0x333333));
  sideL.position.set(-w / 2, h / 2 - 0.02, 0);
  const sideR = sideL.clone();
  sideR.position.x = w / 2;
  return addMeshes(g, [ramp, sideL, sideR]);
}

export function buildStageCorner(w: number, d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new BoxGeometry(w, 0.05, d), matWood(0x3a2a1a));
  top.position.y = h - 0.025;
  const skirt1 = new Mesh(new BoxGeometry(w, h - 0.05, 0.03), matFabric(0x222222));
  skirt1.position.set(0, (h - 0.05) / 2, d / 2);
  const skirt2 = new Mesh(new BoxGeometry(0.03, h - 0.05, d), matFabric(0x222222));
  skirt2.position.set(w / 2, (h - 0.05) / 2, 0);
  return addMeshes(g, [top, skirt1, skirt2]);
}

export function buildStageSkirt(w: number, d: number, h: number): Group {
  const g = new Group();
  const skirt = new Mesh(new PlaneGeometry(w, h), matFabric(0x111111));
  skirt.material.side = DoubleSide;
  skirt.position.set(0, h / 2, d / 2);
  const rod = new Mesh(new CylinderGeometry(0.01, 0.01, w, 6), matMetal(0x555555));
  rod.rotation.z = Math.PI / 2;
  rod.position.set(0, h, d / 2);
  return addMeshes(g, [skirt, rod]);
}

export function buildStageRailGuard(w: number, d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new CylinderGeometry(0.015, 0.015, w, 8), matMetal(0xaaaaaa));
  top.rotation.z = Math.PI / 2;
  top.position.y = h;
  const mid = top.clone();
  mid.position.y = h * 0.5;
  for (let i = 0; i <= 3; i++) {
    const x = -w / 2 + (i * w) / 3;
    const post = new Mesh(new CylinderGeometry(0.02, 0.02, h, 8), matMetal(0xaaaaaa));
    post.position.set(x, h / 2, 0);
    g.add(post);
  }
  return addMeshes(g, [top, mid]);
}

export function buildCatwalk(w: number, d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new BoxGeometry(w, 0.06, d), matWood(0xffffff));
  top.position.y = h - 0.03;
  const skirt = new Mesh(new BoxGeometry(w, h - 0.06, d), matFabric(0x111111));
  skirt.position.y = (h - 0.06) / 2;
  // LED strip front
  const led = new Mesh(new BoxGeometry(w * 0.96, 0.02, 0.02), matLED(0xffffff));
  led.position.set(0, h - 0.08, d / 2 - 0.01);
  return addMeshes(g, [top, skirt, led]);
}

export function buildDrape(w: number, d: number, h: number): Group {
  const g = new Group();
  const drape = new Mesh(new PlaneGeometry(w, h), matFabric(0x0a0a0a));
  drape.material.side = DoubleSide;
  drape.position.y = h / 2;
  const rod = new Mesh(new CylinderGeometry(0.02, 0.02, w + 0.1, 8), matMetal(0x666666));
  rod.rotation.z = Math.PI / 2;
  rod.position.y = h;
  return addMeshes(g, [drape, rod]);
}

export function buildRostrumXL(w: number, d: number, h: number): Group {
  const g = new Group();
  const tier1 = new Mesh(new BoxGeometry(w, h * 0.33, d), matWood(0x3a2a1a));
  tier1.position.y = (h * 0.33) / 2;
  const tier2 = new Mesh(new BoxGeometry(w * 0.7, h * 0.33, d * 0.7), matWood(0x3a2a1a));
  tier2.position.y = h * 0.33 + (h * 0.33) / 2;
  const tier3 = new Mesh(new BoxGeometry(w * 0.45, h * 0.34, d * 0.45), matWood(0x3a2a1a));
  tier3.position.y = h * 0.66 + (h * 0.34) / 2;
  return addMeshes(g, [tier1, tier2, tier3]);
}

export function buildSideBlind(w: number, d: number, h: number): Group {
  const g = new Group();
  const panel = new Mesh(new BoxGeometry(w, h, d), matFabric(0x202020));
  panel.position.y = h / 2;
  const frame = new Mesh(new BoxGeometry(w + 0.04, 0.02, d + 0.04), matMetal(0x333333));
  frame.position.y = h;
  return addMeshes(g, [panel, frame]);
}

// =============================================================================
// 2. BESTUHLUNG & TISCHE
// =============================================================================

function _chairBase(seatW: number, seatD: number, seatH: number, backH: number, col: number, mat: (c?: number) => Mesh['material']): Group {
  const g = new Group();
  const seat = new Mesh(new BoxGeometry(seatW, 0.06, seatD), mat(col));
  seat.position.y = seatH;
  const back = new Mesh(new BoxGeometry(seatW, backH, 0.05), mat(col));
  back.position.set(0, seatH + backH / 2, -seatD / 2 + 0.025);
  const legMat = matMetal(0x444444);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = new Mesh(new BoxGeometry(0.03, seatH, 0.03), legMat);
    leg.position.set(sx * (seatW / 2 - 0.03), seatH / 2, sz * (seatD / 2 - 0.03));
    g.add(leg);
  }
  return addMeshes(g, [seat, back]);
}

export function buildRowChair(w: number, d: number, h: number): Group {
  return _chairBase(w, d, 0.45, h - 0.45, 0x1a1a1a, matFabric);
}
export function buildConfChair(w: number, d: number, h: number): Group {
  return _chairBase(w, d, 0.45, h - 0.45, 0x333355, matFabric);
}
export function buildArmchairEvent(w: number, d: number, h: number): Group {
  const g = _chairBase(w, d, 0.40, h - 0.40, 0x6b2a2a, matLeather);
  // armrests
  const arm = new Mesh(new BoxGeometry(0.04, 0.2, d * 0.8), matLeather(0x6b2a2a));
  arm.position.set(-w / 2 + 0.02, 0.55, 0);
  const armR = arm.clone();
  armR.position.x = w / 2 - 0.02;
  g.add(arm, armR);
  return g;
}
export function buildFoldingChair(w: number, d: number, h: number): Group {
  const g = new Group();
  const seat = new Mesh(new BoxGeometry(w, 0.03, d), matPlastic(0xdddddd));
  seat.position.y = 0.45;
  const back = new Mesh(new BoxGeometry(w, 0.4, 0.03), matPlastic(0xdddddd));
  back.position.set(0, 0.65, -d / 2 + 0.02);
  for (const sx of [-1, 1]) {
    const leg = new Mesh(new CylinderGeometry(0.015, 0.015, 0.45, 6), matMetal(0x888888));
    leg.position.set(sx * (w / 2 - 0.04), 0.225, 0);
    g.add(leg);
  }
  return addMeshes(g, [seat, back]);
}
export function buildBarstoolHigh(w: number, _d: number, h: number): Group {
  const g = new Group();
  const seat = new Mesh(new CylinderGeometry(w / 2, w / 2, 0.05, 16), matLeather(0x111111));
  seat.position.y = h - 0.025;
  const pole = new Mesh(new CylinderGeometry(0.025, 0.025, h - 0.05, 8), matMetal(0x888888));
  pole.position.y = (h - 0.05) / 2;
  const base = new Mesh(new CylinderGeometry(w * 0.35, w * 0.4, 0.03, 16), matMetal(0x555555));
  base.position.y = 0.015;
  return addMeshes(g, [seat, pole, base]);
}
function _tableWith4Legs(w: number, d: number, h: number, topCol: number, topMat: (c?: number) => Mesh['material']): Group {
  const g = new Group();
  const top = new Mesh(new BoxGeometry(w, 0.035, d), topMat(topCol));
  top.position.y = h - 0.018;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = new Mesh(new BoxGeometry(0.04, h - 0.035, 0.04), matMetal(0x555555));
    leg.position.set(sx * (w / 2 - 0.06), (h - 0.035) / 2, sz * (d / 2 - 0.06));
    g.add(leg);
  }
  return addMeshes(g, [top]);
}
export function buildBanquetTable(w: number, d: number, h: number): Group {
  const g = _tableWith4Legs(w, d, h, 0xffffff, matFabric);
  // skirt cloth
  const skirt = new Mesh(new PlaneGeometry(w, h - 0.03), matFabric(0xffffff));
  skirt.material.side = DoubleSide;
  skirt.position.set(0, (h - 0.03) / 2, d / 2 - 0.01);
  g.add(skirt);
  return g;
}
export function buildLoungeTable(w: number, d: number, h: number): Group {
  return _tableWith4Legs(w, d, h, 0x333333, matWood);
}
export function buildRoundTable6p(w: number, _d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new CylinderGeometry(w / 2, w / 2, 0.04, 32), matWood(0xc8a572));
  top.position.y = h - 0.02;
  const pole = new Mesh(new CylinderGeometry(0.04, 0.04, h - 0.04, 8), matMetal(0x555555));
  pole.position.y = (h - 0.04) / 2;
  const base = new Mesh(new CylinderGeometry(w * 0.25, w * 0.3, 0.03, 16), matMetal(0x444444));
  base.position.y = 0.015;
  return addMeshes(g, [top, pole, base]);
}
export function buildCateringHighTable(w: number, _d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new CylinderGeometry(w / 2, w / 2, 0.03, 24), matPlastic(0xeeeeee));
  top.position.y = h - 0.015;
  const pole = new Mesh(new CylinderGeometry(0.035, 0.035, h - 0.03, 8), matMetal(0x888888));
  pole.position.y = (h - 0.03) / 2;
  const base = new Mesh(new CylinderGeometry(w * 0.4, w * 0.45, 0.04, 16), matMetal(0x555555));
  base.position.y = 0.02;
  // Stretch cover (typical bistro-style)
  const cover = new Mesh(new CylinderGeometry(w / 2 * 1.02, w / 2 * 0.6, h - 0.03, 16, 1, true), matFabric(0x222244));
  cover.material.side = DoubleSide;
  cover.position.y = (h - 0.03) / 2;
  return addMeshes(g, [top, pole, base, cover]);
}
export function buildFoldingTable(w: number, d: number, h: number): Group {
  return _tableWith4Legs(w, d, h, 0xdddddd, matPlastic);
}
export function buildBistroTable(w: number, _d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new CylinderGeometry(w / 2, w / 2, 0.03, 24), matMetal(0x666666));
  top.position.y = h - 0.015;
  const pole = new Mesh(new CylinderGeometry(0.025, 0.025, h - 0.03, 8), matMetal(0x444444));
  pole.position.y = (h - 0.03) / 2;
  const foot = new Mesh(new CylinderGeometry(w * 0.35, w * 0.38, 0.025, 16), matMetal(0x444444));
  foot.position.y = 0.0125;
  return addMeshes(g, [top, pole, foot]);
}

// =============================================================================
// 3. TECHNIK & MEDIEN
// =============================================================================

export function buildProjectorStand(w: number, d: number, h: number): Group {
  const g = new Group();
  const proj = new Mesh(new BoxGeometry(w * 0.7, 0.15, d * 0.7), matPlastic(0x111111));
  proj.position.y = h - 0.075;
  const lens = new Mesh(new CylinderGeometry(0.05, 0.05, 0.05, 16), matGlassPhys(0x446688));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, h - 0.075, d / 2 - 0.02);
  const stand = new Mesh(new CylinderGeometry(0.025, 0.025, h - 0.15, 8), matMetal(0x444444));
  stand.position.y = (h - 0.15) / 2;
  const base = new Mesh(new CylinderGeometry(0.25, 0.25, 0.03, 16), matMetal(0x333333));
  base.position.y = 0.015;
  return addMeshes(g, [proj, lens, stand, base]);
}
export function buildProjectionScreenLarge(w: number, d: number, h: number): Group {
  const g = new Group();
  const screen = new Mesh(new PlaneGeometry(w, h * 0.85), matPlastic(0xffffff));
  screen.material.side = DoubleSide;
  screen.position.y = h / 2 + h * 0.05;
  const frame = new Mesh(new BoxGeometry(w + 0.04, 0.03, 0.04), matMetal(0x333333));
  frame.position.set(0, h, 0);
  const legMat = matMetal(0x333333);
  for (const sx of [-1, 1]) {
    const post = new Mesh(new BoxGeometry(0.04, h, 0.04), legMat);
    post.position.set(sx * w / 2, h / 2, 0);
    const foot = new Mesh(new BoxGeometry(0.04, 0.04, d), legMat);
    foot.position.set(sx * w / 2, 0.02, 0);
    g.add(post, foot);
  }
  return addMeshes(g, [screen, frame]);
}
export function buildMobileLedWall(w: number, d: number, h: number): Group {
  const g = new Group();
  const cabinet = new Mesh(new BoxGeometry(w, h, d), matMetal(0x1a1a1a));
  cabinet.position.y = h / 2;
  const display = new Mesh(new PlaneGeometry(w * 0.98, h * 0.94), matLED(0x3344aa));
  display.position.set(0, h / 2, d / 2 + 0.001);
  return addMeshes(g, [cabinet, display]);
}
export function buildVideoPillar(w: number, d: number, h: number): Group {
  const g = new Group();
  const pillar = new Mesh(new BoxGeometry(w, h, d), matMetal(0x222222));
  pillar.position.y = h / 2;
  const display = new Mesh(new PlaneGeometry(w * 0.9, h * 0.55), matLED(0x4477cc));
  display.position.set(0, h * 0.6, d / 2 + 0.001);
  return addMeshes(g, [pillar, display]);
}
export function buildTouchscreenKiosk(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.65, d), matMetal(0xaaaaaa));
  body.position.y = h * 0.65 / 2;
  const screen = new Mesh(new BoxGeometry(w * 0.9, h * 0.35, 0.04), matPlastic(0x111111));
  screen.position.set(0, h * 0.65 + h * 0.35 / 2, 0);
  screen.rotation.x = -0.3;
  const disp = new Mesh(new PlaneGeometry(w * 0.85, h * 0.3), matLED(0x225588));
  disp.position.copy(screen.position);
  disp.position.z += 0.03;
  disp.rotation.x = -0.3;
  return addMeshes(g, [body, screen, disp]);
}
export function buildTranslatorBooth(w: number, d: number, h: number): Group {
  const g = new Group();
  const walls = new Mesh(new BoxGeometry(w, h, d), matFabric(0x222233));
  walls.position.y = h / 2;
  const window_ = new Mesh(new PlaneGeometry(w * 0.7, h * 0.3), matGlassPhys(0x88ccff));
  window_.position.set(0, h * 0.6, d / 2 + 0.001);
  const roof = new Mesh(new BoxGeometry(w + 0.05, 0.04, d + 0.05), matMetal(0x555555));
  roof.position.y = h;
  return addMeshes(g, [walls, window_, roof]);
}
export function buildFMDesk(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h - 0.05, d), matMetal(0x222222));
  body.position.y = (h - 0.05) / 2;
  const top = new Mesh(new BoxGeometry(w, 0.05, d), matPlastic(0x444444));
  top.position.y = h - 0.025;
  // LED strip on front lip
  const led = new Mesh(new BoxGeometry(w * 0.9, 0.015, 0.015), matLED(0xff4400));
  led.position.set(0, h * 0.4, d / 2 - 0.005);
  return addMeshes(g, [body, top, led]);
}
export function buildCableRamp(w: number, d: number, h: number): Group {
  const g = new Group();
  const ramp = new Mesh(new BoxGeometry(w, h, d), matPlastic(0xffcc00));
  ramp.position.y = h / 2;
  // Cable channels (visible strips)
  for (let i = -1; i <= 1; i++) {
    const stripe = new Mesh(new BoxGeometry(w * 0.8, 0.005, 0.01), matPlastic(0x111111));
    stripe.position.set(0, h - 0.003, i * d * 0.25);
    g.add(stripe);
  }
  return addMeshes(g, [ramp]);
}
export function buildControlDesk(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0x2a2a2a));
  body.position.y = h / 2;
  const monBack = new Mesh(new BoxGeometry(w * 0.8, 0.35, 0.02), matPlastic(0x111111));
  monBack.position.set(0, h + 0.2, -d / 2 + 0.2);
  const monDisp = new Mesh(new PlaneGeometry(w * 0.75, 0.3), matLED(0x2266aa));
  monDisp.position.set(0, h + 0.2, -d / 2 + 0.21);
  return addMeshes(g, [body, monBack, monDisp]);
}
export function buildTrussSquare(w: number, d: number, h: number): Group {
  const g = new Group();
  const trussMat = matMetal(0xbbbbbb);
  // 4 verticals
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const bar = new Mesh(new CylinderGeometry(0.04, 0.04, h, 6), trussMat);
    bar.position.set(sx * (w / 2 - 0.04), h / 2, sz * (d / 2 - 0.04));
    g.add(bar);
  }
  // Horizontal top
  const topBar = new Mesh(new CylinderGeometry(0.04, 0.04, w - 0.08, 6), trussMat);
  topBar.rotation.z = Math.PI / 2;
  topBar.position.set(0, h, 0);
  return addMeshes(g, [topBar]);
}

// =============================================================================
// 4. LICHT & EFFEKTE
// =============================================================================

export function buildMovingHead(w: number, d: number, h: number): Group {
  const g = new Group();
  const base = new Mesh(new BoxGeometry(w, h * 0.45, d), matMetal(0x111111));
  base.position.y = h * 0.45 / 2;
  const yoke = new Mesh(new TorusGeometry(w * 0.35, 0.03, 6, 16), matMetal(0x222222));
  yoke.position.y = h * 0.6;
  const head = new Mesh(new CylinderGeometry(w * 0.25, w * 0.25, h * 0.4, 16), matMetal(0x111111));
  head.rotation.z = Math.PI / 2;
  head.position.y = h * 0.8;
  const lens = new Mesh(new CylinderGeometry(w * 0.2, w * 0.2, 0.02, 16), matLED(0xffffaa));
  lens.rotation.z = Math.PI / 2;
  lens.position.set(w * 0.2, h * 0.8, 0);
  return addMeshes(g, [base, yoke, head, lens]);
}
export function buildParLight(w: number, d: number, h: number): Group {
  const g = new Group();
  const can = new Mesh(new CylinderGeometry(w / 2, w / 2, d, 16), matMetal(0x222222));
  can.rotation.x = Math.PI / 2;
  can.position.y = h * 0.6;
  const lens = new Mesh(new CylinderGeometry(w / 2 * 0.95, w / 2 * 0.95, 0.02, 16), matLED(0xffee88));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, h * 0.6, d / 2 - 0.005);
  const yoke = new Mesh(new TorusGeometry(w * 0.4, 0.015, 4, 12), matMetal(0x333333));
  yoke.position.y = h * 0.6;
  const stand = new Mesh(new CylinderGeometry(0.015, 0.015, h * 0.6, 6), matMetal(0x555555));
  stand.position.y = h * 0.3;
  return addMeshes(g, [can, lens, yoke, stand]);
}
export function buildLedBar(w: number, d: number, h: number): Group {
  const g = new Group();
  const bar = new Mesh(new BoxGeometry(w, h * 0.2, d), matMetal(0x111111));
  bar.position.y = h - h * 0.1;
  const led = new Mesh(new BoxGeometry(w * 0.96, h * 0.16, 0.01), matLED(0x44aaff));
  led.position.set(0, h - h * 0.1, d / 2 - 0.005);
  const stand = new Mesh(new CylinderGeometry(0.015, 0.015, h * 0.8, 6), matMetal(0x555555));
  stand.position.y = h * 0.4;
  return addMeshes(g, [bar, led, stand]);
}
export function buildStrobe(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0xffffff));
  body.position.y = h / 2;
  const lens = new Mesh(new PlaneGeometry(w * 0.85, h * 0.7), matLED(0xffffff));
  lens.position.set(0, h / 2, d / 2 + 0.001);
  return addMeshes(g, [body, lens]);
}
export function buildFogMachine(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.7, d), matMetal(0x111111));
  body.position.y = h * 0.7 / 2;
  const nozzle = new Mesh(new CylinderGeometry(w * 0.15, w * 0.2, h * 0.2, 12), matMetal(0x333333));
  nozzle.rotation.x = Math.PI / 2;
  nozzle.position.set(0, h * 0.5, d / 2);
  const cable = new Mesh(new CylinderGeometry(0.01, 0.01, h * 0.3, 6), matPlastic(0x111111));
  cable.position.set(w * 0.3, h * 0.85, -d * 0.3);
  return addMeshes(g, [body, nozzle, cable]);
}
export function buildConfettiCannon(w: number, _d: number, h: number): Group {
  const g = new Group();
  const tube = new Mesh(new CylinderGeometry(w / 2, w / 2 * 0.9, h, 12), matMetal(0x888888));
  tube.position.y = h / 2;
  const base = new Mesh(new CylinderGeometry(w * 0.7, w * 0.75, 0.04, 16), matMetal(0x333333));
  base.position.y = 0.02;
  const trigger = new Mesh(new BoxGeometry(w * 0.15, 0.05, 0.03), matPlastic(0xff0000));
  trigger.position.set(w * 0.4, h * 0.1, 0);
  return addMeshes(g, [tube, base, trigger]);
}
export function buildBeamer(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.65, d), matPlastic(0x222222));
  body.position.y = h - h * 0.65 / 2;
  const lens = new Mesh(new CylinderGeometry(w * 0.18, w * 0.18, 0.04, 16), matGlassPhys(0x446688));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, h - h * 0.3, d / 2 - 0.02);
  const mount = new Mesh(new BoxGeometry(w * 0.4, 0.04, d * 0.4), matMetal(0x444444));
  mount.position.y = h - h * 0.65 - 0.02;
  return addMeshes(g, [body, lens, mount]);
}
export function buildFollowSpot(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new CylinderGeometry(w / 2 * 0.6, w / 2 * 0.7, d * 1.3, 16), matMetal(0x222222));
  body.rotation.z = Math.PI / 2;
  body.position.y = h * 0.7;
  const tripod1 = new Mesh(new CylinderGeometry(0.015, 0.015, h * 0.7, 6), matMetal(0x555555));
  tripod1.position.set(-w * 0.25, h * 0.35, d * 0.15);
  tripod1.rotation.z = 0.3;
  const tripod2 = tripod1.clone();
  tripod2.position.x = w * 0.25;
  tripod2.rotation.z = -0.3;
  const tripod3 = new Mesh(new CylinderGeometry(0.015, 0.015, h * 0.7, 6), matMetal(0x555555));
  tripod3.position.set(0, h * 0.35, -d * 0.25);
  tripod3.rotation.x = 0.3;
  return addMeshes(g, [body, tripod1, tripod2, tripod3]);
}
export function buildHazer(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.8, d), matMetal(0x444444));
  body.position.y = h * 0.8 / 2;
  const grille = new Mesh(new PlaneGeometry(w * 0.7, h * 0.3), matMetal(0x222222));
  grille.position.set(0, h * 0.4, d / 2 + 0.001);
  return addMeshes(g, [body, grille]);
}
export function buildUvBar(w: number, d: number, h: number): Group {
  const g = new Group();
  const bar = new Mesh(new BoxGeometry(w, h * 0.25, d), matMetal(0x111111));
  bar.position.y = h * 0.6;
  const lens = new Mesh(new BoxGeometry(w * 0.95, h * 0.2, 0.01), matLED(0x8844ff));
  lens.position.set(0, h * 0.6, d / 2 - 0.005);
  const stand = new Mesh(new CylinderGeometry(0.015, 0.015, h * 0.6, 6), matMetal(0x555555));
  stand.position.y = h * 0.3;
  return addMeshes(g, [bar, lens, stand]);
}

// =============================================================================
// 5. BESCHALLUNG
// =============================================================================

export function buildLineArrayElement(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x111111));
  body.position.y = h / 2;
  // Driver holes
  for (let i = 0; i < 2; i++) {
    const drv = new Mesh(new CylinderGeometry(w * 0.12, w * 0.12, 0.015, 12), matMetal(0x222222));
    drv.rotation.x = Math.PI / 2;
    drv.position.set(0, h * (0.25 + i * 0.4), d / 2 - 0.01);
    g.add(drv);
  }
  return addMeshes(g, [body]);
}
export function buildSubwoofer(w: number, d: number, h: number): Group {
  const g = new Group();
  const box = new Mesh(new BoxGeometry(w, h, d), matWood(0x111111));
  box.position.y = h / 2;
  const driver = new Mesh(new CylinderGeometry(w * 0.35, w * 0.35, 0.03, 24), matPlastic(0x1a1a1a));
  driver.rotation.x = Math.PI / 2;
  driver.position.set(0, h / 2, d / 2 - 0.015);
  const dust = new Mesh(new SphereGeometry(w * 0.12, 12, 10), matPlastic(0x333333));
  dust.position.set(0, h / 2, d / 2 + 0.01);
  return addMeshes(g, [box, driver, dust]);
}
export function buildFloorMonitor(w: number, d: number, h: number): Group {
  const g = new Group();
  const box = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x111111));
  box.rotation.x = -0.3;
  box.position.y = h * 0.55;
  const driver = new Mesh(new CylinderGeometry(w * 0.3, w * 0.3, 0.02, 16), matMetal(0x222222));
  driver.position.set(0, h * 0.55, 0);
  driver.rotation.x = Math.PI / 2 - 0.3;
  return addMeshes(g, [box, driver]);
}
export function buildMicStand(w: number, _d: number, h: number): Group {
  const g = new Group();
  const pole = new Mesh(new CylinderGeometry(0.012, 0.012, h * 0.85, 8), matMetal(0x222222));
  pole.position.y = h * 0.85 / 2 + 0.01;
  const base = new Mesh(new CylinderGeometry(w / 2, w / 2, 0.02, 16), matMetal(0x111111));
  base.position.y = 0.01;
  // Boom arm
  const boom = new Mesh(new CylinderGeometry(0.01, 0.01, w * 1.3, 6), matMetal(0x222222));
  boom.rotation.z = 0.4;
  boom.position.set(w * 0.25, h * 0.8, 0);
  const mic = new Mesh(new CylinderGeometry(0.02, 0.025, 0.1, 12), matMetal(0x111111));
  mic.position.set(w * 0.6, h * 0.9, 0);
  return addMeshes(g, [pole, base, boom, mic]);
}
export function buildMicHandheld(w: number, _d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new CylinderGeometry(w * 0.2, w * 0.25, h * 0.7, 12), matMetal(0x111111));
  body.position.y = h * 0.35;
  const head = new Mesh(new SphereGeometry(w * 0.25, 16, 12), matMetal(0x222222));
  head.position.y = h * 0.85;
  return addMeshes(g, [body, head]);
}
export function buildHeadsetMic(w: number, _d: number, h: number): Group {
  const g = new Group();
  const band = new Mesh(new TorusGeometry(w * 0.8, 0.015, 4, 16, Math.PI), matPlastic(0x222222));
  band.rotation.x = Math.PI / 2;
  band.position.y = h * 0.8;
  const boom = new Mesh(new CylinderGeometry(0.008, 0.008, h * 0.4, 6), matPlastic(0x222222));
  boom.position.set(w * 0.5, h * 0.5, 0);
  boom.rotation.z = -0.3;
  const mic = new Mesh(new SphereGeometry(0.015, 8, 6), matMetal(0x333333));
  mic.position.set(w * 0.65, h * 0.3, 0);
  return addMeshes(g, [band, boom, mic]);
}
export function buildMixerConsole(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.3, d), matMetal(0x222222));
  body.position.y = h * 0.15;
  const sloped = new Mesh(new BoxGeometry(w, h * 0.35, d * 0.8), matMetal(0x2a2a2a));
  sloped.rotation.x = -0.15;
  sloped.position.y = h * 0.45;
  // LED row
  const led = new Mesh(new BoxGeometry(w * 0.8, 0.02, 0.015), matLED(0x00aaff));
  led.position.set(0, h * 0.55, 0);
  return addMeshes(g, [body, sloped, led]);
}
export function buildWirelessRack(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0x222222));
  body.position.y = h / 2;
  for (let i = 0; i < 4; i++) {
    const unit = new Mesh(new BoxGeometry(w * 0.9, h * 0.18, 0.005), matMetal(0x1a1a1a));
    unit.position.set(0, 0.08 + i * (h * 0.22), d / 2 + 0.003);
    const led = new Mesh(new BoxGeometry(0.02, 0.01, 0.005), matLED(0x00ff44));
    led.position.set(w * 0.4, 0.08 + i * (h * 0.22), d / 2 + 0.006);
    g.add(unit, led);
  }
  return addMeshes(g, [body]);
}
export function buildSpeakerStand(w: number, _d: number, h: number): Group {
  const g = new Group();
  const pole = new Mesh(new CylinderGeometry(0.02, 0.02, h, 8), matMetal(0x222222));
  pole.position.y = h / 2;
  // Tripod feet
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const foot = new Mesh(new CylinderGeometry(0.015, 0.015, w * 0.5, 6), matMetal(0x222222));
    foot.position.set(Math.cos(a) * w * 0.2, h * 0.05, Math.sin(a) * w * 0.2);
    foot.rotation.z = Math.cos(a) * 0.4;
    foot.rotation.x = Math.sin(a) * 0.4;
    g.add(foot);
  }
  return addMeshes(g, [pole]);
}
export function buildActiveColumn(w: number, d: number, h: number): Group {
  const g = new Group();
  const base = new Mesh(new BoxGeometry(w, h * 0.15, d), matPlastic(0x111111));
  base.position.y = h * 0.075;
  const col = new Mesh(new CylinderGeometry(w * 0.15, w * 0.15, h * 0.85, 16), matPlastic(0x111111));
  col.position.y = h * 0.15 + (h * 0.85) / 2;
  return addMeshes(g, [base, col]);
}

// =============================================================================
// 6. CATERING & SERVICE
// =============================================================================

export function buildChafingDish(w: number, d: number, h: number): Group {
  const g = new Group();
  const frame = new Mesh(new BoxGeometry(w, 0.03, d), matMetal(0xcccccc));
  frame.position.y = h - 0.15;
  const pan = new Mesh(new BoxGeometry(w * 0.92, h * 0.4, d * 0.92), matMetal(0xaaaaaa));
  pan.position.y = h - 0.2;
  const lid = new Mesh(new BoxGeometry(w * 0.95, 0.05, d * 0.95), matMetal(0xbbbbbb));
  lid.position.y = h - 0.02;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = new Mesh(new CylinderGeometry(0.01, 0.01, h - 0.2, 6), matMetal(0x888888));
    leg.position.set(sx * (w / 2 - 0.04), (h - 0.2) / 2, sz * (d / 2 - 0.04));
    g.add(leg);
  }
  return addMeshes(g, [frame, pan, lid]);
}
export function buildCoffeeStation(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.75, d), matMetal(0xaaaaaa));
  body.position.y = h * 0.75 / 2;
  const boiler = new Mesh(new CylinderGeometry(w * 0.35, w * 0.35, h * 0.25, 16), matMetal(0x888888));
  boiler.position.y = h * 0.75 + h * 0.25 / 2;
  const spout = new Mesh(new CylinderGeometry(0.015, 0.015, 0.04, 8), matMetal(0x444444));
  spout.position.set(0, h * 0.5, d / 2 + 0.02);
  spout.rotation.x = Math.PI / 2;
  return addMeshes(g, [body, boiler, spout]);
}
export function buildJuiceDispenser(w: number, d: number, h: number): Group {
  const g = new Group();
  const base = new Mesh(new BoxGeometry(w, h * 0.2, d), matPlastic(0x222222));
  base.position.y = h * 0.1;
  const tank = new Mesh(new BoxGeometry(w * 0.85, h * 0.75, d * 0.85), matGlassPhys(0xffffaa));
  tank.position.y = h * 0.2 + (h * 0.75) / 2;
  const tap = new Mesh(new CylinderGeometry(0.015, 0.015, 0.03, 8), matMetal(0x333333));
  tap.position.set(0, h * 0.15, d / 2 + 0.015);
  tap.rotation.x = Math.PI / 2;
  return addMeshes(g, [base, tank, tap]);
}
export function buildDishTrolley(w: number, d: number, h: number): Group {
  const g = new Group();
  for (let i = 0; i < 3; i++) {
    const shelf = new Mesh(new BoxGeometry(w, 0.02, d), matMetal(0xcccccc));
    shelf.position.y = 0.1 + i * (h - 0.1) / 3;
    g.add(shelf);
  }
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const post = new Mesh(new CylinderGeometry(0.015, 0.015, h - 0.1, 6), matMetal(0x888888));
    post.position.set(sx * (w / 2 - 0.03), (h - 0.1) / 2 + 0.1, sz * (d / 2 - 0.03));
    const wheel = new Mesh(new CylinderGeometry(0.04, 0.04, 0.02, 12), matPlastic(0x222222));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(sx * (w / 2 - 0.03), 0.04, sz * (d / 2 - 0.03));
    g.add(post, wheel);
  }
  return addMeshes(g, []);
}
export function buildTrayCart(w: number, d: number, h: number): Group {
  return buildDishTrolley(w, d, h); // same geometry with different sizes
}
export function buildServingCounter(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matWood(0xc8a572));
  body.position.y = h / 2;
  const top = new Mesh(new BoxGeometry(w + 0.04, 0.04, d + 0.04), matConcrete(0x888888));
  top.position.y = h + 0.02;
  const sneeze = new Mesh(new PlaneGeometry(w, h * 0.3), matGlassPhys(0xccddff));
  sneeze.material.side = DoubleSide;
  sneeze.position.set(0, h + h * 0.3 / 2, -d / 2 + 0.1);
  sneeze.rotation.x = -0.2;
  return addMeshes(g, [body, top, sneeze]);
}
export function buildIceMachine(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0xcccccc));
  body.position.y = h / 2;
  const grille = new Mesh(new PlaneGeometry(w * 0.6, h * 0.25), matMetal(0x666666));
  grille.position.set(0, h * 0.2, d / 2 + 0.001);
  const panel = new Mesh(new PlaneGeometry(w * 0.8, h * 0.15), matPlastic(0x111111));
  panel.position.set(0, h * 0.75, d / 2 + 0.001);
  return addMeshes(g, [body, grille, panel]);
}
export function buildBuffetTable(w: number, d: number, h: number): Group {
  const g = _tableWith4Legs(w, d, h, 0xffffff, matFabric);
  // skirt all around
  for (const sign of [1, -1]) {
    const skirt = new Mesh(new PlaneGeometry(w, h - 0.03), matFabric(0xffffff));
    skirt.material.side = DoubleSide;
    skirt.position.set(0, (h - 0.03) / 2, sign * (d / 2 - 0.01));
    if (sign < 0) skirt.rotation.y = Math.PI;
    g.add(skirt);
  }
  return g;
}
export function buildDessertStand(w: number, _d: number, h: number): Group {
  const g = new Group();
  for (let i = 0; i < 3; i++) {
    const r = w * (0.5 - i * 0.15);
    const tier = new Mesh(new CylinderGeometry(r, r, 0.02, 24), matGlassPhys(0xffffff));
    tier.position.y = 0.1 + i * (h - 0.1) / 3;
    g.add(tier);
  }
  const post = new Mesh(new CylinderGeometry(0.02, 0.02, h, 8), matMetal(0x999999));
  post.position.y = h / 2;
  return addMeshes(g, [post]);
}
export function buildPunchBowl(w: number, _d: number, h: number): Group {
  const g = new Group();
  const bowl = new Mesh(new SphereGeometry(w / 2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), matGlassPhys(0xffffff));
  bowl.position.y = h * 0.6;
  const base = new Mesh(new CylinderGeometry(w * 0.3, w * 0.4, h * 0.25, 12), matMetal(0xaaaaaa));
  base.position.y = h * 0.125;
  const liquid = new Mesh(new CylinderGeometry(w * 0.4, w * 0.4, 0.04, 24), matGlassPhys(0xff6677));
  liquid.position.y = h * 0.7;
  return addMeshes(g, [bowl, base, liquid]);
}

// =============================================================================
// 7. DEKORATION
// =============================================================================

export function buildTallPlant(w: number, d: number, h: number): Group {
  const g = new Group();
  const pot = new Mesh(new CylinderGeometry(w / 2 * 0.7, w / 2 * 0.85, h * 0.25, 16), matConcrete(0xaaaaaa));
  pot.position.y = h * 0.125;
  const trunk = new Mesh(new CylinderGeometry(0.03, 0.04, h * 0.6, 8), matWood(0x5a3a1a));
  trunk.position.y = h * 0.25 + h * 0.3;
  const foliage = new Mesh(new SphereGeometry(w * 0.55, 12, 10), matFabric(0x2a6a3a));
  foliage.position.y = h * 0.85;
  return addMeshes(g, [pot, trunk, foliage]);
}
export function buildPartitionPanel(w: number, d: number, h: number): Group {
  const g = new Group();
  const panel = new Mesh(new BoxGeometry(w, h, d), matFabric(0xeeeeee));
  panel.position.y = h / 2;
  const frame = new Mesh(new BoxGeometry(w + 0.04, 0.05, d + 0.04), matMetal(0x555555));
  frame.position.y = h;
  const frameB = frame.clone();
  frameB.position.y = 0.02;
  return addMeshes(g, [panel, frame, frameB]);
}
export function buildArtworkSet(w: number, d: number, h: number): Group {
  const g = new Group();
  for (let i = 0; i < 3; i++) {
    const frame = new Mesh(new BoxGeometry(w * 0.28, h * 0.7, d), matWood(0x222222));
    frame.position.set(-w * 0.35 + i * w * 0.35, h / 2, 0);
    const canvas = new Mesh(new PlaneGeometry(w * 0.24, h * 0.6), matFabric([0xff6666, 0x66aaff, 0xffcc44][i % 3]));
    canvas.position.set(-w * 0.35 + i * w * 0.35, h / 2, d / 2 + 0.001);
    g.add(frame, canvas);
  }
  return addMeshes(g, []);
}
export function buildBalloonBouquet(w: number, _d: number, h: number): Group {
  const g = new Group();
  const colors = [0xff4444, 0x44aaff, 0xffcc44, 0x44dd88, 0xcc44ff];
  for (let i = 0; i < 7; i++) {
    const c = colors[i % colors.length] ?? 0xff4444;
    const bal = new Mesh(new SphereGeometry(w * 0.15, 12, 10), matPlastic(c));
    const angle = (i / 7) * Math.PI * 2;
    bal.position.set(Math.cos(angle) * w * 0.15, h * 0.75 + (i % 2) * 0.1, Math.sin(angle) * w * 0.15);
    g.add(bal);
  }
  const weight = new Mesh(new BoxGeometry(w * 0.2, 0.03, w * 0.2), matMetal(0x555555));
  weight.position.y = 0.015;
  return addMeshes(g, [weight]);
}
export function buildFireTorch(w: number, _d: number, h: number): Group {
  const g = new Group();
  const pole = new Mesh(new CylinderGeometry(0.015, 0.02, h * 0.9, 8), matMetal(0x3a2a1a));
  pole.position.y = h * 0.45;
  const bowl = new Mesh(new CylinderGeometry(w / 2, w / 2 * 0.6, h * 0.1, 12), matMetal(0x333333));
  bowl.position.y = h * 0.92;
  const flame = new Mesh(new ConeGeometry(w * 0.35, h * 0.12, 8), matLED(0xff6622));
  flame.position.y = h * 1.02;
  return addMeshes(g, [pole, bowl, flame]);
}
export function buildFireBowl(w: number, _d: number, h: number): Group {
  const g = new Group();
  const bowl = new Mesh(new CylinderGeometry(w / 2, w / 2 * 0.7, h * 0.4, 16), matMetal(0x333333));
  bowl.position.y = h * 0.2;
  const flame = new Mesh(new ConeGeometry(w * 0.45, h * 0.6, 10), matLED(0xff4400));
  flame.position.y = h * 0.55;
  return addMeshes(g, [bowl, flame]);
}
export function buildStringLights(w: number, _d: number, h: number): Group {
  const g = new Group();
  const wire = new Mesh(new CylinderGeometry(0.005, 0.005, w, 4), matPlastic(0x111111));
  wire.rotation.z = Math.PI / 2;
  wire.position.y = h;
  for (let i = 0; i < 12; i++) {
    const x = -w / 2 + (i / 11) * w;
    const bulb = new Mesh(new SphereGeometry(0.025, 8, 6), matLED(0xffddaa));
    bulb.position.set(x, h - 0.05, 0);
    g.add(bulb);
  }
  return addMeshes(g, [wire]);
}
export function buildCenterpiece(w: number, _d: number, h: number): Group {
  const g = new Group();
  const vase = new Mesh(new CylinderGeometry(w * 0.3, w * 0.25, h * 0.7, 12), matGlassPhys(0xccddff));
  vase.position.y = h * 0.35;
  const flowers = new Mesh(new SphereGeometry(w * 0.35, 12, 10), matFabric(0xffaacc));
  flowers.position.y = h * 0.85;
  return addMeshes(g, [vase, flowers]);
}
export function buildDrapeCurtain(w: number, d: number, h: number): Group {
  const g = new Group();
  for (let i = 0; i < 5; i++) {
    const fold = new Mesh(new PlaneGeometry(w / 5, h), matFabric(0x6a2a6a));
    fold.material.side = DoubleSide;
    fold.position.set(-w / 2 + w / 10 + (i * w / 5), h / 2, Math.sin(i) * 0.03);
    g.add(fold);
  }
  const rod = new Mesh(new CylinderGeometry(0.02, 0.02, w + 0.1, 8), matMetal(0x888888));
  rod.rotation.z = Math.PI / 2;
  rod.position.y = h;
  return addMeshes(g, [rod]);
}
export function buildVaseTall(w: number, _d: number, h: number): Group {
  const g = new Group();
  const vase = new Mesh(new CylinderGeometry(w * 0.3, w * 0.45, h, 16), matGlassPhys(0x224466));
  vase.position.y = h / 2;
  return addMeshes(g, [vase]);
}

// =============================================================================
// 8. EINGANG & ORDNER
// =============================================================================

export function buildPostRope(w: number, _d: number, h: number): Group {
  const g = new Group();
  const post = new Mesh(new CylinderGeometry(w * 0.15, w * 0.15, h, 12), matMetal(0xbbbbbb));
  post.position.y = h / 2;
  const base = new Mesh(new CylinderGeometry(w * 0.4, w * 0.45, 0.04, 16), matMetal(0x555555));
  base.position.y = 0.02;
  const ball = new Mesh(new SphereGeometry(w * 0.2, 12, 10), matMetal(0xcccccc));
  ball.position.y = h;
  return addMeshes(g, [post, base, ball]);
}
export function buildMobileGate(w: number, d: number, h: number): Group {
  const g = new Group();
  // Crowd-control fence
  const topBar = new Mesh(new CylinderGeometry(0.015, 0.015, w, 6), matMetal(0x888888));
  topBar.rotation.z = Math.PI / 2;
  topBar.position.y = h - 0.05;
  const botBar = topBar.clone();
  botBar.position.y = 0.1;
  for (let i = 0; i <= 6; i++) {
    const x = -w / 2 + (i * w) / 6;
    const v = new Mesh(new CylinderGeometry(0.01, 0.01, h - 0.1, 6), matMetal(0x888888));
    v.position.set(x, h / 2, 0);
    g.add(v);
  }
  for (const sx of [-1, 1]) {
    const foot = new Mesh(new BoxGeometry(0.04, 0.02, d), matMetal(0x555555));
    foot.position.set(sx * (w / 2 - 0.05), 0.01, 0);
    g.add(foot);
  }
  return addMeshes(g, [topBar, botBar]);
}
export function buildMetalDetector(w: number, d: number, h: number): Group {
  const g = new Group();
  const pillarL = new Mesh(new BoxGeometry(w * 0.2, h, d), matMetal(0xeeeeee));
  pillarL.position.set(-w * 0.4, h / 2, 0);
  const pillarR = pillarL.clone();
  pillarR.position.x = w * 0.4;
  const top = new Mesh(new BoxGeometry(w, h * 0.1, d), matMetal(0xeeeeee));
  top.position.set(0, h - h * 0.05, 0);
  return addMeshes(g, [pillarL, pillarR, top]);
}
export function buildTurnstile(w: number, d: number, h: number): Group {
  const g = new Group();
  const post = new Mesh(new CylinderGeometry(w * 0.2, w * 0.2, h, 12), matMetal(0x888888));
  post.position.y = h / 2;
  for (let i = 0; i < 3; i++) {
    const arm = new Mesh(new CylinderGeometry(0.015, 0.015, d, 8), matMetal(0xcccccc));
    arm.rotation.y = (i / 3) * Math.PI * 2;
    arm.rotation.z = Math.PI / 2;
    arm.position.y = h * 0.7;
    g.add(arm);
  }
  return addMeshes(g, [post]);
}
export function buildInfoDesk(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matWood(0xc8a572));
  body.position.y = h / 2;
  const top = new Mesh(new BoxGeometry(w + 0.04, 0.04, d + 0.04), matWood(0x222222));
  top.position.y = h + 0.02;
  const sign = new Mesh(new BoxGeometry(w * 0.4, 0.3, 0.03), matLED(0xffffff));
  sign.position.set(0, h + 0.25, d / 2 - 0.1);
  return addMeshes(g, [body, top, sign]);
}
export function buildSecurityCheckpoint(w: number, d: number, h: number): Group {
  const g = new Group();
  const table = new Mesh(new BoxGeometry(w, h * 0.65, d), matMetal(0x444444));
  table.position.y = h * 0.65 / 2;
  const roller = new Mesh(new CylinderGeometry(w * 0.08, w * 0.08, d * 0.9, 8), matPlastic(0x111111));
  roller.rotation.x = Math.PI / 2;
  roller.position.y = h * 0.67;
  return addMeshes(g, [table, roller]);
}
export function buildQueueDivider(w: number, d: number, h: number): Group {
  const g = new Group();
  const post = new Mesh(new CylinderGeometry(w * 0.08, w * 0.08, h, 10), matMetal(0x222222));
  post.position.y = h / 2;
  const base = new Mesh(new CylinderGeometry(w * 0.4, w * 0.5, 0.03, 12), matMetal(0x111111));
  base.position.y = 0.015;
  const band = new Mesh(new BoxGeometry(d * 0.9, 0.02, 0.01), matFabric(0xaa0000));
  band.position.set(0, h * 0.6, 0);
  return addMeshes(g, [post, base, band]);
}
export function buildWelcomeSign(w: number, d: number, h: number): Group {
  const g = new Group();
  const plaque = new Mesh(new BoxGeometry(w, h * 0.4, d), matMetal(0xeeeeee));
  plaque.position.y = h * 0.75;
  for (const sx of [-1, 1]) {
    const post = new Mesh(new CylinderGeometry(0.02, 0.02, h * 0.55, 8), matMetal(0x333333));
    post.position.set(sx * (w / 2 - 0.05), h * 0.275, 0);
    g.add(post);
  }
  return addMeshes(g, [plaque]);
}
export function buildEntranceArch(w: number, d: number, h: number): Group {
  const g = new Group();
  for (const sx of [-1, 1]) {
    const col = new Mesh(new BoxGeometry(d, h, d), matMetal(0x222222));
    col.position.set(sx * (w / 2 - d / 2), h / 2, 0);
    g.add(col);
  }
  const top = new Mesh(new BoxGeometry(w, 0.3, d), matMetal(0x222222));
  top.position.y = h - 0.15;
  return addMeshes(g, [top]);
}
export function buildBagScanner(w: number, d: number, h: number): Group {
  const g = new Group();
  const tunnel = new Mesh(new BoxGeometry(w, h * 0.45, d), matMetal(0x222222));
  tunnel.position.y = h * 0.45 / 2 + h * 0.3;
  const conveyor = new Mesh(new BoxGeometry(w, h * 0.08, d * 1.3), matPlastic(0x111111));
  conveyor.position.y = h * 0.3;
  return addMeshes(g, [tunnel, conveyor]);
}

// =============================================================================
// 9. WORKSHOP & SEMINAR
// =============================================================================

export function buildFlipchart(w: number, d: number, h: number): Group {
  const g = new Group();
  const board = new Mesh(new BoxGeometry(w, h * 0.55, 0.02), matPlastic(0xffffff));
  board.position.y = h * 0.7;
  const frame = new Mesh(new BoxGeometry(w + 0.04, h * 0.55 + 0.04, 0.03), matMetal(0x222222));
  frame.position.y = h * 0.7;
  frame.position.z = -0.01;
  // Tripod
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new Mesh(new CylinderGeometry(0.015, 0.015, h * 0.5, 6), matMetal(0x333333));
    leg.position.set(Math.cos(a) * d * 0.2, h * 0.22, Math.sin(a) * d * 0.2);
    leg.rotation.z = Math.cos(a) * 0.25;
    leg.rotation.x = Math.sin(a) * 0.25;
    g.add(leg);
  }
  return addMeshes(g, [board, frame]);
}
export function buildPinboard(w: number, d: number, h: number): Group {
  const g = new Group();
  const board = new Mesh(new BoxGeometry(w, h * 0.65, 0.03), matFabric(0x888866));
  board.position.y = h * 0.6;
  const frame = new Mesh(new BoxGeometry(w + 0.04, h * 0.65 + 0.04, 0.04), matWood(0x3a2a1a));
  frame.position.y = h * 0.6;
  frame.position.z = -0.01;
  for (const sx of [-1, 1]) {
    const post = new Mesh(new CylinderGeometry(0.02, 0.02, h * 0.45, 8), matMetal(0x555555));
    post.position.set(sx * (w / 2 - 0.05), h * 0.225, 0);
    g.add(post);
  }
  return addMeshes(g, [board, frame]);
}
export function buildModerationCase(w: number, d: number, h: number): Group {
  const g = new Group();
  const box = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x111111));
  box.position.y = h / 2;
  const handle = new Mesh(new TorusGeometry(0.05, 0.01, 4, 12), matMetal(0x222222));
  handle.rotation.x = Math.PI / 2;
  handle.position.y = h + 0.02;
  return addMeshes(g, [box, handle]);
}
export function buildBreakoutTable(w: number, d: number, h: number): Group {
  return _tableWith4Legs(w, d, h, 0xc8a572, matWood);
}
export function buildGroupTable4(w: number, d: number, h: number): Group {
  return _tableWith4Legs(w, d, h, 0xeeeeee, matPlastic);
}
export function buildWhiteboardMobile(w: number, d: number, h: number): Group {
  const g = new Group();
  const board = new Mesh(new BoxGeometry(w, h * 0.7, 0.03), matPlastic(0xffffff));
  board.position.y = h * 0.55;
  const frame = new Mesh(new BoxGeometry(w + 0.04, h * 0.7 + 0.04, 0.04), matMetal(0x888888));
  frame.position.y = h * 0.55;
  frame.position.z = -0.01;
  for (const sx of [-1, 1]) {
    const post = new Mesh(new CylinderGeometry(0.02, 0.02, h * 0.2, 8), matMetal(0x555555));
    post.position.set(sx * (w / 2 - 0.05), h * 0.1, 0);
    const wheel = new Mesh(new CylinderGeometry(0.04, 0.04, 0.02, 10), matPlastic(0x111111));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(sx * (w / 2 - 0.05), 0.04, 0);
    g.add(post, wheel);
  }
  return addMeshes(g, [board, frame]);
}
export function buildEasel(w: number, _d: number, h: number): Group {
  const g = new Group();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new Mesh(new CylinderGeometry(0.015, 0.015, h, 6), matWood(0x3a2a1a));
    leg.position.set(Math.cos(a) * w * 0.15, h / 2, Math.sin(a) * w * 0.15);
    leg.rotation.z = Math.cos(a) * 0.15;
    leg.rotation.x = Math.sin(a) * 0.15;
    g.add(leg);
  }
  const canvas = new Mesh(new PlaneGeometry(w * 0.85, h * 0.5), matFabric(0xffffff));
  canvas.material.side = DoubleSide;
  canvas.position.y = h * 0.6;
  canvas.rotation.x = -0.1;
  return addMeshes(g, [canvas]);
}
export function buildPodiumSpeaker(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.9, d), matWood(0x3a2a1a));
  body.position.y = h * 0.9 / 2;
  const top = new Mesh(new BoxGeometry(w, 0.04, d), matWood(0x222222));
  top.position.y = h * 0.9 - 0.02;
  top.rotation.x = -0.2;
  const mic = new Mesh(new CylinderGeometry(0.01, 0.015, 0.08, 8), matMetal(0x111111));
  mic.position.set(0, h * 1.05, 0);
  return addMeshes(g, [body, top, mic]);
}
export function buildHandoutRack(w: number, d: number, h: number): Group {
  const g = new Group();
  for (let i = 0; i < 3; i++) {
    const tray = new Mesh(new BoxGeometry(w, 0.02, d), matMetal(0xbbbbbb));
    tray.position.y = h * 0.25 + i * h * 0.25;
    tray.rotation.x = -0.15;
    g.add(tray);
  }
  for (const sx of [-1, 1]) {
    const post = new Mesh(new CylinderGeometry(0.015, 0.015, h, 8), matMetal(0x555555));
    post.position.set(sx * (w / 2 - 0.02), h / 2, 0);
    g.add(post);
  }
  return addMeshes(g, []);
}
export function buildNoteblockPack(w: number, d: number, h: number): Group {
  const g = new Group();
  for (let i = 0; i < 5; i++) {
    const block = new Mesh(new BoxGeometry(w * 0.8, h * 0.16, d * 0.8), matPlastic(0xffee88 + i * 0x002020));
    block.position.set(0, h * 0.08 + i * h * 0.17, 0);
    g.add(block);
  }
  return addMeshes(g, []);
}

// =============================================================================
// 10. OUTDOOR & ZELTE
// =============================================================================

export function buildPavilion(w: number, d: number, h: number): Group {
  const g = new Group();
  const barMat = matMetal(0xeeeeee);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const post = new Mesh(new CylinderGeometry(0.03, 0.03, h * 0.7, 8), barMat);
    post.position.set(sx * (w / 2 - 0.05), h * 0.35, sz * (d / 2 - 0.05));
    g.add(post);
  }
  // Pyramid roof (4 tri panels)
  const roofMat = matFabric(0xffffff);
  roofMat.side = DoubleSide;
  const apex = h;
  const roofH = h * 0.3;
  const coneRoof = new Mesh(new ConeGeometry(w * 0.75, roofH, 4), roofMat);
  coneRoof.rotation.y = Math.PI / 4;
  coneRoof.position.y = h - roofH / 2;
  return addMeshes(g, [coneRoof]);
}
export function buildTentLarge(w: number, d: number, h: number): Group {
  // Same as pavilion, scaled
  return buildPavilion(w, d, h);
}
export function buildBeerTableSet(w: number, d: number, h: number): Group {
  const g = new Group();
  // Table in middle
  const top = new Mesh(new BoxGeometry(w * 0.45, 0.03, d), matWood(0xa07a4a));
  top.position.set(0, h - 0.015, 0);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = new Mesh(new BoxGeometry(0.04, h - 0.03, 0.04), matMetal(0x222222));
    leg.position.set(sx * (w * 0.2 - 0.05), (h - 0.03) / 2, sz * (d / 2 - 0.05));
    g.add(leg);
  }
  // Two benches
  for (const side of [-1, 1]) {
    const bench = new Mesh(new BoxGeometry(w * 0.45, 0.03, d * 0.35), matWood(0xa07a4a));
    bench.position.set(side * (w * 0.33), 0.5, 0);
    g.add(bench);
    for (const sx of [-1, 1]) {
      const bleg = new Mesh(new BoxGeometry(0.04, 0.5, 0.04), matMetal(0x222222));
      bleg.position.set(side * (w * 0.33) + sx * (w * 0.18 - 0.03), 0.25, 0);
      g.add(bleg);
    }
  }
  return addMeshes(g, [top]);
}
export function buildPatioHeater(w: number, _d: number, h: number): Group {
  const g = new Group();
  const base = new Mesh(new CylinderGeometry(w / 2, w / 2, 0.08, 12), matMetal(0x333333));
  base.position.y = 0.04;
  const pole = new Mesh(new CylinderGeometry(0.04, 0.04, h * 0.8, 8), matMetal(0x888888));
  pole.position.y = h * 0.4 + 0.08;
  const head = new Mesh(new CylinderGeometry(w * 0.5, w * 0.4, h * 0.12, 16), matMetal(0x555555));
  head.position.y = h * 0.9;
  const glow = new Mesh(new CylinderGeometry(w * 0.35, w * 0.35, h * 0.08, 12), matLED(0xff4400));
  glow.position.y = h * 0.9;
  return addMeshes(g, [base, pole, head, glow]);
}
export function buildRainSail(w: number, d: number, h: number): Group {
  const g = new Group();
  const sail = new Mesh(new PlaneGeometry(w, d), matFabric(0xe0e0e0));
  sail.material.side = DoubleSide;
  sail.rotation.x = -Math.PI / 2;
  sail.position.y = h;
  // 4 taut cords
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const cord = new Mesh(new CylinderGeometry(0.003, 0.003, h * 1.2, 4), matFabric(0x222222));
    cord.position.set(sx * w / 2, h / 2, sz * d / 2);
    g.add(cord);
  }
  return addMeshes(g, [sail]);
}
export function buildPortableToilet(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x3388dd));
  body.position.y = h / 2;
  const roof = new Mesh(new BoxGeometry(w + 0.05, 0.06, d + 0.05), matPlastic(0x224488));
  roof.position.y = h + 0.03;
  const vent = new Mesh(new CylinderGeometry(0.05, 0.05, 0.3, 8), matPlastic(0x224488));
  vent.position.set(w * 0.35, h + 0.2, 0);
  return addMeshes(g, [body, roof, vent]);
}
export function buildWindscreen(w: number, d: number, h: number): Group {
  const g = new Group();
  const panel = new Mesh(new PlaneGeometry(w, h), matFabric(0xeeddaa));
  panel.material.side = DoubleSide;
  panel.position.y = h / 2;
  for (const sx of [-1, 0, 1]) {
    const post = new Mesh(new CylinderGeometry(0.02, 0.02, h + 0.1, 8), matWood(0x3a2a1a));
    post.position.set(sx * (w / 2), (h + 0.1) / 2, 0);
    g.add(post);
  }
  return addMeshes(g, [panel]);
}
export function buildGardenUmbrella(w: number, _d: number, h: number): Group {
  const g = new Group();
  const pole = new Mesh(new CylinderGeometry(0.02, 0.02, h * 0.9, 8), matMetal(0x888888));
  pole.position.y = h * 0.45;
  const canopy = new Mesh(new ConeGeometry(w / 2, h * 0.25, 8), matFabric(0xcc4444));
  canopy.position.y = h * 0.85;
  const base = new Mesh(new CylinderGeometry(w * 0.25, w * 0.3, 0.05, 12), matConcrete(0x555555));
  base.position.y = 0.025;
  return addMeshes(g, [pole, canopy, base]);
}
export function buildOutdoorBench(w: number, d: number, h: number): Group {
  const g = new Group();
  const seat = new Mesh(new BoxGeometry(w, 0.05, d), matWood(0x3a2a1a));
  seat.position.y = h * 0.55;
  const back = new Mesh(new BoxGeometry(w, h * 0.45, 0.05), matWood(0x3a2a1a));
  back.position.set(0, h * 0.55 + h * 0.22, -d / 2 + 0.025);
  for (const sx of [-1, 1]) {
    const leg = new Mesh(new BoxGeometry(0.04, h * 0.55, d), matMetal(0x222222));
    leg.position.set(sx * (w / 2 - 0.04), h * 0.55 / 2, 0);
    g.add(leg);
  }
  return addMeshes(g, [seat, back]);
}

// =============================================================================
// 11. EQUIPMENT & EXTRAS
// =============================================================================

export function buildGenerator(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0xcc6622));
  body.position.y = h / 2;
  const grille = new Mesh(new PlaneGeometry(w * 0.55, h * 0.3), matMetal(0x222222));
  grille.position.set(0, h * 0.5, d / 2 + 0.001);
  const exhaust = new Mesh(new CylinderGeometry(0.03, 0.03, 0.15, 8), matMetal(0x222222));
  exhaust.position.set(w * 0.3, h + 0.075, 0);
  return addMeshes(g, [body, grille, exhaust]);
}
export function buildCableDrum(w: number, _d: number, h: number): Group {
  const g = new Group();
  const outer = new Mesh(new CylinderGeometry(w / 2, w / 2, 0.04, 24), matMetal(0xbbbbbb));
  outer.rotation.z = Math.PI / 2;
  outer.position.y = h / 2;
  const inner = new Mesh(new CylinderGeometry(w * 0.3, w * 0.3, h * 0.85, 16), matFabric(0x111111));
  inner.rotation.z = Math.PI / 2;
  inner.position.y = h / 2;
  const outer2 = outer.clone();
  outer2.position.y = h / 2;
  outer2.position.x = h * 0.85;
  return addMeshes(g, [outer, inner]);
}
export function buildHeatLamp(w: number, _d: number, h: number): Group {
  const g = new Group();
  const shade = new Mesh(new CylinderGeometry(w * 0.5, w * 0.4, h * 0.2, 16), matMetal(0x666666));
  shade.position.y = h - h * 0.1;
  const bulb = new Mesh(new CylinderGeometry(w * 0.25, w * 0.25, 0.05, 12), matLED(0xff6600));
  bulb.position.y = h - h * 0.15;
  const post = new Mesh(new CylinderGeometry(0.025, 0.025, h * 0.8, 6), matMetal(0x333333));
  post.position.y = h * 0.4;
  const base = new Mesh(new CylinderGeometry(w * 0.35, w * 0.4, 0.03, 12), matMetal(0x222222));
  base.position.y = 0.015;
  return addMeshes(g, [shade, bulb, post, base]);
}
export function buildFanIndustrial(w: number, d: number, h: number): Group {
  const g = new Group();
  const cage = new Mesh(new TorusGeometry(w / 2, 0.02, 8, 24), matMetal(0x888888));
  cage.rotation.x = Math.PI / 2;
  cage.position.y = h - w / 2;
  const hub = new Mesh(new CylinderGeometry(0.06, 0.06, 0.1, 8), matPlastic(0x333333));
  hub.rotation.x = Math.PI / 2;
  hub.position.y = h - w / 2;
  for (let i = 0; i < 4; i++) {
    const blade = new Mesh(new BoxGeometry(w * 0.4, 0.01, 0.08), matPlastic(0xdddddd));
    blade.position.y = h - w / 2;
    blade.rotation.z = (i / 4) * Math.PI * 2;
    g.add(blade);
  }
  const post = new Mesh(new CylinderGeometry(0.025, 0.025, h - w / 2, 6), matMetal(0x333333));
  post.position.y = (h - w / 2) / 2;
  const base = new Mesh(new CylinderGeometry(w * 0.3, w * 0.3, 0.04, 12), matMetal(0x222222));
  base.position.y = 0.02;
  return addMeshes(g, [cage, hub, post, base]);
}
export function buildDehumidifier(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0xeeeeee));
  body.position.y = h / 2;
  const grille = new Mesh(new PlaneGeometry(w * 0.6, h * 0.4), matMetal(0x888888));
  grille.position.set(0, h * 0.4, d / 2 + 0.001);
  const panel = new Mesh(new PlaneGeometry(w * 0.7, h * 0.2), matLED(0x00aaff));
  panel.position.set(0, h * 0.75, d / 2 + 0.001);
  return addMeshes(g, [body, grille, panel]);
}
export function buildExtensionBox(w: number, d: number, h: number): Group {
  const g = new Group();
  const box = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x222222));
  box.position.y = h / 2;
  for (let i = 0; i < 3; i++) {
    const sock = new Mesh(new CylinderGeometry(w * 0.08, w * 0.08, 0.005, 8), matPlastic(0xffffff));
    sock.position.set(-w * 0.3 + i * w * 0.3, h + 0.0025, 0);
    sock.rotation.x = Math.PI / 2;
    g.add(sock);
  }
  return addMeshes(g, [box]);
}
export function buildPowerDistro(w: number, d: number, h: number): Group {
  const g = new Group();
  const box = new Mesh(new BoxGeometry(w, h, d), matMetal(0x333333));
  box.position.y = h / 2;
  for (let i = 0; i < 4; i++) {
    const sw = new Mesh(new BoxGeometry(w * 0.12, h * 0.2, 0.02), matPlastic(0xff4400));
    sw.position.set(-w * 0.3 + i * w * 0.2, h * 0.6, d / 2 + 0.01);
    g.add(sw);
  }
  return addMeshes(g, [box]);
}
export function buildCaseFlight(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x111111));
  body.position.y = h / 2;
  const corners = matMetal(0xaaaaaa);
  // Corner brackets (simplified — 8 small boxes at corners)
  for (const [sx, sy, sz] of [
    [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1],
    [-1, 1, -1], [1, 1, -1], [-1, 1, 1], [1, 1, 1],
  ] as const) {
    const br = new Mesh(new BoxGeometry(0.06, 0.06, 0.06), corners);
    br.position.set(sx * w / 2, h / 2 + sy * h / 2, sz * d / 2);
    g.add(br);
  }
  return addMeshes(g, [body]);
}
export function buildToolbox(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.8, d), matPlastic(0xcc2222));
  body.position.y = h * 0.4;
  const handle = new Mesh(new TorusGeometry(0.06, 0.01, 4, 16, Math.PI), matMetal(0x222222));
  handle.rotation.x = Math.PI / 2;
  handle.position.y = h * 0.88;
  return addMeshes(g, [body, handle]);
}
export function buildWalkieCharger(w: number, d: number, h: number): Group {
  const g = new Group();
  const base = new Mesh(new BoxGeometry(w, h * 0.15, d), matPlastic(0x222222));
  base.position.y = h * 0.075;
  for (let i = 0; i < 4; i++) {
    const walkie = new Mesh(new BoxGeometry(w * 0.15, h * 0.65, d * 0.35), matPlastic(0x111111));
    walkie.position.set(-w * 0.35 + i * w * 0.23, h * 0.15 + h * 0.325, 0);
    g.add(walkie);
    const antenna = new Mesh(new CylinderGeometry(0.005, 0.005, h * 0.2, 4), matPlastic(0x222222));
    antenna.position.set(-w * 0.35 + i * w * 0.23, h * 0.9, d * 0.15);
    g.add(antenna);
  }
  return addMeshes(g, [base]);
}

// =============================================================================
// Builder-Registry für Event-Katalog — in primitiveBuilders.ts importiert.
// =============================================================================

export const EVENT_BUILDER_MAP: Record<string, (w: number, d: number, h: number) => Group> = {
  // Bühne
  buildStageModule, buildStageStep, buildStageRamp, buildStageCorner, buildStageSkirt,
  buildStageRailGuard, buildCatwalk, buildDrape, buildRostrumXL, buildSideBlind,
  // Bestuhlung
  buildRowChair, buildConfChair, buildArmchairEvent, buildFoldingChair, buildBarstoolHigh,
  buildBanquetTable, buildLoungeTable, buildRoundTable6p, buildCateringHighTable, buildFoldingTable,
  buildBistroTable,
  // Technik
  buildProjectorStand, buildProjectionScreenLarge, buildMobileLedWall, buildVideoPillar,
  buildTouchscreenKiosk, buildTranslatorBooth, buildFMDesk, buildCableRamp, buildControlDesk,
  buildTrussSquare,
  // Licht
  buildMovingHead, buildParLight, buildLedBar, buildStrobe, buildFogMachine,
  buildConfettiCannon, buildBeamer, buildFollowSpot, buildHazer, buildUvBar,
  // Beschallung
  buildLineArrayElement, buildSubwoofer, buildFloorMonitor, buildMicStand, buildMicHandheld,
  buildHeadsetMic, buildMixerConsole, buildWirelessRack, buildSpeakerStand, buildActiveColumn,
  // Catering
  buildChafingDish, buildCoffeeStation, buildJuiceDispenser, buildDishTrolley, buildTrayCart,
  buildServingCounter, buildIceMachine, buildBuffetTable, buildDessertStand, buildPunchBowl,
  // Deko
  buildTallPlant, buildPartitionPanel, buildArtworkSet, buildBalloonBouquet, buildFireTorch,
  buildFireBowl, buildStringLights, buildCenterpiece, buildDrapeCurtain, buildVaseTall,
  // Eingang
  buildPostRope, buildMobileGate, buildMetalDetector, buildTurnstile, buildInfoDesk,
  buildSecurityCheckpoint, buildQueueDivider, buildWelcomeSign, buildEntranceArch, buildBagScanner,
  // Workshop
  buildFlipchart, buildPinboard, buildModerationCase, buildBreakoutTable, buildGroupTable4,
  buildWhiteboardMobile, buildEasel, buildPodiumSpeaker, buildHandoutRack, buildNoteblockPack,
  // Outdoor
  buildPavilion, buildTentLarge, buildBeerTableSet, buildPatioHeater, buildRainSail,
  buildPortableToilet, buildWindscreen, buildGardenUmbrella, buildOutdoorBench,
  // Equipment
  buildGenerator, buildCableDrum, buildHeatLamp, buildFanIndustrial, buildDehumidifier,
  buildExtensionBox, buildPowerDistro, buildCaseFlight, buildToolbox, buildWalkieCharger,
};
