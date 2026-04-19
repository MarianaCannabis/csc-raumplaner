// Orchestration around the escape-route worker. Rules are synchronous, so
// we can't `await` the worker inside `check()`. Instead:
//   - scheduleAnalysis(ctx) debounces 300 ms and posts to the worker
//   - the result lands in an in-memory latestResult cache
//   - the rule reads the cache; if missing, reports passed: null "analysing"
//   - when the result updates we ping renderComplianceBadges() so the badge
//     bar repaints against the fresh data
//
// Vite handles the worker bundle via the `?worker` import.

import EscapeWorker from '../workers/escapeRoute.worker.ts?worker';
import type { Room, PlacedObject } from './types.js';

export interface PerRoomEscape {
  hasExit: boolean;
  minWidth: number;
  pathPoints?: { x: number; y: number }[];
}

export interface EscapeAnalysis {
  perRoom: Record<string, PerRoomEscape>;
  /** Monotonic id of the snapshot this result was computed from. */
  snapshotId: number;
  /** Milliseconds to run the worker. */
  elapsedMs: number;
}

let worker: Worker | null = null;
let latest: EscapeAnalysis | null = null;
let pendingSnapshot = 0;
let nextSnapshotId = 1;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let listeners: Array<(a: EscapeAnalysis) => void> = [];

function ensureWorker(): Worker {
  if (worker) return worker;
  worker = new EscapeWorker();
  worker.addEventListener('message', (e: MessageEvent) => {
    const data = e.data as { perRoom: Record<string, PerRoomEscape>; error?: string };
    if (data.error) {
      console.warn('[compliance] escape worker error', data.error);
      return;
    }
    const elapsed = performance.now() - (pendingStartedAt ?? performance.now());
    latest = { perRoom: data.perRoom, snapshotId: pendingSnapshot, elapsedMs: elapsed };
    for (const cb of listeners) {
      try { cb(latest); } catch (err) { console.warn('[compliance] listener threw', err); }
    }
  });
  return worker;
}

let pendingStartedAt: number | null = null;

export function scheduleAnalysis(rooms: Room[], objects: PlacedObject[], delayMs = 300): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    pendingSnapshot = nextSnapshotId++;
    pendingStartedAt = performance.now();
    ensureWorker().postMessage({ rooms, objects });
  }, delayMs);
}

export function getLatestAnalysis(): EscapeAnalysis | null {
  return latest;
}

export function subscribe(cb: (a: EscapeAnalysis) => void): () => void {
  listeners.push(cb);
  return () => { listeners = listeners.filter((l) => l !== cb); };
}
