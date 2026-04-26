/**
 * Multi-Floor Phase 2 (Mega-Sammel #2) — Treppen-3D-Geometrie.
 *
 * Phase 2 implementiert nur straight-Treppen. L/Wendel kommen Phase 3.
 *
 * Geometrie-Strategie:
 *   ExtrudeGeometry mit treppen-förmigem 2D-Profil → 3D-Block mit
 *   Stufen-Silhouette an einer Seite. Effizient (1 Mesh statt N Stufen-
 *   Boxes) und gut für Schatten/PBR.
 *
 * Geländer:
 *   Optionales Geländer rechts mit Top-Handlauf (1m über letzter Stufe)
 *   und 2 Querbalken. Phase 3 könnte eine vollständige Posten-Reihe
 *   ergänzen.
 */

import * as THREE from 'three';
import type { StairsConfig } from './types.js';

/**
 * Erzeugt eine Treppen-Group mit Stufen-Profil + optional Geländer.
 *
 * Koordinaten-Konvention:
 *   - Group-Origin: hinterste, linke, untere Ecke der Treppe
 *   - X-Achse: Breite (entlang Treppe-Lauf-Richtung quer)
 *   - Y-Achse: Höhe (Stufen wachsen nach oben)
 *   - Z-Achse: Tiefe (Lauf-Richtung, von unten nach oben)
 *
 * @param width Breite in m (mind. 1.20 für Bauordnung)
 * @param cfg StairsConfig (stepHeight, stepDepth, stepCount, withRailing)
 */
export function buildStairsMesh(width: number, cfg: StairsConfig): THREE.Group {
  if (cfg.shape === 'l') return buildLStairsMesh(width, cfg);
  const group = new THREE.Group();

  const totalDepth = cfg.stepCount * cfg.stepDepth;
  const totalHeight = cfg.stepCount * cfg.stepHeight;

  // Stufen-Profil im YZ-Plane (Z=Tiefe, Y=Höhe). Wir bauen ein 2D-Polygon
  // mit Treppen-Silhouette auf einer Seite + flacher Boden + senkrechte
  // Rückwand. Das wird dann entlang X (Breite) extrudiert.
  const profile = new THREE.Shape();
  profile.moveTo(0, 0); // hinten unten
  // Senkrechte Wand hoch (Rückwand)
  profile.lineTo(0, totalHeight);
  // Top-Edge nach hinten — Plattform am höchsten Punkt
  profile.lineTo(-cfg.stepDepth * 0.3, totalHeight); // kleiner Vorsprung oben
  // Treppen-Stufen: von hinten oben nach unten vorne
  for (let i = cfg.stepCount; i > 0; i--) {
    // Zuerst horizontal (Stufe-Tritt), dann nach unten (Stufe-Setzstufe)
    const xStart = -cfg.stepDepth * (cfg.stepCount - i) - cfg.stepDepth * 0.3;
    const yStart = i * cfg.stepHeight;
    profile.lineTo(xStart - cfg.stepDepth, yStart);
    profile.lineTo(xStart - cfg.stepDepth, (i - 1) * cfg.stepHeight);
  }
  // Bodenfläche zurück zum Start
  profile.lineTo(0, 0);

  const geom = new THREE.ExtrudeGeometry(profile, {
    depth: width,
    bevelEnabled: false,
  });
  // Profile war im YZ — extrude geht entlang X (=Breite). Aber three.js'
  // ExtrudeGeometry extrude entlang Z. Wir rotieren so dass das Profil
  // korrekt im Welt-Raum liegt:
  geom.rotateY(Math.PI / 2);
  // Z-Verschiebung damit Origin = vordere untere Ecke
  geom.translate(0, 0, totalDepth + cfg.stepDepth * 0.3);

  const material = new THREE.MeshStandardMaterial({
    color: 0xa0826d, // warm Holz
    roughness: 0.85,
    metalness: 0.0,
  });
  const mesh = new THREE.Mesh(geom, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);

  if (cfg.withRailing) {
    const railing = buildRailing(totalDepth, totalHeight);
    railing.position.x = width;
    group.add(railing);
  }

  // Metadata für Compliance / Debugging
  group.userData = {
    type: 'stairs',
    width,
    totalDepth,
    totalHeight,
    stepCount: cfg.stepCount,
  };

  return group;
}

/**
 * Einfaches Geländer: Handlauf 1m über höchster Stufe + 2 Querbalken
 * (mid + low). Posten an Anfang/Mitte/Ende. Material: dunkles Metall.
 */
function buildRailing(length: number, totalStairsHeight: number): THREE.Group {
  const group = new THREE.Group();
  const handrailHeight = 1.0; // m über höchster Stufe (Bauordnung-typisch)
  const postPositions = [0, length * 0.5, length];

  const matRailing = new THREE.MeshStandardMaterial({
    color: 0x2d2d2d,
    roughness: 0.4,
    metalness: 0.7,
  });

  // Posten (Vertical-Bars)
  for (const z of postPositions) {
    // Posten gehen schräg mit der Treppe nach oben
    const t = z / length;
    const yBottom = t * totalStairsHeight;
    const yTop = yBottom + handrailHeight;
    const postGeom = new THREE.CylinderGeometry(0.02, 0.02, yTop - yBottom, 8);
    const post = new THREE.Mesh(postGeom, matRailing);
    post.position.set(0, (yBottom + yTop) / 2, z);
    group.add(post);
  }

  // Handlauf: schräge Linie von Anfang bis Ende, 1m über jeweils der
  // Stufen-Höhe an der jeweiligen Position. Implementation: TubeGeometry
  // entlang einer LineCurve3.
  const railStart = new THREE.Vector3(0, handrailHeight, 0);
  const railEnd = new THREE.Vector3(0, totalStairsHeight + handrailHeight, length);
  const curve = new THREE.LineCurve3(railStart, railEnd);
  const railGeom = new THREE.TubeGeometry(curve, 8, 0.025, 6, false);
  const rail = new THREE.Mesh(railGeom, matRailing);
  group.add(rail);

  // Mittlerer Querbalken (50% der Handlauf-Höhe)
  const midStart = new THREE.Vector3(0, handrailHeight * 0.5, 0);
  const midEnd = new THREE.Vector3(0, totalStairsHeight + handrailHeight * 0.5, length);
  const midCurve = new THREE.LineCurve3(midStart, midEnd);
  const midGeom = new THREE.TubeGeometry(midCurve, 8, 0.018, 6, false);
  const mid = new THREE.Mesh(midGeom, matRailing);
  group.add(mid);

  return group;
}

/**
 * Phase 3 #4: L-Treppe — 2 Läufe + 90°-Podest (rechtsdrehend).
 * Lauf 1 läuft entlang +Z, dann Podest, dann Lauf 2 entlang +X.
 * Origin = vordere untere Ecke wie bei straight.
 */
function buildLStairsMesh(width: number, cfg: StairsConfig): THREE.Group {
  const group = new THREE.Group();
  const stepsRun1 = Math.max(
    1,
    Math.min(cfg.stepCount - 1, cfg.landingAfter ?? Math.floor(cfg.stepCount / 2)),
  );
  const stepsRun2 = cfg.stepCount - stepsRun1;
  const heightRun1 = stepsRun1 * cfg.stepHeight;
  const depthRun1 = stepsRun1 * cfg.stepDepth;
  const depthRun2 = stepsRun2 * cfg.stepDepth;

  const cfgRun1: StairsConfig = { ...cfg, shape: 'straight', stepCount: stepsRun1, withRailing: false };
  const cfgRun2: StairsConfig = { ...cfg, shape: 'straight', stepCount: stepsRun2, withRailing: false };

  const run1 = buildStairsMesh(width, cfgRun1);
  group.add(run1);

  // Landing — quadratisch (width × width), oben auf Lauf 1.
  const matLanding = new THREE.MeshStandardMaterial({
    color: 0xa0826d,
    roughness: 0.85,
    metalness: 0.0,
  });
  const landingGeom = new THREE.BoxGeometry(width, 0.13, width);
  const landing = new THREE.Mesh(landingGeom, matLanding);
  landing.position.set(width / 2, heightRun1 - 0.065, depthRun1 + width / 2);
  landing.castShadow = true;
  landing.receiveShadow = true;
  group.add(landing);

  // Run 2 — startet am Ende des Podests, läuft +X, beginnt auf Höhe heightRun1.
  const run2 = buildStairsMesh(width, cfgRun2);
  run2.rotation.y = -Math.PI / 2;
  run2.position.set(width, heightRun1, depthRun1 + width);
  group.add(run2);

  if (cfg.withRailing) {
    const railing = buildRailing(depthRun1, heightRun1);
    railing.position.x = width;
    group.add(railing);
  }

  group.userData = {
    type: 'stairs',
    shape: 'l',
    width,
    totalDepth: depthRun1 + width,
    totalWidth: width + depthRun2,
    totalHeight: cfg.stepCount * cfg.stepHeight,
    stepCount: cfg.stepCount,
    landingAfter: stepsRun1,
  };
  return group;
}

/** Test-Helper: lese die Z-Range der Treppe (für Floor-Verbindungs-Check). */
export function getStairsZRange(
  group: THREE.Group,
): { minZ: number; maxZ: number; height: number } {
  const data = group.userData as { totalDepth?: number; totalHeight?: number } | undefined;
  return {
    minZ: 0,
    maxZ: data?.totalDepth ?? 0,
    height: data?.totalHeight ?? 0,
  };
}
