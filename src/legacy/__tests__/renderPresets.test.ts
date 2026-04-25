import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import {
  renderHighResPreset,
  renderSceneToDataURL,
  type RenderHighResDeps,
  type RenderSceneDeps,
  type SceneBounds,
  type MinimalRenderer,
} from '../renderPresets.js';

const boundsFixture = (): SceneBounds => ({
  minX: 0,
  minZ: 0,
  maxX: 10,
  maxZ: 10,
  maxY: 3,
  cx: 5,
  cz: 5,
  w: 10,
  d: 10,
});

// Mock-Renderer für jsdom (kein WebGL).
const mockRenderer = (): MinimalRenderer => ({
  setPixelRatio: vi.fn(),
  setSize: vi.fn(),
  shadowMap: { enabled: false, type: 0 },
  toneMapping: 0,
  toneMappingExposure: 0,
  render: vi.fn(),
  forceContextLoss: vi.fn(),
  dispose: vi.fn(),
});

describe('renderHighResPreset (orchestration)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const synchScheduler = (fn: () => void) => {
    fn();
    return 0;
  };

  it('Resolution-Override aus getSizeOverride parsed', () => {
    const renderToDataURL = vi.fn().mockReturnValue('data:image/png;base64,X');
    const deps: RenderHighResDeps = {
      getSizeOverride: () => '1920x1080',
      setStatus: vi.fn(),
      toast: vi.fn(),
      projName: 'Test',
      renderToDataURL,
      scheduler: synchScheduler,
    };
    renderHighResPreset('above', 800, 600, deps);
    expect(renderToDataURL).toHaveBeenCalledWith('above', 1920, 1080);
  });

  it('Default-Resolution wenn kein Override', () => {
    const renderToDataURL = vi.fn().mockReturnValue('data:image/png;base64,X');
    const deps: RenderHighResDeps = {
      getSizeOverride: () => null,
      setStatus: vi.fn(),
      toast: vi.fn(),
      projName: 'Test',
      renderToDataURL,
      scheduler: synchScheduler,
    };
    renderHighResPreset('front', 1280, 720, deps);
    expect(renderToDataURL).toHaveBeenCalledWith('front', 1280, 720);
  });

  it('happy: download-Link wird gecallt + setStatus + toast(g)', () => {
    const setStatus = vi.fn();
    const toast = vi.fn();
    const deps: RenderHighResDeps = {
      getSizeOverride: () => null,
      setStatus,
      toast,
      projName: 'Mein Projekt',
      renderToDataURL: () => 'data:image/png;base64,fake',
      scheduler: synchScheduler,
    };
    renderHighResPreset('above', 800, 600, deps);
    // Status zweimal: ⏳ vor render + ✅ nach
    expect(setStatus).toHaveBeenCalledTimes(2);
    expect(setStatus.mock.calls[0]![0]).toContain('⏳');
    expect(setStatus.mock.calls[1]![0]).toContain('✅');
    expect(toast).toHaveBeenCalledWith(expect.stringContaining('above'), 'g');
  });

  it('error in renderToDataURL: setStatus(❌) + toast(r)', () => {
    const setStatus = vi.fn();
    const toast = vi.fn();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const deps: RenderHighResDeps = {
      getSizeOverride: () => null,
      setStatus,
      toast,
      projName: 'X',
      renderToDataURL: () => {
        throw new Error('GL_OOM');
      },
      scheduler: synchScheduler,
    };
    renderHighResPreset('above', 800, 600, deps);
    expect(setStatus).toHaveBeenCalledWith(expect.stringContaining('❌'));
    expect(setStatus).toHaveBeenCalledWith(expect.stringContaining('GL_OOM'));
    expect(toast).toHaveBeenCalledWith('Render fehlgeschlagen', 'r');
    warn.mockRestore();
  });

  it('Filename: projName sanitized + preset + Resolution', () => {
    const renderToDataURL = vi.fn().mockReturnValue('data:image/png;base64,X');
    const deps: RenderHighResDeps = {
      getSizeOverride: () => null,
      setStatus: vi.fn(),
      toast: vi.fn(),
      projName: 'Mein Projekt — Lounge#1',
      renderToDataURL,
      scheduler: synchScheduler,
    };
    // Spy auf createElement um den a-Tag abzufangen
    const created: HTMLAnchorElement[] = [];
    const orig = document.createElement.bind(document);
    document.createElement = ((tag: string) => {
      const el = orig(tag) as HTMLElement;
      if (tag === 'a') {
        (el as HTMLAnchorElement).click = vi.fn();
        created.push(el as HTMLAnchorElement);
      }
      return el;
    }) as typeof document.createElement;
    try {
      renderHighResPreset('side', 1024, 768, deps);
    } finally {
      document.createElement = orig;
    }
    expect(created.length).toBe(1);
    expect(created[0]!.download).toMatch(/Mein_Projekt[^a-z0-9]*Lounge_1_side_1024x768\.png/);
  });
});

describe('renderSceneToDataURL (Three.js pipeline)', () => {
  it('throws wenn scene fehlt', () => {
    expect(() =>
      renderSceneToDataURL('above', 100, 100, {
        scene: null,
        computeBounds: boundsFixture,
      }),
    ).toThrow(/Szene nicht bereit/);
  });

  it('happy mit Mock-Renderer: render + forceContextLoss + dispose werden gerufen', () => {
    const renderer = mockRenderer();
    const scene = new THREE.Scene();
    const deps: RenderSceneDeps = {
      scene,
      computeBounds: boundsFixture,
      createRenderer: () => renderer,
    };
    const url = renderSceneToDataURL('above', 800, 600, deps);
    // jsdom-canvas: toDataURL existiert aber returnt einen Stub. Reicht
    // dass der Aufruf nicht wirft und EIN Wert zurückkommt.
    expect(url).toBeDefined();
    expect(renderer.setSize).toHaveBeenCalledWith(800, 600, false);
    expect(renderer.render).toHaveBeenCalledOnce();
    expect(renderer.forceContextLoss).toHaveBeenCalledOnce();
    expect(renderer.dispose).toHaveBeenCalledOnce();
  });

  it('Preset "above" verwendet OrthographicCamera', () => {
    const renderer = mockRenderer();
    const scene = new THREE.Scene();
    let usedCam: THREE.Camera | null = null;
    renderer.render = vi.fn((_s: unknown, cam: unknown) => {
      usedCam = cam as THREE.Camera;
    });
    renderSceneToDataURL('above', 800, 600, {
      scene,
      computeBounds: boundsFixture,
      createRenderer: () => renderer,
    });
    expect(usedCam).toBeInstanceOf(THREE.OrthographicCamera);
  });

  it('Preset "front"/"side"/sonst verwenden PerspectiveCamera', () => {
    const cases: ['front' | 'side' | 'perspective', boolean][] = [
      ['front', true],
      ['side', true],
      ['perspective', true],
    ];
    for (const [preset] of cases) {
      const renderer = mockRenderer();
      let usedCam: THREE.Camera | null = null;
      renderer.render = vi.fn((_s: unknown, cam: unknown) => {
        usedCam = cam as THREE.Camera;
      });
      renderSceneToDataURL(preset, 1024, 768, {
        scene: new THREE.Scene(),
        computeBounds: boundsFixture,
        createRenderer: () => renderer,
      });
      expect(usedCam).toBeInstanceOf(THREE.PerspectiveCamera);
    }
  });

  it('Resolution wird auf canvas gesetzt (über setSize)', () => {
    const renderer = mockRenderer();
    renderSceneToDataURL('above', 1920, 1080, {
      scene: new THREE.Scene(),
      computeBounds: boundsFixture,
      createRenderer: () => renderer,
    });
    expect(renderer.setSize).toHaveBeenCalledWith(1920, 1080, false);
  });
});
