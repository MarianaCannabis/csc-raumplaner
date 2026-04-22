/**
 * CSC Studio Pro — Icon-Set (Lucide-Style, vanilla SVG-Strings)
 *
 * Vanilla-JS-Port der Icons aus design/topbar-redesign/topbar.jsx. Jedes
 * Icon ist eine 16×16 currentColor-stroke-Shape mit round-line-caps; der
 * Aufrufer steuert Farbe via CSS (color/stroke) und Größe via `size`.
 *
 * Scope (18 Icons, siehe design/topbar-redesign/README.md — Emoji-Mapping):
 *   undo, redo, save, room, event, leaf, globe, file, layers, chart,
 *   share, sun, moon, square, cube, plus, more, help-circle
 *
 * Bewusst NICHT portiert: Row-2-Tools (cursor, wall, roomdraw, area,
 * ruler, move, center, box, folder, sliders), view, clock, chevron.
 * Row-2 gehört in unsere Architektur nicht in die Topbar; view/clock
 * kommen in der App nicht vor; chevron wird via CSS oder Emoji gelöst.
 *
 * Usage:
 *   import { icon } from './icons/lucide.js';
 *   element.innerHTML = icon('save', { size: 18 });
 */

export type IconName =
  | 'undo'
  | 'redo'
  | 'save'
  | 'room'
  | 'event'
  | 'leaf'
  | 'globe'
  | 'file'
  | 'layers'
  | 'chart'
  | 'share'
  | 'sun'
  | 'moon'
  | 'square'
  | 'cube'
  | 'plus'
  | 'more'
  | 'help-circle';

export interface IconOptions {
  /** Kantenlänge in px. Default 16 (passt zu --btn-h 32). */
  size?: number;
  /** Stroke-Breite. Default 1.6 (Lucide-Konvention). */
  strokeWidth?: number;
}

/**
 * Alle Icons als path-Fragmente (ohne <svg>-Wrapper). Der Wrapper wird
 * in `icon()` gebaut, um `strokeWidth` und `size` einheitlich zu setzen.
 */
const PATHS: Record<IconName, string> = {
  undo: '<path d="M3 8h7.5a2.5 2.5 0 0 1 0 5H7"/><path d="M6 5 3 8l3 3"/>',
  redo: '<path d="M13 8H5.5a2.5 2.5 0 0 0 0 5H9"/><path d="M10 5l3 3-3 3"/>',
  save: '<path d="M3 3h8l2 2v8H3z"/><path d="M5 3v4h6V3"/><path d="M5 13v-4h6v4"/>',
  room: '<rect x="2.5" y="2.5" width="11" height="11" rx=".5"/><path d="M2.5 9h4.5v4.5"/>',
  event:
    '<rect x="2.5" y="3.5" width="11" height="10" rx="1"/><path d="M2.5 6.5h11"/><path d="M5.5 2v3M10.5 2v3"/>',
  leaf: '<path d="M13 3c0 5.5-3.5 9-10 10 1-6 4.5-10 10-10z"/><path d="M13 3 5 11"/>',
  globe:
    '<circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11"/><path d="M8 2.5c1.8 2 1.8 9 0 11M8 2.5c-1.8 2-1.8 9 0 11"/>',
  file: '<path d="M4 2h5l3 3v9H4z"/><path d="M9 2v3h3"/>',
  layers:
    '<path d="M8 2 2 5l6 3 6-3-6-3z"/><path d="m2 8 6 3 6-3"/><path d="m2 11 6 3 6-3"/>',
  chart: '<path d="M2.5 13.5V9M6 13.5V5M9.5 13.5v-6M13 13.5V3"/>',
  share:
    '<circle cx="4" cy="8" r="1.75"/><circle cx="12" cy="4" r="1.75"/><circle cx="12" cy="12" r="1.75"/><path d="m5.5 7 5-2M5.5 9l5 2"/>',
  sun: '<circle cx="8" cy="8" r="2.5"/><path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.3 3.3l1 1M11.7 11.7l1 1M3.3 12.7l1-1M11.7 4.3l1-1"/>',
  moon: '<path d="M13 9.5A5.5 5.5 0 0 1 6.5 3a5.5 5.5 0 1 0 6.5 6.5z"/>',
  square: '<rect x="2.5" y="2.5" width="11" height="11" rx="1"/>',
  cube: '<path d="M8 2 2.5 5v6L8 14l5.5-3V5L8 2z"/><path d="M2.5 5 8 8l5.5-3M8 8v6"/>',
  plus: '<path d="M8 3v10M3 8h10"/>',
  more:
    '<circle cx="3.5" cy="8" r=".9" fill="currentColor" stroke="none"/><circle cx="8" cy="8" r=".9" fill="currentColor" stroke="none"/><circle cx="12.5" cy="8" r=".9" fill="currentColor" stroke="none"/>',
  // help-circle ist NICHT im Design enthalten, aber laut README-Mapping
  // für den ❓-Button erforderlich. Lucide-Standard-Form: Kreis + ?-Glyph.
  'help-circle':
    '<circle cx="8" cy="8" r="6"/><path d="M6.4 6a1.6 1.6 0 0 1 3.2.2c0 .8-.6 1.2-1.2 1.5-.5.3-.8.7-.8 1.3"/><circle cx="8" cy="11.4" r=".55" fill="currentColor" stroke="none"/>',
};

/**
 * Gibt einen SVG-String für das benannte Icon zurück. Unbekannte Namen
 * liefern einen leeren String (statt zu crashen) — damit ein Typo nicht
 * die Topbar komplett zerlegt.
 */
export function icon(name: IconName, opts: IconOptions = {}): string {
  const { size = 16, strokeWidth = 1.6 } = opts;
  const paths = PATHS[name];
  if (!paths) return '';
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 16 16" ` +
    `fill="none" stroke="currentColor" stroke-width="${strokeWidth}" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    paths +
    `</svg>`
  );
}

/** Liste aller registrierten Icon-Namen — für Listen-UIs / Tests. */
export function listIcons(): IconName[] {
  return Object.keys(PATHS) as IconName[];
}
