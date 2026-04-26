/**
 * PDF-Page-Selector (Mega-Sammel Schritt 6 / Zusatzfunktion).
 *
 * Bei PDF-Upload mit mehreren Seiten: Dialog mit Auswahl welche Seiten
 * importiert werden sollen. Bisher (vor Schritt 6): hardcoded import
 * von Seite 1..min(numPages, 10) ohne User-Auswahl.
 *
 * API:
 *   const indices = await promptForPages(numPages, { autoSelectThreshold: 1 });
 *   // indices: 1-basierte Page-Numbers, [] wenn User abbricht.
 *
 * Modal wird programmatisch erzeugt (kein neuer HTML-Block in
 * index.html nötig).
 */

const MODAL_ID = 'm-pdf-page-selector';

export interface PromptForPagesOptions {
  /** Bei numPages <= threshold: keine Dialog-Anzeige, alle Seiten zurück.
   *  Default: 1 (immer Dialog wenn >1 Seite). */
  autoSelectThreshold?: number;
  /** Hard-Limit für Auswahl. Default: 10 (analog zur alten hardcoded-Grenze). */
  maxSelectablePages?: number;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Zeigt Dialog mit Page-Range-Input. Returnt Promise<number[]> mit
 * 1-basierten Page-Numbers. Empty array bei Cancel.
 */
export function promptForPages(
  numPages: number,
  options: PromptForPagesOptions = {},
): Promise<number[]> {
  const threshold = options.autoSelectThreshold ?? 1;
  const max = options.maxSelectablePages ?? 10;
  if (numPages <= threshold) {
    // Auto-Pfad: alle Seiten zurück.
    return Promise.resolve(Array.from({ length: Math.min(numPages, max) }, (_, i) => i + 1));
  }
  return new Promise<number[]>((resolve) => {
    closeSelector(); // Idempotent
    const overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.className = 'mdl-overlay';
    overlay.style.cssText =
      'display:flex;align-items:center;justify-content:center;' +
      'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.55)';
    overlay.innerHTML =
      '<div class="mdl-dialog" style="max-width:480px;padding:24px;background:var(--bg);border:1px solid var(--bd);border-radius:8px">' +
      '<h2 style="margin:0 0 6px;font-size:16px">📄 PDF mit ' +
      numPages +
      ' Seiten</h2>' +
      '<div style="color:var(--tx2);font-size:12px;line-height:1.5;margin-bottom:14px">' +
      'Welche Seiten sollen importiert werden? ' +
      (numPages > max ? '(Hard-Limit: ' + max + ' Seiten gleichzeitig.)' : '') +
      '</div>' +
      '<label style="display:block;margin-bottom:8px;font-size:11px">' +
      '<div style="color:var(--tx2);margin-bottom:2px">Seiten-Auswahl (z.B. „1-3" oder „1,3,5" oder „alle")</div>' +
      '<input id="pps-range" type="text" value="alle" style="width:100%;padding:8px;background:var(--bg2);border:1px solid var(--bd);border-radius:4px;color:var(--tx)">' +
      '</label>' +
      '<div id="pps-error" style="color:var(--rd, #ef4444);font-size:11px;min-height:14px;margin-bottom:8px"></div>' +
      '<div style="display:flex;gap:6px">' +
      '<button id="pps-cancel" class="mdl-btn" style="flex:1">Abbrechen</button>' +
      '<button id="pps-ok" class="mdl-btn mdl-btn--primary" style="flex:1">Importieren</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    const input = overlay.querySelector<HTMLInputElement>('#pps-range');
    const errEl = overlay.querySelector<HTMLDivElement>('#pps-error');
    const okBtn = overlay.querySelector<HTMLButtonElement>('#pps-ok');
    const cancelBtn = overlay.querySelector<HTMLButtonElement>('#pps-cancel');
    if (input) input.focus();

    const cleanup = (): void => {
      closeSelector();
      document.removeEventListener('keydown', escHandler);
    };
    const escHandler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        cleanup();
        resolve([]);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        okBtn?.click();
      }
    };
    document.addEventListener('keydown', escHandler);

    if (cancelBtn) {
      cancelBtn.onclick = () => {
        cleanup();
        resolve([]);
      };
    }
    if (okBtn) {
      okBtn.onclick = () => {
        const raw = input?.value ?? '';
        const result = parseRange(raw, numPages);
        if ('error' in result) {
          if (errEl) errEl.textContent = escapeHtml(result.error);
          return;
        }
        if (result.pages.length === 0) {
          if (errEl) errEl.textContent = 'Mindestens eine Seite auswählen';
          return;
        }
        const limited = result.pages.slice(0, max);
        cleanup();
        resolve(limited);
      };
    }
  });
}

export function closeSelector(): void {
  const el = document.getElementById(MODAL_ID);
  if (el) el.remove();
}

/**
 * Parst „alle" / „1-3" / „1,3,5" / „1-3,7" zu sortierter, deduped Page-Liste.
 * Returnt {pages: number[]} oder {error: string}.
 */
export function parseRange(
  raw: string,
  numPages: number,
): { pages: number[] } | { error: string } {
  const trimmed = (raw || '').trim().toLowerCase();
  if (trimmed === '' || trimmed === 'alle' || trimmed === 'all' || trimmed === '*') {
    return { pages: Array.from({ length: numPages }, (_, i) => i + 1) };
  }
  const parts = trimmed.split(',').map((p) => p.trim()).filter((p) => p.length > 0);
  const set = new Set<number>();
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map((s) => Number(s.trim()));
      if (!Number.isInteger(a) || !Number.isInteger(b) || a == null || b == null) {
        return { error: 'Ungültiges Range-Format: "' + part + '"' };
      }
      if (a < 1 || b < 1 || a > numPages || b > numPages) {
        return { error: 'Seite ' + part + ' außerhalb 1..' + numPages };
      }
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      for (let i = lo; i <= hi; i++) set.add(i);
    } else {
      const n = Number(part);
      if (!Number.isInteger(n)) {
        return { error: 'Ungültige Seitenzahl: "' + part + '"' };
      }
      if (n < 1 || n > numPages) {
        return { error: 'Seite ' + n + ' außerhalb 1..' + numPages };
      }
      set.add(n);
    }
  }
  return { pages: Array.from(set).sort((a, b) => a - b) };
}
