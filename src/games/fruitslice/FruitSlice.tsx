/* eslint-disable */
"use client";

import { useRef, useState } from "react";
import CanvasGameShell, { CanvasGameConfig, CanvasShellApi } from "@/components/CanvasGameShell";

const FRUITS = ["🍉", "🍊", "🍎", "🍌", "🍇", "🍓", "🍍", "🥝"];
const FCOL = ["#ff4d6d", "#ff9f1c", "#e63946", "#ffd23f", "#9b5de5", "#ff4d6d", "#ffc83d", "#8ac926"];
const BOMB = "💣";
const ICE = "❄️";
const STAR = "⭐";
const LIMIT = 60;

interface Item {
  x: number;
  y: number;
  vx: number;
  vy: number;
  e: string;
  kind: "fruit" | "bomb" | "gold" | "ice";
  col: string;
  rot: number;
  spin: number;
}

interface Half {
  e: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ang: number;
  side: number;
  rot: number;
  spin: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  c: string;
}

interface Stain {
  x: number;
  y: number;
  r: number;
  c: string;
  life: number;
}

interface Pop {
  s: string;
  x: number;
  y: number;
  c: string;
  life: number;
  max: number;
  big: boolean;
}

function segDist(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export default function FruitSlice() {
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem("egz-fs-mute") === "1";
    } catch {
      return false;
    }
  });
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const acRef = useRef<AudioContext | null>(null);
  const stateRef = useRef({
    api: null as CanvasShellApi | null,
    rnd: Math.random,
    items: [] as Item[],
    halves: [] as Half[],
    trail: [] as { x: number; y: number; t: number }[],
    ps: [] as Particle[],
    stains: [] as Stain[],
    pops: [] as Pop[],
    score: 0,
    t: 0,
    next: 0.5,
    flash: 0,
    shake: 0,
    freeze: 0,
    n: 0,
    down: false,
    last: null as { x: number; y: number } | null,
    count: 0,
  });

  const getAudio = () => {
    if (!acRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        acRef.current = new AudioCtx();
      } catch {}
    }
    return acRef.current;
  };

  const sfx = (k: "slice" | "bomb" | "gold") => {
    try {
      if (mutedRef.current) return;
      const ac = getAudio();
      if (!ac) return;
      const now = ac.currentTime;
      if (k === "slice") {
        const n = Math.floor(ac.sampleRate * 0.12);
        const b = ac.createBuffer(1, n, ac.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        const s = ac.createBufferSource();
        const f = ac.createBiquadFilter();
        const g = ac.createGain();
        f.type = "bandpass";
        f.frequency.value = 2500;
        g.gain.value = 0.25;
        s.buffer = b;
        s.connect(f);
        f.connect(g);
        g.connect(ac.destination);
        s.start();
      } else {
        const o = ac.createOscillator();
        const g = ac.createGain();
        const bomb = k === "bomb";
        o.type = bomb ? "sawtooth" : "sine";
        o.frequency.setValueAtTime(bomb ? 160 : 700, now);
        o.frequency.exponentialRampToValueAtTime(bomb ? 40 : 1300, now + 0.25);
        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        o.connect(g);
        g.connect(ac.destination);
        o.start(now);
        o.stop(now + 0.3);
      }
    } catch {}
  };

  const pop = (s: string, x: number, y: number, c: string, life: number, big: boolean) => {
    stateRef.current.pops.push({ s, x, y, c, life, max: life, big });
  };

  const splash = (x: number, y: number, col: string, n: number, speed: number) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283;
      const sp = (0.3 + Math.random() * 0.7) * speed;
      stateRef.current.ps.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: 0.7,
        max: 0.7,
        r: 2.5 + Math.random() * 4,
        c: col,
      });
    }
  };

  const spawn = () => {
    const st = stateRef.current;
    if (!st.api) return;
    const r = st.rnd;
    const { W, H } = st.api;
    const n = 1 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const k = ++st.n > 3 ? r() : 1;
      const fi = Math.floor(r() * FRUITS.length);
      let e = FRUITS[fi];
      let kind: Item["kind"] = "fruit";
      if (k < 0.13) {
        e = BOMB;
        kind = "bomb";
      } else if (k < 0.18) {
        e = STAR;
        kind = "gold";
      } else if (k < 0.22) {
        e = ICE;
        kind = "ice";
      }
      const x = W * (0.15 + 0.7 * r());
      st.items.push({
        x,
        y: H + 30,
        vx: (W / 2 - x) * (0.3 + 0.4 * r()),
        vy: -H * (1.15 + 0.25 * r()),
        e,
        kind,
        col: FCOL[fi],
        rot: 0,
        spin: (r() - 0.5) * 4,
      });
    }
    st.next = st.t + Math.max(0.55, 1.1 - 0.01 * st.t);
  };

  const sliceSeg = (a: { x: number; y: number }, b: { x: number; y: number }): number => {
    const st = stateRef.current;
    if (!st.api) return 0;
    const R = st.api.W * 0.075;
    let hit = 0;
    st.items = st.items.filter((it) => {
      if (segDist(it, a, b) > R) return true;
      if (it.kind === "bomb") {
        st.score = Math.max(0, st.score - 5);
        st.flash = 0.4;
        st.shake = 0.5;
        splash(it.x, it.y, "#ff9f1c", 18, 320);
        splash(it.x, it.y, "#555", 10, 220);
        pop("BOMB -5", it.x, it.y, "#ff5d73", 0.9, true);
        sfx("bomb");
        return false;
      }
      if (it.kind === "ice") {
        st.freeze = st.t + 3;
        splash(it.x, it.y, "#9fe8ff", 16, 220);
        pop("SLOW-MO!", it.x, it.y, "#2d9cdb", 1, true);
        sfx("gold");
        return false;
      }
      if (it.kind === "gold") {
        st.score += 5;
        splash(it.x, it.y, "#ffc83d", 22, 300);
        pop("+5", it.x, it.y, "#e0a100", 0.9, true);
        sfx("gold");
        hit++;
        return false;
      }
      st.score++;
      hit++;
      sfx("slice");
      splash(it.x, it.y, it.col, 12, 260);
      pop("+1", it.x, it.y - 20, "#1f5130", 0.55, false);
      st.stains.push({ x: it.x, y: it.y, r: R * (0.8 + Math.random() * 0.5), c: it.col, life: 4 });
      if (st.stains.length > 10) st.stains.shift();
      const ang = Math.atan2(b.y - a.y, b.x - a.x);
      const nx = -Math.sin(ang);
      const ny = Math.cos(ang);
      [-1, 1].forEach((sd) =>
        st.halves.push({
          e: it.e,
          x: it.x,
          y: it.y,
          vx: it.vx + nx * sd * 110,
          vy: it.vy + ny * sd * 110,
          ang,
          side: sd,
          rot: 0,
          spin: sd * 2,
        })
      );
      return false;
    });
    return hit;
  };

  const config: CanvasGameConfig = {
    gameId: "fruitslice",
    title: "Fruit Slice",
    overTitle: "Time's up!",
    unit: "score",
    lowerIsBetter: false,
    aspect: 1.2,
    labels: ["Score", "Left"],
    intro: "Swipe to slice the flying fruit. Dodge the bombs! Stars are worth 5, snowflakes slow time. 60 seconds, and 3+ fruit in one swipe is a combo.",
    help: "Swipe across fruit: +1 each. Combos of 3+ add bonus points. Bomb = -5. Star = +5. Snowflake = slow motion for 3 seconds.",
    theme: {
      wrapperBg: "linear-gradient(170deg, #c8f2c2, #fff3b0 70%, #ffd9a8)",
      cardBg: "#fffdf2",
      canvasBg: "linear-gradient(#fff7e0, #ffe7b8)",
      border: "#1f5130",
      text: "#1f5130",
      mute: "#5e8a6a",
      accent: "#ff5d73",
      accentText: "#ffffff",
      sun: "#ffc83d",
      sunText: "#1f5130",
    },
    onInit(rnd, api) {
      const st = stateRef.current;
      st.api = api;
      st.rnd = rnd;
      st.items = [];
      st.halves = [];
      st.trail = [];
      st.ps = [];
      st.stains = [];
      st.pops = [];
      st.score = 0;
      st.t = 0;
      st.next = 0.5;
      st.flash = 0;
      st.shake = 0;
      st.freeze = 0;
      st.n = 0;
      st.down = false;
      st.last = null;
      st.count = 0;
    },
    onPointerDown(e, api) {
      if (!api.playing()) return;
      const ac = getAudio();
      if (ac && ac.state === "suspended") ac.resume();
      const p = api.pos(e);
      const st = stateRef.current;
      st.down = true;
      st.count = 0;
      st.last = p;
      st.trail = [{ x: p.x, y: p.y, t: st.t }];
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e, api) {
      const st = stateRef.current;
      if (!st.down || !api.playing() || !st.last) return;
      const p = api.pos(e);
      st.trail.push({ x: p.x, y: p.y, t: st.t });
      st.count += sliceSeg(st.last, p);
      st.last = p;
    },
    onPointerUp() {
      const st = stateRef.current;
      if (st.down && st.count >= 3 && st.api) {
        st.score += st.count;
        pop(`COMBO x${st.count}!`, st.api.W / 2, st.api.H * 0.35, "#ff5d73", 1.2, true);
        sfx("gold");
      }
      st.down = false;
    },
    onPointerCancel() {
      stateRef.current.down = false;
    },
    onUpdate(dt, t) {
      const st = stateRef.current;
      if (!st.api) return;
      st.t = t;
      const H = st.api.H;
      const G = H * 1.1;
      const k = t < st.freeze ? 0.35 : 1;
      const d = dt * k;
      if (t >= st.next) spawn();
      st.items.forEach((i) => {
        i.vy += G * d;
        i.x += i.vx * d;
        i.y += i.vy * d;
        i.rot += i.spin * d;
      });
      st.items = st.items.filter((i) => !(i.y > H + 60 && i.vy > 0));
      st.halves.forEach((h) => {
        h.vy += G * d;
        h.x += h.vx * d;
        h.y += h.vy * d;
        h.rot += h.spin * d;
      });
      st.halves = st.halves.filter((h) => h.y < H + 90);
      st.ps.forEach((p) => {
        p.vy += G * 0.6 * d;
        p.x += p.vx * d;
        p.y += p.vy * d;
        p.life -= dt;
      });
      st.ps = st.ps.filter((p) => p.life > 0);
      st.stains.forEach((s) => (s.life -= dt));
      st.stains = st.stains.filter((s) => s.life > 0);
      st.pops.forEach((p) => {
        p.life -= dt;
        p.y -= 30 * dt;
      });
      st.pops = st.pops.filter((p) => p.life > 0);
      st.trail = st.trail.filter((p) => t - p.t < 0.25);
      st.flash = Math.max(0, st.flash - dt);
      st.shake = Math.max(0, st.shake - dt);
      if (t >= LIMIT) st.api.finish(st.score);
    },
    onDraw(ctx, W, H) {
      const st = stateRef.current;
      const R = W * 0.075;
      ctx.save();
      if (st.shake > 0) {
        ctx.translate((Math.random() - 0.5) * 16 * st.shake, (Math.random() - 0.5) * 16 * st.shake);
      }
      st.stains.forEach((s) => {
        ctx.globalAlpha = Math.min(1, s.life) * 0.28;
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${R * 2.1}px serif`;
      st.items.forEach((i) => {
        ctx.save();
        ctx.translate(i.x, i.y);
        ctx.rotate(i.rot);
        ctx.fillText(i.e, 0, 0);
        ctx.restore();
      });
      st.halves.forEach((h) => {
        ctx.save();
        ctx.translate(h.x, h.y);
        const a = h.ang + h.rot;
        ctx.rotate(a);
        ctx.beginPath();
        ctx.rect(-R * 1.5, h.side < 0 ? -R * 1.5 : 0, R * 3, R * 1.5);
        ctx.clip();
        ctx.rotate(-a);
        ctx.fillText(h.e, 0, 0);
        ctx.restore();
      });
      st.ps.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life / p.max);
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.lineCap = "round";
      for (let i = 1; i < st.trail.length; i++) {
        const p = st.trail[i - 1];
        const q = st.trail[i];
        const al = 1 - (st.t - q.t) / 0.25;
        ctx.strokeStyle = "#ff5d73";
        ctx.globalAlpha = Math.max(0, al);
        ctx.lineWidth = 3 + 7 * al;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.lineJoin = "round";
      st.pops.forEach((p) => {
        ctx.globalAlpha = Math.min(1, (p.life / p.max) * 1.5);
        ctx.fillStyle = p.c;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 5;
        ctx.font = `900 ${p.big ? 30 : 20}px "Trebuchet MS", sans-serif`;
        ctx.strokeText(p.s, p.x, p.y);
        ctx.fillText(p.s, p.x, p.y);
      });
      ctx.globalAlpha = 1;
      if (st.t < st.freeze) {
        ctx.fillStyle = "#9fe8ff";
        ctx.globalAlpha = 0.22;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      if (st.flash > 0) {
        ctx.fillStyle = "#ff5d73";
        ctx.globalAlpha = st.flash * 1.2;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    },
    getHud(t) {
      return [stateRef.current.score, `${Math.max(0, Math.ceil(LIMIT - t))}s`];
    },
    renderControls() {
      return (
        <button
          type="button"
          onClick={() => {
            const next = !muted;
            setMuted(next);
            try {
              localStorage.setItem("egz-fs-mute", next ? "1" : "0");
            } catch {}
          }}
          className="px-4 py-2 rounded-xl font-bold text-sm border-2 cursor-pointer"
          style={{
            background: "#fffdf2",
            borderColor: "#1f5130",
            color: "#1f5130",
          }}
        >
          {muted ? "Sound: Off" : "Sound: On"}
        </button>
      );
    },
  };

  return <CanvasGameShell config={config} />;
}
