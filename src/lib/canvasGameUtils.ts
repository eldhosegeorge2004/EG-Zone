// Shared utilities for seeded PRNG, time formatting, and canvas geometry

export function rngFrom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function fmtT(t: number): string {
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `${pad2(Math.floor(t / 60))}:${pad2(Math.floor(t % 60))}.${Math.floor((t * 10) % 10)}`;
}

export function fmtMMSS(secs: number): string {
  const s = Math.max(0, Math.floor(secs));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function poly(ctx: CanvasRenderingContext2D, pts: readonly [number, number][]): void {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

export function getTodayStr(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function getModeSeed(gameId: string, mode: "daily" | "random"): { seed: string; date: string } {
  const date = getTodayStr();
  const seed = mode === "daily" ? `${gameId}-${date}` : `R-${Math.random()}`;
  return { seed, date };
}

export function computeTimeScore(seconds: number, base = 1000, penaltyPerSec = 5): number {
  return Math.max(100, Math.round(base - seconds * penaltyPerSec));
}
