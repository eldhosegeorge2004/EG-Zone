"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Swords, Shield, Heart } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

// --- Game Engine Types & Constants ---
const CANVAS_W = 800;
const CANVAS_H = 450;
const FLOOR_Y = 380;
const GRAVITY = 0.8;
const MAX_SPEED = 6;
const JUMP_POWER = 15;

type Rect = { x: number; y: number; w: number; h: number };

type Entity = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  health: number;
  maxHealth: number;
  facing: "left" | "right";
  state: "idle" | "walk" | "punch" | "kick" | "hurt" | "dead";
  stateTimer: number;
  hitbox: Rect | null;
  speed: number;
};

// --- Helper Functions ---
const checkCollision = (r1: Rect, r2: Rect) => {
  return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
         r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
};

export default function StickmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // React State for UI
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  // Mutable Game State (avoids React re-renders during 60fps loop)
  const gameState = useRef({
    keys: { left: false, right: false, up: false, punch: false, kick: false },
    lastKeys: { punch: false, kick: false },
    player: null as Entity | null,
    enemies: [] as Entity[],
    particles: [] as {x: number, y: number, vx: number, vy: number, life: number, color: string}[],
    score: 0,
    wave: 1,
    spawnTimer: 0,
    isRunning: false,
  });

  // --- Input Handling ---
  useEffect(() => {
    const saved = localStorage.getItem("stickmanBest");
    if (saved) setBestScore(parseInt(saved));

    const handleKeyDown = (e: KeyboardEvent) => {
      const { keys } = gameState.current;
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
      if (e.code === "ArrowUp" || e.code === "KeyW") keys.up = true;
      if (e.code === "KeyZ" || e.code === "KeyJ") keys.punch = true;
      if (e.code === "KeyX" || e.code === "KeyK") keys.kick = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const { keys } = gameState.current;
      if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
      if (e.code === "ArrowUp" || e.code === "KeyW") keys.up = false;
      if (e.code === "KeyZ" || e.code === "KeyJ") keys.punch = false;
      if (e.code === "KeyX" || e.code === "KeyK") keys.kick = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // --- Touch Controls for Mobile ---
  const handleTouch = (action: keyof typeof gameState.current.keys, isDown: boolean) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    gameState.current.keys[action] = isDown;
  };

  // --- Game Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const spawnEnemy = (wave: number) => {
      const isLeft = Math.random() > 0.5;
      const health = 50 + (wave * 10);
      return {
        id: Math.random().toString(),
        x: isLeft ? -50 : CANVAS_W + 50,
        y: FLOOR_Y - 80,
        vx: 0, vy: 0,
        w: 30, h: 80,
        color: "#ef4444", // red
        health, maxHealth: health,
        facing: isLeft ? "right" : "left",
        state: "idle",
        stateTimer: 0,
        hitbox: null,
        speed: 2 + (wave * 0.2), // enemies get faster
      } as Entity;
    };

    const updateEntity = (ent: Entity, dt: number) => {
      // Physics
      ent.vy += GRAVITY;
      ent.x += ent.vx;
      ent.y += ent.vy;

      // Floor collision
      if (ent.y + ent.h > FLOOR_Y) {
        ent.y = FLOOR_Y - ent.h;
        ent.vy = 0;
      }
      
      // Friction
      ent.vx *= 0.8;

      // State timer
      if (ent.stateTimer > 0) {
        ent.stateTimer -= dt;
        if (ent.stateTimer <= 0) {
          if (ent.state === "dead") {
            // Keep dead
          } else {
            ent.state = "idle";
            ent.hitbox = null;
          }
        }
      }
    };

    const drawStickman = (ctx: CanvasRenderingContext2D, ent: Entity) => {
      ctx.save();
      ctx.translate(ent.x + ent.w/2, ent.y + ent.h/2);
      if (ent.facing === "left") ctx.scale(-1, 1);
      
      ctx.strokeStyle = ent.color;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const t = performance.now() / 150; // for animation
      let headY = -30;
      let bodyTilt = 0;
      let leftArmRot = 0;
      let rightArmRot = 0;
      let leftLegRot = 0;
      let rightLegRot = 0;

      // Animations based on state
      if (ent.state === "walk") {
        leftLegRot = Math.sin(t) * 0.8;
        rightLegRot = Math.sin(t + Math.PI) * 0.8;
        leftArmRot = Math.sin(t + Math.PI) * 0.5;
        rightArmRot = Math.sin(t) * 0.5;
      } else if (ent.state === "punch") {
        rightArmRot = -Math.PI / 2; // punch straight out
        bodyTilt = 0.2;
      } else if (ent.state === "kick") {
        rightLegRot = -Math.PI / 2 + 0.2; // kick high
        leftLegRot = 0.2;
        bodyTilt = -0.2;
      } else if (ent.state === "hurt") {
        bodyTilt = -0.5;
        headY = -20;
        leftArmRot = 0.5;
        rightArmRot = 0.5;
      } else if (ent.state === "dead") {
        ctx.rotate(Math.PI / 2); // Fall over
        headY = -30;
      }

      // Draw Body
      ctx.rotate(bodyTilt);
      
      // Head
      ctx.beginPath();
      ctx.arc(0, headY, 12, 0, Math.PI * 2);
      ctx.stroke();

      // Torso
      ctx.beginPath();
      ctx.moveTo(0, headY + 12);
      ctx.lineTo(0, 10);
      ctx.stroke();

      // Arms (attached at headY + 15)
      ctx.save();
      ctx.translate(0, headY + 15);
      // Left Arm (back)
      ctx.save(); ctx.rotate(leftArmRot + 0.2); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, 20); ctx.stroke(); ctx.restore();
      // Right Arm (front)
      ctx.save(); ctx.rotate(rightArmRot - 0.2); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, 20); ctx.stroke(); ctx.restore();
      ctx.restore();

      // Legs (attached at 10)
      ctx.save();
      ctx.translate(0, 10);
      // Left Leg (back)
      ctx.save(); ctx.rotate(leftLegRot + 0.1); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, 25); ctx.stroke(); ctx.restore();
      // Right Leg (front)
      ctx.save(); ctx.rotate(rightLegRot - 0.1); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0, 25); ctx.stroke(); ctx.restore();
      ctx.restore();

      ctx.restore();

      // Draw Health Bar (if not dead and is enemy)
      if (ent.id !== 'player' && ent.state !== 'dead') {
        ctx.fillStyle = "#4b5563"; // bg
        ctx.fillRect(ent.x - 5, ent.y - 15, 40, 4);
        ctx.fillStyle = "#ef4444"; // fg
        ctx.fillRect(ent.x - 5, ent.y - 15, 40 * (ent.health / ent.maxHealth), 4);
      }

      // Debug Hitbox (optional)
      // if (ent.hitbox) {
      //   ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
      //   ctx.fillRect(ent.hitbox.x, ent.hitbox.y, ent.hitbox.w, ent.hitbox.h);
      // }
    };

    const createParticles = (x: number, y: number, color: string) => {
      for(let i=0; i<10; i++) {
        gameState.current.particles.push({
          x, y, 
          vx: (Math.random() - 0.5) * 10, 
          vy: (Math.random() - 0.5) * 10, 
          life: 1, 
          color
        });
      }
    };

    const loop = (time: number) => {
      if (!gameState.current.isRunning) return;
      const dt = time - lastTime;
      lastTime = time;

      const state = gameState.current;
      const { player, keys, lastKeys } = state;

      // Update Player
      if (player && player.state !== "dead") {
        if (player.state !== "hurt") {
          // Movement
          if (keys.left) { player.vx -= 1.5; player.facing = "left"; player.state = "walk"; }
          else if (keys.right) { player.vx += 1.5; player.facing = "right"; player.state = "walk"; }
          else { player.state = "idle"; }

          // Cap speed
          if (player.vx > MAX_SPEED) player.vx = MAX_SPEED;
          if (player.vx < -MAX_SPEED) player.vx = -MAX_SPEED;

          // Jump
          if (keys.up && player.y + player.h >= FLOOR_Y) {
            player.vy = -JUMP_POWER;
          }

          // Attacks
          if (keys.punch && !lastKeys.punch && player.stateTimer <= 0) {
            player.state = "punch";
            player.stateTimer = 250; // ms duration
            const range = 40;
            player.hitbox = {
              x: player.facing === "right" ? player.x + player.w : player.x - range,
              y: player.y + 10,
              w: range,
              h: 20
            };
          } else if (keys.kick && !lastKeys.kick && player.stateTimer <= 0) {
            player.state = "kick";
            player.stateTimer = 350;
            const range = 45;
            player.hitbox = {
              x: player.facing === "right" ? player.x + player.w : player.x - range,
              y: player.y + 30,
              w: range,
              h: 30
            };
          } else if (player.stateTimer <= 0) {
            player.hitbox = null;
          }
        }
        
        updateEntity(player, dt);
        
        // Keep in bounds
        if (player.x < 0) player.x = 0;
        if (player.x > CANVAS_W - player.w) player.x = CANVAS_W - player.w;

        // Sync Health to React (throttled to avoid too many renders)
        if (time % 100 < 20) setPlayerHealth(Math.max(0, player.health));
      }

      // Update Enemies
      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const enemy = state.enemies[i];
        updateEntity(enemy, dt);

        if (enemy.state !== "dead" && enemy.state !== "hurt" && player && player.state !== "dead") {
          // AI Logic
          const dist = player.x - enemy.x;
          const absDist = Math.abs(dist);
          enemy.facing = dist > 0 ? "right" : "left";

          if (absDist > 50) {
            // Walk towards player
            enemy.vx += enemy.facing === "right" ? 0.5 : -0.5;
            if (enemy.vx > enemy.speed) enemy.vx = enemy.speed;
            if (enemy.vx < -enemy.speed) enemy.vx = -enemy.speed;
            enemy.state = "walk";
          } else {
            // Attack player
            if (enemy.stateTimer <= 0 && Math.random() < 0.05) {
              enemy.state = "punch";
              enemy.stateTimer = 300;
              const range = 30;
              enemy.hitbox = {
                x: enemy.facing === "right" ? enemy.x + enemy.w : enemy.x - range,
                y: enemy.y + 10,
                w: range,
                h: 20
              };
            } else if (enemy.stateTimer <= 0) {
              enemy.state = "idle";
              enemy.hitbox = null;
            }
          }
        }

        // Check Hit detection
        // Player hits Enemy
        if (player && player.hitbox && enemy.state !== "dead") {
          if (checkCollision(player.hitbox, enemy)) {
            enemy.health -= player.state === "kick" ? 25 : 15;
            enemy.state = "hurt";
            enemy.stateTimer = 200;
            enemy.vx = player.facing === "right" ? 8 : -8; // knockback
            enemy.vy = -3;
            player.hitbox = null; // consume hitbox
            createParticles(enemy.x + enemy.w/2, enemy.y + enemy.h/2, "#ef4444");

            if (enemy.health <= 0) {
              enemy.state = "dead";
              enemy.stateTimer = 3000; // body stays for 3s
              state.score += 1;
              setScore(state.score);
              if (state.score % 5 === 0) state.wave++; // Increase difficulty
            }
          }
        }

        // Enemy hits Player
        if (enemy.hitbox && player && player.state !== "dead" && player.state !== "hurt") {
          if (checkCollision(enemy.hitbox, player)) {
            player.health -= 10;
            player.state = "hurt";
            player.stateTimer = 300;
            player.vx = enemy.facing === "right" ? 10 : -10;
            player.vy = -4;
            enemy.hitbox = null;
            createParticles(player.x + player.w/2, player.y + player.h/2, "#06b6d4"); // cyan blood

            if (player.health <= 0) {
              player.state = "dead";
              player.health = 0;
              setPlayerHealth(0);
              state.isRunning = false;
              setIsPlaying(false);
              setIsGameOver(true);
              setShowSubmitModal(true);
              if (state.score > bestScore) {
                setBestScore(state.score);
                localStorage.setItem("stickmanBest", state.score.toString());
              }
            }
          }
        }

        // Remove dead bodies after timer
        if (enemy.state === "dead" && enemy.stateTimer <= 0) {
          state.enemies.splice(i, 1);
        }
      }

      // Spawner
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0 && state.enemies.filter(e => e.state !== 'dead').length < 3 + Math.floor(state.wave/2)) {
        state.enemies.push(spawnEnemy(state.wave));
        state.spawnTimer = 2000 - (state.wave * 100); // spawn faster
        if (state.spawnTimer < 500) state.spawnTimer = 500;
      }

      // Particles
      for(let i = state.particles.length-1; i>=0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if(p.life <= 0) state.particles.splice(i, 1);
      }

      // Update Last Keys
      lastKeys.punch = keys.punch;
      lastKeys.kick = keys.kick;

      // --- Draw ---
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Draw Floor
      ctx.fillStyle = "#1f2937"; // gray-800
      ctx.fillRect(0, FLOOR_Y, CANVAS_W, CANVAS_H - FLOOR_Y);

      // Draw Grid / Arena bg
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 1;
      for (let i = 0; i < CANVAS_W; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, FLOOR_Y); ctx.stroke();
      }

      // Draw Particles
      state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw Entities
      state.enemies.forEach(enemy => drawStickman(ctx, enemy));
      if (player) drawStickman(ctx, player);

      animationFrameId = requestAnimationFrame(loop);
    };

    if (isPlaying && gameState.current.isRunning) {
      animationFrameId = requestAnimationFrame(loop);
    } else {
      // Draw static frame if not playing
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(0, FLOOR_Y, CANVAS_W, CANVAS_H - FLOOR_Y);
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, bestScore]);


  const startGame = () => {
    gameState.current = {
      keys: { left: false, right: false, up: false, punch: false, kick: false },
      lastKeys: { punch: false, kick: false },
      player: {
        id: "player",
        x: CANVAS_W / 2, y: FLOOR_Y - 80,
        vx: 0, vy: 0,
        w: 30, h: 80,
        color: "#06b6d4", // cyan-500
        health: 100, maxHealth: 100,
        facing: "right",
        state: "idle",
        stateTimer: 0,
        hitbox: null,
        speed: MAX_SPEED
      },
      enemies: [],
      particles: [],
      score: 0,
      wave: 1,
      spawnTimer: 1000,
      isRunning: true,
    };
    setScore(0);
    setPlayerHealth(100);
    setIsPlaying(true);
    setIsGameOver(false);
    setShowSubmitModal(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto h-full touch-none select-none">
      
      {/* Top HUD */}
      <div className="w-full flex justify-between items-center mb-4 bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Kills</span>
            <span className="text-2xl font-black text-gray-900 leading-none">{score}</span>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
          <div className="flex flex-col w-[100px] sm:w-[200px]">
             <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
               <Heart className="w-3 h-3 text-red-500" /> Health
             </span>
             <div className="w-full h-3 bg-gray-200 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-rose-500 transition-all duration-200" 
                  style={{ width: `${playerHealth}%` }}
                />
             </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Best</span>
          <span className="text-2xl font-black text-orange-500 leading-none">{bestScore}</span>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative w-full aspect-video max-h-[500px] bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-4 border-gray-900 shrink">
        
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 z-20 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-700">
              <Swords className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">Stickman Survival</h2>
            <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-sm">
              Desktop: Arrow Keys to move/jump, Z to Punch, X to Kick.<br/>
              Mobile: Use on-screen controls.
            </p>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-full font-bold shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
            >
              Start Fighting
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 z-20 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-24 h-24 bg-red-900/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-500/30">
              <span className="text-5xl">💀</span>
            </div>
            <h2 className="text-4xl font-black mb-2 tracking-tight text-red-500">Wasted</h2>
            <p className="text-gray-300 text-lg mb-8 font-medium">
              You defeated <span className="font-black text-white text-2xl mx-1">{score}</span> stickmen.
            </p>
            <button
              onClick={startGame}
              className="flex items-center justify-center bg-white text-gray-900 px-10 py-4 rounded-full font-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl text-lg w-full max-w-[250px]"
            >
              <RotateCcw className="w-5 h-5 mr-2" /> Try Again
            </button>
          </div>
        )}

        <canvas 
          ref={canvasRef} 
          width={CANVAS_W} 
          height={CANVAS_H}
          className="w-full h-full object-contain bg-gray-900"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Mobile Controls (Only visible on small screens / touch) */}
      <div className="w-full mt-4 flex sm:hidden justify-between px-2 gap-4 shrink-0 pb-10">
        {/* D-PAD */}
        <div className="flex gap-2 relative h-32 w-32">
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-200/50 active:bg-gray-300 rounded-full flex items-center justify-center text-2xl font-black backdrop-blur-sm shadow-sm select-none"
            onPointerDown={handleTouch("left", true)}
            onPointerUp={handleTouch("left", false)}
            onPointerLeave={handleTouch("left", false)}
          >◀</button>
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-200/50 active:bg-gray-300 rounded-full flex items-center justify-center text-2xl font-black backdrop-blur-sm shadow-sm select-none"
            onPointerDown={handleTouch("right", true)}
            onPointerUp={handleTouch("right", false)}
            onPointerLeave={handleTouch("right", false)}
          >▶</button>
           <button 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-200/50 active:bg-gray-300 rounded-full flex items-center justify-center text-2xl font-black backdrop-blur-sm shadow-sm select-none"
            onPointerDown={handleTouch("up", true)}
            onPointerUp={handleTouch("up", false)}
            onPointerLeave={handleTouch("up", false)}
          >▲</button>
        </div>

        {/* Actions */}
        <div className="flex gap-4 items-end relative h-32 w-32">
          <button 
            className="absolute bottom-0 left-0 w-14 h-14 bg-red-100/50 active:bg-red-200 rounded-full flex items-center justify-center text-red-600 font-black backdrop-blur-sm shadow-sm border border-red-200 select-none text-xs"
            onPointerDown={handleTouch("kick", true)}
            onPointerUp={handleTouch("kick", false)}
            onPointerLeave={handleTouch("kick", false)}
          >KICK</button>
          <button 
            className="absolute top-4 right-0 w-16 h-16 bg-cyan-100/50 active:bg-cyan-200 rounded-full flex items-center justify-center text-cyan-600 font-black backdrop-blur-sm shadow-sm border border-cyan-200 select-none text-sm"
            onPointerDown={handleTouch("punch", true)}
            onPointerUp={handleTouch("punch", false)}
            onPointerLeave={handleTouch("punch", false)}
          >PUNCH</button>
        </div>
      </div>

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={score}
        gameId="stickman"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
