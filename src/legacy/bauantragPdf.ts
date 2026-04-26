/**
 * Bauantrag-PDF-Generator (Mega-Sammel ACBD / Roadmap v3.0 #1).
 *
 * Generiert einen vollständigen behördentauglichen Bauantrag-PDF mit:
 *   - Deckblatt (Vereinsdaten + Antragsdatum)
 *   - Lageplan (top-down Render aus 2D-Canvas)
 *   - Grundrisse (1 Seite pro Floor)
 *   - Positionsplan (Räume nummeriert mit Tabelle)
 *   - Möbel-Liste (tabuliert nach Kategorie)
 *   - Compliance-Bericht (alle 21 Regeln)
 *   - Hygienekonzept (KCanG-Wizard Section D)
 *   - Suchtberatung (Section E)
 *   - Sicherheit (Section F)
 *   - Anhang (Material-Aufstellung, Flächen-Berechnung)
 *
 * Baut auf jsPDF (Lazy-Import, Sitzung E) + KCanG-Wizard-Daten.
 * Leere Sektionen geben Hinweis-Text statt Crash.
 */

import type { jsPDF } from 'jspdf';
import type { KCanGApplication } from './kcangWizard.js';

// ── Types ────────────────────────────────────────────────────────────

export interface ProjectData {
  name: string;
  rooms: Array<{ id: string; name?: string; w: number; d: number; h?: number; x: number; y: number; floorId?: string }>;
  objects: Array<{ id: string; typeId: string; name?: string; x?: number; y?: number; w?: number; d?: number; h?: number; floorId?: string }>;
  walls: unknown[];
  measures: unknown[];
  floors: Array<{ id: string; name: string; elev?: number }>;
  curFloor: string;
}

export interface ComplianceResult {
  rule: { id: string; label: string; icon?: string; severity?: 'critical' | 'warning' | 'info' };
  passed: boolean | null;
  details?: string;
}

export interface BauantragDeps {
  /** KCanG-Wizard-Daten — null wenn Wizard nicht ausgefüllt. */
  kcangApp: KCanGApplication | null;
  /** Aktuelle Projekt-Daten. */
  projectData: ProjectData;
  /** Compliance-Status aus Live-Regeln (21 KCanG-Regeln). */
  complianceResults: ComplianceResult[];
  /** Floor-Render: schaltet temporär curFloor um, snapshot, wieder zurück. */
  renderFloorPlan: (floorId: string) => string;
  /** Top-down 3D-Perspektive als JPEG-dataURL. */
  renderPerspective: () => string;
  /** Toast für Feedback. */
  toast: (msg: string, type?: string) => void;
  /** jsPDF-Lazy-Loader (gleicher Chunk wie KCanG-Wizard). */
  loadJsPdf: () => Promise<{ jsPDF: typeof jsPDF }>;
  /** Optional: findItem-Lookup für Möbel-Kategorien (Catalog-Bridge). */
  findItem?: (typeId: string) => { name?: string; cat?: string } | null;
  /** Optional: getObjPrice für Material-Aufstellung. */
  getObjPrice?: (typeId: string) => number;
}

export interface BauantragOptions {
  includeSections?: {
    deckblatt?: boolean;
    lageplan?: boolean;
    grundrisse?: boolean;
    positionsplan?: boolean;
    moebelListe?: boolean;
    compliance?: boolean;
    hygiene?: boolean;
    suchtberatung?: boolean;
    sicherheit?: boolean;
    anhang?: boolean;
  };
  format?: 'a4' | 'a3';
  orientation?: 'portrait' | 'landscape';
}

// ── Hauptfunktion ────────────────────────────────────────────────────

export async function generateBauantragPdf(
  deps: BauantragDeps,
  opts: BauantragOptions = {},
): Promise<void> {
  const sections = {
    deckblatt: true,
    lageplan: true,
    grundrisse: true,
    positionsplan: true,
    moebelListe: true,
    compliance: true,
    hygiene: true,
    suchtberatung: true,
    sicherheit: true,
    anhang: true,
    ...opts.includeSections,
  };

  deps.toast('📋 Bauantrag-PDF wird generiert (kann ~30s dauern)…', 'b');
  let doc: jsPDF;
  try {
    const mod = await deps.loadJsPdf();
    doc = new mod.jsPDF({
      format: opts.format ?? 'a4',
      orientation: opts.orientation ?? 'portrait',
      unit: 'mm',
    });
  } catch (e) {
    deps.toast('PDF-Engine konnte nicht geladen werden', 'r');
    throw e;
  }

  const ctx: RenderCtx = {
    doc,
    deps,
    pageW: doc.internal.pageSize.getWidth(),
    pageH: doc.internal.pageSize.getHeight(),
    marginL: 15,
    marginR: 15,
    marginT: 18,
    marginB: 18,
    y: 18,
    sectionStarted: false,
    sectionTitles: [],
  };

  if (sections.deckblatt) renderDeckblatt(ctx);
  if (sections.lageplan) renderLageplan(ctx);
  if (sections.grundrisse) renderGrundrisse(ctx);
  if (sections.positionsplan) renderPositionsplan(ctx);
  if (sections.moebelListe) renderMoebelListe(ctx);
  if (sections.compliance) renderComplianceBericht(ctx);
  if (sections.hygiene) renderHygiene(ctx);
  if (sections.suchtberatung) renderSuchtberatung(ctx);
  if (sections.sicherheit) renderSicherheit(ctx);
  if (sections.anhang) renderAnhang(ctx);

  addFooterToAllPages(ctx);

  const vereinsname = deps.kcangApp?.vereinsdaten.name || deps.projectData.name || 'Antrag';
  const safeName = vereinsname.replace(/[^a-z0-9_-]+/gi, '_').slice(0, 40);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `Bauantrag_${safeName}_${today}.pdf`;
  doc.save(filename);
  deps.toast('✅ Bauantrag erstellt: ' + filename, 'g');
}

// ── Render-Context (intern) ──────────────────────────────────────────

interface RenderCtx {
  doc: jsPDF;
  deps: BauantragDeps;
  pageW: number;
  pageH: number;
  marginL: number;
  marginR: number;
  marginT: number;
  marginB: number;
  y: number;
  sectionStarted: boolean;
  sectionTitles: string[]; // für TOC (Phase 2)
}

function newPage(ctx: RenderCtx): void {
  ctx.doc.addPage();
  ctx.y = ctx.marginT;
}

function ensureSpace(ctx: RenderCtx, needed: number): void {
  if (ctx.y + needed > ctx.pageH - ctx.marginB) newPage(ctx);
}

function sectionHeader(ctx: RenderCtx, title: string): void {
  if (ctx.sectionStarted) newPage(ctx);
  ctx.sectionStarted = true;
  ctx.sectionTitles.push(title);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setFontSize(16);
  ctx.doc.text(title, ctx.marginL, ctx.y);
  ctx.y += 9;
  ctx.doc.setLineWidth(0.5);
  ctx.doc.line(ctx.marginL, ctx.y - 2, ctx.pageW - ctx.marginR, ctx.y - 2);
  ctx.y += 4;
  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.setFontSize(10);
}

function bodyText(ctx: RenderCtx, text: string, opts: { size?: number; bold?: boolean } = {}): void {
  if (!text) return;
  if (opts.bold) ctx.doc.setFont('helvetica', 'bold');
  if (opts.size) ctx.doc.setFontSize(opts.size);
  const lines = ctx.doc.splitTextToSize(text, ctx.pageW - ctx.marginL - ctx.marginR);
  const lineHeight = (opts.size ?? 10) * 0.45;
  ensureSpace(ctx, lines.length * lineHeight);
  ctx.doc.text(lines, ctx.marginL, ctx.y);
  ctx.y += lines.length * lineHeight;
  if (opts.bold || opts.size) {
    ctx.doc.setFont('helvetica', 'normal');
    ctx.doc.setFontSize(10);
  }
}

function fieldRow(ctx: RenderCtx, label: string, value: string): void {
  ensureSpace(ctx, 6);
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.text(label + ':', ctx.marginL, ctx.y);
  ctx.doc.setFont('helvetica', 'normal');
  const valLines = ctx.doc.splitTextToSize(value || '—', ctx.pageW - ctx.marginL - ctx.marginR - 55);
  ctx.doc.text(valLines, ctx.marginL + 55, ctx.y);
  ctx.y += Math.max(6, valLines.length * 4.5);
}

function checkbox(ctx: RenderCtx, label: string, checked: boolean): void {
  ensureSpace(ctx, 5);
  ctx.doc.text(checked ? '[x]' : '[ ]', ctx.marginL, ctx.y);
  ctx.doc.text(label, ctx.marginL + 8, ctx.y);
  ctx.y += 5;
}

// ── Section-Renderer ─────────────────────────────────────────────────

function renderDeckblatt(ctx: RenderCtx): void {
  // Erstes Deckblatt — KEIN newPage davor
  const v = ctx.deps.kcangApp?.vereinsdaten;
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setFontSize(28);
  ctx.doc.text('Bauantrag', ctx.pageW / 2, 60, { align: 'center' });
  ctx.doc.setFontSize(14);
  ctx.doc.text('nach KCanG (Konsumcannabisgesetz)', ctx.pageW / 2, 72, { align: 'center' });
  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.setFontSize(11);

  ctx.y = 100;
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.text('Antragsteller', ctx.marginL, ctx.y);
  ctx.y += 8;
  ctx.doc.setFont('helvetica', 'normal');
  fieldRow(ctx, 'Verein', v?.name || ctx.deps.projectData.name || '—');
  fieldRow(ctx, 'Adresse', v?.adresse || '—');
  fieldRow(ctx, 'Mitgliederzahl', String(v?.mitgliederzahl ?? '—'));
  fieldRow(
    ctx,
    'Präventionsbeauftragter',
    v?.praeventionsbeauftragter.name || '—',
  );

  ctx.y += 15;
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.text('Antragsdatum', ctx.marginL, ctx.y);
  ctx.y += 8;
  ctx.doc.setFont('helvetica', 'normal');
  ctx.doc.text(new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }), ctx.marginL, ctx.y);

  ctx.y += 30;
  ctx.doc.setFont('helvetica', 'italic');
  ctx.doc.setFontSize(10);
  bodyText(
    ctx,
    'Dieser Antrag dokumentiert die räumliche Konzeption gemäß §§ 11–14 KCanG. Beigefügt sind: ' +
      'Lageplan, Grundrisse, Positionsplan mit Möbel-Liste, Compliance-Bericht, Hygienekonzept, ' +
      'Suchtberatungs-Konzept und Sicherheits-Nachweise.',
  );
  ctx.doc.setFont('helvetica', 'normal');
}

function renderLageplan(ctx: RenderCtx): void {
  sectionHeader(ctx, 'Lageplan (Top-Down)');
  bodyText(
    ctx,
    'Übersicht des Vereinsgeländes mit Grundriss-Markierung. Norden ist oben.',
  );
  ctx.y += 4;
  let imgData = '';
  try {
    imgData = ctx.deps.renderPerspective();
  } catch {
    /* ignore */
  }
  if (imgData) {
    const imgW = ctx.pageW - ctx.marginL - ctx.marginR;
    const imgH = imgW * 0.625; // 16:10-Verhältnis
    ensureSpace(ctx, imgH);
    try {
      ctx.doc.addImage(imgData, 'JPEG', ctx.marginL, ctx.y, imgW, imgH);
      ctx.y += imgH + 4;
    } catch {
      bodyText(ctx, '(Lageplan-Render fehlgeschlagen.)');
    }
  } else {
    bodyText(ctx, '(Kein Lageplan verfügbar — 3D-Szene nicht initialisiert.)');
  }
}

function renderGrundrisse(ctx: RenderCtx): void {
  const floors = ctx.deps.projectData.floors.length > 0
    ? ctx.deps.projectData.floors
    : [{ id: ctx.deps.projectData.curFloor || 'eg', name: 'Erdgeschoss' }];
  for (const floor of floors) {
    sectionHeader(ctx, 'Grundriss — ' + floor.name);
    let imgData = '';
    try {
      imgData = ctx.deps.renderFloorPlan(floor.id);
    } catch {
      /* ignore */
    }
    if (imgData) {
      const imgW = ctx.pageW - ctx.marginL - ctx.marginR;
      const imgH = imgW * 0.7;
      ensureSpace(ctx, imgH);
      try {
        ctx.doc.addImage(imgData, 'JPEG', ctx.marginL, ctx.y, imgW, imgH);
        ctx.y += imgH + 4;
      } catch {
        bodyText(ctx, '(Grundriss konnte nicht eingebettet werden.)');
      }
    } else {
      bodyText(ctx, '(Kein Grundriss-Render für diesen Floor.)');
    }
  }
}

function renderPositionsplan(ctx: RenderCtx): void {
  sectionHeader(ctx, 'Positionsplan');
  const rooms = ctx.deps.projectData.rooms;
  if (rooms.length === 0) {
    bodyText(ctx, 'Keine Räume erfasst.');
    return;
  }
  bodyText(ctx, 'Aufstellung aller Räume mit Maßen + Flächen:');
  ctx.y += 2;
  // Tabellen-Header
  ctx.doc.setFont('helvetica', 'bold');
  const cols = [
    { label: 'Nr.', w: 12 },
    { label: 'Bezeichnung', w: 70 },
    { label: 'Breite', w: 22 },
    { label: 'Tiefe', w: 22 },
    { label: 'Fläche', w: 28 },
    { label: 'Etage', w: 25 },
  ];
  let x = ctx.marginL;
  for (const c of cols) {
    ctx.doc.text(c.label, x, ctx.y);
    x += c.w;
  }
  ctx.y += 5;
  ctx.doc.line(ctx.marginL, ctx.y - 2, ctx.pageW - ctx.marginR, ctx.y - 2);
  ctx.doc.setFont('helvetica', 'normal');
  let totalArea = 0;
  rooms.forEach((r, i) => {
    ensureSpace(ctx, 5);
    const area = (r.w || 0) * (r.d || 0);
    totalArea += area;
    x = ctx.marginL;
    ctx.doc.text(String(i + 1), x, ctx.y);
    x += cols[0]!.w;
    ctx.doc.text((r.name || 'Raum ' + (i + 1)).slice(0, 30), x, ctx.y);
    x += cols[1]!.w;
    ctx.doc.text(r.w.toFixed(2) + ' m', x, ctx.y);
    x += cols[2]!.w;
    ctx.doc.text(r.d.toFixed(2) + ' m', x, ctx.y);
    x += cols[3]!.w;
    ctx.doc.text(area.toFixed(2) + ' m²', x, ctx.y);
    x += cols[4]!.w;
    ctx.doc.text(r.floorId || '—', x, ctx.y);
    ctx.y += 4.5;
  });
  ctx.y += 2;
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.text('Gesamtfläche: ' + totalArea.toFixed(2) + ' m²', ctx.marginL, ctx.y);
  ctx.y += 6;
  ctx.doc.setFont('helvetica', 'normal');
}

function renderMoebelListe(ctx: RenderCtx): void {
  sectionHeader(ctx, 'Möbel- und Ausstattungsliste');
  const objects = ctx.deps.projectData.objects;
  if (objects.length === 0) {
    bodyText(ctx, 'Keine Möbel erfasst.');
    return;
  }
  // Gruppieren nach Kategorie via deps.findItem
  const byCategory = new Map<string, Array<{ name: string; count: number }>>();
  for (const o of objects) {
    const item = ctx.deps.findItem?.(o.typeId);
    const cat = item?.cat || 'Sonstige';
    const name = item?.name || o.typeId;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    const arr = byCategory.get(cat)!;
    const existing = arr.find((e) => e.name === name);
    if (existing) existing.count++;
    else arr.push({ name, count: 1 });
  }
  for (const [cat, items] of [...byCategory.entries()].sort()) {
    ensureSpace(ctx, 8);
    ctx.doc.setFont('helvetica', 'bold');
    ctx.doc.text(cat, ctx.marginL, ctx.y);
    ctx.y += 5;
    ctx.doc.setFont('helvetica', 'normal');
    for (const it of items) {
      ensureSpace(ctx, 4.5);
      ctx.doc.text(`  • ${it.count}× ${it.name}`, ctx.marginL, ctx.y);
      ctx.y += 4.5;
    }
    ctx.y += 2;
  }
}

function renderComplianceBericht(ctx: RenderCtx): void {
  sectionHeader(ctx, 'Compliance-Bericht (KCanG-Regeln)');
  const results = ctx.deps.complianceResults;
  if (results.length === 0) {
    bodyText(ctx, 'Noch keine Compliance-Regeln evaluiert.');
    return;
  }
  bodyText(
    ctx,
    `Geprüfte Regeln: ${results.length}. ` +
      `Bestanden: ${results.filter((r) => r.passed === true).length}, ` +
      `Nicht bestanden: ${results.filter((r) => r.passed === false).length}, ` +
      `N/A: ${results.filter((r) => r.passed === null).length}`,
  );
  ctx.y += 4;
  for (const r of results) {
    ensureSpace(ctx, 9);
    const symbol = r.passed === true ? '[OK]' : r.passed === false ? '[FAIL]' : '[N/A]';
    ctx.doc.setFont('helvetica', 'bold');
    ctx.doc.text(symbol + ' ' + r.rule.label, ctx.marginL, ctx.y);
    ctx.y += 4.5;
    if (r.details) {
      ctx.doc.setFont('helvetica', 'normal');
      ctx.doc.setFontSize(9);
      const lines = ctx.doc.splitTextToSize(r.details, ctx.pageW - ctx.marginL - ctx.marginR - 5);
      ctx.doc.text(lines, ctx.marginL + 5, ctx.y);
      ctx.y += lines.length * 4;
      ctx.doc.setFontSize(10);
    }
    ctx.y += 1.5;
  }
}

function renderHygiene(ctx: RenderCtx): void {
  sectionHeader(ctx, 'Hygienekonzept');
  const h = ctx.deps.kcangApp?.hygienekonzept;
  if (!h) {
    bodyText(ctx, 'Hygienekonzept-Daten fehlen — bitte KCanG-Wizard ausfüllen.');
    return;
  }
  checkbox(ctx, 'Händewaschmöglichkeit', h.haendewaschen);
  checkbox(ctx, 'Flächendesinfektion', h.desinfektion);
  checkbox(ctx, 'Schädlingsbekämpfungs-Konzept', h.schaedlingsbekaempfung);
  checkbox(ctx, 'Abfallentsorgung dokumentiert', h.abfallentsorgung);
  checkbox(ctx, 'Personal geschult', h.schulung_personal);
  if (h.notizen) {
    ctx.y += 3;
    bodyText(ctx, 'Notizen: ' + h.notizen);
  }
}

function renderSuchtberatung(ctx: RenderCtx): void {
  sectionHeader(ctx, 'Suchtberatung');
  const s = ctx.deps.kcangApp?.suchtberatung;
  if (!s) {
    bodyText(ctx, 'Suchtberatungs-Daten fehlen — bitte KCanG-Wizard ausfüllen.');
    return;
  }
  fieldRow(ctx, 'Kontakt-Name', s.kontakt_name);
  fieldRow(ctx, 'E-Mail', s.kontakt_email);
  fieldRow(ctx, 'Telefon', s.kontakt_telefon);
  if (s.konzept_text) {
    ctx.y += 3;
    bodyText(ctx, 'Vermittlungs-Konzept:', { bold: true });
    bodyText(ctx, s.konzept_text);
  }
}

function renderSicherheit(ctx: RenderCtx): void {
  sectionHeader(ctx, 'Sicherheit');
  const sec = ctx.deps.kcangApp?.sicherheit;
  if (!sec) {
    bodyText(ctx, 'Sicherheits-Daten fehlen — bitte KCanG-Wizard ausfüllen.');
    return;
  }
  checkbox(ctx, 'Brandschutz vorhanden', sec.brandschutz.vorhanden);
  if (sec.brandschutz.notizen) bodyText(ctx, '  ' + sec.brandschutz.notizen, { size: 9 });
  checkbox(ctx, 'Notausgang gekennzeichnet', sec.notausgang.vorhanden);
  if (sec.notausgang.notizen) bodyText(ctx, '  ' + sec.notausgang.notizen, { size: 9 });
  checkbox(ctx, 'Sichtschutz § 14 KCanG', sec.sichtschutz_p14.vorhanden);
  if (sec.sichtschutz_p14.notizen) bodyText(ctx, '  ' + sec.sichtschutz_p14.notizen, { size: 9 });
  checkbox(ctx, '§ 13 POI-Distanz bestätigt', sec.poi_distanz_p13.bestaetigt);
  fieldRow(ctx, 'Geringste Entfernung', sec.poi_distanz_p13.entfernung_m + ' m');
}

function renderAnhang(ctx: RenderCtx): void {
  sectionHeader(ctx, 'Anhang — Material-Aufstellung');
  const objects = ctx.deps.projectData.objects;
  if (objects.length === 0) {
    bodyText(ctx, 'Keine Materialaufstellung — keine Möbel im Projekt.');
    return;
  }
  let totalCost = 0;
  if (ctx.deps.getObjPrice) {
    bodyText(ctx, 'Schätzkosten (basierend auf Catalog-Preisen):', { bold: true });
    ctx.y += 2;
    const counts = new Map<string, { count: number; price: number }>();
    for (const o of objects) {
      const price = ctx.deps.getObjPrice(o.typeId) || 0;
      const item = ctx.deps.findItem?.(o.typeId);
      const name = item?.name || o.typeId;
      const ex = counts.get(name);
      if (ex) ex.count++;
      else counts.set(name, { count: 1, price });
    }
    for (const [name, data] of [...counts.entries()].sort()) {
      ensureSpace(ctx, 4.5);
      const sub = data.count * data.price;
      totalCost += sub;
      ctx.doc.text(
        `${data.count}× ${name.slice(0, 35)}: ${sub.toFixed(2)} €`,
        ctx.marginL,
        ctx.y,
      );
      ctx.y += 4.5;
    }
    ctx.y += 2;
    ctx.doc.setFont('helvetica', 'bold');
    ctx.doc.text('Schätzkosten gesamt: ' + totalCost.toFixed(2) + ' €', ctx.marginL, ctx.y);
    ctx.y += 6;
    ctx.doc.setFont('helvetica', 'normal');
  }

  // Flächen-Berechnung pro Raum-Typ (heuristisch via Name)
  const rooms = ctx.deps.projectData.rooms;
  if (rooms.length > 0) {
    sectionHeader(ctx, 'Anhang — Flächen-Berechnung');
    bodyText(ctx, 'Aufschlüsselung nach Raum-Typ (heuristisch via Raum-Name):');
    ctx.y += 2;
    const byType = new Map<string, { count: number; area: number }>();
    for (const r of rooms) {
      const lower = (r.name || '').toLowerCase();
      let type = 'Sonstige';
      if (/lager|stor|depot/.test(lower)) type = 'Lager';
      else if (/anbau|grow|kultur/.test(lower)) type = 'Anbau';
      else if (/ausgabe|theke|verkauf/.test(lower)) type = 'Ausgabe';
      else if (/sozial|aufenthalt|lounge/.test(lower)) type = 'Sozialräume';
      else if (/wc|toilette|bad/.test(lower)) type = 'Sanitär';
      const ex = byType.get(type);
      const a = (r.w || 0) * (r.d || 0);
      if (ex) {
        ex.count++;
        ex.area += a;
      } else {
        byType.set(type, { count: 1, area: a });
      }
    }
    for (const [type, data] of [...byType.entries()].sort()) {
      ensureSpace(ctx, 5);
      ctx.doc.text(`${type}: ${data.count} Räume, ${data.area.toFixed(2)} m²`, ctx.marginL, ctx.y);
      ctx.y += 5;
    }
  }
}

function addFooterToAllPages(ctx: RenderCtx): void {
  const total = ctx.doc.getNumberOfPages();
  const verein =
    ctx.deps.kcangApp?.vereinsdaten.name || ctx.deps.projectData.name || 'Antrag';
  const today = new Date().toLocaleDateString('de-DE');
  for (let i = 1; i <= total; i++) {
    ctx.doc.setPage(i);
    ctx.doc.setFontSize(8);
    ctx.doc.setTextColor(120);
    ctx.doc.text(
      `Seite ${i} / ${total} · KCanG-Bauantrag · ${verein} · ${today}`,
      ctx.pageW / 2,
      ctx.pageH - 8,
      { align: 'center' },
    );
    ctx.doc.setTextColor(0);
  }
}
