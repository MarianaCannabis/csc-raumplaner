/**
 * CSC Studio Pro — Icon-Set (Lucide-Style, vanilla SVG-Strings)
 *
 * Vanilla-JS-Port der Icons aus design/topbar-redesign/topbar.jsx. Jedes
 * Icon ist eine 16×16 currentColor-stroke-Shape mit round-line-caps; der
 * Aufrufer steuert Farbe via CSS (color/stroke) und Größe via `size`.
 *
 * Scope (29 Icons, siehe design/topbar-redesign/README.md — Emoji-Mapping):
 *   undo, redo, save, room, event, leaf, globe, file, layers, chart,
 *   share, sun, moon, square, cube, plus, more, help-circle, chevron, edit-2,
 *   house, sofa, building, shield, star (P15 Cluster 7a — Sidebar-Rail),
 *   bot, palette, sunrise, settings (P15 Cluster 7b — Right-Panel-Tabs)
 *
 * Bewusst NICHT portiert: Row-2-Tools (cursor, wall, roomdraw, area,
 * ruler, move, center, box, folder, sliders), view, clock.
 * Row-2 gehört in unsere Architektur nicht in die Topbar; view/clock
 * kommen in der App nicht vor.
 *
 * chevron: P15 Cluster 4d nachgereicht für die Dropdown-Menü-Trigger
 * (Datei/Ansicht/Analyse/Teilen) — ersetzt den alten ▾-Unicode-Glyph.
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
  | 'help-circle'
  | 'chevron'
  | 'edit-2'
  | 'house'
  | 'sofa'
  | 'building'
  | 'shield'
  | 'star'
  | 'bot'
  | 'palette'
  | 'sunrise'
  | 'settings';

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
  // chevron: Dropdown-Menu-Affordance, ersetzt den alten ▾-Unicode-Glyph
  // in Datei/Ansicht/Analyse/Teilen (P15 Cluster 4d). Aus topbar.jsx.
  chevron: '<path d="m4 6 4 4 4-4"/>',
  // edit-2: Rename-Pen, ersetzt ✏️-Emoji beim Project-Rename-Button
  // (P15 Cluster 4e). Lucide-Pencil-Form.
  'edit-2':
    '<path d="M11.3 2.7a1.5 1.5 0 0 1 2.1 2.1L5 13.3l-3 .7.7-3 8.6-8.3z"/>',
  // P15 Cluster 7a — Sidebar-Rail (ersetzt Emoji-Glyphen in ib-*).
  house: '<path d="M2.5 7.5 8 3l5.5 4.5"/><path d="M4 7v6.5h8V7"/><path d="M7 13.5V10h2v3.5"/>',
  sofa: '<path d="M2 8V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/><path d="M10 8V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2"/><path d="M2.5 8h11a1 1 0 0 1 1 1v2.5H1.5V9a1 1 0 0 1 1-1z"/><path d="M3 11.5v1.5M13 11.5v1.5"/>',
  building: '<rect x="3" y="2.5" width="10" height="11" rx=".5"/><path d="M5.5 5h1M9.5 5h1M5.5 7.5h1M9.5 7.5h1M5.5 10h1M9.5 10h1"/><path d="M6.5 13.5v-2h3v2"/>',
  shield: '<path d="M8 2 3 4v4.5c0 2.8 2 4.6 5 5.5 3-0.9 5-2.7 5-5.5V4L8 2z"/>',
  star: '<path d="m8 2 1.8 3.7 4.1.6-3 2.9.7 4L8 11.3 4.4 13.2l.7-4-3-2.9 4.1-.6L8 2z"/>',
  // P15 Cluster 7b — Right-Panel-Tabs (ersetzt Emoji-Glyphen in rtab-*).
  bot: '<rect x="2.5" y="5.5" width="11" height="7" rx="1.5"/><path d="M8 3V2M5.5 5.5V4M10.5 5.5V4"/><circle cx="6" cy="9" r=".7" fill="currentColor" stroke="none"/><circle cx="10" cy="9" r=".7" fill="currentColor" stroke="none"/>',
  palette: '<path d="M8 2a6 6 0 1 0 0 12c.6 0 1-.5 1-1 0-.3-.1-.5-.3-.7-.2-.2-.3-.5-.3-.8 0-.6.5-1 1-1H11a3 3 0 0 0 3-3c0-3.3-2.7-6-6-6z"/><circle cx="5" cy="6.5" r=".7" fill="currentColor" stroke="none"/><circle cx="8" cy="5" r=".7" fill="currentColor" stroke="none"/><circle cx="11" cy="6.5" r=".7" fill="currentColor" stroke="none"/><circle cx="12" cy="9.5" r=".7" fill="currentColor" stroke="none"/>',
  sunrise: '<circle cx="8" cy="9" r="2.5"/><path d="M8 4V2.5M2.5 9H4M12 9h1.5M4 5l1 1M11 5l1-1"/><path d="M2 12.5h12"/><path d="M5 10.5 8 7l3 3.5"/>',
  settings: '<circle cx="8" cy="8" r="2"/><path d="M13 8a5 5 0 0 0-.1-.9l1.2-.9-1-1.7-1.4.4c-.5-.5-1-.9-1.7-1.1L9.6 2H6.4L6 3.8c-.6.2-1.2.6-1.7 1.1l-1.4-.4-1 1.7 1.2.9A5 5 0 0 0 3 8c0 .3 0 .6.1.9l-1.2.9 1 1.7 1.4-.4c.5.5 1 .9 1.7 1.1l.4 1.8h3.2l.4-1.8c.6-.2 1.2-.6 1.7-1.1l1.4.4 1-1.7-1.2-.9c.1-.3.1-.6.1-.9z"/>',
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
