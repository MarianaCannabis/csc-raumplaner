// Rich primitive 3D builders for P3.2 rich-primitives path.
//
// Each builder returns a THREE.Group with one or more Meshes. The group
// origin convention matches build3DObj: x=0 centre, z=0 centre, y=0
// floor. Dimensions (w/d/h) are the catalog target size in meters; the
// builder lays out geometry to fill those bounds without stretching.
//
// No textures, no network. Materials from ./materials.js — all procedural
// MeshStandardMaterial + MeshPhysicalMaterial (sheen fabric + transmission
// glass). PBR looks richer than flat primitives; zero runtime loading.

import {
  Group,
  Mesh,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  TorusGeometry,
  PlaneGeometry,
  DoubleSide,
  type MeshStandardMaterial,
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
  imageMapMaterial,
  type ImageAspect,
} from './materials.js';
import { EVENT_BUILDER_MAP } from './eventBuilders.js';
import { CSC_BUILDER_MAP } from './cscBuilders.js';
import { EVENT_BUILDER_MAP_P2 } from './eventBuildersPhase2.js';
import { CSC_BUILDER_MAP_P2 } from './cscBuildersPhase2.js';

// P4.2 — opts bag threaded from build3DObj (index.html) to every builder.
// Only the Messe builders currently read any fields; others ignore the arg.
export interface BuilderOpts {
  imageMap?: string;
  imageMapAspect?: ImageAspect;
}

// Shared helper: adds all meshes to a group and marks them cast/receive shadow.
function addMeshes(g: Group, meshes: Mesh[]): Group {
  for (const m of meshes) {
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  }
  return g;
}

// =============================================================================
// BÜRO
// =============================================================================

export function buildOfficeChair(w: number, _d: number, h: number): Group {
  const g = new Group();
  // 5-star base with casters
  const baseR = w * 0.45;
  const base = new Mesh(new CylinderGeometry(0.03, 0.03, 0.01, 8), matMetal());
  base.position.y = 0.03;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const arm = new Mesh(new BoxGeometry(baseR, 0.03, 0.04), matMetal());
    arm.position.set(Math.cos(a) * baseR / 2, 0.03, Math.sin(a) * baseR / 2);
    arm.rotation.y = a;
    g.add(arm);
    const wheel = new Mesh(new SphereGeometry(0.025, 8, 6), matPlastic(0x222222));
    wheel.position.set(Math.cos(a) * baseR, 0.025, Math.sin(a) * baseR);
    g.add(wheel);
  }
  // Gas lift
  const lift = new Mesh(new CylinderGeometry(0.025, 0.025, h * 0.45, 8), matMetal());
  lift.position.y = 0.06 + (h * 0.45) / 2;
  // Seat
  const seatY = 0.06 + h * 0.45 + 0.04;
  const seat = new Mesh(new BoxGeometry(w * 0.9, 0.08, w * 0.9), matFabric());
  seat.position.y = seatY;
  // Back
  const back = new Mesh(new BoxGeometry(w * 0.85, h * 0.45, 0.06), matFabric());
  back.position.set(0, seatY + h * 0.25, -w * 0.4);
  return addMeshes(g, [base, lift, seat, back]);
}

export function buildDesk(w: number, d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new BoxGeometry(w, 0.04, d), matWood(0xa08060));
  top.position.y = h - 0.02;
  const legs: Mesh[] = [];
  const legOff = 0.06;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = new Mesh(new BoxGeometry(0.05, h - 0.04, 0.05), matMetal(0x444444));
    leg.position.set((w / 2 - legOff) * sx, (h - 0.04) / 2, (d / 2 - legOff) * sz);
    legs.push(leg);
  }
  return addMeshes(g, [top, ...legs]);
}

export function buildFilingCabinet(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0x667688));
  body.position.y = h / 2;
  const drawers: Mesh[] = [];
  const drawerH = (h - 0.04) / 3;
  for (let i = 0; i < 3; i++) {
    const dr = new Mesh(new BoxGeometry(w * 0.92, drawerH * 0.9, 0.02), matMetal(0x8090a0));
    dr.position.set(0, 0.02 + drawerH / 2 + i * drawerH + drawerH * 0.05, d / 2 + 0.011);
    drawers.push(dr);
    const handle = new Mesh(new BoxGeometry(w * 0.3, 0.02, 0.025), matMetal(0x333333));
    handle.position.set(0, dr.position.y, d / 2 + 0.03);
    drawers.push(handle);
  }
  return addMeshes(g, [body, ...drawers]);
}

export function buildBookshelf(w: number, d: number, h: number): Group {
  const g = new Group();
  const frameMat = matWood(0xb08060);
  const back = new Mesh(new BoxGeometry(w, h, 0.02), frameMat);
  back.position.set(0, h / 2, -d / 2 + 0.01);
  const left = new Mesh(new BoxGeometry(0.03, h, d), frameMat);
  left.position.set(-w / 2 + 0.015, h / 2, 0);
  const right = new Mesh(new BoxGeometry(0.03, h, d), frameMat);
  right.position.set(w / 2 - 0.015, h / 2, 0);
  const shelves: Mesh[] = [];
  const n = Math.max(2, Math.floor(h / 0.35));
  for (let i = 0; i < n; i++) {
    const sh = new Mesh(new BoxGeometry(w - 0.06, 0.02, d - 0.02), frameMat);
    sh.position.set(0, 0.01 + (i / n) * h + h / (n * 2), 0);
    shelves.push(sh);
    // A few books per shelf
    for (let b = 0; b < 4; b++) {
      const bh = 0.2 + Math.random() * 0.1;
      const book = new Mesh(new BoxGeometry(0.04, bh, d * 0.7), matPlastic(0x333333 + b * 0x224488));
      book.position.set(-w / 2 + 0.1 + b * 0.08, sh.position.y + bh / 2 + 0.01, 0);
      shelves.push(book);
    }
  }
  return addMeshes(g, [back, left, right, ...shelves]);
}

export function buildConferenceTable(w: number, d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new BoxGeometry(w, 0.05, d), matWood(0x604020));
  top.position.y = h - 0.025;
  const pedestal = new Mesh(new CylinderGeometry(0.15, 0.2, h - 0.05, 12), matMetal(0x222222));
  pedestal.position.y = (h - 0.05) / 2;
  const base = new Mesh(new CylinderGeometry(w * 0.2, w * 0.2, 0.04, 16), matMetal(0x222222));
  base.position.y = 0.02;
  return addMeshes(g, [top, pedestal, base]);
}

export function buildWhiteboard(w: number, d: number, h: number): Group {
  const g = new Group();
  const frame = new Mesh(new BoxGeometry(w, h, d), matMetal(0xbbbbbb));
  frame.position.y = h / 2;
  const surface = new Mesh(new BoxGeometry(w - 0.04, h - 0.04, d + 0.005), matPlastic(0xfcfcfc));
  surface.position.y = h / 2;
  return addMeshes(g, [frame, surface]);
}

// =============================================================================
// EMPFANG / AUSGABE
// =============================================================================

export function buildReceptionDesk(w: number, d: number, h: number): Group {
  const g = new Group();
  const bodyMat = matWood(0x8a6030);
  const top = new Mesh(new BoxGeometry(w, 0.04, d), matWood(0x604020));
  top.position.y = h - 0.02;
  const front = new Mesh(new BoxGeometry(w, h - 0.04, 0.02), bodyMat);
  front.position.set(0, (h - 0.04) / 2, d / 2 - 0.01);
  const back = new Mesh(new BoxGeometry(w, h - 0.04, 0.02), bodyMat);
  back.position.set(0, (h - 0.04) / 2, -d / 2 + 0.01);
  const left = new Mesh(new BoxGeometry(0.02, h - 0.04, d), bodyMat);
  left.position.set(-w / 2, (h - 0.04) / 2, 0);
  const right = new Mesh(new BoxGeometry(0.02, h - 0.04, d), bodyMat);
  right.position.set(w / 2, (h - 0.04) / 2, 0);
  // Front panel accent
  const accent = new Mesh(new BoxGeometry(w * 0.8, 0.05, 0.02), matLED(0x88aa88));
  accent.position.set(0, h - 0.3, d / 2 + 0.011);
  return addMeshes(g, [top, front, back, left, right, accent]);
}

export function buildDispensingCounter(w: number, d: number, h: number): Group {
  const g = new Group();
  const bodyMat = matWood(0xc0a070);
  const counter = buildReceptionDesk(w, d, h);
  g.add(counter);
  // Glass display case on top
  const glass = new Mesh(new BoxGeometry(w * 0.8, 0.35, d * 0.6), matGlassPhys(0xcceeff));
  glass.position.set(0, h + 0.18, 0);
  // LED under-counter strip
  const led = new Mesh(new BoxGeometry(w * 0.9, 0.015, 0.02), matLED(0xffcc88));
  led.position.set(0, 0.05, d / 2 + 0.015);
  return addMeshes(g, [glass, led]);
}

export function buildConsultingBooth(w: number, d: number, h: number): Group {
  const g = new Group();
  const fabric = matFabric(0x5a6a7a);
  // Three semi-enclosed panels
  const back = new Mesh(new BoxGeometry(w, h, 0.05), fabric);
  back.position.set(0, h / 2, -d / 2 + 0.025);
  const left = new Mesh(new BoxGeometry(0.05, h, d), fabric);
  left.position.set(-w / 2 + 0.025, h / 2, 0);
  const right = new Mesh(new BoxGeometry(0.05, h, d), fabric);
  right.position.set(w / 2 - 0.025, h / 2, 0);
  // Internal table
  const tbl = new Mesh(new BoxGeometry(w * 0.7, 0.04, d * 0.5), matWood(0x604020));
  tbl.position.set(0, 0.72, 0);
  const leg = new Mesh(new CylinderGeometry(0.04, 0.04, 0.72, 8), matMetal());
  leg.position.set(0, 0.36, 0);
  return addMeshes(g, [back, left, right, tbl, leg]);
}

export function buildWaitingBench(w: number, d: number, h: number): Group {
  const g = new Group();
  const frameMat = matMetal(0x303030);
  const seat = new Mesh(new BoxGeometry(w, 0.08, d * 0.7), matFabric(0x334455));
  seat.position.set(0, h * 0.5, 0);
  const back = new Mesh(new BoxGeometry(w, h * 0.5, 0.08), matFabric(0x334455));
  back.position.set(0, h * 0.75, -d / 2 + 0.04);
  const legs: Mesh[] = [];
  for (const sx of [-1, 1]) {
    const leg = new Mesh(new BoxGeometry(0.05, h * 0.5, 0.05), frameMat);
    leg.position.set(sx * (w / 2 - 0.08), h * 0.25, 0);
    legs.push(leg);
  }
  return addMeshes(g, [seat, back, ...legs]);
}

export function buildLockerRow(w: number, d: number, h: number): Group {
  const g = new Group();
  const doorMat = matMetal(0x668899);
  const frameMat = matMetal(0x445566);
  const frame = new Mesh(new BoxGeometry(w, h, d), frameMat);
  frame.position.y = h / 2;
  const nLockers = Math.max(2, Math.floor(w / 0.35));
  const lw = w / nLockers;
  const doors: Mesh[] = [];
  for (let i = 0; i < nLockers; i++) {
    const door = new Mesh(new BoxGeometry(lw * 0.92, h - 0.06, 0.02), doorMat);
    door.position.set(-w / 2 + lw / 2 + i * lw, h / 2, d / 2 + 0.011);
    doors.push(door);
    const handle = new Mesh(new SphereGeometry(0.02, 8, 6), matMetal(0x222222));
    handle.position.set(door.position.x + lw * 0.3, h / 2, d / 2 + 0.04);
    doors.push(handle);
  }
  return addMeshes(g, [frame, ...doors]);
}

// =============================================================================
// CSC-ANBAU
// =============================================================================

export function buildGrowTent(w: number, d: number, h: number): Group {
  const g = new Group();
  const barMat = matMetal(0xcccccc);
  const fabricM = matFabric(0x1a1a1a);
  fabricM.side = DoubleSide;
  // 4 verticals
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const bar = new Mesh(new CylinderGeometry(0.015, 0.015, h, 8), barMat);
    bar.position.set((w / 2 - 0.01) * sx, h / 2, (d / 2 - 0.01) * sz);
    g.add(bar);
  }
  // Top frame (4 bars)
  for (const [p0, p1] of [
    [[-1, 1], [1, 1]], [[-1, -1], [1, -1]],
    [[-1, -1], [-1, 1]], [[1, -1], [1, 1]],
  ] as const) {
    const len = p0[0] === p1[0] ? d : w;
    const bar = new Mesh(new CylinderGeometry(0.015, 0.015, len, 8), barMat);
    bar.position.set(((p0[0] + p1[0]) / 2) * (w / 2 - 0.01), h - 0.01, ((p0[1] + p1[1]) / 2) * (d / 2 - 0.01));
    if (p0[0] !== p1[0]) bar.rotation.z = Math.PI / 2;
    else bar.rotation.x = Math.PI / 2;
    g.add(bar);
  }
  // 4 side panels + top
  const panelFront = new Mesh(new PlaneGeometry(w, h), fabricM);
  panelFront.position.set(0, h / 2, d / 2);
  const panelBack = panelFront.clone();
  panelBack.position.z = -d / 2;
  panelBack.rotation.y = Math.PI;
  const panelLeft = new Mesh(new PlaneGeometry(d, h), fabricM);
  panelLeft.position.set(-w / 2, h / 2, 0);
  panelLeft.rotation.y = Math.PI / 2;
  const panelRight = panelLeft.clone();
  panelRight.position.x = w / 2;
  panelRight.rotation.y = -Math.PI / 2;
  const panelTop = new Mesh(new PlaneGeometry(w, d), fabricM);
  panelTop.position.set(0, h - 0.005, 0);
  panelTop.rotation.x = Math.PI / 2;
  g.add(panelFront, panelBack, panelLeft, panelRight, panelTop);
  // LED inside
  const led = new Mesh(new BoxGeometry(w * 0.7, 0.05, d * 0.7), matLED(0xffccaa));
  led.position.y = h - 0.1;
  g.add(led);
  return g;
}

export function buildDryingRack(w: number, d: number, h: number): Group {
  const g = new Group();
  const frameMat = matMetal(0xaaaaaa);
  const meshMat = matFabric(0x888888);
  // 4 legs
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = new Mesh(new CylinderGeometry(0.015, 0.015, h, 6), frameMat);
    leg.position.set((w / 2 - 0.02) * sx, h / 2, (d / 2 - 0.02) * sz);
    g.add(leg);
  }
  // 6 tiers of mesh
  for (let i = 1; i <= 6; i++) {
    const y = (i / 7) * h;
    const tier = new Mesh(new BoxGeometry(w - 0.04, 0.01, d - 0.04), meshMat);
    tier.position.y = y;
    g.add(tier);
  }
  return g;
}

export function buildLedGrowLight(w: number, d: number, h: number): Group {
  const g = new Group();
  const housing = new Mesh(new BoxGeometry(w, h * 0.3, d), matMetal(0xaaaaaa));
  housing.position.y = h - h * 0.15;
  const panel = new Mesh(new BoxGeometry(w * 0.9, 0.02, d * 0.9), matLED(0xff66aa));
  panel.position.y = h - h * 0.3 - 0.01;
  return addMeshes(g, [housing, panel]);
}

export function buildVentilationFan(w: number, d: number, h: number): Group {
  const g = new Group();
  const s = Math.min(w, h);
  const housing = new Mesh(new CylinderGeometry(s / 2, s / 2, d, 16), matMetal(0x555555));
  housing.rotation.x = Math.PI / 2;
  housing.position.y = s / 2;
  const hub = new Mesh(new CylinderGeometry(s * 0.15, s * 0.15, d + 0.01, 8), matMetal(0x222222));
  hub.rotation.x = Math.PI / 2;
  hub.position.y = s / 2;
  for (let i = 0; i < 4; i++) {
    const blade = new Mesh(new BoxGeometry(s * 0.4, 0.01, d * 0.5), matMetal(0x444444));
    blade.rotation.z = (i / 4) * Math.PI * 2;
    blade.position.y = s / 2;
    g.add(blade);
  }
  return addMeshes(g, [housing, hub]);
}

export function buildHarvestBin(w: number, d: number, h: number): Group {
  const g = new Group();
  const bin = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x446644));
  bin.position.y = h / 2;
  const lid = new Mesh(new BoxGeometry(w * 1.02, 0.04, d * 1.02), matPlastic(0x224422));
  lid.position.y = h + 0.02;
  return addMeshes(g, [bin, lid]);
}

export function buildStorageCabinet(w: number, d: number, h: number): Group {
  const g = new Group();
  const bodyMat = matWood(0x8a6030);
  const body = new Mesh(new BoxGeometry(w, h, d), bodyMat);
  body.position.y = h / 2;
  // Two doors
  for (const sx of [-1, 1]) {
    const door = new Mesh(new BoxGeometry(w / 2 - 0.02, h - 0.06, 0.02), matWood(0x9a7040));
    door.position.set(sx * w / 4, h / 2, d / 2 + 0.011);
    g.add(door);
    const handle = new Mesh(new CylinderGeometry(0.015, 0.015, 0.1, 8), matMetal(0x222222));
    handle.rotation.z = Math.PI / 2;
    handle.position.set(sx * 0.04, h / 2, d / 2 + 0.03);
    g.add(handle);
  }
  return addMeshes(g, [body]);
}

// =============================================================================
// SICHERHEIT
// =============================================================================

export function buildSafeBox(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0x303030));
  body.position.y = h / 2;
  const door = new Mesh(new BoxGeometry(w * 0.85, h * 0.85, 0.02), matMetal(0x404040));
  door.position.set(0, h / 2, d / 2 + 0.011);
  const dial = new Mesh(new CylinderGeometry(0.06, 0.06, 0.02, 16), matMetal(0xaaaaaa));
  dial.rotation.x = Math.PI / 2;
  dial.position.set(0, h / 2, d / 2 + 0.025);
  const handle = new Mesh(new BoxGeometry(0.15, 0.02, 0.03), matMetal(0x888888));
  handle.position.set(w * 0.25, h / 2, d / 2 + 0.03);
  return addMeshes(g, [body, door, dial, handle]);
}

export function buildDomeCamera(w: number, _d: number, h: number): Group {
  const g = new Group();
  const r = Math.min(w, h) / 2;
  const base = new Mesh(new CylinderGeometry(r, r, 0.02, 16), matMetal(0xeeeeee));
  base.position.y = 0.01;
  const dome = new Mesh(new SphereGeometry(r * 0.9, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), matPlastic(0x111111));
  dome.position.y = 0.02;
  dome.rotation.x = Math.PI;
  return addMeshes(g, [base, dome]);
}

export function buildBulletCamera(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new CylinderGeometry(h / 2 * 0.8, h / 2 * 0.8, d, 12), matMetal(0xffffff));
  body.rotation.z = Math.PI / 2;
  body.position.y = h / 2;
  const lens = new Mesh(new CylinderGeometry(h / 2 * 0.55, h / 2 * 0.55, 0.03, 12), matGlassPhys(0x222222));
  lens.rotation.z = Math.PI / 2;
  lens.position.set(d / 2, h / 2, 0);
  const mount = new Mesh(new BoxGeometry(w * 0.2, h * 0.3, w * 0.2), matMetal(0xdddddd));
  mount.position.set(-d / 2 + 0.04, h * 0.85, 0);
  return addMeshes(g, [body, lens, mount]);
}

export function buildMotionSensor(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0xf0f0f0));
  body.position.y = h / 2;
  const lens = new Mesh(new SphereGeometry(Math.min(w, h) * 0.3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), matPlastic(0x333333));
  lens.position.set(0, h / 2, d / 2);
  return addMeshes(g, [body, lens]);
}

export function buildAlarmPanel(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0xeeeeee));
  body.position.y = h / 2;
  const screen = new Mesh(new BoxGeometry(w * 0.8, h * 0.3, 0.005), matPlastic(0x114411));
  screen.position.set(0, h * 0.7, d / 2 + 0.003);
  const keypad = new Mesh(new BoxGeometry(w * 0.7, h * 0.45, 0.005), matPlastic(0xdddddd));
  keypad.position.set(0, h * 0.3, d / 2 + 0.003);
  const light = new Mesh(new SphereGeometry(0.015, 6, 4), matLED(0xff3333));
  light.position.set(w * 0.35, h * 0.9, d / 2 + 0.01);
  return addMeshes(g, [body, screen, keypad, light]);
}

export function buildFireExtinguisher(w: number, d: number, h: number): Group {
  const g = new Group();
  const r = Math.min(w, d) / 2;
  const body = new Mesh(new CylinderGeometry(r, r, h * 0.8, 16), matMetal(0xcc2222));
  body.position.y = h * 0.4;
  const top = new Mesh(new CylinderGeometry(r * 0.3, r, h * 0.15, 12), matMetal(0x111111));
  top.position.y = h * 0.85;
  const handle = new Mesh(new BoxGeometry(r * 0.8, 0.03, 0.04), matMetal(0x222222));
  handle.position.y = h * 0.95;
  const hose = new Mesh(new CylinderGeometry(0.015, 0.015, h * 0.4, 6), matPlastic(0x222222));
  hose.rotation.z = Math.PI / 4;
  hose.position.set(r * 0.6, h * 0.6, 0);
  return addMeshes(g, [body, top, handle, hose]);
}

export function buildSmokeDetector(w: number, _d: number, h: number): Group {
  const g = new Group();
  const r = w / 2;
  const body = new Mesh(new CylinderGeometry(r, r * 0.85, h, 16), matPlastic(0xfafafa));
  body.position.y = h / 2;
  const grille = new Mesh(new CylinderGeometry(r * 0.6, r * 0.6, 0.005, 16), matPlastic(0xdddddd));
  grille.position.y = 0.002;
  const led = new Mesh(new SphereGeometry(0.005, 6, 4), matLED(0x00ff00));
  led.position.set(r * 0.5, 0.01, 0);
  return addMeshes(g, [body, grille, led]);
}

export function buildExitSign(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0x008833));
  body.position.y = h / 2;
  const face = new Mesh(new PlaneGeometry(w * 0.95, h * 0.8), matLED(0xffffff));
  face.position.set(0, h / 2, d / 2 + 0.002);
  return addMeshes(g, [body, face]);
}

// =============================================================================
// SOZIAL / KÜCHE
// =============================================================================

export function buildSofaModule(w: number, d: number, h: number): Group {
  const g = new Group();
  const fabric = matFabric(0x556677);
  const base = new Mesh(new BoxGeometry(w, h * 0.45, d), fabric);
  base.position.y = h * 0.225;
  const back = new Mesh(new BoxGeometry(w, h * 0.55, d * 0.2), fabric);
  back.position.set(0, h * 0.725, -d / 2 + d * 0.1);
  const armL = new Mesh(new BoxGeometry(d * 0.2, h * 0.6, d), fabric);
  armL.position.set(-w / 2 + d * 0.1, h * 0.3, 0);
  const armR = armL.clone();
  armR.position.x = w / 2 - d * 0.1;
  // Cushions
  const seats = Math.max(1, Math.floor(w / 0.8));
  const cushW = (w - d * 0.4) / seats;
  const cushions: Mesh[] = [];
  for (let i = 0; i < seats; i++) {
    const c = new Mesh(new BoxGeometry(cushW * 0.92, 0.15, d * 0.7), fabric);
    c.position.set(-w / 2 + d * 0.2 + cushW / 2 + i * cushW, h * 0.5, d * 0.05);
    cushions.push(c);
  }
  return addMeshes(g, [base, back, armL, armR, ...cushions]);
}

export function buildCoffeeTable(w: number, d: number, h: number): Group {
  const g = new Group();
  const top = new Mesh(new BoxGeometry(w, 0.04, d), matGlassPhys(0xccddee));
  top.position.y = h - 0.02;
  const frame = new Mesh(new BoxGeometry(w * 0.9, 0.02, d * 0.9), matMetal(0x333333));
  frame.position.y = h - 0.04;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = new Mesh(new CylinderGeometry(0.02, 0.02, h - 0.05, 8), matMetal(0x333333));
    leg.position.set((w / 2 - 0.05) * sx, (h - 0.05) / 2, (d / 2 - 0.05) * sz);
    g.add(leg);
  }
  return addMeshes(g, [top, frame]);
}

export function buildKitchenCounter(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matWood(0xc0a080));
  body.position.y = h / 2;
  const top = new Mesh(new BoxGeometry(w + 0.03, 0.03, d + 0.03), matConcrete(0x333333));
  top.position.y = h + 0.015;
  // Drawer lines
  const drawers: Mesh[] = [];
  for (let i = 0; i < 2; i++) {
    const dr = new Mesh(new BoxGeometry(w - 0.1, 0.02, 0.005), matMetal(0x222222));
    dr.position.set(0, h * 0.5 + i * h * 0.2, d / 2 + 0.005);
    drawers.push(dr);
  }
  return addMeshes(g, [body, top, ...drawers]);
}

export function buildFridge(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0xeeeeee));
  body.position.y = h / 2;
  const door1 = new Mesh(new BoxGeometry(w * 0.96, h * 0.55, 0.02), matMetal(0xf4f4f4));
  door1.position.set(0, h * 0.7, d / 2 + 0.011);
  const door2 = new Mesh(new BoxGeometry(w * 0.96, h * 0.38, 0.02), matMetal(0xf4f4f4));
  door2.position.set(0, h * 0.22, d / 2 + 0.011);
  const handle1 = new Mesh(new BoxGeometry(0.04, 0.3, 0.03), matMetal(0x888888));
  handle1.position.set(w * 0.4, h * 0.7, d / 2 + 0.03);
  const handle2 = handle1.clone();
  handle2.position.y = h * 0.22;
  return addMeshes(g, [body, door1, door2, handle1, handle2]);
}

export function buildSink(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.08, d), matMetal(0xcccccc));
  body.position.y = h - h * 0.04;
  const basin = new Mesh(new BoxGeometry(w * 0.75, h * 0.2, d * 0.75), matMetal(0xaaaaaa));
  basin.position.y = h - h * 0.14;
  const tap = new Mesh(new CylinderGeometry(0.02, 0.02, h * 0.15, 8), matMetal(0xaaaaaa));
  tap.position.set(0, h + h * 0.08, -d * 0.3);
  return addMeshes(g, [body, basin, tap]);
}

export function buildStool(w: number, _d: number, h: number): Group {
  const g = new Group();
  const seat = new Mesh(new CylinderGeometry(w / 2, w / 2, 0.05, 16), matWood(0x604020));
  seat.position.y = h - 0.025;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const leg = new Mesh(new CylinderGeometry(0.02, 0.02, h - 0.05, 6), matMetal(0x222222));
    leg.position.set(Math.cos(a) * w * 0.35, (h - 0.05) / 2, Math.sin(a) * w * 0.35);
    g.add(leg);
  }
  return addMeshes(g, [seat]);
}

// =============================================================================
// BAU
// =============================================================================

export function buildDoorRC2(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0x444444));
  body.position.y = h / 2;
  // Reinforcement strip
  for (let y of [h * 0.3, h * 0.5, h * 0.7]) {
    const strip = new Mesh(new BoxGeometry(w * 0.9, 0.02, d + 0.005), matMetal(0x222222));
    strip.position.y = y;
    g.add(strip);
  }
  const handle = new Mesh(new BoxGeometry(0.12, 0.03, 0.06), matMetal(0xaa9966));
  handle.position.set(w * 0.35, h * 0.5, d / 2 + 0.03);
  return addMeshes(g, [body, handle]);
}

export function buildDoorT90(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0xcc3311));
  body.position.y = h / 2;
  const sign = new Mesh(new BoxGeometry(w * 0.2, 0.15, 0.005), matPlastic(0xffffff));
  sign.position.set(0, h * 0.8, d / 2 + 0.003);
  const handle = new Mesh(new BoxGeometry(0.15, 0.04, 0.04), matMetal(0x999999));
  handle.position.set(w * 0.35, h * 0.5, d / 2 + 0.025);
  return addMeshes(g, [body, sign, handle]);
}

export function buildSlidingDoor(w: number, d: number, h: number): Group {
  const g = new Group();
  // Rail
  const rail = new Mesh(new BoxGeometry(w * 1.2, 0.04, d * 0.5), matMetal(0x555555));
  rail.position.y = h + 0.02;
  // Two panels
  const pnl1 = new Mesh(new BoxGeometry(w * 0.5, h, d * 0.3), matGlassPhys(0xccddee));
  pnl1.position.set(-w * 0.25, h / 2, 0);
  const pnl2 = pnl1.clone();
  pnl2.position.x = w * 0.25;
  return addMeshes(g, [rail, pnl1, pnl2]);
}

export function buildWindowFrame(w: number, d: number, h: number): Group {
  const g = new Group();
  const frameMat = matPlastic(0xffffff);
  const glass = new Mesh(new BoxGeometry(w * 0.9, h * 0.9, d * 0.5), matGlassPhys(0x99ccee));
  glass.position.y = h / 2;
  const top = new Mesh(new BoxGeometry(w, 0.05, d), frameMat);
  top.position.y = h - 0.025;
  const bot = new Mesh(new BoxGeometry(w, 0.05, d), frameMat);
  bot.position.y = 0.025;
  const left = new Mesh(new BoxGeometry(0.05, h, d), frameMat);
  left.position.set(-w / 2 + 0.025, h / 2, 0);
  const right = left.clone();
  right.position.x = w / 2 - 0.025;
  // Cross mullion
  const mulH = new Mesh(new BoxGeometry(w - 0.1, 0.03, d * 0.5), frameMat);
  mulH.position.y = h / 2;
  return addMeshes(g, [glass, top, bot, left, right, mulH]);
}

export function buildPartitionWall(w: number, d: number, h: number): Group {
  const g = new Group();
  const panelMat = matPlastic(0xe8e4d8);
  const main = new Mesh(new BoxGeometry(w, h, d), panelMat);
  main.position.y = h / 2;
  const trimTop = new Mesh(new BoxGeometry(w + 0.04, 0.03, d + 0.04), matMetal(0x888888));
  trimTop.position.y = h;
  return addMeshes(g, [main, trimTop]);
}

// =============================================================================
// DEKO
// =============================================================================

export function buildPottedPlant(w: number, d: number, h: number): Group {
  const g = new Group();
  const potH = h * 0.3;
  const pot = new Mesh(new CylinderGeometry(w / 2 * 0.9, w / 2 * 0.75, potH, 12), matPlastic(0x8a4a2a));
  pot.position.y = potH / 2;
  // 6 leaves as upward-tilted planes
  const leafMat = matPlastic(0x336622);
  leafMat.side = DoubleSide;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const len = (h - potH) * (0.6 + Math.random() * 0.4);
    const leaf = new Mesh(new PlaneGeometry(0.08, len), leafMat);
    leaf.position.set(Math.cos(a) * 0.05, potH + len / 2, Math.sin(a) * 0.05);
    leaf.rotation.y = a;
    leaf.rotation.x = 0.2 + Math.random() * 0.3;
    g.add(leaf);
  }
  // Stem cluster
  const stemGroup = new Mesh(new SphereGeometry((h - potH) * 0.3, 8, 6), matPlastic(0x224422));
  stemGroup.position.y = potH + (h - potH) * 0.3;
  return addMeshes(g, [pot, stemGroup]);
}

export function buildWallArt(w: number, d: number, h: number): Group {
  const g = new Group();
  const frame = new Mesh(new BoxGeometry(w, h, d), matWood(0x4a3020));
  frame.position.y = h / 2;
  const canvas = new Mesh(new BoxGeometry(w * 0.9, h * 0.9, d + 0.005), matPlastic(0xc0a080));
  canvas.position.y = h / 2;
  return addMeshes(g, [frame, canvas]);
}

export function buildFloorLamp(w: number, d: number, h: number): Group {
  const g = new Group();
  const r = Math.min(w, d) / 2;
  const base = new Mesh(new CylinderGeometry(r, r, 0.03, 16), matMetal(0x222222));
  base.position.y = 0.015;
  const pole = new Mesh(new CylinderGeometry(0.015, 0.015, h - 0.2, 8), matMetal(0x333333));
  pole.position.y = (h - 0.2) / 2;
  const shade = new Mesh(new CylinderGeometry(r * 0.8, r * 1.1, 0.25, 12), matFabric(0xf8f0d8));
  shade.position.y = h - 0.1;
  const bulb = new Mesh(new SphereGeometry(0.04, 8, 6), matLED(0xfff8cc));
  bulb.position.y = h - 0.1;
  return addMeshes(g, [base, pole, shade, bulb]);
}

// =============================================================================
// MESSE (P4.2) — image-map surfaces
// =============================================================================
//
// Every Messe builder accepts opts.imageMap (a data URL from processUpload).
// When the image is set, a quad on the designated face renders with
// imageMapMaterial; otherwise the face falls back to a neutral Fabric or
// Metal so the placed object is still visible pre-upload.

function imgOrFallback(opts: BuilderOpts | undefined, fallback: () => Mesh['material']) {
  if (opts && opts.imageMap) {
    return imageMapMaterial(opts.imageMap, opts.imageMapAspect ?? 'cover');
  }
  return fallback();
}

export function buildBackwall(w: number, d: number, h: number, opts: BuilderOpts = {}): Group {
  const g = new Group();
  // Alu frame
  const frame = new Mesh(new BoxGeometry(w, h, d), matMetal(0xc8c8cc));
  frame.position.y = h / 2;
  // Front image panel — inset 2% on w/h, d/2+0.001 to avoid z-fight
  const panelW = w * 0.98;
  const panelH = h * 0.98;
  const panel = new Mesh(new PlaneGeometry(panelW, panelH), imgOrFallback(opts, () => matFabric(0xffffff)));
  panel.position.set(0, h / 2, d / 2 + 0.001);
  // Back panel — plain metal so 360° view is decent
  const back = new Mesh(new PlaneGeometry(panelW, panelH), matMetal(0x888888));
  back.position.set(0, h / 2, -d / 2 - 0.001);
  back.rotation.y = Math.PI;
  // Small feet so it stands
  const foot1 = new Mesh(new BoxGeometry(0.2, 0.05, 0.3), matMetal(0x555555));
  foot1.position.set(-w / 2 + 0.15, 0.025, 0);
  const foot2 = new Mesh(new BoxGeometry(0.2, 0.05, 0.3), matMetal(0x555555));
  foot2.position.set(w / 2 - 0.15, 0.025, 0);
  return addMeshes(g, [frame, panel, back, foot1, foot2]);
}

export function buildRollupBanner(w: number, d: number, h: number, opts: BuilderOpts = {}): Group {
  const g = new Group();
  // Cartridge base
  const base = new Mesh(new BoxGeometry(w, 0.08, d), matMetal(0x444455));
  base.position.y = 0.04;
  // Two legs/feet that fold out for stability
  const footL = new Mesh(new CylinderGeometry(0.015, 0.015, d * 1.5, 8), matMetal(0x333333));
  footL.rotation.x = Math.PI / 2;
  footL.position.set(-w / 2 + 0.05, 0.015, 0);
  const footR = new Mesh(new CylinderGeometry(0.015, 0.015, d * 1.5, 8), matMetal(0x333333));
  footR.rotation.x = Math.PI / 2;
  footR.position.set(w / 2 - 0.05, 0.015, 0);
  // Pole
  const pole = new Mesh(new CylinderGeometry(0.01, 0.01, h - 0.08, 8), matMetal(0x888899));
  pole.position.set(-w / 2 + 0.05, 0.08 + (h - 0.08) / 2, 0);
  // Banner panel — stretch fits the nearly-2:1 portrait print
  const banner = new Mesh(new PlaneGeometry(w, h - 0.08), imgOrFallback(opts, () => matFabric(0xffffff)));
  banner.position.set(0, 0.08 + (h - 0.08) / 2, 0.01);
  const bannerBack = new Mesh(new PlaneGeometry(w, h - 0.08), matFabric(0xcccccc));
  bannerBack.position.set(0, 0.08 + (h - 0.08) / 2, -0.01);
  bannerBack.rotation.y = Math.PI;
  return addMeshes(g, [base, footL, footR, pole, banner, bannerBack]);
}

export function buildCounterFront(w: number, d: number, h: number, opts: BuilderOpts = {}): Group {
  const g = new Group();
  // Body
  const body = new Mesh(new BoxGeometry(w, h - 0.04, d), matWood(0xe5e5e0));
  body.position.y = (h - 0.04) / 2;
  // Countertop
  const top = new Mesh(new BoxGeometry(w + 0.04, 0.04, d + 0.04), matWood(0x333333));
  top.position.y = h - 0.02;
  // Front image panel (slightly inset)
  const panel = new Mesh(new PlaneGeometry(w * 0.95, (h - 0.04) * 0.9), imgOrFallback(opts, () => matFabric(0xffffff)));
  panel.position.set(0, (h - 0.04) / 2, d / 2 + 0.001);
  return addMeshes(g, [body, top, panel]);
}

export function buildLedWall(w: number, d: number, h: number, opts: BuilderOpts = {}): Group {
  const g = new Group();
  // Frame cabinet
  const cabinet = new Mesh(new BoxGeometry(w, h, d), matMetal(0x111111));
  cabinet.position.y = h / 2;
  // Image panel — slightly emissive so it reads as an LED display even
  // without bloom. If bloom is active, the brightness of the uploaded
  // image will pick up the glow naturally.
  const display = new Mesh(new PlaneGeometry(w * 0.96, h * 0.96), imgOrFallback(opts, () => matLED(0x2233aa)));
  display.position.set(0, h / 2, d / 2 + 0.001);
  // Gently emissive when a user image is set — gives the LED-wall feel
  // without overriding the image with pure color.
  if (opts.imageMap) {
    const mat = display.material as MeshStandardMaterial;
    mat.emissive.setHex(0x222222);
    mat.emissiveIntensity = 0.25;
  }
  return addMeshes(g, [cabinet, display]);
}

export function buildFlag(w: number, _d: number, h: number, opts: BuilderOpts = {}): Group {
  const g = new Group();
  // Weighted base (cross-foot)
  const foot1 = new Mesh(new BoxGeometry(0.5, 0.03, 0.08), matMetal(0x333333));
  foot1.position.y = 0.015;
  const foot2 = new Mesh(new BoxGeometry(0.08, 0.03, 0.5), matMetal(0x333333));
  foot2.position.y = 0.015;
  // Pole (teardrop beach flag typically has a curved fibreglass pole —
  // approximate with a tall thin cylinder; the curve is baked into the
  // flag shape itself).
  const pole = new Mesh(new CylinderGeometry(0.012, 0.012, h - 0.03, 8), matMetal(0xdddddd));
  pole.position.y = (h - 0.03) / 2 + 0.03;
  // Flag panel — sits along the pole (teardrop profile: PlaneGeometry is
  // close enough for our 3D preview; actual production flag would be
  // curved). Both sides get the image when imageMapFace='both_sides'.
  const flagW = w;
  const flagH = h * 0.85;
  const flagFront = new Mesh(new PlaneGeometry(flagW, flagH), imgOrFallback(opts, () => matFabric(0xcc2244)));
  flagFront.position.set(flagW / 2 - 0.012, flagH / 2 + 0.15, 0.01);
  // Back face mirrors the front (UV flip would mirror text — acceptable for
  // a preview; real production print is identical both sides).
  const flagBack = new Mesh(new PlaneGeometry(flagW, flagH), imgOrFallback(opts, () => matFabric(0xcc2244)));
  flagBack.position.set(flagW / 2 - 0.012, flagH / 2 + 0.15, -0.01);
  flagBack.rotation.y = Math.PI;
  return addMeshes(g, [foot1, foot2, pole, flagFront, flagBack]);
}

// =============================================================================
// Builder registry
// =============================================================================

export const BUILDER_MAP: Record<string, (w: number, d: number, h: number, opts?: BuilderOpts) => Group> = {
  // Büro
  buildOfficeChair, buildDesk, buildFilingCabinet, buildBookshelf,
  buildConferenceTable, buildWhiteboard,
  // Empfang/Ausgabe
  buildReceptionDesk, buildDispensingCounter, buildConsultingBooth,
  buildWaitingBench, buildLockerRow,
  // CSC-Anbau
  buildGrowTent, buildDryingRack, buildLedGrowLight, buildVentilationFan,
  buildHarvestBin, buildStorageCabinet,
  // Sicherheit
  buildSafeBox, buildDomeCamera, buildBulletCamera, buildMotionSensor,
  buildAlarmPanel, buildFireExtinguisher, buildSmokeDetector, buildExitSign,
  // Sozial/Küche
  buildSofaModule, buildCoffeeTable, buildKitchenCounter, buildFridge,
  buildSink, buildStool,
  // Bau
  buildDoorRC2, buildDoorT90, buildSlidingDoor, buildWindowFrame,
  buildPartitionWall,
  // Deko
  buildPottedPlant, buildWallArt, buildFloorLamp,
  // Messe (P4.2)
  buildBackwall, buildRollupBanner, buildCounterFront, buildLedWall, buildFlag,
  // Event (P5.1) — merged from ./eventBuilders
  ...EVENT_BUILDER_MAP,
  // CSC Expansion (P5.2) — merged from ./cscBuilders
  ...CSC_BUILDER_MAP,
  // Event Phase 2 (P5.1-P2) — merged from ./eventBuildersPhase2
  ...EVENT_BUILDER_MAP_P2,
  // CSC Phase 2 (P5.2-P2) — merged from ./cscBuildersPhase2
  ...CSC_BUILDER_MAP_P2,
};
