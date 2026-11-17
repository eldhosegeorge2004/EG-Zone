/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

type Difficulty = "3x3" | "4x4" | "5x5";

interface DifficultyConfig {
  size: number;
  label: string;
  shuffleMoves: number;
}

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  "3x3": { size: 3, label: "Easy (3×3)", shuffleMoves: 50 },
  "4x4": { size: 4, label: "Medium (4×4)", shuffleMoves: 200 },
  "5x5": { size: 5, label: "Hard (5×5)", shuffleMoves: 500 },
};

interface BestRecord {
  moves: number;
  time: number;
}

function isSolvable(tiles: number[], size: number): boolean {
  const arr = tiles.filter((t) => t !== 0);
  let inversions = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) inversions++;
    }
  }
  if (size % 2 === 1) return inversions % 2 === 0;
  const emptyRow = Math.floor(tiles.indexOf(0) / size);
  const rowFromBottom = size - emptyRow;
  if (rowFromBottom % 2 === 0) return inversions % 2 === 1;
  return inversions % 2 === 0;
}

function generateSolvableShuffle(size: number, moves: number): number[] {
  const total = size * size;
  let tiles = Array.from({ length: total }, (_, i) => (i === total - 1 ? 0 : i + 1));
  let emptyIdx = total - 1;
  for (let m = 0; m < moves; m++) {
    const row = Math.floor(emptyIdx / size);
    const col = emptyIdx % size;
    const neighbors: number[] = [];
    if (row > 0) neighbors.push(emptyIdx - size);
    if (row < size - 1) neighbors.push(emptyIdx + size);
    if (col > 0) neighbors.push(emptyIdx - 1);
    if (col < size - 1) neighbors.push(emptyIdx + 1);
    const swap = neighbors[Math.floor(Math.random() * neighbors.length)];
    [tiles[emptyIdx], tiles[swap]] = [tiles[swap], tiles[emptyIdx]];
    emptyIdx = swap;
  }
  return tiles;
}

function isWin(tiles: number[], size: number): boolean {
  const total = size * size;
  for (let i = 0; i < total - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[total - 1] === 0;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function playSound(type: "move" | "win") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "move") {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      const freqs = [523, 659, 784, 1047];
      freqs.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = f;
        g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.2);
        o.start(ctx.currentTime + i * 0.12);
        o.stop(ctx.currentTime + i * 0.12 + 0.2);
      });
    }
  } catch {}
}

export default function SlidingPuzzle() {
  const [difficulty, setDifficulty] = useState<Difficulty>("4x4");
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [bests, setBests] = useState<Partial<Record<Difficulty, BestRecord>>>({});
  const [animatingIdx, setAnimatingIdx] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const size = DIFFICULTIES[difficulty].size;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sliding_bests");
      if (saved) setBests(JSON.parse(saved));
    } catch {}
    startNewGame("4x4");
  }, []);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  function startNewGame(diff: Difficulty) {
    const cfg = DIFFICULTIES[diff];
    const shuffled = generateSolvableShuffle(cfg.size, cfg.shuffleMoves);
    setTiles(shuffled);
    setMoves(0);
    setTime(0);
    setWon(false);
    setRunning(false);
    setAnimatingIdx(null);
  }

  function handleDifficultyChange(d: Difficulty) {
    setDifficulty(d);
    startNewGame(d);
  }

  function handleTileClick(idx: number) {
    if (won) return;
    const emptyIdx = tiles.indexOf(0);
    const row = Math.floor(idx / size);
    const col = idx % size;
    const eRow = Math.floor(emptyIdx / size);
    const eCol = emptyIdx % size;
    const adjacent =
      (row === eRow && Math.abs(col - eCol) === 1) ||
      (col === eCol && Math.abs(row - eRow) === 1);
    if (!adjacent) return;

    if (!running) setRunning(true);
    playSound("move");
    setAnimatingIdx(idx);
    setTimeout(() => setAnimatingIdx(null), 150);

    const newTiles = [...tiles];
    [newTiles[idx], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[idx]];
    setTiles(newTiles);
    const newMoves = moves + 1;
    setMoves(newMoves);

    if (isWin(newTiles, size)) {
      setRunning(false);
      setWon(true);
      playSound("win");
      const best = bests[difficulty];
      if (!best || newMoves < best.moves || (newMoves === best.moves && time < best.time)) {
        const newBests = { ...bests, [difficulty]: { moves: newMoves, time } };
        setBests(newBests);
        try { localStorage.setItem("sliding_bests", JSON.stringify(newBests)); } catch {}
      }
    }
  }

  // Touch support
  const touchStart = useRef<{ x: number; y: number; idx: number } | null>(null);

  function handleTouchStart(e: React.TouchEvent, idx: number) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, idx };
  }

  function handleTouchEnd(e: React.TouchEvent, idx: number) {
    handleTileClick(idx);
    touchStart.current = null;
  }

  const tileSize = size === 3 ? 100 : size === 4 ? 90 : 70;
  const gap = 6;
  const boardPx = size * tileSize + (size - 1) * gap;
  const emptyIdx = tiles.indexOf(0);

  return (
    <div className="flex flex-col items-center gap-6 py-4 select-none">
      <h1 className="text-3xl font-bold text-white tracking-tight">🧩 Sliding Puzzle</h1>

      {/* Difficulty selector */}
      <div className="flex gap-2">
        {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
          <button
            key={d}
            onClick={() => handleDifficultyChange(d)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              difficulty === d
                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {DIFFICULTIES[d].label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-8 text-center">
        <div className="bg-slate-800 rounded-xl px-6 py-3">
          <div className="text-slate-400 text-xs uppercase tracking-wider">Moves</div>
          <div className="text-2xl font-bold text-white">{moves}</div>
        </div>
        <div className="bg-slate-800 rounded-xl px-6 py-3">
          <div className="text-slate-400 text-xs uppercase tracking-wider">Time</div>
          <div className="text-2xl font-bold text-white">{formatTime(time)}</div>
        </div>
        {bests[difficulty] && (
          <div className="bg-slate-800 rounded-xl px-6 py-3">
            <div className="text-slate-400 text-xs uppercase tracking-wider">Best</div>
            <div className="text-sm font-bold text-teal-400">
              {bests[difficulty]!.moves}m / {formatTime(bests[difficulty]!.time)}
            </div>
          </div>
        )}
      </div>

      {/* Win message */}
      {won && (
        <div className="bg-teal-500/20 border border-teal-500/50 rounded-xl px-8 py-4 text-center">
          <div className="text-2xl font-bold text-teal-400">🎉 Puzzle Solved!</div>
          <div className="text-slate-300 mt-1">
            {moves} moves · {formatTime(time)}
          </div>
        </div>
      )}

      {/* Board */}
      <div
        style={{ width: boardPx, height: boardPx, position: "relative" }}
        className="bg-slate-800 rounded-2xl p-1"
      >
        {tiles.map((tile, idx) => {
          if (tile === 0) return null;
          const row = Math.floor(idx / size);
          const col = idx % size;
          const x = col * (tileSize + gap);
          const y = row * (tileSize + gap);
          const isAnimating = animatingIdx === idx;
          const targetTile = size * size; // expected solved value
          const isSolved = !won && tile === idx + 1;

          return (
            <div
              key={tile}
              onClick={() => handleTileClick(idx)}
              onTouchStart={(e) => handleTouchStart(e, idx)}
              onTouchEnd={(e) => handleTouchEnd(e, idx)}
              style={{
                position: "absolute",
                width: tileSize,
                height: tileSize,
                left: x,
                top: y,
                transition: isAnimating ? "none" : "left 0.12s ease, top 0.12s ease",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                fontSize: size === 5 ? 18 : size === 4 ? 22 : 28,
                fontWeight: 700,
                userSelect: "none",
                background: won
                  ? "linear-gradient(135deg, #14b8a6, #06b6d4)"
                  : isSolved
                  ? "linear-gradient(135deg, #1e3a5f, #1e4080)"
                  : "linear-gradient(135deg, #1e293b, #0f172a)",
                color: won ? "white" : isSolved ? "#7dd3fc" : "white",
                border: won ? "2px solid #14b8a6" : isSolved ? "2px solid #3b82f6" : "2px solid #334155",
                boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                transform: isAnimating ? "scale(0.95)" : "scale(1)",
              }}
            >
              {tile}
            </div>
          );
        })}
      </div>

      {/* Shuffle button */}
      <button
        onClick={() => startNewGame(difficulty)}
        className="px-8 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105 active:scale-95"
      >
        {won ? "🔄 New Game" : "🔀 Shuffle"}
      </button>

      <p className="text-slate-500 text-sm text-center max-w-md">
        Click a tile adjacent to the empty space to slide it. Arrange tiles 1–{size * size - 1} in order to win!
      </p>
    </div>
  );
}
