/* eslint-disable */
"use client";

import React, { useRef, useEffect } from "react";

const BASE_W = 800;
const BASE_H = 500;

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
  bounce: number;
}

interface Enemy {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  alive: boolean;
  platX: number;
  platW: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  radius: number;
}

export default function Platformer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch(e) {}
    }
    return audioCtxRef.current;
  };

  const playSound = (type: "jump" | "coin" | "land" | "die" | "enemyKill") => {
    try {
      const ctx = getAudioCtx(); if (!ctx) return; ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      if (type === "jump") {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
      } else if (type === "coin") {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.05);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
      } else if (type === "land") {
        osc.type = "square";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
      } else if (type === "die") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(300, ctx.currentTime + 0.05);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
      }
    } catch(e) {}
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const GRAVITY = 1200;
    const JUMP_FORCE = -520;
    const DOUBLE_JUMP_FORCE = -460;
    const MOVE_SPEED = 220;
    const PLATFORM_H = 16;
    const COIN_R = 8;
    const ENEMY_W = 32, ENEMY_H = 32;
    const GROUND_Y = BASE_H - 60;

    let cameraX = 0;
    let score = 0;
    let highScore = parseInt(localStorage.getItem("platform_high") || "0");
    let lives = 3;
    let coins = 0;
    let gameState: "start" | "playing" | "dead" | "over" = "start";
    let respawnTimer = 0;
    let frameId = 0;
    let distance = 0;
    let difficulty = 1;
    let lastPlatEnd = BASE_W;

    const player = { x: 100, y: GROUND_Y - 48, w: 28, h: 40, vx: 0, vy: 0, onGround: false, jumpsLeft: 2, wasOnGround: false, facing: 1, running: false, runFrame: 0, runTimer: 0, invincible: 0 };

    let platforms: Platform[] = [];
    let coinList: Coin[] = [];
    let enemies: Enemy[] = [];
    let particles: Particle[] = [];

    const keys: Record<string, boolean> = {};
    let jumpPressed = false;

    const PLATFORM_COLORS = ["#f97316", "#fb923c", "#fbbf24", "#f59e0b"];

    const makeGround = () => [
      { x: 0, y: GROUND_Y, w: 99999, h: 60, color: "#7c3aed" },
    ];

    const generatePlatforms = (fromX: number) => {
      let x = fromX;
      const platCount = 8 + Math.floor(difficulty * 2);
      for (let i = 0; i < platCount; i++) {
        const gap = 60 + Math.random() * (60 + difficulty * 20);
        x += gap;
        const y = GROUND_Y - 80 - Math.random() * 160;
        const w = 80 + Math.random() * 100;
        const color = PLATFORM_COLORS[Math.floor(Math.random() * PLATFORM_COLORS.length)];
        platforms.push({ x, y, w, h: PLATFORM_H, color });

        // Coins on platform
        const nCoins = 1 + Math.floor(Math.random() * 3);
        for (let c = 0; c < nCoins; c++) {
          coinList.push({ x: x + 10 + c * 24, y: y - 20, collected: false, bounce: Math.random() * Math.PI * 2 });
        }

        // Enemy on some platforms
        if (Math.random() < 0.35 && w > 100) {
          const eColor = `hsl(${Math.random() * 360}, 80%, 50%)`;
          enemies.push({ x: x + 20, y: y - ENEMY_H, w: ENEMY_W, h: ENEMY_H, vx: 60 + Math.random() * 40, alive: true, platX: x, platW: w, color: eColor });
        }
        x += w;
      }
      lastPlatEnd = x;
    };

    const startGame = () => {
      cameraX = 0;
      score = 0;
      lives = 3;
      coins = 0;
      distance = 0;
      difficulty = 1;
      player.x = 100; player.y = GROUND_Y - 48;
      player.vx = 0; player.vy = 0;
      player.onGround = false; player.jumpsLeft = 2;
      player.invincible = 0;
      platforms = makeGround();
      coinList = [];
      enemies = [];
      particles = [];
      lastPlatEnd = BASE_W;
      generatePlatforms(BASE_W * 0.3);
      gameState = "playing";
    };

    const spawnParticles = (x: number, y: number, color: string, n: number) => {
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2, life: 1, color, radius: 3 + Math.random() * 3 });
      }
    };

    const aabb = (ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) =>
      ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;

    const update = (dt: number) => {
      if (gameState !== "playing") return;

      player.invincible = Math.max(0, player.invincible - dt);
      player.runTimer += dt;
      if (player.runTimer > 0.12) { player.runTimer = 0; if (player.running) player.runFrame = (player.runFrame + 1) % 2; }

      // Movement
      const left = keys["ArrowLeft"] || keys["a"] || keys["A"];
      const right = keys["ArrowRight"] || keys["d"] || keys["D"];
      player.running = left || right;
      if (left) { player.vx = -MOVE_SPEED; player.facing = -1; }
      else if (right) { player.vx = MOVE_SPEED; player.facing = 1; }
      else player.vx = 0;

      // Jump
      const jumpKey = keys["ArrowUp"] || keys["w"] || keys["W"] || keys[" "];
      if (jumpKey && !jumpPressed && player.jumpsLeft > 0) {
        const force = player.jumpsLeft === 2 ? JUMP_FORCE : DOUBLE_JUMP_FORCE;
        player.vy = force;
        player.jumpsLeft--;
        jumpPressed = true;
        playSound("jump");
        spawnParticles(player.x + player.w / 2, player.y + player.h, "#fbbf24", 5);
      }
      if (!jumpKey) jumpPressed = false;

      // Gravity
      player.vy += GRAVITY * dt;
      player.y += player.vy * dt;
      player.x += player.vx * dt;

      // Platform collision
      player.wasOnGround = player.onGround;
      player.onGround = false;

      for (const p of platforms) {
        const prevBottom = player.y + player.h - player.vy * dt;
        if (player.vy >= 0 &&
          player.x + player.w > p.x && player.x < p.x + p.w &&
          player.y + player.h >= p.y && prevBottom <= p.y + p.h) {
          player.y = p.y - player.h;
          player.vy = 0;
          player.onGround = true;
          player.jumpsLeft = 2;
          if (!player.wasOnGround) playSound("land");
        }
      }

      // Fall off screen
      if (player.y > BASE_H + 100) {
        spawnParticles(player.x + player.w/2, BASE_H, "#ef4444", 15);
        playSound("die");
        lives--;
        if (lives <= 0) { gameState = "over"; if (score > highScore) { highScore = score; localStorage.setItem("platform_high", String(highScore)); } return; }
        player.x = cameraX + 100; player.y = GROUND_Y - 100;
        player.vy = 0; player.vx = 0; player.invincible = 2;
      }

      // Camera
      const targetCamX = player.x - BASE_W * 0.3;
      if (targetCamX > cameraX) {
        cameraX = targetCamX;
        distance = cameraX / 100;
        score = Math.floor(distance) + coins * 10;
        if (score > highScore) highScore = score;
        difficulty = 1 + Math.floor(distance / 50);
      }

      // Generate more platforms
      if (lastPlatEnd < cameraX + BASE_W + 500) {
        generatePlatforms(lastPlatEnd);
      }

      // Cleanup far platforms
      platforms = platforms.filter(p => p.x + p.w > cameraX - 200 || p.w > 1000);
      coinList = coinList.filter(c => c.x > cameraX - 200);
      enemies = enemies.filter(e => e.x > cameraX - 200);

      // Coin collection
      for (const c of coinList) {
        if (c.collected) continue;
        c.bounce += dt * 3;
        if (aabb(player.x, player.y, player.w, player.h, c.x - COIN_R, c.y - COIN_R, COIN_R * 2, COIN_R * 2)) {
          c.collected = true;
          coins++;
          score = Math.floor(distance) + coins * 10;
          playSound("coin");
          spawnParticles(c.x, c.y, "#fbbf24", 8);
        }
      }

      // Enemies
      for (const e of enemies) {
        if (!e.alive) continue;
        e.x += e.vx * dt;
        if (e.x < e.platX || e.x + e.w > e.platX + e.platW) e.vx *= -1;

        if (!player.invincible) {
          // Player stomps enemy
          if (aabb(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
            if (player.vy > 0 && player.y + player.h < e.y + e.h * 0.6) {
              e.alive = false;
              player.vy = -300;
              score += 50;
              spawnParticles(e.x + e.w/2, e.y + e.h/2, e.color, 12);
              playSound("enemyKill");
            } else {
              // Player hit
              spawnParticles(player.x + player.w/2, player.y + player.h/2, "#ef4444", 10);
              playSound("die");
              lives--;
              player.invincible = 2;
              if (lives <= 0) { gameState = "over"; if (score > highScore) { highScore = score; localStorage.setItem("platform_high", String(highScore)); } return; }
            }
          }
        }
      }

      // particles
      for (const p of particles) {
        p.x += p.vx * 60 * dt; p.y += p.vy * 60 * dt;
        p.vy += 0.1; p.life -= dt * 2;
      }
      particles = particles.filter(p => p.life > 0);
    };

    const drawPlayer = () => {
      if (player.invincible > 0 && Math.floor(player.invincible * 10) % 2 === 0) return;
      const px = player.x - cameraX, py = player.y;
      const f = player.facing;
      ctx.save();
      ctx.translate(px + player.w / 2, py + player.h / 2);
      ctx.scale(f, 1);

      // Body
      ctx.fillStyle = "#f97316";
      ctx.fillRect(-player.w/2, -player.h/2, player.w, player.h);
      // Head
      ctx.fillStyle = "#fdba74";
      ctx.fillRect(-player.w/2 + 2, -player.h/2 - 16, player.w - 4, 20);
      // Eye
      ctx.fillStyle = "black";
      ctx.fillRect(player.w/2 - 10, -player.h/2 - 10, 5, 5);
      // Mouth
      ctx.fillRect(player.w/2 - 12, -player.h/2 - 2, 8, 2);
      // Legs
      const legOff = player.running ? (player.runFrame === 0 ? 4 : -4) : 0;
      ctx.fillStyle = "#7c3aed";
      ctx.fillRect(-player.w/2, player.h/2 - 4, player.w/2 - 2, 10 + legOff);
      ctx.fillRect(2, player.h/2 - 4, player.w/2 - 2, 10 - legOff);
      // Arms
      ctx.fillStyle = "#f97316";
      ctx.fillRect(-player.w/2 - 6, -player.h/2 + 4, 8, player.h*0.4 + legOff);
      ctx.fillRect(player.w/2 - 2, -player.h/2 + 4, 8, player.h*0.4 - legOff);
      ctx.restore();
    };

    const drawEnemy = (e: Enemy) => {
      const ex = e.x - cameraX;
      ctx.fillStyle = e.color;
      // Bot body
      ctx.fillRect(ex, e.y, e.w, e.h);
      ctx.fillStyle = "black";
      ctx.fillRect(ex + 4, e.y + 6, 8, 8);
      ctx.fillRect(ex + e.w - 12, e.y + 6, 8, 8);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(ex + 6, e.y + 18, 4, 4);
      ctx.fillRect(ex + e.w - 10, e.y + 18, 4, 4);
      // Feet
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(ex + 2, e.y + e.h, 10, 6);
      ctx.fillRect(ex + e.w - 12, e.y + e.h, 10, 6);
    };

    const draw = () => {
      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, BASE_H);
      sky.addColorStop(0, "#1e1b4b");
      sky.addColorStop(1, "#312e81");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, BASE_W, BASE_H);

      // Background elements (parallax)
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      for (let i = 0; i < 50; i++) {
        const sx = ((i * 137 + Math.floor(cameraX * 0.1)) % (BASE_W + 20)) - 10;
        const sy = (i * 97) % (BASE_H - 60);
        ctx.fillRect(sx, sy, 2, 2);
      }

      if (gameState === "start") {
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 52px Arial";
        ctx.textAlign = "center";
        ctx.fillText("PLATFORMER", BASE_W / 2, 180);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "22px Arial";
        ctx.fillText("Arrow keys / WASD to move", BASE_W / 2, 260);
        ctx.fillText("Up/W/Space to jump (double jump!)", BASE_W / 2, 300);
        ctx.fillText("Stomp enemies to defeat them", BASE_W / 2, 340);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "24px Arial";
        ctx.fillText(`Best: ${highScore}`, BASE_W / 2, 390);
        ctx.fillStyle = "white";
        ctx.font = "26px Arial";
        ctx.fillText("Click or press any key to start", BASE_W / 2, 450);
        return;
      }

      if (gameState === "over") {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, BASE_W, BASE_H);
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 52px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", BASE_W / 2, 180);
        ctx.fillStyle = "white";
        ctx.font = "32px Arial";
        ctx.fillText(`Score: ${score}`, BASE_W / 2, 260);
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`Best: ${highScore}`, BASE_W / 2, 310);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "22px Arial";
        ctx.fillText("Click or press any key to restart", BASE_W / 2, 390);
        return;
      }

      // Platforms
      for (const p of platforms) {
        const px = p.x - cameraX;
        if (px + p.w < -10 || px > BASE_W + 10) continue;
        ctx.fillStyle = p.color;
        ctx.fillRect(px, p.y, p.w, p.h);
        // Top edge highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(px, p.y, p.w, 3);
        // Grass-like top for ground
        if (p.w > 1000) {
          ctx.fillStyle = "#6d28d9";
          ctx.fillRect(px, p.y - 4, p.w, 8);
        }
      }

      // Coins
      for (const c of coinList) {
        if (c.collected) continue;
        const cx = c.x - cameraX;
        if (cx < -20 || cx > BASE_W + 20) continue;
        const cy = c.y + Math.sin(c.bounce) * 4;
        const grad = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, COIN_R);
        grad.addColorStop(0, "#fde68a");
        grad.addColorStop(1, "#f59e0b");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, COIN_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#92400e";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#92400e";
        ctx.font = "bold 10px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("$", cx, cy);
        ctx.textBaseline = "alphabetic";
      }

      // Enemies
      for (const e of enemies) {
        if (!e.alive) continue;
        const ex = e.x - cameraX;
        if (ex < -50 || ex > BASE_W + 50) continue;
        drawEnemy(e);
      }

      // Player
      drawPlayer();

      // Particles
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x - cameraX, p.y, p.radius * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, BASE_W, 50);
      ctx.fillStyle = "white";
      ctx.font = "bold 22px Arial";
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${score}`, 16, 32);
      ctx.textAlign = "center";
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(`Best: ${highScore}`, BASE_W / 2, 32);
      ctx.textAlign = "right";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`Coins: ${coins}`, BASE_W - 16, 32);

      // Lives
      ctx.textAlign = "left";
      for (let i = 0; i < lives; i++) {
        ctx.fillStyle = "#ef4444";
        ctx.font = "20px Arial";
        ctx.fillText("❤", 10 + i * 24, BASE_H - 10);
      }

      // Mobile D-pad hint
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText("← → move   ↑ jump", BASE_W / 2, BASE_H - 10);
    };

    let lastTime = 0;
    const loop = (ts: number) => {
      const dt = Math.min((ts - lastTime) / 1000, 0.05);
      lastTime = ts;
      update(dt);
      draw();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);

    // Input
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (gameState === "start" || gameState === "over") startGame();
    };
    const onKeyUp = (e: KeyboardEvent) => { keys[e.key] = false; };

    // Touch D-pad (virtual buttons)
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (gameState === "start" || gameState === "over") { startGame(); return; }
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        const rect = canvas.getBoundingClientRect();
        const tx = (t.clientX - rect.left) * (BASE_W / rect.width);
        const ty = (t.clientY - rect.top) * (BASE_H / rect.height);
        if (ty > BASE_H * 0.5) {
          if (tx < BASE_W * 0.33) keys["ArrowLeft"] = true;
          else if (tx > BASE_W * 0.66) keys["ArrowRight"] = true;
          else keys["ArrowUp"] = true;
        } else {
          keys["ArrowUp"] = true;
        }
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 0) {
        keys["ArrowLeft"] = false; keys["ArrowRight"] = false; keys["ArrowUp"] = false;
      }
    };
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); };
    const onClick = () => { if (gameState === "start" || gameState === "over") startGame(); };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
        2D Platformer
      </h1>
      <div className="w-full max-w-3xl mx-auto" style={{ aspectRatio: "800/500" }}>
        <canvas
          ref={canvasRef}
          width={BASE_W}
          height={BASE_H}
          className="w-full h-full rounded-2xl shadow-2xl select-none"
          style={{ display: "block" }}
        />
      </div>
    </div>
  );
}
