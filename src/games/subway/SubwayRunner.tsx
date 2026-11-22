/* eslint-disable */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, Trophy, Play, Coins, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap, Shield, ShieldAlert, Timer } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

type Lane = -1 | 0 | 1; // Left, Center, Right
type ObstacleType = "barrier" | "overhead" | "train";

interface Obstacle {
  id: number;
  lane: Lane;
  z: number;
  type: ObstacleType;
}

interface Coin {
  id: number;
  lane: Lane;
  z: number;
  collected: boolean;
}

interface ShieldItem {
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
  const [hasShield, setHasShield] = useState<boolean>(true);
  const [speedTier, setSpeedTier] = useState<string>("1.0x");
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);

  // Game internal mutable state
  const gameRef = useRef({
    lane: 0 as Lane,
    playerX: 0,
    playerY: 0,
    velocityY: 0,
    isJumping: false,
    isSliding: false,
    slideTimer: 0,
    speed: 4.9,
    distance: 0,
    runTime: 0, // seconds elapsed
    coins: 0,
    hasShield: true,
    invincibleTimer: 0, // frames of invincibility after shield breaks
    obstacles: [] as Obstacle[],
    coinList: [] as Coin[],
    shieldList: [] as ShieldItem[],
    trackOffset: 0,
    nextObstacleZ: 680,
    nextCoinZ: 380,
    nextShieldZ: 2800,
    lastTime: 0,
  });

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

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
      g.velocityY = 8.5; // gentle, high clearance jump
    }
  }, [gameState]);

  const slide = useCallback(() => {
    if (gameState !== "playing") return;
    const g = gameRef.current;
    if (g.isJumping) {
      g.velocityY = -12; // Fast dive down
    }
    g.isSliding = true;
    g.slideTimer = 45; // ~0.75s of sliding
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
    g.speed = 4.9; // Starting speed (4.9)
    g.distance = 0;
    g.runTime = 0;
    g.coins = 0;
    g.hasShield = true; // Every run starts with 1 free shield!
    g.invincibleTimer = 0;
    g.obstacles = [];
    g.coinList = [];
    g.shieldList = [];
    g.trackOffset = 0;
    g.nextObstacleZ = 680;
    g.nextCoinZ = 380;
    g.nextShieldZ = 3000;
    g.lastTime = performance.now();

    setScore(0);
    setCoinsCollected(0);
    setHasShield(true);
    setSpeedTier("1.0x (Start)");
    setSecondsElapsed(0);
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

      // --- 1. PROGRESSIVE DIFFICULTY BASED ON SURVIVAL TIME ---
      g.runTime += dt;
      g.distance += g.speed * 4.5 * dt;

      // Step-wise progressive acceleration starting from 4.9
      if (g.runTime < 15) {
        g.speed = 4.9; // Starting pace (0-15s)
        setSpeedTier("1.0x (Paced)");
      } else if (g.runTime < 35) {
        g.speed = 5.6; // Cruising (15-35s)
        setSpeedTier("1.15x (Cruising)");
      } else if (g.runTime < 60) {
        g.speed = 6.4; // Speeding (35-60s)
        setSpeedTier("1.3x (Speeding)");
      } else if (g.runTime < 90) {
        g.speed = 7.3; // Fast (60-90s)
        setSpeedTier("1.5x (Fast)");
      } else {
        g.speed = Math.min(9.2, 7.3 + (g.runTime - 90) * 0.03); // Top speed
        setSpeedTier("1.8x (Max)");
      }

      g.trackOffset = (g.trackOffset + g.speed * 1.8) % 100;

      // Decrement invincibility flash timer
      if (g.invincibleTimer > 0) {
        g.invincibleTimer--;
      }

      // Smooth lane movement (responsive interpolation)
      const targetX = g.lane * laneWidth;
      g.playerX += (targetX - g.playerX) * 0.35;

      // Jump Physics (buoyant, floaty jump)
      if (g.isJumping) {
        g.playerY += g.velocityY;
        g.velocityY -= 0.35; // Soft gravity
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

      // --- SPAWN OBSTACLES (CHALLENGING TRACK VARIETY) ---
      if (g.obstacles.length < 12 && g.nextObstacleZ < 2800) {
        const allowedTypes: ObstacleType[] = ["barrier"];
        if (g.runTime > 4) allowedTypes.push("overhead");
        if (g.runTime > 10) allowedTypes.push("train");

        const chosenType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
        const chosenLane = (Math.floor(Math.random() * 3) - 1) as Lane;

        g.obstacles.push({
          id: Math.random(),
          lane: chosenLane,
          z: g.nextObstacleZ,
          type: chosenType,
        });

        // Double-obstacle challenge (leaves 1 safe lane or jumpable gap)
        if (g.runTime > 12 && Math.random() < 0.38) {
          const secondLane = (chosenLane === 0 ? (Math.random() < 0.5 ? -1 : 1) : 0) as Lane;
          g.obstacles.push({
            id: Math.random(),
            lane: secondLane,
            z: g.nextObstacleZ,
            type: chosenType === "train" ? (Math.random() < 0.5 ? "barrier" : "overhead") : chosenType,
          });
        }

        // Active obstacle spacing (tighter and challenging)
        const spacing = g.runTime < 15 ? 560 : Math.max(380, 540 - g.speed * 14);
        g.nextObstacleZ += spacing;
      }

      // --- SPAWN COINS (Abundant lines of 4 coins) ---
      if (g.coinList.length < 16 && g.nextCoinZ < 2400) {
        const coinLane = (Math.floor(Math.random() * 3) - 1) as Lane;
        const count = 4;
        for (let i = 0; i < count; i++) {
          g.coinList.push({
            id: Math.random(),
            lane: coinLane,
            z: g.nextCoinZ + i * 55,
            collected: false,
          });
        }
        g.nextCoinZ += Math.max(450, 680 - g.speed * 10);
      }

      // --- SPAWN SHIELD PICKUP (Every ~35-45s) ---
      if (!g.hasShield && g.shieldList.length === 0 && g.nextShieldZ < 2200) {
        const shieldLane = (Math.floor(Math.random() * 3) - 1) as Lane;
        g.shieldList.push({
          id: Math.random(),
          lane: shieldLane,
          z: g.nextShieldZ,
          collected: false,
        });
        g.nextShieldZ += 2800;
      }

      // Move and clean obstacles (Express trains rush forward towards player!)
      for (const obs of g.obstacles) {
        const obsSpeed = obs.type === "train" ? g.speed * 1.35 : g.speed;
        obs.z -= obsSpeed;
      }
      g.obstacles = g.obstacles.filter((obs) => obs.z > -80);
      g.nextObstacleZ -= g.speed;

      // Move and clean coins
      for (const coin of g.coinList) {
        coin.z -= g.speed;
        if (!coin.collected && coin.z > 20 && coin.z < 95) {
          const laneMatches = coin.lane === g.lane || Math.abs(g.playerX - coin.lane * laneWidth) < laneWidth * 0.55;
          if (laneMatches) {
            coin.collected = true;
            g.coins++;
          }
        }
      }
      g.coinList = g.coinList.filter((c) => c.z > -40);
      g.nextCoinZ -= g.speed;

      // Move and clean shields
      for (const sh of g.shieldList) {
        sh.z -= g.speed;
        if (!sh.collected && sh.z > 20 && sh.z < 95) {
          const laneMatches = sh.lane === g.lane || Math.abs(g.playerX - sh.lane * laneWidth) < laneWidth * 0.55;
          if (laneMatches) {
            sh.collected = true;
            g.hasShield = true;
            setHasShield(true);
          }
        }
      }
      g.shieldList = g.shieldList.filter((s) => s.z > -40);
      g.nextShieldZ -= g.speed;

      // --- COLLISION DETECTION WITH SHIELD PROTECTION ---
      let collisionDetected = false;
      let collidedObstacle: Obstacle | null = null;

      for (const obs of g.obstacles) {
        if (obs.z > 25 && obs.z < 85) {
          const inSameLane = Math.abs(g.playerX - obs.lane * laneWidth) < laneWidth * 0.42;
          if (inSameLane) {
            if (obs.type === "barrier") {
              if (g.playerY < 24) {
                collisionDetected = true;
                collidedObstacle = obs;
                break;
              }
            } else if (obs.type === "overhead") {
              if (!g.isSliding) {
                collisionDetected = true;
                collidedObstacle = obs;
                break;
              }
            } else if (obs.type === "train") {
              collisionDetected = true;
              collidedObstacle = obs;
              break;
            }
          }
        }
      }

      if (collisionDetected && g.invincibleTimer <= 0) {
        if (g.hasShield) {
          // Shield absorbs the crash! Gives player a 2nd chance
          g.hasShield = false;
          g.invincibleTimer = 90; // ~1.5s of invincibility
          setHasShield(false);
          if (collidedObstacle) {
            collidedObstacle.z = -120; // remove hit obstacle
          }
        } else {
          // Game Over only when shield is depleted
          const finalScore = Math.floor(g.distance) + g.coins * 10;
          setScore(finalScore);
          setCoinsCollected(g.coins);
          setSecondsElapsed(Math.floor(g.runTime));
          setHighScore((prev) => {
            const newHigh = Math.max(prev, finalScore);
            localStorage.setItem("subway_runner_highscore", newHigh.toString());
            return newHigh;
          });
          if (finalScore > 0) {
            setShowSubmitModal(true);
          }
          setGameState("gameover");
          return;
        }
      }

      // Live HUD updates
      setScore(Math.floor(g.distance) + g.coins * 10);
      setCoinsCollected(g.coins);
      setSecondsElapsed(Math.floor(g.runTime));

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

      // Horizontal Railroad Ties
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

      // Neon Tunnel Arcs
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

      // Depth sorting for render items
      type Renderable =
        | { kind: "obstacle"; obj: Obstacle; z: number }
        | { kind: "coin"; obj: Coin; z: number }
        | { kind: "shield"; obj: ShieldItem; z: number };

      const renderables: Renderable[] = [
        ...g.obstacles.map((obs) => ({ kind: "obstacle" as const, obj: obs, z: obs.z })),
        ...g.coinList.filter((c) => !c.collected).map((c) => ({ kind: "coin" as const, obj: c, z: c.z })),
        ...g.shieldList.filter((s) => !s.collected).map((s) => ({ kind: "shield" as const, obj: s, z: s.z })),
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

          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 0.55, 0, Math.PI * 2);
          ctx.strokeStyle = "#fef08a";
          ctx.lineWidth = 2 * p.scale;
          ctx.stroke();
          ctx.restore();
        } else if (item.kind === "shield") {
          // Floating Shield Pickup
          const sh = item.obj;
          const p = project(sh.lane * laneWidth, sh.z, 30);
          if (p.scale <= 0) continue;

          const r = Math.max(5, 18 * p.scale);
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = "#38bdf8";
          ctx.shadowColor = "#0284c7";
          ctx.shadowBlur = 14 * p.scale;
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${Math.max(8, 14 * p.scale)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText("🛡️", p.x, p.y + 5 * p.scale);
          ctx.restore();
        } else {
          const obs = item.obj;
          const p = project(obs.lane * laneWidth, obs.z);
          if (p.scale <= 0) continue;

          if (obs.type === "barrier") {
            const bW = laneWidth * 0.85 * p.scale;
            const bH = 38 * p.scale;
            const bX = p.x - bW / 2;
            const bY = p.y - bH;

            ctx.fillStyle = "#334155";
            ctx.fillRect(bX + 4 * p.scale, bY + bH * 0.3, 5 * p.scale, bH * 0.7);
            ctx.fillRect(bX + bW - 9 * p.scale, bY + bH * 0.3, 5 * p.scale, bH * 0.7);

            ctx.fillStyle = "#e11d48";
            ctx.fillRect(bX, bY, bW, bH * 0.65);
            ctx.fillStyle = "#ffffff";
            for (let s = 0; s < bW; s += 16 * p.scale) {
              ctx.fillRect(bX + s, bY, 7 * p.scale, bH * 0.65);
            }
          } else if (obs.type === "overhead") {
            const sW = laneWidth * 0.9 * p.scale;
            const sH = 34 * p.scale;
            const sX = p.x - sW / 2;
            const clearance = 42 * p.scale;
            const sY = p.y - clearance - sH;

            ctx.fillStyle = "#475569";
            ctx.fillRect(sX - 4 * p.scale, sY, 6 * p.scale, clearance + sH);
            ctx.fillRect(sX + sW - 2 * p.scale, sY, 6 * p.scale, clearance + sH);

            ctx.fillStyle = "#ca8a04";
            ctx.fillRect(sX, sY, sW, sH);
            ctx.fillStyle = "#000000";
            for (let s = 0; s < sW; s += 18 * p.scale) {
              ctx.fillRect(sX + s, sY, 8 * p.scale, sH);
            }

            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.max(10, 16 * p.scale)}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText("▼ DUCK ▼", p.x, sY + sH * 0.75);
          } else if (obs.type === "train") {
            const tW = laneWidth * 0.9 * p.scale;
            const tH = 110 * p.scale;
            const tX = p.x - tW / 2;
            const tY = p.y - tH;

            ctx.fillStyle = "#0284c7";
            ctx.fillRect(tX, tY, tW, tH);

            ctx.fillStyle = "#0f172a";
            ctx.fillRect(tX + tW * 0.15, tY + tH * 0.15, tW * 0.7, tH * 0.35);

            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(tX + tW * 0.25, tY + tH * 0.75, 7 * p.scale, 0, Math.PI * 2);
            ctx.arc(tX + tW * 0.75, tY + tH * 0.75, 7 * p.scale, 0, Math.PI * 2);
            ctx.fill();

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

      // Invincibility flash effect
      const isInvincibleFlashing = g.invincibleTimer > 0 && Math.floor(g.invincibleTimer / 4) % 2 === 0;

      if (!isInvincibleFlashing) {
        ctx.save();
        const pScale = playerProj.scale;
        const pX = playerProj.x;
        const pY = playerProj.y;

        // Draw Active Shield Aura
        if (g.hasShield) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
          ctx.lineWidth = 3.5 * pScale;
          ctx.beginPath();
          ctx.arc(pX, pY - 24 * pScale, 36 * pScale, 0, Math.PI * 2);
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 12 * pScale;
          ctx.stroke();
        }

        if (g.isSliding) {
          const duckW = 46 * pScale;
          const duckH = 22 * pScale;
          ctx.fillStyle = "#6366f1";
          ctx.fillRect(pX - duckW / 2, pY - duckH, duckW, duckH);

          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.arc(pX + duckW * 0.3, pY - duckH * 0.6, 9 * pScale, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.fillRect(pX - duckW * 0.8, pY - 5 * pScale, 6 * pScale, 3 * pScale);
          ctx.fillRect(pX - duckW * 0.6, pY - 8 * pScale, 8 * pScale, 4 * pScale);
        } else {
          const bodyW = 28 * pScale;
          const bodyH = 46 * pScale;

          const runCycle = Math.sin((g.distance * 0.5) % (Math.PI * 2));
          const legOffset = g.isJumping ? 0 : runCycle * 7 * pScale;

          ctx.fillStyle = "#1e293b";
          ctx.fillRect(pX - bodyW * 0.45, pY - 18 * pScale + legOffset, 8 * pScale, 18 * pScale);
          ctx.fillRect(pX + bodyW * 0.15, pY - 18 * pScale - legOffset, 8 * pScale, 18 * pScale);

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(pX - bodyW * 0.5, pY - 4 * pScale + legOffset, 10 * pScale, 4 * pScale);
          ctx.fillRect(pX + bodyW * 0.1, pY - 4 * pScale - legOffset, 10 * pScale, 4 * pScale);

          ctx.fillStyle = "#4f46e5";
          ctx.fillRect(pX - bodyW / 2, pY - bodyH, bodyW, bodyH * 0.65);

          ctx.fillStyle = "#10b981";
          ctx.fillRect(pX - bodyW * 0.6, pY - bodyH * 0.9, 6 * pScale, bodyH * 0.45);

          ctx.fillStyle = "#fed7aa";
          ctx.beginPath();
          ctx.arc(pX, pY - bodyH - 10 * pScale, 10 * pScale, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#f43f5e";
          ctx.beginPath();
          ctx.arc(pX, pY - bodyH - 12 * pScale, 11 * pScale, Math.PI, 0, false);
          ctx.fill();
          ctx.fillRect(pX - 4 * pScale, pY - bodyH - 13 * pScale, 18 * pScale, 4 * pScale);
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-lg mx-auto">
      {/* Top HUD Stats Bar */}
      <div className="w-full flex justify-between items-center mb-3 bg-white px-4 py-2.5 rounded-2xl border border-gray-200 shadow-sm gap-2">
        {/* Score & Time */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Score</span>
            <span className="text-xl font-black text-gray-900 leading-none">{score}</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-xs font-bold text-gray-600">
            <Timer className="w-3.5 h-3.5 text-indigo-500" />
            {formatTime(secondsElapsed)}
          </div>
        </div>

        {/* Shield Indicator */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
            hasShield
              ? "bg-sky-50 text-sky-700 border border-sky-200"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {hasShield ? <Shield className="w-3.5 h-3.5 text-sky-500 fill-sky-400" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          {hasShield ? "Shield 1x" : "Shield Empty"}
        </div>

        {/* Coins */}
        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
          <Coins className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span className="text-base font-black text-amber-700 leading-none">{coinsCollected}</span>
        </div>

        {/* Best Score */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center">
            <Trophy className="w-3 h-3 mr-1 text-amber-500" /> Best
          </span>
          <span className="text-xl font-black text-amber-600 leading-none">{highScore}</span>
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

        {/* Live Speed Tier Tag in Top Left */}
        {gameState === "playing" && (
          <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-bold text-slate-300">
            Speed: <span className="text-emerald-400">{speedTier}</span>
          </div>
        )}

        {/* Start Menu Overlay */}
        {gameState === "menu" && (
          <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/40 animate-bounce">
              <Zap className="w-8 h-8 text-white fill-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Subway Runner</h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xs mb-3 font-medium leading-relaxed">
              Starts calm & easy, accelerates as you survive! Collect coins and use your free shield to stay alive.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/30 rounded-full text-xs font-bold mb-6">
              <Shield className="w-3.5 h-3.5" /> 1 Free Shield Included!
            </div>
            <button
              type="button"
              onClick={startGame}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full font-black text-base shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" /> Start Run
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in">
            <span className="text-rose-500 font-black tracking-widest uppercase text-xs mb-1">Run Finished!</span>
            <h2 className="text-3xl font-black mb-4">Game Over</h2>

            <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-inner">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-bold">Score</span>
                <span className="text-xl font-black text-white">{score}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-bold">Time Survived</span>
                <span className="text-base font-black text-indigo-400 flex items-center gap-1">
                  <Timer className="w-3.5 h-3.5" /> {formatTime(secondsElapsed)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-bold">Coins Picked</span>
                <span className="text-base font-black text-amber-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> {coinsCollected}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> High Score
                </span>
                <span className="text-lg font-black text-amber-400">{highScore}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={startGame}
                className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-sm sm:text-base shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
              {score > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-7 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-full font-black text-sm sm:text-base shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" /> Save Score
                </button>
              )}
            </div>
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

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={score}
        gameId="subway"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
