/* eslint-disable */
"use client";

import { useRef } from "react";
import CanvasGameShell, { CanvasGameConfig, CanvasShellApi } from "@/components/CanvasGameShell";
import { computeTimeScore, fmtT, poly } from "@/lib/canvasGameUtils";

const SH: [number, number][][] = [
  [[0, 0], [4, 0], [2, 2]],
  [[0, 0], [0, 4], [2, 2]],
  [[4, 0], [4, 2], [3, 1]],
  [[3, 1], [4, 2], [3, 3], [2, 2]],
  [[4, 2], [4, 4], [3, 3]],
  [[2, 2], [4, 4], [2, 4]],
  [[2, 2], [2, 4], [0, 4]],
];
const COLS = ["#c8553d", "#6fa88c", "#e9b44c", "#8f7bb5", "#d98ca0", "#5e9bc4", "#e08e45"];
const SYM = [360, 360, 360, 90, 360, 360, 360];

interface Piece {
  i: number;
  loc: [number, number][];
  sx: number;
  sy: number;
  x: number;
  y: number;
  rot: number;
  locked: boolean;
}

function worldPts(q: Piece): [number, number][] {
  const a = (q.rot * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return q.loc.map(([x, y]) => [q.x + x * c - y * s, q.y + x * s + y * c]);
}

function insidePoly(pts: [number, number][], p: { x: number; y: number }): boolean {
  let r = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if ((yi > p.y) !== (yj > p.y) && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) {
      r = !r;
    }
  }
  return r;
}

export default function TangramFit() {
  const stateRef = useRef({
    api: null as CanvasShellApi | null,
    u: 40,
    ox: 0,
    oy: 10,
    t: 0,
    ps: [] as Piece[],
    drag: null as {
      q: Piece;
      dx: number;
      dy: number;
      sx: number;
      sy: number;
      moved: boolean;
    } | null,
  });

  const snapPiece = (q: Piece) => {
    const st = stateRef.current;
    if (Math.hypot(q.x - q.sx, q.y - q.sy) < st.u * 0.5 && q.rot % SYM[q.i] === 0) {
      q.x = q.sx;
      q.y = q.sy;
      q.rot = 0;
      q.locked = true;
      if (st.ps.every((p) => p.locked)) {
        st.api?.finish(st.t);
      }
    }
  };

  const config: CanvasGameConfig = {
    gameId: "tangramfit",
    title: "Tangram Fit",
    overTitle: "Puzzle complete!",
    unit: "time",
    lowerIsBetter: true,
    aspect: 1.25,
    labels: ["Placed", "Time"],
    intro: "Drag the 7 coloured pieces into their outlines to rebuild the square. Fastest time wins.",
    help: "Drag a piece to move it. Tap a piece to rotate it 45 degrees. It snaps in when position and angle match.",
    computeLeaderboardScore: (t) => computeTimeScore(t, 1200, 5),
    theme: {
      wrapperBg: "#f3e6c8",
      cardBg: "#fffaf0",
      canvasBg: "#f3e6c8",
      border: "#4a2e14",
      text: "#4a2e14",
      mute: "#826243",
      accent: "#c8553d",
      accentText: "#ffffff",
      sun: "#e9b44c",
      sunText: "#4a2e14",
    },
    onInit(rnd, api) {
      const st = stateRef.current;
      st.api = api;
      const { W, H } = api;
      const u = (st.u = W / 6.2);
      const ox = (W - 4 * u) / 2;
      const oy = 10;
      const trayTop = oy + 4 * u + 40;
      st.ox = ox;
      st.oy = oy;
      st.t = 0;
      st.drag = null;
      st.ps = SH.map((s, i) => {
        const cx = s.reduce((a, p) => a + p[0], 0) / s.length;
        const cy = s.reduce((a, p) => a + p[1], 0) / s.length;
        return {
          i,
          loc: s.map(([x, y]) => [(x - cx) * u, (y - cy) * u]),
          sx: ox + cx * u,
          sy: oy + cy * u,
          x: W * (0.2 + 0.6 * rnd()),
          y: trayTop + rnd() * (H - trayTop - 40),
          rot: 45 * (1 + Math.floor(rnd() * 7)),
          locked: false,
        };
      });
    },
    onPointerDown(e, api) {
      if (!api.playing()) return;
      const p = api.pos(e);
      const st = stateRef.current;
      for (let k = st.ps.length - 1; k >= 0; k--) {
        const q = st.ps[k];
        if (!q.locked && insidePoly(worldPts(q), p)) {
          st.ps.splice(k, 1);
          st.ps.push(q);
          st.drag = { q, dx: q.x - p.x, dy: q.y - p.y, sx: p.x, sy: p.y, moved: false };
          e.currentTarget.setPointerCapture(e.pointerId);
          return;
        }
      }
    },
    onPointerMove(e, api) {
      const st = stateRef.current;
      if (!st.drag) return;
      const p = api.pos(e);
      if (Math.hypot(p.x - st.drag.sx, p.y - st.drag.sy) > 6) {
        st.drag.moved = true;
      }
      if (st.drag.moved) {
        st.drag.q.x = p.x + st.drag.dx;
        st.drag.q.y = p.y + st.drag.dy;
      }
    },
    onPointerUp() {
      const st = stateRef.current;
      if (!st.drag) return;
      const q = st.drag.q;
      if (!st.drag.moved) q.rot = (q.rot + 45) % 360;
      st.drag = null;
      snapPiece(q);
    },
    onPointerCancel() {
      stateRef.current.drag = null;
    },
    onUpdate(_dt, t) {
      stateRef.current.t = t;
    },
    onDraw(ctx) {
      const st = stateRef.current;
      const u = st.u;
      ctx.lineJoin = "round";
      SH.forEach((s, i) => {
        ctx.fillStyle = COLS[i];
        ctx.globalAlpha = 0.22;
        poly(
          ctx,
          s.map(([x, y]) => [st.ox + x * u, st.oy + y * u])
        );
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#4a2e14";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
      [...st.ps]
        .sort((a, b) => Number(b.locked) - Number(a.locked))
        .forEach((q) => {
          ctx.fillStyle = COLS[q.i];
          ctx.strokeStyle = "#4a2e14";
          ctx.lineWidth = 3;
          poly(ctx, worldPts(q));
          ctx.fill();
          ctx.stroke();
        });
    },
    getHud(t) {
      return [`${stateRef.current.ps.filter((p) => p.locked).length}/7`, fmtT(t)];
    },
  };

  return <CanvasGameShell config={config} />;
}
