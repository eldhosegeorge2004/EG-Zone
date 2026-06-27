/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, Bird } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

export default function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const state = useRef({
    width: 400,
    height: 600,
    birdY: 300,
    birdDy: 0,
    gravity: 0.4,
    jumpStrength: -7,
    birdSize: 30,
    pipes: [] as { x: number, topHeight: number, passed: boolean }[],
    pipeWidth: 60,
    pipeGap: 150,
    pipeSpeed: 3,
    frames: 0,
    lastTime: 0
  });

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = state.current;
    
    ctx.clearRect(0, 0, s.width, s.height);

    // Draw Pipes
    ctx.fillStyle = "rgba(16, 185, 129, 0.8)"; // emerald-500
    s.pipes.forEach(p => {
      // Top pipe
      ctx.beginPath();
      ctx.roundRect(p.x, 0, s.pipeWidth, p.topHeight, [0, 0, 10, 10]);
      ctx.fill();
      
      // Bottom pipe
      const bottomY = p.topHeight + s.pipeGap;
      ctx.beginPath();
      ctx.roundRect(p.x, bottomY, s.pipeWidth, s.height - bottomY, [10, 10, 0, 0]);
      ctx.fill();
    });

    // Draw Bird
    const bX = 50 + s.birdSize / 2;
    const bY = s.birdY + s.birdSize / 2;
    const r = s.birdSize / 2;

    ctx.save();
    // Rotate bird based on velocity
    ctx.translate(bX, bY);
    const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (s.birdDy * 0.1)));
    ctx.rotate(angle);

    // Body (Yellow)
    ctx.fillStyle = "#eab308"; // yellow-500
    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(234, 179, 8, 0.5)";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Eye (White)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(r * 0.3, -r * 0.3, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Pupil (Black)
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(r * 0.45, -r * 0.3, r * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Beak (Orange)
    ctx.fillStyle = "#f97316"; // orange-500
    ctx.beginPath();
    ctx.moveTo(r * 0.8, 0);
    ctx.lineTo(r * 1.5, r * 0.2);
    ctx.lineTo(r * 0.7, r * 0.6);
    ctx.fill();

    // Wing (Flaps up when jumping)
    ctx.fillStyle = "#fef08a"; // yellow-200
    ctx.beginPath();
    const flapY = s.birdDy < 0 ? -r * 0.2 : r * 0.2;
    const wingAngle = s.birdDy < 0 ? -0.5 : 0.2;
    ctx.ellipse(-r * 0.2, flapY, r * 0.5, r * 0.25, wingAngle, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, []);

  const update = useCallback((time: number) => {
    const s = state.current;
    if (!s.lastTime) s.lastTime = time;
    const dt = (time - s.lastTime) / 16;
    s.lastTime = time;

    if (isPlaying && !isGameOver) {
      s.frames += dt;
      
      // Bird Physics
      s.birdDy += s.gravity * dt;
      s.birdY += s.birdDy * dt;

      // Generate Pipes
      if (s.frames > 90) {
        s.frames = 0;
        const minHeight = 50;
        const maxHeight = s.height - s.pipeGap - 50;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        s.pipes.push({ x: s.width, topHeight, passed: false });
      }

      // Move Pipes and Check Collisions
      for (let i = s.pipes.length - 1; i >= 0; i--) {
        const p = s.pipes[i];
        p.x -= s.pipeSpeed * dt;

        // Collision Check
        const birdRight = 50 + s.birdSize;
        const birdBottom = s.birdY + s.birdSize;
        
        if (
          birdRight > p.x && 
          50 < p.x + s.pipeWidth &&
          (s.birdY < p.topHeight || birdBottom > p.topHeight + s.pipeGap)
        ) {
          setIsGameOver(true);
          setShowSubmitModal(true);
        }

        // Score
        if (!p.passed && p.x + s.pipeWidth < 50) {
          p.passed = true;
          setScore(prev => prev + 1);
        }

        // Remove offscreen pipes
        if (p.x + s.pipeWidth < 0) {
          s.pipes.splice(i, 1);
        }
      }

      // Floor / Ceiling Collision
      if (s.birdY > s.height - s.birdSize || s.birdY < 0) {
        setIsGameOver(true);
        setShowSubmitModal(true);
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) draw(ctx);
    }

    requestRef.current = requestAnimationFrame(update);
  }, [isPlaying, isGameOver, draw]);

  const jump = useCallback(() => {
    if (!isPlaying || isGameOver) return;
    state.current.birdDy = state.current.jumpStrength;
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [jump]);

  const startGame = () => {
    const s = state.current;
    s.birdY = 300;
    s.birdDy = 0;
    s.pipes = [];
    s.frames = 0;
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[400px] mx-auto">
      
      <div className="w-full flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider text-emerald-600">Score</span>
          <span className="text-4xl font-black text-gray-900 leading-none">{score}</span>
        </div>
      </div>

      <div className="relative w-full aspect-[2/3]">
        <div className="absolute -inset-1 bg-gradient-to-b from-sky-300 to-emerald-400 rounded-3xl blur opacity-20 transition duration-1000 -z-10"></div>
        
        <div 
          className="relative bg-white/40 backdrop-blur-md rounded-3xl border border-gray-200 shadow-xl w-full h-full overflow-hidden flex items-center justify-center cursor-pointer"
          onPointerDown={(e) => { e.preventDefault(); jump(); }}
          style={{ touchAction: 'none' }}
        >
          
          <canvas
            ref={canvasRef}
            width={400}
            height={600}
            className="w-full h-full object-contain"
          />

          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center cursor-auto">
               <div className="w-20 h-20 bg-gradient-to-br from-yellow-50 to-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                <Bird className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Flappy Block</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Tap the screen, click, or press Space to jump. Navigate through the glass pipes to score!
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
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Crash!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                You passed <span className="font-black text-emerald-600 text-xl">{score}</span> pipes.
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); startGame(); }}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Try Again
              </button>
            </div>
          )}
        </div>
      </div>
      
      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={score}
        gameId="flappy"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
