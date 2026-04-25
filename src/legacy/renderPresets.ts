/**
 * P17.9 — High-Resolution-Render-Preset extrahiert aus index.html:15946-16025.
 *
 * Erstellt einen temporären off-screen WebGLRenderer mit Preset-Resolution,
 * rendert die existierende Scene + Preset-Camera, triggert den PNG-Download.
 *
 * Three.js-Touch ist neu für P17 — daher wird die Render-Pipeline isoliert
 * und Tests mocken die WebGLRenderer-Construction (jsdom hat kein WebGL).
 *
 * Caller (index.html-Wrapper) liefert:
 * - DOM-Helper: getSizeInputValue (#hr-size), setStatus (#hr-status), toast
 * - Scene-State: scene + bounds-callback + projName
 * - Render-Worker: renderToDataURL (Closure aus main.ts wraps Three.js calls)
 *
 * Damit ist `renderHighResPreset` selbst pure orchestration; die
 * Three.js-Pipeline lebt in `renderSceneToDataURL` und ist via Mock-
 * Renderer testbar (sehe Tests).
 */

import * as THREE from 'three';

export type RenderPreset = 'front' | 'side' | 'above' | 'perspective' | string;

export interface SceneBounds {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
  maxY: number;
  cx: number;
  cz: number;
  w: number;
  d: number;
}

export interface RenderHighResDeps {
  /** Liest `#hr-size`-Wert oder gibt null wenn Element fehlt. */
  getSizeOverride: () => string | null;
  /** Setzt `#hr-status`-Text. No-op wenn Element fehlt. */
  setStatus: (text: string) => void;
  /** Toast-Notification. */
  toast: (msg: string, type?: string) => void;
  /** Aktueller Projekt-Name für Filename. */
  projName: string;
  /** Lazy-Render-Worker. Wirft bei fehlendem Three.js / Scene. */
  renderToDataURL: (preset: RenderPreset, width: number, height: number) => string;
  /** Optional: setTimeout-Inject für Tests (default = global setTimeout). */
  scheduler?: (fn: () => void, ms: number) => unknown;
}

export interface RenderSceneDeps {
  scene: THREE.Scene | null;
  computeBounds: () => SceneBounds;
  /** Optional: WebGLRenderer-Factory. Default = `new THREE.WebGLRenderer(...)`.
   *  Tests injizieren einen Mock — jsdom kann keinen echten WebGL-Context. */
  createRenderer?: (canvas: HTMLCanvasElement) => MinimalRenderer;
}

/** Subset der THREE.WebGLRenderer-API die wir tatsächlich nutzen.
 *  Erlaubt einfache Mock-Implementierungen in Tests ohne Type-Casts. */
export interface MinimalRenderer {
  setPixelRatio: (px: number) => void;
  setSize: (w: number, h: number, updateStyle: boolean) => void;
  shadowMap: { enabled: boolean; type: number };
  toneMapping: number;
  toneMappingExposure: number;
  render: (scene: unknown, camera: unknown) => void;
  forceContextLoss: () => void;
  dispose: () => void;
}

/**
 * Triggert einen PNG-Download für das gewählte Preset. Liest `#hr-size`
 * für optionalen Resolution-Override, sonst defaultW/H.
 *
 * Side-effect: erzeugt + clickt einen <a download>-Link. Status-Updates
 * via deps.setStatus. Asynchron mit setTimeout(50) damit "Rendere…"-Status
 * vor dem synchronen Render-Block paint.
 */
export function renderHighResPreset(
  preset: RenderPreset,
  defaultW: number,
  defaultH: number,
  deps: RenderHighResDeps,
): void {
  let W = defaultW;
  let H = defaultH;
  const override = deps.getSizeOverride();
  if (override) {
    const parts = override.split('x');
    if (parts.length === 2) {
      W = +parts[0]! || W;
      H = +parts[1]! || H;
    }
  }
  deps.setStatus('⏳ Rendere ' + W + '×' + H + ' (' + preset + ')…');
  const sched = deps.scheduler ?? setTimeout;
  sched(() => {
    try {
      const url = deps.renderToDataURL(preset, W, H);
      const filename =
        (deps.projName || 'projekt').replace(/[^a-z0-9]/gi, '_') +
        '_' + preset + '_' + W + 'x' + H + '.png';
      const link = Object.assign(document.createElement('a'), { href: url, download: filename });
      link.click();
      deps.setStatus('✅ PNG heruntergeladen (' + preset + ', ' + W + '×' + H + ')');
      deps.toast('📸 ' + preset + ' — ' + W + '×' + H + ' gespeichert', 'g');
    } catch (err) {
      console.warn('[csc] highres render failed', err);
      const msg = (err as Error)?.message || String(err);
      deps.setStatus('❌ Fehler: ' + msg);
      deps.toast('Render fehlgeschlagen', 'r');
    }
  }, 50);
}

/**
 * Three.js-Render-Pipeline: detached canvas → temp WebGLRenderer mit
 * Preset-Camera → render(scene) → toDataURL → forceContextLoss + dispose.
 *
 * Camera-Logik:
 * - 'above': Orthographic top-down, fit-to-bbox + 15% margin
 * - 'front'/'side': Perspective vom jeweiligen Außenrand
 * - sonst: 3/4-isometric
 *
 * forceContextLoss() ist kritisch: ohne diesen Cleanup leakt jeder Run
 * einen WebGL-Context, und der Browser refused irgendwann neue zu erzeugen.
 */
export function renderSceneToDataURL(
  preset: RenderPreset,
  width: number,
  height: number,
  deps: RenderSceneDeps,
): string {
  if (!deps.scene) throw new Error('Three.js/Szene nicht bereit');
  const bounds = deps.computeBounds();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const r: MinimalRenderer = deps.createRenderer
    ? deps.createRenderer(canvas)
    : (new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        preserveDrawingBuffer: true,
        alpha: false,
      }) as unknown as MinimalRenderer);
  r.setPixelRatio(1);
  r.setSize(width, height, false);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 0.9;

  const aspect = width / height;
  const maxDim = Math.max(bounds.w, bounds.d, bounds.maxY);
  let cam: THREE.Camera;
  if (preset === 'above') {
    const halfW = (bounds.w / 2) * 1.15;
    const halfD = (bounds.d / 2) * 1.15;
    const wantH = halfW / aspect;
    const h = Math.max(wantH, halfD);
    const w = h * aspect;
    cam = new THREE.OrthographicCamera(-w, w, h, -h, 0.1, 200);
    cam.position.set(bounds.cx, Math.max(bounds.maxY * 2, 20), bounds.cz);
    cam.lookAt(bounds.cx, 0, bounds.cz);
  } else {
    const persp = new THREE.PerspectiveCamera(55, aspect, 0.1, 300);
    if (preset === 'front') {
      persp.position.set(bounds.cx, bounds.maxY * 0.7, bounds.minZ - maxDim * 0.9);
      persp.lookAt(bounds.cx, bounds.maxY * 0.4, bounds.cz);
    } else if (preset === 'side') {
      persp.position.set(bounds.maxX + maxDim * 0.9, bounds.maxY * 0.7, bounds.cz);
      persp.lookAt(bounds.cx, bounds.maxY * 0.4, bounds.cz);
    } else {
      // perspective — 3/4 isometric (default fallback)
      persp.position.set(
        bounds.maxX + maxDim * 0.7,
        maxDim * 0.8,
        bounds.minZ - maxDim * 0.7,
      );
      persp.lookAt(bounds.cx, bounds.maxY * 0.3, bounds.cz);
    }
    cam = persp;
  }

  r.render(deps.scene, cam);
  const dataUrl = canvas.toDataURL('image/png');
  r.forceContextLoss();
  r.dispose();
  return dataUrl;
}
