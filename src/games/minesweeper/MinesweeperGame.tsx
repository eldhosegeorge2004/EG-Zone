/* eslint-disable */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Flag, RotateCcw, Clock, Bomb, Trophy, XCircle, Check } from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";

interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
  label: string;
}

const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 9, cols: 9, mines: 10, label: "Easy (9x9)" },
  medium: { rows: 12, cols: 12, mines: 22, label: "Medium (12x12)" },
  hard: { rows: 14, cols: 14, mines: 35, label: "Hard (14x14)" },
};

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  isExploded?: boolean;
  isWrongFlag?: boolean;
}

const NUMBER_COLORS: Record<number, string> = {
  1: "text-blue-500",
  2: "text-emerald-500",
  3: "text-rose-500",
  4: "text-indigo-400",
  5: "text-amber-500",
  6: "text-teal-400",
  7: "text-purple-400",
  8: "text-gray-300",
};

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [flagMode, setFlagMode] = useState<boolean>(false);
  const [flagCount, setFlagCount] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [bestTimes, setBestTimes] = useState<Record<Difficulty, number | null>>({
    easy: null,
    medium: null,
    hard: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const didLongPress = useRef<boolean>(false);

  // Load best times from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("minesweeper_best_times");
    if (saved) {
      try {
        setBestTimes(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const config = DIFFICULTIES[difficulty];

  // Initialize a blank grid
  const initBlankGrid = useCallback((diff: Difficulty) => {
    const { rows, cols } = DIFFICULTIES[diff];
    const initialGrid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      initialGrid.push(row);
    }
    setGrid(initialGrid);
    setGameStatus("idle");
    setFlagCount(0);
    setTimer(0);
    setIsPressing(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    initBlankGrid(difficulty);
  }, [difficulty, initBlankGrid]);

  // Start timer on playing
  useEffect(() => {
    if (gameStatus === "playing") {
      timerRef.current = setInterval(() => {
        setTimer((t) => Math.min(999, t + 1));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  // Plant mines ensuring the first clicked cell (and its 8 neighbors) is guaranteed safe
  const plantMines = (startR: number, startC: number, currentGrid: Cell[][]): Cell[][] => {
    const { rows, cols, mines } = config;
    const newGrid: Cell[][] = currentGrid.map((row) => row.map((cell) => ({ ...cell })));

    let planted = 0;
    while (planted < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Keep starting cell and its 8 adjacent neighbors free of mines
      const isNeighborOrStart = Math.abs(r - startR) <= 1 && Math.abs(c - startC) <= 1;

      if (!newGrid[r][c].isMine && !isNeighborOrStart) {
        newGrid[r][c].isMine = true;
        planted++;
      }
    }

    // Compute neighbor mine counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c].isMine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc].isMine) {
              count++;
            }
          }
        }
        newGrid[r][c].neighborMines = count;
      }
    }

    return newGrid;
  };

  // Trigger defeat: reveal all mines, highlight detonated mine, and mark wrong flags
  const handleDefeat = (r: number, c: number, currentGrid: Cell[][]) => {
    const revealedGrid = currentGrid.map((row) =>
      row.map((cl) => {
        if (cl.r === r && cl.c === c) {
          return { ...cl, isRevealed: true, isExploded: true };
        }
        // Flag placed on a non-mine tile -> Wrong flag
        if (cl.isFlagged && !cl.isMine) {
          return { ...cl, isRevealed: true, isWrongFlag: true };
        }
        // Hidden mine revealed
        if (cl.isMine && !cl.isFlagged) {
          return { ...cl, isRevealed: true };
        }
        return cl;
      })
    );
    setGrid(revealedGrid);
    setGameStatus("lost");
  };

  // Check victory condition
  const checkVictory = (currentGrid: Cell[][]): boolean => {
    let unrevealedSafe = 0;
    for (const row of currentGrid) {
      for (const cl of row) {
        if (!cl.isMine && !cl.isRevealed) unrevealedSafe++;
      }
    }
    return unrevealedSafe === 0;
  };

  // Cascade reveal using Breadth-First Search (BFS)
  const cascadeReveal = (startR: number, startC: number, board: Cell[][]): Cell[][] => {
    const nextGrid = board.map((row) => row.map((cl) => ({ ...cl })));
    const queue: [number, number][] = [[startR, startC]];
    nextGrid[startR][startC].isRevealed = true;

    while (queue.length > 0) {
      const [currR, currC] = queue.shift()!;
      const currCell = nextGrid[currR][currC];

      if (currCell.neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (
              nr >= 0 &&
              nr < config.rows &&
              nc >= 0 &&
              nc < config.cols &&
              !nextGrid[nr][nc].isRevealed &&
              !nextGrid[nr][nc].isFlagged &&
              !nextGrid[nr][nc].isMine
            ) {
              nextGrid[nr][nc].isRevealed = true;
              queue.push([nr, nc]);
            }
          }
        }
      }
    }

    return nextGrid;
  };

  // Reveal a single unopened cell
  const revealCell = (r: number, c: number) => {
    if (gameStatus === "won" || gameStatus === "lost") return;

    let currentGrid = grid;

    // First click: generate safe board
    if (gameStatus === "idle") {
      currentGrid = plantMines(r, c, grid);
      setGameStatus("playing");
    }

    const cell = currentGrid[r][c];

    // Chording: If clicking on already-revealed numbered cell, chord reveal adjacent cells!
    if (cell.isRevealed) {
      if (cell.neighborMines > 0) {
        chordReveal(r, c, currentGrid);
      }
      return;
    }

    // Flagged cells are protected from clicks
    if (cell.isFlagged) return;

    // Hit a mine -> Defeat
    if (cell.isMine) {
      handleDefeat(r, c, currentGrid);
      return;
    }

    // Safe cell reveal with cascade
    const nextGrid = cascadeReveal(r, c, currentGrid);

    // Check Win
    if (checkVictory(nextGrid)) {
      handleWin(nextGrid);
    } else {
      setGrid(nextGrid);
    }
  };

  // Chording: When an already revealed numbered tile has exact matching flags, reveal remaining neighbors
  const chordReveal = (r: number, c: number, currentGrid: Cell[][]) => {
    const cell = currentGrid[r][c];
    let neighborFlagCount = 0;
    const unrevealedNeighbors: [number, number][] = [];

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
          const neighbor = currentGrid[nr][nc];
          if (neighbor.isFlagged) neighborFlagCount++;
          else if (!neighbor.isRevealed) unrevealedNeighbors.push([nr, nc]);
        }
      }
    }

    // Only chord if flags match the exact number
    if (neighborFlagCount === cell.neighborMines && unrevealedNeighbors.length > 0) {
      // Check if any unrevealed neighbor is an unflagged mine (wrong flag mistake!)
      for (const [nr, nc] of unrevealedNeighbors) {
        if (currentGrid[nr][nc].isMine) {
          handleDefeat(nr, nc, currentGrid);
          return;
        }
      }

      // All unrevealed neighbors are safe, reveal them
      let nextGrid = currentGrid.map((row) => row.map((cl) => ({ ...cl })));
      for (const [nr, nc] of unrevealedNeighbors) {
        if (!nextGrid[nr][nc].isRevealed) {
          nextGrid = cascadeReveal(nr, nc, nextGrid);
        }
      }

      if (checkVictory(nextGrid)) {
        handleWin(nextGrid);
      } else {
        setGrid(nextGrid);
      }
    }
  };

  // Handle Win: auto-flag remaining mines and update best time
  const handleWin = (finalGrid: Cell[][]) => {
    const autoFlagged = finalGrid.map((row) =>
      row.map((cl) => (cl.isMine ? { ...cl, isFlagged: true } : cl))
    );
    setGrid(autoFlagged);
    setFlagCount(config.mines);
    setGameStatus("won");

    const currentBest = bestTimes[difficulty];
    if (currentBest === null || timer < currentBest) {
      const updated = { ...bestTimes, [difficulty]: timer };
      setBestTimes(updated);
      localStorage.setItem("minesweeper_best_times", JSON.stringify(updated));
    }
  };

  // Toggle flag on right click or flagMode
  const toggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (gameStatus === "won" || gameStatus === "lost") return;

    const cell = grid[r][c];
    if (cell.isRevealed) return;

    const newGrid = grid.map((row) =>
      row.map((cl) => (cl.r === r && cl.c === c ? { ...cl, isFlagged: !cl.isFlagged } : cl))
    );

    const delta = cell.isFlagged ? -1 : 1;
    setFlagCount((cnt) => cnt + delta);
    setGrid(newGrid);
  };

  // Cell click dispatcher
  const handleCellClick = (r: number, c: number) => {
    if (didLongPress.current) {
      didLongPress.current = false;
      return;
    }

    if (flagMode) {
      toggleFlag(r, c);
    } else {
      revealCell(r, c);
    }
  };

  // Touch handlers for mobile long-press flagging
  const handleTouchStart = (r: number, c: number) => {
    didLongPress.current = false;
    touchTimerRef.current = setTimeout(() => {
      didLongPress.current = true;
      toggleFlag(r, c);
      if (typeof window !== "undefined" && window.navigator && "vibrate" in window.navigator) {
        window.navigator.vibrate(30);
      }
    }, 380);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  };

  // Classic smiley faces
  const getSmiley = () => {
    if (gameStatus === "won") return "😎";
    if (gameStatus === "lost") return "😵";
    if (isPressing) return "😮";
    return "🙂";
  };

  const remainingMines = config.mines - flagCount;

  return (
    <div
      onMouseUp={() => setIsPressing(false)}
      className="flex flex-col items-center select-none w-full max-w-[420px] mx-auto"
    >
      {/* Top Difficulty Selector */}
      <div className="w-full flex justify-between items-center gap-2 mb-4 bg-white px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {(["easy", "medium", "hard"] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => {
                setDifficulty(diff);
                initBlankGrid(diff);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                difficulty === diff
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Mobile Flag Mode & Replay Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFlagMode(!flagMode)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              flagMode
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            {flagMode ? "Flag: ON" : "Flag"}
          </button>
          <button
            type="button"
            onClick={() => initBlankGrid(difficulty)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition-all"
            title="Restart Game"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Replay
          </button>
        </div>
      </div>

      {/* Retro-Modern Minesweeper Console */}
      <div className="w-full bg-slate-800 p-3 sm:p-5 rounded-3xl shadow-2xl border-4 border-slate-700 flex flex-col items-center">
        {/* Digital Counter Display Bar */}
        <div className="w-full flex justify-between items-center bg-slate-950 px-4 py-2.5 rounded-2xl border-2 border-slate-700 mb-4 shadow-inner">
          {/* Mine Counter */}
          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-red-950 font-mono text-xl sm:text-2xl font-black text-rose-500 tracking-wider">
            <Bomb className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
            {remainingMines < 0
              ? `-${String(Math.abs(remainingMines)).padStart(2, "0")}`
              : String(remainingMines).padStart(3, "0")}
          </div>

          {/* Smiley Reset Button */}
          <button
            type="button"
            onClick={() => initBlankGrid(difficulty)}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-700 hover:bg-slate-600 active:scale-95 text-2xl rounded-xl flex items-center justify-center border-2 border-slate-500 shadow-md transition-all"
            title="Click Smiley to Replay"
          >
            {getSmiley()}
          </button>

          {/* Time Counter */}
          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-red-950 font-mono text-xl sm:text-2xl font-black text-amber-500 tracking-wider">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            {String(timer).padStart(3, "0")}
          </div>
        </div>

        {/* Status Win / Loss Banner with Replay Button */}
        {gameStatus === "won" && (
          <div className="w-full py-2.5 px-4 mb-3 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-between text-xs sm:text-sm shadow-md animate-bounce">
            <span>🎉 All mines cleared in {timer}s!</span>
            <button
              type="button"
              onClick={() => initBlankGrid(difficulty)}
              className="flex items-center gap-1 px-3 py-1 bg-white text-emerald-800 rounded-lg text-xs font-black shadow hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replay
            </button>
          </div>
        )}
        {gameStatus === "lost" && (
          <div className="w-full py-2.5 px-4 mb-3 rounded-xl bg-rose-500 text-white font-black flex items-center justify-between text-xs sm:text-sm shadow-md">
            <span>💥 Mine triggered!</span>
            <button
              type="button"
              onClick={() => initBlankGrid(difficulty)}
              className="flex items-center gap-1 px-3 py-1 bg-white text-rose-800 rounded-lg text-xs font-black shadow hover:bg-rose-50 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replay
            </button>
          </div>
        )}

        {/* Square Minesweeper Grid */}
        <div
          onMouseDown={() => setIsPressing(true)}
          className="w-full aspect-square bg-slate-900 p-2 sm:p-2.5 rounded-2xl border border-slate-700 flex flex-col gap-1"
        >
          {grid.map((row, r) => (
            <div key={r} className="flex gap-1 w-full flex-1">
              {row.map((cell, c) => {
                const textSize =
                  difficulty === "easy"
                    ? "text-sm sm:text-base font-black"
                    : difficulty === "medium"
                    ? "text-xs font-black"
                    : "text-[9px] font-black";

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => toggleFlag(r, c, e)}
                    onTouchStart={() => handleTouchStart(r, c)}
                    onTouchEnd={handleTouchEnd}
                    className={`flex-1 h-full rounded flex items-center justify-center transition-all ${textSize} ${
                      cell.isRevealed
                        ? cell.isExploded
                          ? "bg-rose-600 text-white shadow-inner animate-pulse"
                          : cell.isWrongFlag
                          ? "bg-rose-950 border border-rose-500"
                          : cell.isMine
                          ? "bg-slate-700 text-white"
                          : "bg-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                        : "bg-slate-600 hover:bg-slate-500 active:bg-slate-700 shadow-sm border-t border-slate-400"
                    }`}
                  >
                    {cell.isRevealed ? (
                      cell.isExploded ? (
                        <Bomb className="w-4 h-4 text-white animate-bounce" />
                      ) : cell.isWrongFlag ? (
                        <div className="relative flex items-center justify-center">
                          <Flag className="w-3.5 h-3.5 text-rose-400 opacity-60" />
                          <XCircle className="w-3 h-3 text-rose-500 absolute" />
                        </div>
                      ) : cell.isMine ? (
                        <Bomb className="w-3.5 h-3.5 text-rose-400" />
                      ) : cell.neighborMines > 0 ? (
                        <span className={NUMBER_COLORS[cell.neighborMines]}>
                          {cell.neighborMines}
                        </span>
                      ) : null
                    ) : cell.isFlagged ? (
                      <Flag className="w-3.5 h-3.5 text-rose-400 fill-rose-500 drop-shadow" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Best Time Display */}
        {bestTimes[difficulty] !== null && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Best Time ({difficulty}):{" "}
            <span className="text-white font-mono">{bestTimes[difficulty]}s</span>
          </div>
        )}
      </div>

      {/* Play Again button when game ends */}
      {(gameStatus === "won" || gameStatus === "lost") && (
        <button
          type="button"
          onClick={() => initBlankGrid(difficulty)}
          className="mt-4 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
      )}

      {/* Control Tips */}
      <p className="mt-4 text-xs text-gray-400 font-medium text-center leading-relaxed">
        <strong>Click</strong> to reveal • <strong>Right-click</strong> or <strong>Hold</strong> to flag • <strong>Click numbers</strong> to chord-reveal neighbors.
      </p>
    </div>
  );
}
