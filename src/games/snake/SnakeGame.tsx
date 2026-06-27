/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Pause, Trophy } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: 0 });
  const [nextDirection, setNextDirection] = useState<Point>({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const initGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection({ x: 1, y: 0 });
    setNextDirection({ x: 1, y: 0 });
    setFood({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    });
    setGameOver(false);
    setIsPaused(false);
    setScore(0);
    setShowSubmitModal(false);
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameOver) return;
    
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === " " || e.key === "Escape") {
      setIsPaused((prev) => !prev);
      return;
    }

    setNextDirection((prev) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          return prev.y !== 1 ? { x: 0, y: -1 } : prev;
        case "ArrowDown":
        case "s":
        case "S":
          return prev.y !== -1 ? { x: 0, y: 1 } : prev;
        case "ArrowLeft":
        case "a":
        case "A":
          return prev.x !== 1 ? { x: -1, y: 0 } : prev;
        case "ArrowRight":
        case "d":
        case "D":
          return prev.x !== -1 ? { x: 1, y: 0 } : prev;
        default:
          return prev;
      }
    });
  }, [gameOver]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const saved = localStorage.getItem("snakeHighScore");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    if (isPaused || gameOver) {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
      return;
    }

    const speed = Math.max(50, INITIAL_SPEED - Math.floor(score / 5) * 10);

    gameLoopRef.current = setTimeout(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        setDirection(nextDirection);
        
        if (nextDirection.x === 0 && nextDirection.y === 0) return prevSnake;

        const newHead = {
          x: head.x + nextDirection.x,
          y: head.y + nextDirection.y,
        };

        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          setShowSubmitModal(true);
          return prevSnake;
        }

        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          setShowSubmitModal(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          
          let newFood: Point;
          while (true) {
            newFood = {
              x: Math.floor(Math.random() * GRID_SIZE),
              y: Math.floor(Math.random() * GRID_SIZE),
            };
            if (!newSnake.some(s => s.x === newFood?.x && s.y === newFood?.y)) {
              break;
            }
          }
          setFood(newFood);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, [snake, direction, nextDirection, food, isPaused, gameOver, score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff"; 
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_SIZE; i += CANVAS_SIZE / GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    const cellSize = CANVAS_SIZE / GRID_SIZE;

    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(239, 68, 68, 0.5)";
    ctx.fillStyle = "#ef4444"; 
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2.5,
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? "#10b981" : "#34d399"; 
      ctx.shadowBlur = index === 0 ? 8 : 0;
      ctx.shadowColor = "rgba(16, 185, 129, 0.4)";
      
      if (index === 0) {
        ctx.beginPath();
        ctx.roundRect(
          segment.x * cellSize + 1,
          segment.y * cellSize + 1,
          cellSize - 2,
          cellSize - 2,
          4
        );
        ctx.fill();
      } else {
        ctx.fillRect(
          segment.x * cellSize + 1,
          segment.y * cellSize + 1,
          cellSize - 2,
          cellSize - 2
        );
      }
      ctx.shadowBlur = 0;
    });
  }, [snake, food]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[400px] flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Score</span>
          <span className="text-3xl font-black text-gray-900">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center">
            <Trophy className="w-3 h-3 mr-1 text-amber-500" /> Best
          </span>
          <span className="text-3xl font-black text-amber-500">{highScore}</span>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xl">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="w-full max-w-[400px] aspect-square block"
          />

          {(gameOver || (isPaused && score === 0)) && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              {gameOver ? (
                <>
                  <h2 className="text-3xl font-black text-red-500 mb-2">Game Over!</h2>
                  <p className="text-gray-600 mb-6 font-medium">You scored {score} points.</p>
                  <button
                    onClick={initGame}
                    className="flex items-center bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" /> Play Again
                  </button>
                </>
              ) : (
                <>
                  <div className="p-4 bg-green-100 rounded-full mb-4 shadow-inner">
                    <Play className="w-10 h-10 text-green-600 ml-1" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Ready to Play?</h2>
                  <p className="text-gray-600 text-sm mb-6 max-w-[250px] font-medium">
                    Use the arrow keys or WASD to move. Press Space to pause.
                  </p>
                  <button
                    onClick={initGame}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-green-500/25 hover:scale-105 active:scale-95 transition-all"
                  >
                    Start Game
                  </button>
                </>
              )}
            </div>
          )}

          {isPaused && !gameOver && score > 0 && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <Pause className="w-16 h-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-black text-gray-900 mb-6">Paused</h2>
              <button
                onClick={() => setIsPaused(false)}
                className="flex items-center bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 shadow-md"
              >
                <Play className="w-5 h-5 mr-2" /> Resume
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2 sm:hidden w-[200px]">
        <div />
        <button 
          className="bg-white hover:bg-gray-50 active:bg-gray-100 p-4 rounded-xl flex justify-center items-center shadow-sm border border-gray-200"
          onClick={() => { setNextDirection({x: 0, y: -1}); setIsPaused(false); }}
        >
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-gray-600" />
        </button>
        <div />
        <button 
          className="bg-white hover:bg-gray-50 active:bg-gray-100 p-4 rounded-xl flex justify-center items-center shadow-sm border border-gray-200"
          onClick={() => { setNextDirection({x: -1, y: 0}); setIsPaused(false); }}
        >
          <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-r-[12px] border-t-transparent border-b-transparent border-r-gray-600" />
        </button>
        <button 
          className="bg-white hover:bg-gray-50 active:bg-gray-100 p-4 rounded-xl flex justify-center items-center shadow-sm border border-gray-200"
          onClick={() => { setNextDirection({x: 0, y: 1}); setIsPaused(false); }}
        >
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-gray-600" />
        </button>
        <button 
          className="bg-white hover:bg-gray-50 active:bg-gray-100 p-4 rounded-xl flex justify-center items-center shadow-sm border border-gray-200"
          onClick={() => { setNextDirection({x: 1, y: 0}); setIsPaused(false); }}
        >
          <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[12px] border-t-transparent border-b-transparent border-l-gray-600" />
        </button>
      </div>

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={score}
        gameId="snake"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
