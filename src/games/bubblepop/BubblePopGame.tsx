/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SubmitScoreModal from "@/components/SubmitScoreModal";
import { RotateCcw, Volume2, VolumeX, Trophy, Play, ArrowUpDown } from "lucide-react";

const COLS = ["#ff4d6d", "#ffc300", "#2ec27e", "#2da8ff", "#a259ff", "#ff8c42"];
const NC = 10;
const SQ = Math.sqrt(3);
const TOP = 6;

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  c: number;
}

interface Particle {
  x: number;
  y: number;
  c?: number;
  t: number;
  type: "pop" | "fall" | "txt";
  vy: number;
  s?: string;
}

export default function BubblePopGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [lvl, setLvl] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [shotsLeft, setShotsLeft] = useState(8);
  const [gameState, setGameState] = useState<"ready" | "play" | "win" | "gameover">("ready");
  const [muted, setMuted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Refs for high performance 60fps loop
  const modeRef = useRef<"ready" | "play" | "win" | "gameover">("ready");
  const lvlRef = useRef(1);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const shotsRef = useRef(0);
  const dropEveryRef = useRef(8);
  const streakRef = useRef(0);
  const ncolRef = useRef(4);
  const curRef = useRef(0);
  const nxtRef = useRef(0);
  const projRef = useRef<Projectile | null>(null);
  const aimRef = useRef(-Math.PI / 2);
  const aimingRef = useRef(false);
  const fxRef = useRef<Particle[]>([]);
  const gridRef = useRef<number[][]>([]);
  const shiftRef = useRef(0);
  const maxRowsRef = useRef(14);
  const deadYRef = useRef(400);
  const shootYRef = useRef(460);
  const RRef = useRef(18);
  const mutedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const tone = useCallback((f: number, d: number, v = 0.07) => {
    if (mutedRef.current) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator();
      const gn = ctx.createGain();
      const t = ctx.currentTime;
      o.type = "triangle";
      o.frequency.value = f;
      o.connect(gn);
      gn.connect(ctx.destination);
      gn.gain.setValueAtTime(v, t);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.start(t);
      o.stop(t + d);
    } catch {}
  }, []);

  useEffect(() => {
    modeRef.current = gameState;
  }, [gameState]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    try {
      const b = Number(localStorage.getItem("bp_best") || 0);
      setBestScore(b);
      bestRef.current = b;
    } catch {}

    // Initial preview grid setup
    const rows = 5;
    const g: number[][] = [];
    for (let r = 0; r < 14 + 3; r++) {
      g.push(Array(NC).fill(-1));
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < NC; c++) {
        g[r][c] = Math.floor(Math.random() * 4);
      }
    }
    gridRef.current = g;
    curRef.current = Math.floor(Math.random() * 4);
    nxtRef.current = Math.floor(Math.random() * 4);
  }, []);

  const saveBest = (sc: number) => {
    if (sc > bestRef.current) {
      bestRef.current = sc;
      setBestScore(sc);
      try {
        localStorage.setItem("bp_best", String(sc));
      } catch {}
    }
  };

  const px = (r: number, c: number) => {
    const R = RRef.current;
    return R + c * 2 * R + ((r + shiftRef.current) & 1 ? R : 0);
  };

  const py = (r: number) => {
    const R = RRef.current;
    return TOP + R + r * R * SQ;
  };

  const present = () => {
    const s = new Set<number>();
    for (const row of gridRef.current) {
      for (const v of row) {
        if (v >= 0 && v < 6) s.add(v);
      }
    }
    return Array.from(s);
  };

  const pick = () => {
    const q = Math.random();
    if (lvlRef.current > 1 && modeRef.current === "play" && q < 0.06) return 10; // Bomb
    if (lvlRef.current > 1 && modeRef.current === "play" && q < 0.12) return 11; // Rainbow
    const p = present();
    return p.length ? p[Math.floor(Math.random() * p.length)] : Math.floor(Math.random() * ncolRef.current);
  };

  const setupGame = (isNewGame = false) => {
    if (isNewGame) {
      lvlRef.current = 1;
      setLvl(1);
      scoreRef.current = 0;
      setScore(0);
    }

    const curLvl = lvlRef.current;
    ncolRef.current = Math.min(3 + curLvl, 6);
    const dropEv = Math.max(3, 8 - Math.floor((curLvl - 1) / 2));
    dropEveryRef.current = dropEv;
    setShotsLeft(dropEv);

    const rows = Math.min(4 + curLvl, 9);
    const g: number[][] = [];
    shiftRef.current = 0;

    for (let r = 0; r < maxRowsRef.current + 3; r++) {
      g.push(Array(NC).fill(-1));
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < NC; c++) {
        g[r][c] = Math.floor(Math.random() * ncolRef.current);
      }
    }
    gridRef.current = g;

    shotsRef.current = 0;
    streakRef.current = 0;
    projRef.current = null;
    fxRef.current = [];
    curRef.current = pick();
    nxtRef.current = pick();

    setGameState("play");
    modeRef.current = "play";
  };

  const nb = (r: number, c: number) => {
    const s = (r + shiftRef.current) & 1;
    const o: [number, number][] = [
      [r, c - 1],
      [r, c + 1],
    ];
    const cc = s ? [c, c + 1] : [c - 1, c];
    for (const dr of [-1, 1]) {
      for (const x of cc) o.push([r + dr, x]);
    }
    return o.filter(([a, b]) => a >= 0 && a < gridRef.current.length && b >= 0 && b < NC);
  };

  const hit = (x: number, y: number) => {
    const R = RRef.current;
    const ra = Math.floor((y - TOP) / (R * SQ));
    const grid = gridRef.current;
    for (let r = Math.max(0, ra - 2); r <= Math.min(grid.length - 1, ra + 2); r++) {
      for (let c = 0; c < NC; c++) {
        if (grid[r][c] >= 0 && Math.hypot(px(r, c) - x, py(r) - y) < 1.8 * R) {
          return true;
        }
      }
    }
    return false;
  };

  const pop = (r: number, c: number, type: "pop" | "fall") => {
    fxRef.current.push({
      x: px(r, c),
      y: py(r),
      c: gridRef.current[r][c],
      t: 0,
      type,
      vy: 0,
    });
    gridRef.current[r][c] = -1;
  };

  const addRow = () => {
    const row = Array.from({ length: NC }, () => Math.floor(Math.random() * ncolRef.current));
    gridRef.current.unshift(row);
    gridRef.current.pop();
    shiftRef.current ^= 1;
  };

  const resolve = (r: number, c: number, force?: number) => {
    const R = RRef.current;
    const grid = gridRef.current;
    const col = grid[r][c];
    const seen = new Set([`${r},${c}`]);
    const st: [number, number][] = [[r, c]];
    const grp: [number, number][] = [];

    while (st.length) {
      const [a, b] = st.pop()!;
      grp.push([a, b]);
      for (const [x, y] of nb(a, b)) {
        if (grid[x][y] === col && !seen.has(`${x},${y}`)) {
          seen.add(`${x},${y}`);
          st.push([x, y]);
        }
      }
    }

    let popped = false;
    if (force === 1) {
      // Bomb explosion radius
      grp.length = 0;
      const bx = px(r, c);
      const by = py(r);
      for (let a = 0; a < grid.length; a++) {
        for (let b = 0; b < NC; b++) {
          if (grid[a][b] >= 0 && Math.hypot(px(a, b) - bx, py(a) - by) < 3.7 * R) {
            grp.push([a, b]);
          }
        }
      }
    }

    if (grp.length >= 3 || force === 1) {
      popped = true;
      streakRef.current++;
      const gain = Math.round(grp.length * 10 * (1 + (streakRef.current - 1) * 0.5));
      scoreRef.current += gain;
      setScore(scoreRef.current);

      fxRef.current.push({
        x: px(r, c),
        y: py(r),
        type: "txt",
        t: 0,
        s: `+${gain}${streakRef.current > 1 ? ` x${streakRef.current}` : ""}`,
        vy: 0,
      });

      grp.forEach(([a, b]) => pop(a, b, "pop"));

      // Find floating disconnected bubbles
      const att = new Set<string>();
      const q: [number, number][] = [];
      for (let k = 0; k < NC; k++) {
        if (grid[0][k] >= 0) {
          att.add(`0,${k}`);
          q.push([0, k]);
        }
      }

      while (q.length) {
        const [a, b] = q.pop()!;
        for (const [x, y] of nb(a, b)) {
          if (grid[x][y] >= 0 && !att.has(`${x},${y}`)) {
            att.add(`${x},${y}`);
            q.push([x, y]);
          }
        }
      }

      let n = 0;
      for (let a = 0; a < grid.length; a++) {
        for (let b = 0; b < NC; b++) {
          if (grid[a][b] >= 0 && !att.has(`${a},${b}`)) {
            pop(a, b, "fall");
            n++;
          }
        }
      }

      scoreRef.current += n * 20;
      setScore(scoreRef.current);
      tone(500 + Math.min(grp.length, 8) * 40, 0.12);
    } else {
      streakRef.current = 0;
      tone(240, 0.06, 0.05);
    }

    if (popped) {
      shotsRef.current = 0;
      setShotsLeft(dropEveryRef.current);
    } else if (shotsRef.current >= dropEveryRef.current) {
      shotsRef.current = 0;
      setShotsLeft(dropEveryRef.current);
      addRow();
    } else {
      setShotsLeft(dropEveryRef.current - shotsRef.current);
    }

    saveBest(scoreRef.current);

    // Check Win/Loss
    if (!present().length) {
      setGameState("win");
      modeRef.current = "win";
      tone(660, 0.25);
    } else if (grid.some((row, i) => i >= maxRowsRef.current && row.some((v) => v >= 0))) {
      setGameState("gameover");
      modeRef.current = "gameover";
      setFinalScore(scoreRef.current);
      setShowSubmitModal(true);
      tone(150, 0.4, 0.09);
    }

    if (modeRef.current === "play") {
      if (curRef.current < 6 && !present().includes(curRef.current)) curRef.current = pick();
      if (nxtRef.current < 6 && !present().includes(nxtRef.current)) nxtRef.current = pick();
    }
  };

  const snap = (p: Projectile) => {
    const R = RRef.current;
    const ra = Math.floor((p.y - TOP) / (R * SQ));
    let br = 0;
    let bc = 0;
    let bd = 1e9;
    const grid = gridRef.current;

    for (let r = Math.max(0, ra - 2); r <= Math.min(grid.length - 1, ra + 2); r++) {
      for (let c = 0; c < NC; c++) {
        if (grid[r][c] >= 0) continue;
        const d = Math.hypot(px(r, c) - p.x, py(r) - p.y);
        if (d < bd) {
          bd = d;
          br = r;
          bc = c;
        }
      }
    }

    projRef.current = null;

    if (p.c === 10) {
      // Bomb
      grid[br][bc] = 10;
      resolve(br, bc, 1);
      return;
    }

    if (p.c === 11) {
      // Rainbow
      const cnt: Record<number, number> = {};
      for (const [a, b] of nb(br, bc)) {
        const v = grid[a][b];
        if (v >= 0 && v < 6) cnt[v] = (cnt[v] || 0) + 1;
      }
      const ks = Object.keys(cnt);
      p.c = ks.length ? +ks.sort((x, y) => cnt[+y] - cnt[+x])[0] : pick();
    }

    grid[br][bc] = p.c;
    resolve(br, bc);
  };

  const swapBubbles = () => {
    const temp = curRef.current;
    curRef.current = nxtRef.current;
    nxtRef.current = temp;
    tone(400, 0.06);
  };

  const setAim = (x: number, y: number, W: number) => {
    let a = Math.atan2(y - shootYRef.current, x - W / 2);
    if (a > -0.15 || a < -Math.PI + 0.15) {
      a = x < W / 2 ? -Math.PI + 0.15 : -0.15;
    }
    aimRef.current = a;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (modeRef.current !== "play" || showSubmitModal) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const W = cv.clientWidth;
    const R = RRef.current;
    const shootY = shootYRef.current;

    // Check swap bubble tap
    if (
      Math.hypot(x - W / 2, y - shootY) < R * 1.7 ||
      Math.hypot(x - (W / 2 - R * 3.4), y - (shootY + R * 0.4)) < R * 1.9
    ) {
      swapBubbles();
      return;
    }

    aimingRef.current = true;
    setAim(x, y, W);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!aimingRef.current) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    setAim(e.clientX - r.left, e.clientY - r.top, cv.clientWidth);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!aimingRef.current) return;
    aimingRef.current = false;
    if (modeRef.current !== "play" || projRef.current) return;

    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const W = cv.clientWidth;
    const R = RRef.current;
    const shootY = shootYRef.current;

    if (Math.hypot(x - W / 2, y - shootY) < R * 1.6) {
      swapBubbles();
      return;
    }

    setAim(x, y, W);
    const sp = W * 2.4;
    const aim = aimRef.current;
    projRef.current = {
      x: W / 2 + Math.cos(aim) * R * 1.55,
      y: shootY + Math.sin(aim) * R * 1.55,
      vx: Math.cos(aim) * sp,
      vy: Math.sin(aim) * sp,
      c: curRef.current,
    };

    curRef.current = nxtRef.current;
    nxtRef.current = pick();
    shotsRef.current++;
    setShotsLeft(Math.max(0, dropEveryRef.current - shotsRef.current));
  };

  // Main Canvas Rendering Loop
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;

    let animId = 0;
    let last = performance.now();

    const resize = () => {
      if (!cv) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);

      const R = W / (2 * NC + 1);
      RRef.current = R;
      deadYRef.current = H - R * 3.6;
      shootYRef.current = H - R * 1.7;
      maxRowsRef.current = Math.floor((deadYRef.current - TOP - 2 * R) / (R * SQ)) + 1;
    };

    resize();
    window.addEventListener("resize", resize);

    const ball = (x: number, y: number, r: number, c: number) => {
      const o = Math.max(2.5, r * 0.16);
      g.lineJoin = "round";

      if (c === 11) {
        // Rainbow
        for (let i = 0; i < 6; i++) {
          g.fillStyle = COLS[i];
          g.beginPath();
          g.moveTo(x, y);
          g.arc(x, y, r - o / 2, (i * Math.PI) / 3, ((i + 1) * Math.PI) / 3);
          g.closePath();
          g.fill();
        }
      } else if (c === 10) {
        // Bomb
        g.fillStyle = "#333333";
        g.beginPath();
        g.arc(x, y, r - o / 2, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#ffd166";
        g.beginPath();
        g.arc(x + r * 0.38, y - r * 0.6, r * 0.22, 0, Math.PI * 2);
        g.fill();
      } else {
        g.fillStyle = COLS[c] || "#999";
        g.beginPath();
        g.arc(x, y, r - o / 2, 0, Math.PI * 2);
        g.fill();
      }

      g.strokeStyle = "#14213d";
      g.lineWidth = o;
      g.beginPath();
      g.arc(x, y, r - o / 2, 0, Math.PI * 2);
      g.stroke();

      if (c !== 10) {
        g.fillStyle = "rgba(255,255,255,0.85)";
        g.beginPath();
        g.ellipse(x - r * 0.32, y - r * 0.34, r * 0.2, r * 0.12, -0.7, 0, Math.PI * 2);
        g.fill();
      }
    };

    const draw = () => {
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      const deadY = deadYRef.current;
      const shootY = shootYRef.current;
      const R = RRef.current;
      const aim = aimRef.current;

      g.clearRect(0, 0, W, H);
      g.fillStyle = "#bfe9ff";
      g.fillRect(0, 0, W, deadY);
      g.fillStyle = "#ffe29a";
      g.fillRect(0, deadY, W, H - deadY);

      // Danger line
      g.strokeStyle = "#14213d";
      g.globalAlpha = 0.25;
      g.setLineDash([6, 6]);
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(0, deadY);
      g.lineTo(W, deadY);
      g.stroke();
      g.setLineDash([]);
      g.globalAlpha = 1;

      // Board grid bubbles
      const grid = gridRef.current;
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < NC; c++) {
          if (grid[r][c] >= 0) {
            ball(px(r, c), py(r), R * 0.94, grid[r][c]);
          }
        }
      }

      if (modeRef.current === "play") {
        // Aim Trajectory Line with Wall Bounce
        let x = W / 2 + Math.cos(aim) * R * 1.55;
        let y = shootY + Math.sin(aim) * R * 1.55;
        let vx = Math.cos(aim);
        let vy = Math.sin(aim);
        let n = 0;

        g.fillStyle = "#14213d";
        g.globalAlpha = 0.35;
        for (let i = 0; i < 300; i++) {
          x += vx * R * 0.5;
          y += vy * R * 0.5;
          if (x < R || x > W - R) {
            vx = -vx;
            x = Math.max(R, Math.min(W - R, x));
          }
          if (y <= TOP + R || hit(x, y)) break;
          if (i % 3 === 2 && n++ < 40) {
            g.beginPath();
            g.arc(x, y, 2.2, 0, Math.PI * 2);
            g.fill();
          }
        }
        g.globalAlpha = 1;
      }

      // Shooter Cannon Base
      g.fillStyle = "#14213d";
        for (const s of [-1, 1]) {
          g.beginPath();
          g.arc(W / 2 + s * R * 1.6, shootY + R * 0.7, R * 0.8, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#ff8c42";
          g.beginPath();
          g.arc(W / 2 + s * R * 1.6, shootY + R * 0.7, R * 0.55, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#ffc300";
          g.beginPath();
          g.arc(W / 2 + s * R * 1.6, shootY + R * 0.7, R * 0.2, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#14213d";
        }

        // Cannon barrel
        g.save();
        g.translate(W / 2, shootY);
        g.rotate(aim + Math.PI / 2);
        g.lineJoin = "round";
        g.lineWidth = 4;
        g.strokeStyle = "#14213d";
        g.fillStyle = "#8fa3b8";
        g.beginPath();
        g.moveTo(-R * 0.95, 0);
        g.lineTo(-R * 1.1, -R * 2.1);
        g.lineTo(R * 1.1, -R * 2.1);
        g.lineTo(R * 0.95, 0);
        g.closePath();
        g.fill();
        g.stroke();
        g.fillStyle = "#5f6f80";
        g.beginPath();
        g.rect(-R * 1.3, -R * 2.45, R * 2.6, R * 0.45);
        g.fill();
        g.stroke();
        g.fillStyle = "rgba(255,255,255,0.35)";
        g.fillRect(-R * 0.7, -R * 1.9, R * 0.2, R * 1.6);
        g.restore();

        // Cannon Center ring
        g.strokeStyle = "#14213d";
        g.lineWidth = 4;
        g.fillStyle = "#ffc300";
        g.beginPath();
        g.arc(W / 2, shootY, R * 1.25, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.fillStyle = "#14213d";
        g.beginPath();
        g.arc(W / 2, shootY, R * 0.35, 0, Math.PI * 2);
        g.fill();

        // Current loaded bubble
        ball(W / 2 + Math.cos(aim) * R * 1.55, shootY + Math.sin(aim) * R * 1.55, R * 0.94, curRef.current);

        // Next bubble preview / swap pod
        g.strokeStyle = "#14213d";
        g.lineWidth = 3;
        g.setLineDash([5, 5]);
        g.beginPath();
        g.arc(W / 2 - R * 3.4, shootY + R * 0.4, R * 1.05, 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = "#14213d";
        g.font = "900 20px system-ui";
        g.textAlign = "center";
        g.fillText("⇄", W / 2 - R * 1.75, shootY + R * 0.95);
        ball(W / 2 - R * 3.4, shootY + R * 0.4, R * 0.8, nxtRef.current);

        g.fillStyle = "#14213d";
        g.globalAlpha = 0.6;
        g.font = "11px system-ui, sans-serif";
        g.textAlign = "center";
        g.fillText("tap to swap", W / 2 - R * 3.4, shootY - R * 0.8);
        g.globalAlpha = 1;

      // Flying projectile
      if (projRef.current) {
        ball(projRef.current.x, projRef.current.y, R * 0.94, projRef.current.c);
      }

      // Floating / Popping particles
      for (const f of fxRef.current) {
        if (f.type === "pop") {
          const s = 1 + f.t * 1.2;
          g.globalAlpha = Math.max(0, 1 - f.t * 2.2);
          ball(f.x, f.y, R * 0.94 * s, f.c || 0);
          for (let i = 0; i < 6; i++) {
            const an = i * 1.047;
            const dd = f.t * R * 5;
            g.fillStyle = COLS[f.c || 0] || "#222";
            g.beginPath();
            g.arc(f.x + Math.cos(an) * dd, f.y + Math.sin(an) * dd, Math.max(0, R * 0.18 * (1 - f.t * 2)), 0, Math.PI * 2);
            g.fill();
          }
          g.globalAlpha = 1;
        } else if (f.type === "txt") {
          g.globalAlpha = Math.max(0, 1 - f.t * 1.1);
          g.fillStyle = "#14213d";
          g.font = "900 16px system-ui";
          g.textAlign = "center";
          g.fillText(f.s || "", f.x, f.y - f.t * 40);
          g.globalAlpha = 1;
        } else if (f.type === "fall") {
          ball(f.x, f.y, R * 0.94, f.c || 0);
        }
      }
    };

    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000 || 0, 0.04);
      last = t;
      const W = cv.clientWidth;
      const H = cv.clientHeight;
      const R = RRef.current;

      if (projRef.current) {
        const p = projRef.current;
        for (let i = 0; i < 4 && projRef.current; i++) {
          p.x += (p.vx * dt) / 4;
          p.y += (p.vy * dt) / 4;
          if (p.x < R) {
            p.x = R;
            p.vx = -p.vx;
          }
          if (p.x > W - R) {
            p.x = W - R;
            p.vx = -p.vx;
          }
          if (p.y <= TOP + R || hit(p.x, p.y)) {
            snap(p);
          }
        }
      }

      for (const f of fxRef.current) {
        f.t += dt;
        if (f.type === "fall") {
          f.vy += H * 2.2 * dt;
          f.y += f.vy * dt;
        }
      }

      fxRef.current = fxRef.current.filter((f) =>
        f.type === "pop" ? f.t < 0.45 : f.type === "txt" ? f.t < 0.9 : f.y < H + R * 2
      );

      draw();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full max-w-lg mx-auto flex flex-col items-center select-none font-sans rounded-3xl p-4 bg-[#fff4d6] border-4 border-[#14213d] shadow-2xl"
      >
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between px-2 mb-2 font-black text-slate-900">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#ffc300] border-2 border-[#14213d] rounded-xl text-xs sm:text-sm font-black shadow-sm">
              Level {lvl}
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#14213d]/70">
              Drop in: <strong className="text-[#14213d]">{shotsLeft}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs sm:text-sm font-black">
              Score: <span className="text-rose-600 font-black">{score}</span>
            </div>
            <button
              type="button"
              onClick={() => setMuted(!muted)}
              className="p-1.5 rounded-xl border-2 border-[#14213d] bg-white hover:bg-slate-100 transition-colors"
              title="Toggle Sound"
            >
              {muted ? <VolumeX className="w-4 h-4 text-slate-700" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Canvas Game Area */}
        <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] max-h-[580px] rounded-2xl overflow-hidden border-3 border-[#14213d]">
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-full block cursor-crosshair touch-none"
          />

          {/* Overlays */}
          {gameState === "ready" && (
            <div className="absolute inset-0 bg-[#fff4d6]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-[#14213d] z-20">
              <h2 className="text-4xl sm:text-5xl font-black mb-2 text-[#14213d] drop-shadow-sm">Bubble Pop</h2>
              <p className="text-xs sm:text-sm font-bold max-w-xs mb-6 text-[#14213d]/80 leading-relaxed">
                Drag to aim, release to shoot. Match 3 or more colors to pop bubbles. Bomb & Rainbow bubbles appear from
                level 2!
              </p>
              <button
                type="button"
                onClick={() => setupGame(true)}
                className="px-8 py-3 bg-[#ffc300] hover:bg-[#ffb700] text-[#14213d] font-black rounded-2xl text-lg border-4 border-[#14213d] shadow-[0_5px_0_#14213d] active:translate-y-1 active:shadow-[0_1px_0_#14213d] transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-[#14213d]" /> Play Game
              </button>
            </div>
          )}

          {gameState === "win" && (
            <div className="absolute inset-0 bg-[#fff4d6]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-[#14213d] z-20 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-3xl sm:text-4xl font-black mb-1 text-emerald-600">Level Cleared! 🎉</h3>
              <p className="text-sm font-bold mb-6 text-[#14213d]/80">Current Score: {score}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    lvlRef.current += 1;
                    setLvl(lvlRef.current);
                    setupGame(false);
                  }}
                  className="px-6 py-2.5 bg-[#2ec27e] hover:bg-[#28af71] text-white font-black rounded-xl text-base border-3 border-[#14213d] shadow-[0_4px_0_#14213d] active:translate-y-1 active:shadow-none transition-all"
                >
                  Next Level
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFinalScore(scoreRef.current);
                    setShowSubmitModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#ffc300] hover:bg-[#ffb700] text-[#14213d] font-black rounded-xl text-base border-3 border-[#14213d] shadow-[0_4px_0_#14213d] active:translate-y-1 active:shadow-none transition-all flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4 text-[#14213d]" /> Save Score
                </button>
              </div>
            </div>
          )}

          {gameState === "gameover" && (
            <div className="absolute inset-0 bg-[#14213d]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white z-20 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-3xl sm:text-4xl font-black mb-1 text-rose-400">Game Over!</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-300 mb-6">
                Bubbles crossed the danger line. Final Score: {score}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setupGame(true)}
                  className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-base border-3 border-white shadow-lg active:scale-95 transition-all"
                >
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFinalScore(scoreRef.current);
                    setShowSubmitModal(true);
                  }}
                  className="px-5 py-2.5 bg-[#ffc300] hover:bg-[#ffb700] text-[#14213d] font-black rounded-xl text-base border-3 border-white shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4 text-[#14213d]" /> Save Score
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Help Footer */}
        <div className="w-full flex items-center justify-between text-[11px] font-bold text-[#14213d]/60 mt-3 px-2">
          <span>🎯 Drag to aim & bounce off walls</span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#14213d]" onClick={swapBubbles}>
            <ArrowUpDown className="w-3.5 h-3.5" /> Tap bubble to swap
          </span>
        </div>
      </div>

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={finalScore || score}
        gameId="bubblepop"
        onClose={() => setShowSubmitModal(false)}
      />
    </>
  );
}
