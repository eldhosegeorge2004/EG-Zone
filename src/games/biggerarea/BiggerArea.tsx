/* eslint-disable */
"use client";

import { useRef } from "react";
import CanvasGameShell, { CanvasGameConfig, CanvasShellApi } from "@/components/CanvasGameShell";
import { poly } from "@/lib/canvasGameUtils";

type ShapeType = "rect" | "square" | "tri" | "circle" | "para" | "trap";

interface ShapeItem {
  t: ShapeType;
  a: number;
  l: string[];
}

const LIMIT = 45;

function makeShape(r: () => number): ShapeItem {
  const types: ShapeType[] = ["rect", "square", "tri", "circle", "para", "trap"];
  const t = types[Math.floor(r() * 6)];
  const randInt = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));

  if (t === "rect") {
    const w = randInt(3, 12);
    const h = randInt(2, 10);
    return { t, a: w * h, l: [`${w} x ${h}`] };
  }
  if (t === "square") {
    const s = randInt(3, 10);
    return { t, a: s * s, l: [`side ${s}`] };
  }
  if (t === "tri") {
    const b = randInt(4, 14);
    const h = randInt(3, 12);
    return { t, a: (b * h) / 2, l: [`base ${b}`, `height ${h}`] };
  }
  if (t === "circle") {
    const q = randInt(2, 6);
    return { t, a: 3.14 * q * q, l: [`radius ${q}`] };
  }
  if (t === "para") {
    const b = randInt(4, 12);
    const h = randInt(3, 9);
    return { t, a: b * h, l: [`base ${b}`, `height ${h}`] };
  }
  const a = randInt(3, 8);
  const b = randInt(5, 12);
  const h = randInt(3, 8);
  return { t: "trap", a: ((a + b) / 2) * h, l: [`sides ${a} & ${b}`, `height ${h}`] };
}

function drawShape(ctx: CanvasRenderingContext2D, t: ShapeType, x: number, y: number, S: number) {
  const P: Partial<Record<ShapeType, [number, number][]>> = {
    tri: [
      [x - S / 2, y + S * 0.35],
      [x + S / 2, y + S * 0.35],
      [x + S * 0.1, y - S * 0.4],
    ],
    para: [
      [x - S / 2, y + S * 0.3],
      [x + S * 0.2, y + S * 0.3],
      [x + S / 2, y - S * 0.3],
      [x - S * 0.2, y - S * 0.3],
    ],
    trap: [
      [x - S / 2, y + S * 0.3],
      [x + S / 2, y + S * 0.3],
      [x + S * 0.25, y - S * 0.3],
      [x - S * 0.25, y - S * 0.3],
    ],
  };

  ctx.fillStyle = "#2ee6a6";
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  const pts = P[t];
  if (pts) {
    poly(ctx, pts);
  } else {
    ctx.beginPath();
    if (t === "circle") ctx.arc(x, y, S * 0.42, 0, Math.PI * 2);
    else if (t === "square") ctx.rect(x - S * 0.4, y - S * 0.4, S * 0.8, S * 0.8);
    else ctx.rect(x - S / 2, y - S * 0.3, S, S * 0.6);
  }
  ctx.fill();
  ctx.stroke();
}

export default function BiggerArea() {
  const stateRef = useRef({
    api: null as CanvasShellApi | null,
    rnd: Math.random,
    score: 0,
    flash: 0,
    fc: "#ffffff",
    t: 0,
    pair: [] as ShapeItem[],
  });

  const nextPair = () => {
    const st = stateRef.current;
    let A: ShapeItem;
    let B: ShapeItem;
    do {
      A = makeShape(st.rnd);
      B = makeShape(st.rnd);
    } while (Math.abs(A.a - B.a) / Math.max(A.a, B.a) < 0.15);
    st.pair = [A, B];
  };

  const pick = (s: 0 | 1) => {
    const st = stateRef.current;
    if (st.pair.length < 2) return;
    const ok = st.pair[s].a > st.pair[1 - s].a;
    st.score = ok ? st.score + 1 : Math.max(0, st.score - 1);
    st.flash = 0.3;
    st.fc = ok ? "#2ee6a6" : "#ff6b81";
    nextPair();
  };

  const config: CanvasGameConfig = {
    gameId: "biggerarea",
    title: "Bigger Area",
    overTitle: "Time's up!",
    unit: "score",
    lowerIsBetter: false,
    aspect: 0.9,
    labels: ["Score", "Left"],
    intro: "Two shapes appear with their measurements. Tap the one with the larger area. You have 45 seconds. Wrong answers cost a point.",
    help: "Shapes are not drawn to scale, so work out the areas. Triangle = base × height / 2, circle = 3.14 × radius × radius.",
    theme: {
      wrapperBg: "#f8fafc",
      cardBg: "#ffffff",
      canvasBg: "#ffffff",
      border: "#111111",
      text: "#111111",
      mute: "#52525b",
      accent: "#ff3b5c",
      accentText: "#ffffff",
      sun: "#ffd400",
      sunText: "#111111",
    },
    onInit(rnd, api) {
      const st = stateRef.current;
      st.api = api;
      st.rnd = rnd;
      st.score = 0;
      st.flash = 0;
      st.fc = "#ffffff";
      st.t = 0;
      nextPair();
    },
    onPointerDown(e, api) {
      if (api.playing()) {
        pick(api.pos(e).x < api.W / 2 ? 0 : 1);
      }
    },
    onKeyDown(e, api) {
      if (!api.playing()) return;
      if (e.key === "ArrowLeft") pick(0);
      else if (e.key === "ArrowRight") pick(1);
    },
    onUpdate(dt, t) {
      const st = stateRef.current;
      st.t = t;
      st.flash = Math.max(0, st.flash - dt);
      if (t >= LIMIT) st.api?.finish(st.score);
    },
    onDraw(ctx, W, H) {
      const st = stateRef.current;
      if (st.flash > 0) {
        ctx.fillStyle = st.fc;
        ctx.globalAlpha = st.flash * 2;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = "#111111";
      ctx.font = "700 17px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Which has the larger area?", W / 2, 30);

      st.pair.forEach((p, i) => {
        const cx = W * (i ? 0.74 : 0.26);
        const cy = H * 0.46;
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 3;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(cx - W * 0.22, H * 0.14, W * 0.44, H * 0.66, 14);
        ctx.fill();
        ctx.stroke();
        drawShape(ctx, p.t, cx, cy - 20, W * 0.34);
        ctx.fillStyle = "#111111";
        ctx.font = "700 15px system-ui";
        p.l.forEach((ln, k) => ctx.fillText(ln, cx, cy + W * 0.2 + k * 20));
      });
    },
    getHud(t) {
      return [stateRef.current.score, `${Math.max(0, Math.ceil(LIMIT - t))}s`];
    },
  };

  return <CanvasGameShell config={config} />;
}
