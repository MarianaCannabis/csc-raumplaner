export interface Credit {
  name: string;
  source: string;
  license: string;
  url?: string;
  /** Optional note (scope, CC0 vs CC-BY attribution niceties, etc.). */
  note?: string;
}

// Stand 2026-04-19. CC0-Quellen werden trotzdem namentlich genannt, obwohl
// keine Namensnennung rechtlich gefordert ist — Respekt und Rückverweis für
// künftige Nutzer.
export const CREDITS: Credit[] = [
  {
    name: 'Duck.glb (Pipeline-Test)',
    source: 'Khronos glTF Sample Models',
    license: 'CC-BY 4.0 (Sony / Intel)',
    url: 'https://github.com/KhronosGroup/glTF-Sample-Models',
    note: 'Wird in P3.2c durch echte CSC-Furniture-Modelle ersetzt.',
  },
  {
    name: 'Quaternius — Ultimate Interior / Kitchen / Office Packs',
    source: 'quaternius.com',
    license: 'CC0 1.0 Universal (Public Domain)',
    url: 'https://quaternius.com',
    note: 'Keine Namensnennung rechtlich nötig — freiwillig aufgeführt.',
  },
  {
    name: 'Kenney — Furniture Kit / Office Kit',
    source: 'kenney.nl',
    license: 'CC0 1.0 Universal (Public Domain)',
    url: 'https://kenney.nl/assets',
    note: 'Keine Namensnennung rechtlich nötig — freiwillig aufgeführt.',
  },
  {
    name: 'ambientCG — PBR Texture Maps',
    source: 'ambientcg.com',
    license: 'CC0 1.0 Universal (Public Domain)',
    url: 'https://ambientcg.com',
    note: 'Wood / Metal / Fabric / Concrete albedo-normal-roughness Sets.',
  },
  {
    name: 'Poly Haven (potentielle Ergänzung)',
    source: 'polyhaven.com',
    license: 'CC0 1.0 Universal (Public Domain)',
    url: 'https://polyhaven.com',
    note: 'Reserviert für Einzel-Assets (HDRIs, Deko-Modelle) in P3.3.',
  },
];

/** Render the credit list as a plain HTML string (no innerHTML injection of
 *  user data — all fields are static / developer-authored). Used by the
 *  🎨 Credits modal in the legacy index.html. */
export function renderCreditsHtml(): string {
  if (CREDITS.length === 0) {
    return '<div style="font-size:11px;color:var(--tx3);padding:12px">Keine Drittanbieter-Assets eingebunden.</div>';
  }
  return (
    '<div style="padding:12px;max-height:60vh;overflow-y:auto">' +
    CREDITS.map(
      (c) =>
        '<div style="padding:8px 0;border-bottom:1px solid var(--bd)">' +
        '<div style="font-size:12px;font-weight:600;color:var(--tx)">' +
        escapeHtml(c.name) +
        '</div>' +
        '<div style="font-size:10px;color:var(--tx2);margin-top:2px">' +
        escapeHtml(c.source) +
        '</div>' +
        '<div style="font-size:10px;color:var(--tx3);margin-top:2px">' +
        escapeHtml(c.license) +
        '</div>' +
        (c.note
          ? '<div style="font-size:10px;color:var(--tx3);margin-top:2px;font-style:italic">' +
            escapeHtml(c.note) +
            '</div>'
          : '') +
        (c.url
          ? '<a href="' +
            escapeHtml(c.url) +
            '" target="_blank" rel="noopener noreferrer" style="font-size:10px;color:var(--gr)">↗ Quelle</a>'
          : '') +
        '</div>',
    ).join('') +
    '</div>'
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
