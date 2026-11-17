/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function StackTower() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);

  const CANVAS_W = 400;
  const CANVAS_H = 600;
  const PLATFORM_H = 24;
  const STACK_BOTTOM = CANVAS_H - 40;

  type Platform = { x: number; w: number; color: string };

  const COLORS = [
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#ec4899", // pink
    "#f43f5e", // rose
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
  ];

  const state = useRef({
    playing: false,
    dead: false,
    stack: [] as Platform[],
    mover: { x: 0, w: 240, dir: 1, speed: 3 },
    moverY: 0,
    scrollOffset: 0,
    score: 0,
    level: 1,
    colorIndex: 0,
    perfectCount: 0,
    flashTimer: 0,
    flashMsg: "",
    cameraY: 0,
  });

  const audioCtx = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: "drop" | "perfect" | "gameover") => {
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === "drop") {
        const baseFreq = 200 + (state.current.stack.length * 15);
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "perfect") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch {}
  }, []);

  const getColor = useCallback((idx: number) => COLORS[idx % COLORS.length], []);

  const initGame = useCallback(() => {
    const s = state.current;
    const baseW = 200;
    s.stack = [{ x: (CANVAS_W - baseW) / 2, w: baseW, color: COLORS[0] }];
    s.mover = { x: 0, w: baseW, dir: 1, speed: 3 };
    s.moverY = STACK_BOTTOM - PLATFORM_H * 2;
    s.scrollOffset = 0;
    s.score = 0;
    s.level = 1;
    s.colorIndex = 1;
    s.perfectCount = 0;
    s.flashTimer = 0;
    s.flashMsg = "";
    s.cameraY = 0;
    s.playing = true;
    s.dead = false;
    setScore(0);
    setLevel(1);
    setGameState("playing");
  }, []);

  const drop = useCallback(() => {
    const s = state.current;
    if (!s.playing || s.dead) return;

    const top = s.stack[s.stack.length - 1];
    const mx = s.mover.x;
    const mw = s.mover.w;

    // Overlap
    const overlapStart = Math.max(top.x, mx);
    const overlapEnd = Math.min(top.x + top.w, mx + mw);
    const overlapW = overlapEnd - overlapStart;

    if (overlapW <= 0) {
      // Missed completely
      s.dead = true;
      s.playing = false;
      playSound("gameover");
      const hs = parseInt(localStorage.getItem("stack_highscore") || "0");
      if (s.score > hs) {
        localStorage.setItem("stack_highscore", String(s.score));
        setHighScore(s.score);
      }
      setGameState("dead");
      return;
    }

    const PERFECT_THRESHOLD = 4;
    const isPerfect = overlapW >= mw - PERFECT_THRESHOLD;

    let newX: number;
    let newW: number;

    if (isPerfect) {
      newX = top.x;
      newW = top.w;
      s.perfectCount++;
      s.flashMsg = s.perfectCount >= 3 ? "🔥 PERFECT STREAK!" : "✨ PERFECT!";
      s.flashTimer = 60;
      playSound("perfect");
    } else {
      newX = overlapStart;
      newW = overlapW;
      s.perfectCount = 0;
      playSound("drop");
    }

    // Add to stack
    const newColor = getColor(s.colorIndex++);
    s.stack.push({ x: newX, w: newW, color: newColor });

    s.score++;
    setScore(s.score);
    setLevel(Math.floor(s.score / 5) + 1);
    s.level = Math.floor(s.score / 5) + 1;

    // Camera scroll: shift everything down visually (camera moves up)
    s.cameraY += PLATFORM_H + 4;

    // New mover at top - starts above the new top platform
    s.moverY -= PLATFORM_H + 4;
    s.mover.w = newW;
    // Speed increases with level
    s.mover.speed = 3 + s.level * 0.4;
    s.mover.x = s.mover.dir > 0 ? -s.mover.w : CANVAS_W;
  }, [getColor, playSound]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = state.current;

    const loop = () => {
      // Update mover
      if (s.playing && !s.dead) {
        s.mover.x += s.mover.dir * s.mover.speed;
        if (s.mover.x + s.mover.w > CANVAS_W) {
          s.mover.x = CANVAS_W - s.mover.w;
          s.mover.dir = -1;
        }
        if (s.mover.x < 0) {
          s.mover.x = 0;
          s.mover.dir = 1;
        }
        if (s.flashTimer > 0) s.flashTimer--;
      }

      // Draw background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      grad.addColorStop(0, "#0a0e1a");
      grad.addColorStop(1, "#0d1b2a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Draw grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let gy = 0; gy < CANVAS_H; gy += 30) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(CANVAS_W, gy);
        ctx.stroke();
      }

      // Camera offset: stack grows upward, camera shifts
      const camOffset = s.cameraY;

      // Draw stack
      for (let i = 0; i < s.stack.length; i++) {
        const p = s.stack[i];
        const py = STACK_BOTTOM - i * (PLATFORM_H + 4) + camOffset;
        if (py > CANVAS_H + PLATFORM_H || py < -PLATFORM_H) continue;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.roundRect(p.x + 4, py + 4, p.w, PLATFORM_H, 6);
        ctx.fill();

        // Platform
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(p.x, py, p.w, PLATFORM_H, 6);
        ctx.fill();

        // Shine
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.beginPath();
        ctx.roundRect(p.x + 4, py + 3, p.w - 8, 6, 3);
        ctx.fill();
      }

      // Draw mover
      if (s.playing && !s.dead) {
        const moverScreenY = STACK_BOTTOM - s.stack.length * (PLATFORM_H + 4) + camOffset;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.roundRect(s.mover.x + 4, moverScreenY + 4, s.mover.w, PLATFORM_H, 6);
        ctx.fill();

        const moverColor = getColor(s.colorIndex);
        ctx.fillStyle = moverColor;
        ctx.beginPath();
        ctx.roundRect(s.mover.x, moverScreenY, s.mover.w, PLATFORM_H, 6);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.roundRect(s.mover.x + 4, moverScreenY + 3, s.mover.w - 8, 6, 3);
        ctx.fill();

        // Guide line
        const topP = s.stack[s.stack.length - 1];
        const topY = STACK_BOTTOM - (s.stack.length - 1) * (PLATFORM_H + 4) + camOffset;
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(topP.x, topY);
        ctx.lineTo(topP.x, moverScreenY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(topP.x + topP.w, topY);
        ctx.lineTo(topP.x + topP.w, moverScreenY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, CANVAS_W, 50);

      ctx.fillStyle = "#fff";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${s.score}`, 16, 32);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(`Best: ${Math.max(parseInt(localStorage.getItem("stack_highscore") || "0"), s.score)}`, CANVAS_W - 16, 32);

      // Level badge
      ctx.fillStyle = "rgba(6,182,212,0.3)";
      ctx.beginPath();
      ctx.roundRect(CANVAS_W / 2 - 35, 10, 70, 28, 14);
      ctx.fill();
      ctx.fillStyle = "#67e8f9";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`LVL ${s.level}`, CANVAS_W / 2, 29);

      // Flash message
      if (s.flashTimer > 0) {
        const alpha = Math.min(1, s.flashTimer / 20);
        ctx.fillStyle = `rgba(255,255,100,${alpha})`;
        ctx.font = "bold 22px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(s.flashMsg, CANVAS_W / 2, CANVAS_H / 2 - 40);
      }

      // Idle / Game Over screens
      if (!s.playing && !s.dead) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#67e8f9";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("STACK TOWER", CANVAS_W / 2, CANVAS_H / 2 - 30);
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "16px sans-serif";
        ctx.fillText("Tap or Click to Start", CANVAS_W / 2, CANVAS_H / 2 + 20);
      }

      if (s.dead) {
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        ctx.fillStyle = "#f87171";
        ctx.font = "bold 34px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", CANVAS_W / 2, CANVAS_H / 2 - 50);

        ctx.fillStyle = "#e2e8f0";
        ctx.font = "20px sans-serif";
        ctx.fillText(`Score: ${s.score}`, CANVAS_W / 2, CANVAS_H / 2 - 10);

        const hs = parseInt(localStorage.getItem("stack_highscore") || "0");
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`Best: ${hs}`, CANVAS_W / 2, CANVAS_H / 2 + 25);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "15px sans-serif";
        ctx.fillText("Tap or Click to Restart", CANVAS_W / 2, CANVAS_H / 2 + 65);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [getColor]);

  useEffect(() => {
    const hs = parseInt(localStorage.getItem("stack_highscore") || "0");
    setHighScore(hs);
  }, []);

  const handleAction = useCallback(() => {
    const s = state.current;
    if (!s.playing && !s.dead) {
      initGame();
    } else if (s.dead) {
      initGame();
    } else {
      drop();
    }
  }, [initGame, drop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowDown" || e.code === "Enter") {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAction]);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="flex justify-between w-full max-w-sm px-2">
        <div className="text-cyan-400 font-mono text-sm">Score: <span className="text-white font-bold">{score}</span></div>
        <div className="text-cyan-400 font-mono text-sm">Level: <span className="text-cyan-300 font-bold">{level}</span></div>
        <div className="text-cyan-400 font-mono text-sm">Best: <span className="text-yellow-400 font-bold">{Math.max(highScore, score)}</span></div>
      </div>
      <div className="relative rounded-xl overflow-hidden border-2 border-cyan-700 shadow-2xl shadow-cyan-900/50">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block cursor-pointer"
          style={{ maxHeight: "75vh", width: "auto" }}
          onClick={handleAction}
          onTouchStart={(e) => { e.preventDefault(); handleAction(); }}
        />
      </div>
      <div className="text-slate-500 text-xs text-center">
        <span className="hidden sm:inline">SPACE / ENTER / Click to drop · Stack perfectly for bonus!</span>
        <span className="sm:hidden">Tap to drop the platform!</span>
      </div>
    </div>
  );
}
