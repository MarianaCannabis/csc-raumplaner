// P5.2 — CSC-spezifische Rich-Primitive-Builder. Ergänzt das Haupt-Set
// in primitiveBuilders.ts um CSC-exklusive Items (Boulderwand,
// Tischkicker, Arcade, Biometrie-Reader etc.). Reine Formen, kompakt,
// PBR-Materialien aus materials.ts.

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
  matWood, matMetal, matFabric, matPlastic, matGlassPhys, matLED, matConcrete, matLeather,
} from './materials.js';

function addMeshes(g: Group, meshes: Mesh[]): Group {
  for (const m of meshes) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
  return g;
}

// =============================================================================
// ANBAU
// =============================================================================

export function buildSeedlingStation(w: number, d: number, h: number): Group {
  const g = new Group();
  const base = new Mesh(new BoxGeometry(w, h * 0.15, d), matMetal(0xaaaaaa));
  base.position.y = h * 0.075;
  // Tray with seedling cells
  const tray = new Mesh(new BoxGeometry(w * 0.9, h * 0.08, d * 0.85), matPlastic(0x222222));
  tray.position.y = h * 0.19;
  const dome = new Mesh(new BoxGeometry(w * 0.85, h * 0.45, d * 0.8), matGlassPhys(0xccffcc));
  dome.position.y = h * 0.46;
  // LED strip overhead
  const led = new Mesh(new BoxGeometry(w * 0.9, 0.03, 0.06), matLED(0xaa88ff));
  led.position.y = h - 0.02;
  return addMeshes(g, [base, tray, dome, led]);
}

export function buildCuttingCabinet(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0x888888));
  body.position.y = h / 2;
  // Glass door
  const door = new Mesh(new PlaneGeometry(w * 0.9, h * 0.9), matGlassPhys(0xccffcc));
  door.position.set(0, h / 2, d / 2 + 0.001);
  // LED shelves visible
  for (let i = 0; i < 3; i++) {
    const led = new Mesh(new BoxGeometry(w * 0.85, 0.015, 0.03), matLED(0xff6688));
    led.position.set(0, h * 0.25 + i * h * 0.25, d / 2 - 0.08);
    g.add(led);
  }
  return addMeshes(g, [body, door]);
}

export function buildDryingNet(w: number, d: number, h: number): Group {
  const g = new Group();
  // Stack of circular net layers
  for (let i = 0; i < 6; i++) {
    const ring = new Mesh(new TorusGeometry(w / 2 * 0.95, 0.015, 4, 24), matMetal(0x666666));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.1 + i * (h - 0.2) / 5;
    g.add(ring);
    const mesh = new Mesh(new CylinderGeometry(w / 2 * 0.95, w / 2 * 0.95, 0.005, 24), matFabric(0x222222));
    mesh.position.y = 0.1 + i * (h - 0.2) / 5;
    g.add(mesh);
  }
  // Hanger at top
  const hook = new Mesh(new TorusGeometry(0.04, 0.008, 4, 12, Math.PI), matMetal(0x888888));
  hook.position.y = h;
  return addMeshes(g, [hook]);
}

export function buildPackagingStation(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.8, d), matMetal(0xcccccc));
  body.position.y = h * 0.4;
  const top = new Mesh(new BoxGeometry(w + 0.03, 0.03, d + 0.03), matConcrete(0x888888));
  top.position.y = h * 0.8 + 0.015;
  // Heat sealer box on top
  const sealer = new Mesh(new BoxGeometry(w * 0.5, h * 0.15, d * 0.4), matMetal(0xaa2222));
  sealer.position.set(w * 0.15, h * 0.9, 0);
  const scale = new Mesh(new BoxGeometry(w * 0.25, h * 0.1, d * 0.3), matPlastic(0x222222));
  scale.position.set(-w * 0.25, h * 0.85, 0);
  return addMeshes(g, [body, top, sealer, scale]);
}

export function buildCompostBin(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x2a4a2a));
  body.position.y = h / 2;
  const lid = new Mesh(new BoxGeometry(w + 0.04, 0.04, d + 0.04), matPlastic(0x1a3a1a));
  lid.position.y = h + 0.02;
  const handle = new Mesh(new TorusGeometry(0.05, 0.01, 4, 12, Math.PI), matMetal(0x555555));
  handle.rotation.x = Math.PI / 2;
  handle.position.set(0, h + 0.07, d / 2 - 0.05);
  return addMeshes(g, [body, lid, handle]);
}

export function buildPhEcMeter(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x222222));
  body.position.y = h / 2;
  const display = new Mesh(new PlaneGeometry(w * 0.7, h * 0.25), matLED(0x44ff44));
  display.position.set(0, h * 0.65, d / 2 + 0.001);
  // Probe hanging
  const cable = new Mesh(new CylinderGeometry(0.003, 0.003, h * 0.5, 4), matPlastic(0x111111));
  cable.position.set(w * 0.35, h * 0.25, d / 2 + 0.02);
  const probe = new Mesh(new CylinderGeometry(0.015, 0.01, h * 0.15, 8), matMetal(0xaaaaaa));
  probe.position.set(w * 0.35, h * 0.02, d / 2 + 0.02);
  return addMeshes(g, [body, display, cable, probe]);
}

export function buildIrrigationTank(w: number, _d: number, h: number): Group {
  const g = new Group();
  const tank = new Mesh(new CylinderGeometry(w / 2, w / 2, h * 0.9, 16), matPlastic(0x225588));
  tank.position.y = h * 0.45;
  const lid = new Mesh(new CylinderGeometry(w * 0.15, w * 0.15, h * 0.1, 12), matPlastic(0x111111));
  lid.position.y = h * 0.95;
  const gauge = new Mesh(new PlaneGeometry(w * 0.2, h * 0.15), matPlastic(0xeeeeee));
  gauge.position.set(0, h * 0.4, w / 2 + 0.001);
  return addMeshes(g, [tank, lid, gauge]);
}

// =============================================================================
// SICHERHEIT
// =============================================================================

export function buildSaferRoomPanel(w: number, d: number, h: number): Group {
  const g = new Group();
  const panel = new Mesh(new BoxGeometry(w, h, d), matMetal(0x444444));
  panel.position.y = h / 2;
  // Reinforcement grid visible as surface indents (boxes on front)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      const bolt = new Mesh(new SphereGeometry(0.015, 8, 6), matMetal(0x222222));
      bolt.position.set(-w * 0.35 + i * w * 0.35, -h * 0.35 + j * h * 0.2 + h / 2, d / 2 + 0.015);
      g.add(bolt);
    }
  }
  return addMeshes(g, [panel]);
}

export function buildAirlockDoor(w: number, d: number, h: number): Group {
  const g = new Group();
  const frame = new Mesh(new BoxGeometry(w, h, d), matMetal(0x555555));
  frame.position.y = h / 2;
  const inner = new Mesh(new BoxGeometry(w * 0.85, h * 0.9, d * 0.6), matMetal(0x333333));
  inner.position.set(0, h / 2, d * 0.1);
  const wheel = new Mesh(new TorusGeometry(w * 0.15, 0.015, 6, 24), matMetal(0xaaaaaa));
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(0, h * 0.5, d / 2 + 0.02);
  return addMeshes(g, [frame, inner, wheel]);
}

export function buildWalkthroughScanner(w: number, d: number, h: number): Group {
  const g = new Group();
  for (const sx of [-1, 1]) {
    const pillar = new Mesh(new BoxGeometry(0.08, h, d), matMetal(0xeeeeee));
    pillar.position.set(sx * (w / 2 - 0.04), h / 2, 0);
    const led = new Mesh(new BoxGeometry(0.01, h * 0.9, 0.02), matLED(0x44ff44));
    led.position.set(sx * (w / 2 - 0.02) * 0.9, h / 2, d / 2 + 0.001);
    g.add(pillar, led);
  }
  const top = new Mesh(new BoxGeometry(w, h * 0.1, d), matMetal(0xeeeeee));
  top.position.y = h - h * 0.05;
  return addMeshes(g, [top]);
}

export function buildBiometricReader(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x222222));
  body.position.y = h / 2;
  const scanner = new Mesh(new PlaneGeometry(w * 0.5, h * 0.3), matLED(0x0088ff));
  scanner.position.set(0, h * 0.5, d / 2 + 0.001);
  const status = new Mesh(new SphereGeometry(0.01, 8, 6), matLED(0x00ff00));
  status.position.set(0, h * 0.85, d / 2 + 0.01);
  return addMeshes(g, [body, scanner, status]);
}

export function buildPanicButton(w: number, d: number, h: number): Group {
  const g = new Group();
  const plate = new Mesh(new BoxGeometry(w, h * 0.15, d), matPlastic(0xcccccc));
  plate.position.y = h * 0.075;
  const button = new Mesh(new CylinderGeometry(w * 0.3, w * 0.3, h * 0.6, 16), matPlastic(0xcc0000));
  button.position.y = h * 0.45;
  const cap = new Mesh(new CylinderGeometry(w * 0.35, w * 0.3, h * 0.15, 16), matPlastic(0xaa0000));
  cap.position.y = h * 0.82;
  return addMeshes(g, [plate, button, cap]);
}

export function buildAlarmStrobe(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.4, d), matPlastic(0xffffff));
  body.position.y = h * 0.2;
  const lens = new Mesh(new SphereGeometry(w * 0.4, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2), matLED(0xff2222));
  lens.position.y = h * 0.4;
  const horn = new Mesh(new ConeGeometry(w * 0.3, h * 0.4, 8), matPlastic(0x222222));
  horn.rotation.x = Math.PI;
  horn.position.y = h * 0.15;
  horn.position.set(0, h * 0.1, d / 2 + h * 0.2);
  return addMeshes(g, [body, lens]);
}

// =============================================================================
// AUSGABE
// =============================================================================

export function buildTastingCorner(w: number, d: number, h: number): Group {
  const g = new Group();
  const counter = new Mesh(new BoxGeometry(w, h * 0.85, d), matWood(0xc8a572));
  counter.position.y = h * 0.85 / 2;
  const top = new Mesh(new BoxGeometry(w + 0.04, 0.04, d + 0.04), matWood(0x333333));
  top.position.y = h * 0.85 + 0.02;
  // 3 small sample jars
  for (let i = -1; i <= 1; i++) {
    const jar = new Mesh(new CylinderGeometry(0.04, 0.04, 0.12, 12), matGlassPhys(0xccddff));
    jar.position.set(i * w * 0.25, h * 0.85 + 0.1, 0);
    g.add(jar);
  }
  return addMeshes(g, [counter, top]);
}

export function buildConsultationBooth(w: number, d: number, h: number): Group {
  const g = new Group();
  // Three walls
  const wallBack = new Mesh(new BoxGeometry(w, h, 0.03), matFabric(0x3a5a7a));
  wallBack.position.set(0, h / 2, -d / 2);
  const wallL = new Mesh(new BoxGeometry(0.03, h, d), matFabric(0x3a5a7a));
  wallL.position.set(-w / 2, h / 2, 0);
  const wallR = wallL.clone();
  wallR.position.x = w / 2;
  // Interior: small table + chair
  const table = new Mesh(new BoxGeometry(w * 0.7, 0.04, d * 0.5), matWood(0xc8a572));
  table.position.set(0, h * 0.4, -d * 0.15);
  return addMeshes(g, [wallBack, wallL, wallR, table]);
}

export function buildOrderTerminal(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.7, d), matMetal(0x1a1a1a));
  body.position.y = h * 0.35;
  const screen = new Mesh(new PlaneGeometry(w * 0.85, h * 0.4), matLED(0x2277cc));
  screen.rotation.x = -0.2;
  screen.position.set(0, h * 0.85, d / 2 - 0.05);
  const stand = new Mesh(new CylinderGeometry(0.04, 0.04, h * 0.7, 8), matMetal(0x555555));
  stand.position.y = h * 0.35;
  return addMeshes(g, [body, screen, stand]);
}

export function buildMerchDisplay(w: number, d: number, h: number): Group {
  const g = new Group();
  // 3 shelves + vertical posts
  for (let i = 0; i < 4; i++) {
    const shelf = new Mesh(new BoxGeometry(w, 0.02, d), matWood(0xc8a572));
    shelf.position.y = 0.1 + i * (h - 0.1) / 3;
    g.add(shelf);
  }
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const post = new Mesh(new CylinderGeometry(0.02, 0.02, h, 6), matMetal(0x222222));
    post.position.set(sx * (w / 2 - 0.03), h / 2, sz * (d / 2 - 0.03));
    g.add(post);
  }
  // A few sample merch items on top shelf (t-shirts/caps as boxes)
  for (let i = -1; i <= 1; i++) {
    const merch = new Mesh(new BoxGeometry(w * 0.25, 0.08, d * 0.6), matFabric(i < 0 ? 0xaa4444 : i === 0 ? 0x44aa44 : 0x4466aa));
    merch.position.set(i * w * 0.3, h - 0.05, 0);
    g.add(merch);
  }
  return addMeshes(g, []);
}

// =============================================================================
// LAGER
// =============================================================================

export function buildGitterbox(w: number, d: number, h: number): Group {
  const g = new Group();
  const floor = new Mesh(new BoxGeometry(w, 0.05, d), matWood(0x8a6a4a));
  floor.position.y = 0.025;
  // Mesh walls
  const meshMat = matMetal(0x888888);
  for (const side of [-1, 1]) {
    const wX = new Mesh(new PlaneGeometry(w, h - 0.05), meshMat);
    wX.material.side = DoubleSide;
    wX.position.set(0, (h + 0.05) / 2, side * d / 2);
    g.add(wX);
    const wZ = new Mesh(new PlaneGeometry(d, h - 0.05), meshMat);
    wZ.material.side = DoubleSide;
    wZ.position.set(side * w / 2, (h + 0.05) / 2, 0);
    wZ.rotation.y = Math.PI / 2;
    g.add(wZ);
  }
  // Grid strokes (horizontal)
  for (let i = 1; i < 4; i++) {
    const stripe = new Mesh(new CylinderGeometry(0.01, 0.01, w, 4), matMetal(0x444444));
    stripe.rotation.z = Math.PI / 2;
    stripe.position.set(0, 0.1 + i * (h - 0.1) / 4, d / 2);
    g.add(stripe);
    const stripeB = stripe.clone();
    stripeB.position.z = -d / 2;
    g.add(stripeB);
  }
  return addMeshes(g, [floor]);
}

export function buildEuroPallet(w: number, d: number, h: number): Group {
  const g = new Group();
  const palletMat = matWood(0xa07a4a);
  // Top planks
  for (let i = -2; i <= 2; i++) {
    const plank = new Mesh(new BoxGeometry(w * 0.15, 0.03, d), palletMat);
    plank.position.set(i * w * 0.18, h - 0.015, 0);
    g.add(plank);
  }
  // Feet/stringers
  for (const sz of [-1, 0, 1]) {
    for (const sx of [-1, 0, 1]) {
      const block = new Mesh(new BoxGeometry(w * 0.15, h - 0.05, d * 0.15), palletMat);
      block.position.set(sx * w * 0.42, (h - 0.05) / 2, sz * d * 0.42);
      g.add(block);
    }
  }
  // Bottom planks
  for (let i = -1; i <= 1; i++) {
    const plank = new Mesh(new BoxGeometry(w, 0.02, d * 0.12), palletMat);
    plank.position.set(0, 0.01, i * d * 0.42);
    g.add(plank);
  }
  return addMeshes(g, []);
}

export function buildVacuumSealer(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.7, d), matMetal(0x2a2a2a));
  body.position.y = h * 0.35;
  const lid = new Mesh(new BoxGeometry(w, h * 0.12, d * 0.7), matPlastic(0x111111));
  lid.position.set(0, h * 0.76, d * 0.1);
  lid.rotation.x = -0.2;
  const ledRow = new Mesh(new BoxGeometry(w * 0.4, 0.03, 0.02), matLED(0x44ff44));
  ledRow.position.set(w * 0.2, h * 0.5, d / 2 + 0.001);
  return addMeshes(g, [body, lid, ledRow]);
}

export function buildLabelPrinter(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.75, d), matPlastic(0xeeeeee));
  body.position.y = h * 0.375;
  const slot = new Mesh(new BoxGeometry(w * 0.9, 0.015, 0.04), matPlastic(0x111111));
  slot.position.set(0, h * 0.75 - 0.015, d / 2 - 0.02);
  const roll = new Mesh(new CylinderGeometry(w * 0.25, w * 0.25, d * 0.4, 16), matPlastic(0xffffff));
  roll.rotation.x = Math.PI / 2;
  roll.position.set(0, h * 0.85, 0);
  return addMeshes(g, [body, slot, roll]);
}

export function buildBatchTrackingStation(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.7, d), matMetal(0x555555));
  body.position.y = h * 0.35;
  const top = new Mesh(new BoxGeometry(w + 0.04, 0.04, d + 0.04), matMetal(0x333333));
  top.position.y = h * 0.7 + 0.02;
  // Monitor arm
  const arm = new Mesh(new CylinderGeometry(0.02, 0.02, h * 0.3, 8), matMetal(0x222222));
  arm.position.y = h * 0.85;
  const monitor = new Mesh(new BoxGeometry(w * 0.5, h * 0.25, 0.03), matPlastic(0x111111));
  monitor.position.y = h * 1.0;
  const disp = new Mesh(new PlaneGeometry(w * 0.45, h * 0.22), matLED(0x2277cc));
  disp.position.y = h * 1.0;
  disp.position.z = 0.02;
  return addMeshes(g, [body, top, arm, monitor, disp]);
}

// =============================================================================
// SOZIAL
// =============================================================================

export function buildLoungePouf(w: number, d: number, h: number): Group {
  const g = new Group();
  const pouf = new Mesh(new CylinderGeometry(w / 2, w / 2 * 1.1, h, 16), matFabric(0xcc7744));
  pouf.position.y = h / 2;
  return addMeshes(g, [pouf]);
}

export function buildBeanbag(w: number, d: number, h: number): Group {
  const g = new Group();
  const bag = new Mesh(new SphereGeometry(w / 2, 12, 10), matFabric(0x447766));
  bag.scale.set(1, 0.7, 1);
  bag.position.y = h * 0.5;
  return addMeshes(g, [bag]);
}

export function buildCommunalTable(w: number, d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new BoxGeometry(w, 0.05, d), matWood(0x6a4a2a));
  top.position.y = h - 0.025;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = new Mesh(new BoxGeometry(0.08, h - 0.05, 0.08), matWood(0x3a2a1a));
    leg.position.set(sx * (w / 2 - 0.15), (h - 0.05) / 2, sz * (d / 2 - 0.15));
    g.add(leg);
  }
  return addMeshes(g, [top]);
}

export function buildBoulderingWall(w: number, d: number, h: number): Group {
  const g = new Group();
  const wall = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x888888));
  wall.position.y = h / 2;
  // Holds — random bumps
  const colors = [0xff4444, 0x44aa44, 0x4466ff, 0xffaa22, 0xff44aa];
  for (let i = 0; i < 14; i++) {
    const c = colors[i % colors.length] ?? 0xff4444;
    const hold = new Mesh(new SphereGeometry(0.06 + Math.random() * 0.03, 8, 6), matPlastic(c));
    const randX = (Math.random() - 0.5) * w * 0.9;
    const randY = 0.3 + Math.random() * (h - 0.6);
    hold.position.set(randX, randY, d / 2 + 0.04);
    g.add(hold);
  }
  return addMeshes(g, [wall]);
}

export function buildFoosball(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.7, d), matWood(0x3a2a1a));
  body.position.y = h * 0.35;
  const field = new Mesh(new PlaneGeometry(w * 0.92, d * 0.92), matFabric(0x226622));
  field.rotation.x = -Math.PI / 2;
  field.position.y = h * 0.71;
  // 4 rods across
  for (let i = 0; i < 8; i++) {
    const rod = new Mesh(new CylinderGeometry(0.01, 0.01, w + 0.15, 6), matMetal(0xaaaaaa));
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, h * 0.73, -d / 2 + 0.1 + i * d * 0.11);
    g.add(rod);
  }
  // 4 legs
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = new Mesh(new BoxGeometry(0.06, h * 0.7, 0.06), matWood(0x3a2a1a));
    leg.position.set(sx * (w / 2 - 0.05), h * 0.35, sz * (d / 2 - 0.05));
    g.add(leg);
  }
  return addMeshes(g, [body, field]);
}

export function buildDartboard(w: number, d: number, h: number): Group {
  const g = new Group();
  const cab = new Mesh(new BoxGeometry(w, h, d), matWood(0x222222));
  cab.position.y = h / 2;
  const board = new Mesh(new CylinderGeometry(w * 0.4, w * 0.4, 0.02, 32), matFabric(0x222222));
  board.rotation.x = Math.PI / 2;
  board.position.set(0, h / 2, d / 2 + 0.01);
  const bullseye = new Mesh(new CylinderGeometry(w * 0.04, w * 0.04, 0.025, 16), matFabric(0xff2222));
  bullseye.rotation.x = Math.PI / 2;
  bullseye.position.set(0, h / 2, d / 2 + 0.012);
  return addMeshes(g, [cab, board, bullseye]);
}

export function buildArcadeCabinet(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matWood(0x1a1a2a));
  body.position.y = h / 2;
  const screen = new Mesh(new PlaneGeometry(w * 0.75, h * 0.3), matLED(0x44aaff));
  screen.position.set(0, h * 0.75, d / 2 + 0.001);
  // Control panel tilted
  const panel = new Mesh(new BoxGeometry(w * 0.85, 0.04, d * 0.3), matMetal(0x333333));
  panel.rotation.x = -0.3;
  panel.position.set(0, h * 0.5, d / 2 - d * 0.18);
  // Joystick knobs
  for (const sx of [-1, 1]) {
    const stick = new Mesh(new SphereGeometry(0.03, 8, 6), matPlastic(0xff4400));
    stick.position.set(sx * w * 0.2, h * 0.56, d / 2 - d * 0.15);
    g.add(stick);
  }
  // Marquee light on top
  const marquee = new Mesh(new PlaneGeometry(w * 0.85, h * 0.08), matLED(0xffff44));
  marquee.position.set(0, h * 0.92, d / 2 + 0.001);
  return addMeshes(g, [body, screen, panel, marquee]);
}

// =============================================================================
// SANITÄR
// =============================================================================

export function buildAccessibleWc(w: number, d: number, h: number): Group {
  const g = new Group();
  const bowl = new Mesh(new BoxGeometry(w * 0.5, h * 0.55, d * 0.8), matPlastic(0xffffff));
  bowl.position.set(0, h * 0.55 / 2, 0);
  const tank = new Mesh(new BoxGeometry(w * 0.5, h * 0.35, d * 0.25), matPlastic(0xffffff));
  tank.position.set(0, h * 0.55 + h * 0.35 / 2, -d * 0.27);
  // Grab rails
  const rail1 = new Mesh(new CylinderGeometry(0.02, 0.02, d * 0.8, 8), matMetal(0xaaaaaa));
  rail1.rotation.x = Math.PI / 2;
  rail1.position.set(w * 0.45, h * 0.5, 0);
  const rail2 = rail1.clone();
  rail2.position.x = -w * 0.45;
  return addMeshes(g, [bowl, tank, rail1, rail2]);
}

export function buildChangingTable(w: number, d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new BoxGeometry(w, h * 0.1, d), matPlastic(0xeeeeee));
  top.position.y = h * 0.95;
  // Edge rails
  for (const sx of [-1, 1]) {
    const rail = new Mesh(new BoxGeometry(0.04, h * 0.15, d), matPlastic(0xdddddd));
    rail.position.set(sx * (w / 2 - 0.02), h * 0.95 + 0.04, 0);
    g.add(rail);
  }
  const brace = new Mesh(new BoxGeometry(w, h * 0.85, d * 0.1), matWood(0xc8a572));
  brace.position.set(0, h * 0.85 / 2, -d / 2 + 0.05);
  for (const sx of [-1, 1]) {
    const leg = new Mesh(new CylinderGeometry(0.02, 0.02, h * 0.85, 8), matMetal(0x555555));
    leg.position.set(sx * (w / 2 - 0.05), h * 0.85 / 2, d / 2 - 0.05);
    g.add(leg);
  }
  return addMeshes(g, [top, brace]);
}

export function buildUrinalBlock(w: number, d: number, h: number): Group {
  const g = new Group();
  for (let i = 0; i < 3; i++) {
    const u = new Mesh(new BoxGeometry(w * 0.3, h * 0.55, d * 0.8), matPlastic(0xffffff));
    u.position.set(-w * 0.32 + i * w * 0.32, h * 0.35 + h * 0.55 / 2, 0);
    // rounded front
    const front = new Mesh(new SphereGeometry(w * 0.15, 8, 8, 0, Math.PI, 0, Math.PI), matPlastic(0xffffff));
    front.position.copy(u.position);
    front.position.z = d / 2 * 0.6;
    g.add(u, front);
  }
  const divider1 = new Mesh(new BoxGeometry(0.02, h * 0.6, d * 0.7), matPlastic(0xdddddd));
  divider1.position.set(-w * 0.16, h * 0.55, 0);
  const divider2 = divider1.clone();
  divider2.position.x = w * 0.16;
  return addMeshes(g, [divider1, divider2]);
}

export function buildTowelDispenser(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0xeeeeee));
  body.position.y = h / 2;
  const slot = new Mesh(new BoxGeometry(w * 0.7, 0.015, 0.03), matPlastic(0x222222));
  slot.position.set(0, 0.05, d / 2 - 0.02);
  // Paper tongue
  const paper = new Mesh(new PlaneGeometry(w * 0.5, 0.05), matPaper());
  paper.rotation.x = Math.PI / 4;
  paper.position.set(0, -0.03, d / 2 - 0.01);
  return addMeshes(g, [body, slot, paper]);
}

export function buildTissueDispenser(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x333333));
  body.position.y = h / 2;
  const slot = new Mesh(new BoxGeometry(w * 0.5, 0.02, d * 0.7), matPlastic(0x111111));
  slot.position.y = h;
  const paper = new Mesh(new BoxGeometry(w * 0.45, 0.04, d * 0.65), matPaper());
  paper.position.y = h + 0.01;
  return addMeshes(g, [body, slot, paper]);
}

function matPaper() { return matPlastic(0xf5efe0); }

// =============================================================================
// Builder-Registry
// =============================================================================

export const CSC_BUILDER_MAP: Record<string, (w: number, d: number, h: number) => Group> = {
  // Anbau
  buildSeedlingStation, buildCuttingCabinet, buildDryingNet, buildPackagingStation,
  buildCompostBin, buildPhEcMeter, buildIrrigationTank,
  // Sicherheit
  buildSaferRoomPanel, buildAirlockDoor, buildWalkthroughScanner, buildBiometricReader,
  buildPanicButton, buildAlarmStrobe,
  // Ausgabe
  buildTastingCorner, buildConsultationBooth, buildOrderTerminal, buildMerchDisplay,
  // Lager
  buildGitterbox, buildEuroPallet, buildVacuumSealer, buildLabelPrinter, buildBatchTrackingStation,
  // Sozial
  buildLoungePouf, buildBeanbag, buildCommunalTable, buildBoulderingWall, buildFoosball,
  buildDartboard, buildArcadeCabinet,
  // Sanitär
  buildAccessibleWc, buildChangingTable, buildUrinalBlock, buildTowelDispenser, buildTissueDispenser,
};
