/**
 * P17.5 — Cloud-Status-Bar UI-Helpers, extrahiert aus
 * index.html:7883-7911 + 7991-7995.
 *
 * Beide Functions sind reine DOM-Updaters für die Cloud-Sidebar:
 * - updateSbStatus(connected): Verbindungs-Status + Save/Load-
 *   Button-Visibility, plus .sp-status--ok/--error-Modifier auf
 *   #cloud-status-bar (BEM-Konvention aus Cluster 7d).
 * - setSbMsg(msg, type): Status-Text mit Farb-Code (g/r/b/default).
 *
 * Pure DOM — keine Legacy-Globals, keine Closures nötig.
 */

export function updateSbStatus(connected: boolean): void {
  const dot = document.getElementById('cloud-status-dot');
  const txt = document.getElementById('cloud-status-text');
  const bar = document.getElementById('cloud-status-bar');
  if (dot && txt) {
    dot.textContent = connected ? '🟢' : '🔴';
    txt.textContent = connected ? '☁️ Verbunden — Cloud aktiv' : '🔴 Nicht verbunden';
    // P15 Cluster 7d: Status-Klassen-Toggle statt inline-Style.
    if (bar) {
      bar.classList.remove('sp-status--pending', 'sp-status--ok', 'sp-status--error');
      bar.classList.add(connected ? 'sp-status--ok' : 'sp-status--error');
    }
  }
  const el = document.getElementById('sb-status');
  const saveBtn = document.getElementById('sb-save-btn');
  const loadBtn = document.getElementById('sb-load-btn');
  if (!el) return;
  if (connected) {
    el.textContent = '✓ Verbunden — Cloud-Speicher aktiv';
    el.style.color = '#4ade80';
    if (saveBtn) saveBtn.style.display = 'block';
    if (loadBtn) loadBtn.style.display = 'block';
  } else {
    el.textContent = 'Nicht verbunden';
    el.style.color = 'var(--tx3)';
    if (saveBtn) saveBtn.style.display = 'none';
    if (loadBtn) loadBtn.style.display = 'none';
  }
}

export type SbMsgType = 'r' | 'g' | 'b';

export function setSbMsg(msg: string, type?: SbMsgType): void {
  const el = document.getElementById('sb-status');
  if (!el) return;
  el.textContent = msg;
  el.style.color = type === 'r' ? '#f87171' : type === 'g' ? '#4ade80' : '#38bdf8';
}
