/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Box, Trophy, ArrowLeft, ArrowRight } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  color: string;
};

const BRICK_ROWS = 5;
const BRICK_COLS = 7;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT = 20;

export default function BreakerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [score, setScore] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const state = useRef({
    width: 600,
    height: 600,
    paddleW: 100,
    paddleH: 15,
    paddleX: 250,
    ballX: 300,
    ballY: 500,
    ballDx: 4,
    ballDy: -4,
    ballRadius: 8,
    bricks: [] as Brick[],
    lastTime: 0,
    movingLeft: false,
    movingRight: false,
  });

  const initBricks = useCallback(() => {
    const s = state.current;
    s.bricks = [];
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4"];
    
    // Calculate brick width based on canvas width
    const brickW = (s.width - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLS - 1))) / BRICK_COLS;
    
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        s.bricks.push({
          x: c * (brickW + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (20 + BRICK_PADDING) + BRICK_OFFSET_TOP,
          w: brickW,
          h: 20,
          active: true,
          color: colors[r]
        });
      }
    }
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = state.current;
    ctx.clearRect(0, 0, s.width, s.height);

    // Draw Bricks
    s.bricks.forEach(b => {
      if (b.active) {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 4);
        ctx.fill();
        
        // Glassy highlight
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.beginPath();
        ctx.roundRect(b.x + 2, b.y + 2, b.w - 4, b.h / 2, 2);
        ctx.fill();
      }
    });

    // Draw Paddle
    ctx.fillStyle = "#3b82f6"; // blue-500
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(59, 130, 246, 0.5)";
    ctx.beginPath();
    ctx.roundRect(s.paddleX, s.height - s.paddleH - 20, s.paddleW, s.paddleH, 8);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Ball
    ctx.fillStyle = "#111827"; // gray-900
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, s.ballRadius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const update = useCallback((time: number) => {
    const s = state.current;
    if (!s.lastTime) s.lastTime = time;
    const dt = (time - s.lastTime) / 16;
    s.lastTime = time;

    if (isPlaying && !isGameOver && !isWon) {
      // Move Paddle based on buttons
      if (s.movingLeft) {
        s.paddleX = Math.max(0, s.paddleX - 8 * dt);
      }
      if (s.movingRight) {
        s.paddleX = Math.min(s.width - s.paddleW, s.paddleX + 8 * dt);
      }

      // Move Ball
      s.ballX += s.ballDx * dt;
      s.ballY += s.ballDy * dt;

      // Wall Collisions
      if (s.ballX + s.ballRadius > s.width) {
        s.ballX = s.width - s.ballRadius;
        s.ballDx = -s.ballDx;
      } else if (s.ballX - s.ballRadius < 0) {
        s.ballX = s.ballRadius;
        s.ballDx = -s.ballDx;
      }

      if (s.ballY - s.ballRadius < 0) {
        s.ballY = s.ballRadius;
        s.ballDy = -s.ballDy;
      } else if (s.ballY + s.ballRadius > s.height) {
        setIsGameOver(true);
        setShowSubmitModal(true);
      }

      // Paddle Collision
      const paddleY = s.height - s.paddleH - 20;
      if (
        s.ballY + s.ballRadius > paddleY &&
        s.ballY - s.ballRadius < paddleY + s.paddleH &&
        s.ballX > s.paddleX &&
        s.ballX < s.paddleX + s.paddleW
      ) {
        s.ballDy = -Math.abs(s.ballDy); // Force up
        // Add english (spin) based on hit position
        const hitPoint = s.ballX - (s.paddleX + s.paddleW / 2);
        s.ballDx = (hitPoint / (s.paddleW / 2)) * 5;
      }

      // Brick Collision
      let hitBrick = false;
      for (const b of s.bricks) {
        if (b.active) {
          if (
            s.ballX + s.ballRadius > b.x &&
            s.ballX - s.ballRadius < b.x + b.w &&
            s.ballY + s.ballRadius > b.y &&
            s.ballY - s.ballRadius < b.y + b.h
          ) {
            s.ballDy = -s.ballDy;
            b.active = false;
            hitBrick = true;
            setScore(prev => prev + 10);
            break; // Only hit one brick per frame
          }
        }
      }

      // Check Win
      if (hitBrick) {
        if (s.bricks.every(b => !b.active)) {
          setIsWon(true);
          setShowSubmitModal(true);
        }
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) draw(ctx);
    }

    requestRef.current = requestAnimationFrame(update);
  }, [isPlaying, isGameOver, isWon, draw]);

  useEffect(() => {
    initBricks();
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [initBricks, update]);

  // Input
  const handleMove = (clientX: number, containerRect: DOMRect) => {
    // Only use pointer move if they aren't using buttons
    if (state.current.movingLeft || state.current.movingRight) return;
    const s = state.current;
    const scale = s.width / containerRect.width;
    const x = (clientX - containerRect.left) * scale;
    s.paddleX = Math.max(0, Math.min(s.width - s.paddleW, x - s.paddleW / 2));
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const container = canvasRef.current?.parentElement;
    if (container) handleMove(e.clientX, container.getBoundingClientRect());
  };

  const startGame = () => {
    const s = state.current;
    initBricks();
    s.ballX = 300;
    s.ballY = 500;
    s.ballDx = 4;
    s.ballDy = -5;
    s.paddleX = 250;
    setScore(0);
    setIsGameOver(false);
    setIsWon(false);
    setIsPlaying(true);
    setShowSubmitModal(false);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[600px] mx-auto">
      
      <div className="w-full flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider text-blue-600">Score</span>
          <span className="text-4xl font-black text-gray-900 leading-none">{score}</span>
        </div>
      </div>

      <div className="relative w-full aspect-square">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur opacity-20 transition duration-1000 -z-10"></div>
        
        <div 
          className="relative bg-white/60 backdrop-blur-md rounded-3xl border border-gray-200 shadow-xl w-full h-full overflow-hidden flex items-center justify-center cursor-none"
          onPointerMove={onPointerMove}
          style={{ touchAction: 'none' }}
        >
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="w-full h-full object-contain"
          />

          {!isPlaying && !isGameOver && !isWon && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center cursor-auto">
               <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                <Box className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Brick Breaker</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Slide your mouse or finger to move the paddle. Break all the glass bricks without dropping the ball!
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full"
              >
                Start Game
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center cursor-auto">
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Game Over!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                Final Score: <span className="font-black text-blue-600 text-xl">{score}</span>
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Try Again
              </button>
            </div>
          )}

          {isWon && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center cursor-auto">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-100">
                <Trophy className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">You Win!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                You broke all the bricks! Score: <span className="font-black text-blue-600 text-xl">{score}</span>
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Play Again
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Controls */}
      <div className="w-full flex justify-between gap-4 mt-6">
        <button
          className="flex-1 bg-white border border-gray-200 shadow-sm text-gray-700 py-6 rounded-2xl flex justify-center items-center active:bg-gray-100 touch-manipulation"
          onPointerDown={() => state.current.movingLeft = true}
          onPointerUp={() => state.current.movingLeft = false}
          onPointerLeave={() => state.current.movingLeft = false}
        >
          <ArrowLeft className="w-8 h-8" />
        </button>
        <button
          className="flex-1 bg-white border border-gray-200 shadow-sm text-gray-700 py-6 rounded-2xl flex justify-center items-center active:bg-gray-100 touch-manipulation"
          onPointerDown={() => state.current.movingRight = true}
          onPointerUp={() => state.current.movingRight = false}
          onPointerLeave={() => state.current.movingRight = false}
        >
          <ArrowRight className="w-8 h-8" />
        </button>
      </div>
      
      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={score}
        gameId="breaker"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
