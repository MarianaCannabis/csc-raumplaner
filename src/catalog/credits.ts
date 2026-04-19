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
    name: 'Poly Haven — Studio Small 08 + Dikhololo Night (HDRIs)',
    source: 'polyhaven.com',
    license: 'CC0 1.0 Universal (keine Namensnennung nötig)',
    url: 'https://polyhaven.com/a/studio_small_08',
    note: 'Equirectangular HDR → PMREM-Envmap für PBR-Reflexionen. Studio = neutrales Key-Light, Dikhololo = warmes Abend. Umschaltbar via Ansicht-Menü.',
  },
  {
    name: 'CSC Raumplaner — Rich Primitives (proprietär, MIT)',
    source: 'Eigenentwicklung auf Basis Three.js Primitives',
    license: 'MIT',
    note: 'P3.2: ~40 Möbel/Geräte-Items rein prozedural aus Three.js Box/Cylinder/Sphere/Plane + PBR-Materialien (MeshStandardMaterial / MeshPhysicalMaterial mit Sheen, Transmission, Clearcoat). Kein externes Asset nötig. Siehe src/three/primitiveBuilders.ts.',
  },
  {
    name: 'Kenney Furniture Kit 2.0 (54 Modelle)',
    source: 'kenney.nl',
    license: 'CC0 1.0 Universal (Public Domain)',
    url: 'https://kenney.nl/assets/furniture-kit',
    note: 'Stühle, Tische, Sofas, Küche, Büro, Sanitär, Pflanzen/Deko — 54 von 140 GLB-Modellen ausgewählt. Keine Namensnennung rechtlich nötig; freiwillig aufgeführt.',
  },
  {
    name: 'Quaternius — Ultimate House Interior Pack (82 Modelle via Poly Pizza)',
    source: 'quaternius.com / poly.pizza',
    license: 'CC0 1.0 Universal (Public Domain)',
    url: 'https://poly.pizza/bundle/Ultimate-House-Interior-Pack-2SXnFbwFzm',
    note: 'Alle 82 Modelle aus dem Bundle geladen. Pro-Modell-Attribution in public/models/quaternius/interior/_credits.json. Keine Namensnennung rechtlich nötig; freiwillig aufgeführt.',
  },
  {
    name: 'ambientCG — PBR-Texturen (Holz, Metall, Stoff, Plastik, Beton)',
    source: 'ambientcg.com',
    license: 'CC0 1.0 Universal (Public Domain)',
    url: 'https://ambientcg.com',
    note: 'Color/NormalGL/Roughness @ 2K, auf Set-IDs Wood050, Metal032, Fabric070, Plastic008, Concrete033. Geladen und gecached via TextureLoader in src/three/materials.ts; automatisch auf allen 39 Rich-Primitive-Buildern sobald sie via matWood/matMetal/matFabric/matPlastic/matConcrete rendern. Glas rendert weiter prozedural (MeshPhysicalMaterial mit transmission — architektonisch passender als eine fotografierte Glasoberfläche).',
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
