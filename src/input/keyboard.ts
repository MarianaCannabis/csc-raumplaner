/**
 * Globale Keyboard-Shortcuts — Pure-Function-API.
 *
 * P17.2 Teil-Extraktion: die trivial dispatchenden Shortcut-Handler aus
 * index.html werden hier zu einer einzigen, testbaren Funktion
 * zusammengeführt. Die Funktion nimmt alle Abhängigkeiten als Callbacks
 * entgegen — keine globalen `window.*`-Refs im Modul, damit die Unit-Tests
 * das ohne jsdom-Shim direkt laufen können.
 *
 * Extrahiert aus index.html:
 * - F1 / ?          → Help-Overlay + Legacy-Help-Modal (war 2× gebunden)
 * - F / V / L / D / N → View- und Tool-Toggles
 * - Ctrl+K unshifted → AI-Tab fokussieren (parallel zur Command-Palette,
 *                       die eigenen Handler in index.html behält)
 * - ArrowRight/Space/ArrowLeft/Esc im Präsentations-Mode → Slide-Navigation
 * - Esc bei offenem Help-Overlay → Overlay schließen
 *
 * Nicht extrahiert (bleibt inline in index.html, s. dortige Kommentare):
 * - Haupt-Shortcut-Router (Undo/Redo, Delete, R-Rotate, Space-Pan,
 *   Esc-Placement-Abort) — hängt an ~10 globalen State-Variables
 *   (placingCatalogId, keys{}, spaceDown, wallDrawStart, drawGroundStart,
 *   fpCv). Extraktion ohne State-Shim nicht risikoarm.
 * - Ctrl+C/V/A/S (Copy/Paste/SelectAll/SaveProj) — lebt an _clipboard,
 *   selId, objects[], curFloor, _multiSel.
 * - Tab-Walk durch Objekte (Zeile 16593) — braucht objects[]+curFloor+selId.
 * - 3D-Mode-Shortcuts (G-grab, 3D-Arrow-Positioning) — brauchen
 *   currentView und die THREE-Scene-Refs.
 * - Command-Palette Ctrl+K + _customShortcuts (Zeile 13445) — eigener
 *   Kontext, orthogonal zur AI-Fokus-Binding hier.
 */

export interface ShortcutActions {
  /** F1 / ? → öffnet das legacy "m-help"-Modal. */
  openHelpModal?: () => void;
  /** F1 / ? → öffnet zusätzlich das neuere Help-Overlay (ohne Argument). */
  openHelp?: () => void;
  /** ? → zeigt zusätzlich das #kbd-overlay Shortcut-Cheat-Sheet. */
  showKbdOverlay?: () => void;
  /** Esc → schließt das Help-Overlay, sofern gerade offen. */
  closeHelp?: () => void;
  /** Gate für Esc → closeHelp. Default: nie offen. */
  isHelpOverlayOpen?: () => boolean;
  /** Ctrl/Meta+K (ohne Shift) → AI-Sidebar zeigen und Input fokussieren. */
  focusAI?: () => void;
  /** F → Viewport auf die aktuellen Räume zoomen. */
  fitView?: () => void;
  /** V → Select-Tool aktivieren. */
  selectTool?: () => void;
  /** L → Lineal ein/aus. */
  toggleRuler?: () => void;
  /** D → Maßketten ein/aus. */
  toggleDimensions?: () => void;
  /** N → Notiz-Mode ein/aus. */
  toggleNoteMode?: () => void;
  /** Gate für Präsentations-Shortcuts. */
  isPresenting?: () => boolean;
  /** ArrowRight / Space im Präsentations-Mode. */
  presentNext?: () => void;
  /** ArrowLeft im Präsentations-Mode. */
  presentPrev?: () => void;
  /** Esc im Präsentations-Mode. */
  exitPresentation?: () => void;
}

/**
 * Registriert einen einzelnen document.keydown-Listener. Gibt eine
 * Dispose-Funktion zurück, die den Listener wieder entfernt — nützlich
 * für Tests und für Hot-Reload.
 */
export function registerGlobalShortcuts(actions: ShortcutActions): () => void {
  const handler = (e: KeyboardEvent) => {
    // Type-narrow für TS + Runtime-Check — Events, deren Target kein
    // HTMLElement ist (SVG-Child, Document-Target, etc.), ignorieren wir.
    const target = e.target;
    if (target instanceof HTMLElement && target.matches('input,textarea,select')) return;

    // ── Hilfe: F1 / ? ─────────────────────────────────────
    if (e.key === '?' || e.key === 'F1') {
      e.preventDefault();
      actions.openHelpModal?.();
      actions.openHelp?.();
      // ? zeigt zusätzlich das #kbd-overlay (Cheat-Sheet) — F1 nicht,
      // weil die beiden Overlays sonst doppelt stacken.
      if (e.key === '?') actions.showKbdOverlay?.();
      return;
    }

    // ── Präsentations-Mode hat Priorität über alle Single-Keys ─
    if (actions.isPresenting?.()) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        actions.presentNext?.();
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        actions.presentPrev?.();
        return;
      }
      if (e.key === 'Escape') {
        actions.exitPresentation?.();
        return;
      }
    }

    // ── Esc → Help-Overlay schließen (wenn offen) ─────────
    // Bewusst KEIN return — andere Esc-Handler (Placement-Cancel in
    // index.html) sollen weiter laufen, sonst verliert man die globale
    // "Alles zu"-Semantik.
    if (e.key === 'Escape' && actions.isHelpOverlayOpen?.()) {
      actions.closeHelp?.();
    }

    // ── Ctrl/Meta+K (ohne Shift) → AI-Tab fokussieren ─────
    if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !e.shiftKey) {
      // KEIN preventDefault hier — die Command-Palette (Inline-Handler
      // in index.html) verhindert den Browser-Default schon. Wir laufen
      // zusätzlich, damit die AI-Sidebar beim selben Tastendruck auch
      // fokussiert wird (historisches Verhalten von Zeile 9846).
      actions.focusAI?.();
      return;
    }

    // ── Single-Key View/Tool-Shortcuts (keine Modifier) ──
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'f' || e.key === 'F') actions.fitView?.();
    else if (e.key === 'v' || e.key === 'V') actions.selectTool?.();
    else if (e.key === 'l' || e.key === 'L') actions.toggleRuler?.();
    else if (e.key === 'd' || e.key === 'D') actions.toggleDimensions?.();
    else if (e.key === 'n') actions.toggleNoteMode?.();
  };

  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}
