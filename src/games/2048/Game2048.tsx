/* eslint-disable */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RotateCcw, Trophy, Grid3X3 } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

const GRID_SIZE = 4;

type Grid = number[][];

export default function Game2048() {
  const [grid, setGrid] = useState<Grid>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [hasContinued, setHasContinued] = useState(false); // If player wants to play after 2048
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bestScore2048");
    if (saved) setBestScore(parseInt(saved));
    
    // Empty grid on mount so Start screen shows properly
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
  }, []);

  const getEmptyCells = (currentGrid: Grid) => {
    const emptyCells: {r: number, c: number}[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (currentGrid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    return emptyCells;
  };

  const spawnTile = (currentGrid: Grid) => {
    const emptyCells = getEmptyCells(currentGrid);
    if (emptyCells.length === 0) return currentGrid;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map(row => [...row]);
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  const startGame = useCallback(() => {
    let initialGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    initialGrid = spawnTile(initialGrid);
    initialGrid = spawnTile(initialGrid);
    setGrid(initialGrid);
    setScore(0);
    setIsPlaying(true);
    setIsGameOver(false);
    setIsWon(false);
    setHasContinued(false);
    setShowSubmitModal(false);
  }, []);

  const move = useCallback((direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    if (!isPlaying || isGameOver || (isWon && !hasContinued)) return;

    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let addedScore = 0;

    const slideAndMerge = (row: number[]) => {
      // 1. Remove zeros
      let filtered = row.filter(val => val !== 0);
      // 2. Merge adjacent
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] !== 0 && filtered[i] === filtered[i + 1]) {
          filtered[i] *= 2;
          addedScore += filtered[i];
          filtered.splice(i + 1, 1); // Remove merged item
        }
      }
      // 3. Fill zeros
      while (filtered.length < GRID_SIZE) filtered.push(0);
      return filtered;
    };

    if (direction === "LEFT" || direction === "RIGHT") {
      for (let r = 0; r < GRID_SIZE; r++) {
        let row = newGrid[r];
        if (direction === "RIGHT") row.reverse();
        
        let newRow = slideAndMerge(row);
        
        if (direction === "RIGHT") newRow.reverse();
        newGrid[r] = newRow;
        if (newGrid[r].join(",") !== grid[r].join(",")) moved = true;
      }
    } else {
      for (let c = 0; c < GRID_SIZE; c++) {
        let col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
        if (direction === "DOWN") col.reverse();
        
        let newCol = slideAndMerge(col);
        
        if (direction === "DOWN") newCol.reverse();
        
        for (let r = 0; r < GRID_SIZE; r++) {
          if (newGrid[r][c] !== newCol[r]) moved = true;
          newGrid[r][c] = newCol[r];
        }
      }
    }

    if (moved) {
      const finalGrid = spawnTile(newGrid);
      setGrid(finalGrid);
      setScore(s => {
        const newScore = s + addedScore;
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem("bestScore2048", newScore.toString());
        }
        return newScore;
      });

      // Check win
      if (!isWon && finalGrid.some(row => row.includes(2048))) {
        setIsWon(true);
      }

      // Check game over
      if (getEmptyCells(finalGrid).length === 0) {
        let canMove = false;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (
              (r < GRID_SIZE - 1 && finalGrid[r][c] === finalGrid[r+1][c]) ||
              (c < GRID_SIZE - 1 && finalGrid[r][c] === finalGrid[r][c+1])
            ) {
              canMove = true;
            }
          }
        }
        if (!canMove) {
          setIsGameOver(true);
          setShowSubmitModal(true);
        }
      }
    }
  }, [grid, isPlaying, isGameOver, isWon, hasContinued, bestScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W": move("UP"); break;
        
        case "ArrowDown":
        case "s":
        case "S": move("DOWN"); break;
        
        case "ArrowLeft":
        case "a":
        case "A": move("LEFT"); break;
        
        case "ArrowRight":
        case "d":
        case "D": move("RIGHT"); break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  // Unified Pointer support for swiping (works for Touch AND Mouse)
  const pointerStartRef = useRef<{x: number, y: number} | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    
    const x = e.clientX;
    const y = e.clientY;
    
    const dx = x - pointerStartRef.current.x;
    const dy = y - pointerStartRef.current.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) {
        if (dx > 0) move("RIGHT");
        else move("LEFT");
      }
    } else {
      if (Math.abs(dy) > 30) {
        if (dy > 0) move("DOWN");
        else move("UP");
      }
    }
    pointerStartRef.current = null;
  };

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return "bg-gray-100 text-gray-700";
      case 4: return "bg-orange-50 text-orange-800";
      case 8: return "bg-orange-200 text-orange-900";
      case 16: return "bg-orange-400 text-white shadow-sm";
      case 32: return "bg-red-400 text-white shadow-sm";
      case 64: return "bg-red-500 text-white shadow-md";
      case 128: return "bg-yellow-400 text-white shadow-md shadow-yellow-400/30 text-3xl";
      case 256: return "bg-yellow-500 text-white shadow-md shadow-yellow-500/40 text-3xl";
      case 512: return "bg-yellow-600 text-white shadow-lg shadow-yellow-600/50 text-3xl";
      case 1024: return "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 text-2xl sm:text-3xl";
      case 2048: return "bg-emerald-600 text-white shadow-xl shadow-emerald-600/60 text-2xl sm:text-3xl";
      default: 
        if (val > 2048) return "bg-black text-white shadow-xl text-2xl sm:text-3xl";
        return "bg-transparent";
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      <div className="w-full max-w-[450px] flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Score</span>
          <span className="text-3xl font-black text-gray-900 leading-none mt-1">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center">
            <Trophy className="w-3 h-3 mr-1 text-amber-500" /> Best
          </span>
          <span className="text-3xl font-black text-amber-500 leading-none mt-1">
            {bestScore}
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-[450px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10"></div>
        
        <div 
          className="relative bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xl w-full flex flex-col items-center justify-center overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'none' }} // Prevent scrolling when swiping
        >
          
          {/* Overlays */}
          {!isPlaying && !isGameOver && !isWon && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
               <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-yellow-100">
                <Grid3X3 className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">2048</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Swipe or use WASD / Arrow Keys to merge matching tiles and reach 2048!
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
              >
                Start Game
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Game Over!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                Final Score: <span className="font-black text-orange-600 text-xl">{score}</span>
              </p>
              <button
                onClick={startGame}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full max-w-[250px]"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Try Again
              </button>
            </div>
          )}

          {isWon && !hasContinued && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6 shadow-inner border border-yellow-200">
                <Trophy className="w-12 h-12 text-yellow-500" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">You Win!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                You reached the 2048 tile!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button
                  onClick={() => setHasContinued(true)}
                  className="bg-gray-100 text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
                >
                  Keep Playing
                </button>
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition-all"
                >
                  New Game
                </button>
              </div>
            </div>
          )}

          {/* Board */}
          <div className="w-full aspect-square relative bg-gray-200/60 rounded-xl p-2 sm:p-3 shadow-inner">
            <div className="grid grid-cols-4 grid-rows-4 gap-2 sm:gap-3 w-full h-full">
              {/* Background Grid */}
              {Array(16).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-200/80 rounded-lg w-full h-full"></div>
              ))}
              
              {/* Active Tiles */}
              {grid.map((row, r) => (
                row.map((val, c) => {
                  if (val === 0) return null;
                  return (
                    <div
                      key={`${r}-${c}-${val}`}
                      className={`absolute flex items-center justify-center font-black rounded-lg transition-all duration-150 ease-in-out ${getTileColor(val)}`}
                      style={{
                        width: 'calc(25% - 0.75rem)',
                        height: 'calc(25% - 0.75rem)',
                        left: `calc(${c * 25}% + 0.375rem)`,
                        top: `calc(${r * 25}% + 0.375rem)`,
                        fontSize: val >= 1000 ? '1.5rem' : '2rem'
                      }}
                    >
                      {val}
                    </div>
                  );
                })
              ))}
            </div>
          </div>
          
          <p className="mt-6 text-gray-400 text-sm font-medium">
            Use <span className="font-bold text-gray-600">Arrow Keys / WASD</span> or <span className="font-bold text-gray-600">Swipe</span> to move tiles.
          </p>

        </div>
      </div>
      
      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={score}
        gameId="2048"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
