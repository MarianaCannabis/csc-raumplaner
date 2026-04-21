// P11.1 — Planning-Mode-Switcher (Raumplanung vs. Veranstaltungs-Planung).
//
// Zwei Arbeits-Modi für den CSC-Raumplaner. Der Mode beeinflusst:
// - welche Sidebar-Tabs sichtbar sind
// - welche Katalog-Items (CSC- vs. Event-Items)
// - welche Compliance-Regeln aktiv sind (21 KCanG vs. ~4 Event-Rules)
// - welche Export-Buttons in der Topbar stehen
//
// Persistenz: localStorage.csc-planning-mode. Default 'room'.
// Tagging: Elemente bekommen `data-mode="room"` oder `data-mode="event"`;
// Items ohne Attribut sind in BEIDEN Modi sichtbar (universal).
// CSS-Magie (in index.html):
//   body[data-planning-mode="room"]  [data-mode="event"] { display:none }
//   body[data-planning-mode="event"] [data-mode="room"]  { display:none }
//
// Funktions-Erhalt-Garantie: Mode blendet aus, löscht nichts. Über
// Command-Palette (Ctrl+K) + Profi-UI-Mode (P10.5) bleiben alle Features
// erreichbar, egal welcher Planning-Mode aktiv ist.

export type PlanningMode = 'room' | 'event';

const STORAGE_KEY = 'csc-planning-mode';
const EVENT_NAME = 'csc-mode-change';

export function currentMode(): PlanningMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'event' ? 'event' : 'room';
  } catch {
    return 'room';
  }
}

export function setMode(m: PlanningMode): void {
  try { localStorage.setItem(STORAGE_KEY, m); } catch {}
  if (typeof document !== 'undefined') {
    document.body.dataset.planningMode = m;
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: m }));
  }
}

export function onModeChange(cb: (m: PlanningMode) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<PlanningMode>).detail);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

/**
 * Rules may optionally declare which modes they apply to. A rule with
 * modes === undefined runs in both modes (backwards-compatible default).
 */
export function isRuleActive(ruleModes: PlanningMode[] | undefined, active: PlanningMode = currentMode()): boolean {
  if (!ruleModes || ruleModes.length === 0) return true;
  return ruleModes.includes(active);
}

// Bootstrap: apply persisted mode to body on import.
if (typeof document !== 'undefined') {
  document.body.dataset.planningMode = currentMode();
}
