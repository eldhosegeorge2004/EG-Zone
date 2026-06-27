/* eslint-disable */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RotateCcw, Trophy, Crosshair, Timer } from "lucide-react";

type Target = {
  id: number;
  x: number;
  y: number;
  size: number;
};

export default function AimTrainer() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [targets, setTargets] = useState<Target[]>([]);
  const targetIdCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("aimBestScore");
    if (saved) setBestScore(parseInt(saved));
  }, []);

  const spawnTarget = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const size = 40; // 40px target
    
    // Ensure target stays within bounds (with padding)
    const padding = 10;
    const maxX = container.width - size - padding;
    const maxY = container.height - size - padding;
    
    const x = Math.max(padding, Math.floor(Math.random() * maxX));
    const y = Math.max(padding, Math.floor(Math.random() * maxY));
    
    const newTarget: Target = {
      id: targetIdCounter.current++,
      x,
      y,
      size,
    };
    
    setTargets([newTarget]); // Only one target at a time
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30); // 30 second sprint
    setIsPlaying(true);
    setIsGameOver(false);
    setTargets([]);
    setTimeout(() => spawnTarget(), 100);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      setIsGameOver(true);
      setTargets([]);
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem("aimBestScore", score.toString());
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, score, bestScore]);

  const handleTargetClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent container click
    if (!isPlaying) return;
    
    setScore(s => s + 1);
    spawnTarget();
  };

  const handleMissClick = () => {
    if (!isPlaying) return;
    // Penalty for missing: lose 1 score (min 0)
    setScore(s => Math.max(0, s - 1));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[700px] flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Score</span>
          <span className="text-3xl font-black text-gray-900 leading-none mt-1">{score}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center">
            <Timer className="w-3 h-3 mr-1 text-red-500" /> Time
          </span>
          <span className={`text-3xl font-black leading-none mt-1 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-900'}`}>
            {timeLeft}s
          </span>
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

      <div className="relative w-full max-w-[700px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-rose-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10"></div>
        
        <div 
          ref={containerRef}
          onMouseDown={handleMissClick}
          className="relative bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl h-[450px] w-full flex flex-col items-center justify-center overflow-hidden cursor-crosshair"
        >
          
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl cursor-default">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                <Crosshair className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Aim Trainer</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Click the targets as fast as you can. Missing a target costs 1 point! You have 30 seconds.
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
              >
                Start Trainer
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl cursor-default">
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-rose-100">
                <Trophy className="w-12 h-12 text-rose-500" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Time's Up!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                You hit <span className="font-black text-red-600 text-xl">{score}</span> targets.
              </p>
              <button
                onClick={startGame}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full max-w-[250px]"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Play Again
              </button>
            </div>
          )}

          {isPlaying && targets.map(target => (
            <div
              key={target.id}
              onMouseDown={(e) => handleTargetClick(e, target.id)}
              className="absolute bg-red-500 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              style={{
                left: `${target.x}px`,
                top: `${target.y}px`,
                width: `${target.size}px`,
                height: `${target.size}px`,
                boxShadow: '0 0 0 6px rgba(239, 68, 68, 0.2), inset 0 0 0 4px white, inset 0 0 0 10px rgba(239, 68, 68, 1)'
              }}
            />
          ))}

        </div>
      </div>
    </div>
  );
}
