/* eslint-disable */
"use client";

import { useRef } from "react";
import CanvasGameShell, { CanvasGameConfig, CanvasShellApi } from "@/components/CanvasGameShell";
import { poly } from "@/lib/canvasGameUtils";

const ngon = (cx: number, cy: number, R: number, n: number, ang: number): [number, number][] =>
  Array.from({ length: n }, (_, k) => {
    const a = ((ang + (k * 360) / n - 90) * Math.PI) / 180;
    return [cx + Math.cos(a) * R, cy + Math.sin(a) * R];
  });

export default function FitTheHole() {
  const stateRef = useRef({
    api: null as CanvasShellApi | null,
    rnd: Math.random,
    score: 0,
    lives: 3,
    flash: 0,
    fc: "#ffffff",
    wait: 0.6,
    wall: null as { n: number; ha: number; y: number } | null,
    pa: 0,
    n: 3,
  });

  const spawn = () => {
    const st = stateRef.current;
    const r = st.rnd;
    st.n = [3, 4, 6][Math.floor(r() * 3)];
    st.wall = { n: st.n, ha: 30 * Math.floor(r() * 12), y: -40 };
    st.pa = 30 * Math.floor(r() * 12);
  };

  const config: CanvasGameConfig = {
    gameId: "fitthehole",
    title: "Fit the Hole",
    overTitle: "Game over",
    unit: "score",
    lowerIsBetter: false,
    aspect: 1.15,
    labels: ["Passed", "Lives"],
    intro: "A wall with a hole rushes at you. Rotate your shape so it fits through. You have 3 lives and the walls keep speeding up.",
    help: "Tap the left side of the screen to rotate left, the right side to rotate right (or use the arrow keys).",
    theme: {
      wrapperBg: "linear-gradient(180deg, #1b0b3b, #2d1263)",
      cardBg: "#2a1257",
      canvasBg: "#2a1257",
      border: "#ff4fd8",
      text: "#ffffff",
      mute: "#d4b4ff",
      accent: "#ffe14d",
      accentText: "#1b0b3b",
      sun: "#ffe14d",
      sunText: "#1b0b3b",
    },
    onInit(rnd, api) {
      const st = stateRef.current;
      st.api = api;
      st.rnd = rnd;
      st.score = 0;
      st.lives = 3;
      st.flash = 0;
      st.fc = "#ffffff";
      st.wait = 0.6;
      st.wall = null;
      st.pa = 0;
      st.n = 3;
    },
    onPointerDown(e, api) {
      if (api.playing()) {
        stateRef.current.pa += api.pos(e).x < api.W / 2 ? -30 : 30;
      }
    },
    onKeyDown(e, api) {
      if (!api.playing()) return;
      if (e.key === "ArrowLeft") {
        stateRef.current.pa -= 30;
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        stateRef.current.pa += 30;
        e.preventDefault();
      }
    },
    onUpdate(dt) {
      const st = stateRef.current;
      if (!st.api) return;
      const yP = st.api.H * 0.78;
      st.flash = Math.max(0, st.flash - dt);
      if (!st.wall) {
        st.wait -= dt;
        if (st.wait <= 0) spawn();
        return;
      }
      const dur = Math.max(1.4, 3.4 - 0.12 * st.score);
      st.wall.y += ((yP + 40) / dur) * dt;
      if (st.wall.y >= yP) {
        const sym = 360 / st.wall.n;
        const ok = (((st.wall.ha - st.pa) % sym) + sym) % sym < 1;
        if (ok) st.score++;
        else st.lives--;
        st.flash = 0.35;
        st.fc = ok ? "#38f2a4" : "#ff4d6d";
        st.wall = null;
        st.wait = 0.5;
        if (st.lives <= 0) st.api.finish(st.score);
      }
    },
    onDraw(ctx, W, H) {
      const st = stateRef.current;
      const R = W * 0.15;
      const yP = H * 0.78;
      if (st.flash > 0) {
        ctx.fillStyle = st.fc;
        ctx.globalAlpha = st.flash * 1.5;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      if (st.wall) {
        const w = st.wall;
        ctx.fillStyle = "#ff4fd8";
        ctx.beginPath();
        ctx.rect(0, w.y - R - 8, W, 2 * R + 16);
        ngon(W / 2, w.y, R, w.n, w.ha).forEach(([x, y], i) =>
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
        );
        ctx.closePath();
        ctx.fill("evenodd");
      }
      ctx.fillStyle = "#ffe14d";
      ctx.strokeStyle = "#ff4fd8";
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      poly(ctx, ngon(W / 2, yP, R * 0.94, st.n, st.pa));
      ctx.fill();
      ctx.stroke();
    },
    getHud() {
      const st = stateRef.current;
      return [st.score, "♥".repeat(Math.max(0, st.lives))];
    },
  };

  return <CanvasGameShell config={config} />;
}
