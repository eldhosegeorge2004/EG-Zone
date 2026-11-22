/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SubmitScoreModal from "@/components/SubmitScoreModal";
import { Lightbulb, RotateCcw, Volume2, VolumeX, Moon, Sun, Grid, Trophy, Play } from "lucide-react";

interface Arrow {
  c: [number, number][];
  dir: [number, number];
  ray: [number, number][];
  P: [number, number][];
  m: number;
  out: number;
  off: number;
  st: "idle" | "out" | "gone";
  sh: number;
  hint: number;
  pts: number;
}

const D: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export default function ArrowEscapeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // React states for UI
  const [lvl, setLvl] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [miss, setMiss] = useState(0);
  const [hints, setHints] = useState(3);
  const [undos, setUndos] = useState(2);
  const [combo, setCombo] = useState(1);
  const [infoText, setInfoText] = useState("");
  const [mode, setMode] = useState<"ready" | "play" | "win" | "levelselect">("ready");
  const [unlocked, setUnlocked] = useState(1);
  const [stars, setStars] = useState<Record<number, number>>({});
  const [sndOn, setSndOn] = useState(true);
  const [inv, setInv] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [winTitle, setWinTitle] = useState("");
  const [winSub, setWinSub] = useState("");

  // Refs for 60fps loop
  const modeRef = useRef<"ready" | "play" | "win" | "levelselect">("ready");
  const arrowsRef = useRef<Arrow[]>([]);
  const histRef = useRef<Arrow[]>([]);
  const nRef = useRef(5);
  const lvlRef = useRef(1);
  const scoreRef = useRef(0);
  const missRef = useRef(0);
  const comboRef = useRef(1);
  const hintsRef = useRef(3);
  const undosRef = useRef(2);
  const tmRef = useRef(0);
  const hsRef = useRef(0);
  const sndRef = useRef(true);
  const invRef = useRef(false);
  const unlockedRef = useRef(1);
  const starsRef = useRef<Record<number, number>>({});
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Dimensions
  const dimRef = useRef({ W: 400, H: 400, S: 380, ox: 10, oy: 10, cs: 76 });

  // Tone generator
  const tone = useCallback((f: number, d: number, ty: OscillatorType = "sine", v = 0.08, w = 0) => {
    if (!sndRef.current) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator();
      const gn = ctx.createGain();
      const t = ctx.currentTime + (w || 0);
      o.type = ty;
      o.frequency.value = f;
      o.connect(gn);
      gn.connect(ctx.destination);
      gn.gain.setValueAtTime(v, t);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.start(t);
      o.stop(t + d);
    } catch {}
  }, []);

  // Sync refs
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    sndRef.current = sndOn;
  }, [sndOn]);
  useEffect(() => {
    invRef.current = inv;
  }, [inv]);

  // Load progress
  useEffect(() => {
    try {
      const storedHs = Number(localStorage.getItem("ae_hs") || 0);
      setHighScore(storedHs);
      hsRef.current = storedHs;

      const p = JSON.parse(localStorage.getItem("ae_prog") || "{}");
      if (p.u) {
        setUnlocked(p.u);
        unlockedRef.current = p.u;
      }
      if (p.s) {
        setStars(p.s);
        starsRef.current = p.s;
      }
    } catch {}

    // Generate initial board preview
    gen();
  }, []);

  const saveHS = (sc: number) => {
    if (sc > hsRef.current) {
      hsRef.current = sc;
      setHighScore(sc);
      try {
        localStorage.setItem("ae_hs", String(sc));
      } catch {}
    }
  };

  const saveProg = (u: number, s: Record<number, number>) => {
    try {
      localStorage.setItem("ae_prog", JSON.stringify({ u, s }));
    } catch {}
  };

  const layout = () => {
    const { W, H } = dimRef.current;
    const S = Math.min(W, H) - 16;
    const ox = (W - S) / 2;
    const oy = (H - S) / 2;
    const cs = S / nRef.current;
    dimRef.current = { W, H, S, ox, oy, cs };
  };

  const mk = (cells: [number, number][], dir: [number, number], ray: [number, number][]): Arrow => {
    const m = cells.length;
    const P: [number, number][] = cells.concat(ray);
    const l = P[P.length - 1];
    for (let k = 1; k <= m + 1; k++) {
      P.push([l[0] + dir[0] * k, l[1] + dir[1] * k]);
    }
    return {
      c: cells,
      dir,
      ray,
      P,
      m,
      out: m + ray.length,
      off: 0,
      st: "idle",
      sh: 0,
      hint: 0,
      pts: 0,
    };
  };

  const genOnce = (cnt: number) => {
    const n = nRef.current;
    const occ = Array.from({ length: n }, () => Array(n).fill(0));
    const arr: Arrow[] = [];
    let tries = 0;
    const maxLen = Math.min(2 + Math.floor(lvlRef.current / 2), 5);
    const p1 = Math.max(0.2, 0.6 - 0.06 * lvlRef.current);

    while (arr.length < cnt && tries++ < 4000) {
      const sx = Math.floor(Math.random() * n);
      const sy = Math.floor(Math.random() * n);
      if (occ[sy][sx]) continue;

      const len = Math.random() < p1 ? 1 : 2 + Math.floor(Math.random() * (maxLen - 1));
      const cells: [number, number][] = [[sx, sy]];
      const seen = new Set([`${sx},${sy}`]);
      let dir: [number, number] | null = len === 1 ? D[Math.floor(Math.random() * 4)] : null;

      while (cells.length < len) {
        const q = cells[cells.length - 1];
        const opts = D.filter(([dx, dy]) => {
          const x = q[0] + dx;
          const y = q[1] + dy;
          return x >= 0 && y >= 0 && x < n && y < n && !occ[y][x] && !seen.has(`${x},${y}`);
        });
        if (!opts.length) break;
        const o = opts[Math.floor(Math.random() * opts.length)];
        dir = o;
        cells.push([q[0] + o[0], q[1] + o[1]]);
        seen.add(`${q[0] + o[0]},${q[1] + o[1]}`);
      }

      if (!dir) continue;
      const h = cells[cells.length - 1];
      const ray: [number, number][] = [];
      let x = h[0] + dir[0];
      let y = h[1] + dir[1];
      let bad = false;
      while (x >= 0 && y >= 0 && x < n && y < n) {
        if (occ[y][x] || seen.has(`${x},${y}`)) {
          bad = true;
          break;
        }
        ray.push([x, y]);
        x += dir[0];
        y += dir[1];
      }
      if (bad) continue;

      cells.forEach(([a, b]) => (occ[b][a] = 1));
      arr.push(mk(cells, dir, ray));
    }
    return arr;
  };

  const gen = () => {
    const l = lvlRef.current;
    const cnt = Math.min(25 + (l - 1) * 2, 40);
    let targetN = Math.min(8 + Math.floor((l - 1) / 3), 11);
    nRef.current = targetN;
    let bA: Arrow[] = [];
    let bN = targetN;

    for (let k = 0; k < 40; k++) {
      nRef.current = targetN;
      const res = genOnce(cnt);
      if (res.length > bA.length) {
        bA = res;
        bN = targetN;
      }
      if (bA.length >= cnt) break;
      if (k % 6 === 5 && targetN < 12) targetN++;
    }
    arrowsRef.current = bA;
    nRef.current = bN;
    histRef.current = [];
    layout();
  };

  const blocked = (a: Arrow) => {
    for (const r of a.ray) {
      for (const b of arrowsRef.current) {
        if (b !== a && b.st === "idle" && b.c.some((c) => c[0] === r[0] && c[1] === r[1])) {
          return true;
        }
      }
    }
    return false;
  };

  const startLevel = (targetLvl?: number) => {
    const chosenLvl = targetLvl !== undefined ? targetLvl : lvlRef.current;
    lvlRef.current = chosenLvl;
    setLvl(chosenLvl);

    missRef.current = 0;
    setMiss(0);

    const h = Math.max(1, 3 - Math.floor((chosenLvl - 1) / 4));
    hintsRef.current = h;
    setHints(h);

    const u = Math.max(1, 2 - Math.floor((chosenLvl - 1) / 6));
    undosRef.current = u;
    setUndos(u);

    comboRef.current = 1;
    setCombo(1);

    tmRef.current = 0;
    gen();

    setMode("play");
    modeRef.current = "play";
  };

  const handleWin = () => {
    setMode("win");
    modeRef.current = "win";

    const curLvl = lvlRef.current;
    const m = missRef.current;
    const st = m === 0 ? 3 : m <= 2 ? 2 : 1;

    const newStars = { ...starsRef.current };
    if (st > (newStars[curLvl] || 0)) {
      newStars[curLvl] = st;
      starsRef.current = newStars;
      setStars(newStars);
    }

    let newUnlocked = unlockedRef.current;
    if (curLvl >= newUnlocked && curLvl < 10) {
      newUnlocked = curLvl + 1;
      unlockedRef.current = newUnlocked;
      setUnlocked(newUnlocked);
    }

    saveProg(newUnlocked, newStars);
    saveHS(scoreRef.current);

    const starsStr = "★".repeat(st) + "☆".repeat(3 - st);
    const tmMin = Math.floor(tmRef.current / 60);
    const tmSec = String(Math.floor(tmRef.current % 60)).padStart(2, "0");
    const tStr = `${tmMin}:${tmSec}`;

    if (curLvl >= 10) {
      setWinTitle("All 10 Levels Cleared! 🏆");
      setWinSub(`${starsStr}\nFinal Score: ${scoreRef.current} · Total Time: ${tStr}`);
      setFinalScore(scoreRef.current);
      setShowSubmitModal(true);
    } else {
      setWinTitle(`Level ${curLvl} Cleared! 🎉`);
      setWinSub(`${starsStr}\nScore: ${scoreRef.current} · Time: ${tStr} · ${m} ${m === 1 ? "mistake" : "mistakes"}`);
      setFinalScore(scoreRef.current);
    }

    tone(523, 0.15, "triangle", 0.1);
    tone(659, 0.15, "triangle", 0.1, 0.12);
    tone(784, 0.3, "triangle", 0.1, 0.24);
  };

  const useHint = () => {
    if (modeRef.current !== "play" || hintsRef.current <= 0) return;
    const a = arrowsRef.current.find((ar) => ar.st === "idle" && !blocked(ar));
    if (a) {
      a.hint = 1.6;
      hintsRef.current--;
      setHints(hintsRef.current);
      tone(600, 0.15, "sine", 0.08);
    }
  };

  const useUndo = () => {
    if (modeRef.current !== "play" || undosRef.current <= 0 || !histRef.current.length) return;
    const a = histRef.current.pop();
    if (!a) return;
    a.st = "idle";
    a.off = 0;
    scoreRef.current = Math.max(0, scoreRef.current - a.pts);
    setScore(scoreRef.current);
    comboRef.current = 1;
    setCombo(1);
    undosRef.current--;
    setUndos(undosRef.current);
    tone(330, 0.1, "triangle", 0.07);
  };

  // Canvas interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (modeRef.current !== "play" || showSubmitModal) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const { ox, oy, cs } = dimRef.current;
    const x = Math.floor((e.clientX - r.left - ox) / cs);
    const y = Math.floor((e.clientY - r.top - oy) / cs);

    const a = arrowsRef.current.find((ar) => ar.st === "idle" && ar.c.some((c) => c[0] === x && c[1] === y));
    if (!a) return;

    if (blocked(a)) {
      a.sh = 0.4;
      missRef.current++;
      setMiss(missRef.current);
      comboRef.current = 1;
      setCombo(1);
      tone(130, 0.18, "sawtooth", 0.09);
      if (navigator.vibrate) navigator.vibrate(70);
    } else {
      a.st = "out";
      a.pts = 10 * comboRef.current;
      scoreRef.current += a.pts;
      setScore(scoreRef.current);
      histRef.current.push(a);
      tone(440 + comboRef.current * 70, 0.1, "triangle", 0.09);
      comboRef.current = Math.min(comboRef.current + 1, 5);
      setCombo(comboRef.current);
    }
  };

  // Main Render Loop
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;

    let animId = 0;
    let last = performance.now();

    const resize = () => {
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimRef.current.W = W;
      dimRef.current.H = H;
      layout();
    };

    resize();
    window.addEventListener("resize", resize);

    const gp = (a: Arrow, f: number) => {
      const { ox, oy, cs } = dimRef.current;
      const i = Math.floor(f);
      const t = f - i;
      const p = a.P[i];
      const q = a.P[Math.min(i + 1, a.P.length - 1)];
      return [(p[0] + (q[0] - p[0]) * t + 0.5) * cs + ox, (p[1] + (q[1] - p[1]) * t + 0.5) * cs + oy];
    };

    const drawA = (a: Arrow, ink: string, _bd: string) => {
      const { cs } = dimRef.current;
      const f0 = a.off;
      const f1 = a.off + a.m - 1;
      const pts = [gp(a, f0)];
      for (let i = Math.floor(f0) + 1; i <= Math.floor(f1); i++) pts.push(gp(a, i));
      if (f1 % 1) pts.push(gp(a, f1));
      const E = pts[pts.length - 1];
      const d = a.dir;
      const px = -d[1];
      const py = d[0];
      if (pts.length === 1) pts.unshift([E[0] - d[0] * cs * 0.35, E[1] - d[1] * cs * 0.35]);

      g.save();
      if (a.sh > 0) g.translate(Math.sin(a.sh * 60) * cs * 0.08, 0);
      g.lineCap = g.lineJoin = "round";
      const path = () => {
        g.beginPath();
        pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
      };
      const col = a.sh > 0 ? "#ef4444" : ink;
      if (a.hint > 0) {
        g.globalAlpha = 0.25 + 0.2 * Math.sin(a.hint * 14);
        g.strokeStyle = "#f59e0b";
        g.lineWidth = cs * 0.62;
        path();
        g.stroke();
        g.globalAlpha = 1;
      }
      g.strokeStyle = col;
      g.lineWidth = cs * 0.12;
      path();
      g.stroke();

      g.beginPath();
      g.moveTo(E[0] + d[0] * cs * 0.34, E[1] + d[1] * cs * 0.34);
      g.lineTo(E[0] + px * cs * 0.22, E[1] + py * cs * 0.22);
      g.lineTo(E[0] - px * cs * 0.22, E[1] - py * cs * 0.22);
      g.closePath();
      g.fillStyle = col;
      g.fill();
      g.restore();
    };

    const draw = () => {
      const { W, H, S, ox, oy, cs } = dimRef.current;
      const isDark = invRef.current;
      const bd = isDark ? "#0f172a" : "#f8fafc";
      const ink = isDark ? "#f8fafc" : "#1e293b";
      const dot = isDark ? "#334155" : "#cbd5e1";

      g.clearRect(0, 0, W, H);
      g.fillStyle = bd;
      g.beginPath();
      g.roundRect ? g.roundRect(ox - 6, oy - 6, S + 12, S + 12, 16) : g.rect(ox - 6, oy - 6, S + 12, S + 12);
      g.fill();

      // Grid Dots
      g.fillStyle = dot;
      const n = nRef.current;
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          g.beginPath();
          g.arc(ox + (x + 0.5) * cs, oy + (y + 0.5) * cs, Math.max(2, cs * 0.05), 0, Math.PI * 2);
          g.fill();
        }
      }

      // Draw Arrows
      for (const a of arrowsRef.current) {
        if (a.st !== "gone") drawA(a, ink, bd);
      }
    };

    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000 || 0, 0.05);
      last = t;

      if (modeRef.current === "play") {
        tmRef.current += dt;
        const left = arrowsRef.current.filter((a) => a.st === "idle").length;
        const tmMin = Math.floor(tmRef.current / 60);
        const tmSec = String(Math.floor(tmRef.current % 60)).padStart(2, "0");
        setInfoText(`${left} left · x${comboRef.current} combo · ${tmMin}:${tmSec}`);

        for (const a of arrowsRef.current) {
          if (a.sh > 0) a.sh = Math.max(0, a.sh - dt);
          if (a.hint > 0) a.hint = Math.max(0, a.hint - dt);
          if (a.st === "out") {
            a.off += dt * 18;
            if (a.off >= a.out) a.st = "gone";
          }
        }

        if (arrowsRef.current.length && arrowsRef.current.every((a) => a.st === "gone")) {
          handleWin();
        }
      }

      draw();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={`relative w-full max-w-xl mx-auto flex flex-col items-center select-none font-sans rounded-3xl p-4 transition-colors duration-200 border-2 ${
          inv ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-100 text-slate-800 shadow-xl"
        }`}
      >
        {/* Top HUD */}
        <div className="w-full flex items-center justify-between px-2 mb-2 font-bold text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 rounded-xl font-extrabold text-xs sm:text-sm">
              Level {lvl}/10
            </span>
            {miss > 0 && (
              <span className="text-xs text-rose-500 font-bold">
                {miss} {miss > 1 ? "mistakes" : "mistake"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs sm:text-sm font-black">
              Score: <span className="text-indigo-600 font-black">{score}</span>
            </div>
          </div>
        </div>

        {/* Live Info Line */}
        <div className="text-xs font-semibold text-slate-400 mb-2 min-h-[18px]">
          {mode === "play" ? infoText : "Tap unblocked arrows to clear the board!"}
        </div>

        {/* Canvas Game Board Container */}
        <div className="relative w-full aspect-square max-h-[500px] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            className="w-full h-full block cursor-pointer touch-none rounded-2xl"
          />

          {/* Overlays */}
          {mode === "ready" && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white z-20">
              <h2 className="text-3xl sm:text-4xl font-black mb-2 text-white">Arrow Escape</h2>
              <p className="text-xs sm:text-sm text-slate-200 max-w-xs mb-6 leading-relaxed">
                Tap an arrow to slide it off the board. If another arrow blocks it, you make a mistake. Clear all 10
                levels!
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    scoreRef.current = 0;
                    setScore(0);
                    startLevel(1);
                  }}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" /> Play Now
                </button>
                <button
                  type="button"
                  onClick={() => setMode("levelselect")}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm border border-slate-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Grid className="w-4 h-4" /> Levels
                </button>
              </div>
            </div>
          )}

          {mode === "levelselect" && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white z-20">
              <h3 className="text-xl font-black mb-3">Choose Level</h3>
              <div className="grid grid-cols-5 gap-2.5 w-full max-w-[320px] mb-4">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((i) => {
                  const isOk = i <= unlocked;
                  const st = stars[i] || 0;
                  return (
                    <button
                      key={i}
                      disabled={!isOk}
                      onClick={() => {
                        scoreRef.current = 0;
                        setScore(0);
                        startLevel(i);
                      }}
                      className={`p-2.5 rounded-xl font-black text-sm flex flex-col items-center justify-center transition-all ${
                        isOk
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95"
                          : "bg-slate-800/60 text-slate-500 border border-slate-700/50 cursor-not-allowed"
                      }`}
                    >
                      <span>{isOk ? i : "🔒"}</span>
                      {isOk && (
                        <span className="text-[10px] text-amber-300 leading-none mt-0.5">
                          {"★".repeat(st)}
                          {"☆".repeat(3 - st)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setMode("ready")}
                className="text-xs text-slate-400 font-bold hover:text-white underline"
              >
                Back to Menu
              </button>
            </div>
          )}

          {mode === "win" && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white z-20 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-2xl sm:text-3xl font-black mb-2 text-emerald-400">{winTitle}</h3>
              <p className="text-xs sm:text-sm text-slate-200 mb-6 whitespace-pre-line font-medium">{winSub}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {lvl < 10 ? (
                  <button
                    type="button"
                    onClick={() => startLevel(lvl + 1)}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    Next Level
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      scoreRef.current = 0;
                      setScore(0);
                      startLevel(1);
                    }}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    Play Again
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFinalScore(scoreRef.current);
                    setShowSubmitModal(true);
                  }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4 text-amber-300" /> Save Score
                </button>
                <button
                  type="button"
                  onClick={() => setMode("levelselect")}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs border border-slate-700"
                >
                  Levels
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="w-full flex items-center justify-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={useHint}
            disabled={mode !== "play" || hints <= 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 disabled:opacity-40 hover:bg-amber-500/20 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" /> Hint ({hints})
          </button>
          <button
            type="button"
            onClick={useUndo}
            disabled={mode !== "play" || undos <= 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-500/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Undo ({undos})
          </button>
          <button
            type="button"
            onClick={() => setSndOn(!sndOn)}
            className="p-2 rounded-xl text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20 transition-colors"
            title="Toggle Sound"
          >
            {sndOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setInv(!inv)}
            className="p-2 rounded-xl text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20 transition-colors"
            title="Toggle Dark Mode"
          >
            {inv ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setMode("levelselect")}
            className="p-2 rounded-xl text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-300 hover:bg-slate-500/20 transition-colors"
            title="Select Level"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={finalScore || score}
        gameId="arrowescape"
        onClose={() => setShowSubmitModal(false)}
      />
    </>
  );
}
