/* eslint-disable */
"use client";

import React, { useRef, useEffect } from "react";

const BASE_W = 800;
const BASE_H = 600;

interface Alien {
  x: number;
  y: number;
  alive: boolean;
  row: number;
  col: number;
  animFrame: number;
}

interface Bullet {
  x: number;
  y: number;
  vy: number;
  active: boolean;
}

interface Shield {
  blocks: boolean[][];
  x: number;
  y: number;
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

interface UFO {
  x: number;
  y: number;
  active: boolean;
  dir: number;
  speed: number;
}

export default function SpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      try { audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch (e) {}
    }
    return audioCtxRef.current;
  };

  const playSound = (type: "shoot" | "explode" | "ufo" | "playerDie" | "march") => {
    try {
      const ctx = getAudioCtx(); if (!ctx) return; ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      if (type === "shoot") {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.12);
      } else if (type === "explode") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
      } else if (type === "ufo") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(400, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
      } else if (type === "playerDie") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
      } else {
        const freq = [80, 100, 120, 100][Math.floor(Date.now() / 300) % 4];
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {}
  };

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // --- STATE ---
    const ALIEN_COLS = 11, ALIEN_ROWS = 5;
    const ALIEN_W = 40, ALIEN_H = 32, ALIEN_GAP_X = 16, ALIEN_GAP_Y = 16;
    const SHIELD_COUNT = 4;

    let aliens: Alien[] = [];
    let playerBullets: Bullet[] = [];
    let alienBullets: Bullet[] = [];
    let shields: Shield[] = [];
    let particles: Particle[] = [];
    let ufo: UFO = { x: -100, y: 50, active: false, dir: 1, speed: 2 };

    let playerX = BASE_W / 2;
    let playerLives = 3;
    let score = 0;
    let highScore = parseInt(localStorage.getItem("invaders_high") || "0");
    let level = 1;
    let gameState: "start" | "playing" | "dead" | "over" | "levelup" = "start";
    let playerInvincible = 0;
    let levelUpTimer = 0;

    let alienDir = 1;
    let alienSpeed = 0.5;
    let alienMarchTimer = 0;
    let alienMarchInterval = 800;
    let alienShootTimer = 0;
    let alienShootInterval = 1500;
    let ufoTimer = 0;
    let ufoInterval = 15000;

    const keys: Record<string, boolean> = {};
    let shootCooldown = 0;
    let frameId = 0;

    const ALIEN_COLORS = ["#f97316", "#8b5cf6", "#06b6d4", "#22c55e", "#ec4899"];
    const SHIELD_COLOR = "#22c55e";

    const makeShields = () => {
      shields = [];
      for (let i = 0; i < SHIELD_COUNT; i++) {
        const sx = BASE_W * 0.1 + i * (BASE_W * 0.8 / (SHIELD_COUNT - 1)) - 24;
        const sy = BASE_H - 130;
        const blocks: boolean[][] = [];
        for (let row = 0; row < 4; row++) {
          blocks.push([]);
          for (let col = 0; col < 8; col++) {
            // arch shape - remove top corners
            const isCutout = (row === 0 && (col <= 1 || col >= 6)) ||
              (row === 1 && (col === 0 || col === 7)) ||
              (row >= 2 && row <= 3 && col >= 2 && col <= 5 && row === 3);
            blocks[row].push(!isCutout);
          }
        }
        shields.push({ blocks, x: sx, y: sy });
      }
    };

    const makeAliens = () => {
      aliens = [];
      const startX = (BASE_W - (ALIEN_COLS * (ALIEN_W + ALIEN_GAP_X) - ALIEN_GAP_X)) / 2;
      const startY = 80;
      for (let row = 0; row < ALIEN_ROWS; row++) {
        for (let col = 0; col < ALIEN_COLS; col++) {
          aliens.push({ x: startX + col * (ALIEN_W + ALIEN_GAP_X), y: startY + row * (ALIEN_H + ALIEN_GAP_Y), alive: true, row, col, animFrame: 0 });
        }
      }
    };

    const startGame = (lvl = 1) => {
      level = lvl;
      playerX = BASE_W / 2;
      playerBullets = [];
      alienBullets = [];
      particles = [];
      ufo = { x: -100, y: 50, active: false, dir: 1, speed: 2 };
      alienDir = 1;
      alienSpeed = 0.5 + (lvl - 1) * 0.1;
      alienMarchInterval = Math.max(200, 800 - (lvl - 1) * 80);
      alienShootInterval = Math.max(500, 1500 - (lvl - 1) * 100);
      alienMarchTimer = 0;
      alienShootTimer = 0;
      ufoTimer = 0;
      shootCooldown = 0;
      playerInvincible = 0;
      if (lvl === 1) { score = 0; playerLives = 3; }
      makeAliens();
      makeShields();
      gameState = "playing";
    };

    const spawnParticles = (x: number, y: number, color: string, n: number) => {
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color, radius: 2 + Math.random() * 3 });
      }
    };

    const drawAlien = (a: Alien, x: number, y: number) => {
      const color = ALIEN_COLORS[a.row];
      const f = a.animFrame;
      ctx.fillStyle = color;

      if (a.row <= 1) {
        // top-tier squids
        ctx.beginPath();
        ctx.arc(x + ALIEN_W / 2, y + ALIEN_H / 2 - 4, 10, 0, Math.PI * 2);
        ctx.fill();
        // tentacles
        const tentOffset = f === 0 ? 0 : 4;
        for (let t = 0; t < 4; t++) {
          ctx.fillRect(x + 4 + t * 8, y + ALIEN_H - 8 + tentOffset, 4, 8 - tentOffset);
        }
        ctx.fillRect(x + 2, y + ALIEN_H / 2 - 6, ALIEN_W - 4, 14);
        // eyes
        ctx.fillStyle = "black";
        ctx.fillRect(x + 10, y + ALIEN_H / 2 - 4, 5, 5);
        ctx.fillRect(x + ALIEN_W - 15, y + ALIEN_H / 2 - 4, 5, 5);
      } else if (a.row <= 3) {
        // mid-tier crabs
        const legOff = f === 0 ? -2 : 2;
        ctx.fillRect(x + 6, y + 6, ALIEN_W - 12, ALIEN_H - 10);
        // claws
        ctx.fillRect(x, y + 10 + legOff, 8, 6);
        ctx.fillRect(x + ALIEN_W - 8, y + 10 + legOff, 8, 6);
        // legs
        for (let l = 0; l < 3; l++) {
          ctx.fillRect(x + 4 + l * 11, y + ALIEN_H - 6 + legOff, 5, 8 - legOff);
        }
        ctx.fillStyle = "black";
        ctx.fillRect(x + 10, y + 10, 5, 5);
        ctx.fillRect(x + ALIEN_W - 15, y + 10, 5, 5);
      } else {
        // bottom octopi
        ctx.beginPath();
        ctx.arc(x + ALIEN_W / 2, y + 12, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x + 4, y + 10, ALIEN_W - 8, ALIEN_H - 14);
        const legOff = f === 0 ? 0 : 2;
        for (let l = 0; l < 5; l++) {
          ctx.fillRect(x + 2 + l * 8, y + ALIEN_H - 6 + legOff, 4, 8 - legOff);
        }
        ctx.fillStyle = "black";
        ctx.fillRect(x + 10, y + 8, 5, 5);
        ctx.fillRect(x + ALIEN_W - 15, y + 8, 5, 5);
      }
    };

    const drawPlayer = (px: number) => {
      if (playerInvincible > 0 && Math.floor(playerInvincible * 10) % 2 === 0) return;
      const y = BASE_H - 50;
      ctx.fillStyle = "#22c55e";
      // body
      ctx.fillRect(px - 20, y + 10, 40, 20);
      // cannon
      ctx.fillRect(px - 4, y, 8, 14);
      // wings
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(px - 30, y + 18, 12, 10);
      ctx.fillRect(px + 18, y + 18, 12, 10);
      // engine glow
      ctx.fillStyle = `hsl(${Date.now() * 0.5 % 360}, 100%, 70%)`;
      ctx.fillRect(px - 6, y + 28, 12, 4);
    };

    const update = (dt: number) => {
      if (gameState !== "playing") return;

      playerInvincible = Math.max(0, playerInvincible - dt);
      shootCooldown = Math.max(0, shootCooldown - dt);

      // Player movement
      if ((keys["ArrowLeft"] || keys["a"] || keys["A"]) && playerX > 30) playerX -= 250 * dt;
      if ((keys["ArrowRight"] || keys["d"] || keys["D"]) && playerX < BASE_W - 30) playerX += 250 * dt;

      // Shoot
      if ((keys[" "] || keys["ArrowUp"]) && shootCooldown <= 0) {
        playerBullets.push({ x: playerX, y: BASE_H - 55, vy: -600, active: true });
        shootCooldown = 0.4;
        playSound("shoot");
      }

      // UFO
      ufoTimer += dt * 1000;
      if (ufoTimer >= ufoInterval && !ufo.active) {
        ufo.active = true;
        ufo.dir = Math.random() < 0.5 ? 1 : -1;
        ufo.x = ufo.dir === 1 ? -50 : BASE_W + 50;
        ufo.y = 50;
        ufoTimer = 0;
        playSound("ufo");
      }
      if (ufo.active) {
        ufo.x += ufo.dir * ufo.speed * 60 * dt;
        if (ufo.x > BASE_W + 60 || ufo.x < -60) ufo.active = false;
      }

      // Alien march
      alienMarchTimer += dt * 1000;
      if (alienMarchTimer >= alienMarchInterval) {
        alienMarchTimer = 0;
        playSound("march");
        // Check bounds
        const alive = aliens.filter(a => a.alive);
        if (alive.length === 0) { gameState = "levelup"; levelUpTimer = 2; return; }

        const minX = Math.min(...alive.map(a => a.x));
        const maxX = Math.max(...alive.map(a => a.x + ALIEN_W));
        let drop = false;
        if (alienDir === 1 && maxX + (alienSpeed * 20 * alienMarchInterval / 1000) >= BASE_W - 10) drop = true;
        if (alienDir === -1 && minX - (alienSpeed * 20 * alienMarchInterval / 1000) <= 10) drop = true;

        for (const a of alive) {
          a.x += alienDir * alienSpeed * 20;
          if (drop) a.y += 16;
          a.animFrame = a.animFrame === 0 ? 1 : 0;
          if (a.y + ALIEN_H >= BASE_H - 60) { gameState = "over"; return; }
        }
        if (drop) alienDir *= -1;
        alienMarchInterval = Math.max(100, 800 - (aliens.filter(a=>a.alive).length < 10 ? 600 : aliens.filter(a=>a.alive).length < 20 ? 400 : 0));
      }

      // Alien shoot
      alienShootTimer += dt * 1000;
      if (alienShootTimer >= alienShootInterval) {
        alienShootTimer = 0;
        const alive = aliens.filter(a => a.alive);
        if (alive.length > 0) {
          const shooter = alive[Math.floor(Math.random() * alive.length)];
          alienBullets.push({ x: shooter.x + ALIEN_W / 2, y: shooter.y + ALIEN_H, vy: 250 + level * 20, active: true });
        }
      }

      // Move bullets
      for (const b of playerBullets) {
        b.y += b.vy * dt;
        if (b.y < 0) b.active = false;
      }
      for (const b of alienBullets) {
        b.y += b.vy * dt;
        if (b.y > BASE_H) b.active = false;
      }

      // Player bullet vs aliens
      for (const b of playerBullets) {
        if (!b.active) continue;
        // vs UFO
        if (ufo.active && b.x > ufo.x - 30 && b.x < ufo.x + 30 && b.y > ufo.y - 12 && b.y < ufo.y + 12) {
          ufo.active = false;
          b.active = false;
          score += 500;
          if (score > highScore) highScore = score;
          spawnParticles(ufo.x, ufo.y, "#ec4899", 20);
          playSound("explode");
        }
        for (const a of aliens) {
          if (!a.alive || !b.active) continue;
          if (b.x > a.x && b.x < a.x + ALIEN_W && b.y > a.y && b.y < a.y + ALIEN_H) {
            a.alive = false;
            b.active = false;
            const pts = a.row <= 1 ? 30 : a.row <= 3 ? 20 : 10;
            score += pts;
            if (score > highScore) highScore = score;
            localStorage.setItem("invaders_high", String(highScore));
            spawnParticles(a.x + ALIEN_W/2, a.y + ALIEN_H/2, ALIEN_COLORS[a.row], 12);
            playSound("explode");
          }
        }
        // vs shields
        for (const s of shields) {
          for (let row = 0; row < s.blocks.length; row++) {
            for (let col = 0; col < s.blocks[row].length; col++) {
              if (!s.blocks[row][col]) continue;
              const bx = s.x + col * 6, by = s.y + row * 6;
              if (b.x >= bx && b.x <= bx+6 && b.y >= by && b.y <= by+6) {
                s.blocks[row][col] = false;
                b.active = false;
              }
            }
          }
        }
      }

      // Alien bullet vs player
      for (const b of alienBullets) {
        if (!b.active || playerInvincible > 0) continue;
        if (b.x > playerX - 22 && b.x < playerX + 22 && b.y > BASE_H - 56 && b.y < BASE_H - 30) {
          b.active = false;
          playerLives--;
          playerInvincible = 2;
          spawnParticles(playerX, BASE_H - 40, "#22c55e", 15);
          playSound("playerDie");
          if (playerLives <= 0) { gameState = "over"; localStorage.setItem("invaders_high", String(highScore)); }
        }
        // vs shields
        for (const s of shields) {
          for (let row = 0; row < s.blocks.length; row++) {
            for (let col = 0; col < s.blocks[row].length; col++) {
              if (!s.blocks[row][col]) continue;
              const bx = s.x + col * 6, by = s.y + row * 6;
              if (b.x >= bx && b.x <= bx+6 && b.y >= by && b.y <= by+6) {
                s.blocks[row][col] = false;
                b.active = false;
              }
            }
          }
        }
      }

      // cleanup
      playerBullets = playerBullets.filter(b => b.active);
      alienBullets = alienBullets.filter(b => b.active);

      // particles
      for (const p of particles) {
        p.x += p.vx * 60 * dt; p.y += p.vy * 60 * dt;
        p.vy += 0.05; p.life -= dt * 2;
      }
      particles = particles.filter(p => p.life > 0);

      if ((gameState as string) === "levelup") { levelUpTimer -= dt; if (levelUpTimer <= 0) startGame(level + 1); }
    };

    const draw = () => {
      ctx.fillStyle = "#050a14";
      ctx.fillRect(0, 0, BASE_W, BASE_H);

      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for (let i = 0; i < 80; i++) {
        const sx = ((i * 137 + 11) % BASE_W);
        const sy = ((i * 97 + 7) % BASE_H);
        ctx.fillRect(sx, sy, 1, 1);
      }

      if (gameState === "start") {
        ctx.fillStyle = "#22c55e";
        ctx.font = "bold 56px monospace";
        ctx.textAlign = "center";
        ctx.fillText("SPACE INVADERS", BASE_W / 2, 180);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "22px monospace";
        ctx.fillText("← → Arrow keys to move", BASE_W / 2, 260);
        ctx.fillText("Space to shoot", BASE_W / 2, 300);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "24px monospace";
        ctx.fillText(`Best: ${highScore}`, BASE_W / 2, 360);
        ctx.fillStyle = "white";
        ctx.font = "26px monospace";
        ctx.fillText("Click or press any key to start", BASE_W / 2, 440);
        return;
      }

      if (gameState === "over") {
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 56px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", BASE_W / 2, 200);
        ctx.fillStyle = "white";
        ctx.font = "32px monospace";
        ctx.fillText(`Score: ${score}`, BASE_W / 2, 280);
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`Best: ${highScore}`, BASE_W / 2, 330);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "22px monospace";
        ctx.fillText("Click to play again", BASE_W / 2, 420);
        return;
      }

      if (gameState === "levelup") {
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 48px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`LEVEL ${level} COMPLETE!`, BASE_W / 2, BASE_H / 2 - 30);
        ctx.fillStyle = "white";
        ctx.font = "28px monospace";
        ctx.fillText(`Score: ${score}`, BASE_W / 2, BASE_H / 2 + 30);
        return;
      }

      // Draw aliens
      for (const a of aliens) {
        if (!a.alive) continue;
        drawAlien(a, a.x, a.y);
      }

      // UFO
      if (ufo.active) {
        ctx.fillStyle = "#ec4899";
        ctx.beginPath();
        ctx.ellipse(ufo.x, ufo.y, 30, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f9a8d4";
        ctx.beginPath();
        ctx.ellipse(ufo.x, ufo.y - 8, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText("UFO", ufo.x, ufo.y + 4);
        // Score hint
        ctx.fillStyle = "#ec4899";
        ctx.font = "12px monospace";
        ctx.fillText("500", ufo.x, ufo.y - 20);
      }

      // Shields
      for (const s of shields) {
        for (let row = 0; row < s.blocks.length; row++) {
          for (let col = 0; col < s.blocks[row].length; col++) {
            if (s.blocks[row][col]) {
              ctx.fillStyle = SHIELD_COLOR;
              ctx.fillRect(s.x + col * 6, s.y + row * 6, 5, 5);
            }
          }
        }
      }

      // Player
      drawPlayer(playerX);

      // Bullets
      for (const b of playerBullets) {
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(b.x - 2, b.y - 8, 4, 12);
      }
      for (const b of alienBullets) {
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(b.x - 2, b.y, 4, 10);
      }

      // Particles
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // HUD
      ctx.fillStyle = "#22c55e";
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`SCORE: ${score}`, 16, 30);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(`BEST: ${highScore}`, BASE_W - 16, 30);
      ctx.textAlign = "center";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`LEVEL ${level}`, BASE_W / 2, 30);
      // Lives
      for (let i = 0; i < playerLives; i++) {
        ctx.fillStyle = "#22c55e";
        const lx = 16 + i * 36;
        ctx.fillRect(lx + 10, BASE_H - 22, 16, 10);
        ctx.fillRect(lx + 14, BASE_H - 28, 8, 8);
      }
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px monospace";
      ctx.textAlign = "left";
      ctx.fillText("Lives:", 16, BASE_H - 10);

      // Ground line
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, BASE_H - 10, BASE_W, 10);
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
    const onKey = (e: KeyboardEvent, down: boolean) => {
      keys[e.key] = down;
      if (down && (gameState === "start" || gameState === "over")) startGame(1);
    };
    const onMouseClick = () => { if (gameState === "start" || gameState === "over") startGame(1); };

    // Touch: left half = move left, right half = move right, tap = shoot
    let touchX = -1;
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (gameState === "start" || gameState === "over") { startGame(1); return; }
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      touchX = (t.clientX - rect.left) * (BASE_W / rect.width);
      if (touchX < BASE_W / 2) keys["ArrowLeft"] = true;
      else keys["ArrowRight"] = true;
      keys[" "] = true;
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      keys["ArrowLeft"] = false; keys["ArrowRight"] = false; keys[" "] = false; touchX = -1;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      touchX = (t.clientX - rect.left) * (BASE_W / rect.width);
      keys["ArrowLeft"] = touchX < playerX;
      keys["ArrowRight"] = touchX >= playerX;
    };

    window.addEventListener("keydown", e => onKey(e, true));
    window.addEventListener("keyup", e => onKey(e, false));
    canvas.addEventListener("click", onMouseClick);
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", e => onKey(e, true));
      window.removeEventListener("keyup", e => onKey(e, false));
      canvas.removeEventListener("click", onMouseClick);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-slate-400 to-indigo-400 bg-clip-text text-transparent">
        Space Invaders
      </h1>
      <div className="w-full max-w-3xl mx-auto" style={{ aspectRatio: "800/600" }}>
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
