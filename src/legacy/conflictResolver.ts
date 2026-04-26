/**
 * Konflikt-Modal für Cloud-Save (Pfad-D).
 *
 * Zeigt den parallelen Save-Konflikt visuell auf:
 *   - Server-Thumbnail + lokales Thumbnail nebeneinander
 *   - Diff-Counter (rooms/objects/walls/measures)
 *   - 3 Aktionen: Verwerfen / Übernehmen / Schließen
 *
 * Modal wird programmatisch gerendert (kein neuer HTML-Block in
 * index.html nötig). CSS-Klassen aus dem Topbar/Modal-System
 * (`.mdl-overlay`, `.mdl-btn`, `.mdl-btn--primary`) wiederverwendet.
 *
 * State-Machine im Wrapper (index.html `_cloudSaveImpl`):
 *   conflict → User wählt:
 *     - Verwerfen: onDiscardLocal(serverData) → loadPD(server) + ack
 *     - Übernehmen: onForceOverwrite(server.version+1) → save mit forced version
 *     - Schließen (X / ESC / onCancel): nichts ändern, lokale Änderungen bleiben
 *       gepuffert, User kann es später nochmal versuchen.
 */

import type { ConflictDetected } from '../persist/cloudProjects.js';

export interface ConflictResolverDeps {
  /** Wird gerufen wenn User „Verwerfen" wählt. Caller lädt Server-Stand und loadPD(). */
  onDiscardLocal: (serverData: unknown) => void;
  /** Wird gerufen wenn User „Übernehmen" wählt. Caller wiederholt Save mit Force-Version. */
  onForceOverwrite: (newVersion: number) => void;
  /** Optional: Modal-Schließen ohne Aktion (X-Button oder ESC). */
  onCancel?: () => void;
}

const MODAL_ID = 'm-cloud-conflict';

/** Type-narrowing safe-array-getter — null/undefined/non-array werden zu []. */
function safeArr(x: unknown, key: string): unknown[] {
  if (!x || typeof x !== 'object') return [];
  const v = (x as Record<string, unknown>)[key];
  return Array.isArray(v) ? v : [];
}

/**
 * Berechnet Diff zwischen lokal und server. Negative Zahl = Server hat mehr.
 * Null/undefined/non-array werden als 0 gezählt.
 */
export function computeDiff(
  local: unknown,
  server: unknown,
): { rooms: number; objects: number; walls: number; measures: number } {
  return {
    rooms: safeArr(local, 'rooms').length - safeArr(server, 'rooms').length,
    objects: safeArr(local, 'objects').length - safeArr(server, 'objects').length,
    walls: safeArr(local, 'walls').length - safeArr(server, 'walls').length,
    measures: safeArr(local, 'measures').length - safeArr(server, 'measures').length,
  };
}

/** Format-Helper: -3 → "-3", +5 → "+5", 0 → "0". */
function fmtDiff(n: number): string {
  if (n > 0) return '+' + n;
  return String(n);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtTime(ts: string): string {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return d.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
}

/**
 * Render und show das Konflikt-Modal. Idempotent: doppelter Aufruf
 * schließt das alte Modal und re-rendert mit den neuen Daten.
 */
export function showConflictModal(
  conflict: ConflictDetected,
  deps: ConflictResolverDeps,
): void {
  // Existing-Modal entfernen, damit kein State-Leak.
  closeConflictModal();

  const overlay = document.createElement('div');
  overlay.id = MODAL_ID;
  overlay.className = 'mdl-overlay';
  // Modal sichtbar — passt zur Konvention der existierenden Modals,
  // die mit display:flex via .mdl-overlay.open arbeiten. Hier inline,
  // damit kein zusätzliches Class-Toggle aus dem Caller nötig ist.
  overlay.style.cssText =
    'display:flex;align-items:center;justify-content:center;' +
    'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55)';

  const diff = computeDiff(conflict.localData, conflict.serverData);
  const diffParts: string[] = [];
  if (diff.rooms !== 0) diffParts.push(fmtDiff(diff.rooms) + ' Räume');
  if (diff.objects !== 0) diffParts.push(fmtDiff(diff.objects) + ' Objekte');
  if (diff.walls !== 0) diffParts.push(fmtDiff(diff.walls) + ' Wände');
  if (diff.measures !== 0) diffParts.push(fmtDiff(diff.measures) + ' Maße');
  const diffSummary = diffParts.length > 0 ? diffParts.join(' · ') : 'identische Struktur';

  const serverThumb = conflict.serverThumbnail || '';
  // Lokales Thumbnail: aus localData.thumbnail wenn vorhanden, sonst leer.
  const localData = conflict.localData as { thumbnail?: string } | null;
  const localThumb =
    localData && typeof localData.thumbnail === 'string' ? localData.thumbnail : '';

  overlay.innerHTML =
    '<div class="mdl-dialog" style="max-width:560px;padding:24px;background:var(--bg);border:1px solid var(--bd);border-radius:8px">' +
    '<h2 style="margin:0 0 6px;font-size:16px">⚠️ Konflikt — paralleler Save erkannt</h2>' +
    '<div style="color:var(--tx2);font-size:11px;line-height:1.5;margin-bottom:14px">' +
    'Jemand anderes hat parallel gespeichert. Bitte wähle wie es weitergeht.' +
    '</div>' +
    // ── Thumbnail-Vergleich ──
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
    '<div>' +
    '<div style="font-size:11px;color:var(--tx2);margin-bottom:4px">☁️ Server-Stand · v' +
    conflict.serverVersion +
    '</div>' +
    (serverThumb
      ? '<img id="otc-thumb-server" src="' +
        escapeHtml(serverThumb) +
        '" style="width:100%;height:120px;object-fit:cover;border:1px solid var(--bd);border-radius:4px" alt="Server-Stand">'
      : '<div style="height:120px;background:var(--bg2);border:1px dashed var(--bd);border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--tx3);font-size:11px">kein Thumbnail</div>') +
    '<div style="font-size:10px;color:var(--tx3);margin-top:4px">' +
    fmtTime(conflict.serverUpdatedAt) +
    (conflict.serverAuthor ? ' · ' + escapeHtml(conflict.serverAuthor) : '') +
    '</div>' +
    '</div>' +
    '<div>' +
    '<div style="font-size:11px;color:var(--tx2);margin-bottom:4px">📝 Dein Stand · v' +
    conflict.localVersion +
    '</div>' +
    (localThumb
      ? '<img id="otc-thumb-local" src="' +
        escapeHtml(localThumb) +
        '" style="width:100%;height:120px;object-fit:cover;border:1px solid var(--bd);border-radius:4px" alt="Dein Stand">'
      : '<div style="height:120px;background:var(--bg2);border:1px dashed var(--bd);border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--tx3);font-size:11px">kein Thumbnail</div>') +
    '<div style="font-size:10px;color:var(--tx3);margin-top:4px">jetzt</div>' +
    '</div>' +
    '</div>' +
    // ── Diff-Counter ──
    '<div id="otc-diff" style="font-size:12px;color:var(--tx);margin-bottom:14px;padding:8px 12px;background:var(--bg2);border-radius:4px">' +
    '<b>Unterschied:</b> ' +
    escapeHtml(diffSummary) +
    '</div>' +
    // ── Aktionen ──
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">' +
    '<button id="otc-discard" class="mdl-btn">⬅ Server-Stand übernehmen</button>' +
    '<button id="otc-cancel" class="mdl-btn">Abbrechen</button>' +
    '<button id="otc-force" class="mdl-btn mdl-btn--primary">➡ Mein Stand erzwingen</button>' +
    '</div>' +
    '<div style="font-size:10px;color:var(--tx3);margin-top:8px;line-height:1.4">' +
    '<b>Übernehmen</b>: lokale Änderungen werden verworfen. ' +
    '<b>Erzwingen</b>: dein Stand überschreibt den Server (Server-Änderungen weg).' +
    '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  const btnDiscard = overlay.querySelector('#otc-discard') as HTMLButtonElement | null;
  const btnForce = overlay.querySelector('#otc-force') as HTMLButtonElement | null;
  const btnCancel = overlay.querySelector('#otc-cancel') as HTMLButtonElement | null;

  if (btnDiscard) {
    btnDiscard.onclick = () => {
      closeConflictModal();
      deps.onDiscardLocal(conflict.serverData);
    };
  }
  if (btnForce) {
    btnForce.onclick = () => {
      closeConflictModal();
      deps.onForceOverwrite(conflict.serverVersion);
    };
  }
  if (btnCancel) {
    btnCancel.onclick = () => {
      closeConflictModal();
      if (deps.onCancel) deps.onCancel();
    };
  }

  // ESC-Handler — analog zu Cancel-Button.
  const escHandler = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escHandler);
      closeConflictModal();
      if (deps.onCancel) deps.onCancel();
    }
  };
  document.addEventListener('keydown', escHandler);
}

/** Schließt das Konflikt-Modal falls offen. Idempotent — keine Fehler bei doppeltem Aufruf. */
export function closeConflictModal(): void {
  const el = document.getElementById(MODAL_ID);
  if (el) el.remove();
}
