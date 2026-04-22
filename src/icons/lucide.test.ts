import { describe, test, expect } from 'vitest';
import { icon, listIcons, type IconName } from './lucide.js';

describe('lucide icons', () => {
  test('listIcons() enthält exakt die 18 geplanten Icons', () => {
    const names = listIcons();
    expect(names).toHaveLength(18);
    const expected: IconName[] = [
      'undo',
      'redo',
      'save',
      'room',
      'event',
      'leaf',
      'globe',
      'file',
      'layers',
      'chart',
      'share',
      'sun',
      'moon',
      'square',
      'cube',
      'plus',
      'more',
      'help-circle',
    ];
    for (const name of expected) {
      expect(names).toContain(name);
    }
  });

  test('icon(name) liefert well-formed SVG mit currentColor-stroke', () => {
    const svg = icon('save');
    expect(svg).toMatch(/^<svg /);
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).toContain('viewBox="0 0 16 16"');
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('</svg>');
  });

  test('icon() respektiert size + strokeWidth Optionen', () => {
    const svg = icon('leaf', { size: 24, strokeWidth: 2 });
    expect(svg).toContain('width="24"');
    expect(svg).toContain('height="24"');
    expect(svg).toContain('stroke-width="2"');
  });

  test('unbekannter Name → leerer String (silent fail, kein Crash)', () => {
    const svg = icon('nonsense' as IconName);
    expect(svg).toBe('');
  });

  test('Row-2-Tool-Icons wurden bewusst NICHT portiert', () => {
    const names = listIcons();
    // sanity: diese aus topbar.jsx stammenden Row-2-Icons sind nicht im
    // Export — würde jemand „cursor" versehentlich hinzufügen, schlägt
    // dieser Test an und dokumentiert den Verstoß gegen das Kontrakt.
    for (const excluded of [
      'cursor',
      'wall',
      'roomdraw',
      'area',
      'ruler',
      'move',
      'center',
      'box',
      'folder',
      'sliders',
      'view',
      'clock',
      'chevron',
    ]) {
      expect(names).not.toContain(excluded);
    }
  });
});
