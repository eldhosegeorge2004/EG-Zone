/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, RotateCcw, MonitorSmartphone } from "lucide-react";

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState({ player: 0, ai: 0 });

  // Game state held in refs to avoid React re-renders in the game loop
  const state = useRef({
    width: 600,
    height: 400,
    paddleWidth: 10,
    paddleHeight: 80,
    playerY: 160,
    aiY: 160,
    ballX: 300,
    ballY: 200,
    ballRadius: 8,
    ballDx: 5,
    ballDy: 5,
    aiSpeed: 4,
    lastTime: 0
  });

  const keys = useRef({ up: false, down: false });

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height, playerY, aiY, paddleWidth, paddleHeight, ballX, ballY, ballRadius } = state.current;

    // Clear canvas with glassmorphic transparency
    ctx.clearRect(0, 0, width, height);

    // Draw center dashed line
    ctx.beginPath();
    ctx.setLineDash([10, 15]);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Draw player paddle (Cyan)
    ctx.fillStyle = "#06b6d4"; // cyan-500
    ctx.beginPath();
    ctx.roundRect(10, playerY, paddleWidth, paddleHeight, 5);
    ctx.fill();

    // Draw AI paddle (Pink)
    ctx.fillStyle = "#ec4899"; // pink-500
    ctx.beginPath();
    ctx.roundRect(width - 20, aiY, paddleWidth, paddleHeight, 5);
    ctx.fill();

    // Draw Ball (White with subtle glow)
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.fillStyle = "#111827"; // gray-900
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset
  }, []);

  const update = useCallback((time: number) => {
    const s = state.current;
    if (!s.lastTime) s.lastTime = time;
    const dt = (time - s.lastTime) / 16; // normalize to 60fps
    s.lastTime = time;

    if (isPlaying) {
      // Keyboard Movement
      if (keys.current.up) s.playerY -= 7 * dt;
      if (keys.current.down) s.playerY += 7 * dt;

      // Move Ball
      s.ballX += s.ballDx * dt;
      s.ballY += s.ballDy * dt;

      // Bounce off top and bottom
      if (s.ballY - s.ballRadius < 0) {
        s.ballY = s.ballRadius;
        s.ballDy *= -1;
      } else if (s.ballY + s.ballRadius > s.height) {
        s.ballY = s.height - s.ballRadius;
        s.ballDy *= -1;
      }

      // Check collision with Player paddle
      if (
        s.ballX - s.ballRadius < 10 + s.paddleWidth &&
        s.ballY > s.playerY &&
        s.ballY < s.playerY + s.paddleHeight
      ) {
        s.ballX = 10 + s.paddleWidth + s.ballRadius;
        s.ballDx *= -1.05; // speed up slightly
        // Add spin based on where it hit
        const hitDelta = (s.ballY - (s.playerY + s.paddleHeight / 2)) / (s.paddleHeight / 2);
        s.ballDy += hitDelta * 3;
      }

      // Check collision with AI paddle
      if (
        s.ballX + s.ballRadius > s.width - 20 &&
        s.ballY > s.aiY &&
        s.ballY < s.aiY + s.paddleHeight
      ) {
        s.ballX = s.width - 20 - s.ballRadius;
        s.ballDx *= -1.05;
        const hitDelta = (s.ballY - (s.aiY + s.paddleHeight / 2)) / (s.paddleHeight / 2);
        s.ballDy += hitDelta * 3;
      }

      // Scoring
      if (s.ballX < 0) {
        // AI scored
        setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
        resetBall(1);
      } else if (s.ballX > s.width) {
        // Player scored
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
        resetBall(-1);
      }

      // Basic AI logic
      const aiCenter = s.aiY + s.paddleHeight / 2;
      // Only move if ball is coming towards AI to make it beatable
      if (s.ballDx > 0) {
        if (aiCenter < s.ballY - 10) {
          s.aiY += s.aiSpeed * dt;
        } else if (aiCenter > s.ballY + 10) {
          s.aiY -= s.aiSpeed * dt;
        }
      } else {
        // Return to center slowly
        if (aiCenter < s.height / 2 - 10) s.aiY += (s.aiSpeed * 0.5) * dt;
        else if (aiCenter > s.height / 2 + 10) s.aiY -= (s.aiSpeed * 0.5) * dt;
      }

      // Clamp paddles
      s.playerY = Math.max(0, Math.min(s.height - s.paddleHeight, s.playerY));
      s.aiY = Math.max(0, Math.min(s.height - s.paddleHeight, s.aiY));
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) draw(ctx);
    }

    requestRef.current = requestAnimationFrame(update);
  }, [isPlaying, draw]);

  const resetBall = (direction: number) => {
    const s = state.current;
    s.ballX = s.width / 2;
    s.ballY = s.height / 2;
    s.ballDx = 5 * direction;
    s.ballDy = (Math.random() * 6) - 3;
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) { keys.current.up = true; e.preventDefault(); }
      if (["ArrowDown", "s", "S"].includes(e.key)) { keys.current.down = true; e.preventDefault(); }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "w", "W"].includes(e.key)) keys.current.up = false;
      if (["ArrowDown", "s", "S"].includes(e.key)) keys.current.down = false;
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Touch and Mouse Controls
  const handleMove = (clientY: number, containerRect: DOMRect) => {
    const s = state.current;
    // Map clientY to canvas coordinates
    const scale = s.height / containerRect.height;
    const y = (clientY - containerRect.top) * scale;
    s.playerY = y - s.paddleHeight / 2;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const container = canvasRef.current?.parentElement;
    if (container) handleMove(e.clientY, container.getBoundingClientRect());
  };

  const startGame = () => {
    setScore({ player: 0, ai: 0 });
    resetBall(1);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[600px] mx-auto">
      
      <div className="w-full flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider text-cyan-600">You</span>
          <span className="text-4xl font-black text-gray-900 leading-none">{score.player}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider text-pink-600">AI</span>
          <span className="text-4xl font-black text-gray-900 leading-none">{score.ai}</span>
        </div>
      </div>

      <div className="relative w-full aspect-[3/2]">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10"></div>
        
        <div 
          className="relative bg-white/50 backdrop-blur-md rounded-3xl border border-gray-200 shadow-xl w-full h-full overflow-hidden flex items-center justify-center cursor-none"
          onPointerMove={onPointerMove}
          style={{ touchAction: 'none' }}
        >
          
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full h-full object-contain"
          />

          {!isPlaying && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl cursor-auto">
               <div className="w-20 h-20 bg-gradient-to-br from-cyan-50 to-pink-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                <MonitorSmartphone className="w-10 h-10 text-cyan-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Pong</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Move your mouse or slide your finger to control the cyan paddle. First to miss loses a point!
              </p>
              <button
                onClick={startGame}
                className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
              >
                Play Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
