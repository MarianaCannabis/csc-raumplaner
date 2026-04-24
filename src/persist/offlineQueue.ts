/**
 * Offline-Queue für deferred Cloud-Actions (Track A Phase 2b.2).
 *
 * Registry-Pattern: Module-Caller (index.html-Wrappers) registrieren
 * Handler pro Action-Type via registerHandler(). queueAction() push'd
 * auf die in-memory Queue + persistiert in localStorage (kein IDB —
 * bewusste Vereinfachung, localStorage ist für ~100 Actions mehr als
 * genug). flushQueue() ruft Handler sequenziell.
 *
 * Verwendung (im Legacy-Wrapper):
 *   registerHandler('cloud_save', async () => { await cloudSave(); });
 *   queueAction('cloud_save', {}); // wenn !navigator.onLine
 *
 * Bei 'online'-Event startet flushQueue() automatisch. Einzelne
 * Handler-Fehler leaven die Action in der Queue (attempts++) — kein
 * Data-Loss durch einzelne Netzwerk-Hiccups.
 */

export interface QueuedAction {
  type: string;
  data: unknown;
  ts: number;
  attempts: number;
}

export type ActionHandler = (data: unknown) => Promise<void>;

const STORAGE_KEY = 'csc-offline-queue';
const MAX_ATTEMPTS = 5;

let _queue: QueuedAction[] = [];
const _handlers = new Map<string, ActionHandler>();
let _flushing = false;

function _persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_queue));
  } catch {
    /* Quota / Private-Mode — best-effort */
  }
}

function _loadFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      _queue = parsed.filter(
        (a): a is QueuedAction =>
          a && typeof a.type === 'string' && typeof a.ts === 'number',
      );
    }
  } catch {
    /* defekter JSON — ignorieren, leere Queue */
  }
}

/** Registriert einen Handler für einen Action-Type. Überschreibt bestehende. */
export function registerHandler(type: string, fn: ActionHandler): void {
  _handlers.set(type, fn);
}

/** Fügt eine Action der Queue hinzu und persistiert. */
export function queueAction(type: string, data: unknown): void {
  _queue.push({ type, data, ts: Date.now(), attempts: 0 });
  _persist();
}

/** Aktuelle Queue-Größe (für UI-Badges etc.). */
export function getQueueSize(): number {
  return _queue.length;
}

/** Kopie der Queue (für Diagnostics). */
export function listQueue(): readonly QueuedAction[] {
  return _queue.slice();
}

/**
 * Processed die Queue sequenziell. Jede Action:
 * - Handler registriert + success → aus Queue entfernt
 * - Handler registriert + Fehler → attempts++, bleibt in Queue
 *   (bis MAX_ATTEMPTS — dann wird sie geloggt + verworfen)
 * - Handler NICHT registriert → bleibt in Queue (Boot-Race-Safety)
 *
 * Returns Count erfolgreich verarbeiteter Actions.
 * No-op wenn offline oder leer oder bereits flushing.
 */
export async function flushQueue(): Promise<number> {
  if (_flushing) return 0;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 0;
  if (_queue.length === 0) return 0;
  _flushing = true;
  let successCount = 0;
  const remaining: QueuedAction[] = [];
  try {
    // Snapshot der aktuellen Queue; neue Actions die währenddessen
    // kommen landen in _queue und werden beim nächsten flush abgearbeitet.
    const toProcess = _queue.slice();
    _queue = [];
    for (const action of toProcess) {
      const handler = _handlers.get(action.type);
      if (!handler) {
        // Boot-Race: Handler noch nicht registriert — behalten.
        remaining.push(action);
        continue;
      }
      try {
        await handler(action.data);
        successCount++;
      } catch (err) {
        action.attempts = (action.attempts || 0) + 1;
        if (action.attempts >= MAX_ATTEMPTS) {
          console.warn('[offlineQueue] max-attempts erreicht, verwerfe Action', action, err);
          continue;
        }
        remaining.push(action);
      }
    }
    _queue = [..._queue, ...remaining];
    _persist();
  } finally {
    _flushing = false;
  }
  return successCount;
}

/** Leert die Queue komplett (für Tests + Admin-UI). */
export function clearQueue(): void {
  _queue = [];
  _persist();
}

// ── Auto-Flush + Initial-Load ─────────────────────────────────────
// Boot: Queue aus localStorage laden. Wenn online + Handler registriert,
// läuft der erste Flush beim nächsten Event-Loop-Tick — damit die
// index.html-Wrappers noch Zeit haben, ihre Handler zu registrieren.
if (typeof window !== 'undefined') {
  _loadFromStorage();
  window.addEventListener('online', () => {
    flushQueue().catch((e) => console.warn('[offlineQueue] auto-flush failed', e));
  });
}
