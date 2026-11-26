/* eslint-disable */
"use client";

import { useRef, useState } from "react";
import CanvasGameShell, { CanvasGameConfig, CanvasShellApi } from "@/components/CanvasGameShell";

interface RoundData {
  t: number;
  r1: number;
  r2: number;
}

interface ShowResult {
  err: number;
  sc: number;
  t: number;
  g: number;
  until: number;
}

function drawAngleFig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ang: number,
  rot: number,
  L: number,
  col: string,
  label: string
) {
  const a1 = (rot * Math.PI) / 180;
  const a2 = ((rot + ang) * Math.PI) / 180;
  ctx.fillStyle = col;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, L * 0.55, a1, a2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#1b3f9a";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(a1) * L, y + Math.sin(a1) * L);
  ctx.lineTo(x, y);
  ctx.lineTo(x + Math.cos(a2) * L, y + Math.sin(a2) * L);
  ctx.stroke();
  ctx.fillStyle = "#1b3f9a";
  ctx.font = "700 15px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label, x, y + L + 26);
}

export default function AngleMatch() {
  const [sliderVal, setSliderVal] = useState(90);

  const stateRef = useRef({
    api: null as CanvasShellApi | null,
    rs: [] as RoundData[],
    round: 0,
    total: 0,
    g: 90,
    show: null as ShowResult | null,
    t: 0,
  });

  const lockIn = () => {
    const st = stateRef.current;
    if (!st.api || !st.api.playing() || st.show) return;
    const R = st.rs[st.round];
    const err = Math.abs(R.t - st.g);
    const sc = Math.max(0, Math.round(100 - err * 4));
    st.total += sc;
    st.show = { err, sc, t: R.t, g: st.g, until: st.t + 1.7 };
  };

  const config: CanvasGameConfig = {
    gameId: "anglematch",
    title: "Angle Match",
    overTitle: "All rounds done!",
    unit: "score",
    lowerIsBetter: false,
    aspect: 0.85,
    labels: ["Round", "Score"],
    intro: "Match the angle on the right to the target on the left using the slider. 6 rounds, up to 100 points each.",
    help: "Slide until the two angles look the same, then tap Lock in. Each degree off costs 4 points.",
    theme: {
      wrapperBg: "#eef4ff",
      cardBg: "#ffffff",
      canvasBg: "#ffffff",
      border: "#1b3f9a",
      text: "#1b3f9a",
      mute: "#5c76b8",
      accent: "#ff7a1a",
      accentText: "#ffffff",
      sun: "#ffd166",
      sunText: "#1b3f9a",
    },
    onInit(rnd, api) {
      const st = stateRef.current;
      st.api = api;
      st.rs = [];
      st.round = 0;
      st.total = 0;
      st.g = 90;
      st.show = null;
      st.t = 0;
      setSliderVal(90);
      for (let i = 0; i < 6; i++) {
        st.rs.push({
          t: 15 + Math.floor(rnd() * 150),
          r1: rnd() * 360,
          r2: rnd() * 360,
        });
      }
    },
    onUpdate(_dt, t) {
      const st = stateRef.current;
      st.t = t;
      if (st.show && t > st.show.until) {
        st.show = null;
        if (++st.round >= 6) {
          st.api?.finish(st.total);
        } else {
          st.g = 90;
          setSliderVal(90);
        }
      }
    },
    onDraw(ctx, W, H) {
      const st = stateRef.current;
      if (!st.rs.length) return;
      const R = st.rs[Math.min(st.round, 5)];
      const L = W * 0.22;
      const y = H * 0.45;
      drawAngleFig(ctx, W * 0.27, y, R.t, R.r1, L, "#8cc8ff", "Target");
      drawAngleFig(ctx, W * 0.73, y, st.g, R.r2, L, "#ffd166", "Yours");
      if (st.show) {
        ctx.fillStyle = "#1b3f9a";
        ctx.font = "700 17px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(
          `Target ${st.show.t}°, yours ${st.show.g}°  +${st.show.sc}`,
          W / 2,
          H - 20
        );
      }
    },
    getHud() {
      const st = stateRef.current;
      return [`${Math.min(st.round + 1, 6)}/6`, st.total];
    },
    renderControls() {
      return (
        <>
          <input
            type="range"
            min={5}
            max={175}
            value={sliderVal}
            aria-label="Angle"
            onChange={(e) => {
              const v = Number(e.target.value);
              setSliderVal(v);
              stateRef.current.g = v;
            }}
            className="flex-1 h-9 accent-[#ff7a1a] cursor-pointer"
          />
          <button
            type="button"
            onClick={lockIn}
            className="px-4 py-2.5 rounded-xl font-bold text-sm border-2 cursor-pointer"
            style={{
              background: "#ff7a1a",
              color: "#ffffff",
              borderColor: "#1b3f9a",
            }}
          >
            Lock in
          </button>
        </>
      );
    },
  };

  return <CanvasGameShell config={config} />;
}
