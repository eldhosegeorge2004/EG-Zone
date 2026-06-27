/* eslint-disable */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RotateCcw, Check, X, Palette, Timer } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

const COLORS = [
  { name: "RED", hex: "#ef4444" },    // red-500
  { name: "BLUE", hex: "#3b82f6" },   // blue-500
  { name: "GREEN", hex: "#22c55e" },  // green-500
  { name: "YELLOW", hex: "#eab308" }, // yellow-500
  { name: "PURPLE", hex: "#a855f7" }, // purple-500
  { name: "ORANGE", hex: "#f97316" }  // orange-500
];

const INITIAL_TIME_MS = 2500;
const MIN_TIME_MS = 800;
const DECREMENT_MS = 50;

export default function ColorMatchGame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [score, setScore] = useState(0);
  
  // Current game state
  const [textWord, setTextWord] = useState(COLORS[0]);
  const [textColor, setTextColor] = useState(COLORS[0]);
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_MS);
  const [maxTime, setMaxTime] = useState(INITIAL_TIME_MS);

  // Use refs for animation frames
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  const generateRound = useCallback((currentScore: number) => {
    // 50% chance to match
    const shouldMatch = Math.random() > 0.5;
    
    const wordIdx = Math.floor(Math.random() * COLORS.length);
    const colorIdx = shouldMatch ? wordIdx : Math.floor(Math.random() * COLORS.length);
    
    // If it shouldn't match but randomly picked the same, adjust it
    let finalColorIdx = colorIdx;
    if (!shouldMatch && finalColorIdx === wordIdx) {
      finalColorIdx = (finalColorIdx + 1) % COLORS.length;
    }

    setTextWord(COLORS[wordIdx]);
    setTextColor(COLORS[finalColorIdx]);

    // Speed up as score increases
    const newMaxTime = Math.max(MIN_TIME_MS, INITIAL_TIME_MS - (currentScore * DECREMENT_MS));
    setMaxTime(newMaxTime);
    setTimeLeft(newMaxTime);
    lastTimeRef.current = performance.now();
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    generateRound(0);
  }, [generateRound]);

  const handleAnswer = useCallback((userSaidMatch: boolean) => {
    if (!isPlaying || isGameOver) return;

    const actualMatch = textWord.name === textColor.name;
    
    if (userSaidMatch === actualMatch) {
      // Correct!
      const newScore = score + 1;
      setScore(newScore);
      generateRound(newScore);
    } else {
      // Wrong!
      setIsGameOver(true);
      setIsPlaying(false);
      setShowSubmitModal(true);
    }
  }, [isPlaying, isGameOver, textWord, textColor, score, generateRound]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      if (e.key === "ArrowLeft") handleAnswer(true);
      if (e.key === "ArrowRight") handleAnswer(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isGameOver, handleAnswer]);

  // Timer loop
  const updateTimer = useCallback((time: number) => {
    if (!isPlaying || isGameOver) return;

    if (lastTimeRef.current !== undefined) {
      const dt = time - lastTimeRef.current;
      setTimeLeft(prev => {
        const nextTime = prev - dt;
        if (nextTime <= 0) {
          setIsGameOver(true);
          setIsPlaying(false);
          setShowSubmitModal(true);
          return 0;
        }
        return nextTime;
      });
    }
    
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(updateTimer);
  }, [isPlaying, isGameOver]);

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(updateTimer);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, updateTimer]);

  const progressPercentage = Math.max(0, (timeLeft / maxTime) * 100);
  let progressColor = "bg-green-500";
  if (progressPercentage < 50) progressColor = "bg-yellow-500";
  if (progressPercentage < 20) progressColor = "bg-red-500";

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[450px] mx-auto font-sans">
      
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider text-indigo-600">Score</span>
          <span className="text-4xl font-black text-gray-900 leading-none">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider text-rose-600">Time</span>
          <div className="flex items-center gap-1 text-gray-900">
            <Timer className="w-5 h-5 text-gray-400" />
            <span className="text-xl font-bold w-12 text-right">{(timeLeft / 1000).toFixed(1)}s</span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative w-full aspect-square">
        <div className="absolute -inset-1 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-3xl blur opacity-20 transition duration-1000 -z-10"></div>
        
        <div className="relative bg-white/70 backdrop-blur-md rounded-3xl border border-gray-200 shadow-xl w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center overflow-hidden">
          
          {/* Progress Bar (Timer) */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
            <div 
              className={`h-full transition-all duration-75 ease-linear ${progressColor}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl cursor-auto">
               <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                <Palette className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Color Match</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Does the <strong>meaning</strong> of the word match the <strong>color</strong> of the text? Think fast!
              </p>
              <button
                onClick={startGame}
                className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full"
              >
                Start Game
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl cursor-auto animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                <span className="text-4xl">🧠</span>
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Brain Fried!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                Final Score: <span className="font-black text-indigo-600 text-xl">{score}</span>
              </p>
              <button
                onClick={startGame}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Try Again
              </button>
            </div>
          )}

          {/* Active Game UI */}
          {isPlaying && (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="flex-1 flex items-center justify-center">
                <h1 
                  className="text-6xl sm:text-7xl font-black tracking-tighter uppercase text-center"
                  style={{ color: textColor.hex, textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >
                  {textWord.name}
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mt-auto">
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex flex-col items-center justify-center py-6 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 rounded-2xl transition-all active:scale-95 group"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:shadow transition-shadow">
                    <Check className="w-6 h-6 text-green-600 stroke-[3]" />
                  </div>
                  <span className="font-bold text-green-700">Yes (Match)</span>
                  <span className="text-xs text-green-600/60 mt-1 hidden sm:block">Left Arrow</span>
                </button>

                <button
                  onClick={() => handleAnswer(false)}
                  className="flex flex-col items-center justify-center py-6 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 rounded-2xl transition-all active:scale-95 group"
                >
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:shadow transition-shadow">
                    <X className="w-6 h-6 text-red-600 stroke-[3]" />
                  </div>
                  <span className="font-bold text-red-700">No (Mismatch)</span>
                  <span className="text-xs text-red-600/60 mt-1 hidden sm:block">Right Arrow</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={score}
        gameId="colormatch"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
