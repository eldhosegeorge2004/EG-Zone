/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const COLS = 11;
const BUBBLE_R = 22;
const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ec4899"];

type Bubble = { color: string; row: number; col: number } | null;
type ShootingBubble = { x: number; y: number; vx: number; vy: number; color: string };

function hexToXY(row: number, col: number, offsetX: number, offsetY: number) {
  const isOdd = row % 2 === 1;
  const x = offsetX + col * (BUBBLE_R * 2) + (isOdd ? BUBBLE_R : 0) + BUBBLE_R;
  const y = offsetY + row * (BUBBLE_R * 1.72) + BUBBLE_R;
  return { x, y };
}

export default function BubbleShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "win" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);

  const CANVAS_W = 480;
  const CANVAS_H = 640;
  const GRID_OFFSET_X = 4;
  const GRID_OFFSET_Y = 20;
  const SHOOTER_Y = CANVAS_H - 60;
  const SHOOTER_X = CANVAS_W / 2;

  const state = useRef({
    playing: false,
    dead: false,
    won: false,
    grid: [] as (Bubble)[],
    rows: 8,
    activeCols: COLS,
    shooter: { x: SHOOTER_X, angle: -Math.PI / 2 },
    currentBubble: COLORS[0],
    nextBubble: COLORS[1],
    shootingBubble: null as ShootingBubble | null,
    score: 0,
    level: 1,
    aimX: SHOOTER_X,
    aimY: 0,
    bubblesDrop: 0, // how many times bubble reached bottom without popping enough
  });

  const audioCtx = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: "shoot" | "pop" | "drop" | "win" | "lose") => {
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext();
      const ctx = audioCtx.current;
      ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === "shoot") {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "pop") {
        osc.type = "sine";
        for (let i = 0; i < 3; i++) {
          const o2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.frequency.setValueAtTime(800 + i * 200, ctx.currentTime + i * 0.04);
          g2.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.04);
          g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 0.1);
          o2.start(ctx.currentTime + i * 0.04);
          o2.stop(ctx.currentTime + i * 0.04 + 0.1);
        }
        osc.start = () => {};
      } else if (type === "drop") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "win") {
        const notes = [523, 659, 784, 1047];
        for (let i = 0; i < notes.length; i++) {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.setValueAtTime(notes[i], ctx.currentTime + i * 0.1);
          g.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
          o.start(ctx.currentTime + i * 0.1);
          o.stop(ctx.currentTime + i * 0.1 + 0.2);
        }
        osc.start = () => {};
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      }
      if (osc.start !== (() => {})) { try { osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2); } catch {} }
    } catch {}
  }, []);

  const randomColor = useCallback(() => COLORS[Math.floor(Math.random() * COLORS.length)], []);

  const makeGrid = useCallback((rows: number) => {
    const grid: Bubble[] = [];
    for (let r = 0; r < rows; r++) {
      const cols = r % 2 === 0 ? COLS : COLS - 1;
      for (let c = 0; c < cols; c++) {
        grid.push({ color: COLORS[Math.floor(Math.random() * Math.min(4 + Math.floor(state.current.level / 3), COLORS.length))], row: r, col: c });
      }
    }
    return grid;
  }, []);

  const startGame = useCallback((lvl = 1) => {
    const s = state.current;
    s.level = lvl;
    s.grid = makeGrid(6 + Math.min(lvl, 4));
    s.currentBubble = randomColor();
    s.nextBubble = randomColor();
    s.shootingBubble = null;
    s.score = lvl === 1 ? 0 : s.score;
    s.playing = true;
    s.dead = false;
    s.won = false;
    s.bubblesDrop = 0;
    setGameState("playing");
    setLevel(lvl);
    if (lvl === 1) setScore(0);
  }, [makeGrid, randomColor]);

  const getGridIndex = useCallback((row: number, col: number) => {
    // Find bubble at this row/col
    const s = state.current;
    return s.grid.findIndex(b => b && b.row === row && b.col === col);
  }, []);

  const findCluster = useCallback((startRow: number, startCol: number, color: string) => {
    const s = state.current;
    const visited = new Set<string>();
    const cluster: { row: number; col: number }[] = [];
    const stack = [{ row: startRow, col: startCol }];

    while (stack.length > 0) {
      const { row, col } = stack.pop()!;
      const key = `${row},${col}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const idx = getGridIndex(row, col);
      if (idx === -1 || !s.grid[idx] || s.grid[idx]!.color !== color) continue;

      cluster.push({ row, col });

      // Neighbors
      const neighbors = getNeighbors(row, col);
      for (const n of neighbors) stack.push(n);
    }
    return cluster;
  }, [getGridIndex]);

  const getNeighbors = (row: number, col: number) => {
    const isOdd = row % 2 === 1;
    return [
      { row: row - 1, col: col },
      { row: row - 1, col: col + (isOdd ? 1 : -1) },
      { row: row + 1, col: col },
      { row: row + 1, col: col + (isOdd ? 1 : -1) },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];
  };

  const findFloating = useCallback(() => {
    const s = state.current;
    // BFS from row 0 bubbles
    const connected = new Set<string>();
    const queue: { row: number; col: number }[] = [];

    for (const b of s.grid) {
      if (b && b.row === 0) {
        const key = `${b.row},${b.col}`;
        if (!connected.has(key)) {
          connected.add(key);
          queue.push({ row: b.row, col: b.col });
        }
      }
    }

    while (queue.length > 0) {
      const { row, col } = queue.shift()!;
      const neighbors = getNeighbors(row, col);
      for (const n of neighbors) {
        const key = `${n.row},${n.col}`;
        if (!connected.has(key) && getGridIndex(n.row, n.col) !== -1) {
          connected.add(key);
          queue.push(n);
        }
      }
    }

    return s.grid.filter(b => b && !connected.has(`${b.row},${b.col}`)) as NonNullable<Bubble>[];
  }, [getGridIndex]);

  const snapBubble = useCallback((x: number, y: number, color: string) => {
    const s = state.current;
    // Find the best grid cell
    let bestRow = -1, bestCol = -1, bestDist = Infinity;

    const totalRows = 20;
    for (let r = 0; r < totalRows; r++) {
      const cols = r % 2 === 0 ? COLS : COLS - 1;
      for (let c = 0; c < cols; c++) {
        // Check if occupied
        const idx = getGridIndex(r, c);
        if (idx !== -1) continue;
        const { x: gx, y: gy } = hexToXY(r, c, GRID_OFFSET_X, GRID_OFFSET_Y);
        const dist = Math.hypot(x - gx, y - gy);
        if (dist < bestDist && dist < BUBBLE_R * 2.5) {
          // Check adjacent to existing bubble or row 0
          if (r === 0 || getNeighbors(r, c).some(n => getGridIndex(n.row, n.col) !== -1)) {
            bestDist = dist;
            bestRow = r;
            bestCol = c;
          }
        }
      }
    }

    if (bestRow === -1) {
      // Fallback: nearest occupied bubble's neighbor
      for (const b of s.grid) {
        if (!b) continue;
        const neighbors = getNeighbors(b.row, b.col);
        for (const n of neighbors) {
          if (n.row < 0) continue;
          const idx = getGridIndex(n.row, n.col);
          if (idx !== -1) continue;
          const { x: gx, y: gy } = hexToXY(n.row, n.col, GRID_OFFSET_X, GRID_OFFSET_Y);
          const dist = Math.hypot(x - gx, y - gy);
          if (dist < bestDist) {
            bestDist = dist;
            bestRow = n.row;
            bestCol = n.col;
          }
        }
      }
    }

    if (bestRow === -1) return;

    s.grid.push({ color, row: bestRow, col: bestCol });

    // Find cluster
    const cluster = findCluster(bestRow, bestCol, color);
    if (cluster.length >= 3) {
      // Remove cluster
      for (const { row, col } of cluster) {
        const idx = getGridIndex(row, col);
        if (idx !== -1) s.grid.splice(idx, 1);
      }
      playSound("pop");
      s.score += cluster.length * 10;
      setScore(s.score);

      // Remove floating
      const floating = findFloating();
      for (const fb of floating) {
        const fidx = getGridIndex(fb.row, fb.col);
        if (fidx !== -1) s.grid.splice(fidx, 1);
      }
      if (floating.length > 0) {
        s.score += floating.length * 5;
        setScore(s.score);
        playSound("drop");
      }
    }

    // Check win
    if (s.grid.length === 0) {
      s.won = true;
      s.playing = false;
      playSound("win");
      const hs = parseInt(localStorage.getItem("bubbles_highscore") || "0");
      if (s.score > hs) {
        localStorage.setItem("bubbles_highscore", String(s.score));
        setHighScore(s.score);
      }
      setGameState("win");
      return;
    }

    // Check lose: any bubble too far down
    const dangerRow = 14;
    if (s.grid.some(b => b && b.row >= dangerRow)) {
      s.dead = true;
      s.playing = false;
      playSound("lose");
      const hs = parseInt(localStorage.getItem("bubbles_highscore") || "0");
      if (s.score > hs) {
        localStorage.setItem("bubbles_highscore", String(s.score));
        setHighScore(s.score);
      }
      setGameState("dead");
      return;
    }

    // Advance shooter
    s.currentBubble = s.nextBubble;
    s.nextBubble = randomColor();
    s.shootingBubble = null;
  }, [findCluster, findFloating, getGridIndex, playSound, randomColor]);

  const shoot = useCallback((targetX: number, targetY: number) => {
    const s = state.current;
    if (!s.playing || s.dead || s.won || s.shootingBubble) return;

    const dx = targetX - SHOOTER_X;
    const dy = targetY - SHOOTER_Y;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;

    const speed = 12;
    s.shootingBubble = {
      x: SHOOTER_X,
      y: SHOOTER_Y,
      vx: (dx / len) * speed,
      vy: (dy / len) * speed,
      color: s.currentBubble,
    };
    playSound("shoot");
  }, [playSound]);

  const drawBubble = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.arc(x + 2, y + 3, r, 0, Math.PI * 2);
    ctx.fill();
    // Main circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // Shine
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.35, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    // Outline
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = state.current;

    const loop = () => {
      // Update shooting bubble
      if (s.playing && !s.dead && !s.won && s.shootingBubble) {
        const sb = s.shootingBubble;
        sb.x += sb.vx;
        sb.y += sb.vy;

        // Wall bounce
        if (sb.x - BUBBLE_R < 0) { sb.x = BUBBLE_R; sb.vx = Math.abs(sb.vx); }
        if (sb.x + BUBBLE_R > CANVAS_W) { sb.x = CANVAS_W - BUBBLE_R; sb.vx = -Math.abs(sb.vx); }

        // Top boundary or hit existing bubble
        let hit = sb.y - BUBBLE_R <= GRID_OFFSET_Y;
        if (!hit) {
          for (const b of s.grid) {
            if (!b) continue;
            const { x: gx, y: gy } = hexToXY(b.row, b.col, GRID_OFFSET_X, GRID_OFFSET_Y);
            if (Math.hypot(sb.x - gx, sb.y - gy) < BUBBLE_R * 1.9) {
              hit = true;
              break;
            }
          }
        }

        if (hit) {
          snapBubble(sb.x, sb.y, sb.color);
        }
      }

      // Draw background
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      grad.addColorStop(0, "#1a0533");
      grad.addColorStop(1, "#0a0515");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Draw grid bubbles
      for (const b of s.grid) {
        if (!b) continue;
        const { x, y } = hexToXY(b.row, b.col, GRID_OFFSET_X, GRID_OFFSET_Y);
        if (y < 0 || y > CANVAS_H) continue;
        drawBubble(ctx, x, y, BUBBLE_R - 1, b.color);
      }

      // Draw shooting bubble
      if (s.shootingBubble) {
        drawBubble(ctx, s.shootingBubble.x, s.shootingBubble.y, BUBBLE_R - 1, s.shootingBubble.color);
      }

      // Draw aim line
      if (s.playing && !s.dead && !s.won && !s.shootingBubble) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 8]);
        const dx = s.aimX - SHOOTER_X;
        const dy = s.aimY - SHOOTER_Y;
        const len = Math.hypot(dx, dy);
        if (len > 0) {
          const dirX = dx / len, dirY = dy / len;
          let ax = SHOOTER_X, ay = SHOOTER_Y;
          for (let step = 0; step < 8; step++) {
            const nextX = ax + dirX * 40;
            const nextY = ay + dirY * 40;
            if (nextX < BUBBLE_R) { break; }
            if (nextX > CANVAS_W - BUBBLE_R) { break; }
            if (nextY < 0) break;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(nextX, nextY);
            ctx.stroke();
            ax = nextX; ay = nextY;
          }
        }
        ctx.restore();
      }

      // HUD
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, CANVAS_H - 110, CANVAS_W, 110);

      // Danger zone line
      const dangerY = hexToXY(13, 0, GRID_OFFSET_X, GRID_OFFSET_Y).y + BUBBLE_R;
      ctx.strokeStyle = "rgba(255,60,60,0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, dangerY);
      ctx.lineTo(CANVAS_W, dangerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current bubble in shooter
      drawBubble(ctx, SHOOTER_X, SHOOTER_Y, BUBBLE_R + 2, s.currentBubble);

      // Next bubble preview
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("NEXT", 24, CANVAS_H - 72);
      drawBubble(ctx, 46, CANVAS_H - 52, BUBBLE_R - 4, s.nextBubble);

      // Score & level
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`Score: ${s.score}`, CANVAS_W - 12, CANVAS_H - 72);
      ctx.fillStyle = "#c084fc";
      ctx.font = "14px sans-serif";
      ctx.fillText(`Level ${s.level}`, CANVAS_W - 12, CANVAS_H - 50);
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(`Best: ${Math.max(parseInt(localStorage.getItem("bubbles_highscore") || "0"), s.score)}`, CANVAS_W - 12, CANVAS_H - 28);

      // Idle / Win / Dead screens
      if (!s.playing && !s.dead && !s.won) {
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#e879f9";
        ctx.font = "bold 34px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("BUBBLE SHOOTER", CANVAS_W / 2, CANVAS_H / 2 - 30);
        ctx.fillStyle = "#e2e8f0";
        ctx.font = "16px sans-serif";
        ctx.fillText("Click or Tap to Aim & Shoot", CANVAS_W / 2, CANVAS_H / 2 + 20);
        ctx.fillStyle = "#a78bfa";
        ctx.font = "14px sans-serif";
        ctx.fillText("Match 3+ same-color bubbles to pop them!", CANVAS_W / 2, CANVAS_H / 2 + 50);
      }

      if (s.won) {
        ctx.fillStyle = "rgba(0,30,0,0.75)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("LEVEL CLEAR! 🎉", CANVAS_W / 2, CANVAS_H / 2 - 40);
        ctx.fillStyle = "#fff";
        ctx.font = "20px sans-serif";
        ctx.fillText(`Score: ${s.score}`, CANVAS_W / 2, CANVAS_H / 2 + 5);
        ctx.fillStyle = "#86efac";
        ctx.font = "15px sans-serif";
        ctx.fillText("Click to Next Level", CANVAS_W / 2, CANVAS_H / 2 + 50);
      }

      if (s.dead) {
        ctx.fillStyle = "rgba(30,0,0,0.75)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#f87171";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", CANVAS_W / 2, CANVAS_H / 2 - 40);
        ctx.fillStyle = "#fff";
        ctx.font = "20px sans-serif";
        ctx.fillText(`Score: ${s.score}`, CANVAS_W / 2, CANVAS_H / 2 + 5);
        ctx.fillStyle = "#fca5a5";
        ctx.font = "15px sans-serif";
        ctx.fillText("Click to Restart", CANVAS_W / 2, CANVAS_H / 2 + 50);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [drawBubble, snapBubble]);

  useEffect(() => {
    const hs = parseInt(localStorage.getItem("bubbles_highscore") || "0");
    setHighScore(hs);
  }, []);

  const getCanvasCoords = useCallback((e: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { x, y } = getCanvasCoords(e);
    state.current.aimX = x;
    state.current.aimY = y;
  }, [getCanvasCoords]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const s = state.current;
    const { x, y } = getCanvasCoords(e);
    if (!s.playing) {
      if (s.won) startGame(s.level + 1);
      else startGame(1);
      return;
    }
    shoot(x, y);
  }, [getCanvasCoords, shoot, startGame]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const s = state.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const x = (e.touches[0].clientX - rect.left) * scaleX;
    const y = (e.touches[0].clientY - rect.top) * scaleY;
    s.aimX = x;
    s.aimY = y;
    if (!s.playing) {
      if (s.won) startGame(s.level + 1);
      else startGame(1);
      return;
    }
    shoot(x, y);
  }, [shoot, startGame]);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      <div className="flex justify-between w-full max-w-sm px-2">
        <div className="text-pink-400 font-mono text-sm">Score: <span className="text-white font-bold">{score}</span></div>
        <div className="text-pink-400 font-mono text-sm">Level: <span className="text-purple-300 font-bold">{level}</span></div>
        <div className="text-pink-400 font-mono text-sm">Best: <span className="text-yellow-400 font-bold">{Math.max(highScore, score)}</span></div>
      </div>
      <div className="relative rounded-xl overflow-hidden border-2 border-pink-700 shadow-2xl shadow-pink-900/50">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block cursor-crosshair"
          style={{ maxHeight: "75vh", width: "auto" }}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
        />
      </div>
      <div className="text-slate-500 text-xs text-center">
        <span className="hidden sm:inline">Aim and Click to shoot · Match 3+ same-color bubbles</span>
        <span className="sm:hidden">Tap to aim and shoot bubbles!</span>
      </div>
    </div>
  );
}
