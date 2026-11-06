"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Swords, Heart, Volume2, VolumeX } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

// --- Game Engine Types & Constants ---
const CANVAS_W = 800;
const CANVAS_H = 450;
const FLOOR_Y = 380;
const GRAVITY = 0.8;
const MAX_SPEED = 6;
const JUMP_POWER = 15;
const FRAME_MS = 1000 / 60; // physics is tuned for 60fps; everything scales by dt / FRAME_MS
const MAX_FRAME_MS = 50; // clamp so tab-outs don't teleport everything

type Rect = { x: number; y: number; w: number; h: number };

type AttackDef = {
  dur: number; // total duration (ms)
  range: number;
  y: number; // offset from top of entity
  h: number;
  dmg: number;
  kb: number; // knockback
  finisher?: boolean;
};

type Kind = "player" | "grunt" | "runner" | "brute";
type EntityState = "idle" | "walk" | "windup" | "punch" | "kick" | "dash" | "hurt" | "dead";

type Entity = {
  id: string;
  kind: Kind;
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
  state: EntityState;
  stateTimer: number;
  attack: AttackDef | null;
  hitIds: Set<string>; // who the current swing has already hit
  speed: number;
  cooldown: number;
  invuln: number;
  windupMs: number;
  cooldownMs: number;
  hurtMs: number;
};

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type FloatText = { x: number; y: number; text: string; color: string; life: number };
type Pickup = { x: number; y: number; life: number };
type Keys = { left: boolean; right: boolean; up: boolean; punch: boolean; kick: boolean; dash: boolean };

type Game = {
  keys: Keys;
  lastKeys: { punch: boolean; kick: boolean; dash: boolean };
  player: Entity | null;
  enemies: Entity[];
  particles: Particle[];
  texts: FloatText[];
  pickups: Pickup[];
  score: number;
  wave: number;
  spawnTimer: number;
  combo: number;
  comboTimer: number;
  chain: number; // consecutive punches (3rd is a finisher)
  chainTimer: number;
  shake: number;
  hitStop: number;
  banner: { text: string; timer: number };
  deathTimer: number | null;
  isRunning: boolean;
  paused: boolean;
};

const PLAYER_PUNCH: AttackDef = { dur: 250, range: 42, y: 10, h: 22, dmg: 15, kb: 8 };
const PLAYER_KICK: AttackDef = { dur: 380, range: 52, y: 34, h: 30, dmg: 25, kb: 12 };
const PLAYER_FINISHER: AttackDef = { dur: 330, range: 56, y: 8, h: 28, dmg: 30, kb: 18, finisher: true };

type EnemyConfig = {
  w: number;
  h: number;
  color: string;
  hp: number;
  hpWave: number;
  speed: number;
  speedWave: number;
  attack: AttackDef;
  windup: number;
  cooldown: number;
  hurt: number;
};

const ENEMY_KINDS: Record<Exclude<Kind, "player">, EnemyConfig> = {
  grunt: {
    w: 30, h: 80, color: "#ef4444", hp: 50, hpWave: 10, speed: 2, speedWave: 0.2,
    attack: { dur: 280, range: 50, y: 10, h: 22, dmg: 10, kb: 10 },
    windup: 350, cooldown: 900, hurt: 200,
  },
  runner: {
    w: 26, h: 72, color: "#f97316", hp: 30, hpWave: 6, speed: 3.4, speedWave: 0.2,
    attack: { dur: 220, range: 44, y: 10, h: 22, dmg: 8, kb: 8 },
    windup: 220, cooldown: 700, hurt: 200,
  },
  brute: {
    w: 42, h: 100, color: "#a855f7", hp: 110, hpWave: 18, speed: 1.2, speedWave: 0.1,
    attack: { dur: 420, range: 64, y: 10, h: 40, dmg: 18, kb: 16 },
    windup: 500, cooldown: 1200, hurt: 120,
  },
};

const KEY_MAP: Record<string, keyof Keys> = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  ArrowUp: "up", KeyW: "up", Space: "up",
  KeyZ: "punch", KeyJ: "punch",
  KeyX: "kick", KeyK: "kick",
  ShiftLeft: "dash", ShiftRight: "dash", KeyC: "dash",
};

// --- Helper Functions ---
const checkCollision = (r1: Rect, r2: Rect) =>
  r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
  r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;

const resetKeys = (g: Game) => {
  g.keys.left = g.keys.right = g.keys.up = g.keys.punch = g.keys.kick = g.keys.dash = false;
  g.lastKeys.punch = g.lastKeys.kick = g.lastKeys.dash = false;
};

// --- Sound (tiny WebAudio synth, no assets) ---
let soundMuted = false;
let audioCtx: AudioContext | null = null;

const tone = (freq: number, dur: number, type: OscillatorType, vol: number, endFreq: number) => {
  if (soundMuted || typeof window === "undefined") return;
  try {
    if (!audioCtx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === "suspended") void audioCtx.resume();
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  } catch {
    /* audio unavailable */
  }
};

const SFX = {
  swing: [320, 0.08, "triangle", 0.05, 180],
  hit: [200, 0.1, "square", 0.07, 90],
  heavy: [150, 0.16, "sawtooth", 0.08, 50],
  kill: [260, 0.22, "sawtooth", 0.07, 60],
  hurt: [180, 0.2, "square", 0.08, 70],
  heal: [500, 0.18, "sine", 0.08, 900],
  dash: [400, 0.12, "sine", 0.04, 200],
  wave: [330, 0.3, "triangle", 0.07, 660],
} as const;

const playSfx = (name: keyof typeof SFX) => {
  const [f, d, t, v, e] = SFX[name];
  tone(f, d, t, v, e);
};

// Background skyline (deterministic so it doesn't flicker)
const SKYLINE = Array.from({ length: 16 }, (_, i) => ({
  x: i * 58 - 40,
  w: 36 + ((i * 37) % 30),
  h: 60 + ((i * 53) % 110),
}));

const makePlayer = (): Entity => ({
  id: "player",
  kind: "player",
  x: CANVAS_W / 2, y: FLOOR_Y - 80,
  vx: 0, vy: 0,
  w: 30, h: 80,
  color: "#06b6d4",
  health: 100, maxHealth: 100,
  facing: "right",
  state: "idle",
  stateTimer: 0,
  attack: null,
  hitIds: new Set(),
  speed: MAX_SPEED,
  cooldown: 0,
  invuln: 0,
  windupMs: 0, cooldownMs: 0, hurtMs: 300,
});

const newGame = (running: boolean): Game => ({
  keys: { left: false, right: false, up: false, punch: false, kick: false, dash: false },
  lastKeys: { punch: false, kick: false, dash: false },
  player: running ? makePlayer() : null,
  enemies: [],
  particles: [],
  texts: [],
  pickups: [],
  score: 0,
  wave: 1,
  spawnTimer: 1000,
  combo: 0,
  comboTimer: 0,
  chain: 0,
  chainTimer: 0,
  shake: 0,
  hitStop: 0,
  banner: running ? { text: "Wave 1", timer: 1500 } : { text: "", timer: 0 },
  deathTimer: null,
  isRunning: running,
  paused: false,
});

const pickKind = (wave: number): Exclude<Kind, "player"> => {
  const r = Math.random();
  if (wave >= 3 && r < 0.15) return "brute";
  if (wave >= 2 && r < 0.45) return "runner";
  return "grunt";
};

const spawnEnemy = (wave: number): Entity => {
  const kind = pickKind(wave);
  const c = ENEMY_KINDS[kind];
  const isLeft = Math.random() > 0.5;
  const hp = c.hp + wave * c.hpWave;
  return {
    id: Math.random().toString(36).slice(2),
    kind,
    x: isLeft ? -60 : CANVAS_W + 60,
    y: FLOOR_Y - c.h,
    vx: 0, vy: 0,
    w: c.w, h: c.h,
    color: c.color,
    health: hp, maxHealth: hp,
    facing: isLeft ? "right" : "left",
    state: "idle",
    stateTimer: 0,
    attack: null,
    hitIds: new Set(),
    speed: Math.min(5, c.speed + wave * c.speedWave),
    cooldown: 600,
    invuln: 0,
    windupMs: c.windup,
    cooldownMs: Math.max(450, c.cooldown - wave * 30),
    hurtMs: c.hurt,
  };
};

const startAttack = (ent: Entity, def: AttackDef, state: "punch" | "kick") => {
  ent.state = state;
  ent.attack = def;
  ent.stateTimer = def.dur;
  ent.hitIds.clear();
};

// The hitbox only exists during the "active" part of a swing, and follows the fighter.
const activeHitbox = (ent: Entity): Rect | null => {
  if ((ent.state !== "punch" && ent.state !== "kick") || !ent.attack) return null;
  const a = ent.attack;
  const p = 1 - ent.stateTimer / a.dur;
  if (p < 0.25 || p > 0.8) return null;
  return {
    x: ent.facing === "right" ? ent.x + ent.w : ent.x - a.range,
    y: ent.y + a.y,
    w: a.range,
    h: a.h,
  };
};

const isOnGround = (ent: Entity) => ent.y + ent.h >= FLOOR_Y - 0.5;

const updateEntity = (ent: Entity, dt: number, f: number) => {
  ent.vy += GRAVITY * f;
  ent.x += ent.vx * f;
  ent.y += ent.vy * f;

  if (ent.y + ent.h > FLOOR_Y) {
    ent.y = FLOOR_Y - ent.h;
    ent.vy = 0;
  }

  ent.vx *= Math.pow(0.8, f); // friction

  if (ent.cooldown > 0) ent.cooldown -= dt;
  if (ent.invuln > 0) ent.invuln -= dt;

  if (ent.stateTimer > 0) {
    ent.stateTimer -= dt;
    if (ent.stateTimer <= 0 && ent.state !== "dead") {
      ent.state = "idle";
      ent.attack = null;
    }
  }
};

const drawStickman = (ctx: CanvasRenderingContext2D, ent: Entity, time: number) => {
  ctx.save();
  if (ent.kind === "player" && ent.invuln > 0 && Math.floor(time / 80) % 2 === 0) {
    ctx.globalAlpha = 0.35; // i-frame blink
  }
  ctx.translate(ent.x + ent.w / 2, ent.y + ent.h / 2);
  if (ent.state === "dead") ctx.translate(0, ent.h / 2 - 12); // lie on the floor
  if (ent.facing === "left") ctx.scale(-1, 1);
  const s = ent.h / 80;
  ctx.scale(s, s);

  ctx.strokeStyle = ent.state === "hurt" ? "#ffffff" : ent.color;
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const t = time / 150;
  let headY = -30;
  let bodyTilt = 0;
  let leftArmRot = 0;
  let rightArmRot = 0;
  let leftLegRot = 0;
  let rightLegRot = 0;

  if (ent.state === "walk") {
    leftLegRot = Math.sin(t) * 0.8;
    rightLegRot = Math.sin(t + Math.PI) * 0.8;
    leftArmRot = Math.sin(t + Math.PI) * 0.5;
    rightArmRot = Math.sin(t) * 0.5;
  } else if (ent.state === "windup") {
    rightArmRot = Math.PI * 0.65; // arm cocked back
    bodyTilt = -0.15;
  } else if (ent.state === "punch") {
    rightArmRot = -Math.PI / 2;
    bodyTilt = 0.2;
  } else if (ent.state === "kick") {
    rightLegRot = -Math.PI / 2 + 0.2;
    leftLegRot = 0.2;
    bodyTilt = -0.2;
  } else if (ent.state === "hurt") {
    bodyTilt = -0.5;
    headY = -20;
    leftArmRot = 0.5;
    rightArmRot = 0.5;
  } else if (ent.state === "dash") {
    bodyTilt = 0.45;
    leftArmRot = 1.0;
    rightArmRot = 1.0; // arms trail behind
    leftLegRot = 0.9;
    rightLegRot = -0.7;
  } else if (ent.state === "dead") {
    ctx.rotate(Math.PI / 2);
  }

  if (ent.state !== "dead" && !isOnGround(ent) && ent.state !== "kick" && ent.state !== "hurt" && ent.state !== "dash") {
    leftLegRot = 0.5;
    rightLegRot = -0.5; // jump pose
  }

  ctx.rotate(bodyTilt);

  // Head + eye
  ctx.beginPath();
  ctx.arc(0, headY, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(5, headY - 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // Torso
  ctx.beginPath();
  ctx.moveTo(0, headY + 12);
  ctx.lineTo(0, 10);
  ctx.stroke();

  // Arms
  ctx.save();
  ctx.translate(0, headY + 15);
  ctx.save(); ctx.rotate(leftArmRot + 0.2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 20); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.rotate(rightArmRot - 0.2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 20); ctx.stroke(); ctx.restore();
  ctx.restore();

  // Legs
  ctx.save();
  ctx.translate(0, 10);
  ctx.save(); ctx.rotate(leftLegRot + 0.1); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 25); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.rotate(rightLegRot - 0.1); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 25); ctx.stroke(); ctx.restore();
  ctx.restore();

  ctx.restore();

  // Enemy health bar + attack telegraph
  if (ent.kind !== "player" && ent.state !== "dead") {
    const barW = ent.w + 10;
    ctx.fillStyle = "#4b5563";
    ctx.fillRect(ent.x - 5, ent.y - 16, barW, 4);
    ctx.fillStyle = ent.color;
    ctx.fillRect(ent.x - 5, ent.y - 16, barW * Math.max(0, ent.health / ent.maxHealth), 4);
    if (ent.state === "windup") {
      ctx.fillStyle = "#facc15";
      ctx.font = "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("!", ent.x + ent.w / 2, ent.y - 22);
    }
  }
};

export default function StickmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // React state (UI only)
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    soundMuted = muted;
  }, [muted]);

  // Mutable game state (no re-renders in the 60fps loop)
  const gameState = useRef<Game>(newGame(false));
  const bestRef = useRef(0);

  const togglePause = useCallback(() => {
    const g = gameState.current;
    if (!g.isRunning || g.deathTimer !== null) return;
    g.paused = !g.paused;
    if (g.paused) resetKeys(g);
    setIsPaused(g.paused);
  }, []);

  // --- Best score ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem("stickmanBest");
      const n = saved ? parseInt(saved, 10) : 0;
      if (!Number.isNaN(n)) {
        bestRef.current = n;
        setBestScore(n);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  // --- Input Handling ---
  useEffect(() => {
    const isTyping = (e: KeyboardEvent) =>
      e.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(e.target.tagName);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      if (e.code === "KeyP" || e.code === "Escape") {
        if (!e.repeat) togglePause();
        return;
      }
      const action = KEY_MAP[e.code];
      if (!action) return;
      const g = gameState.current;
      if (g.isRunning) e.preventDefault(); // stop arrows/space scrolling the page
      g.keys[action] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code];
      if (!action) return;
      gameState.current.keys[action] = false;
    };
    // Alt-tabbing mid-move must not leave keys stuck; also auto-pause.
    const handleBlur = () => {
      const g = gameState.current;
      resetKeys(g);
      if (g.isRunning && !g.paused) togglePause();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [togglePause]);

  // --- Touch Controls for Mobile ---
  const press = (action: keyof Keys, isDown: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    gameState.current.keys[action] = isDown;
  };
  const btn = (action: keyof Keys) => ({
    onPointerDown: press(action, true),
    onPointerUp: press(action, false),
    onPointerLeave: press(action, false),
    onPointerCancel: press(action, false), // cancelled touches no longer leave a direction held
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  // --- Game Loop (runs for the lifetime of the component) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let lastTime = performance.now();

    const createParticles = (g: Game, x: number, y: number, color: string, count = 10) => {
      for (let i = 0; i < count; i++) {
        g.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10 - 1,
          life: 1,
          color,
        });
      }
    };

    const addText = (g: Game, x: number, y: number, text: string, color: string) => {
      g.texts.push({ x, y, text, color, life: 1 });
    };

    const finishGame = (g: Game) => {
      g.isRunning = false;
      g.deathTimer = null;
      resetKeys(g);
      const isNew = g.score > bestRef.current;
      if (isNew) {
        bestRef.current = g.score;
        setBestScore(g.score);
        try {
          localStorage.setItem("stickmanBest", g.score.toString());
        } catch {
          /* storage unavailable */
        }
      }
      setNewBest(isNew);
      setIsPlaying(false);
      setIsGameOver(true);
      setShowSubmitModal(true);
    };

    const update = (g: Game, dt: number, f: number) => {
      const player = g.player;

      // Global timers
      if (g.comboTimer > 0) {
        g.comboTimer -= dt;
        if (g.comboTimer <= 0) g.combo = 0;
      }
      if (g.banner.timer > 0) g.banner.timer -= dt;
      if (g.chainTimer > 0) {
        g.chainTimer -= dt;
        if (g.chainTimer <= 0) g.chain = 0;
      }
      g.shake *= Math.pow(0.85, f);
      if (g.shake < 0.2) g.shake = 0;

      // Hit-stop: a brief freeze on impact makes hits feel heavy
      if (g.hitStop > 0) {
        g.hitStop -= dt;
        return;
      }

      // --- Player ---
      if (player) {
        if (player.state === "dash") {
          // Dash: fixed-speed burst with i-frames and a afterimage trail
          player.vx = (player.facing === "right" ? 1 : -1) * 14;
          createParticles(g, player.x + player.w / 2, player.y + player.h - 10, "#67e8f9", 1);
        } else if (player.state !== "dead" && player.state !== "hurt") {
          const { keys, lastKeys } = g;
          const attacking =
            (player.state === "punch" || player.state === "kick") && player.stateTimer > 0;
          const accel = (attacking ? 0.4 : 1) * 1.5 * f;
          const dir = keys.left === keys.right ? 0 : keys.left ? -1 : 1;

          // Movement never overwrites an attack pose (fixes the vanishing punch/kick bug)
          if (dir !== 0) {
            player.vx += dir * accel;
            if (!attacking) player.facing = dir < 0 ? "left" : "right";
          }
          if (!attacking) player.state = dir !== 0 ? "walk" : "idle";

          if (player.vx > MAX_SPEED) player.vx = MAX_SPEED;
          if (player.vx < -MAX_SPEED) player.vx = -MAX_SPEED;

          if (keys.up && isOnGround(player)) player.vy = -JUMP_POWER;

          if (!attacking) {
            if (keys.dash && !lastKeys.dash && player.cooldown <= 0) {
              player.state = "dash";
              player.attack = null;
              player.stateTimer = 200;
              player.invuln = Math.max(player.invuln, 260);
              player.cooldown = 700;
              playSfx("dash");
            } else if (keys.punch && !lastKeys.punch) {
              // Third punch in a quick chain becomes a heavy finisher
              g.chain = g.chainTimer > 0 ? g.chain + 1 : 1;
              const finisher = g.chain >= 3;
              startAttack(player, finisher ? PLAYER_FINISHER : PLAYER_PUNCH, "punch");
              if (finisher) g.chain = 0;
              g.chainTimer = 600;
              playSfx("swing");
            } else if (keys.kick && !lastKeys.kick) {
              startAttack(player, PLAYER_KICK, "kick");
              g.chain = 0;
              playSfx("swing");
            }
          }
        }

        updateEntity(player, dt, f);
        if (player.x < 0) player.x = 0;
        if (player.x > CANVAS_W - player.w) player.x = CANVAS_W - player.w;
      }

      g.lastKeys.punch = g.keys.punch;
      g.lastKeys.kick = g.keys.kick;
      g.lastKeys.dash = g.keys.dash;

      const playerAlive = !!player && player.state !== "dead";

      // --- Enemies ---
      for (let i = g.enemies.length - 1; i >= 0; i--) {
        const e = g.enemies[i];
        const wasWindup = e.state === "windup";
        updateEntity(e, dt, f);
        const alive = e.state !== "dead";

        // Wind-up finished -> swing
        if (wasWindup && alive && e.state === "idle") {
          startAttack(e, ENEMY_KINDS[e.kind as Exclude<Kind, "player">].attack, "punch");
        }

        // AI
        if (alive && playerAlive && player && e.state !== "hurt") {
          if (e.state === "idle" || e.state === "walk") {
            const dist = player.x + player.w / 2 - (e.x + e.w / 2);
            const absDist = Math.abs(dist);
            const def = ENEMY_KINDS[e.kind as Exclude<Kind, "player">].attack;
            const reach = e.w / 2 + def.range + player.w / 2;
            e.facing = dist > 0 ? "right" : "left";

            if (absDist > reach - 12) {
              // enemy speed now actually scales with wave (accel tuned so top speed == e.speed)
              e.vx += (dist > 0 ? 1 : -1) * e.speed * 0.25 * f;
              const cap = e.speed * 1.25;
              if (e.vx > cap) e.vx = cap;
              if (e.vx < -cap) e.vx = -cap;
              e.state = "walk";
            } else {
              e.state = "idle";
              if (e.cooldown <= 0) {
                // Telegraphed attack: wind-up ("!") gives the player time to react
                e.state = "windup";
                e.stateTimer = e.windupMs;
                e.cooldown = e.windupMs + def.dur + e.cooldownMs;
              }
            }
          }
        } else if (alive && e.state === "walk") {
          e.state = "idle";
        }

        // Player hits enemy (a swing can hit several enemies, each only once)
        const pbox = player ? activeHitbox(player) : null;
        if (player && pbox && alive && !player.hitIds.has(e.id) && checkCollision(pbox, e)) {
          const a = player.attack as AttackDef;
          player.hitIds.add(e.id);
          e.health -= a.dmg;
          e.state = "hurt";
          e.attack = null; // a stunned enemy can't land its swing
          e.stateTimer = e.hurtMs;
          const kbMul = e.kind === "brute" ? 0.4 : 1;
          e.vx = (player.facing === "right" ? a.kb : -a.kb) * kbMul;
          e.vy = -3;

          g.combo++;
          g.comboTimer = 1500;
          g.hitStop = a.dmg >= 25 ? 70 : 40;
          g.shake = Math.max(g.shake, a.dmg >= 25 ? 6 : 3);
          createParticles(g, e.x + e.w / 2, e.y + e.h / 2, e.color);
          addText(g, e.x + e.w / 2, e.y - 10, `-${a.dmg}`, "#fde047");
          if (a.finisher) {
            addText(g, e.x + e.w / 2, e.y - 30, "FINISHER!", "#fb923c");
            g.shake = Math.max(g.shake, 8);
          }
          playSfx(a.dmg >= 25 ? "heavy" : "hit");

          if (e.health <= 0) {
            e.health = 0;
            e.state = "dead";
            e.stateTimer = 3000;
            g.score += 1;
            setScore(g.score);
            playSfx("kill");
            createParticles(g, e.x + e.w / 2, e.y + e.h / 2, e.color, 16);
            if (Math.random() < 0.15) g.pickups.push({ x: e.x + e.w / 2, y: FLOOR_Y - 16, life: 8000 });
            const newWave = 1 + Math.floor(g.score / 5);
            if (newWave > g.wave) {
              g.wave = newWave;
              g.banner = { text: `Wave ${newWave}`, timer: 1800 };
              playSfx("wave");
            }
          }
        }

        // Enemy hits player
        const ebox = activeHitbox(e);
        if (
          player && ebox && alive && playerAlive &&
          player.invuln <= 0 && !e.hitIds.has("player") && checkCollision(ebox, player)
        ) {
          const a = e.attack as AttackDef;
          e.hitIds.add("player");
          player.health -= a.dmg;
          player.state = "hurt";
          player.attack = null;
          player.stateTimer = 300;
          player.invuln = 900;
          player.vx = e.facing === "right" ? a.kb : -a.kb;
          player.vy = -4;

          g.combo = 0;
          g.comboTimer = 0;
          g.hitStop = 60;
          g.shake = Math.max(g.shake, 6);
          createParticles(g, player.x + player.w / 2, player.y + player.h / 2, "#06b6d4");
          addText(g, player.x + player.w / 2, player.y - 10, `-${a.dmg}`, "#f87171");
          setPlayerHealth(Math.max(0, player.health)); // sync right when damage happens
          playSfx("hurt");

          if (player.health <= 0) {
            player.health = 0;
            player.state = "dead";
            player.stateTimer = 0;
            g.deathTimer = 900; // let the death animation play before the game-over screen
            g.shake = 10;
          }
        }

        // Remove dead bodies after timer
        if (e.state === "dead" && e.stateTimer <= 0) g.enemies.splice(i, 1);
      }

      // Keep enemies from stacking on one pixel
      for (let i = 0; i < g.enemies.length; i++) {
        for (let j = i + 1; j < g.enemies.length; j++) {
          const a = g.enemies[i];
          const b = g.enemies[j];
          if (a.state === "dead" || b.state === "dead") continue;
          const d = b.x + b.w / 2 - (a.x + a.w / 2);
          const min = ((a.w + b.w) / 2) * 0.9;
          if (Math.abs(d) < min) {
            const push = (min - Math.abs(d)) * 0.1 * f;
            const dir = d >= 0 ? 1 : -1;
            a.x -= dir * push;
            b.x += dir * push;
          }
        }
      }

      // Pickups
      for (let i = g.pickups.length - 1; i >= 0; i--) {
        const pk = g.pickups[i];
        pk.life -= dt;
        if (
          player && playerAlive && player.health < player.maxHealth &&
          checkCollision(player, { x: pk.x - 14, y: pk.y - 14, w: 28, h: 28 })
        ) {
          player.health = Math.min(player.maxHealth, player.health + 20);
          setPlayerHealth(player.health);
          addText(g, pk.x, pk.y - 20, "+20", "#4ade80");
          playSfx("heal");
          createParticles(g, pk.x, pk.y, "#4ade80", 8);
          g.pickups.splice(i, 1);
        } else if (pk.life <= 0) {
          g.pickups.splice(i, 1);
        }
      }

      // Spawner
      g.spawnTimer -= dt;
      const aliveCount = g.enemies.filter((e) => e.state !== "dead").length;
      if (g.spawnTimer <= 0 && playerAlive && aliveCount < Math.min(8, 3 + Math.floor(g.wave / 2))) {
        g.enemies.push(spawnEnemy(g.wave));
        g.spawnTimer = Math.max(500, 2000 - g.wave * 100);
      }

      // Particles + floating texts
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx * f;
        p.y += p.vy * f;
        p.vy += 0.3 * f;
        p.life -= 0.04 * f;
        if (p.life <= 0) g.particles.splice(i, 1);
      }
      for (let i = g.texts.length - 1; i >= 0; i--) {
        const t = g.texts[i];
        t.y -= 0.6 * f;
        t.life -= dt / 800;
        if (t.life <= 0) g.texts.splice(i, 1);
      }

      // Death -> game over
      if (g.deathTimer !== null) {
        g.deathTimer -= dt;
        if (g.deathTimer <= 0) finishGame(g);
      }
    };

    const draw = (g: Game, time: number) => {
      ctx.save();
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      if (g.shake > 0) {
        ctx.translate((Math.random() - 0.5) * g.shake * 2, (Math.random() - 0.5) * g.shake * 2);
      }

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
      grad.addColorStop(0, "#111827");
      grad.addColorStop(1, "#1f2937");
      ctx.fillStyle = grad;
      ctx.fillRect(-20, -20, CANVAS_W + 40, FLOOR_Y + 20);

      // Parallax skyline (two layers shift slightly as the player moves)
      const camX = g.player ? g.player.x - CANVAS_W / 2 : 0;
      ctx.fillStyle = "#0b1220";
      SKYLINE.forEach((b) => ctx.fillRect(b.x - camX * 0.02, FLOOR_Y - b.h - 30, b.w, b.h + 30));
      ctx.fillStyle = "#0f172a";
      SKYLINE.forEach((b) =>
        ctx.fillRect(b.x + 28 - camX * 0.05, FLOOR_Y - b.h * 0.6, b.w * 0.8, b.h * 0.6)
      );

      // Floor
      ctx.fillStyle = "#1f2937";
      ctx.fillRect(-20, FLOOR_Y, CANVAS_W + 40, CANVAS_H - FLOOR_Y + 20);
      ctx.fillStyle = "#4b5563";
      ctx.fillRect(-20, FLOOR_Y, CANVAS_W + 40, 2);

      // Pickups
      ctx.font = "22px serif";
      ctx.textAlign = "center";
      g.pickups.forEach((pk) => {
        if (pk.life < 2000 && Math.floor(time / 120) % 2 === 0) return; // blink before vanishing
        ctx.fillText("❤️", pk.x, pk.y + 6 + Math.sin(time / 200) * 3);
      });

      // Particles
      g.particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Entities (bodies first)
      g.enemies.filter((e) => e.state === "dead").forEach((e) => drawStickman(ctx, e, time));
      g.enemies.filter((e) => e.state !== "dead").forEach((e) => drawStickman(ctx, e, time));
      if (g.player) drawStickman(ctx, g.player, time);

      // Floating damage numbers
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      g.texts.forEach((t) => {
        ctx.globalAlpha = Math.max(0, t.life);
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, t.x, t.y);
      });
      ctx.globalAlpha = 1;
      ctx.restore();

      // Overlays that shouldn't shake
      if (g.isRunning && g.combo >= 2) {
        ctx.globalAlpha = Math.min(1, g.comboTimer / 500);
        ctx.fillStyle = "#fb923c";
        ctx.font = "900 28px sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(`x${g.combo} COMBO`, CANVAS_W - 20, 44);
        ctx.globalAlpha = 1;
      }
      if (g.banner.timer > 0) {
        ctx.globalAlpha = Math.min(1, g.banner.timer / 400);
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(g.banner.text, CANVAS_W / 2, 130);
        ctx.globalAlpha = 1;
      }
    };

    const loop = (time: number) => {
      const g = gameState.current;
      let dt = Math.min(time - lastTime, MAX_FRAME_MS);
      lastTime = time;

      if (g.isRunning && !g.paused) {
        if (g.deathTimer !== null) dt *= 0.5; // slow-mo death
        update(g, dt, dt / FRAME_MS);
      }
      draw(g, time);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const startGame = () => {
    gameState.current = newGame(true);
    setScore(0);
    setPlayerHealth(100);
    setIsPlaying(true);
    setIsGameOver(false);
    setIsPaused(false);
    setNewBest(false);
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
                style={{ width: `${Math.max(0, Math.min(100, playerHealth))}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute" : "Mute"}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            {muted ? <VolumeX className="w-4 h-4 text-gray-700" /> : <Volume2 className="w-4 h-4 text-gray-700" />}
          </button>
          <button
            onClick={togglePause}
            disabled={!isPlaying}
            aria-label="Pause"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <Pause className="w-4 h-4 text-gray-700" />
          </button>
          <div className="flex flex-col items-end">
            <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Best</span>
            <span className="text-2xl font-black text-orange-500 leading-none">{bestScore}</span>
          </div>
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
              Desktop: Arrows/WASD to move &amp; jump, Z to Punch (3rd hit is a finisher), X to Kick, Shift to Dash (dodges hits), P to pause.<br />
              Watch for the <span className="text-yellow-400 font-bold">!</span> — jump or back off before the swing lands.<br />
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

        {isPaused && isPlaying && (
          <div className="absolute inset-0 z-20 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <h2 className="text-4xl font-black mb-6 tracking-tight">Paused</h2>
            <button
              onClick={togglePause}
              className="flex items-center justify-center bg-white text-gray-900 px-10 py-4 rounded-full font-black hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl text-lg w-full max-w-[250px]"
            >
              <Play className="w-5 h-5 mr-2" /> Resume
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 z-20 bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-24 h-24 bg-red-900/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-500/30">
              <span className="text-5xl">💀</span>
            </div>
            <h2 className="text-4xl font-black mb-2 tracking-tight text-red-500">Wasted</h2>
            <p className="text-gray-300 text-lg mb-2 font-medium">
              You defeated <span className="font-black text-white text-2xl mx-1">{score}</span>{" "}
              {score === 1 ? "stickman" : "stickmen"}.
            </p>
            {newBest && <p className="text-orange-400 font-black mb-6">New best!</p>}
            {!newBest && <div className="mb-6" />}
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
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Mobile Controls */}
      <div className="w-full mt-4 flex sm:hidden justify-between px-2 gap-4 shrink-0 pb-10">
        {/* D-PAD */}
        <div className="flex gap-2 relative h-32 w-32">
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-200/50 active:bg-gray-300 rounded-full flex items-center justify-center text-2xl font-black backdrop-blur-sm shadow-sm select-none"
            {...btn("left")}
          >◀</button>
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-200/50 active:bg-gray-300 rounded-full flex items-center justify-center text-2xl font-black backdrop-blur-sm shadow-sm select-none"
            {...btn("right")}
          >▶</button>
          <button
            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-200/50 active:bg-gray-300 rounded-full flex items-center justify-center text-2xl font-black backdrop-blur-sm shadow-sm select-none"
            {...btn("up")}
          >▲</button>
        </div>

        {/* Actions */}
        <div className="flex gap-4 items-end relative h-32 w-32">
          <button
            className="absolute bottom-0 left-0 w-14 h-14 bg-red-100/50 active:bg-red-200 rounded-full flex items-center justify-center text-red-600 font-black backdrop-blur-sm shadow-sm border border-red-200 select-none text-xs"
            {...btn("kick")}
          >KICK</button>
          <button
            className="absolute top-0 left-0 w-12 h-12 bg-sky-100/50 active:bg-sky-200 rounded-full flex items-center justify-center text-sky-600 font-black backdrop-blur-sm shadow-sm border border-sky-200 select-none text-[10px]"
            {...btn("dash")}
          >DASH</button>
          <button
            className="absolute top-4 right-0 w-16 h-16 bg-cyan-100/50 active:bg-cyan-200 rounded-full flex items-center justify-center text-cyan-600 font-black backdrop-blur-sm shadow-sm border border-cyan-200 select-none text-sm"
            {...btn("punch")}
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
