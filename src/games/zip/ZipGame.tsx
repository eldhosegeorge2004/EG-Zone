/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCcw, Lightbulb, Play, Undo2, Trophy, Star } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

interface LevelConfig {
  n: number;
  k: number;
  h: number;
}

const SIZES = [4, 4, 4, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 7];
const CLUES = [6, 6, 5, 7, 6, 5, 8, 7, 6, 5, 9, 8, 7, 6, 5];

function levelConfig(r: number): LevelConfig {
  const idx = Math.min(Math.max(1, r), 15) - 1;
  return {
    n: SIZES[idx],
    k: CLUES[idx],
    h: Math.max(0, 3 - Math.floor(idx / 4)),
  };
}

function wallKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function areAdjacent(a: number, b: number, n: number): boolean {
  const d = Math.abs(a - b);
  return d === n || (d === 1 && Math.floor(a / n) === Math.floor(b / n));
}

function getNeighbors(c: number, n: number): number[] {
  const r = Math.floor(c / n);
  const q = c % n;
  const o: number[] = [];
  if (r > 0) o.push(c - n);
  if (r < n - 1) o.push(c + n);
  if (q > 0) o.push(c - 1);
  if (q < n - 1) o.push(c + 1);
  return o;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

export default function ZipGame() {
  const [round, setRound] = useState(1);
  const [stars, setStars] = useState(0);
  const [gridSize, setGridSize] = useState(4);
  const [path, setPath] = useState<number[]>([]);
  const [numAt, setNumAt] = useState<Record<number, number>>({});
  const [nums, setNums] = useState<number[]>([]);
  const [walls, setWalls] = useState<Record<string, boolean>>({});
  const [hintsLeft, setHintsLeft] = useState(3);
  const [hintCells, setHintCells] = useState<number[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [message, setMessage] = useState("");
  const [isWon, setIsWon] = useState(false);
  const [bestStars, setBestStars] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Mutable refs for pointer dragging and loop state
  const roundRef = useRef(1);
  const pathRef = useRef<number[]>([]);
  const numAtRef = useRef<Record<number, number>>({});
  const numsRef = useRef<number[]>([]);
  const wallsRef = useRef<Record<string, boolean>>({});
  const solutionRef = useRef<number[]>([]);
  const isWonRef = useRef(false);
  const isDrawingRef = useRef(false);
  const prevCoordRef = useRef<{ x: number; y: number } | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintsUsedRef = useRef(0);
  const runDoneRef = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved high score
  useEffect(() => {
    try {
      const b = parseInt(localStorage.getItem("zip_best_stars") || "0");
      setBestStars(b);
    } catch {}
  }, []);

  // Timer helpers
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (startTimeRef.current !== 0) return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current);
    }, 500);
  }, []);

  // Puzzle generation
  const generatePath = useCallback((n: number): number[] => {
    const total = n * n;
    for (let t = 0; t < 500; t++) {
      const seen = new Uint8Array(total);
      const p: number[] = [];
      let steps = 0;
      let ok = false;

      const dfs = (c: number) => {
        if (ok || steps > 30000) return;
        steps++;
        seen[c] = 1;
        p.push(c);
        if (p.length === total) {
          ok = true;
          return;
        }
        const nbrList = shuffle(getNeighbors(c, n).filter((x) => !seen[x]));
        for (let i = 0; i < nbrList.length && !ok; i++) {
          dfs(nbrList[i]);
        }
        if (!ok) {
          seen[c] = 0;
          p.pop();
        }
      };

      dfs(Math.floor(Math.random() * total));
      if (ok) return p;
    }
    return Array.from({ length: total }, (_, i) => i);
  }, []);

  const countSolutions = useCallback(
    (
      n: number,
      targetNums: number[],
      targetNumAt: Record<number, number>,
      targetWalls: Record<string, boolean>,
      cap = 100000
    ): number => {
      let cnt = 0;
      let nodes = 0;
      const total = n * n;
      const vis = new Uint8Array(total);

      const go = (c: number, k: number, len: number) => {
        if (cnt > 1 || nodes > cap) return;
        nodes++;
        if (len === total) {
          if (k === targetNums.length) cnt++;
          return;
        }
        const nb = getNeighbors(c, n);
        for (let i = 0; i < nb.length; i++) {
          const x = nb[i];
          if (vis[x] || targetWalls[wallKey(c, x)]) continue;
          const nn = targetNumAt[x];
          if (nn) {
            if (nn !== k + 1) continue;
            if (nn === targetNums.length && len + 1 !== total) continue;
          }
          vis[x] = 1;
          go(x, nn || k, len + 1);
          vis[x] = 0;
        }
      };

      vis[targetNums[0]] = 1;
      go(targetNums[0], 1, 1);
      return nodes > cap ? 2 : cnt;
    },
    []
  );

  const initPuzzle = useCallback(
    (targetRound: number) => {
      stopTimer();
      startTimeRef.current = 0;
      setElapsedTime(0);
      setIsWon(false);
      isWonRef.current = false;
      setMessage("");
      setHintCells([]);
      hintsUsedRef.current = 0;

      const cfg = levelConfig(targetRound);
      const n = cfg.n;
      setGridSize(n);
      setHintsLeft(cfg.h);

      const sol = generatePath(n);
      solutionRef.current = sol;

      const total = n * n;
      const k = cfg.k;
      let idx: number[] = [0];
      for (let i = 1; i < k - 1; i++) {
        idx.push(Math.round((i * (total - 1)) / (k - 1) + (Math.random() - 0.5) * 2));
      }
      idx.push(total - 1);
      idx = idx.filter((v, i) => i === 0 || v > idx[i - 1]);

      const nms = idx.map((i) => sol[i]);
      const nAt: Record<number, number> = {};
      nms.forEach((c, i) => {
        nAt[c] = i + 1;
      });

      const pos: Record<number, number> = {};
      sol.forEach((c, i) => {
        pos[c] = i;
      });

      const cand: [number, number][] = [];
      for (let c = 0; c < total; c++) {
        getNeighbors(c, n).forEach((x) => {
          if (x > c && Math.abs(pos[c] - pos[x]) !== 1) {
            cand.push([c, x]);
          }
        });
      }
      const shuffledCand = shuffle(cand);
      const newWalls: Record<string, boolean> = {};

      while (shuffledCand.length && countSolutions(n, nms, nAt, newWalls) > 1) {
        for (let j = 0; j < 2 && shuffledCand.length; j++) {
          const w = shuffledCand.pop()!;
          newWalls[wallKey(w[0], w[1])] = true;
        }
      }

      if (targetRound > 1) {
        const ks = shuffle(Object.keys(newWalls));
        const pr = Math.min(1, (targetRound - 1) / 8);
        ks.forEach((key) => {
          if (Math.random() < pr) {
            delete newWalls[key];
            if (countSolutions(n, nms, nAt, newWalls, 40000) > 1) {
              newWalls[key] = true;
            }
          }
        });
      }

      numsRef.current = nms;
      numAtRef.current = nAt;
      wallsRef.current = newWalls;
      pathRef.current = [];

      setNums(nms);
      setNumAt(nAt);
      setWalls(newWalls);
      setPath([]);
    },
    [countSolutions, generatePath, stopTimer]
  );

  // Start initial puzzle on mount
  useEffect(() => {
    initPuzzle(1);
    return () => {
      stopTimer();
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, [initPuzzle, stopTimer]);

  // Stepping into a cell
  const nextRequiredNum = useCallback((): number => {
    let m = 0;
    pathRef.current.forEach((c) => {
      if (numAtRef.current[c]) m = numAtRef.current[c];
    });
    return m + 1;
  }, []);

  const checkWin = useCallback(
    (currentPath: number[]) => {
      const total = gridSize * gridSize;
      if (
        currentPath.length === total &&
        numAtRef.current[currentPath[currentPath.length - 1]] === numsRef.current.length
      ) {
        setIsWon(true);
        isWonRef.current = true;
        isDrawingRef.current = false;
        stopTimer();

        const durationSec = (Date.now() - startTimeRef.current) / 1000;
        const par = total * 2.5;
        const earnedStars =
          hintsUsedRef.current === 0 && durationSec <= par
            ? 3
            : hintsUsedRef.current <= 1 || durationSec <= par * 2
            ? 2
            : 1;

        const newStars = stars + earnedStars;
        setStars(newStars);
        if (newStars > bestStars) {
          setBestStars(newStars);
          try {
            localStorage.setItem("zip_best_stars", String(newStars));
          } catch {}
        }

        const runMs = Date.now() - startTimeRef.current + hintsUsedRef.current * 10000;
        runDoneRef.current += runMs;
        setTotalTime(runDoneRef.current);

        const isLastRound = roundRef.current >= 15;
        if (isLastRound) {
          setShowSubmitModal(true);
          setMessage(
            `🎉 All 15 rounds complete! ${newStars} / 45 stars in ${formatTime(runDoneRef.current)}!`
          );
        } else {
          setMessage(
            `Solved in ${formatTime(Date.now() - startTimeRef.current)}! +${earnedStars} ${
              "★".repeat(earnedStars) + "☆".repeat(3 - earnedStars)
            }`
          );
        }

        if (navigator.vibrate) {
          try {
            navigator.vibrate(80);
          } catch {}
        }
      }
    },
    [bestStars, gridSize, stars, stopTimer]
  );

  const stepTo = useCallback(
    (c: number) => {
      if (c < 0 || isWonRef.current) return;
      const curPath = pathRef.current;

      if (!curPath.length) {
        if (numAtRef.current[c] === 1) {
          const nextP = [c];
          pathRef.current = nextP;
          setPath(nextP);
          startTimer();
        }
        return;
      }

      const last = curPath[curPath.length - 1];
      if (c === last) return;

      const pi = curPath.indexOf(c);
      if (pi > -1) {
        if (pi === curPath.length - 2) {
          const nextP = curPath.slice(0, -1);
          pathRef.current = nextP;
          setPath(nextP);
        }
        return;
      }

      if (!areAdjacent(c, last, gridSize) || wallsRef.current[wallKey(c, last)]) return;
      if (numAtRef.current[c] && numAtRef.current[c] !== nextRequiredNum()) return;

      const nextP = [...curPath, c];
      pathRef.current = nextP;
      setPath(nextP);
      checkWin(nextP);
    },
    [checkWin, gridSize, nextRequiredNum, startTimer]
  );

  // Pointer interactions
  const getUnitCoords = useCallback(
    (e: React.PointerEvent) => {
      if (!boardRef.current) return { x: 0, y: 0 };
      const r = boardRef.current.getBoundingClientRect();
      return {
        x: ((e.clientX - r.left) / r.width) * gridSize,
        y: ((e.clientY - r.top) / r.height) * gridSize,
      };
    },
    [gridSize]
  );

  const cellAt = useCallback(
    (p: { x: number; y: number }): number => {
      if (p.x < 0 || p.y < 0 || p.x >= gridSize || p.y >= gridSize) return -1;
      return Math.floor(p.y) * gridSize + Math.floor(p.x);
    },
    [gridSize]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isWonRef.current) return;
    const p = getUnitCoords(e);
    const c = cellAt(p);
    if (c < 0) return;

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    isDrawingRef.current = true;
    prevCoordRef.current = p;

    const pi = pathRef.current.indexOf(c);
    if (pi > -1) {
      const nextP = pathRef.current.slice(0, pi + 1);
      pathRef.current = nextP;
      setPath(nextP);
    } else {
      stepTo(c);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || !prevCoordRef.current) return;
    const cur = getUnitCoords(e);
    const dx = cur.x - prevCoordRef.current.x;
    const dy = cur.y - prevCoordRef.current.y;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 0.15));

    for (let i = 1; i <= steps; i++) {
      const subX = prevCoordRef.current.x + (dx * i) / steps;
      const subY = prevCoordRef.current.y + (dy * i) / steps;
      stepTo(cellAt({ x: subX, y: subY }));
    }
    prevCoordRef.current = cur;
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  // Button actions
  const handleUndo = () => {
    if (isWonRef.current || pathRef.current.length === 0) return;
    const nextP = pathRef.current.slice(0, -1);
    pathRef.current = nextP;
    setPath(nextP);
  };

  const handleReset = () => {
    if (isWonRef.current) return;
    stopTimer();
    startTimeRef.current = 0;
    setElapsedTime(0);
    pathRef.current = [];
    setPath([]);
    setMessage("");
  };

  const handleNextRound = () => {
    if (!isWonRef.current) return;
    if (roundRef.current >= 15) {
      roundRef.current = 1;
      setRound(1);
      setStars(0);
      runDoneRef.current = 0;
      setTotalTime(0);
    } else {
      roundRef.current += 1;
      setRound((r) => r + 1);
    }
    initPuzzle(roundRef.current);
  };

  const handleHint = () => {
    if (isWonRef.current || hintsLeft < 1) return;
    let m = 0;
    while (
      m < pathRef.current.length &&
      pathRef.current[m] === solutionRef.current[m]
    ) {
      m++;
    }

    if (m < pathRef.current.length) {
      const nextP = pathRef.current.slice(0, m);
      pathRef.current = nextP;
      setPath(nextP);
      setMessage("Backed up to your last correct square.");
    } else {
      setMessage("");
    }

    hintsUsedRef.current += 1;
    setHintsLeft((h) => h - 1);

    const show = solutionRef.current.slice(m, m + 3);
    setHintCells(show);

    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = setTimeout(() => {
      setHintCells([]);
    }, 2000);
  };

  // Generate SVG polyline & wall lines
  const polylinePoints = path
    .map((c) => `${(c % gridSize) + 0.5},${Math.floor(c / gridSize) + 0.5}`)
    .join(" ");

  const wallLines = Object.keys(walls).map((k) => {
    const [aStr, bStr] = k.split("-");
    const a = parseInt(aStr);
    const b = parseInt(bStr);
    const r = Math.floor(a / gridSize);
    const q = a % gridSize;

    if (b === a + 1) {
      // Vertical wall
      return (
        <line
          key={k}
          x1={q + 1}
          y1={r}
          x2={q + 1}
          y2={r + 1}
          stroke="#1e293b"
          strokeWidth="0.12"
          strokeLinecap="round"
        />
      );
    } else {
      // Horizontal wall
      return (
        <line
          key={k}
          x1={q}
          y1={r + 1}
          x2={q + 1}
          y2={r + 1}
          stroke="#1e293b"
          strokeWidth="0.12"
          strokeLinecap="round"
        />
      );
    }
  });

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between w-full px-2 py-2 mb-2 bg-slate-100 rounded-xl text-xs sm:text-sm font-semibold text-slate-700">
        <div>
          ⏱️ {formatTime(elapsedTime)}
          <span className="text-slate-400 font-normal ml-1">
            (Total {formatTime(totalTime + elapsedTime + hintsUsedRef.current * 10000)})
          </span>
        </div>
        <div>
          Round {round}/15 · <span className="text-amber-500 font-bold">★ {stars}</span>
        </div>
        <div className="text-slate-500 font-medium">
          {path.length} / {gridSize * gridSize}
        </div>
      </div>

      {/* Main Interactive Board */}
      <div
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative w-full aspect-square touch-none overflow-hidden rounded-2xl border-4 border-slate-300 bg-slate-200 shadow-xl cursor-pointer"
      >
        {/* Grid Cells */}
        <div
          className="absolute inset-0 grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {Array.from({ length: gridSize * gridSize }, (_, i) => {
            const isFilled = path.includes(i);
            const isHint = hintCells.includes(i);
            return (
              <div
                key={i}
                className={`transition-colors duration-150 rounded-[4px] ${
                  isHint
                    ? "bg-amber-300 ring-2 ring-amber-500 animate-pulse"
                    : isFilled
                    ? "bg-amber-100"
                    : "bg-white"
                }`}
              />
            );
          })}
        </div>

        {/* Path & Walls SVG Overlay */}
        <svg
          viewBox={`0 0 ${gridSize} ${gridSize}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {path.length > 1 && (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="0.32"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          )}
          <g>{wallLines}</g>
        </svg>

        {/* Number Dots */}
        {nums.map((c, i) => {
          const col = c % gridSize;
          const row = Math.floor(c / gridSize);
          const s = 100 / gridSize;
          const leftPercent = (col + 0.5) * s;
          const topPercent = (row + 0.5) * s;
          const isReached = path.includes(c);

          return (
            <div
              key={i}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${s * 0.65}%`,
                height: `${s * 0.65}%`,
              }}
              className={`absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2 rounded-full font-bold shadow-md pointer-events-none transition-transform ${
                isReached
                  ? "bg-amber-500 text-white scale-105"
                  : "bg-slate-800 text-white"
              }`}
            >
              <span className="text-xs sm:text-sm font-black">{i + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Message & Notifications */}
      <div className="min-h-6 mt-3 text-center text-sm font-semibold text-slate-800">
        {message}
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-3 w-full">
        <button
          onClick={handleUndo}
          disabled={isWon || path.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 active:scale-95 disabled:opacity-40 transition-all shadow-sm"
        >
          <Undo2 className="w-3.5 h-3.5" /> Undo
        </button>

        <button
          onClick={handleHint}
          disabled={hintsLeft < 1 || isWon}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 active:scale-95 disabled:opacity-40 transition-all shadow-sm"
        >
          <Lightbulb className="w-3.5 h-3.5" /> Hint ({hintsLeft})
        </button>

        <button
          onClick={handleReset}
          disabled={isWon || path.length === 0}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 active:scale-95 disabled:opacity-40 transition-all shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>

        <button
          onClick={handleNextRound}
          disabled={!isWon}
          className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 active:scale-95 disabled:opacity-40 transition-all shadow-md"
        >
          {round >= 15 ? (
            <>
              <RotateCcw className="w-3.5 h-3.5" /> Play Again
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Next Round
            </>
          )}
        </button>

        {isWon && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 active:scale-95 transition-all shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Save Score
          </button>
        )}
      </div>

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={stars * 100 + round * 50}
        gameId="zip"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
