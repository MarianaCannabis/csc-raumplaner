// Web Worker: grid-based escape-route analysis.
//
// Input:  { rooms, objects }
// Output: { perRoom: { [roomId]: { hasExit, minWidth, pathPoints } } }
//
// Algorithm:
//   1. Build a 0.1 m grid over the bounding box of all rooms.
//      Cells inside a room start free; everything else is blocked.
//      Large non-door objects (w·d ≥ 0.25 m²) additionally block cells.
//   2. Compute a distance-transform: for every free cell, the L∞-chebyshev
//      distance (in cells) to the nearest blocker. Fast 2-pass sweep.
//   3. Multi-source BFS from exit cells. Exits = cells within a small disk
//      around each `sec-sign-exit` object. If none, fall back to any free
//      cell on the bounding-box border (treats room edges as outside doors).
//   4. For every room: centre cell → trace back to an exit via BFS parents.
//      Path's minimum clearance × 2 × cell-size = the corridor's minWidth.
//
// Sync runs sub-10 ms for typical layouts (≤400²). The worker keeps the UI
// thread free regardless and makes larger plans possible later.

import type { Room, PlacedObject } from '../compliance/types.js';

interface WorkerInput {
  rooms: Room[];
  objects: PlacedObject[];
}

interface PerRoomResult {
  hasExit: boolean;
  minWidth: number;
  pathPoints?: { x: number; y: number }[];
}

interface WorkerOutput {
  perRoom: Record<string, PerRoomResult>;
}

const CELL = 0.1; // metres per cell
const DOOR_TYPE = /^(at-|door|tür)/i;

function analyse({ rooms, objects }: WorkerInput): WorkerOutput {
  const perRoom: Record<string, PerRoomResult> = {};
  if (rooms.length === 0) return { perRoom };

  // 1. Bounding box + grid dims
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const r of rooms) {
    if (r.x < minX) minX = r.x;
    if (r.y < minY) minY = r.y;
    if (r.x + r.w > maxX) maxX = r.x + r.w;
    if (r.y + r.d > maxY) maxY = r.y + r.d;
  }
  const PAD = 0.5;
  minX -= PAD; minY -= PAD; maxX += PAD; maxY += PAD;
  const W = Math.max(1, Math.ceil((maxX - minX) / CELL));
  const H = Math.max(1, Math.ceil((maxY - minY) / CELL));
  if (W * H > 4_000_000) {
    // Guard: absurdly large scene — skip analysis.
    for (const r of rooms) perRoom[r.id] = { hasExit: false, minWidth: 0 };
    return { perRoom };
  }

  const grid = new Uint8Array(W * H);
  grid.fill(1); // 1 = blocked, 0 = free

  // Room interiors → free
  for (const r of rooms) {
    const x0 = Math.max(0, Math.floor((r.x - minX) / CELL));
    const y0 = Math.max(0, Math.floor((r.y - minY) / CELL));
    const x1 = Math.min(W, Math.ceil((r.x + r.w - minX) / CELL));
    const y1 = Math.min(H, Math.ceil((r.y + r.d - minY) / CELL));
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        grid[y * W + x] = 0;
      }
    }
  }

  // Large non-door objects → blocked
  for (const o of objects) {
    const ow = typeof o['w'] === 'number' ? (o['w'] as number) : 0;
    const od = typeof o['d'] === 'number' ? (o['d'] as number) : 0;
    if (ow * od < 0.25) continue;
    if (DOOR_TYPE.test(o.typeId)) continue;
    const x0 = Math.max(0, Math.floor((o.x - ow / 2 - minX) / CELL));
    const y0 = Math.max(0, Math.floor((o.y - od / 2 - minY) / CELL));
    const x1 = Math.min(W, Math.ceil((o.x + ow / 2 - minX) / CELL));
    const y1 = Math.min(H, Math.ceil((o.y + od / 2 - minY) / CELL));
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        grid[y * W + x] = 1;
      }
    }
  }

  // 2. Distance transform (Chamfer 3-4 approximation of Chebyshev)
  const dt = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) dt[i] = grid[i] === 1 ? 0 : Infinity;
  // Forward pass
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (dt[i] === 0) continue;
      if (x > 0) dt[i] = Math.min(dt[i]!, dt[i - 1]! + 1);
      if (y > 0) dt[i] = Math.min(dt[i]!, dt[i - W]! + 1);
      if (x > 0 && y > 0) dt[i] = Math.min(dt[i]!, dt[i - W - 1]! + 1.414);
      if (x < W - 1 && y > 0) dt[i] = Math.min(dt[i]!, dt[i - W + 1]! + 1.414);
    }
  }
  // Backward pass
  for (let y = H - 1; y >= 0; y--) {
    for (let x = W - 1; x >= 0; x--) {
      const i = y * W + x;
      if (dt[i] === 0) continue;
      if (x < W - 1) dt[i] = Math.min(dt[i]!, dt[i + 1]! + 1);
      if (y < H - 1) dt[i] = Math.min(dt[i]!, dt[i + W]! + 1);
      if (x < W - 1 && y < H - 1) dt[i] = Math.min(dt[i]!, dt[i + W + 1]! + 1.414);
      if (x > 0 && y < H - 1) dt[i] = Math.min(dt[i]!, dt[i + W - 1]! + 1.414);
    }
  }

  // 3. Exit cells
  const exitCells: number[] = [];
  for (const o of objects) {
    if (o.typeId !== 'sec-sign-exit') continue;
    const cx = Math.floor((o.x - minX) / CELL);
    const cy = Math.floor((o.y - minY) / CELL);
    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || x >= W || y < 0 || y >= H) continue;
        const idx = y * W + x;
        if (grid[idx] === 0) exitCells.push(idx);
      }
    }
  }
  // Fallback: free cells on the bounding-box border
  if (exitCells.length === 0) {
    for (let x = 0; x < W; x++) {
      if (grid[x] === 0) exitCells.push(x);
      const bot = (H - 1) * W + x;
      if (grid[bot] === 0) exitCells.push(bot);
    }
    for (let y = 0; y < H; y++) {
      const l = y * W;
      if (grid[l] === 0) exitCells.push(l);
      const r = y * W + W - 1;
      if (grid[r] === 0) exitCells.push(r);
    }
  }

  // 4. Multi-source BFS
  const visited = new Uint8Array(W * H);
  const parent = new Int32Array(W * H);
  parent.fill(-1);
  let head = 0;
  const queue: number[] = [];
  for (const c of exitCells) {
    if (!visited[c]) {
      visited[c] = 1;
      queue.push(c);
    }
  }
  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];
  while (head < queue.length) {
    const cur = queue[head++]!;
    const cx = cur % W;
    const cy = (cur - cx) / W;
    for (let k = 0; k < 4; k++) {
      const nx = cx + dx[k]!;
      const ny = cy + dy[k]!;
      if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
      const ni = ny * W + nx;
      if (visited[ni] || grid[ni] === 1) continue;
      visited[ni] = 1;
      parent[ni] = cur;
      queue.push(ni);
    }
  }

  // 5. Per-room: trace from centre, gather min clearance along path
  for (const r of rooms) {
    const cx = Math.floor((r.x + r.w / 2 - minX) / CELL);
    const cy = Math.floor((r.y + r.d / 2 - minY) / CELL);
    if (cx < 0 || cx >= W || cy < 0 || cy >= H) {
      perRoom[r.id] = { hasExit: false, minWidth: 0 };
      continue;
    }
    const startIdx = cy * W + cx;
    if (!visited[startIdx] || grid[startIdx] === 1) {
      perRoom[r.id] = { hasExit: false, minWidth: 0 };
      continue;
    }
    const pathPoints: { x: number; y: number }[] = [];
    let minClear = Infinity;
    let cur = startIdx;
    let safety = W * H;
    while (cur !== -1 && safety-- > 0) {
      const px = (cur % W) * CELL + minX + CELL / 2;
      const py = Math.floor(cur / W) * CELL + minY + CELL / 2;
      pathPoints.push({ x: px, y: py });
      const d = dt[cur]!;
      if (d < minClear) minClear = d;
      cur = parent[cur]!;
    }
    const minWidth = minClear === Infinity ? 0 : 2 * minClear * CELL;
    perRoom[r.id] = { hasExit: true, minWidth, pathPoints };
  }

  return { perRoom };
}

// Worker entry
self.addEventListener('message', (e: MessageEvent<WorkerInput>) => {
  try {
    const out = analyse(e.data);
    (self as unknown as Worker).postMessage(out);
  } catch (err) {
    (self as unknown as Worker).postMessage({
      perRoom: {},
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
