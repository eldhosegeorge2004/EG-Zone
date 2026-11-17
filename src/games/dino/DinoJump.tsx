/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function DinoJump() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const state = useRef({
    width: 800,
    height: 300,
    // Dino
    dinoX: 80,
    dinoY: 220,
    dinoW: 44,
    dinoH: 52,
    dinoVy: 0,
    isOnGround: true,
    isDucking: false,
    jumpCount: 0,
    // Ground
    groundY: 272,
    // Obstacles
    obstacles: [] as { x: number; y: number; w: number; h: number; type: "cactus" | "ptero" }[],
    obstacleTimer: 0,
    obstacleInterval: 90,
    // Clouds
    clouds: [] as { x: number; y: number; w: number }[],
    // Ground scroll
    groundScroll: 0,
    // Speed
    speed: 5,
    frameCount: 0,
    // Legs animation
    legFrame: 0,
    // Day/Night
    dayNight: 0, // 0=day, 1=night, smooth
    dayNightTimer: 0,
    // Stars
    stars: [] as { x: number; y: number; r: number }[],
    // Score
    score: 0,
    playing: false,
    dead: false,
    // Touch
    touchStartY: 0,
  });

  const audioCtx = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: "jump" | "die" | "point") => {
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === "jump") {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "die") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "point") {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch {}
  }, []);

  const initStars = useCallback(() => {
    const stars = [];
    for (let i = 0; i < 50; i++) {
      stars.push({ x: Math.random() * 800, y: Math.random() * 180, r: Math.random() * 1.5 + 0.5 });
    }
    state.current.stars = stars;
  }, []);

  const initClouds = useCallback(() => {
    const clouds = [];
    for (let i = 0; i < 4; i++) {
      clouds.push({ x: 100 + i * 200, y: 30 + Math.random() * 60, w: 60 + Math.random() * 60 });
    }
    state.current.clouds = clouds;
  }, []);

  const startGame = useCallback(() => {
    const s = state.current;
    s.dinoY = 220;
    s.dinoVy = 0;
    s.isOnGround = true;
    s.isDucking = false;
    s.jumpCount = 0;
    s.obstacles = [];
    s.obstacleTimer = 0;
    s.obstacleInterval = 90;
    s.groundScroll = 0;
    s.speed = 5;
    s.frameCount = 0;
    s.legFrame = 0;
    s.dayNight = 0;
    s.dayNightTimer = 0;
    s.score = 0;
    s.playing = true;
    s.dead = false;
    initClouds();
    setGameState("playing");
    setScore(0);
  }, [initClouds]);

  const drawDino = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = state.current;
    const night = s.dayNight;
    const dinoColor = night > 0.5 ? "#ccffcc" : "#2d7a2d";
    const dinoEye = night > 0.5 ? "#001a00" : "#fff";
    const x = s.dinoX;
    const y = s.isDucking ? s.dinoY + 22 : s.dinoY;
    const h = s.isDucking ? 30 : s.dinoH;
    const w = s.isDucking ? 60 : s.dinoW;

    ctx.fillStyle = dinoColor;

    if (s.isDucking) {
      // Ducking body (elongated, low)
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fill();
      // Eye
      ctx.fillStyle = dinoEye;
      ctx.beginPath();
      ctx.arc(x + w - 10, y + 8, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x + w - 9, y + 7, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Body
      ctx.beginPath();
      ctx.roundRect(x, y + 10, w, h - 10, 6);
      ctx.fill();
      // Head
      ctx.beginPath();
      ctx.roundRect(x + 10, y, w + 2, 24, 6);
      ctx.fill();
      // Eye
      ctx.fillStyle = dinoEye;
      ctx.beginPath();
      ctx.arc(x + w + 2, y + 8, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(x + w + 3, y + 7, 2, 0, Math.PI * 2);
      ctx.fill();
      // Tail
      ctx.fillStyle = dinoColor;
      ctx.beginPath();
      ctx.moveTo(x, y + 20);
      ctx.lineTo(x - 14, y + 30);
      ctx.lineTo(x - 8, y + 36);
      ctx.lineTo(x + 4, y + 28);
      ctx.fill();
      // Legs
      const lf = s.legFrame;
      ctx.beginPath();
      if (s.isOnGround) {
        // Run animation
        const a1 = Math.sin(lf * 0.5) * 10;
        const a2 = -Math.sin(lf * 0.5) * 10;
        ctx.fillRect(x + 8, y + h - 20, 10, 20 + a1);
        ctx.fillRect(x + 24, y + h - 20, 10, 20 + a2);
      } else {
        ctx.fillRect(x + 8, y + h - 10, 10, 10);
        ctx.fillRect(x + 24, y + h - 18, 10, 18);
      }
    }
  }, []);

  const drawCactus = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, night: number) => {
    ctx.fillStyle = night > 0.5 ? "#2a5c2a" : "#2d6e2d";
    // Main trunk
    ctx.beginPath();
    ctx.roundRect(x + w / 2 - 7, y, 14, h, 4);
    ctx.fill();
    // Left arm
    ctx.beginPath();
    ctx.roundRect(x, y + h * 0.3, 10, h * 0.3, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x, y + h * 0.1, 10, h * 0.25, 3);
    ctx.fill();
    // Right arm
    ctx.beginPath();
    ctx.roundRect(x + w - 10, y + h * 0.25, 10, h * 0.3, 3);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + w - 10, y + h * 0.1, 10, h * 0.2, 3);
    ctx.fill();
  }, []);

  const drawPtero = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, night: number, frame: number) => {
    ctx.fillStyle = night > 0.5 ? "#8888cc" : "#6b5b95";
    const wingY = Math.sin(frame * 0.15) * 5;
    // Body
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w * 0.3, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Left wing
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - 5, y + h / 2);
    ctx.lineTo(x, y + h / 2 - 10 + wingY);
    ctx.lineTo(x + 5, y + h / 2 + 5);
    ctx.closePath();
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.moveTo(x + w / 2 + 5, y + h / 2);
    ctx.lineTo(x + w, y + h / 2 - 10 - wingY);
    ctx.lineTo(x + w - 5, y + h / 2 + 5);
    ctx.closePath();
    ctx.fill();
    // Head beak
    ctx.beginPath();
    ctx.moveTo(x + w / 2 + 12, y + h / 2 - 2);
    ctx.lineTo(x + w / 2 + 22, y + h / 2);
    ctx.lineTo(x + w / 2 + 12, y + h / 2 + 4);
    ctx.closePath();
    ctx.fill();
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = state.current;
    const { width: W, height: H } = s;

    // Sky gradient (day/night blend)
    const dn = s.dayNight;
    const dayColor = { r: 135, g: 206, b: 235 };
    const nightColor = { r: 15, g: 20, b: 60 };
    const r = Math.round(dayColor.r * (1 - dn) + nightColor.r * dn);
    const g2 = Math.round(dayColor.g * (1 - dn) + nightColor.g * dn);
    const b = Math.round(dayColor.b * (1 - dn) + nightColor.b * dn);
    ctx.fillStyle = `rgb(${r},${g2},${b})`;
    ctx.fillRect(0, 0, W, H);

    // Stars (visible at night)
    if (dn > 0.3) {
      ctx.fillStyle = `rgba(255,255,255,${dn})`;
      for (const star of s.stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Sun / Moon
    if (dn < 0.8) {
      ctx.fillStyle = `rgba(255,220,50,${1 - dn})`;
      ctx.beginPath();
      ctx.arc(W - 80, 50, 25, 0, Math.PI * 2);
      ctx.fill();
    }
    if (dn > 0.2) {
      ctx.fillStyle = `rgba(220,220,220,${dn})`;
      ctx.beginPath();
      ctx.arc(W - 130, 45, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${r},${g2},${b},${dn})`;
      ctx.beginPath();
      ctx.arc(W - 118, 38, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clouds
    for (const cloud of s.clouds) {
      const alpha = dn > 0.5 ? 0.3 : 0.6;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.w / 2, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloud.x - cloud.w * 0.25, cloud.y + 4, cloud.w * 0.3, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloud.x + cloud.w * 0.25, cloud.y + 4, cloud.w * 0.3, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground
    const groundColor = dn > 0.5 ? "#334433" : "#c8a876";
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, s.groundY, W, H - s.groundY);
    // Ground texture dashes
    ctx.fillStyle = dn > 0.5 ? "#2a3a2a" : "#b89060";
    for (let i = 0; i < 20; i++) {
      const gx = ((i * 60 - s.groundScroll) % (W + 60) + W + 60) % (W + 60) - 30;
      ctx.fillRect(gx, s.groundY + 4, 30, 3);
    }

    // Obstacles
    for (const obs of s.obstacles) {
      if (obs.type === "cactus") {
        drawCactus(ctx, obs.x, obs.y, obs.w, obs.h, dn);
      } else {
        drawPtero(ctx, obs.x, obs.y, obs.w, obs.h, dn, s.frameCount);
      }
    }

    // Dino
    drawDino(ctx);

    // HUD
    ctx.fillStyle = dn > 0.5 ? "#ccffcc" : "#1a3a1a";
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`HI ${String(s.score > 0 ? Math.max(s.score, 0) : 0).padStart(5, "0")}`, W - 10, 30);
    ctx.textAlign = "left";
    ctx.fillText(`SCORE ${String(Math.round(s.score)).padStart(5, "0")}`, 10, 30);

    if (!s.playing && !s.dead) {
      // Idle screen
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText("DINO JUMP", W / 2, H / 2 - 20);
      ctx.font = "16px monospace";
      ctx.fillText("Press SPACE or Tap to Start", W / 2, H / 2 + 20);
    }

    if (s.dead) {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#ff4444";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", W / 2, H / 2 - 30);
      ctx.fillStyle = "#fff";
      ctx.font = "16px monospace";
      ctx.fillText(`Score: ${Math.round(s.score)}`, W / 2, H / 2 + 5);
      ctx.fillText("Press SPACE or Tap to Restart", W / 2, H / 2 + 35);
    }
  }, [drawDino, drawCactus, drawPtero]);

  const jump = useCallback(() => {
    const s = state.current;
    if (!s.playing) return;
    if (s.dead) return;
    if (s.isOnGround || s.jumpCount < 2) {
      s.dinoVy = -10;
      s.isOnGround = false;
      s.jumpCount++;
      s.isDucking = false;
      playSound("jump");
    }
  }, [playSound]);

  const duck = useCallback((on: boolean) => {
    const s = state.current;
    if (!s.playing || s.dead) return;
    if (s.isOnGround) s.isDucking = on;
  }, []);

  useEffect(() => {
    initStars();
    initClouds();
  }, [initStars, initClouds]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = state.current;

    const loop = () => {
      if (s.playing && !s.dead) {
        s.frameCount++;
        s.score += 0.1;
        if (s.frameCount % 100 === 0) playSound("point");

        // Speed up
        s.speed = 5 + s.score * 0.004;

        // Ground scroll
        s.groundScroll = (s.groundScroll + s.speed) % (s.width + 60);

        // Clouds scroll
        for (const cloud of s.clouds) {
          cloud.x -= s.speed * 0.3;
          if (cloud.x < -120) {
            cloud.x = s.width + 80;
            cloud.y = 30 + Math.random() * 60;
            cloud.w = 60 + Math.random() * 60;
          }
        }

        // Day/night cycle every ~1500 frames
        s.dayNightTimer++;
        if (s.dayNightTimer > 1500) {
          s.dayNightTimer = 0;
        }
        const cyclePos = s.dayNightTimer / 1500;
        s.dayNight = cyclePos < 0.5
          ? cyclePos * 2  // day -> night
          : (1 - cyclePos) * 2;  // night -> day

        // Dino physics
        if (!s.isOnGround) {
          s.dinoVy += 0.55; // gravity
          s.dinoY += s.dinoVy;
          if (s.dinoY >= 220) {
            s.dinoY = 220;
            s.dinoVy = 0;
            s.isOnGround = true;
            s.jumpCount = 0;
          }
        }

        // Leg animation
        if (s.isOnGround && !s.isDucking) {
          s.legFrame++;
        }

        // Spawn obstacles
        s.obstacleTimer++;
        const minInterval = 55;
        const interval = Math.max(minInterval, s.obstacleInterval - s.score * 0.08);
        if (s.obstacleTimer >= interval) {
          s.obstacleTimer = 0;
          const type = Math.random() < 0.3 ? "ptero" : "cactus";
          const h = type === "cactus" ? 40 + Math.random() * 30 : 30;
          const w = type === "cactus" ? 36 + Math.random() * 20 : 50;
          const y = type === "ptero"
            ? 160 + Math.random() * 60
            : s.groundY - h;
          s.obstacles.push({ x: s.width + 10, y, w, h, type });
        }

        // Move obstacles
        for (const obs of s.obstacles) {
          obs.x -= s.speed;
        }
        // Remove off-screen
        s.obstacles = s.obstacles.filter(o => o.x > -100);

        // Collision detection
        const duckH = s.isDucking ? 30 : s.dinoH;
        const duckY = s.isDucking ? s.dinoY + 22 : s.dinoY;
        const duckW = s.isDucking ? 60 : s.dinoW;
        const dinoBox = {
          x: s.dinoX + 6, y: duckY + 4,
          w: duckW - 10, h: duckH - 8,
        };
        for (const obs of s.obstacles) {
          const obsBox = { x: obs.x + 4, y: obs.y + 4, w: obs.w - 8, h: obs.h - 8 };
          if (
            dinoBox.x < obsBox.x + obsBox.w &&
            dinoBox.x + dinoBox.w > obsBox.x &&
            dinoBox.y < obsBox.y + obsBox.h &&
            dinoBox.y + dinoBox.h > obsBox.y
          ) {
            s.dead = true;
            s.playing = false;
            playSound("die");
            const hs = parseInt(localStorage.getItem("dino_highscore") || "0");
            const finalScore = Math.round(s.score);
            if (finalScore > hs) {
              localStorage.setItem("dino_highscore", String(finalScore));
              setHighScore(finalScore);
            }
            setScore(finalScore);
            setGameState("dead");
          }
        }

        setScore(Math.round(s.score));
      }

      draw(ctx);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw, playSound]);

  // Load high score
  useEffect(() => {
    const hs = parseInt(localStorage.getItem("dino_highscore") || "0");
    setHighScore(hs);
    state.current.dayNight = 0;
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        const s = state.current;
        if (!s.playing && !s.dead) {
          startGame();
        } else if (s.dead) {
          startGame();
        } else {
          jump();
        }
      }
      if (e.code === "ArrowDown") {
        e.preventDefault();
        duck(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "ArrowDown") duck(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [jump, duck, startGame]);

  // Touch controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const s = state.current;
    s.touchStartY = e.touches[0].clientY;
    if (!s.playing && !s.dead) {
      startGame();
    } else if (s.dead) {
      startGame();
    } else {
      jump();
    }
  }, [jump, startGame]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const s = state.current;
    const dy = e.changedTouches[0].clientY - s.touchStartY;
    if (dy > 30) {
      duck(false);
    }
  }, [duck]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const s = state.current;
    const dy = e.touches[0].clientY - s.touchStartY;
    if (dy > 20) {
      duck(true);
    }
  }, [duck]);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="flex justify-between w-full max-w-3xl px-2">
        <div className="text-green-400 font-mono text-sm">Score: <span className="text-white font-bold">{score}</span></div>
        <div className="text-green-400 font-mono text-sm">Best: <span className="text-yellow-400 font-bold">{Math.max(highScore, score)}</span></div>
      </div>
      <div className="relative w-full max-w-3xl rounded-xl overflow-hidden border-2 border-green-700 shadow-2xl shadow-green-900/50">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full h-auto block cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onClick={() => {
            const s = state.current;
            if (!s.playing && !s.dead) startGame();
            else if (s.dead) startGame();
            else jump();
          }}
        />
      </div>
      <div className="text-slate-500 text-xs text-center">
        <span className="hidden sm:inline">SPACE / ↑ to Jump · ↓ to Duck · Double Jump allowed</span>
        <span className="sm:hidden">Tap to Jump · Swipe Down to Duck</span>
      </div>
    </div>
  );
}
