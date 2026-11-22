/* eslint-disable */
"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, RotateCcw, Trophy } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

interface Anchor {
  x: number;
  y: number;
  by: number;
  amp: number;
  spd: number;
  pulse: number;
}

interface Pickup {
  x: number;
  y: number;
  got: boolean;
}

interface StarParticle {
  x: number;
  y: number;
  s: number;
  z: number;
}

export default function SwingGame() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameState, setGameState] = useState<"ready" | "play" | "dead">("ready");
  const [muted, setMuted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);

  // Mutable refs for high-performance physics
  const modeRef = useRef<"ready" | "orbit" | "fly" | "dead">("ready");
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const anchorsRef = useRef<Anchor[]>([]);
  const pickupsRef = useRef<Pickup[]>([]);
  const pRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const curAnchorRef = useRef<Anchor | null>(null);
  const lastAnchorRef = useRef<Anchor | null>(null);
  const rRef = useRef(90);
  const thRef = useRef(Math.PI);
  const dirRef = useRef(1);
  const speedRef = useRef(240);
  const camRef = useRef(0);
  const maxdRef = useRef(0);
  const bonusRef = useRef(0);
  const comboRef = useRef(0);
  const shakeRef = useRef(0);
  const toastRef = useRef("");
  const toastTRef = useRef(0);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const deadAtRef = useRef(0);
  const starsRef = useRef<StarParticle[]>([]);
  const rafIdRef = useRef<number>(0);
  const prevTimeRef = useRef<number>(0);

  const G = 260;

  // Sound synthesis
  const beep = (freq: number, duration: number, type: OscillatorType = "sine") => {
    if (mutedRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
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

  const flashToast = (text: string) => {
    toastRef.current = text;
    toastTRef.current = 1;
  };

  // Load high score
  useEffect(() => {
    try {
      const b = parseInt(localStorage.getItem("swing_best") || "0");
      bestRef.current = b;
      setBestScore(b);
    } catch {}
  }, []);

  const addAnchor = (animH: number) => {
    const anchors = anchorsRef.current;
    const last = anchors[anchors.length - 1];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    const y = Math.max(animH * 0.22, Math.min(animH * 0.72, last.by + rnd(-90, 130)));
    const x = last.x + rnd(140, 210);

    anchors.push({
      x,
      y,
      by: y,
      amp: scoreRef.current > 120 && Math.random() < 0.6 ? Math.min(40, (scoreRef.current - 120) * 0.2) : 0,
      spd: rnd(0.8, 1.6),
      pulse: Math.random() * 6,
    });

    if (Math.random() < 0.7) {
      pickupsRef.current.push({
        x: (last.x + x) / 2,
        y: animH * rnd(0.2, 0.75),
        got: false,
      });
    }
  };

  const resetGame = (animW: number, animH: number) => {
    scoreRef.current = 0;
    maxdRef.current = 0;
    bonusRef.current = 0;
    comboRef.current = 0;
    shakeRef.current = 0;
    pickupsRef.current = [];
    trailRef.current = [];

    const firstAnchor = {
      x: animW * 0.3,
      y: animH * 0.42,
      by: animH * 0.42,
      amp: 0,
      spd: 1,
      pulse: 0,
    };
    anchorsRef.current = [firstAnchor];
    while (anchorsRef.current.length < 8) {
      addAnchor(animH);
    }

    curAnchorRef.current = firstAnchor;
    lastAnchorRef.current = null;
    rRef.current = 90;
    thRef.current = Math.PI;
    dirRef.current = 1;
    speedRef.current = 240;
    modeRef.current = "orbit";

    pRef.current = {
      x: firstAnchor.x + rRef.current * Math.cos(thRef.current),
      y: firstAnchor.y + rRef.current * Math.sin(thRef.current),
      vx: 0,
      vy: 0,
    };

    camRef.current = pRef.current.x - animW * 0.3;
    setScore(0);
    setGameState("play");
  };

  const releaseHook = () => {
    if (modeRef.current !== "orbit") return;
    const th = thRef.current;
    const dir = dirRef.current;
    const speed = speedRef.current;

    const tx = -Math.sin(th) * dir;
    const ty = Math.cos(th) * dir;

    pRef.current.vx = tx * speed;
    pRef.current.vy = ty * speed;
    lastAnchorRef.current = curAnchorRef.current;
    curAnchorRef.current = null;
    modeRef.current = "fly";
    beep(280, 0.08, "triangle");
  };

  const handleDie = () => {
    modeRef.current = "dead";
    deadAtRef.current = performance.now();
    shakeRef.current = 1;
    buzz(200);
    beep(110, 0.4, "sawtooth");

    if (scoreRef.current > bestRef.current) {
      bestRef.current = scoreRef.current;
      setBestScore(scoreRef.current);
      try {
        localStorage.setItem("swing_best", String(scoreRef.current));
      } catch {}
    }
    if (scoreRef.current > 0) {
      setShowSubmitModal(true);
    }
    setGameState("dead");
  };

  const handleAction = () => {
    const cv = canvasRef.current;
    const w = cv ? cv.width / (window.devicePixelRatio || 1) : 400;
    const h = cv ? cv.height / (window.devicePixelRatio || 1) : 400;

    if (modeRef.current === "ready") {
      resetGame(w, h);
    } else if (modeRef.current === "dead") {
      if (performance.now() - deadAtRef.current > 400) {
        resetGame(w, h);
      }
    } else {
      releaseHook();
    }
  };

  // Main canvas loop
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let animW = 0;
    let animH = 0;

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

    const updatePhysics = (dt: number) => {
      const REACH = Math.max(68, 80 - scoreRef.current * 0.03);
      const nowSec = performance.now() / 1000;

      // Animate vertical floating anchors
      anchorsRef.current.forEach((a) => {
        if (a.amp) {
          a.y = a.by + Math.sin(nowSec * a.spd + a.pulse) * a.amp;
        }
      });

      const p = pRef.current;

      if (modeRef.current === "orbit") {
        const cur = curAnchorRef.current;
        if (cur) {
          thRef.current += (dirRef.current * speedRef.current) / rRef.current * dt;
          p.x = cur.x + rRef.current * Math.cos(thRef.current);
          p.y = cur.y + rRef.current * Math.sin(thRef.current);
        }
      } else if (modeRef.current === "fly") {
        p.vy += G * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Check anchor hook radius
        const anchors = anchorsRef.current;
        for (let i = 0; i < anchors.length; i++) {
          const a = anchors[i];
          if (a === lastAnchorRef.current) continue;
          const dx = p.x - a.x;
          const dy = p.y - a.y;
          const d = Math.hypot(dx, dy);

          if (d < REACH) {
            curAnchorRef.current = a;
            rRef.current = Math.max(d, 45);
            thRef.current = Math.atan2(dy, dx);
            dirRef.current = dx * p.vy - dy * p.vx >= 0 ? 1 : -1;
            speedRef.current = Math.max(260, Math.min(Math.hypot(p.vx, p.vy), 420));
            modeRef.current = "orbit";

            if (d < 30) {
              comboRef.current += 1;
              bonusRef.current += comboRef.current * 3;
              beep(520 + comboRef.current * 60, 0.25, "triangle");
              flashToast(`Perfect x${comboRef.current}!`);
            } else {
              comboRef.current = 0;
              beep(300, 0.15, "triangle");
            }
            break;
          }
        }

        if (p.y > animH + 60 || p.y < -120 || p.x < camRef.current - 60) {
          handleDie();
          return;
        }
      }

      if (modeRef.current === "dead") return;

      // Pickups collision
      pickupsRef.current.forEach((s) => {
        if (!s.got && Math.hypot(p.x - s.x, p.y - s.y) < 26) {
          s.got = true;
          bonusRef.current += 5;
          beep(880, 0.12);
          buzz(10);
          flashToast("+5 Gem!");
        }
      });

      toastTRef.current = Math.max(0, toastTRef.current - dt * 1.5);
      while (pickupsRef.current.length && pickupsRef.current[0].x < camRef.current - 200) {
        pickupsRef.current.shift();
      }

      if (speedRef.current < 420 && modeRef.current === "orbit") {
        speedRef.current += 3 * dt;
      }

      trailRef.current.push({ x: p.x, y: p.y });
      if (trailRef.current.length > 26) trailRef.current.shift();

      maxdRef.current = Math.max(maxdRef.current, Math.floor(Math.max(0, p.x - animW * 0.3) / 10));
      const s = maxdRef.current + bonusRef.current;
      if (s !== scoreRef.current) {
        scoreRef.current = s;
        setScore(s);
      }

      camRef.current += (p.x - animW * 0.3 - camRef.current) * Math.min(1, dt * 5);

      // Add forward anchors
      const anchors = anchorsRef.current;
      while (anchors[anchors.length - 1].x < camRef.current + animW + 300) {
        addAnchor(animH);
      }
      while (anchors.length > 3 && anchors[1].x < camRef.current - 200) {
        anchors.shift();
      }
    };

    const renderFrame = (now: number) => {
      ctx.clearRect(0, 0, animW, animH);

      // Night sky gradient
      const g = ctx.createLinearGradient(0, 0, 0, animH);
      g.addColorStop(0, "#14123a");
      g.addColorStop(1, "#2d1a5c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, animW, animH);

      // Parallax Stars
      if (starsRef.current.length === 0) {
        const arr: StarParticle[] = [];
        for (let i = 0; i < 60; i++) {
          arr.push({
            x: Math.random() * 1200,
            y: Math.random() * animH,
            s: 0.6 + Math.random() * 1.2,
            z: 0.1 + Math.random() * 0.3,
          });
        }
        starsRef.current = arr;
      }

      ctx.fillStyle = "rgba(233,230,255,0.55)";
      starsRef.current.forEach((s) => {
        const x = (((s.x - camRef.current * s.z) % 1200) + 1200) % 1200;
        ctx.fillRect(x % (animW + 20), s.y, s.s, s.s);
      });

      // Fireflies
      ctx.fillStyle = "rgba(255,210,63,0.7)";
      for (let q = 0; q < 12; q++) {
        const fx =
          (((q * 173 - camRef.current * 0.6 + Math.sin(now / 1500 + q) * 20) %
            (animW + 40)) +
            (animW + 40)) %
          (animW + 40);
        const fy =
          ((q * 97) % animH) * 0.8 + animH * 0.1 + Math.sin(now / 900 + q * 2) * 14;
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, 7);
        ctx.fill();
      }

      if (anchorsRef.current.length === 0 || modeRef.current === "ready") return;

      ctx.save();
      const shakeX = (Math.random() - 0.5) * shakeRef.current * 14;
      const shakeY = (Math.random() - 0.5) * shakeRef.current * 14;
      ctx.translate(-camRef.current + shakeX, shakeY);

      // Draw Anchors (Lanterns)
      const REACH = Math.max(68, 80 - scoreRef.current * 0.03);
      anchorsRef.current.forEach((a) => {
        const isNear = a === curAnchorRef.current;
        const pr = 14 + Math.sin(now / 400 + a.pulse) * 2;

        const rg = ctx.createRadialGradient(a.x, a.y, 2, a.x, a.y, REACH);
        rg.addColorStop(0, isNear ? "rgba(255,210,63,0.35)" : "rgba(255,210,63,0.16)");
        rg.addColorStop(1, "rgba(255,210,63,0)");
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(a.x, a.y, REACH, 0, 7);
        ctx.fill();

        ctx.fillStyle = "#ffd23f";
        ctx.beginPath();
        ctx.arc(a.x, a.y, pr, 0, 7);
        ctx.fill();

        ctx.fillStyle = "#fff6c9";
        ctx.beginPath();
        ctx.arc(a.x, a.y, pr * 0.45, 0, 7);
        ctx.fill();
      });

      // Draw Gem Pickups
      pickupsRef.current.forEach((s) => {
        if (s.got) return;
        const y = s.y + Math.sin(now / 300 + s.x) * 4;
        ctx.fillStyle = "#ff5d8f";
        ctx.beginPath();
        ctx.moveTo(s.x, y - 12);
        ctx.lineTo(s.x + 9, y);
        ctx.lineTo(s.x, y + 12);
        ctx.lineTo(s.x - 9, y);
        ctx.closePath();
        ctx.fill();
      });

      // Swing Tether Rope
      const p = pRef.current;
      if (modeRef.current === "orbit" && curAnchorRef.current) {
        ctx.strokeStyle = "rgba(61,219,176,0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(curAnchorRef.current.x, curAnchorRef.current.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      // Trail
      const trail = trailRef.current;
      for (let i = 0; i < trail.length; i++) {
        const k = i / trail.length;
        ctx.fillStyle = `rgba(61,219,176,${k * 0.5})`;
        ctx.beginPath();
        ctx.arc(trail[i].x, trail[i].y, 2 + k * 7, 0, 7);
        ctx.fill();
      }

      // Player Ball
      if (modeRef.current !== "dead") {
        ctx.fillStyle = "#3ddbb0";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, 7);
        ctx.fill();
        ctx.fillStyle = "#14123a";
        ctx.beginPath();
        ctx.arc(p.x + 3, p.y - 2, 3, 0, 7);
        ctx.fill();
      }

      ctx.restore();

      // Toast Text
      if (toastTRef.current > 0) {
        ctx.globalAlpha = Math.min(1, toastTRef.current);
        ctx.fillStyle = "#3ddbb0";
        ctx.font = '700 24px system-ui, -apple-system, "Segoe UI", sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(
          toastRef.current,
          animW / 2,
          animH * 0.26 - (1 - toastTRef.current) * 16
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
      shakeRef.current *= 0.92;
      renderFrame(now);
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

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
      className="relative w-full h-[min(68vh,520px)] max-h-[calc(100vh-140px)] min-h-[400px] overflow-hidden rounded-2xl border-4 border-indigo-950 shadow-2xl cursor-pointer select-none bg-[#14123a]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Floating HUD */}
      <div className="absolute top-3 inset-x-0 flex items-center justify-between px-4 pointer-events-none z-10">
        <div className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight drop-shadow-md">
          {score}
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1 bg-indigo-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-300 shadow-sm border border-indigo-700/60">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best: {bestScore}
          </div>
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full bg-indigo-900/80 backdrop-blur-md hover:bg-indigo-800 text-slate-200 border border-indigo-700/60 shadow-sm transition-all"
            title="Toggle Sound"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Ready Overlay */}
      {gameState === "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#14123a]/85 backdrop-blur-sm z-20 text-white">
          <h2 className="text-4xl sm:text-5xl font-black text-emerald-400 mb-2 tracking-tight">
            Swing
          </h2>
          <p className="text-indigo-200 font-medium text-sm sm:text-base max-w-xs mb-6">
            Tap to let go. Grab glowing lanterns near their center for combo points and collect pink gems!
          </p>
          <div className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full text-sm sm:text-base shadow-lg animate-bounce">
            Tap or Space to Start
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameState === "dead" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/85 backdrop-blur-sm z-20 text-white">
          <div className="text-sm font-semibold uppercase tracking-wider text-rose-400 mb-1">
            Fell into the Void!
          </div>
          <div className="text-5xl sm:text-6xl font-black text-amber-400 mb-2">{score}</div>
          <div className="text-slate-300 text-sm font-medium mb-6">
            Best Distance: <span className="text-amber-400 font-bold">{bestScore}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); resetGame(); }}
              className="px-6 py-2.5 bg-rose-500 text-white font-bold rounded-full text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Try Again
            </button>
            {score > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowSubmitModal(true); }}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-full text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
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
        gameId="swing"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
