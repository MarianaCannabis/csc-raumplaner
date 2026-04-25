/**
 * P17.10 — Export-Family (CSV + PDF) extrahiert aus
 * index.html:10837 + 11265 + 21071.
 *
 * Section A — PDF-Export: rendert ein SVG des aktuellen Floors in ein
 *   neues Window mit Print-Button. window.print() steuert der User.
 * Section B — Furniture-CSV: zwei-Tabellen-CSV (Detail + Aggregiert),
 *   UTF-8 BOM für Excel.
 * Section C — Budget-CSV: Anzahl/Objekt/Preis/Gesamt-Tabelle.
 *
 * Pure DOM + Math, keine async-Pfade. Closure-Wrap in main.ts liefert
 * die Legacy-Globals (objects/rooms/projName/findItem/getObjPrice/...).
 */

import type { CompletedRoom, SceneObject } from './types.js';

// ── Shared types ─────────────────────────────────────────────────────

/** Subset von Catalog-Item das die Exports brauchen. */
export interface CatalogItemView {
  cat?: string;
  name?: string;
  icon?: string;
  w?: number;
  d?: number;
  h?: number;
}

export interface ExportDeps {
  objects: SceneObject[];
  rooms: CompletedRoom[];
  projName: string;
  curFloor: string;
  findItem: (typeId: string) => CatalogItemView | null | undefined;
  getObjPrice: (typeId: string) => number;
  toast: (msg: string, type?: string) => void;
}

// ── Section A: PDF (HTML→print) ──────────────────────────────────────

export function exportPDF(deps: ExportDeps): void {
  const floorRooms = deps.rooms.filter((r) => (r.floorId || 'eg') === deps.curFloor);
  // Type-narrowing für SceneObject — `floorId`/`x`/`y`/`w`/`d`/`rot` sind
  // alle optional in der Minimal-Type-Definition. Wir greifen mit
  // any-cast zu, weil Legacy-Code 1:1 portiert wird.
  const floorObjs = deps.objects.filter(
    (o) => ((o as { floorId?: string }).floorId || 'eg') === deps.curFloor,
  );
  if (!floorRooms.length) {
    deps.toast('Keine Räume zum Drucken', 'r');
    return;
  }
  const scale = 40;
  const pad = 1.5;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  floorRooms.forEach((r) => {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.w);
    maxY = Math.max(maxY, r.y + r.d);
  });
  const W = Math.ceil((maxX - minX + pad * 2) * scale);
  const H = Math.ceil((maxY - minY + pad * 2) * scale);
  let svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" style="background:#f5f5f0;border:1px solid #ccc;max-width:100%">';
  svg +=
    '<defs><pattern id="g" width="' +
    scale +
    '" height="' +
    scale +
    '" patternUnits="userSpaceOnUse"><path d="M ' +
    scale +
    ' 0 L 0 0 0 ' +
    scale +
    '" fill="none" stroke="#ddd" stroke-width="0.5"/></pattern></defs>';
  svg += '<rect width="100%" height="100%" fill="url(#g)"/>';
  floorRooms.forEach((r) => {
    const x = (r.x - minX + pad) * scale;
    const y = (r.y - minY + pad) * scale;
    const rw = r.w * scale;
    const rd = r.d * scale;
    const cVal = (r as { col?: number }).col;
    const col =
      typeof cVal === 'number' ? '#' + (cVal >>> 0).toString(16).padStart(6, '0') : '#2d6a2d';
    svg +=
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      rw +
      '" height="' +
      rd +
      '" fill="' +
      col +
      '22" stroke="' +
      col +
      '" stroke-width="2" rx="2"/>';
    svg +=
      '<text x="' +
      (x + rw / 2) +
      '" y="' +
      (y + rd / 2 - 6) +
      '" text-anchor="middle" font-size="13" font-weight="bold" fill="' +
      col +
      '">' +
      (r.name ?? '') +
      '</text>';
    svg +=
      '<text x="' +
      (x + rw / 2) +
      '" y="' +
      (y + rd / 2 + 10) +
      '" text-anchor="middle" font-size="10" fill="#555">' +
      r.w.toFixed(1) +
      '×' +
      r.d.toFixed(1) +
      'm</text>';
    svg +=
      '<text x="' +
      (x + rw / 2) +
      '" y="' +
      (y - 5) +
      '" text-anchor="middle" font-size="9" fill="#336633">' +
      r.w.toFixed(2) +
      'm</text>';
  });
  floorObjs.forEach((o) => {
    const item = deps.findItem(o.typeId);
    if (!item) return;
    const oo = o as { x?: number; y?: number; w?: number; d?: number; rot?: number };
    const x = ((oo.x ?? 0) - minX + pad - (oo.w ?? 1) / 2) * scale;
    const y = ((oo.y ?? 0) - minY + pad - (oo.d ?? 1) / 2) * scale;
    const ow = (oo.w ?? 1) * scale;
    const od = (oo.d ?? 1) * scale;
    svg +=
      '<g transform="translate(' +
      (x + ow / 2) +
      ',' +
      (y + od / 2) +
      ') rotate(' +
      (oo.rot || 0) +
      ')">' +
      '<rect x="' +
      -ow / 2 +
      '" y="' +
      -od / 2 +
      '" width="' +
      ow +
      '" height="' +
      od +
      '" fill="#4a7a0040" stroke="#4a7a00" stroke-width="1" rx="1"/>' +
      '<text x="0" y="4" text-anchor="middle" font-size="' +
      (ow < 20 ? 6 : 10) +
      '">' +
      (item.icon ?? '') +
      '</text>' +
      '</g>';
  });
  svg += '</svg>';
  const d = new Date().toLocaleDateString('de-DE');
  const team = localStorage.getItem('csc-teamid') || '';
  const author = localStorage.getItem('csc-username') || '';
  const printWin = window.open('', '_blank');
  if (!printWin) {
    deps.toast('Pop-up blockiert — Print-Fenster nicht geöffnet', 'r');
    return;
  }
  printWin.document.write(
    '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' +
      deps.projName +
      '</title>' +
      '<style>@page{size:A4 landscape;margin:10mm}body{margin:0;padding:10px;font-family:sans-serif}' +
      '.hdr{display:flex;justify-content:space-between;border-bottom:2px solid #14532d;padding-bottom:6px;margin-bottom:8px}' +
      '.title{font-size:18px;font-weight:bold;color:#14532d}.meta{font-size:10px;color:#666;text-align:right}' +
      '@media print{button{display:none}}</style></head><body>' +
      '<div class="hdr"><div><div class="title">📐 ' +
      deps.projName +
      '</div>' +
      (team ? '<div style="font-size:11px;color:#336633">Team: ' + team + '</div>' : '') +
      '</div><div class="meta">' +
      (author ? 'Erstellt von: ' + author + '<br>' : '') +
      'Datum: ' +
      d +
      '<br>Etage: ' +
      deps.curFloor.toUpperCase() +
      '<br>Räume: ' +
      floorRooms.length +
      ' · Objekte: ' +
      floorObjs.length +
      '</div></div>' +
      svg +
      '<div style="margin-top:12px;text-align:center">' +
      '<button onclick="window.print()" style="padding:8px 24px;background:#14532d;color:#fff;border:none;border-radius:5px;cursor:pointer;font-size:13px">🖨️ PDF drucken / speichern</button>' +
      ' <button onclick="window.close()" style="padding:8px 16px;margin-left:6px;background:#444;color:#fff;border:none;border-radius:5px;cursor:pointer">✕ Schließen</button>' +
      '</div></body></html>',
  );
  printWin.document.close();
}

// ── Section B: Furniture-CSV ─────────────────────────────────────────

export function exportFurnitureCSV(deps: ExportDeps): void {
  const detailHeader =
    '\uFEFFKategorie,Artikel,typeId,Breite(m),Tiefe(m),Höhe(m),X(m),Y(m),Rotation(°),Etage,Preis(€)';
  const detailRows: string[] = [detailHeader];
  deps.objects.forEach((o) => {
    const it = deps.findItem(o.typeId) || {};
    const oo = o as {
      w?: number;
      d?: number;
      h?: number;
      x?: number;
      y?: number;
      rot?: number;
      floorId?: string;
    };
    detailRows.push(
      [
        '"' + (it.cat || '').replace(/"/g, '') + '"',
        '"' + (it.name || o.typeId).replace(/"/g, '') + '"',
        '"' + o.typeId + '"',
        (oo.w || it.w || 1).toFixed(2),
        (oo.d || it.d || 1).toFixed(2),
        (oo.h || it.h || 1).toFixed(2),
        (oo.x || 0).toFixed(2),
        (oo.y || 0).toFixed(2),
        (oo.rot || 0).toString(),
        '"' + (oo.floorId || 'eg') + '"',
        String(deps.getObjPrice(o.typeId)),
      ].join(','),
    );
  });
  const total = deps.objects.reduce((s, o) => s + deps.getObjPrice(o.typeId), 0);
  detailRows.push(['', 'Gesamt:', '', '', '', '', '', '', '', '', String(total)].join(','));

  const aggHeader =
    '\nKategorie,Artikel,typeId,Stück,Breite(m),Tiefe(m),Höhe(m),Volumen(m³),Preis-total(€)';
  const byType = new Map<string, { count: number; sample: SceneObject }>();
  deps.objects.forEach((o) => {
    const entry = byType.get(o.typeId) || { count: 0, sample: o };
    entry.count++;
    byType.set(o.typeId, entry);
  });
  const aggRows: string[] = [aggHeader];
  for (const [tid, { count, sample }] of byType) {
    const it = deps.findItem(tid) || {};
    const ss = sample as { w?: number; d?: number; h?: number };
    const w = ss.w || it.w || 1;
    const d = ss.d || it.d || 1;
    const h = ss.h || it.h || 1;
    const vol = (w * d * h * count).toFixed(3);
    aggRows.push(
      [
        '"' + (it.cat || '').replace(/"/g, '') + '"',
        '"' + (it.name || tid).replace(/"/g, '') + '"',
        '"' + tid + '"',
        String(count),
        w.toFixed(2),
        d.toFixed(2),
        h.toFixed(2),
        vol,
        (deps.getObjPrice(tid) * count).toFixed(0),
      ].join(','),
    );
  }

  const csv =
    detailRows.join('\n') + '\n\n# AGGREGIERT (für Lieferanten)' + aggRows.join('\n') + '\n';
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: deps.projName.replace(/[^a-z0-9]/gi, '_') + '_moebel.csv',
  });
  a.click();
  deps.toast('📊 Möbelliste exportiert (Detail + Aggregiert)', 'g');
}

// ── Section C: Budget-CSV ────────────────────────────────────────────

export function exportBudgetCSV(deps: ExportDeps): void {
  const rows: string[] = ['Anzahl,Objekt,Einzelpreis,Gesamt'];
  const items: Record<string, { name: string; count: number; price: number }> = {};
  deps.objects.forEach((o) => {
    const it = deps.findItem(o.typeId) || {};
    const price = deps.getObjPrice(o.typeId);
    if (!items[o.typeId]) items[o.typeId] = { name: it.name || o.typeId, count: 0, price };
    items[o.typeId]!.count++;
  });
  let total = 0;
  Object.values(items)
    .sort((a, b) => b.count - a.count)
    .forEach((i) => {
      const sub = i.count * i.price;
      total += sub;
      rows.push([String(i.count), '"' + i.name + '"', String(i.price), String(sub)].join(','));
    });
  rows.push(['', 'GESAMT', '', String(total)].join(','));
  const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'csc_budget.csv',
  });
  a.click();
  deps.toast('📥 Budget als CSV exportiert', 'g');
}
