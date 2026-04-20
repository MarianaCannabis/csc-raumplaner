// P4.7 — Packing-list generator. Aggregiert platzierte Objekte nach
// Kategorie, errechnet Stückzahl, Transport-Volumen und eine grobe
// Gewichts-Schätzung. Output wird im UI als Modal gezeigt; Markdown-
// Kopier-Funktion für Logistiker-Mails und Einkauf.

export interface PackObject {
  typeId: string;
  w?: number;
  d?: number;
  h?: number;
  /** Optional catalog-resolved name for the row label. */
  name?: string;
  /** Optional catalog-resolved icon for the row label. */
  icon?: string;
  /** Optional catalog category so rows group sensibly. */
  cat?: string;
  [k: string]: unknown;
}

export interface PackRow {
  cat: string;
  typeId: string;
  label: string;
  count: number;
  /** Total volume in m³ (sum of w × d × h × count). */
  volumeM3: number;
  /** Estimated weight in kg (per-item × count). */
  weightKg: number;
}

export interface PackResult {
  rows: PackRow[];
  totalItems: number;
  totalVolumeM3: number;
  totalWeightKg: number;
  /** Markdown rendering for clipboard / mail. */
  markdown: string;
}

// Grobe Gewichts-Defaults pro Katalog-Kategorie (kg pro m³). Eher konservativ
// hoch angesetzt, damit Transporter-Planung Sicherheitspuffer hat.
// Messe-Items wiegen wenig (Alu+Stoff+Papierdruck) — daher eigene Sätze.
const WEIGHT_PER_M3: Record<string, number> = {
  'Büro': 180,
  'Empfang': 200,
  'Anbau': 150,
  'Sicherheit': 80,
  'Sozial': 120,
  'Küche': 250,
  'Bau': 400, // Türen/Trennwände
  'Deko': 40,
  'Messe': 60, // Alu-Gestänge + Stoff
  'Stühle': 110,
  'Tische': 140,
  'Sofas': 90,
  'Sanitär': 180,
  'Beleuchtung': 25,
  'Pflanzen': 35,
};

// Per-item defaults (kg) für spezifische Katalog-IDs wo die m³-Pauschale nicht
// passt. Wird vor der Kategorie-Pauschale geprüft.
const PER_ITEM_WEIGHT: Record<string, number> = {
  'p-safe-box': 180, // Tresor
  'msg-backwall-2': 35,
  'msg-backwall-3': 50,
  'msg-backwall-4': 70,
  'msg-rollup': 8,
  'msg-counter-front': 32,
  'msg-led-wall': 28,
  'msg-flag': 6,
};

function catKey(cat: string | undefined): string {
  if (!cat) return 'Sonstiges';
  // Catalog fields often carry emoji + "(Rich)" decoration — strip for lookup.
  const clean = cat.replace(/[^A-Za-zÄÖÜäöüß ]/g, '').replace(/\(Rich\)/gi, '').trim();
  // Pick the first meaningful token; e.g. "💼 Büro (Rich)" → "Büro".
  const first = clean.split(/\s+/)[0] ?? clean;
  return first || 'Sonstiges';
}

function pickLabel(o: PackObject): string {
  const n = o.name ?? o.typeId;
  return o.icon ? `${o.icon} ${n}` : String(n);
}

function weightFor(o: PackObject, volumeM3: number): number {
  const perId = PER_ITEM_WEIGHT[o.typeId];
  if (perId != null) return perId;
  const k = catKey(o.cat);
  const density = WEIGHT_PER_M3[k] ?? 100;
  return Math.round(density * volumeM3);
}

export function buildPackList(objects: PackObject[]): PackResult {
  // Group by typeId so duplicates stack into a single row with count.
  const byTypeId = new Map<string, { sample: PackObject; count: number }>();
  for (const o of objects) {
    const existing = byTypeId.get(o.typeId);
    if (existing) {
      existing.count += 1;
    } else {
      byTypeId.set(o.typeId, { sample: o, count: 1 });
    }
  }

  const rows: PackRow[] = [];
  for (const { sample, count } of byTypeId.values()) {
    const w = sample.w ?? 0.5;
    const d = sample.d ?? 0.5;
    const h = sample.h ?? 0.5;
    const volumePerItem = w * d * h;
    const totalVolume = volumePerItem * count;
    const weight = weightFor(sample, totalVolume);
    rows.push({
      cat: catKey(sample.cat),
      typeId: sample.typeId,
      label: pickLabel(sample),
      count,
      volumeM3: +totalVolume.toFixed(3),
      weightKg: weight,
    });
  }

  rows.sort((a, b) => a.cat.localeCompare(b.cat) || a.label.localeCompare(b.label));

  const totalItems = rows.reduce((s, r) => s + r.count, 0);
  const totalVolumeM3 = +rows.reduce((s, r) => s + r.volumeM3, 0).toFixed(2);
  const totalWeightKg = rows.reduce((s, r) => s + r.weightKg, 0);

  // Render Markdown grouped by category.
  const byCat = new Map<string, PackRow[]>();
  for (const r of rows) {
    const bucket = byCat.get(r.cat) ?? [];
    bucket.push(r);
    byCat.set(r.cat, bucket);
  }
  const mdSections: string[] = [];
  for (const [cat, catRows] of byCat) {
    mdSections.push(`## ${cat}`);
    mdSections.push('');
    mdSections.push('| Stück | Artikel | Volumen (m³) | Gewicht (kg) |');
    mdSections.push('|------:|:--------|-------------:|-------------:|');
    for (const r of catRows) {
      mdSections.push(`| ${r.count} | ${r.label} | ${r.volumeM3.toFixed(3)} | ${r.weightKg} |`);
    }
    mdSections.push('');
  }
  const markdown =
    `# Packliste\n\n` +
    `- Gesamt: **${totalItems} Teile** · **${totalVolumeM3.toFixed(2)} m³** · **${totalWeightKg} kg**\n\n` +
    mdSections.join('\n');

  return { rows, totalItems, totalVolumeM3, totalWeightKg, markdown };
}
