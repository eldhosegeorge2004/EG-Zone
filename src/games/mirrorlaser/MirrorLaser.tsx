/* eslint-disable */
"use client";

import { useRef } from "react";
import CanvasGameShell, { CanvasGameConfig, CanvasShellApi } from "@/components/CanvasGameShell";
import { computeTimeScore, fmtT } from "@/lib/canvasGameUtils";

const N = 6;

interface Puzzle {
  src: number;
  k: number;
  mir: [number, number, number][];
  target: [number, number];
  obs: [number, number][];
}

function genPuzzle(rnd: () => number, k: number): Puzzle {
  for (let tr = 0; tr < 500; tr++) {
    const used = new Set<string>();
    const mir: [number, number, number][] = [];
    let r = Math.floor(rnd() * N);
    let c = 0;
    let dr = 0;
    let dc = 1;
    let ok = true;
    const src = r;
    used.add(`${r},${c}`);
    for (let i = 0; i <= k && ok; i++) {
      const len = 1 + Math.floor(rnd() * 4);
      for (let s = 0; s < len && ok; s++) {
        r += dr;
        c += dc;
        if (r < 0 || c < 0 || r >= N || c >= N || used.has(`${r},${c}`)) {
          ok = false;
        } else {
          used.add(`${r},${c}`);
        }
      }
      if (ok && i < k) {
        const t = rnd() < 0.5 ? 1 : 2;
        const nd = t === 1 ? [-dc, -dr] : [dc, dr];
        mir.push([r, c, t]);
        dr = nd[0];
        dc = nd[1];
      }
    }
    if (!ok) continue;
    const obs: [number, number][] = [];
    for (let q = 0; q < 60 && obs.length < 4; q++) {
      const a = Math.floor(rnd() * N);
      const b = Math.floor(rnd() * N);
      if (!used.has(`${a},${b}`) && !obs.some((o) => o[0] === a && o[1] === b)) {
        obs.push([a, b]);
      }
    }
    return { src, k, mir, target: [r, c], obs };
  }
  return { src: 0, k: 1, mir: [[0, 3, 2]], target: [3, 3], obs: [] };
}

function traceBeam(p: Puzzle, grid: number[][]) {
  let r = p.src;
  let c = 0;
  let dr = 0;
  let dc = 1;
  let hit = false;
  const pts: [number, number][] = [[0, r + 0.5]];
  for (let s = 0; s < 80; s++) {
    if (r < 0 || c < 0 || r >= N || c >= N) {
      pts.push([dc > 0 ? N : dc < 0 ? 0 : c + 0.5, dr > 0 ? N : dr < 0 ? 0 : r + 0.5]);
      break;
    }
    pts.push([c + 0.5, r + 0.5]);
    if (p.obs.some((o) => o[0] === r && o[1] === c)) break;
    if (p.target[0] === r && p.target[1] === c) {
      hit = true;
      break;
    }
    const m = grid[r][c];
    if (m === 1) [dr, dc] = [-dc, -dr];
    else if (m === 2) [dr, dc] = [dc, dr];
    r += dr;
    c += dc;
  }
  return { pts, hit };
}

export default function MirrorLaser() {
  const stateRef = useRef({
    api: null as CanvasShellApi | null,
    round: 0,
    t: 0,
    next: 0,
    puz: [] as Puzzle[],
    grid: Array.from({ length: N }, () => Array(N).fill(0)) as number[][],
    used: 0,
  });

  const resetGrid = () => {
    const st = stateRef.current;
    st.grid = Array.from({ length: N }, () => Array(N).fill(0));
    st.used = 0;
    st.next = 0;
  };

  const config: CanvasGameConfig = {
    gameId: "mirrorlaser",
    title: "Mirror Laser",
    overTitle: "All puzzles solved!",
    unit: "time",
    lowerIsBetter: true,
    aspect: 1,
    labels: ["Puzzle", "Time"],
    intro: "Place mirrors so the laser bounces into the target. 5 puzzles, fastest total time wins.",
    help: 'Tap a square to place a "/" mirror, tap again for "\\", again to remove it. Dark squares block the beam.',
    computeLeaderboardScore: (t) => computeTimeScore(t, 1200, 6),
    theme: {
      wrapperBg: "radial-gradient(circle at 50% -10%, #16245a, #070b18 75%)",
      cardBg: "#0e1630",
      canvasBg: "#0a1026",
      border: "#5ef0ff",
      text: "#d6f6ff",
      mute: "#7f9cc9",
      accent: "#ff3d81",
      accentText: "#ffffff",
      sun: "#ffe66d",
      sunText: "#070b18",
    },
    onInit(rnd, api) {
      const st = stateRef.current;
      st.api = api;
      st.round = 0;
      st.t = 0;
      st.next = 0;
      st.puz = [1, 2, 2, 3, 3].map((k) => genPuzzle(rnd, k));
      resetGrid();
    },
    onPointerDown(e, api) {
      const st = stateRef.current;
      if (!api.playing() || st.next) return;
      const p = api.pos(e);
      const cs = api.W / N;
      const c = Math.floor(p.x / cs);
      const r = Math.floor(p.y / cs);
      const P = st.puz[st.round];
      if (!P || r < 0 || c < 0 || r >= N || c >= N) return;
      if (P.obs.some((o) => o[0] === r && o[1] === c) || (P.target[0] === r && P.target[1] === c)) {
        return;
      }
      const cur = st.grid[r][c];
      if (cur === 0 && st.used >= P.k) {
        api.toast("No mirrors left");
        return;
      }
      st.grid[r][c] = (cur + 1) % 3;
      st.used += cur === 0 ? 1 : cur === 2 ? -1 : 0;
      if (traceBeam(P, st.grid).hit) {
        st.next = st.t + 0.7;
      }
    },
    onUpdate(_dt, t) {
      const st = stateRef.current;
      st.t = t;
      if (st.next && t > st.next) {
        st.round++;
        if (st.round >= 5) {
          st.round = 4;
          st.api?.finish(t);
        } else {
          resetGrid();
        }
      }
    },
    onDraw(ctx, W) {
      const st = stateRef.current;
      const P = st.puz[st.round];
      if (!P) return;
      const cs = W / N;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#1c2a55";
      for (let i = 1; i < N; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cs, 0);
        ctx.lineTo(i * cs, W);
        ctx.moveTo(0, i * cs);
        ctx.lineTo(W, i * cs);
        ctx.stroke();
      }
      ctx.fillStyle = "#2c3b70";
      P.obs.forEach(([r, c]) => ctx.fillRect(c * cs + 3, r * cs + 3, cs - 6, cs - 6));

      const tr = traceBeam(P, st.grid);
      ctx.strokeStyle = "#ff3d81";
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";
      ctx.beginPath();
      tr.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * cs, y * cs) : ctx.moveTo(x * cs, y * cs)));
      ctx.stroke();

      const [tr0, tc0] = P.target;
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#5ef0ff";
      ctx.fillStyle = tr.hit ? "#4dffb4" : "#ffe66d";
      ctx.beginPath();
      ctx.arc((tc0 + 0.5) * cs, (tr0 + 0.5) * cs, cs * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ff3d81";
      ctx.beginPath();
      ctx.moveTo(0, P.src * cs + cs * 0.25);
      ctx.lineTo(cs * 0.22, P.src * cs + cs * 0.5);
      ctx.lineTo(0, P.src * cs + cs * 0.75);
      ctx.fill();

      ctx.strokeStyle = "#5ef0ff";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const m = st.grid[r][c];
          if (!m) continue;
          const x = c * cs;
          const y = r * cs;
          const p = cs * 0.2;
          ctx.beginPath();
          if (m === 1) {
            ctx.moveTo(x + p, y + cs - p);
            ctx.lineTo(x + cs - p, y + p);
          } else {
            ctx.moveTo(x + p, y + p);
            ctx.lineTo(x + cs - p, y + cs - p);
          }
          ctx.stroke();
        }
      }

      ctx.fillStyle = "#5ef0ff";
      ctx.font = "700 14px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(`Mirrors left: ${P.k - st.used}`, W - 8, W - 8);
    },
    getHud(t) {
      return [`${stateRef.current.round + 1}/5`, fmtT(t)];
    },
  };

  return <CanvasGameShell config={config} />;
}
