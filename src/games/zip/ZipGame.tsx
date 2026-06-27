"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RotateCcw, Trophy, Waypoints } from "lucide-react";

const LEVELS = [
  // Level 1: 3x3
  [
    [1, 0, 0],
    [0, 0, 2],
    [3, 0, 4]
  ],
  // Level 2: 4x4
  [
    [1, 0, 0, 0],
    [0, 0, 2, 0],
    [0, 3, 0, 0],
    [4, 0, 0, 0]
  ],
  // Level 3: 4x5
  [
    [1, 0, 0, 0, 2],
    [3, 0, 0, 0, 0],
    [0, 0, 0, 4, 0],
    [5, 0, 0, 0, 0]
  ],
  // Level 4: 5x5
  [
    [1, 0, 0, 0, 2],
    [5, 0, 0, 6, 0],
    [0, 7, 8, 0, 0],
    [0, 0, 0, 0, 0],
    [4, 0, 0, 0, 3]
  ],
  // Level 5: 6x6
  [
    [1, 0, 0, 0, 0, 6],
    [0, 0, 0, 0, 0, 0],
    [0, 3, 0, 0, 0, 0],
    [0, 0, 0, 4, 0, 0],
    [2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 5, 0]
  ]
];

type Pos = { r: number; c: number };

export default function ZipGame() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [grid, setGrid] = useState<number[][]>(LEVELS[0]);
  const [path, setPath] = useState<Pos[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [maxNumber, setMaxNumber] = useState(0);

  const startGame = useCallback(() => {
    const currentGrid = LEVELS[levelIdx];
    setGrid(currentGrid);
    
    // Find starting position (1)
    let startPos: Pos = { r: 0, c: 0 };
    let maxNum = 0;
    
    const rows = currentGrid.length;
    const cols = currentGrid[0].length;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (currentGrid[r][c] === 1) startPos = { r, c };
        if (currentGrid[r][c] > maxNum) maxNum = currentGrid[r][c];
      }
    }
    
    setMaxNumber(maxNum);
    setPath([startPos]);
    setIsPlaying(true);
    setIsWon(false);
    setIsDragging(false);
  }, [levelIdx]);

  const handlePointerDown = (r: number, c: number) => {
    if (!isPlaying || isWon) return;
    setIsDragging(true);
    tryMove(r, c);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerEnter = (r: number, c: number) => {
    if (!isDragging || !isPlaying || isWon) return;
    tryMove(r, c);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isPlaying || isWon) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const rStr = element.getAttribute("data-r");
      const cStr = element.getAttribute("data-c");
      if (rStr !== null && cStr !== null) {
        tryMove(parseInt(rStr), parseInt(cStr));
      }
    }
  };

  const tryMove = (r: number, c: number) => {
    const last = path[path.length - 1];
    const prev = path.length > 1 ? path[path.length - 2] : null;

    // Undo logic: if moving back to the previous cell
    if (prev && prev.r === r && prev.c === c) {
      setPath(p => p.slice(0, -1));
      return;
    }

    // Must be adjacent
    const isAdjacent = (Math.abs(last.r - r) === 1 && last.c === c) || 
                       (Math.abs(last.c - c) === 1 && last.r === r);
    
    if (!isAdjacent) return;

    // Check if cell is already in path
    if (path.some(p => p.r === r && p.c === c)) return;

    // Validation: Are we hitting the correct next number?
    let currentMaxFound = 1;
    for (const p of path) {
      if (grid[p.r][p.c] > currentMaxFound) {
        currentMaxFound = grid[p.r][p.c];
      }
    }

    const targetCellVal = grid[r][c];
    if (targetCellVal !== 0) {
      if (targetCellVal !== currentMaxFound + 1) {
        return; // Invalid move, skipped a number or hit wrong number
      }
    }

    // Valid move, add to path
    const newPath = [...path, { r, c }];
    setPath(newPath);

    // Check win condition
    const rows = grid.length;
    const cols = grid[0].length;
    const totalCells = rows * cols;
    
    if (newPath.length === totalCells) {
      let foundMax = 1;
      for (const p of newPath) {
        if (grid[p.r][p.c] > foundMax) foundMax = grid[p.r][p.c];
      }
      if (foundMax === maxNumber) {
        setIsWon(true);
        setIsDragging(false);
        setTimeout(() => {
          if (levelIdx < LEVELS.length - 1) {
            setLevelIdx(l => l + 1);
            setTimeout(startGame, 100);
          }
        }, 2000);
      }
    }
  };

  const rows = grid.length;
  const cols = grid[0].length;
  const cellWidth = 100 / cols;
  const cellHeight = 100 / rows;

  return (
    <div 
      className="flex flex-col items-center select-none"
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchEnd={handlePointerUp}
    >
      <div className="w-full max-w-[450px] flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Level</span>
          <span className="text-3xl font-black text-gray-900 leading-none mt-1">{levelIdx + 1} / {LEVELS.length}</span>
        </div>
        <button
          onClick={startGame}
          className="flex items-center text-sm font-bold text-gray-500 hover:text-cyan-600 transition-colors bg-gray-50 px-4 py-2 rounded-lg border border-gray-200"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Reset Path
        </button>
      </div>

      <div className="relative w-full max-w-[450px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10"></div>
        
        <div className="relative bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xl w-full flex flex-col items-center justify-center">
          
          {!isPlaying && !isWon && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
               <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-cyan-100">
                <Waypoints className="w-10 h-10 text-cyan-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Zip</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Connect the numbers in sequential order (1 to N) using a single, continuous line that fills every square.
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
              >
                Start Puzzle
              </button>
            </div>
          )}

          {isWon && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-100">
                <Trophy className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Level Complete!</h2>
              {levelIdx < LEVELS.length - 1 ? (
                <p className="text-gray-500 text-lg mb-8 font-medium animate-pulse text-cyan-600">
                  Loading next level...
                </p>
              ) : (
                <>
                  <p className="text-gray-500 text-lg mb-8 font-medium">
                    You beat all {LEVELS.length} levels!
                  </p>
                  <button
                    onClick={() => { setLevelIdx(0); setTimeout(startGame, 100); }}
                    className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full max-w-[250px]"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" /> Play Again
                  </button>
                </>
              )}
            </div>
          )}

          {/* Grid */}
          <div className="w-full aspect-square relative bg-gray-50 rounded-xl p-2 sm:p-3 shadow-inner border-2 border-gray-100">
            {/* Draw Path Lines using SVGs overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ padding: '12px' }}>
              {path.map((p, i) => {
                if (i === 0) return null;
                const prev = path[i - 1];
                const x1 = `${(prev.c * cellWidth) + (cellWidth / 2)}%`;
                const y1 = `${(prev.r * cellHeight) + (cellHeight / 2)}%`;
                const x2 = `${(p.c * cellWidth) + (cellWidth / 2)}%`;
                const y2 = `${(p.r * cellHeight) + (cellHeight / 2)}%`;
                return (
                  <line 
                    key={i} 
                    x1={x1} y1={y1} x2={x2} y2={y2} 
                    stroke="#06b6d4" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    className="opacity-80 drop-shadow-md"
                  />
                );
              })}
            </svg>

            <div 
              className="grid gap-1 sm:gap-2 w-full h-full relative z-20"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                touchAction: 'none'
              }}
              onTouchMove={handleTouchMove}
            >
              {grid.map((row, r) => (
                row.map((val, c) => {
                  const isInPath = path.some(p => p.r === r && p.c === c);
                  const isLast = path.length > 0 && path[path.length - 1].r === r && path[path.length - 1].c === c;
                  
                  // Dynamically adjust text size based on grid density
                  const textSize = cols > 5 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl";

                  return (
                    <div
                      key={`${r}-${c}`}
                      data-r={r}
                      data-c={c}
                      onPointerDown={() => handlePointerDown(r, c)}
                      onPointerEnter={() => handlePointerEnter(r, c)}
                      className={`
                        flex items-center justify-center font-black ${textSize} rounded-lg sm:rounded-xl transition-all duration-150 cursor-pointer
                        ${val !== 0 ? 'border-2' : 'border'}
                        ${isInPath 
                          ? 'bg-cyan-100 border-cyan-400 text-cyan-700 shadow-inner' 
                          : val !== 0 
                            ? 'bg-white border-gray-300 text-gray-800 shadow-sm hover:shadow' 
                            : 'bg-white border-gray-100 text-transparent hover:bg-gray-50'
                        }
                        ${isLast ? 'ring-4 ring-cyan-400/30 ring-offset-1 scale-95' : ''}
                      `}
                    >
                      {val !== 0 ? val : ""}
                    </div>
                  );
                })
              ))}
            </div>
          </div>
          
          <p className="mt-6 text-gray-400 text-sm font-medium text-center">
            Click and drag from <span className="font-bold text-cyan-600">1</span> to connect all numbers in order.
          </p>

        </div>
      </div>
    </div>
  );
}
