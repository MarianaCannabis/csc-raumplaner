/**
 * PDF-Export für KCanG-Antrag (Pfad-E #4).
 *
 * Strategie (User-Architektur-Entscheidung Q4=ba):
 * - Standard: jsPDF clientside via dynamic import (gute Layout-Kontrolle,
 *   ~30 KB lazy-Chunk wie GLTFExporter in Pfad-B Sub-Task 1).
 * - Fallback: browser-print mit print-CSS (kein Bundle-Hit, weniger
 *   schöne Layout-Kontrolle aber funktional).
 *
 * Caller wählt via deps.preferJsPdf (default true). Wenn jsPDF-Lazy-Load
 * fehlschlägt → automatischer Fallback auf browser-print.
 */

import type { KCanGApplication } from './kcangWizard.js';
import type { jsPDF } from 'jspdf';

export interface PdfExportDeps {
  preferJsPdf?: boolean; // default true
  toast?: (msg: string, type?: string) => void;
  /** Test-Injection: alternative jsPDF-Loader (für Mock). */
  loadJsPdf?: () => Promise<{ jsPDF: typeof import('jspdf').jsPDF }>;
  /** Test-Injection: alternativer print-Fallback (statt window.open + print). */
  printFallback?: (app: KCanGApplication) => void;
}

let _jsPdfPromise: Promise<{ jsPDF: typeof import('jspdf').jsPDF }> | null = null;
async function defaultLoadJsPdf(): Promise<{ jsPDF: typeof import('jspdf').jsPDF }> {
  if (_jsPdfPromise) return _jsPdfPromise;
  _jsPdfPromise = import('jspdf');
  return _jsPdfPromise;
}

export async function exportApplicationAsPdf(
  app: KCanGApplication,
  deps: PdfExportDeps = {},
): Promise<void> {
  const useJsPdf = deps.preferJsPdf !== false;

  if (useJsPdf) {
    try {
      if (deps.toast) deps.toast('PDF-Engine wird geladen…', 'b');
      const loader = deps.loadJsPdf ?? defaultLoadJsPdf;
      const mod = await loader();
      const doc = new mod.jsPDF({ unit: 'mm', format: 'a4' });
      generateWithJsPdf(app, doc);
      const fname =
        'KCanG-Antrag-' +
        (app.vereinsdaten.name || 'unbenannt').replace(/[^a-z0-9_-]+/gi, '_') +
        '.pdf';
      doc.save(fname);
      if (deps.toast) deps.toast('PDF erstellt: ' + fname, 'g');
      return;
    } catch (err) {
      console.warn('[kcang-pdf] jsPDF fehlgeschlagen, fallback auf browser-print', err);
    }
  }

  // Fallback: browser-print
  const fallback = deps.printFallback ?? printWithBrowser;
  fallback(app);
  if (deps.toast) deps.toast('Browser-Print geöffnet', 'b');
}

function generateWithJsPdf(app: KCanGApplication, doc: jsPDF): void {
  const v = app.vereinsdaten;
  let y = 18;
  const lineHeight = 6;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 15;
  const marginR = 15;
  const usableW = pageW - marginL - marginR;

  function ensureSpace(needed: number): void {
    if (y + needed > pageH - 15) {
      doc.addPage();
      y = 18;
    }
  }

  function header(text: string, size = 14): void {
    ensureSpace(lineHeight + 2);
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.text(text, marginL, y);
    y += lineHeight + 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  }

  function field(label: string, value: string): void {
    ensureSpace(lineHeight);
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', marginL, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(value || '—', usableW - 50);
    doc.text(lines, marginL + 50, y);
    y += Math.max(lineHeight, lines.length * lineHeight);
  }

  function checkbox(label: string, checked: boolean): void {
    ensureSpace(lineHeight);
    doc.text(checked ? '[x]' : '[ ]', marginL, y);
    doc.text(label, marginL + 8, y);
    y += lineHeight;
  }

  function text(s: string): void {
    if (!s) return;
    const lines = doc.splitTextToSize(s, usableW);
    ensureSpace(lines.length * lineHeight);
    doc.text(lines, marginL, y);
    y += lines.length * lineHeight;
  }

  // ── Title ──
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Antrag nach KCanG', marginL, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Erstellt am ' + new Date().toLocaleDateString('de-DE') + ' · CSC Studio Pro',
    marginL,
    y,
  );
  y += 10;

  // ── Sektion A ──
  header('A. Vereinsdaten');
  field('Vereinsname', v.name);
  field('Adresse', v.adresse);
  field('Mitgliederzahl', String(v.mitgliederzahl));
  field('Präventionsbeauftragter', v.praeventionsbeauftragter.name);
  field('Schulungsnachweis', v.praeventionsbeauftragter.schulungsnachweis);
  y += 4;

  // ── Sektion B ──
  header('B. Räume');
  if (app.raeume.length === 0) {
    text('Keine Räume erfasst.');
  } else {
    for (const r of app.raeume) {
      ensureSpace(lineHeight);
      doc.text('· ' + r.name + ' (' + r.typ + ', ' + r.flaeche_m2 + ' m²)', marginL, y);
      y += lineHeight;
    }
  }
  y += 4;

  // ── Sektion C ──
  header('C. Compliance-Status');
  const cs = app.compliance.status;
  const passedCount = Object.values(cs).filter((v2) => v2 === 'passed').length;
  const failedCount = Object.values(cs).filter((v2) => v2 === 'failed').length;
  field('Geprüfte Regeln', String(Object.keys(cs).length));
  field('Bestanden', String(passedCount));
  field('Nicht bestanden', String(failedCount));
  if (app.compliance.notizen) {
    y += 2;
    text('Notizen: ' + app.compliance.notizen);
  }
  y += 4;

  // ── Sektion D ──
  header('D. Hygienekonzept');
  const h = app.hygienekonzept;
  checkbox('Händewaschmöglichkeit', h.haendewaschen);
  checkbox('Flächendesinfektion', h.desinfektion);
  checkbox('Schädlingsbekämpfungs-Konzept', h.schaedlingsbekaempfung);
  checkbox('Abfallentsorgung dokumentiert', h.abfallentsorgung);
  checkbox('Personal geschult', h.schulung_personal);
  if (h.notizen) {
    y += 2;
    text('Notizen: ' + h.notizen);
  }
  y += 4;

  // ── Sektion E ──
  header('E. Suchtberatung');
  const s = app.suchtberatung;
  field('Kontakt-Name', s.kontakt_name);
  field('E-Mail', s.kontakt_email);
  field('Telefon', s.kontakt_telefon);
  if (s.konzept_text) {
    y += 2;
    text('Konzept: ' + s.konzept_text);
  }
  y += 4;

  // ── Sektion F ──
  header('F. Sicherheit');
  const sec = app.sicherheit;
  checkbox('Brandschutz vorhanden', sec.brandschutz.vorhanden);
  if (sec.brandschutz.notizen) text('  Notizen: ' + sec.brandschutz.notizen);
  checkbox('Notausgang gekennzeichnet', sec.notausgang.vorhanden);
  if (sec.notausgang.notizen) text('  Notizen: ' + sec.notausgang.notizen);
  checkbox('Sichtschutz § 14', sec.sichtschutz_p14.vorhanden);
  if (sec.sichtschutz_p14.notizen) text('  Notizen: ' + sec.sichtschutz_p14.notizen);
  checkbox('§ 13 POI-Distanz bestätigt', sec.poi_distanz_p13.bestaetigt);
  field('Geringste Entfernung', sec.poi_distanz_p13.entfernung_m + ' m');
  y += 4;

  // ── Sektion G ──
  if (app.notizen) {
    header('G. Notizen');
    text(app.notizen);
  }

  // ── Footer auf jeder Seite ──
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      'Seite ' + i + ' / ' + total + ' · KCanG-Antrag · ' + (v.name || 'unbenannt'),
      pageW / 2,
      pageH - 8,
      { align: 'center' },
    );
    doc.setTextColor(0);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function printWithBrowser(app: KCanGApplication): void {
  // Neues window mit print-optimiertem HTML, dann window.print().
  // Fallback wenn jsPDF nicht lädt (z.B. offline, blocked CDN, package-fail).
  const v = app.vereinsdaten;
  const h = app.hygienekonzept;
  const s = app.suchtberatung;
  const sec = app.sicherheit;
  const win = window.open('', '_blank', 'width=800,height=1000');
  if (!win) return;
  const html =
    '<!doctype html><html><head><meta charset="utf-8"><title>KCanG-Antrag</title>' +
    '<style>body{font-family:Arial,sans-serif;font-size:12px;max-width:780px;margin:30px auto;padding:0 30px}h1{font-size:18px}h2{font-size:14px;border-bottom:1px solid #888;padding-bottom:4px;margin-top:20px}dl{display:grid;grid-template-columns:200px 1fr;gap:4px 8px}dt{font-weight:bold}@media print{body{margin:0;padding:0 15mm}}</style>' +
    '</head><body>' +
    '<h1>Antrag nach KCanG</h1>' +
    '<p style="color:#666">Erstellt am ' +
    escapeHtml(new Date().toLocaleDateString('de-DE')) +
    ' · CSC Studio Pro</p>' +
    '<h2>A. Vereinsdaten</h2><dl>' +
    '<dt>Vereinsname</dt><dd>' + escapeHtml(v.name || '—') + '</dd>' +
    '<dt>Adresse</dt><dd>' + escapeHtml(v.adresse || '—') + '</dd>' +
    '<dt>Mitgliederzahl</dt><dd>' + v.mitgliederzahl + '</dd>' +
    '<dt>Präventionsbeauftragter</dt><dd>' + escapeHtml(v.praeventionsbeauftragter.name || '—') + '</dd>' +
    '<dt>Schulungsnachweis</dt><dd>' + escapeHtml(v.praeventionsbeauftragter.schulungsnachweis || '—') + '</dd>' +
    '</dl>' +
    '<h2>B. Räume</h2>' +
    (app.raeume.length === 0
      ? '<p><i>Keine Räume erfasst.</i></p>'
      : '<ul>' +
        app.raeume
          .map((r) => '<li>' + escapeHtml(r.name) + ' (' + escapeHtml(r.typ) + ', ' + r.flaeche_m2 + ' m²)</li>')
          .join('') +
        '</ul>') +
    '<h2>D. Hygienekonzept</h2><ul>' +
    (h.haendewaschen ? '<li>✓ Händewaschmöglichkeit</li>' : '') +
    (h.desinfektion ? '<li>✓ Flächendesinfektion</li>' : '') +
    (h.schaedlingsbekaempfung ? '<li>✓ Schädlingsbekämpfung</li>' : '') +
    (h.abfallentsorgung ? '<li>✓ Abfallentsorgung</li>' : '') +
    (h.schulung_personal ? '<li>✓ Personal geschult</li>' : '') +
    '</ul>' +
    (h.notizen ? '<p><i>Notizen:</i> ' + escapeHtml(h.notizen) + '</p>' : '') +
    '<h2>E. Suchtberatung</h2><dl>' +
    '<dt>Kontakt-Name</dt><dd>' + escapeHtml(s.kontakt_name || '—') + '</dd>' +
    '<dt>E-Mail</dt><dd>' + escapeHtml(s.kontakt_email || '—') + '</dd>' +
    '<dt>Telefon</dt><dd>' + escapeHtml(s.kontakt_telefon || '—') + '</dd>' +
    '</dl>' +
    (s.konzept_text ? '<p><i>Konzept:</i> ' + escapeHtml(s.konzept_text) + '</p>' : '') +
    '<h2>F. Sicherheit</h2><ul>' +
    '<li>' + (sec.brandschutz.vorhanden ? '✓' : '✗') + ' Brandschutz</li>' +
    '<li>' + (sec.notausgang.vorhanden ? '✓' : '✗') + ' Notausgang</li>' +
    '<li>' + (sec.sichtschutz_p14.vorhanden ? '✓' : '✗') + ' Sichtschutz § 14</li>' +
    '<li>' + (sec.poi_distanz_p13.bestaetigt ? '✓' : '✗') + ' § 13 POI-Distanz (' + sec.poi_distanz_p13.entfernung_m + ' m)</li>' +
    '</ul>' +
    (app.notizen ? '<h2>G. Notizen</h2><p>' + escapeHtml(app.notizen).replace(/\n/g, '<br>') + '</p>' : '') +
    '<script>window.onload=function(){window.print()}</' + 'script>' +
    '</body></html>';
  win.document.write(html);
  win.document.close();
}
