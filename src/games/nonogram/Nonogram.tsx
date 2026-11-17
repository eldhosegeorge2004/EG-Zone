/* eslint-disable */
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface NonogramPuzzle {
  id: string;
  name: string;
  size: number;
  difficulty: "Easy" | "Medium" | "Hard";
  grid: number[][]; // 1 for filled, 0 for empty
}

const PUZZLES: NonogramPuzzle[] = [
  {
    id: "heart",
    name: "Heart",
    size: 5,
    difficulty: "Easy",
    grid: [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ],
  },
  {
    id: "cup",
    name: "Coffee Mug",
    size: 5,
    difficulty: "Easy",
    grid: [
      [1, 1, 1, 1, 0],
      [1, 0, 0, 1, 1],
      [1, 0, 0, 1, 1],
      [1, 1, 1, 1, 0],
      [0, 1, 1, 0, 0],
    ],
  },
  {
    id: "smile",
    name: "Smiley Face",
    size: 5,
    difficulty: "Easy",
    grid: [
      [0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 1, 1, 1, 0],
    ],
  },
  {
    id: "mushroom",
    name: "Magic Mushroom",
    size: 10,
    difficulty: "Medium",
    grid: [
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
    ],
  },
  {
    id: "crown",
    name: "Royal Crown",
    size: 10,
    difficulty: "Medium",
    grid: [
      [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      [1, 1, 0, 1, 0, 0, 1, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
  },
  {
    id: "cat",
    name: "Playful Cat",
    size: 10,
    difficulty: "Hard",
    grid: [
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 0, 0, 0, 0, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0, 0, 1],
      [0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
      [0, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    ],
  },
];

function calculateClues(target: number[][]) {
  const numRows = target.length;
  const numCols = target[0].length;
  const rowClues: number[][] = [];
  const colClues: number[][] = [];

  for (let r = 0; r < numRows; r++) {
    const clues: number[] = [];
    let count = 0;
    for (let c = 0; c < numCols; c++) {
      if (target[r][c] === 1) count++;
      else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    rowClues.push(clues.length > 0 ? clues : [0]);
  }

  for (let c = 0; c < numCols; c++) {
    const clues: number[] = [];
    let count = 0;
    for (let r = 0; r < numRows; r++) {
      if (target[r][c] === 1) count++;
      else if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    colClues.push(clues.length > 0 ? clues : [0]);
  }

  return { rowClues, colClues };
}

// Cell states: 0 = Empty, 1 = Filled, 2 = Marked with X
export default function Nonogram() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const currentPuzzle = PUZZLES[selectedIdx];
  const size = currentPuzzle.size;

  const [gridState, setGridState] = useState<number[][]>(() =>
    Array.from({ length: size }, () => Array(size).fill(0))
  );
  const [toolMode, setToolMode] = useState<"fill" | "cross">("fill");
  const [isWon, setIsWon] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [bestTimes, setBestTimes] = useState<{ [key: string]: number }>({});
  const [errorsHighlighted, setErrorsHighlighted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, []);

  const playTone = useCallback(
    (type: "fill" | "cross" | "clear" | "win" | "error") => {
      const ctx = getAudioContext();
      if (!ctx) return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "fill") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
        } else if (type === "cross") {
          osc.type = "triangle";
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.setValueAtTime(260, now + 0.05);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === "clear") {
          osc.type = "sine";
          osc.frequency.setValueAtTime(400, now);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
        } else if (type === "error") {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(190, now);
          osc.frequency.setValueAtTime(140, now + 0.1);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
        } else if (type === "win") {
          const freqs = [440, 554.37, 659.25, 880];
          freqs.forEach((freq, idx) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.type = "triangle";
            o.frequency.setValueAtTime(freq, now + idx * 0.1);
            g.gain.setValueAtTime(0.12, now + idx * 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
            o.start(now + idx * 0.1);
            o.stop(now + idx * 0.1 + 0.3);
          });
        }
      } catch {}
    },
    [getAudioContext]
  );

  // Compute clues dynamically
  const { rowClues, colClues } = calculateClues(currentPuzzle.grid);

  // Reset board on puzzle change
  useEffect(() => {
    setGridState(Array.from({ length: currentPuzzle.size }, () => Array(currentPuzzle.size).fill(0)));
    setIsWon(false);
    setTimerSeconds(0);
    setErrorsHighlighted(false);
  }, [selectedIdx, currentPuzzle.size]);

  // Load best times from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nonogram_best_times");
      if (saved) {
        setBestTimes(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon]);

  // Check victory condition
  const checkWinCondition = useCallback(
    (grid: number[][]) => {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const isFilledInSolution = currentPuzzle.grid[r][c] === 1;
          const isFilledByUser = grid[r][c] === 1;
          if (isFilledInSolution !== isFilledByUser) {
            return false;
          }
        }
      }
      return true;
    },
    [size, currentPuzzle.grid]
  );

  const handleCellAction = (r: number, c: number, actionType: "fill" | "cross") => {
    if (isWon) return;
    const currentVal = gridState[r][c];
    let nextVal = 0;

    if (actionType === "fill") {
      nextVal = currentVal === 1 ? 0 : 1;
      if (nextVal === 1) playTone("fill");
      else playTone("clear");
    } else {
      nextVal = currentVal === 2 ? 0 : 2;
      if (nextVal === 2) playTone("cross");
      else playTone("clear");
    }

    const nextGrid = gridState.map((rowArr, rowIndex) =>
      rowArr.map((cellVal, colIndex) => {
        if (rowIndex === r && colIndex === c) return nextVal;
        return cellVal;
      })
    );

    setGridState(nextGrid);

    // Validate win
    if (checkWinCondition(nextGrid)) {
      setIsWon(true);
      playTone("win");
      setBestTimes((prev) => {
        const curBest = prev[currentPuzzle.id];
        const newBest = curBest !== undefined ? Math.min(curBest, timerSeconds) : timerSeconds;
        const updated = { ...prev, [currentPuzzle.id]: newBest };
        try {
          localStorage.setItem("nonogram_best_times", JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const handleCellClick = (r: number, c: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (e.button === 2) {
      // Right click
      handleCellAction(r, c, "cross");
    } else {
      // Left click
      handleCellAction(r, c, toolMode);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const resetCurrentPuzzle = () => {
    playTone("clear");
    setGridState(Array.from({ length: size }, () => Array(size).fill(0)));
    setIsWon(false);
    setTimerSeconds(0);
    setErrorsHighlighted(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 md:p-6 bg-slate-900/95 border border-purple-900/50 rounded-2xl shadow-2xl backdrop-blur-md max-w-4xl mx-auto">
      {/* Top Header & Selector */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400">
            Nonogram / Picross
          </h1>
          <p className="text-xs text-slate-400">
            Paint-by-Numbers Logic Grid • {currentPuzzle.name} ({size}×{size})
          </p>
        </div>

        {/* Puzzle Selector Chips */}
        <div className="flex flex-wrap justify-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {PUZZLES.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedIdx === idx
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {p.name} ({p.size}×{p.size})
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Time</span>
          <span className="text-lg font-mono font-bold text-purple-400">{formatTime(timerSeconds)}</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Best Time</span>
          <span className="text-lg font-mono font-bold text-emerald-400">
            {bestTimes[currentPuzzle.id] !== undefined ? formatTime(bestTimes[currentPuzzle.id]) : "—"}
          </span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Grid Size</span>
          <span className="text-lg font-mono font-bold text-indigo-400">{size} × {size}</span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Difficulty</span>
          <span className={`text-lg font-bold ${
            currentPuzzle.difficulty === "Easy"
              ? "text-teal-400"
              : currentPuzzle.difficulty === "Medium"
              ? "text-amber-400"
              : "text-rose-400"
          }`}>
            {currentPuzzle.difficulty}
          </span>
        </div>
      </div>

      {/* Controls & Mode Selector (Essential for mobile touch play) */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setToolMode("fill")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              toolMode === "fill"
                ? "bg-purple-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="w-3.5 h-3.5 bg-purple-400 rounded-sm inline-block" />
            Fill Cell
          </button>
          <button
            type="button"
            onClick={() => setToolMode("cross")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              toolMode === "cross"
                ? "bg-rose-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="text-rose-300 font-bold inline-block">✕</span>
            Mark X
          </button>
        </div>

        <button
          onClick={() => {
            setErrorsHighlighted((prev) => !prev);
            playTone("fill");
          }}
          className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
            errorsHighlighted
              ? "bg-amber-900/60 border-amber-500 text-amber-200"
              : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
          }`}
        >
          {errorsHighlighted ? "Hide Check" : "Check Mistakes"}
        </button>

        <button
          onClick={resetCurrentPuzzle}
          className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition-all"
        >
          Reset
        </button>
      </div>

      {/* Nonogram Grid with Clues */}
      <div
        className="flex flex-col items-center select-none overflow-x-auto max-w-full p-2"
        onContextMenu={handleContextMenu}
      >
        <div className="inline-block bg-slate-950 p-3 sm:p-4 rounded-2xl border-2 border-purple-900/60 shadow-2xl">
          {/* Top Row: Empty Corner + Column Clues */}
          <div className="flex">
            {/* Top-left corner spacer for row clues */}
            <div className="w-14 sm:w-20 md:w-24 shrink-0 flex items-end justify-end p-1 text-[10px] text-slate-500 font-mono">
              ROWS ➔
            </div>

            {/* Column clues header */}
            <div className="flex">
              {colClues.map((clues, cIdx) => (
                <div
                  key={`col-${cIdx}`}
                  className="w-7 h-16 sm:w-9 sm:h-20 md:w-10 md:h-24 flex flex-col justify-end items-center gap-0.5 pb-1 border-b-2 border-purple-800/80"
                >
                  {clues.map((num, i) => (
                    <span
                      key={i}
                      className="text-[10px] sm:text-xs font-mono font-bold text-purple-300"
                    >
                      {num}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Grid Rows with Row Clues */}
          {gridState.map((rowArr, rIdx) => (
            <div key={`row-${rIdx}`} className="flex items-center">
              {/* Row Clues Box */}
              <div className="w-14 sm:w-20 md:w-24 shrink-0 flex justify-end items-center gap-1 sm:gap-1.5 pr-2 border-r-2 border-purple-800/80">
                {rowClues[rIdx].map((num, i) => (
                  <span
                    key={i}
                    className="text-[10px] sm:text-xs font-mono font-bold text-purple-300"
                  >
                    {num}
                  </span>
                ))}
              </div>

              {/* Grid Cells for this row */}
              <div className="flex">
                {rowArr.map((cellVal, cIdx) => {
                  const isFilled = cellVal === 1;
                  const isCrossed = cellVal === 2;
                  const isWrong =
                    errorsHighlighted &&
                    ((isFilled && currentPuzzle.grid[rIdx][cIdx] !== 1) ||
                      (isCrossed && currentPuzzle.grid[rIdx][cIdx] === 1));

                  return (
                    <button
                      key={`cell-${rIdx}-${cIdx}`}
                      type="button"
                      onClick={(e) => handleCellClick(rIdx, cIdx, e)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleCellAction(rIdx, cIdx, "cross");
                      }}
                      className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 border transition-all flex items-center justify-center font-bold text-xs sm:text-sm select-none ${
                        isWrong
                          ? "bg-rose-950 border-rose-500 text-rose-300"
                          : isFilled
                          ? "bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-400 text-white shadow-inner"
                          : isCrossed
                          ? "bg-slate-900 border-slate-700 text-rose-400"
                          : "bg-slate-800/90 border-slate-700 hover:bg-slate-700/80 text-transparent"
                      } ${rIdx % 5 === 4 && rIdx !== size - 1 ? "border-b-2 border-b-purple-500/60" : ""} ${
                        cIdx % 5 === 4 && cIdx !== size - 1 ? "border-r-2 border-r-purple-500/60" : ""
                      }`}
                    >
                      {isCrossed ? "✕" : isFilled ? "■" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions footer */}
      <div className="text-center text-xs text-slate-400 max-w-lg">
        <p>
          <span className="text-purple-300 font-semibold">Left Click / Tap:</span> Fill cell or use active tool •{" "}
          <span className="text-rose-300 font-semibold">Right Click / Mode Toggle:</span> Mark cell with ✕ (empty)
        </p>
      </div>

      {/* Victory Celebration Modal */}
      {isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border-2 border-purple-500/80 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4">
            <span className="text-6xl animate-bounce">🎨</span>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Picture Solved!
            </h2>
            <p className="text-sm text-slate-300">
              You uncovered the <span className="text-purple-400 font-bold">{currentPuzzle.name}</span> in{" "}
              <span className="text-emerald-400 font-mono font-bold">{formatTime(timerSeconds)}</span>!
            </p>

            {/* Pixel Art Mini Preview */}
            <div className="p-3 bg-slate-950 rounded-xl border border-purple-900/50">
              <div
                className="grid gap-0.5"
                style={{
                  gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                }}
              >
                {currentPuzzle.grid.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`preview-${r}-${c}`}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[2px] ${
                        val === 1 ? "bg-purple-500" : "bg-slate-900"
                      }`}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={() => {
                  const next = (selectedIdx + 1) % PUZZLES.length;
                  setSelectedIdx(next);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Next Puzzle
              </button>
              <button
                onClick={() => setIsWon(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
