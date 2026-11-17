/* eslint-disable */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Zap, 
  Shield, 
  Coins, 
  Gauge, 
  Flame, 
  Compass,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

// Highway geometry constants
const ROAD_WIDTH = 480;
const LANES_COUNT = 4;
const LANE_WIDTH = ROAD_WIDTH / LANES_COUNT; // 120px per lane
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ROAD_LEFT = (CANVAS_WIDTH - ROAD_WIDTH) / 2; // 160px
const ROAD_RIGHT = ROAD_LEFT + ROAD_WIDTH; // 640px

type VehicleType = "sedan" | "sport" | "truck" | "semi" | "police";

interface TrafficCar {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // world speed
  targetLane: number;
  currentLane: number;
  isChangingLane: boolean;
  laneChangeProgress: number;
  blinkerTimer: number;
  color: string;
  type: VehicleType;
  passed: boolean;
  nearMissed: boolean;
  brakeLight: boolean;
  isAggressive?: boolean; // Tries to cut off or sideswipe player
  isOncoming?: boolean;   // Barrelling down the wrong way towards player
  swerveTimer?: number;
  warningTimer?: number;
}

interface Collectible {
  id: number;
  type: "coin" | "nitro" | "shield" | "magnet";
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  rotation: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface ToastMessage {
  id: number;
  text: string;
  subtext?: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
}

export default function CarRacingGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [coinsCollected, setCoinsCollected] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<string>("0.00");
  const [topSpeedReached, setTopSpeedReached] = useState<number>(0);
  const [nearMissCount, setNearMissCount] = useState<number>(0);
  const [hasShield, setHasShield] = useState<boolean>(true);
  const [nitroAmount, setNitroAmount] = useState<number>(100);
  // Audio removed — sound disabled per user preference

  // Mutable Game Engine state
  const gameRef = useRef({
    playerX: ROAD_LEFT + ROAD_WIDTH / 2,
    playerY: 480,
    playerVx: 0,
    playerWidth: 44,
    playerHeight: 82,
    speed: 70, // km/h (cruising start)
    targetSpeed: 70,
    maxSpeedNormal: 140,
    maxSpeedNitro: 215,
    minSpeed: 45,
    accel: 0.8,
    decel: 1.2,
    distanceMeters: 0,
    coins: 0,
    nearMisses: 0,
    topSpeed: 70,
    hasShield: true,
    invincibleTimer: 0, // frames of invulnerability
    nitro: 100, // 0 to 100
    isBoosting: false,
    magnetTimer: 0,
    
    // Inputs
    leftPressed: false,
    rightPressed: false,
    upPressed: false,
    downPressed: false,

    // Traffic & Items
    traffic: [] as TrafficCar[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    toasts: [] as ToastMessage[],
    
    roadOffset: 0,
    nextSpawnDistance: 300,
    nextItemDistance: 400,
    timeOfDay: 0, // 0 = day, 1 = sunset, 2 = night
    environmentTimer: 0,
    shakeIntensity: 0,
    lastFrameTime: 0,
  });

  // Read saved high score
  useEffect(() => {
    const saved = localStorage.getItem("highway_racer_highscore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  // Start / Reset Game
  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.playerX = ROAD_LEFT + ROAD_WIDTH / 2;
    g.playerY = 480;
    g.playerVx = 0;
    g.speed = 65; // gentle warmup cruising speed
    g.targetSpeed = 65;
    g.distanceMeters = 0;
    g.coins = 0;
    g.nearMisses = 0;
    g.topSpeed = 65;
    g.hasShield = true;
    g.invincibleTimer = 0;
    g.nitro = 100;
    g.isBoosting = false;
    g.magnetTimer = 0;
    g.traffic = [];
    g.collectibles = [];
    g.particles = [];
    g.toasts = [];
    g.roadOffset = 0;
    g.nextSpawnDistance = 150;
    g.nextItemDistance = 250;
    g.timeOfDay = 0;
    g.environmentTimer = 0;
    g.shakeIntensity = 0;
    g.lastFrameTime = performance.now();

    setScore(0);
    setCoinsCollected(0);
    setDistanceKm("0.00");
    setTopSpeedReached(65);
    setNearMissCount(0);
    setHasShield(true);
    setNitroAmount(100);
    setGameState("playing");
  }, []);

  // Traffic Spawner
  const spawnTraffic = (g: typeof gameRef.current) => {
    const laneIndex = Math.floor(Math.random() * LANES_COUNT);
    const laneCenter = ROAD_LEFT + laneIndex * LANE_WIDTH + LANE_WIDTH / 2;

    // Check if lane is already occupied near top
    const isOccupied = g.traffic.some(c => c.currentLane === laneIndex && c.y < 120);
    if (isOccupied) return;

    // Vehicle types
    const types: VehicleType[] = ["sedan", "sedan", "sport", "truck", "semi", "police"];
    const type = types[Math.floor(Math.random() * types.length)];

    let width = 42;
    let height = 78;
    let carSpeed = 45 + Math.random() * 35; // base speed of traffic car in km/h
    let color = "#3b82f6"; // default blue

    // 20% chance of high-speed ONCOMING car after 80 meters (driving wrong way straight at player)
    const isOncoming = g.distanceMeters > 80 && Math.random() < 0.22;
    // 40% chance of AGGRESSIVE driver trying to swerve and hit/cut-off the player
    const isAggressive = !isOncoming && (Math.random() < 0.42 || type === "police" || type === "sport");

    if (isOncoming) {
      color = "#dc2626"; // Crimson danger car
      carSpeed = 85 + Math.random() * 30;
      width = 44;
      height = 78;
    } else if (type === "sedan") {
      const colors = ["#2563eb", "#dc2626", "#eab308", "#f8fafc", "#475569"];
      color = colors[Math.floor(Math.random() * colors.length)];
      width = 42;
      height = 76;
    } else if (type === "sport") {
      color = "#8b5cf6"; // vibrant purple
      width = 44;
      height = 78;
      carSpeed = 75 + Math.random() * 30; // fast sports car
    } else if (type === "truck") {
      color = "#d97706"; // amber work truck
      width = 46;
      height = 92;
      carSpeed = 40 + Math.random() * 20;
    } else if (type === "semi") {
      color = "#059669"; // emerald semi trailer
      width = 50;
      height = 145; // very long truck!
      carSpeed = 35 + Math.random() * 15;
    } else if (type === "police") {
      color = "#0f172a"; // dark police cruiser
      width = 44;
      height = 80;
      carSpeed = 70 + Math.random() * 25;
    }

    g.traffic.push({
      id: Date.now() + Math.random(),
      x: laneCenter,
      y: -height - 30,
      width,
      height,
      speed: carSpeed,
      currentLane: laneIndex,
      targetLane: laneIndex,
      isChangingLane: false,
      laneChangeProgress: 0,
      blinkerTimer: 0,
      color,
      type,
      passed: false,
      nearMissed: false,
      brakeLight: false,
      isOncoming,
      isAggressive,
      swerveTimer: 0,
      warningTimer: 0,
    });

    // Roadblock / Pinch: 28% chance after 60m of a second car spawning in an adjacent lane
    if (g.distanceMeters > 60 && Math.random() < 0.28 && !isOncoming) {
      const neighborLane = laneIndex > 0 ? laneIndex - 1 : laneIndex + 1;
      const neighborCenter = ROAD_LEFT + neighborLane * LANE_WIDTH + LANE_WIDTH / 2;
      const alreadyHasCar = g.traffic.some(c => c.currentLane === neighborLane && c.y < 150);
      if (!alreadyHasCar) {
        g.traffic.push({
          id: Date.now() + Math.random() + 99,
          x: neighborCenter,
          y: -height - 60 - Math.random() * 40,
          width: 42,
          height: 76,
          speed: carSpeed * 0.95,
          currentLane: neighborLane,
          targetLane: neighborLane,
          isChangingLane: false,
          laneChangeProgress: 0,
          blinkerTimer: 0,
          color: "#eab308",
          type: "sedan",
          passed: false,
          nearMissed: false,
          brakeLight: false,
          isOncoming: false,
          isAggressive: false,
        });
      }
    }
  };

  // Collectible Spawner
  const spawnCollectible = (g: typeof gameRef.current) => {
    const laneIndex = Math.floor(Math.random() * LANES_COUNT);
    const laneCenter = ROAD_LEFT + laneIndex * LANE_WIDTH + LANE_WIDTH / 2;

    const rand = Math.random();
    let type: "coin" | "nitro" | "shield" | "magnet" = "coin";

    if (rand < 0.65) {
      type = "coin";
    } else if (rand < 0.85) {
      type = "nitro";
    } else if (rand < 0.94) {
      type = "shield";
    } else {
      type = "magnet";
    }

    // Spawn 1 or a cluster of coins
    if (type === "coin") {
      for (let i = 0; i < 3; i++) {
        g.collectibles.push({
          id: Date.now() + Math.random() + i,
          type: "coin",
          x: laneCenter,
          y: -40 - i * 45,
          radius: 12,
          collected: false,
          rotation: 0,
        });
      }
    } else {
      g.collectibles.push({
        id: Date.now() + Math.random(),
        type,
        x: laneCenter,
        y: -40,
        radius: 16,
        collected: false,
        rotation: 0,
      });
    }
  };

  // Add floating toast
  const addToast = (g: typeof gameRef.current, text: string, subtext: string | undefined, x: number, y: number, color: string) => {
    g.toasts.push({
      id: Date.now() + Math.random(),
      text,
      subtext,
      x,
      y,
      alpha: 1.0,
      color,
    });
  };

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }
      const g = gameRef.current;
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") g.leftPressed = true;
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") g.rightPressed = true;
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w" || e.key === " ") {
        g.upPressed = true;
      }
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        g.downPressed = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") g.leftPressed = false;
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") g.rightPressed = false;
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w" || e.key === " ") {
        g.upPressed = false;
      }
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        g.downPressed = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Main Game Loop
  useEffect(() => {
    if (gameState !== "playing") return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = (currentTime: number) => {
      const g = gameRef.current;
      const dt = Math.min((currentTime - g.lastFrameTime) / 1000, 0.05); // clamp delta
      g.lastFrameTime = currentTime;

      // 1. SPEED & ACCELERATION PHYSICS
      // Base cruising speed naturally increases gently over time/distance to retain players
      const naturalSpeedRamp = Math.min(30, (g.distanceMeters / 1000) * 8);
      const currentNormalMax = g.maxSpeedNormal + naturalSpeedRamp;

      if (g.upPressed && g.nitro > 5) {
        // NITRO BOOST ACTIVATED!
        g.isBoosting = true;
        g.nitro = Math.max(0, g.nitro - 28 * dt);
        g.targetSpeed = g.maxSpeedNitro;
        g.accel = 1.6;
        g.shakeIntensity = Math.max(g.shakeIntensity, 1.5);

        // Spawn nitro exhaust particles
        if (Math.random() < 0.8) {
          g.particles.push({
            x: g.playerX - 12 + Math.random() * 24,
            y: g.playerY + g.playerHeight / 2 + 5,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 4 + Math.random() * 4,
            life: 1.0,
            maxLife: 0.25,
            color: Math.random() < 0.6 ? "#38bdf8" : "#0284c7",
            size: 4 + Math.random() * 5,
          });
        }
      } else {
        g.isBoosting = false;
        // Slowly recharge nitro when driving fast
        g.nitro = Math.min(100, g.nitro + 4.5 * dt);

        if (g.downPressed) {
          // BRAKING
          g.targetSpeed = g.minSpeed;
          g.decel = 2.4;
          // Spawn brake smoke
          if (Math.random() < 0.3) {
            g.particles.push({
              x: g.playerX - 16 + (Math.random() < 0.5 ? 0 : 32),
              y: g.playerY + g.playerHeight / 2,
              vx: (Math.random() - 0.5) * 2,
              vy: 2 + Math.random() * 2,
              life: 1.0,
              maxLife: 0.3,
              color: "#cbd5e1",
              size: 5 + Math.random() * 6,
            });
          }
        } else {
          // Normal cruising throttle
          g.targetSpeed = currentNormalMax;
          g.accel = 0.7;
        }
      }

      // Smoothly approach target speed
      if (g.speed < g.targetSpeed) {
        g.speed = Math.min(g.targetSpeed, g.speed + g.accel * 40 * dt);
      } else if (g.speed > g.targetSpeed) {
        g.speed = Math.max(g.targetSpeed, g.speed - (g.downPressed ? g.decel : 0.8) * 45 * dt);
      }

      // Track top speed
      if (g.speed > g.topSpeed) {
        g.topSpeed = Math.round(g.speed);
      }

      // 2. STEERING PHYSICS
      const steerSpeed = (480 + (g.speed / 200) * 120) * dt;
      if (g.leftPressed) g.playerVx = Math.max(-12, g.playerVx - 1.8);
      else if (g.rightPressed) g.playerVx = Math.min(12, g.playerVx + 1.8);
      else g.playerVx *= 0.82; // friction dampening

      g.playerX += g.playerVx * (steerSpeed / 10);

      // Clamp player within road boundaries (with soft bumper)
      const minX = ROAD_LEFT + g.playerWidth / 2 + 10;
      const maxX = ROAD_RIGHT - g.playerWidth / 2 - 10;
      if (g.playerX < minX) {
        g.playerX = minX;
        g.playerVx = 0;
        g.shakeIntensity = 1.0;
      } else if (g.playerX > maxX) {
        g.playerX = maxX;
        g.playerVx = 0;
        g.shakeIntensity = 1.0;
      }

      // 3. ROAD & DISTANCE ADVANCEMENT
      // Player relative world scroll speed:
      const worldScrollSpeed = (g.speed / 3.6) * 18 * dt; // pixels per second
      g.roadOffset = (g.roadOffset + worldScrollSpeed) % 80;
      g.distanceMeters += (g.speed / 3.6) * dt;

      // Update audio

      // Magnet timer countdown
      if (g.magnetTimer > 0) {
        g.magnetTimer -= dt;
      }

      // Invincibility countdown
      if (g.invincibleTimer > 0) {
        g.invincibleTimer -= dt;
      }

      // Environment Day/Night timer (cycles every 50 seconds)
      g.environmentTimer += dt;
      if (g.environmentTimer > 50) {
        g.environmentTimer = 0;
        g.timeOfDay = (g.timeOfDay + 1) % 3;
      }

      // 4. SPAWN LOGIC
      // Traffic Spawning: distance between cars gets slightly tighter as distance increases
      const trafficInterval = Math.max(160, 320 - (g.distanceMeters / 1000) * 20);
      if (g.distanceMeters >= g.nextSpawnDistance) {
        spawnTraffic(g);
        g.nextSpawnDistance = g.distanceMeters + trafficInterval + Math.random() * 80;
      }

      // Collectible Spawning
      if (g.distanceMeters >= g.nextItemDistance) {
        spawnCollectible(g);
        g.nextItemDistance = g.distanceMeters + 200 + Math.random() * 150;
      }

      // 5. UPDATE TRAFFIC CARS
      for (let i = g.traffic.length - 1; i >= 0; i--) {
        const car = g.traffic[i];
        
        // Relative speed of traffic car against player
        // Oncoming cars barrel down towards the player at combined speed!
        const effectiveSpeed = car.isOncoming ? -car.speed : car.speed;
        const relSpeed = ((g.speed - effectiveSpeed) / 3.6) * 18 * dt;
        car.y += relSpeed;

        // AGGRESSIVE CUT-OFF & SIDESWIPE AI ("Car trying to hit player")
        if (car.isAggressive && !car.passed && car.y > -20 && car.y < g.playerY + 40) {
          const dy = g.playerY - car.y;
          if (dy < 260 && dy > -30) {
            const dx = g.playerX - car.x;
            // If player is in an adjacent lane or approaching, swerve toward player's lane!
            if (Math.abs(dx) > 12 && Math.abs(dx) < 150) {
              const swerveSpeed = (95 + Math.min(60, (g.distanceMeters / 1000) * 20)) * dt;
              car.x += Math.sign(dx) * swerveSpeed;
              car.isChangingLane = true;
              car.blinkerTimer = (car.blinkerTimer + dt * 10) % 1;

              // Brake check if directly in front
              if (dy < 130 && Math.abs(dx) < 50) {
                car.brakeLight = true;
              }

              // Spawn swerving tire smoke
              if (Math.random() < 0.2) {
                g.particles.push({
                  x: car.x - 12 + Math.random() * 24,
                  y: car.y + car.height / 2,
                  vx: (Math.random() - 0.5) * 2,
                  vy: 2,
                  life: 0.8,
                  maxLife: 0.25,
                  color: "#e2e8f0",
                  size: 3 + Math.random() * 3,
                });
              }
            }
          }
        } else if (!car.isChangingLane && Math.random() < 0.005 && car.y > -50 && car.y < 350 && !car.isOncoming) {
          // Normal AI lane change
          const possibleLanes: number[] = [];
          if (car.currentLane > 0) possibleLanes.push(car.currentLane - 1);
          if (car.currentLane < LANES_COUNT - 1) possibleLanes.push(car.currentLane + 1);
          if (possibleLanes.length > 0) {
            car.targetLane = possibleLanes[Math.floor(Math.random() * possibleLanes.length)];
            car.isChangingLane = true;
            car.laneChangeProgress = 0;
          }
        }

        if (car.isChangingLane && !car.isAggressive) {
          car.blinkerTimer = (car.blinkerTimer + dt * 6) % 1;
          car.laneChangeProgress += dt * 1.3;
          const startX = ROAD_LEFT + car.currentLane * LANE_WIDTH + LANE_WIDTH / 2;
          const endX = ROAD_LEFT + car.targetLane * LANE_WIDTH + LANE_WIDTH / 2;
          car.x = startX + (endX - startX) * Math.min(1, car.laneChangeProgress);

          if (car.laneChangeProgress >= 1) {
            car.isChangingLane = false;
            car.currentLane = car.targetLane;
          }
        }

        // NEAR MISS DETECTION:
        if (!car.passed && car.y > g.playerY) {
          car.passed = true;
          const dx = Math.abs(car.x - g.playerX);
          if (dx < 66 && dx > 24 && g.speed >= 85 && !car.nearMissed) {
            car.nearMissed = true;
            g.nearMisses++;
            const bonus = car.isOncoming ? 250 : 100 * (g.isBoosting ? 2 : 1);
            g.coins += car.isOncoming ? 15 : 5;
            g.nitro = Math.min(100, g.nitro + (car.isOncoming ? 30 : 15));
            const toastText = car.isOncoming ? `HEAD-ON DODGE! +${bonus}` : `NEAR MISS! +${bonus}`;
            const toastSub = car.isOncoming ? "RISKY DANGER DODGE" : "CLOSE OVERTAKE BONUS";
            addToast(g, toastText, toastSub, car.x, car.y, car.isOncoming ? "#ef4444" : "#f59e0b");
          }
        }

        // COLLISION CHECK
        // Hitbox overlap check
        const xOverlap = Math.abs(car.x - g.playerX) < (car.width + g.playerWidth) * 0.44;
        const yOverlap = Math.abs(car.y - g.playerY) < (car.height + g.playerHeight) * 0.44;

        if (xOverlap && yOverlap) {
          if (g.invincibleTimer <= 0) {
            if (g.hasShield) {
              // Absorbed by Shield / Armor!
              g.hasShield = false;
              setHasShield(false);
              g.invincibleTimer = 2.0; // 2 seconds of flashing invulnerability
              g.shakeIntensity = 8.0;
              g.speed = Math.max(g.minSpeed, g.speed * 0.6); // slow down on impact
              addToast(g, "SHIELD BROKEN!", "ARMOR SAVED YOU", g.playerX, g.playerY - 40, "#38bdf8");

              // Spawn shield explosion sparks
              for (let p = 0; p < 20; p++) {
                g.particles.push({
                  x: g.playerX,
                  y: g.playerY,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  life: 1.0,
                  maxLife: 0.4,
                  color: "#38bdf8",
                  size: 4 + Math.random() * 4,
                });
              }
            } else {
              // GAME OVER! CRASH!
              g.shakeIntensity = 15.0;

              // Massive crash particle burst
              for (let p = 0; p < 35; p++) {
                g.particles.push({
                  x: g.playerX,
                  y: g.playerY,
                  vx: (Math.random() - 0.5) * 12,
                  vy: (Math.random() - 0.5) * 12,
                  life: 1.0,
                  maxLife: 0.6,
                  color: Math.random() < 0.5 ? "#f43f5e" : "#fbbf24",
                  size: 6 + Math.random() * 6,
                });
              }

              // Final calculations
              const finalDistanceKm = (g.distanceMeters / 1000).toFixed(2);
              const finalScore = Math.floor(g.distanceMeters + g.coins * 25 + g.nearMisses * 100);

              setDistanceKm(finalDistanceKm);
              setScore(finalScore);
              setCoinsCollected(g.coins);
              setTopSpeedReached(g.topSpeed);
              setNearMissCount(g.nearMisses);

              if (finalScore > highScore) {
                setHighScore(finalScore);
                localStorage.setItem("highway_racer_highscore", finalScore.toString());
              }

              setGameState("gameover");
              return;
            }
          }
        }

        // Remove cars far behind or ahead
        if (car.y > CANVAS_HEIGHT + 200 || car.y < -350) {
          g.traffic.splice(i, 1);
        }
      }

      // 6. UPDATE COLLECTIBLES
      for (let i = g.collectibles.length - 1; i >= 0; i--) {
        const item = g.collectibles[i];
        const relSpeed = (g.speed / 3.6) * 18 * dt;
        item.y += relSpeed;
        item.rotation += dt * 4;

        // Magnet attraction
        if (g.magnetTimer > 0 && item.type === "coin") {
          const dx = g.playerX - item.x;
          const dy = g.playerY - item.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 260) {
            item.x += (dx / dist) * 350 * dt;
            item.y += (dy / dist) * 350 * dt;
          }
        }

        // Pickup collision
        const distToPlayer = Math.hypot(item.x - g.playerX, item.y - g.playerY);
        if (distToPlayer < item.radius + g.playerWidth * 0.45 && !item.collected) {
          item.collected = true;

          if (item.type === "coin") {
            g.coins++;
            addToast(g, "+10", undefined, item.x, item.y, "#fbbf24");
          } else if (item.type === "nitro") {
            g.nitro = 100;
            addToast(g, "NITRO FULL!", undefined, item.x, item.y, "#38bdf8");
          } else if (item.type === "shield") {
            g.hasShield = true;
            setHasShield(true);
            addToast(g, "SHIELD ACTIVE!", undefined, item.x, item.y, "#34d399");
          } else if (item.type === "magnet") {
            g.magnetTimer = 8.0;
            addToast(g, "COIN MAGNET!", undefined, item.x, item.y, "#c084fc");
          }

          g.collectibles.splice(i, 1);
          continue;
        }

        if (item.y > CANVAS_HEIGHT + 100) {
          g.collectibles.splice(i, 1);
        }
      }

      // 7. PARTICLES UPDATE
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt / p.maxLife;
        if (p.life <= 0) {
          g.particles.splice(i, 1);
        }
      }

      // 8. TOASTS UPDATE
      for (let i = g.toasts.length - 1; i >= 0; i--) {
        const t = g.toasts[i];
        t.y -= 40 * dt;
        t.alpha -= dt * 1.2;
        if (t.alpha <= 0) {
          g.toasts.splice(i, 1);
        }
      }

      // Update React UI states periodically
      setNitroAmount(Math.round(g.nitro));
      setDistanceKm((g.distanceMeters / 1000).toFixed(2));
      setScore(Math.floor(g.distanceMeters + g.coins * 25 + g.nearMisses * 100));

      // ---------------- RENDER FRAME ----------------
      ctx.save();

      // Screen Shake
      if (g.shakeIntensity > 0) {
        const shakeX = (Math.random() - 0.5) * g.shakeIntensity;
        const shakeY = (Math.random() - 0.5) * g.shakeIntensity;
        ctx.translate(shakeX, shakeY);
        g.shakeIntensity = Math.max(0, g.shakeIntensity - dt * 25);
      }

      // Clear Canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Environment Background (Grass / Roadside)
      let grassColor = "#15803d"; // lush green
      let skyColor = "#0f172a";
      if (g.timeOfDay === 1) { // Sunset
        grassColor = "#78350f";
        skyColor = "#4c0519";
      } else if (g.timeOfDay === 2) { // Night
        grassColor = "#022c22";
        skyColor = "#020617";
      }

      ctx.fillStyle = grassColor;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Distant Horizon Line / Roadside Trees
      for (let y = -40; y < CANVAS_HEIGHT + 40; y += 75) {
        const treeY = (y + g.roadOffset * 1.5) % (CANVAS_HEIGHT + 80) - 40;
        // Left roadside trees
        ctx.fillStyle = "#166534";
        ctx.beginPath();
        ctx.arc(80, treeY, 24, 0, Math.PI * 2);
        ctx.fill();
        // Right roadside trees
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH - 80, treeY, 24, 0, Math.PI * 2);
        ctx.fill();
      }

      // ASPHALT HIGHWAY SURFACE
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, CANVAS_HEIGHT);

      // CURBS & RUMBLE STRIPS (Red & White Alternating)
      const curbWidth = 14;
      const stripeHeight = 40;
      for (let y = -stripeHeight; y < CANVAS_HEIGHT + stripeHeight; y += stripeHeight) {
        const curbY = (y + g.roadOffset) % (CANVAS_HEIGHT + stripeHeight) - stripeHeight;
        const isRed = Math.floor((y + g.roadOffset) / stripeHeight) % 2 === 0;
        ctx.fillStyle = isRed ? "#dc2626" : "#f8fafc";
        // Left curb
        ctx.fillRect(ROAD_LEFT - curbWidth, curbY, curbWidth, stripeHeight);
        // Right curb
        ctx.fillRect(ROAD_RIGHT, curbY, curbWidth, stripeHeight);
      }

      // ROAD LANE MARKINGS
      // Solid outer shoulder lines
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(ROAD_LEFT + 4, 0, 3, CANVAS_HEIGHT);
      ctx.fillRect(ROAD_RIGHT - 7, 0, 3, CANVAS_HEIGHT);

      // Dashed lane divider lines
      const dashLength = 32;
      const gapLength = 32;
      const totalDash = dashLength + gapLength;
      ctx.fillStyle = "#fbbf24"; // yellow dashes

      for (let lane = 1; lane < LANES_COUNT; lane++) {
        const dividerX = ROAD_LEFT + lane * LANE_WIDTH;
        for (let y = -totalDash; y < CANVAS_HEIGHT + totalDash; y += totalDash) {
          const dashY = (y + g.roadOffset) % (CANVAS_HEIGHT + totalDash) - totalDash;
          ctx.fillRect(dividerX - 2, dashY, 4, dashLength);
        }
      }

      // NIGHT LIGHTING EFFECT: Headlight cones onto road
      if (g.timeOfDay === 2) {
        // Night Highway Darkness Overlay
        ctx.fillStyle = "rgba(2, 6, 23, 0.7)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Player Headlights
        const grad = ctx.createRadialGradient(
          g.playerX, g.playerY - 20, 10,
          g.playerX, g.playerY - 220, 240
        );
        grad.addColorStop(0, "rgba(255, 255, 240, 0.45)");
        grad.addColorStop(0.5, "rgba(255, 255, 200, 0.15)");
        grad.addColorStop(1, "rgba(255, 255, 200, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(g.playerX - 20, g.playerY - 10);
        ctx.lineTo(g.playerX - 110, g.playerY - 260);
        ctx.lineTo(g.playerX + 110, g.playerY - 260);
        ctx.lineTo(g.playerX + 20, g.playerY - 10);
        ctx.closePath();
        ctx.fill();
      }

      // DRAW COLLECTIBLES
      g.collectibles.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);

        if (item.type === "coin") {
          // Spinning 3D Coin
          const scaleX = Math.cos(item.rotation);
          ctx.scale(scaleX, 1);
          ctx.fillStyle = "#eab308";
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#fef08a";
          ctx.lineWidth = 2.5;
          ctx.stroke();
          // Coin core symbol
          ctx.fillStyle = "#a16207";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("$", 0, 1);
        } else if (item.type === "nitro") {
          // Blue Nitro Canister
          ctx.fillStyle = "#0284c7";
          ctx.fillRect(-10, -14, 20, 28);
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(-8, -12, 16, 24);
          ctx.fillStyle = "#f8fafc";
          ctx.font = "bold 10px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("N2O", 0, 0);
        } else if (item.type === "shield") {
          // Cyan Shield Orb
          ctx.fillStyle = "#06b6d4";
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#67e8f9";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🛡", 0, 0);
        } else if (item.type === "magnet") {
          // Purple Magnet
          ctx.fillStyle = "#a855f7";
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#e9d5ff";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("🧲", 0, 0);
        }

        ctx.restore();
      });

      // DRAW TRAFFIC CARS
      g.traffic.forEach(car => {
        // Draw incoming danger alert at top of lane if car is oncoming
        if (car.isOncoming && car.y < 120 && car.y > -250) {
          ctx.save();
          const isPulse = Math.floor(currentTime / 120) % 2 === 0;
          if (isPulse) {
            ctx.fillStyle = "#ef4444";
            ctx.font = "900 13px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("⚠️ ONCOMING!", car.x, 32);
          }
          ctx.restore();
        }

        ctx.save();
        ctx.translate(car.x, car.y);

        // If oncoming, flip vehicle 180 degrees so it faces the player
        if (car.isOncoming) {
          ctx.rotate(Math.PI);
        }

        // Car Drop Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(-car.width / 2 + 3, -car.height / 2 + 5, car.width, car.height);

        // Tires
        ctx.fillStyle = "#0f172a";
        const tw = 7;
        const th = 16;
        ctx.fillRect(-car.width / 2 - 2, -car.height / 2 + 10, tw, th);
        ctx.fillRect(car.width / 2 - 5, -car.height / 2 + 10, tw, th);
        ctx.fillRect(-car.width / 2 - 2, car.height / 2 - 24, tw, th);
        ctx.fillRect(car.width / 2 - 5, car.height / 2 - 24, tw, th);

        // Body Shell
        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.roundRect(-car.width / 2, -car.height / 2, car.width, car.height, 8);
        ctx.fill();

        // Windshields & Roof
        ctx.fillStyle = "#1e293b";
        // Front windshield
        ctx.fillRect(-car.width / 2 + 5, -car.height / 2 + 16, car.width - 10, 14);
        // Rear windshield
        ctx.fillRect(-car.width / 2 + 5, car.height / 2 - 26, car.width - 10, 10);
        // Roof
        ctx.fillStyle = car.color;
        ctx.fillRect(-car.width / 2 + 6, -car.height / 2 + 28, car.width - 12, car.height - 54);

        // Semi Truck Trailer Details
        if (car.type === "semi") {
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(-car.width / 2 + 4, -car.height / 2 + 38, car.width - 8, car.height - 46);
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-car.width / 2 + 4, -car.height / 2 + 38, car.width - 8, car.height - 46);
        }

        // Police Lights Bar
        if (car.type === "police") {
          const isRed = Math.floor(currentTime / 120) % 2 === 0;
          ctx.fillStyle = isRed ? "#ef4444" : "#3b82f6";
          ctx.fillRect(-14, -car.height / 2 + 30, 12, 6);
          ctx.fillStyle = isRed ? "#3b82f6" : "#ef4444";
          ctx.fillRect(2, -car.height / 2 + 30, 12, 6);
        }

        // Taillights or Oncoming Headlights
        if (car.isOncoming) {
          // Oncoming High-Beam Headlights pointing at player!
          ctx.fillStyle = "#fef08a";
          ctx.fillRect(-car.width / 2 + 4, car.height / 2 - 4, 8, 4);
          ctx.fillRect(car.width / 2 - 12, car.height / 2 - 4, 8, 4);
        } else {
          // Standard Taillights
          ctx.fillStyle = car.brakeLight ? "#ff0033" : "#ef4444";
          ctx.fillRect(-car.width / 2 + 4, car.height / 2 - 4, 8, car.brakeLight ? 6 : 4);
          ctx.fillRect(car.width / 2 - 12, car.height / 2 - 4, 8, car.brakeLight ? 6 : 4);
        }

        // Lane Change Blinker Light
        if (car.isChangingLane && car.blinkerTimer > 0.5) {
          ctx.fillStyle = "#fbbf24";
          const blinkX = car.targetLane > car.currentLane ? car.width / 2 - 4 : -car.width / 2;
          ctx.beginPath();
          ctx.arc(blinkX, car.height / 2 - 2, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Aggressive Swerve Indicator
        if (car.isAggressive && car.isChangingLane) {
          ctx.fillStyle = "#ef4444";
          ctx.font = "900 11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("SWERVE!", 0, -car.height / 2 - 8);
        }

        ctx.restore();
      });

      // DRAW PARTICLES
      g.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // DRAW HERO PLAYER CAR
      ctx.save();
      ctx.translate(g.playerX, g.playerY);

      // Flashing when invincible after shield hit
      if (g.invincibleTimer > 0 && Math.floor(currentTime / 80) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Slight car body tilt when steering
      ctx.rotate((g.playerVx * Math.PI) / 180);

      // Drop Shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(-g.playerWidth / 2 + 4, -g.playerHeight / 2 + 6, g.playerWidth, g.playerHeight);

      // Hero Tires
      ctx.fillStyle = "#020617";
      ctx.fillRect(-g.playerWidth / 2 - 3, -g.playerHeight / 2 + 10, 8, 18);
      ctx.fillRect(g.playerWidth / 2 - 5, -g.playerHeight / 2 + 10, 8, 18);
      ctx.fillRect(-g.playerWidth / 2 - 3, g.playerHeight / 2 - 26, 8, 18);
      ctx.fillRect(g.playerWidth / 2 - 5, g.playerHeight / 2 - 26, 8, 18);

      // Supercar Body Shell (Metallic Crimson Red Gradient)
      const carGrad = ctx.createLinearGradient(-g.playerWidth / 2, 0, g.playerWidth / 2, 0);
      carGrad.addColorStop(0, "#ff2a5f");
      carGrad.addColorStop(0.5, "#e11d48");
      carGrad.addColorStop(1, "#9f1239");
      ctx.fillStyle = carGrad;
      ctx.beginPath();
      ctx.roundRect(-g.playerWidth / 2, -g.playerHeight / 2, g.playerWidth, g.playerHeight, 10);
      ctx.fill();

      // Racing Stripes down center
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(-5, -g.playerHeight / 2, 4, g.playerHeight);
      ctx.fillRect(1, -g.playerHeight / 2, 4, g.playerHeight);

      // Cockpit Windshield (Cyan Tinted Glass)
      const glassGrad = ctx.createLinearGradient(0, -25, 0, 15);
      glassGrad.addColorStop(0, "#38bdf8");
      glassGrad.addColorStop(1, "#0369a1");
      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.roundRect(-g.playerWidth / 2 + 6, -g.playerHeight / 2 + 18, g.playerWidth - 12, 22, 5);
      ctx.fill();

      // Rear Spoiler Wing
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-g.playerWidth / 2 - 2, g.playerHeight / 2 - 8, g.playerWidth + 4, 6);

      // Glowing Neon Taillight Bar
      ctx.fillStyle = g.downPressed ? "#ff0033" : "#e11d48";
      ctx.fillRect(-g.playerWidth / 2 + 5, g.playerHeight / 2 - 3, g.playerWidth - 10, 4);

      // Glowing Headlights
      ctx.fillStyle = "#fef08a";
      ctx.fillRect(-g.playerWidth / 2 + 4, -g.playerHeight / 2, 8, 3);
      ctx.fillRect(g.playerWidth / 2 - 12, -g.playerHeight / 2, 8, 3);

      // Shield Bubble Aura around player
      if (g.hasShield) {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, g.playerHeight * 0.58, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Magnet Aura
      if (g.magnetTimer > 0) {
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, g.playerHeight * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.restore();

      // DRAW FLOATING TOASTS
      g.toasts.forEach(t => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, t.alpha);
        ctx.font = "900 20px system-ui, sans-serif";
        ctx.fillStyle = t.color;
        ctx.textAlign = "center";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 8;
        ctx.fillText(t.text, t.x, t.y);

        if (t.subtext) {
          ctx.font = "bold 12px system-ui, sans-serif";
          ctx.fillStyle = "#f8fafc";
          ctx.fillText(t.subtext, t.x, t.y + 18);
        }
        ctx.restore();
      });

      // MOTION BLUR SPEED LINES (When Nitro is active)
      if (g.isBoosting) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const lx = ROAD_LEFT + Math.random() * ROAD_WIDTH;
          const ly = Math.random() * CANVAS_HEIGHT;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx, ly + 80);
          ctx.stroke();
        }
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore]);

  // Touch controls for steering
  const handleTouchSteer = (direction: "left" | "right", isDown: boolean) => {
    if (gameState !== "playing") return;
    const g = gameRef.current;
    if (direction === "left") g.leftPressed = isDown;
    if (direction === "right") g.rightPressed = isDown;
  };

  const handleTouchGas = (isDown: boolean) => {
    if (gameState !== "playing") return;
    const g = gameRef.current;
    g.upPressed = isDown;
  };

  const handleTouchBrake = (isDown: boolean) => {
    if (gameState !== "playing") return;
    const g = gameRef.current;
    g.downPressed = isDown;
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center select-none font-sans">
      {/* COMPACT TOP HUD BAR */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-xl px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between text-white shadow-lg">
        {/* Score & Distance */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</div>
            <div className="text-base sm:text-xl font-black text-amber-400 tracking-tight leading-none">{score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
              <Compass className="w-3 h-3 text-blue-400" /> Dist
            </div>
            <div className="text-sm sm:text-lg font-black text-white leading-none">{distanceKm} <span className="text-[10px] text-slate-400">km</span></div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
              <Coins className="w-3 h-3 text-yellow-400" /> Cash
            </div>
            <div className="text-sm sm:text-lg font-black text-yellow-300 leading-none">{coinsCollected}</div>
          </div>
        </div>

        {/* Speedometer & Nitro */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Nitro Gauge Bar */}
          <div className="flex flex-col items-end">
            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-0.5 mb-0.5">
              <Flame className="w-3 h-3" /> Nitro
            </div>
            <div className="w-20 sm:w-28 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-75 ${
                  nitroAmount > 30 ? "bg-gradient-to-r from-blue-500 to-cyan-400" : "bg-rose-500 animate-pulse"
                }`}
                style={{ width: `${nitroAmount}%` }}
              />
            </div>
          </div>

          {/* Shield Status */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700">
            <Shield className={`w-3.5 h-3.5 ${hasShield ? "text-emerald-400" : "text-slate-600"}`} />
            <span className={`text-[10px] font-bold ${hasShield ? "text-emerald-400" : "text-slate-500 line-through"}`}>
              {hasShield ? "Armor" : "Broke"}
            </span>
          </div>

        </div>
      </div>

      {/* CANVAS CONTAINER (Auto-fits within screen height: max-h-[58vh]) */}
      <div className="relative w-full h-[min(56vh,480px)] min-h-[300px] aspect-[4/3] bg-slate-950 overflow-hidden shadow-2xl border-x border-slate-800 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain block"
        />

        {/* MENU OVERLAY */}
        {gameState === "menu" && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center text-white z-20">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" /> 3D Highway Traffic Racer
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-rose-500">
              HIGHWAY RACER
            </h1>
            <p className="max-w-md text-slate-300 text-xs sm:text-sm font-medium mb-4">
              Weave through dense highway traffic at extreme speeds. Collect cash, activate Nitro boost, dodge trucks, and rack up near-miss multiplier combos!
            </p>

            {highScore > 0 && (
              <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/30 px-4 py-1.5 rounded-lg mb-4 shadow-inner">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] uppercase font-bold text-slate-400">Personal Best:</span>
                <span className="text-base font-black text-amber-400">{highScore.toLocaleString()}</span>
              </div>
            )}

            <button
              onClick={startGame}
              className="px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-base sm:text-lg shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" /> START RACING
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 max-w-md text-[11px] text-slate-400">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-white block">◀ / ▶ or A / D</span> Steer Lanes
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-white block">▲ or Space</span> Nitro Boost
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-white block">▼ or S</span> Brake / Slow
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <span className="font-bold text-white block">🛡 1 Free Armor</span> Absorbs 1 Crash
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER OVERLAY */}
        {gameState === "gameover" && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center text-white z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              💥 Crash Impact
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-1 text-rose-500">
              RACE FINISHED!
            </h2>
            <p className="text-slate-400 text-xs mb-4">Your sports car suffered high-speed highway damage.</p>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-md mb-4 text-left">
              <div className="bg-slate-900/80 p-2 sm:p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Score</div>
                <div className="text-base sm:text-xl font-black text-amber-400">{score.toLocaleString()}</div>
              </div>
              <div className="bg-slate-900/80 p-2 sm:p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Distance</div>
                <div className="text-sm sm:text-lg font-black text-white">{distanceKm} km</div>
              </div>
              <div className="bg-slate-900/80 p-2 sm:p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Top Speed</div>
                <div className="text-sm sm:text-lg font-black text-cyan-400">{topSpeedReached} km/h</div>
              </div>
              <div className="bg-slate-900/80 p-2 sm:p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Near Misses</div>
                <div className="text-sm sm:text-lg font-black text-emerald-400">{nearMissCount}</div>
              </div>
            </div>

            {score >= highScore && score > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg mb-4 text-xs font-bold">
                <Trophy className="w-4 h-4 text-amber-400 animate-bounce" /> NEW ALL-TIME HIGH SCORE!
              </div>
            )}

            <button
              onClick={startGame}
              className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-sm sm:text-base shadow-lg shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> RACE AGAIN
            </button>
          </div>
        )}
      </div>

      {/* COMPACT BOTTOM TOUCH CONTROLS */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-b-xl px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2 shadow-lg">
        {/* Steering Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onPointerDown={() => handleTouchSteer("left", true)}
            onPointerUp={() => handleTouchSteer("left", false)}
            onPointerLeave={() => handleTouchSteer("left", false)}
            className="w-13 h-10 sm:w-16 sm:h-12 rounded-lg bg-slate-800 active:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center text-white active:scale-95 transition-transform"
            aria-label="Steer Left"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">LEFT</span>
          </button>
          <button
            onPointerDown={() => handleTouchSteer("right", true)}
            onPointerUp={() => handleTouchSteer("right", false)}
            onPointerLeave={() => handleTouchSteer("right", false)}
            className="w-13 h-10 sm:w-16 sm:h-12 rounded-lg bg-slate-800 active:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center text-white active:scale-95 transition-transform"
            aria-label="Steer Right"
          >
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase">RIGHT</span>
          </button>
        </div>

        {/* Throttle / Brake Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onPointerDown={() => handleTouchBrake(true)}
            onPointerUp={() => handleTouchBrake(false)}
            onPointerLeave={() => handleTouchBrake(false)}
            className="w-13 h-10 sm:w-16 sm:h-12 rounded-lg bg-rose-950/60 active:bg-rose-900 border border-rose-800/60 flex flex-col items-center justify-center text-rose-300 active:scale-95 transition-transform"
            aria-label="Brake"
          >
            <span className="text-xs sm:text-sm">🛑</span>
            <span className="text-[8px] sm:text-[9px] font-bold text-rose-400 uppercase">BRAKE</span>
          </button>
          <button
            onPointerDown={() => handleTouchGas(true)}
            onPointerUp={() => handleTouchGas(false)}
            onPointerLeave={() => handleTouchGas(false)}
            className="w-20 h-10 sm:w-24 sm:h-12 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 active:from-blue-700 active:to-cyan-600 border border-cyan-400 flex flex-col items-center justify-center text-white font-black shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform"
            aria-label="Gas / Nitro Boost"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider">NITRO / GAS</span>
          </button>
        </div>
      </div>
    </div>
  );
}