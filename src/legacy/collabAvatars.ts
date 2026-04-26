/**
 * Collab-Avatar-Helpers (Mega-Sammel Schritt 5 / Bedienkonzept H1).
 *
 * Verbesserungen gegenüber v1:
 * - Konsistente Cursor-Farbe pro User: hash-basiert aus userId/email,
 *   sodass derselbe User immer dieselbe Farbe sieht (auch nach Reconnect).
 * - Live-Names: formatierter Tooltip mit Email + last-action-Zeit.
 * - Cursor-Glow-Class-Helper: CSS-Animation 500ms beim Klick/Action.
 */

const PALETTE = [
  '#ef4444', // rot
  '#f59e0b', // orange
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blau
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#a855f7', // purple
  '#14b8a6', // teal
  '#eab308', // yellow
] as const;

/**
 * Deterministischer Hash → Farbe-Index. Gleicher Input → gleiche Farbe.
 * 32-bit-Integer-Hash via fold-Cycle (klassische Bit-Schift). Negative
 * Werte via Math.abs gemittelt. Output: 1 von 12 PALETTE-Farben.
 */
export function colorForUser(userId: string | null | undefined): string {
  if (!userId) return '#888888';
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]!;
}

/**
 * Format-Helper für „last action" — Differenz in Sekunden zu jetzt.
 * <60s → "vor X Sek."; <3600s → "vor X Min."; sonst Datum.
 */
export function formatLastAction(timestampMs: number | null | undefined, nowMs?: number): string {
  if (!timestampMs || typeof timestampMs !== 'number') return '—';
  const now = nowMs ?? Date.now();
  const deltaMs = now - timestampMs;
  if (deltaMs < 0) return 'gerade';
  const sec = Math.floor(deltaMs / 1000);
  if (sec < 60) return 'vor ' + sec + ' Sek.';
  const min = Math.floor(sec / 60);
  if (min < 60) return 'vor ' + min + ' Min.';
  // Älter als 1h → ISO-Zeit (Format hh:mm)
  try {
    const d = new Date(timestampMs);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

/**
 * Tooltip-HTML für ein Avatar — Email + last-Action-Zeit.
 * Escaped User-Input (XSS-Hardening: User-Email kommt aus DB).
 */
export function avatarTooltipHtml(
  email: string | null | undefined,
  lastActionMs: number | null | undefined,
): string {
  const safe = (s: unknown): string =>
    String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  const name = safe(email || 'Unbekannt');
  const time = formatLastAction(lastActionMs);
  return name + (time !== '—' ? ' · ' + time : '');
}

/**
 * Triggert eine kurze Cursor-Glow-Animation (CSS-Klasse 'cursor-glow').
 * Auto-Removal nach 500ms. Idempotent — doppelter Aufruf retriggert die
 * Animation indem die Klasse force-toggled wird (offscreen-reflow nötig).
 */
export function pulseCursorGlow(el: HTMLElement | null | undefined): void {
  if (!el) return;
  el.classList.remove('cursor-glow');
  // Force reflow — sonst wird die Animation nicht neu gestartet wenn die
  // Klasse innerhalb desselben Frames remove+add wird.
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  void el.offsetWidth;
  el.classList.add('cursor-glow');
  setTimeout(() => {
    el.classList.remove('cursor-glow');
  }, 500);
}

/** Anzahl Farben in der Palette — für Tests. */
export const PALETTE_SIZE = PALETTE.length;
