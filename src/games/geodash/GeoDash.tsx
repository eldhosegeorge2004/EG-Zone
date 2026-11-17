/* eslint-disable */
"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";

const W = 800;
const H = 450;
const GROUND_Y = 370;
const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const CUBE_SIZE = 36;

interface Obstacle {
  x: number;
  type: "spike" | "platform" | "doubleSpike" | "portal";
  y?: number;
  w?: number;
  h?: number;
}

const LEVEL_OBSTACLES: Obstacle[] = [
  { x: 600, type: "spike" },
  { x: 780, type: "spike" },
  { x: 960, type: "spike" },
  { x: 1100, type: "platform", y: GROUND_Y - 60, w: 80, h: 20 },
  { x: 1120, type: "spike" },
  { x: 1300, type: "doubleSpike" },
  { x: 1500, type: "portal" },
  { x: 1650, type: "spike" },
  { x: 1830, type: "spike" },
  { x: 2000, type: "platform", y: GROUND_Y - 80, w: 100, h: 20 },
  { x: 2050, type: "spike" },
  { x: 2200, type: "doubleSpike" },
  { x: 2400, type: "spike" },
  { x: 2550, type: "spike" },
  { x: 2700, type: "portal" },
  { x: 2900, type: "spike" },
  { x: 3000, type: "doubleSpike" },
  { x: 3200, type: "platform", y: GROUND_Y - 100, w: 120, h: 20 },
  { x: 3350, type: "spike" },
  { x: 3500, type: "spike" },
  { x: 3700, type: "doubleSpike" },
  { x: 3900, type: "portal" },
  { x: 4000, type: "spike" },
];

const LEVEL_LENGTH = 4300;

function playSound(ctx: AudioContext, type: "jump" | "die" | "win") {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "jump") {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === "die") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch {}
}

export default function GeoDash() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    x: 100,
    y: GROUND_Y - CUBE_SIZE,
    vy: 0,
    onGround: true,
    gravFlipped: false,
    alive: true,
    started: false,
    won: false,
    camX: 0,
    rotation: 0,
    jumpHeld: false,
    speed: 5,
    bgHue: 220,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    bestPct: 0,
  });
  const audioRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);
  const [bestPct, setBestPct] = useState(0);
  const [currentPct, setCurrentPct] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "dead" | "won">("idle");

  const getAudio = useCallback(() => {
    if (!audioRef.current) audioRef.current = new AudioContext();
    audioRef.current.resume().catch(() => {});
    return audioRef.current;
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string) => {
    const st = stateRef.current;
    for (let i = 0; i < 12; i++) {
      st.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1,
        color,
      });
    }
  }, []);

  const resetGame = useCallback(() => {
    const st = stateRef.current;
    st.x = 100;
    st.y = GROUND_Y - CUBE_SIZE;
    st.vy = 0;
    st.onGround = true;
    st.gravFlipped = false;
    st.alive = true;
    st.won = false;
    st.camX = 0;
    st.rotation = 0;
    st.speed = 5;
    st.bgHue = 220;
    st.particles = [];
    setGameState("playing");
    setCurrentPct(0);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("geodash_best");
    if (saved) {
      const v = parseInt(saved);
      stateRef.current.bestPct = v;
      setBestPct(v);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const drawSpike = (cx: CanvasRenderingContext2D, x: number, y: number, flipped = false) => {
      cx.save();
      cx.fillStyle = "#ff4444";
      cx.beginPath();
      if (!flipped) {
        cx.moveTo(x, y);
        cx.lineTo(x + 20, y);
        cx.lineTo(x + 10, y - 30);
      } else {
        cx.moveTo(x, y);
        cx.lineTo(x + 20, y);
        cx.lineTo(x + 10, y + 30);
      }
      cx.closePath();
      cx.fill();
      cx.restore();
    };

    const drawPortal = (cx: CanvasRenderingContext2D, x: number, camX: number, t: number) => {
      const sx = x - camX;
      cx.save();
      const grad = cx.createLinearGradient(sx, GROUND_Y - 100, sx, GROUND_Y);
      grad.addColorStop(0, `hsl(${(t * 2) % 360}, 100%, 60%)`);
      grad.addColorStop(1, `hsl(${(t * 2 + 180) % 360}, 100%, 40%)`);
      cx.fillStyle = grad;
      cx.fillRect(sx, GROUND_Y - 100, 30, 100);
      cx.strokeStyle = "white";
      cx.lineWidth = 2;
      cx.strokeRect(sx, GROUND_Y - 100, 30, 100);
      cx.fillStyle = "white";
      cx.font = "bold 10px sans-serif";
      cx.fillText("FLIP", sx + 2, GROUND_Y - 50);
      cx.restore();
    };

    const getObstaclesForCamera = (camX: number) => {
      return LEVEL_OBSTACLES.map(o => {
        // For looping: shift obstacles by LEVEL_LENGTH multiples
        return o;
      }).filter(o => o.x - camX > -100 && o.x - camX < W + 200);
    };

    let frame = 0;
    const loop = () => {
      frame++;
      const st = stateRef.current;

      if (!st.started || !st.alive || st.won) {
        // just redraw static frame
        ctx.fillStyle = `hsl(${st.bgHue}, 60%, 15%)`;
        ctx.fillRect(0, 0, W, H);
        // ground
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
        ctx.strokeStyle = "#00e5ff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(W, GROUND_Y);
        ctx.stroke();

        if (!st.started) {
          ctx.fillStyle = "rgba(0,0,0,0.5)";
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = "white";
          ctx.font = "bold 42px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("GEOMETRY DASH", W / 2, H / 2 - 60);
          ctx.font = "24px sans-serif";
          ctx.fillStyle = "#aaa";
          ctx.fillText("Press SPACE or tap to start", W / 2, H / 2);
          ctx.font = "18px sans-serif";
          ctx.fillText(`Best: ${st.bestPct}%`, W / 2, H / 2 + 40);
          ctx.textAlign = "left";
        }

        // draw cube
        ctx.save();
        ctx.translate(st.x + CUBE_SIZE / 2, st.y + CUBE_SIZE / 2);
        ctx.rotate((st.rotation * Math.PI) / 180);
        const cubeGrad = ctx.createLinearGradient(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE / 2, CUBE_SIZE / 2);
        cubeGrad.addColorStop(0, "#ffd700");
        cubeGrad.addColorStop(1, "#ff8c00");
        ctx.fillStyle = cubeGrad;
        ctx.fillRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
        // inner design
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-CUBE_SIZE / 2, -CUBE_SIZE / 2);
        ctx.lineTo(CUBE_SIZE / 2, CUBE_SIZE / 2);
        ctx.stroke();
        ctx.restore();

        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Physics
      const gDir = st.gravFlipped ? -1 : 1;
      st.vy += GRAVITY * gDir;
      st.y += st.vy;
      st.rotation += st.onGround ? 0 : (gDir * st.speed * 3);

      // Ground collision
      const groundY = st.gravFlipped ? 0 : GROUND_Y - CUBE_SIZE;
      const ceilY = st.gravFlipped ? GROUND_Y - CUBE_SIZE : 0;

      if (!st.gravFlipped && st.y >= GROUND_Y - CUBE_SIZE) {
        st.y = GROUND_Y - CUBE_SIZE;
        st.vy = 0;
        st.onGround = true;
      } else if (st.gravFlipped && st.y <= 0) {
        st.y = 0;
        st.vy = 0;
        st.onGround = true;
      } else {
        st.onGround = false;
      }

      // Camera
      st.camX = st.x - 150;
      if (st.camX < 0) st.camX = 0;

      // Speed increase
      st.speed = 5 + (st.camX / LEVEL_LENGTH) * 5;
      st.x += st.speed;
      st.bgHue = (st.bgHue + 0.3) % 360;

      // Percent
      const pct = Math.min(100, Math.floor((st.x / (LEVEL_LENGTH + 150)) * 100));
      setCurrentPct(pct);

      if (pct > st.bestPct) {
        st.bestPct = pct;
        localStorage.setItem("geodash_best", String(st.bestPct));
        setBestPct(st.bestPct);
      }

      // Win
      if (st.x >= LEVEL_LENGTH + 150) {
        st.won = true;
        st.alive = false;
        playSound(getAudio(), "win");
        setGameState("won");
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Obstacle collision
      const visObs = getObstaclesForCamera(st.camX);
      for (const obs of visObs) {
        const ox = obs.x - st.camX;
        const oy = obs.y !== undefined ? obs.y : GROUND_Y - CUBE_SIZE;

        if (obs.type === "spike" || obs.type === "doubleSpike") {
          // spike hitbox: triangle roughly 10px wide 25px tall
          const count = obs.type === "doubleSpike" ? 2 : 1;
          for (let si = 0; si < count; si++) {
            const sx2 = obs.x + si * 22;
            const sy2 = GROUND_Y;
            // Simple AABB with shrink
            if (st.x + CUBE_SIZE - 4 > sx2 + 2 && st.x + 4 < sx2 + 18 &&
                st.y + CUBE_SIZE - 4 > sy2 - 28 && st.y + 4 < sy2) {
              st.alive = false;
              spawnParticles(st.x + CUBE_SIZE / 2 - st.camX, st.y + CUBE_SIZE / 2, "#ffd700");
              playSound(getAudio(), "die");
              setGameState("dead");
            }
          }
        } else if (obs.type === "platform") {
          const pw = obs.w || 80;
          const ph = obs.h || 20;
          const py = obs.y!;
          if (st.x + CUBE_SIZE > obs.x && st.x < obs.x + pw &&
              st.y + CUBE_SIZE > py && st.y + CUBE_SIZE < py + ph + 10 && st.vy >= 0) {
            st.y = py - CUBE_SIZE;
            st.vy = 0;
            st.onGround = true;
          }
        } else if (obs.type === "portal") {
          if (st.x + CUBE_SIZE > obs.x && st.x < obs.x + 30 && !st.gravFlipped) {
            st.gravFlipped = true;
            st.vy = 0;
          } else if (st.x + CUBE_SIZE > obs.x && st.x < obs.x + 30 && st.gravFlipped) {
            // second portal resets
          }
        }
      }

      // Particles
      st.particles = st.particles.filter(p => p.life > 0);
      st.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.03;
      });

      // Draw
      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, `hsl(${st.bgHue}, 60%, 10%)`);
      bgGrad.addColorStop(1, `hsl(${(st.bgHue + 30) % 360}, 60%, 20%)`);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = `hsla(${st.bgHue}, 80%, 60%, 0.1)`;
      ctx.lineWidth = 1;
      for (let gx = (-(st.camX % 80)); gx < W; gx += 80) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 80) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // Ground
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00e5ff";
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Obstacles
      for (const obs of visObs) {
        const ox = obs.x - st.camX;
        if (obs.type === "spike" || obs.type === "doubleSpike") {
          const count = obs.type === "doubleSpike" ? 2 : 1;
          for (let si = 0; si < count; si++) {
            drawSpike(ctx, ox + si * 22, GROUND_Y, st.gravFlipped);
          }
        } else if (obs.type === "platform") {
          const pw = obs.w || 80;
          const ph = obs.h || 20;
          const platGrad = ctx.createLinearGradient(ox, obs.y!, ox, obs.y! + ph);
          platGrad.addColorStop(0, "#4488ff");
          platGrad.addColorStop(1, "#2244aa");
          ctx.fillStyle = platGrad;
          ctx.fillRect(ox, obs.y!, pw, ph);
          ctx.strokeStyle = "#88aaff";
          ctx.lineWidth = 1;
          ctx.strokeRect(ox, obs.y!, pw, ph);
        } else if (obs.type === "portal") {
          drawPortal(ctx, obs.x, st.camX, frame);
        }
      }

      // Cube
      ctx.save();
      ctx.translate(st.x - st.camX + CUBE_SIZE / 2, st.y + CUBE_SIZE / 2);
      ctx.rotate((st.rotation * Math.PI) / 180);
      const cubeGrad = ctx.createLinearGradient(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE / 2, CUBE_SIZE / 2);
      cubeGrad.addColorStop(0, "#ffd700");
      cubeGrad.addColorStop(1, "#ff8c00");
      ctx.fillStyle = cubeGrad;
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ffd700";
      ctx.fillRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-CUBE_SIZE / 2, -CUBE_SIZE / 2);
      ctx.lineTo(CUBE_SIZE / 2, CUBE_SIZE / 2);
      ctx.stroke();
      ctx.restore();

      // Particles
      st.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      });
      ctx.globalAlpha = 1;

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 0, W, 36);
      // Progress bar
      const pctNow = Math.min(100, Math.floor(((st.x) / (LEVEL_LENGTH + 150)) * 100));
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(10, 8, W - 20, 20);
      const barGrad = ctx.createLinearGradient(10, 0, W - 20, 0);
      barGrad.addColorStop(0, "#ffd700");
      barGrad.addColorStop(1, "#ff8c00");
      ctx.fillStyle = barGrad;
      ctx.fillRect(10, 8, Math.max(0, (W - 20) * pctNow / 100), 20);
      ctx.fillStyle = "white";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${pctNow}%`, W / 2, 23);
      ctx.textAlign = "left";

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [getAudio, spawnParticles]);

  const handleJump = useCallback(() => {
    const st = stateRef.current;
    const audio = getAudio();
    if (!st.started) {
      st.started = true;
      st.alive = true;
      setGameState("playing");
      return;
    }
    if (!st.alive) {
      resetGame();
      return;
    }
    if (st.onGround) {
      st.vy = st.gravFlipped ? Math.abs(JUMP_FORCE) : JUMP_FORCE;
      st.onGround = false;
      playSound(audio, "jump");
    }
  }, [getAudio, resetGame]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") { e.preventDefault(); handleJump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleJump]);

  const handleTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleJump();
  }, [handleJump]);

  const handleClick = useCallback(() => {
    handleJump();
  }, [handleJump]);

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gray-900 rounded-xl">
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
        Geometry Dash
      </h1>
      <div className="flex gap-6 text-sm text-gray-400">
        <span>Best: <span className="text-yellow-400 font-bold">{bestPct}%</span></span>
        <span>Progress: <span className="text-orange-400 font-bold">{currentPct}%</span></span>
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="rounded-lg cursor-pointer"
        style={{ maxWidth: "100%", touchAction: "none" }}
        onClick={handleClick}
        onTouchStart={handleTouch}
      />
      {gameState === "dead" && (
        <div className="text-center">
          <p className="text-red-400 font-bold text-lg">You died at {currentPct}%!</p>
          <p className="text-gray-400 text-sm">Press SPACE or tap to try again</p>
        </div>
      )}
      {gameState === "won" && (
        <div className="text-center">
          <p className="text-yellow-400 font-bold text-2xl">🏆 Level Complete!</p>
          <p className="text-gray-400">Press SPACE or tap to play again</p>
        </div>
      )}
      <p className="text-gray-500 text-xs">Press SPACE / Tap to jump • Navigate through obstacles</p>
    </div>
  );
}
