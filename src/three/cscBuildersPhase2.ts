// P5.2-Phase2 — Zusätzliche CSC-Builder. Fokus auf Realismus-Items
// die im Phase-1-CSC-Katalog (PR #50) noch nicht vorhanden waren:
// Billardtisch, Trimm-Roboter, Video-Rack, Hydro-Flood, Kältekammer,
// Seifenspender-Sensor, Müll-Trennung.

import {
  Group, Mesh,
  BoxGeometry, CylinderGeometry, SphereGeometry, TorusGeometry,
  PlaneGeometry, ConeGeometry, DoubleSide,
} from 'three';
import {
  matWood, matMetal, matFabric, matPlastic, matGlassPhys, matLED,
  matConcrete, matLeather,
} from './materials.js';

function addMeshes(g: Group, meshes: Mesh[]): Group {
  for (const m of meshes) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
  return g;
}

// ── Anbau ──
export function buildTrimmingRobot(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.7, d), matMetal(0x2a2a4a));
  body.position.y = h * 0.35;
  const bowl = new Mesh(new CylinderGeometry(w * 0.35, w * 0.35, h * 0.25, 16), matMetal(0xaaaaaa));
  bowl.position.y = h * 0.82;
  const led = new Mesh(new SphereGeometry(0.015, 8, 6), matLED(0x44ff44));
  led.position.set(w * 0.3, h * 0.5, d/2 + 0.01);
  return addMeshes(g, [body, bowl, led]);
}
export function buildHydroFloodTable(w: number, d: number, h: number): Group {
  const g = new Group();
  const tray = new Mesh(new BoxGeometry(w, h * 0.3, d), matPlastic(0x1a3a5a));
  tray.position.y = h * 0.7;
  const water = new Mesh(new BoxGeometry(w * 0.94, 0.02, d * 0.94), matGlassPhys(0x2288cc));
  water.position.y = h * 0.78;
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    const leg = new Mesh(new BoxGeometry(0.05, h * 0.7, 0.05), matMetal(0x666666));
    leg.position.set(sx * (w/2 - 0.04), h * 0.35, sz * (d/2 - 0.04));
    g.add(leg);
  }
  return addMeshes(g, [tray, water]);
}
export function buildSlipstickBoard(w: number, d: number, h: number): Group {
  const g = new Group();
  const board = new Mesh(new BoxGeometry(w, 0.02, d), matPlastic(0xffee88));
  board.position.y = h;
  const post = new Mesh(new CylinderGeometry(0.015, 0.015, h, 6), matWood(0x3a2a1a));
  post.position.y = h/2;
  return addMeshes(g, [board, post]);
}

// ── Sicherheit ──
export function buildVideoRecorderRack(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0x222222));
  body.position.y = h/2;
  for (let i = 0; i < 6; i++) {
    const unit = new Mesh(new BoxGeometry(w * 0.92, h * 0.12, 0.005), matMetal(0x111111));
    unit.position.set(0, h * 0.08 + i * h * 0.15, d/2 + 0.003);
    const led = new Mesh(new BoxGeometry(0.01, 0.008, 0.003), matLED(0xff2222));
    led.position.set(w * 0.42, h * 0.08 + i * h * 0.15, d/2 + 0.006);
    g.add(unit, led);
  }
  return addMeshes(g, [body]);
}
export function buildSecurityConsole(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0x222222));
  body.position.y = h/2;
  const mon1 = new Mesh(new BoxGeometry(w * 0.4, h * 0.35, 0.03), matPlastic(0x111111));
  mon1.position.set(-w * 0.22, h + 0.2, -d/2 + 0.15);
  const disp1 = new Mesh(new PlaneGeometry(w * 0.36, h * 0.32), matLED(0x224488));
  disp1.position.copy(mon1.position);
  disp1.position.z += 0.02;
  const mon2 = mon1.clone();
  mon2.position.x = w * 0.22;
  const disp2 = new Mesh(new PlaneGeometry(w * 0.36, h * 0.32), matLED(0x884422));
  disp2.position.set(w * 0.22, h + 0.2, mon2.position.z + 0.02);
  return addMeshes(g, [body, mon1, disp1, mon2, disp2]);
}

// ── Ausgabe ──
export function buildReturnBox(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0x2a4a2a));
  body.position.y = h/2;
  const slot = new Mesh(new BoxGeometry(w * 0.7, 0.04, 0.02), matPlastic(0x111111));
  slot.position.set(0, h * 0.85, d/2 + 0.01);
  return addMeshes(g, [body, slot]);
}
export function buildPaymentTerminal(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.65, d), matPlastic(0x333333));
  body.position.y = h * 0.325;
  const screen = new Mesh(new PlaneGeometry(w * 0.85, h * 0.3), matLED(0x0088ff));
  screen.position.set(0, h * 0.8, d/2 - 0.04);
  screen.rotation.x = -0.18;
  const stand = new Mesh(new CylinderGeometry(0.025, 0.025, h * 0.35, 8), matMetal(0x555555));
  stand.position.y = h * 0.175;
  return addMeshes(g, [body, screen, stand]);
}
export function buildNoticeBoard(w: number, d: number, h: number): Group {
  const g = new Group();
  const frame = new Mesh(new BoxGeometry(w, h * 0.8, d), matWood(0x3a2a1a));
  frame.position.y = h * 0.6;
  const board = new Mesh(new PlaneGeometry(w * 0.92, h * 0.72), matFabric(0x886644));
  board.position.set(0, h * 0.6, d/2 + 0.01);
  for (const sx of [-1, 1]) {
    const post = new Mesh(new CylinderGeometry(0.02, 0.02, h * 0.3, 6), matMetal(0x555555));
    post.position.set(sx * (w/2 - 0.03), h * 0.15, 0);
    g.add(post);
  }
  return addMeshes(g, [frame, board]);
}

// ── Lager ──
export function buildClimateCabinet(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0xcccccc));
  body.position.y = h/2;
  const door = new Mesh(new PlaneGeometry(w * 0.9, h * 0.9), matGlassPhys(0xaaddff));
  door.position.set(0, h/2, d/2 + 0.001);
  const panel = new Mesh(new PlaneGeometry(w * 0.25, 0.08), matLED(0x44ff88));
  panel.position.set(w * 0.3, h * 0.92, d/2 + 0.002);
  return addMeshes(g, [body, door, panel]);
}
export function buildHumidityLogger(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0xffffff));
  body.position.y = h/2;
  const display = new Mesh(new PlaneGeometry(w * 0.75, h * 0.5), matLED(0x44aaff));
  display.position.set(0, h * 0.6, d/2 + 0.001);
  return addMeshes(g, [body, display]);
}
export function buildColdChamber(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matMetal(0xaabbcc));
  body.position.y = h/2;
  const door = new Mesh(new BoxGeometry(w * 0.8, h * 0.9, 0.08), matMetal(0x88aaaa));
  door.position.set(0, h/2, d/2);
  const handle = new Mesh(new CylinderGeometry(0.02, 0.02, 0.3, 8), matMetal(0x555555));
  handle.rotation.x = Math.PI / 2;
  handle.position.set(w * 0.32, h * 0.5, d/2 + 0.05);
  const vent = new Mesh(new BoxGeometry(w * 0.4, 0.08, 0.04), matMetal(0x333333));
  vent.position.set(0, h - 0.04, d/2 + 0.005);
  return addMeshes(g, [body, door, handle, vent]);
}

// ── Sozial ──
export function buildPoolTable(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h * 0.75, d), matWood(0x4a2a1a));
  body.position.y = h * 0.375;
  const cloth = new Mesh(new BoxGeometry(w * 0.94, 0.02, d * 0.94), matFabric(0x226644));
  cloth.position.y = h * 0.76;
  // 6 pockets
  const pocketMat = matPlastic(0x111111);
  [[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1]].forEach(([sx,sz])=>{
    const pk = new Mesh(new CylinderGeometry(0.04, 0.04, 0.05, 12), pocketMat);
    pk.position.set((sx as number) * (w/2 - 0.05), h * 0.76, (sz as number) * (d/2 - 0.05));
    g.add(pk);
  });
  // 4 legs
  for (const [sx, sz] of [[-1,-1],[1,-1],[-1,1],[1,1]] as const) {
    const leg = new Mesh(new BoxGeometry(0.1, h * 0.4, 0.1), matWood(0x2a1a0a));
    leg.position.set(sx * (w/2 - 0.08), h * 0.2, sz * (d/2 - 0.08));
    g.add(leg);
  }
  return addMeshes(g, [body, cloth]);
}

// ── Sanitär ──
export function buildSensorSoapDispenser(w: number, d: number, h: number): Group {
  const g = new Group();
  const body = new Mesh(new BoxGeometry(w, h, d), matPlastic(0xf0f0f0));
  body.position.y = h/2;
  const sensor = new Mesh(new SphereGeometry(0.015, 8, 6), matGlassPhys(0x222222));
  sensor.position.set(0, h * 0.4, d/2 + 0.005);
  const led = new Mesh(new SphereGeometry(0.006, 6, 4), matLED(0x44ff44));
  led.position.set(w * 0.3, h * 0.8, d/2 + 0.005);
  return addMeshes(g, [body, sensor, led]);
}
export function buildTrashSeparation(w: number, d: number, h: number): Group {
  const g = new Group();
  const colors = [0xffcc00, 0x0066cc, 0x22aa22, 0x666666];
  const bw = w / 4;
  for (let i = 0; i < 4; i++) {
    const bin = new Mesh(new BoxGeometry(bw * 0.92, h * 0.85, d), matPlastic(colors[i] ?? 0x666666));
    bin.position.set(-w/2 + bw/2 + i * bw, h * 0.425, 0);
    const lid = new Mesh(new BoxGeometry(bw * 0.94, 0.04, d + 0.03), matPlastic((colors[i] ?? 0x666666) - 0x111111));
    lid.position.set(-w/2 + bw/2 + i * bw, h * 0.86, 0);
    g.add(bin, lid);
  }
  return addMeshes(g, []);
}

// =============================================================================
// Registry
// =============================================================================
export const CSC_BUILDER_MAP_P2: Record<string, (w: number, d: number, h: number) => Group> = {
  buildTrimmingRobot, buildHydroFloodTable, buildSlipstickBoard,
  buildVideoRecorderRack, buildSecurityConsole,
  buildReturnBox, buildPaymentTerminal, buildNoticeBoard,
  buildClimateCabinet, buildHumidityLogger, buildColdChamber,
  buildPoolTable,
  buildSensorSoapDispenser, buildTrashSeparation,
};
