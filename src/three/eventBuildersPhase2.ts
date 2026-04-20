// P5.1-Phase2 — 20 neue Event-Builder für die zweite Verdopplungswelle.
// Die Basis-Builder aus eventBuilders.ts bleiben; hier nur Items für die
// der originale Katalog keinen treffenden Builder hatte (Pyro, Spiegel-
// kugel, Proszenium-Rahmen, Billardtisch-Cousin etc.). Viele weitere
// neue Items der Phase 2 reusen bestehende Builder mit anderen Dims.

import {
  Group, Mesh,
  BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry,
  PlaneGeometry, ConeGeometry, DoubleSide,
} from 'three';
import {
  matWood, matMetal, matFabric, matPlastic, matGlassPhys, matLED,
  matConcrete, matLeather,
  imageMapMaterial,
  type ImageAspect,
} from './materials.js';

function addMeshes(g: Group, meshes: Mesh[]): Group {
  for (const m of meshes) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
  return g;
}

interface BuilderOpts {
  imageMap?: string;
  imageMapAspect?: ImageAspect;
}
function imgOrFallback(opts: BuilderOpts | undefined, fallback: () => Mesh['material']) {
  if (opts && opts.imageMap) return imageMapMaterial(opts.imageMap, opts.imageMapAspect ?? 'cover');
  return fallback();
}

// ── Bühne / Podium ──────────────────────────────────────────────────────
export function buildProscenium(w: number, d: number, h: number): Group {
  const g = new Group();
  const left = new Mesh(new BoxGeometry(d, h, d), matWood(0x3a2a1a));
  left.position.set(-w/2 + d/2, h/2, 0);
  const right = left.clone();
  right.position.x = w/2 - d/2;
  const top = new Mesh(new BoxGeometry(w, 0.3, d), matWood(0x3a2a1a));
  top.position.y = h - 0.15;
  return addMeshes(g, [left, right, top]);
}
export function buildLectern(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.88, d), matWood(0x4a2a1a));
  body.position.y = h * 0.44;
  const top = new Mesh(new BoxGeometry(w * 1.08, 0.04, d * 1.2), matWood(0x2a1a0a));
  top.position.y = h * 0.88;
  top.rotation.x = -0.18;
  const mic = new Mesh(new CylinderGeometry(0.008, 0.012, 0.25, 6), matMetal(0x111111));
  mic.position.set(0, h + 0.05, 0);
  mic.rotation.z = 0.15;
  return addMeshes(g, [body, top, mic]);
}
export function buildIntervalWall(w: number, d: number, h: number): Group {
  const g = new Group();
  const panel = new Mesh(new BoxGeometry(w, h, d), matFabric(0x302030));
  panel.position.y = h/2;
  const frame = new Mesh(new BoxGeometry(w+0.04, 0.04, d+0.04), matMetal(0x444444));
  frame.position.y = h;
  return addMeshes(g, [panel, frame]);
}
export function buildStageTile(w: number, d: number, h: number): Group {
  const g = new Group();
  const tile = new Mesh(new BoxGeometry(w, h, d), matWood(0x3a2a1a));
  tile.position.y = h/2;
  // Riffelboden-Textur approximieren via dunkle Quer-Stripes
  for (let i = 0; i < 4; i++) {
    const stripe = new Mesh(new BoxGeometry(w * 0.94, 0.003, 0.008), matMetal(0x111111));
    stripe.position.set(0, h - 0.002, -d * 0.35 + i * d * 0.23);
    g.add(stripe);
  }
  return addMeshes(g, [tile]);
}

// ── Bestuhlung ──────────────────────────────────────────────────────────
export function buildCinemaChair(w: number, d: number, h: number): Group {
  const g = new Group();
  const base = new Mesh(new BoxGeometry(w * 0.9, 0.08, d * 0.9), matMetal(0x222222));
  base.position.y = 0.25;
  const seat = new Mesh(new BoxGeometry(w * 0.9, 0.09, d * 0.8), matFabric(0x6a2a2a));
  seat.position.y = 0.45;
  seat.rotation.x = 0.1;
  const back = new Mesh(new BoxGeometry(w * 0.9, h * 0.65, 0.09), matFabric(0x6a2a2a));
  back.position.set(0, 0.45 + h * 0.33, -d * 0.4 + 0.05);
  const armL = new Mesh(new BoxGeometry(0.04, 0.15, d * 0.75), matMetal(0x222222));
  armL.position.set(-w * 0.45, 0.55, 0);
  const armR = armL.clone(); armR.position.x = w * 0.45;
  return addMeshes(g, [base, seat, back, armL, armR]);
}
export function buildSwivelBarstool(w: number, _d: number, h: number): Group {
  const g = new Group();
  const seat = new Mesh(new CylinderGeometry(w/2, w/2, 0.06, 16), matLeather(0x222222));
  seat.position.y = h - 0.03;
  const swivel = new Mesh(new CylinderGeometry(w * 0.35, w * 0.38, 0.04, 12), matMetal(0x222222));
  swivel.position.y = h - 0.08;
  const pole = new Mesh(new CylinderGeometry(0.025, 0.025, h - 0.1, 8), matMetal(0xaaaaaa));
  pole.position.y = (h - 0.1) / 2;
  const base = new Mesh(new CylinderGeometry(w * 0.4, w * 0.45, 0.025, 16), matMetal(0x555555));
  base.position.y = 0.012;
  return addMeshes(g, [seat, swivel, pole, base]);
}
export function buildTribuneRow(w: number, d: number, h: number): Group {
  const g = new Group();
  // 4-seater stadium bench on tiered base
  const base = new Mesh(new BoxGeometry(w, h * 0.5, d), matConcrete(0x777777));
  base.position.y = h * 0.25;
  const seat = new Mesh(new BoxGeometry(w * 0.96, 0.05, d * 0.4), matPlastic(0x2a4aaa));
  seat.position.set(0, h * 0.55, -d * 0.2);
  const back = new Mesh(new BoxGeometry(w * 0.96, h * 0.4, 0.05), matPlastic(0x2a4aaa));
  back.position.set(0, h * 0.75, -d * 0.4);
  return addMeshes(g, [base, seat, back]);
}
export function buildAudienceBench(w: number, d: number, h: number): Group {
  const g = new Group();
  const seat = new Mesh(new BoxGeometry(w, 0.05, d * 0.6), matWood(0x4a3a1a));
  seat.position.set(0, h * 0.5, 0);
  for (const sx of [-1, 1]) {
    const leg = new Mesh(new BoxGeometry(0.06, h * 0.5, d * 0.6), matMetal(0x222222));
    leg.position.set(sx * (w/2 - 0.03), h * 0.25, 0);
    g.add(leg);
  }
  return addMeshes(g, [seat]);
}

// ── Technik/Medien ──────────────────────────────────────────────────────
export function buildMediaServer(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0x1a1a1a));
  body.position.y = h/2;
  // Rack-Slots mit LEDs
  for (let i = 0; i < 5; i++) {
    const slot = new Mesh(new BoxGeometry(w * 0.9, h * 0.14, 0.005), matMetal(0x111111));
    slot.position.set(0, h * 0.1 + i * h * 0.17, d/2 + 0.003);
    const led = new Mesh(new BoxGeometry(0.015, 0.008, 0.003), matLED(0x00ff44));
    led.position.set(w * 0.4, h * 0.1 + i * h * 0.17, d/2 + 0.006);
    g.add(slot, led);
  }
  return addMeshes(g, [body]);
}
export function buildLavalierMic(w: number, _d: number, h: number): Group {
  const g = new Group();
  const clip = new Mesh(new BoxGeometry(w * 0.5, 0.01, w * 0.3), matMetal(0x222222));
  clip.position.y = h * 0.5;
  const mic = new Mesh(new SphereGeometry(0.008, 8, 6), matMetal(0x111111));
  mic.position.set(w * 0.25, h * 0.55, 0);
  const cable = new Mesh(new CylinderGeometry(0.002, 0.002, h * 0.6, 4), matPlastic(0x111111));
  cable.position.set(0, h * 0.25, 0);
  return addMeshes(g, [clip, mic, cable]);
}

// ── Licht/Effekte ───────────────────────────────────────────────────────
export function buildPyroCandle(w: number, _d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new CylinderGeometry(w * 0.35, w * 0.4, h * 0.85, 12), matMetal(0x555555));
  body.position.y = h * 0.425;
  const top = new Mesh(new CylinderGeometry(w * 0.3, w * 0.3, 0.02, 12), matMetal(0x222222));
  top.position.y = h * 0.86;
  const spark = new Mesh(new ConeGeometry(w * 0.4, h * 0.3, 8), matLED(0xffaa22));
  spark.position.y = h * 1.0;
  return addMeshes(g, [body, top, spark]);
}
export function buildMirrorBall(w: number, _d: number, h: number): Group {
  const g = new Group();
  const ball = new Mesh(new SphereGeometry(w/2, 24, 20), matMetal(0xffffff));
  ball.position.y = h - w/2;
  const chain = new Mesh(new CylinderGeometry(0.003, 0.003, h - w, 4), matMetal(0x888888));
  chain.position.y = (h - w) / 2;
  return addMeshes(g, [ball, chain]);
}
export function buildWashLight(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new CylinderGeometry(w/2, w/2 * 0.85, d, 16), matMetal(0x111111));
  body.rotation.x = Math.PI / 2;
  body.position.y = h * 0.6;
  const lens = new Mesh(new CylinderGeometry(w/2 * 0.92, w/2 * 0.92, 0.02, 16), matLED(0xff88ff));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, h * 0.6, d/2 - 0.005);
  const yoke = new Mesh(new TorusGeometry(w * 0.38, 0.02, 6, 16), matMetal(0x333333));
  yoke.position.y = h * 0.6;
  const stand = new Mesh(new CylinderGeometry(0.02, 0.02, h * 0.6, 8), matMetal(0x555555));
  stand.position.y = h * 0.3;
  return addMeshes(g, [body, lens, yoke, stand]);
}
export function buildProfileSpot(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new CylinderGeometry(w/2, w/2, d * 0.85, 16), matMetal(0x222222));
  body.rotation.x = Math.PI / 2;
  body.position.y = h * 0.55;
  const tube = new Mesh(new CylinderGeometry(w * 0.2, w * 0.2, d * 0.4, 12), matMetal(0x111111));
  tube.rotation.x = Math.PI / 2;
  tube.position.set(0, h * 0.55, d/2);
  const stand = new Mesh(new CylinderGeometry(0.02, 0.02, h * 0.5, 8), matMetal(0x555555));
  stand.position.y = h * 0.25;
  return addMeshes(g, [body, tube, stand]);
}
export function buildLaserProjector(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.7, d), matMetal(0x1a1a2a));
  body.position.y = h * 0.35;
  const lens = new Mesh(new CylinderGeometry(w * 0.15, w * 0.15, 0.02, 16), matGlassPhys(0x44ff88));
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, h * 0.35, d/2 + 0.005);
  return addMeshes(g, [body, lens]);
}

// ── Catering ────────────────────────────────────────────────────────────
export function buildGlassBar(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.85, d), matMetal(0x333333));
  body.position.y = h * 0.425;
  const top = new Mesh(new BoxGeometry(w + 0.04, 0.04, d + 0.04), matConcrete(0x555555));
  top.position.y = h * 0.85 + 0.02;
  // 3 Glasreihen obenauf
  for (let r = 0; r < 3; r++) {
    for (let i = 0; i < 5; i++) {
      const gl = new Mesh(new CylinderGeometry(0.025, 0.025, 0.12, 8), matGlassPhys(0xccddff));
      gl.position.set(-w/2 + 0.08 + i * (w - 0.16) / 4, h * 0.93, -d/2 + 0.08 + r * (d - 0.16) / 2);
      g.add(gl);
    }
  }
  return addMeshes(g, [body, top]);
}
export function buildBarBackWall(w: number, d: number, h: number, opts: BuilderOpts = {}): Group {
  const g = new Group();
  const wall = new Mesh(new BoxGeometry(w, h, d), matWood(0x2a1a0a));
  wall.position.y = h/2;
  // Logo-Panel oben mittig auf der Vorderseite (bedruckbar)
  if (opts.imageMap) {
    const logo = new Mesh(new PlaneGeometry(w * 0.5, h * 0.18), imgOrFallback(opts, () => matFabric(0xffffff)));
    logo.position.set(0, h * 0.87, d/2 + 0.001);
    g.add(logo);
  }
  // 4 Regalborden mit Flaschen-Dummys
  for (let r = 0; r < 3; r++) {
    const shelf = new Mesh(new BoxGeometry(w * 0.96, 0.02, d * 0.8), matWood(0x3a1a0a));
    shelf.position.set(0, h * 0.3 + r * h * 0.22, d * 0.05);
    g.add(shelf);
    for (let i = 0; i < 6; i++) {
      const bot = new Mesh(new CylinderGeometry(0.035, 0.035, 0.28, 8), matGlassPhys(0x228844 + i * 0x111100));
      bot.position.set(-w/2 + 0.12 + i * (w - 0.24) / 5, h * 0.3 + r * h * 0.22 + 0.15, d * 0.05);
      g.add(bot);
    }
  }
  return addMeshes(g, [wall]);
}
export function buildDishwasherCommercial(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0xcccccc));
  body.position.y = h/2;
  const door = new Mesh(new BoxGeometry(w * 0.88, h * 0.5, 0.03), matMetal(0xbbbbbb));
  door.position.set(0, h * 0.3, d/2 + 0.001);
  const handle = new Mesh(new CylinderGeometry(0.015, 0.015, w * 0.6, 8), matMetal(0x444444));
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, h * 0.45, d/2 + 0.03);
  return addMeshes(g, [body, door, handle]);
}
export function buildBeverageCooler(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0x222222));
  body.position.y = h/2;
  const door = new Mesh(new PlaneGeometry(w * 0.88, h * 0.85), matGlassPhys(0x88ccff));
  door.position.set(0, h * 0.5, d/2 + 0.001);
  // 3 Regalböden sichtbar durch Glas
  for (let i = 0; i < 3; i++) {
    const shelf = new Mesh(new BoxGeometry(w * 0.84, 0.02, d * 0.75), matMetal(0xaaaaaa));
    shelf.position.set(0, 0.15 + i * (h - 0.3) / 3, 0);
    g.add(shelf);
  }
  return addMeshes(g, [body, door]);
}

// ── Deko ────────────────────────────────────────────────────────────────
export function buildChairCover(w: number, d: number, h: number): Group {
  const g = new Group();
  // Stuhl-Hülle — formal stretch von Boden bis über Rücken
  const body = new Mesh(new BoxGeometry(w, h * 0.5, d), matFabric(0xffffff));
  body.position.y = h * 0.25;
  const back = new Mesh(new BoxGeometry(w, h * 0.55, 0.05), matFabric(0xffffff));
  back.position.set(0, h * 0.5 + h * 0.275, -d/2 + 0.025);
  return addMeshes(g, [body, back]);
}
export function buildTableLinen(w: number, d: number, h: number): Group {
  const g = new Group();
  const cloth = new Mesh(new BoxGeometry(w * 1.15, 0.01, d * 1.15), matFabric(0xffffff));
  cloth.position.y = h - 0.005;
  // Herabfallende Seitenteile
  const sideF = new Mesh(new PlaneGeometry(w * 1.1, h * 0.4), matFabric(0xffffff));
  sideF.material.side = DoubleSide;
  sideF.position.set(0, h * 0.8, d * 0.58);
  return addMeshes(g, [cloth, sideF]);
}
export function buildCenterpieceLux(w: number, _d: number, h: number): Group {
  const g = new Group();
  const dish = new Mesh(new CylinderGeometry(w/2, w/2 * 0.7, 0.04, 16), matGlassPhys(0xffffff));
  dish.position.y = h * 0.15;
  const candle = new Mesh(new CylinderGeometry(0.025, 0.025, h * 0.4, 12), matPlastic(0xffeeaa));
  candle.position.y = h * 0.4;
  const flame = new Mesh(new ConeGeometry(0.015, 0.04, 6), matLED(0xffcc44));
  flame.position.y = h * 0.65;
  return addMeshes(g, [dish, candle, flame]);
}
export function buildCandleStand(w: number, _d: number, h: number): Group {
  const g = new Group();
  const base = new Mesh(new CylinderGeometry(w * 0.4, w * 0.45, 0.04, 12), matMetal(0x555555));
  base.position.y = 0.02;
  const stem = new Mesh(new CylinderGeometry(0.015, 0.015, h * 0.85, 8), matMetal(0x666666));
  stem.position.y = h * 0.42 + 0.04;
  const cup = new Mesh(new CylinderGeometry(w * 0.15, w * 0.1, 0.05, 12), matMetal(0x555555));
  cup.position.y = h * 0.86;
  const flame = new Mesh(new ConeGeometry(w * 0.08, 0.06, 6), matLED(0xffcc44));
  flame.position.y = h * 0.94;
  return addMeshes(g, [base, stem, cup, flame]);
}
export function buildWelcomeBoard(w: number, d: number, h: number, opts: BuilderOpts = {}): Group {
  const g = new Group();
  const board = new Mesh(new BoxGeometry(w, h * 0.5, d), matWood(0x3a2a1a));
  board.position.y = h * 0.75;
  // Bedruckbare Fläche auf der Vorderseite
  const panel = new Mesh(new PlaneGeometry(w * 0.92, h * 0.45), imgOrFallback(opts, () => matFabric(0xffffff)));
  panel.position.set(0, h * 0.75, d/2 + 0.001);
  g.add(panel);
  const easel1 = new Mesh(new CylinderGeometry(0.02, 0.02, h, 6), matWood(0x3a2a1a));
  easel1.position.set(-w * 0.3, h/2, 0.15);
  easel1.rotation.z = 0.1;
  const easel2 = easel1.clone();
  easel2.position.set(w * 0.3, h/2, 0.15);
  easel2.rotation.z = -0.1;
  return addMeshes(g, [board, easel1, easel2]);
}

// ── Eingang ─────────────────────────────────────────────────────────────
export function buildPeopleCounter(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.4, d), matPlastic(0x333333));
  body.position.y = h * 0.2;
  const display = new Mesh(new PlaneGeometry(w * 0.7, h * 0.2), matLED(0xff2200));
  display.position.set(0, h * 0.2, d/2 + 0.001);
  const pole = new Mesh(new CylinderGeometry(0.02, 0.02, h * 0.6, 8), matMetal(0x666666));
  pole.position.y = h * 0.7;
  return addMeshes(g, [body, display, pole]);
}
export function buildAccessCardScanner(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x222222));
  body.position.y = h/2;
  const slot = new Mesh(new PlaneGeometry(w * 0.6, h * 0.15), matLED(0x00ccff));
  slot.position.set(0, h * 0.55, d/2 + 0.001);
  return addMeshes(g, [body, slot]);
}

// ── Outdoor ─────────────────────────────────────────────────────────────
export function buildBeachLoungerSet(w: number, d: number, h: number): Group {
  const g = new Group();
  // Zwei Liegen nebeneinander
  for (const sx of [-1, 1]) {
    const bed = new Mesh(new BoxGeometry(w * 0.45, 0.1, d), matFabric(0xeeeeaa));
    bed.position.set(sx * w * 0.25, h * 0.4, 0);
    bed.rotation.x = -0.08;
    const frame = new Mesh(new BoxGeometry(w * 0.46, 0.03, d * 1.02), matWood(0x3a2a1a));
    frame.position.set(sx * w * 0.25, h * 0.35, 0);
    g.add(bed, frame);
  }
  return addMeshes(g, []);
}
export function buildPavilionSidewall(w: number, d: number, h: number): Group {
  const g = new Group();
  const wall = new Mesh(new PlaneGeometry(w, h), matFabric(0xffffff));
  wall.material.side = DoubleSide;
  wall.position.y = h/2;
  const rod = new Mesh(new CylinderGeometry(0.015, 0.015, w, 6), matMetal(0xaaaaaa));
  rod.rotation.z = Math.PI / 2;
  rod.position.y = h;
  return addMeshes(g, [wall, rod]);
}

// ── Equipment/Extras ────────────────────────────────────────────────────
export function buildTripodSpotlight(w: number, _d: number, h: number): Group {
  const g = new Group();
  // LED-Fluter auf 3-Bein-Stativ
  const head = new Mesh(new BoxGeometry(w, 0.12, 0.1), matMetal(0x222222));
  head.position.y = h - 0.06;
  const lens = new Mesh(new PlaneGeometry(w * 0.8, 0.08), matLED(0xffffdd));
  lens.position.set(0, h - 0.06, 0.051);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new Mesh(new CylinderGeometry(0.01, 0.01, h * 0.9, 6), matMetal(0x555555));
    leg.position.set(Math.cos(a) * w * 0.2, h * 0.45, Math.sin(a) * w * 0.2);
    leg.rotation.z = Math.cos(a) * 0.18;
    leg.rotation.x = Math.sin(a) * 0.18;
    g.add(leg);
  }
  return addMeshes(g, [head, lens]);
}

// =============================================================================
// Registry
// =============================================================================
export const EVENT_BUILDER_MAP_P2: Record<string, (w: number, d: number, h: number) => Group> = {
  buildProscenium, buildLectern, buildIntervalWall, buildStageTile,
  buildCinemaChair, buildSwivelBarstool, buildTribuneRow, buildAudienceBench,
  buildMediaServer, buildLavalierMic,
  buildPyroCandle, buildMirrorBall, buildWashLight, buildProfileSpot, buildLaserProjector,
  buildGlassBar, buildBarBackWall, buildDishwasherCommercial, buildBeverageCooler,
  buildChairCover, buildTableLinen, buildCenterpieceLux, buildCandleStand, buildWelcomeBoard,
  buildPeopleCounter, buildAccessCardScanner,
  buildBeachLoungerSet, buildPavilionSidewall,
  buildTripodSpotlight,
};
