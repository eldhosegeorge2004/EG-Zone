/* eslint-disable */
"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, RotateCcw, Trophy } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

interface Block {
  x: number;
  w: number;
}

interface Debris {
  x: number;
  w: number;
  lvl: number;
  off: number;
  vy: number;
}

const PALETTE = ["#ff5a5f", "#ffc233", "#22c493", "#3b82f6", "#a855f7"];
function getColor(lvl: number): string {
  return PALETTE[lvl % PALETTE.length];
}

export default function ToppleGame() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameState, setGameState] = useState<"ready" | "play" | "dead">("ready");
  const [muted, setMuted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);

  // Game state mutable refs for 60fps loop
  const modeRef = useRef<"ready" | "play" | "dead">("ready");
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const stackRef = useRef<Block[]>([]);
  const curRef = useRef<{ w: number; x: number; dir: number }>({ w: 100, x: 0, dir: 1 });
  const speedRef = useRef(230);
  const camRef = useRef(0);
  const debrisRef = useRef<Debris[]>([]);
  const streakRef = useRef(0);
  const toastRef = useRef("");
  const toastTRef = useRef(0);
  const deadAtRef = useRef(0);
  const rafIdRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);

  // Sound synthesis
  const beep = (freq: number, duration: number) => {
    if (mutedRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  const buzz = (ms: number) => {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {}
    }
  };

  // Load high score
  useEffect(() => {
    try {
      const b = parseInt(localStorage.getItem("topple_best") || "0");
      bestRef.current = b;
      setBestScore(b);
    } catch {}
  }, []);

  const spawnBlock = (w: number) => {
    const stack = stackRef.current;
    const top = stack[stack.length - 1];
    const isLeft = stack.length % 2 === 1;
    speedRef.current = Math.min(230 + scoreRef.current * 7, 540);
    curRef.current = {
      w: top.w,
      x: isLeft ? 0 : w - top.w,
      dir: isLeft ? 1 : -1,
    };
  };

  const startGame = () => {
    const cv = canvasRef.current;
    const w = cv ? cv.width / (window.devicePixelRatio || 1) : 400;
    const bw = Math.min(w * 0.6, 240);

    stackRef.current = [{ x: (w - bw) / 2, w: bw }];
    scoreRef.current = 0;
    debrisRef.current = [];
    camRef.current = 0;
    streakRef.current = 0;
    toastTRef.current = 0;

    modeRef.current = "play";
    setGameState("play");
    setScore(0);
    spawnBlock(w);
  };

  const handleDie = () => {
    modeRef.current = "dead";
    deadAtRef.current = performance.now();
    beep(120, 0.35);
    buzz(180);

    if (scoreRef.current > bestRef.current) {
      bestRef.current = scoreRef.current;
      setBestScore(scoreRef.current);
      try {
        localStorage.setItem("topple_best", String(scoreRef.current));
      } catch {}
    }
    if (scoreRef.current > 0) {
      setShowSubmitModal(true);
    }
    setGameState("dead");
  };

  const placeBlock = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const w = cv.width / (window.devicePixelRatio || 1);

    const stack = stackRef.current;
    const cur = curRef.current;
    const top = stack[stack.length - 1];
    const lvl = stack.length;

    const l = Math.max(cur.x, top.x);
    const r = Math.min(cur.x + cur.w, top.x + top.w);
    const overlap = r - l;

    if (overlap <= 0) {
      debrisRef.current.push({ x: cur.x, w: cur.w, lvl, off: 0, vy: 0 });
      handleDie();
      return;
    }

    let nx = l;
    let nw = overlap;

    if (Math.abs(cur.x - top.x) < 7) {
      nx = top.x;
      nw = top.w;
      streakRef.current += 1;
      beep(660 + streakRef.current * 50, 0.2);
      toastRef.current =
        streakRef.current > 1 ? `Perfect x${streakRef.current}!` : "Perfect!";
      toastTRef.current = 1;
    } else {
      streakRef.current = 0;
      beep(300, 0.1);
      if (cur.x < top.x) {
        debrisRef.current.push({
          x: cur.x,
          w: top.x - cur.x,
          lvl,
          off: 0,
          vy: 0,
        });
      } else {
        debrisRef.current.push({
          x: r,
          w: cur.x + cur.w - r,
          lvl,
          off: 0,
          vy: 0,
        });
      }
    }

    stack.push({ x: nx, w: nw });
    scoreRef.current += 1;
    setScore(scoreRef.current);
    spawnBlock(w);
  };

  const handleAction = () => {
    if (modeRef.current === "ready") {
      startGame();
    } else if (modeRef.current === "dead") {
      if (performance.now() - deadAtRef.current > 400) {
        startGame();
      }
    } else {
      placeBlock();
    }
  };

  // Main canvas animation loop
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let animW = 0;
    let animH = 0;
    const BH = 32;

    const resize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = containerRef.current.getBoundingClientRect();
      animW = rect.width;
      animH = rect.height;
      cv.width = animW * dpr;
      cv.height = animH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const roundRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };

    const drawBlock = (x: number, y: number, w: number, lvl: number) => {
      const h = BH - 2;
      ctx.fillStyle = "rgba(27,37,89,0.22)";
      roundRect(x, y + 4, w, h, 8);
      ctx.fill();

      ctx.fillStyle = getColor(lvl);
      roundRect(x, y, w, h - 3, 8);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.35)";
      roundRect(x + 4, y + 2, Math.max(0, w - 8), 4, 2);
      ctx.fill();
    };

    const getStackY = (i: number) => {
      return animH * 0.74 - (i - camRef.current) * BH - BH;
    };

    const updatePhysics = (dt: number) => {
      if (modeRef.current === "play") {
        const cur = curRef.current;
        cur.x += cur.dir * speedRef.current * dt;
        if (cur.x <= 0) {
          cur.x = 0;
          cur.dir = 1;
        }
        if (cur.x + cur.w >= animW) {
          cur.x = animW - cur.w;
          cur.dir = -1;
        }
      }

      const camTarget = Math.max(0, stackRef.current.length - 4);
      camRef.current += (camTarget - camRef.current) * Math.min(1, dt * 4);

      debrisRef.current.forEach((d) => {
        d.vy += 1600 * dt;
        d.off += d.vy * dt;
      });
      debrisRef.current = debrisRef.current.filter((d) => d.off < animH);
      toastTRef.current = Math.max(0, toastTRef.current - dt * 1.5);
    };

    const renderFrame = () => {
      const hue = (175 + scoreRef.current * 6) % 360;
      const grad = ctx.createLinearGradient(0, 0, 0, animH);
      grad.addColorStop(0, `hsl(${hue}, 75%, 93%)`);
      grad.addColorStop(1, `hsl(${(hue + 40) % 360}, 70%, 84%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, animW, animH);

      if (modeRef.current === "ready") return;

      // Base shadow line
      ctx.fillStyle = "rgba(27,37,89,0.12)";
      ctx.fillRect(0, getStackY(0) + BH - 2, animW, animH);

      // Stack
      const stack = stackRef.current;
      for (let i = 0; i < stack.length; i++) {
        drawBlock(stack[i].x, getStackY(i), stack[i].w, i);
      }

      // Sliding Current Block
      if (modeRef.current === "play") {
        const cur = curRef.current;
        drawBlock(cur.x, getStackY(stack.length), cur.w, stack.length);
      }

      // Falling Debris
      debrisRef.current.forEach((d) => {
        ctx.globalAlpha = 0.9;
        drawBlock(d.x, getStackY(d.lvl) + d.off, d.w, d.lvl);
        ctx.globalAlpha = 1;
      });

      // Perfect combo Toast
      if (toastTRef.current > 0) {
        ctx.globalAlpha = Math.min(1, toastTRef.current);
        ctx.fillStyle = "#1b2559";
        ctx.font = '800 24px system-ui, -apple-system, "Segoe UI", sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(
          toastRef.current,
          animW / 2,
          animH * 0.22 - (1 - toastTRef.current) * 16
        );
        ctx.globalAlpha = 1;
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - (prevTimeRef.current || now)) / 1000);
      prevTimeRef.current = now;

      if (!document.hidden && modeRef.current !== "ready") {
        updatePhysics(dt);
      }
      renderFrame();
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    // Keyboard space
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nm = !mutedRef.current;
    mutedRef.current = nm;
    setMuted(nm);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleAction}
      className="relative w-full h-[min(68vh,520px)] max-h-[calc(100vh-140px)] min-h-[400px] overflow-hidden rounded-2xl border-4 border-slate-200 shadow-2xl cursor-pointer select-none bg-sky-50"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Floating HUD: Score and Mute */}
      <div className="absolute top-3 inset-x-0 flex items-center justify-between px-4 pointer-events-none z-10">
        <div className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight drop-shadow-sm">
          {score}
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm border border-white/60">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Best: {bestScore}
          </div>
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 border border-white/60 shadow-sm transition-all"
            title="Toggle Sound"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Ready Overlay */}
      {gameState === "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-sky-100/85 backdrop-blur-sm z-20">
          <h2 className="text-4xl sm:text-5xl font-black text-rose-500 mb-2 tracking-tight">
            Topple
          </h2>
          <p className="text-slate-700 font-medium text-sm sm:text-base max-w-xs mb-6">
            Tap to drop the sliding block. Only the part that lands on the tower stays, so line it up well!
          </p>
          <div className="px-6 py-2.5 bg-rose-500 text-white font-bold rounded-full text-sm sm:text-base shadow-lg animate-bounce">
            Tap or Space to Start
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === "dead" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/80 backdrop-blur-sm z-20 text-white">
          <div className="text-sm font-semibold uppercase tracking-wider text-rose-400 mb-1">
            Tower Toppled!
          </div>
          <div className="text-5xl sm:text-6xl font-black mb-2">{score}</div>
          <div className="text-slate-300 text-sm font-medium mb-6">
            Best Record: <span className="text-amber-400 font-bold">{bestScore}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); resetGame(); }}
              className="px-6 py-2.5 bg-rose-500 text-white font-bold rounded-full text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Play Again
            </button>
            {score > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowSubmitModal(true); }}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-full text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4 text-amber-300" /> Save Score
              </button>
            )}
          </div>
        </div>
      )}

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={score}
        gameId="topple"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
