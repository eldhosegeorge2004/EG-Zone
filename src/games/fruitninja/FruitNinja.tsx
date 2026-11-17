/* eslint-disable */
"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  radius: number;
}

interface FruitHalf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  innerColor: string;
  angle: number;
  angularVel: number;
  life: number;
  side: "left" | "right";
}

interface Fruit {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  innerColor: string;
  type: "watermelon" | "apple" | "orange" | "banana" | "bomb";
  sliced: boolean;
  missed: boolean;
  rotation: number;
  rotationSpeed: number;
}

interface SliceTrail {
  x: number;
  y: number;
  time: number;
}

const BASE_W = 480;
const BASE_H = 640;

const FRUIT_TYPES = [
  { type: "watermelon" as const, color: "#22c55e", innerColor: "#ef4444", weight: 3 },
  { type: "apple" as const, color: "#ef4444", innerColor: "#fecaca", weight: 3 },
  { type: "orange" as const, color: "#f97316", innerColor: "#fde68a", weight: 3 },
  { type: "banana" as const, color: "#eab308", innerColor: "#fefce8", weight: 2 },
  { type: "bomb" as const, color: "#1f2937", innerColor: "#6b7280", weight: 1 },
];

export default function FruitNinja() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    fruits: [] as Fruit[],
    particles: [] as Particle[],
    halves: [] as FruitHalf[],
    sliceTrail: [] as SliceTrail[],
    score: 0,
    highScore: 0,
    lives: 3,
    combo: 0,
    comboTimer: 0,
    gameOver: false,
    running: false,
    frameId: 0,
    lastTime: 0,
    spawnTimer: 0,
    spawnInterval: 1500,
    difficulty: 1,
    difficultyTimer: 0,
    nextId: 0,
    isSlicing: false,
    lastMouse: { x: -1, y: -1 },
    currentMouse: { x: -1, y: -1 },
  });
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {}
    }
    return audioCtxRef.current;
  };

  const playSound = (type: "slice" | "bomb" | "miss") => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === "slice") {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "bomb") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {}
  };

  const spawnFruit = useCallback(() => {
    const gs = gameStateRef.current;
    // Pick random fruit type with weights
    const totalWeight = FRUIT_TYPES.reduce((s, f) => s + f.weight, 0);
    let rand = Math.random() * totalWeight;
    let picked = FRUIT_TYPES[0];
    for (const ft of FRUIT_TYPES) {
      rand -= ft.weight;
      if (rand <= 0) { picked = ft; break; }
    }

    const x = BASE_W * 0.1 + Math.random() * BASE_W * 0.8;
    const speedMult = 1 + (gs.difficulty - 1) * 0.15;
    const vy = -(9 + Math.random() * 4) * speedMult;
    const vx = (Math.random() - 0.5) * 3;
    const radius = picked.type === "banana" ? 20 : picked.type === "watermelon" ? 32 : 24;

    gs.fruits.push({
      id: gs.nextId++,
      x,
      y: BASE_H + radius,
      vx,
      vy,
      radius,
      color: picked.color,
      innerColor: picked.innerColor,
      type: picked.type,
      sliced: false,
      missed: false,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
    });
  }, []);

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    const gs = gameStateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      gs.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        color,
        life: 1,
        maxLife: 0.5 + Math.random() * 0.5,
        radius: 2 + Math.random() * 4,
      });
    }
  };

  const sliceFruit = (fruit: Fruit) => {
    const gs = gameStateRef.current;
    fruit.sliced = true;
    if (fruit.type === "bomb") {
      playSound("bomb");
      spawnParticles(fruit.x, fruit.y, "#6b7280", 20);
      gs.gameOver = true;
      return;
    }

    playSound("slice");
    gs.combo++;
    gs.comboTimer = 1.5;
    const pts = fruit.type === "watermelon" ? 3 : 1;
    gs.score += pts * Math.max(1, gs.combo);
    if (gs.score > gs.highScore) gs.highScore = gs.score;

    spawnParticles(fruit.x, fruit.y, fruit.innerColor, 15);
    spawnParticles(fruit.x, fruit.y, fruit.color, 8);

    // spawn halves
    for (const side of ["left", "right"] as const) {
      gs.halves.push({
        x: fruit.x, y: fruit.y,
        vx: fruit.vx + (side === "left" ? -2 : 2),
        vy: fruit.vy * 0.5,
        radius: fruit.radius,
        color: fruit.color,
        innerColor: fruit.innerColor,
        angle: fruit.rotation,
        angularVel: (side === "left" ? -0.1 : 0.1),
        life: 1,
        side,
      });
    }
  };

  const drawFruit = (ctx: CanvasRenderingContext2D, fruit: Fruit) => {
    ctx.save();
    ctx.translate(fruit.x, fruit.y);
    ctx.rotate(fruit.rotation);

    if (fruit.type === "bomb") {
      // Black circle with fuse
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#1f2937";
      ctx.fill();
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Fuse
      ctx.beginPath();
      ctx.moveTo(0, -fruit.radius);
      ctx.quadraticCurveTo(8, -fruit.radius - 10, 4, -fruit.radius - 18);
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Spark
      ctx.beginPath();
      ctx.arc(4, -fruit.radius - 18, 3, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${Date.now() * 0.5 % 360}, 100%, 60%)`;
      ctx.fill();
      // Skull
      ctx.fillStyle = "#6b7280";
      ctx.font = `${fruit.radius}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💣", 0, 2);
    } else if (fruit.type === "watermelon") {
      // Green outer
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#16a34a";
      ctx.fill();
      // Stripes
      ctx.fillStyle = "#166534";
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 6);
        ctx.fillRect(-2, -fruit.radius, 4, fruit.radius);
        ctx.restore();
      }
      // Red inner
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius * 0.75, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      // Seeds
      ctx.fillStyle = "#1c1917";
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI * 2) / 4;
        ctx.beginPath();
        ctx.ellipse(Math.cos(angle) * 8, Math.sin(angle) * 8, 2, 4, angle, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (fruit.type === "apple") {
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#dc2626";
      ctx.fill();
      // Shine
      ctx.beginPath();
      ctx.ellipse(-6, -8, 5, 8, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fill();
      // Stem
      ctx.beginPath();
      ctx.moveTo(0, -fruit.radius);
      ctx.lineTo(3, -fruit.radius - 8);
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (fruit.type === "orange") {
      ctx.beginPath();
      ctx.arc(0, 0, fruit.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#f97316";
      ctx.fill();
      // Texture lines
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos((i * Math.PI * 2) / 6) * fruit.radius, Math.sin((i * Math.PI * 2) / 6) * fruit.radius);
        ctx.stroke();
      }
    } else if (fruit.type === "banana") {
      // Banana shape using arc
      ctx.beginPath();
      ctx.ellipse(0, 0, fruit.radius * 1.5, fruit.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#eab308";
      ctx.fill();
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Tip marks
      ctx.fillStyle = "#713f12";
      ctx.beginPath();
      ctx.ellipse(-fruit.radius * 1.4, 0, 3, 5, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const drawHalf = (ctx: CanvasRenderingContext2D, half: FruitHalf) => {
    ctx.save();
    ctx.translate(half.x, half.y);
    ctx.rotate(half.angle);
    ctx.globalAlpha = half.life;

    ctx.beginPath();
    if (half.side === "left") {
      ctx.arc(0, 0, half.radius, Math.PI / 2, (3 * Math.PI) / 2);
    } else {
      ctx.arc(0, 0, half.radius, (3 * Math.PI) / 2, Math.PI / 2);
    }
    ctx.closePath();
    ctx.fillStyle = half.color;
    ctx.fill();

    // inner cut
    ctx.beginPath();
    if (half.side === "left") {
      ctx.arc(0, 0, half.radius * 0.7, Math.PI / 2, (3 * Math.PI) / 2);
    } else {
      ctx.arc(0, 0, half.radius * 0.7, (3 * Math.PI) / 2, Math.PI / 2);
    }
    ctx.closePath();
    ctx.fillStyle = half.innerColor;
    ctx.fill();

    ctx.restore();
  };

  const checkSlice = (x1: number, y1: number, x2: number, y2: number) => {
    const gs = gameStateRef.current;
    for (const fruit of gs.fruits) {
      if (fruit.sliced || fruit.missed) continue;
      // Line-circle intersection check
      const dx = x2 - x1;
      const dy = y2 - y1;
      const fx = x1 - fruit.x;
      const fy = y1 - fruit.y;
      const a = dx * dx + dy * dy;
      if (a === 0) continue;
      const b = 2 * (fx * dx + fy * dy);
      const c = fx * fx + fy * fy - fruit.radius * fruit.radius;
      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        sliceFruit(fruit);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gs = gameStateRef.current;
    gs.highScore = parseInt(localStorage.getItem("fruitninja_high") || "0");

    const ctx = canvas.getContext("2d")!;
    const GRAVITY = 0.25;

    const startGame = () => {
      gs.fruits = [];
      gs.particles = [];
      gs.halves = [];
      gs.sliceTrail = [];
      gs.score = 0;
      gs.lives = 3;
      gs.combo = 0;
      gs.comboTimer = 0;
      gs.gameOver = false;
      gs.running = true;
      gs.spawnTimer = 0;
      gs.spawnInterval = 1500;
      gs.difficulty = 1;
      gs.difficultyTimer = 0;
      gs.nextId = 0;
    };

    const update = (dt: number) => {
      if (!gs.running || gs.gameOver) return;

      gs.spawnTimer += dt * 1000;
      gs.difficultyTimer += dt;

      if (gs.difficultyTimer > 15) {
        gs.difficultyTimer = 0;
        gs.difficulty = Math.min(gs.difficulty + 1, 8);
        gs.spawnInterval = Math.max(600, 1500 - gs.difficulty * 100);
      }

      if (gs.spawnTimer >= gs.spawnInterval) {
        gs.spawnTimer = 0;
        spawnFruit();
        if (gs.difficulty >= 3 && Math.random() < 0.4) spawnFruit();
      }

      // combo decay
      if (gs.comboTimer > 0) {
        gs.comboTimer -= dt;
        if (gs.comboTimer <= 0) gs.combo = 0;
      }

      // Update fruits
      for (const fruit of gs.fruits) {
        if (fruit.sliced) continue;
        fruit.vy += GRAVITY;
        fruit.x += fruit.vx;
        fruit.y += fruit.vy;
        fruit.rotation += fruit.rotationSpeed;

        if (fruit.y > BASE_H + fruit.radius * 2 && !fruit.missed && !fruit.sliced) {
          fruit.missed = true;
          if (fruit.type !== "bomb") {
            gs.lives--;
            playSound("miss");
            gs.combo = 0;
            gs.comboTimer = 0;
            if (gs.lives <= 0) gs.gameOver = true;
          }
        }
      }
      gs.fruits = gs.fruits.filter(f => f.y < BASE_H + 100);

      // Update halves
      for (const h of gs.halves) {
        h.vy += GRAVITY;
        h.x += h.vx;
        h.y += h.vy;
        h.angle += h.angularVel;
        h.life -= dt * 1.5;
      }
      gs.halves = gs.halves.filter(h => h.life > 0 && h.y < BASE_H + 100);

      // Update particles
      for (const p of gs.particles) {
        p.vx *= 0.98;
        p.vy += 0.1;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt / p.maxLife;
      }
      gs.particles = gs.particles.filter(p => p.life > 0);

      // Trim slice trail
      const now = Date.now();
      gs.sliceTrail = gs.sliceTrail.filter(pt => now - pt.time < 150);

      if (gs.gameOver && gs.score > gs.highScore) {
        gs.highScore = gs.score;
        localStorage.setItem("fruitninja_high", String(gs.highScore));
      }
    };

    const draw = () => {
      // Background
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, BASE_W, BASE_H);

      // Background deco
      ctx.fillStyle = "rgba(255,100,50,0.03)";
      ctx.fillRect(0, 0, BASE_W, BASE_H);

      // Draw halves
      for (const h of gs.halves) drawHalf(ctx, h);

      // Draw fruits
      for (const f of gs.fruits) {
        if (!f.sliced && !f.missed) drawFruit(ctx, f);
      }

      // Draw particles
      for (const p of gs.particles) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw slice trail
      if (gs.sliceTrail.length > 1) {
        ctx.save();
        for (let i = 1; i < gs.sliceTrail.length; i++) {
          const a = gs.sliceTrail[i - 1];
          const b = gs.sliceTrail[i];
          const age = (Date.now() - b.time) / 150;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - age})`;
          ctx.lineWidth = 3 * (1 - age);
          ctx.lineCap = "round";
          ctx.stroke();
        }
        ctx.restore();
      }

      // HUD
      ctx.fillStyle = "white";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`${gs.score}`, 16, 40);

      ctx.font = "14px Arial";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`Best: ${gs.highScore}`, 16, 60);

      // Lives
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i < gs.lives ? "#ef4444" : "#374151";
        ctx.beginPath();
        const hx = BASE_W - 24 - i * 28;
        const hy = 24;
        ctx.arc(hx, hy, 10, 0, Math.PI * 2);
        ctx.fill();
        if (i < gs.lives) {
          ctx.fillStyle = "white";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText("❤", hx, hy + 4);
        }
      }

      // Combo
      if (gs.combo >= 2) {
        ctx.save();
        const alpha = Math.min(1, gs.comboTimer);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#fbbf24";
        ctx.font = `bold ${28 + gs.combo * 2}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(`${gs.combo}x COMBO!`, BASE_W / 2, BASE_H / 2 - 40);
        ctx.restore();
      }

      if (gs.gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, BASE_W, BASE_H);
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", BASE_W / 2, BASE_H / 2 - 60);
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.fillText(`Score: ${gs.score}`, BASE_W / 2, BASE_H / 2);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "24px Arial";
        ctx.fillText(`Best: ${gs.highScore}`, BASE_W / 2, BASE_H / 2 + 40);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "20px Arial";
        ctx.fillText("Click to play again", BASE_W / 2, BASE_H / 2 + 90);
      } else if (!gs.running) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, BASE_W, BASE_H);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 42px Arial";
        ctx.textAlign = "center";
        ctx.fillText("FRUIT NINJA", BASE_W / 2, BASE_H / 2 - 60);
        ctx.fillStyle = "white";
        ctx.font = "22px Arial";
        ctx.fillText("Swipe to slice fruits!", BASE_W / 2, BASE_H / 2);
        ctx.fillStyle = "#ef4444";
        ctx.font = "18px Arial";
        ctx.fillText("Avoid the bombs! 💣", BASE_W / 2, BASE_H / 2 + 36);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "20px Arial";
        ctx.fillText("Click to start", BASE_W / 2, BASE_H / 2 + 90);
      }
    };

    let lastTime = 0;
    const loop = (ts: number) => {
      const dt = Math.min((ts - lastTime) / 1000, 0.05);
      lastTime = ts;
      update(dt);
      draw();
      gs.frameId = requestAnimationFrame(loop);
    };

    gs.frameId = requestAnimationFrame(loop);

    // Input - scale mouse coords to canvas logical space
    const getPos = (e: MouseEvent | Touch, rect: DOMRect) => {
      const scaleX = BASE_W / rect.width;
      const scaleY = BASE_H / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const pos = getPos(e, rect);
      if (gs.gameOver || !gs.running) {
        startGame();
        return;
      }
      gs.isSlicing = true;
      gs.lastMouse = pos;
      gs.currentMouse = pos;
      gs.sliceTrail = [{ ...pos, time: Date.now() }];
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!gs.isSlicing || gs.gameOver) return;
      const rect = canvas.getBoundingClientRect();
      const pos = getPos(e, rect);
      gs.lastMouse = gs.currentMouse;
      gs.currentMouse = pos;
      gs.sliceTrail.push({ ...pos, time: Date.now() });
      checkSlice(gs.lastMouse.x, gs.lastMouse.y, gs.currentMouse.x, gs.currentMouse.y);
    };

    const onMouseUp = () => { gs.isSlicing = false; };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      const pos = getPos(t, rect);
      if (gs.gameOver || !gs.running) {
        startGame();
        return;
      }
      gs.isSlicing = true;
      gs.lastMouse = pos;
      gs.currentMouse = pos;
      gs.sliceTrail = [{ ...pos, time: Date.now() }];
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!gs.isSlicing || gs.gameOver) return;
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      const pos = getPos(t, rect);
      gs.lastMouse = gs.currentMouse;
      gs.currentMouse = pos;
      gs.sliceTrail.push({ ...pos, time: Date.now() });
      checkSlice(gs.lastMouse.x, gs.lastMouse.y, gs.currentMouse.x, gs.currentMouse.y);
    };

    const onTouchEnd = (e: TouchEvent) => { e.preventDefault(); gs.isSlicing = false; };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      cancelAnimationFrame(gs.frameId);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [spawnFruit]);

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
        Fruit Ninja
      </h1>
      <div className="w-full max-w-sm mx-auto" style={{ aspectRatio: "480/640" }}>
        <canvas
          ref={canvasRef}
          width={BASE_W}
          height={BASE_H}
          className="w-full h-full rounded-2xl shadow-2xl cursor-crosshair select-none"
          style={{ touchAction: "none", display: "block" }}
        />
      </div>
    </div>
  );
}
