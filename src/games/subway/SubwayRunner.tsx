/* eslint-disable */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, Trophy, Play, Coins, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Volume2, VolumeX } from "lucide-react";

type Lane = -1 | 0 | 1; // Left, Center, Right
type ObstacleType = "barrier" | "overhead" | "train";

interface Obstacle {
  id: number;
  lane: Lane;
  z: number; // Distance in 3D space from camera
  type: ObstacleType;
}

interface Coin {
  id: number;
  lane: Lane;
  z: number;
  collected: boolean;
}

export default function SubwayRunner() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState<number>(0);
  const [coinsCollected, setCoinsCollected] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Game internal mutable state (avoids React re-render lag inside requestAnimationFrame)
  const gameRef = useRef({
    lane: 0 as Lane,
    playerX: 0, // smoothly interpolated x
    playerY: 0, // jump height
    velocityY: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    speed: 16,
    distance: 0,
    coins: 0,
    obstacles: [] as Obstacle[],
    coinList: [] as Coin[],
    trackOffset: 0,
    nextObstacleZ: 800,
    nextCoinZ: 600,
    animFrameId: 0,
    lastTime: 0,
  });

  // Touch swipe handling
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("subway_runner_highscore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const changeLane = useCallback((direction: "left" | "right") => {
    if (gameState !== "playing") return;
    const g = gameRef.current;
    if (direction === "left" && g.lane > -1) {
      g.lane = (g.lane - 1) as Lane;
    } else if (direction === "right" && g.lane < 1) {
      g.lane = (g.lane + 1) as Lane;
    }
  }, [gameState]);

  const jump = useCallback(() => {
    if (gameState !== "playing") return;
    const g = gameRef.current;
    if (!g.isJumping) {
      g.isJumping = true;
      g.isSliding = false;
      g.velocityY = 15;
    }
  }, [gameState]);

  const slide = useCallback(() => {
    if (gameState !== "playing") return;
    const g = gameRef.current;
    if (g.isJumping) {
      // Fast fall down
      g.velocityY = -20;
    }
    g.isSliding = true;
    g.slideTimer = 25; // frames of sliding
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        changeLane("left");
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        changeLane("right");
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") {
        e.preventDefault();
        jump();
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        slide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, changeLane, jump, slide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameState !== "playing") return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 25) {
      if (absX > absY) {
        if (dx > 0) changeLane("right");
        else changeLane("left");
      } else {
        if (dy < 0) jump();
        else slide();
      }
    }
    touchStartRef.current = null;
  };

  const startGame = () => {
    const g = gameRef.current;
    g.lane = 0;
    g.playerX = 0;
    g.playerY = 0;
    g.velocityY = 0;
    g.isJumping = false;
    g.isSliding = false;
    g.slideTimer = 0;
    g.speed = 18;
    g.distance = 0;
    g.coins = 0;
    g.obstacles = [];
    g.coinList = [];
    g.trackOffset = 0;
    g.nextObstacleZ = 700;
    g.nextCoinZ = 500;
    g.lastTime = performance.now();

    setScore(0);
    setCoinsCollected(0);
    setGameState("playing");
  };

  // Main 3D Canvas Game Loop
  useEffect(() => {
    if (gameState !== "playing") return;

    let animId = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const g = gameRef.current;

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - g.lastTime) / 1000, 0.1);
      g.lastTime = currentTime;

      const width = canvas.width;
      const height = canvas.height;
      const horizonY = height * 0.36;
      const laneWidth = width * 0.22;

      // --- 1. UPDATE GAME STATE ---
      g.distance += g.speed * 2.5 * dt;
      g.speed = Math.min(36, 18 + g.distance * 0.008);
      g.trackOffset = (g.trackOffset + g.speed * 2) % 100;

      // Smooth lane movement
      const targetX = g.lane * laneWidth;
      g.playerX += (targetX - g.playerX) * 0.25;

      // Jump Physics
      if (g.isJumping) {
        g.playerY += g.velocityY;
        g.velocityY -= 1.0; // Gravity
        if (g.playerY <= 0) {
          g.playerY = 0;
          g.isJumping = false;
          g.velocityY = 0;
        }
      }

      // Slide Timer
      if (g.isSliding) {
        g.slideTimer--;
        if (g.slideTimer <= 0) {
          g.isSliding = false;
        }
      }

      // Spawn Obstacles
      if (g.obstacles.length < 8 && g.nextObstacleZ < 2400) {
        const types: ObstacleType[] = ["barrier", "overhead", "train"];
        const chosenType = types[Math.floor(Math.random() * types.length)];
        const chosenLane = (Math.floor(Math.random() * 3) - 1) as Lane;

        g.obstacles.push({
          id: Math.random(),
          lane: chosenLane,
          z: g.nextObstacleZ,
          type: chosenType,
        });

        // 20% chance of double obstacle across two lanes
        if (Math.random() < 0.25) {
          const secondLane = (chosenLane === 0 ? (Math.random() < 0.5 ? -1 : 1) : 0) as Lane;
          g.obstacles.push({
            id: Math.random(),
            lane: secondLane,
            z: g.nextObstacleZ,
            type: chosenType === "overhead" ? "barrier" : chosenType,
          });
        }

        g.nextObstacleZ += Math.max(380, 680 - g.speed * 8);
      }

      // Spawn Coins (in arc or row)
      if (g.coinList.length < 15 && g.nextCoinZ < 2200) {
        const coinLane = (Math.floor(Math.random() * 3) - 1) as Lane;
        const count = 4;
        for (let i = 0; i < count; i++) {
          g.coinList.push({
            id: Math.random(),
            lane: coinLane,
            z: g.nextCoinZ + i * 65,
            collected: false,
          });
        }
        g.nextCoinZ += Math.max(450, 750 - g.speed * 6);
      }

      // Move and clean obstacles
      for (const obs of g.obstacles) {
        obs.z -= g.speed * 1.5;
      }
      g.obstacles = g.obstacles.filter((obs) => obs.z > -80);
      g.nextObstacleZ -= g.speed * 1.5;

      // Move and clean coins
      for (const coin of g.coinList) {
        coin.z -= g.speed * 1.5;

        // Coin collection check
        if (!coin.collected && coin.z > 20 && coin.z < 95) {
          const laneMatches = coin.lane === g.lane || Math.abs(g.playerX - coin.lane * laneWidth) < laneWidth * 0.5;
          if (laneMatches) {
            coin.collected = true;
            g.coins++;
          }
        }
      }
      g.coinList = g.coinList.filter((c) => c.z > -40);
      g.nextCoinZ -= g.speed * 1.5;

      // --- COLLISION DETECTION ---
      let collisionDetected = false;
      for (const obs of g.obstacles) {
        // Player depth is around z: 40..85
        if (obs.z > 25 && obs.z < 90) {
          const inSameLane = Math.abs(g.playerX - obs.lane * laneWidth) < laneWidth * 0.45;
          if (inSameLane) {
            if (obs.type === "barrier") {
              // Barrier must be jumped over (playerY must be > 40)
              if (g.playerY < 38) {
                collisionDetected = true;
                break;
              }
            } else if (obs.type === "overhead") {
              // Overhead sign must be ducked/slid under (player must be sliding)
              if (!g.isSliding) {
                collisionDetected = true;
                break;
              }
            } else if (obs.type === "train") {
              // Trains cannot be jumped or slid under! Must avoid lane completely!
              collisionDetected = true;
              break;
            }
          }
        }
      }

      if (collisionDetected) {
        const finalScore = Math.floor(g.distance) + g.coins * 10;
        setScore(finalScore);
        setCoinsCollected(g.coins);
        setHighScore((prev) => {
          const newHigh = Math.max(prev, finalScore);
          localStorage.setItem("subway_runner_highscore", newHigh.toString());
          return newHigh;
        });
        setGameState("gameover");
        return;
      }

      // Live React State update for HUD
      setScore(Math.floor(g.distance) + g.coins * 10);
      setCoinsCollected(g.coins);

      // --- 2. RENDER PSEUDO-3D WORLD ---
      ctx.clearRect(0, 0, width, height);

      // Sky & City Backdrop
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, "#090d16");
      skyGrad.addColorStop(0.7, "#1e1b4b");
      skyGrad.addColorStop(1, "#312e81");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonY);

      // Distant Neon Buildings
      ctx.fillStyle = "#111827";
      for (let i = 0; i < 9; i++) {
        const bW = 45 + (i * 20) % 35;
        const bH = 60 + ((i * 37) % 55);
        const bX = i * (width / 8) - 20;
        ctx.fillRect(bX, horizonY - bH, bW, bH);
        // Windows
        ctx.fillStyle = i % 2 === 0 ? "rgba(253, 224, 71, 0.4)" : "rgba(56, 189, 248, 0.4)";
        ctx.fillRect(bX + 8, horizonY - bH + 12, 6, 8);
        ctx.fillRect(bX + 22, horizonY - bH + 12, 6, 8);
        ctx.fillStyle = "#111827";
      }

      // Ground (Subway Trackbed)
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      groundGrad.addColorStop(0, "#1f2937");
      groundGrad.addColorStop(0.4, "#111827");
      groundGrad.addColorStop(1, "#030712");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // 3D Perspective Projection Helper
      const project = (lanePos: number, z: number, yOffset = 0) => {
        const fov = 280;
        const scale = fov / (z + fov);
        const screenX = width / 2 + lanePos * scale;
        const screenY = horizonY + (height - horizonY) * scale - yOffset * scale;
        return { x: screenX, y: screenY, scale };
      };

      // Draw Rails and Ties
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 3;

      // Draw 4 Track Divider Lines
      for (const laneBoundary of [-1.5, -0.5, 0.5, 1.5]) {
        ctx.beginPath();
        const pFar = project(laneBoundary * laneWidth, 2000);
        const pNear = project(laneBoundary * laneWidth, 20);
        ctx.moveTo(pFar.x, pFar.y);
        ctx.lineTo(pNear.x, pNear.y);
        ctx.stroke();
      }

      // Horizontal Railroad Sleepers / Ties (moving forward)
      ctx.strokeStyle = "rgba(100, 116, 139, 0.35)";
      ctx.lineWidth = 2;
      for (let z = (g.trackOffset % 40); z < 1800; z += 40) {
        const p1 = project(-1.5 * laneWidth, z);
        const p2 = project(1.5 * laneWidth, z);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // Draw Tunnel Neon Ring Arcs in Distance
      for (let z = ((g.trackOffset * 1.5) % 250); z < 1600; z += 250) {
        const p = project(0, z);
        const ringW = laneWidth * 3.4 * p.scale;
        const ringH = (height - horizonY) * 1.5 * p.scale;
        ctx.strokeStyle = "rgba(99, 102, 241, 0.22)";
        ctx.lineWidth = 3 * p.scale;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - ringH * 0.45, ringW * 0.5, ringH * 0.5, 0, Math.PI, 0);
        ctx.stroke();
      }

      // Combine Obstacles & Coins for Depth Sorting (back-to-front rendering)
      type Renderable =
        | { kind: "obstacle"; obj: Obstacle; z: number }
        | { kind: "coin"; obj: Coin; z: number };

      const renderables: Renderable[] = [
        ...g.obstacles.map((obs) => ({ kind: "obstacle" as const, obj: obs, z: obs.z })),
        ...g.coinList.filter((c) => !c.collected).map((c) => ({ kind: "coin" as const, obj: c, z: c.z })),
      ];

      renderables.sort((a, b) => b.z - a.z);

      // Render Objects in 3D
      for (const item of renderables) {
        if (item.kind === "coin") {
          const coin = item.obj;
          const p = project(coin.lane * laneWidth, coin.z, 28);
          if (p.scale <= 0) continue;

          const r = Math.max(3, 14 * p.scale);
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = "#eab308";
          ctx.shadowColor = "#facc15";
          ctx.shadowBlur = 10 * p.scale;
          ctx.fill();

          // Inner gold ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 0.55, 0, Math.PI * 2);
          ctx.strokeStyle = "#fef08a";
          ctx.lineWidth = 2 * p.scale;
          ctx.stroke();
          ctx.restore();
        } else {
          const obs = item.obj;
          const p = project(obs.lane * laneWidth, obs.z);
          if (p.scale <= 0) continue;

          if (obs.type === "barrier") {
            // Low Hurdle (Red/White striped barrier to JUMP over)
            const bW = laneWidth * 0.85 * p.scale;
            const bH = 38 * p.scale;
            const bX = p.x - bW / 2;
            const bY = p.y - bH;

            // Barrier Stand Legs
            ctx.fillStyle = "#334155";
            ctx.fillRect(bX + 4 * p.scale, bY + bH * 0.3, 5 * p.scale, bH * 0.7);
            ctx.fillRect(bX + bW - 9 * p.scale, bY + bH * 0.3, 5 * p.scale, bH * 0.7);

            // Barrier Board Striped
            ctx.fillStyle = "#e11d48";
            ctx.fillRect(bX, bY, bW, bH * 0.65);
            ctx.fillStyle = "#ffffff";
            for (let s = 0; s < bW; s += 16 * p.scale) {
              ctx.fillRect(bX + s, bY, 7 * p.scale, bH * 0.65);
            }
          } else if (obs.type === "overhead") {
            // Overhead Sign/Bar (Yellow warning beam to SLIDE under)
            const sW = laneWidth * 0.9 * p.scale;
            const sH = 34 * p.scale;
            const sX = p.x - sW / 2;
            const clearance = 42 * p.scale;
            const sY = p.y - clearance - sH;

            // Tall Support Posts
            ctx.fillStyle = "#475569";
            ctx.fillRect(sX - 4 * p.scale, sY, 6 * p.scale, clearance + sH);
            ctx.fillRect(sX + sW - 2 * p.scale, sY, 6 * p.scale, clearance + sH);

            // Warning Stripe Beam
            ctx.fillStyle = "#ca8a04";
            ctx.fillRect(sX, sY, sW, sH);
            ctx.fillStyle = "#000000";
            for (let s = 0; s < sW; s += 18 * p.scale) {
              ctx.fillRect(sX + s, sY, 8 * p.scale, sH);
            }

            // Down Arrow symbol indicating "Slide Down"
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.max(10, 16 * p.scale)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("▼ DUCK ▼", p.x, sY + sH * 0.75);
          } else if (obs.type === "train") {
            // Subway Train Car (Massive solid obstacle, must change lane!)
            const tW = laneWidth * 0.9 * p.scale;
            const tH = 110 * p.scale;
            const tX = p.x - tW / 2;
            const tY = p.y - tH;

            // Train Front Body
            ctx.fillStyle = "#0284c7"; // Blue Express Train
            ctx.fillRect(tX, tY, tW, tH);

            // Windshield Window
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(tX + tW * 0.15, tY + tH * 0.15, tW * 0.7, tH * 0.35);

            // Headlights
            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(tX + tW * 0.25, tY + tH * 0.75, 7 * p.scale, 0, Math.PI * 2);
            ctx.arc(tX + tW * 0.75, tY + tH * 0.75, 7 * p.scale, 0, Math.PI * 2);
            ctx.fill();

            // Train Bumper
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(tX + tW * 0.08, tY + tH * 0.88, tW * 0.84, tH * 0.12);
          }
        }
      }

      // --- 3. RENDER PLAYER (RUNNER) ---
      const playerProj = project(g.playerX, 60, g.playerY);

      // Player Shadow on ground
      const shadowProj = project(g.playerX, 60, 0);
      const shadowW = (g.isSliding ? 48 : 34) * shadowProj.scale;
      const shadowH = 12 * shadowProj.scale;
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(shadowProj.x, shadowProj.y, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw Player Character
      ctx.save();
      const pScale = playerProj.scale;
      const pX = playerProj.x;
      const pY = playerProj.y;

      if (g.isSliding) {
        // Sliding / Ducking pose
        const duckW = 46 * pScale;
        const duckH = 22 * pScale;
        ctx.fillStyle = "#6366f1"; // Indigo Hoodie
        ctx.fillRect(pX - duckW / 2, pY - duckH, duckW, duckH);

        // Cap/Head
        ctx.fillStyle = "#f43f5e"; // Red Cap
        ctx.beginPath();
        ctx.arc(pX + duckW * 0.3, pY - duckH * 0.6, 9 * pScale, 0, Math.PI * 2);
        ctx.fill();

        // Slide dust particles
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fillRect(pX - duckW * 0.8, pY - 5 * pScale, 6 * pScale, 3 * pScale);
        ctx.fillRect(pX - duckW * 0.6, pY - 8 * pScale, 8 * pScale, 4 * pScale);
      } else {
        // Standing / Running / Jumping pose
        const bodyW = 28 * pScale;
        const bodyH = 46 * pScale;

        // Legs (animated swing)
        const runCycle = Math.sin((g.distance * 0.8) % (Math.PI * 2));
        const legOffset = g.isJumping ? 0 : runCycle * 8 * pScale;

        // Pants / Jeans
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(pX - bodyW * 0.45, pY - 18 * pScale + legOffset, 8 * pScale, 18 * pScale);
        ctx.fillRect(pX + bodyW * 0.15, pY - 18 * pScale - legOffset, 8 * pScale, 18 * pScale);

        // Shoes
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(pX - bodyW * 0.5, pY - 4 * pScale + legOffset, 10 * pScale, 4 * pScale);
        ctx.fillRect(pX + bodyW * 0.1, pY - 4 * pScale - legOffset, 10 * pScale, 4 * pScale);

        // Torso / Vibrant Hoodie
        ctx.fillStyle = "#4f46e5";
        ctx.fillRect(pX - bodyW / 2, pY - bodyH, bodyW, bodyH * 0.65);

        // Backpack
        ctx.fillStyle = "#10b981";
        ctx.fillRect(pX - bodyW * 0.6, pY - bodyH * 0.9, 6 * pScale, bodyH * 0.45);

        // Head / Skin
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.arc(pX, pY - bodyH - 10 * pScale, 10 * pScale, 0, Math.PI * 2);
        ctx.fill();

        // Red Streetwear Cap
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath();
        ctx.arc(pX, pY - bodyH - 12 * pScale, 11 * pScale, Math.PI, 0, false);
        ctx.fill();
        // Cap Visor
        ctx.fillRect(pX - 4 * pScale, pY - bodyH - 13 * pScale, 18 * pScale, 4 * pScale);
      }
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto">
      {/* Top HUD Stats Bar */}
      <div className="w-full flex justify-between items-center mb-3 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
        {/* Score */}
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Score</span>
          <span className="text-2xl font-black text-gray-900 leading-none">{score}</span>
        </div>

        {/* Coins */}
        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs">
          <Coins className="w-5 h-5 text-amber-500 fill-amber-400" />
          <span className="text-xl font-black text-amber-700 leading-none">{coinsCollected}</span>
        </div>

        {/* Best Score */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center">
            <Trophy className="w-3 h-3 mr-1 text-amber-500" /> Best
          </span>
          <span className="text-2xl font-black text-amber-600 leading-none">{highScore}</span>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div
        className="relative w-full aspect-[4/5] sm:aspect-[3/4] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={640}
          className="w-full h-full block object-cover"
        />

        {/* Start Menu Overlay */}
        {gameState === "menu" && (
          <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/40 animate-bounce">
              <Zap className="w-8 h-8 text-white fill-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Subway Runner</h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xs mb-6 font-medium leading-relaxed">
              Dodge speeding trains, leap over hurdles, and slide under barriers across 3 fast-paced subway tracks!
            </p>
            <button
              type="button"
              onClick={startGame}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full font-black text-base shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" /> Run Now
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in">
            <span className="text-rose-500 font-black tracking-widest uppercase text-xs mb-1">Crashed!</span>
            <h2 className="text-3xl font-black mb-4">Game Over</h2>

            <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-bold">Score</span>
                <span className="text-xl font-black text-white">{score}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-bold">Coins Picked</span>
                <span className="text-lg font-black text-amber-400 flex items-center gap-1">
                  <Coins className="w-4 h-4" /> {coinsCollected}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> High Score
                </span>
                <span className="text-lg font-black text-amber-400">{highScore}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={startGame}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-base shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          </div>
        )}
      </div>

      {/* Touch Action Controls for Mobile Screens */}
      <div className="w-full grid grid-cols-4 gap-2 mt-4 sm:hidden">
        <button
          type="button"
          onClick={() => changeLane("left")}
          className="flex flex-col items-center justify-center p-3.5 bg-white border border-gray-200 active:bg-gray-100 rounded-2xl shadow-sm text-gray-800"
          title="Move Left"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-[10px] font-bold text-gray-400 mt-1">Left</span>
        </button>
        <button
          type="button"
          onClick={jump}
          className="flex flex-col items-center justify-center p-3.5 bg-indigo-50 border border-indigo-200 active:bg-indigo-100 rounded-2xl shadow-sm text-indigo-700"
          title="Jump"
        >
          <ArrowUp className="w-6 h-6" />
          <span className="text-[10px] font-bold text-indigo-500 mt-1">Jump</span>
        </button>
        <button
          type="button"
          onClick={slide}
          className="flex flex-col items-center justify-center p-3.5 bg-amber-50 border border-amber-200 active:bg-amber-100 rounded-2xl shadow-sm text-amber-700"
          title="Slide"
        >
          <ArrowDown className="w-6 h-6" />
          <span className="text-[10px] font-bold text-amber-600 mt-1">Slide</span>
        </button>
        <button
          type="button"
          onClick={() => changeLane("right")}
          className="flex flex-col items-center justify-center p-3.5 bg-white border border-gray-200 active:bg-gray-100 rounded-2xl shadow-sm text-gray-800"
          title="Move Right"
        >
          <ArrowRight className="w-6 h-6" />
          <span className="text-[10px] font-bold text-gray-400 mt-1">Right</span>
        </button>
      </div>

      {/* Control Tips for Desktop */}
      <div className="hidden sm:flex items-center justify-center gap-6 mt-4 text-xs text-gray-500 font-medium">
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-[11px]">←</kbd> <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-[11px]">→</kbd> Change Lane</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-[11px]">↑</kbd> / <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-[11px]">Space</kbd> Jump</span>
        <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded font-mono text-[11px]">↓</kbd> Slide / Duck</span>
      </div>
    </div>
  );
}
