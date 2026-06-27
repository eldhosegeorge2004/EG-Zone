/* eslint-disable */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Zap, Clock, Trophy, AlertTriangle } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

type GameState = "idle" | "waiting" | "ready" | "result" | "early";

export default function ReactionGame() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number>(Infinity);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem("reactionBestTime");
    if (saved) setBestTime(parseInt(saved));
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    setGameState("waiting");
    setReactionTime(null);
    setShowSubmitModal(false);
    
    const delay = 2000 + Math.random() * 4000;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setGameState("ready");
      startTimeRef.current = Date.now();
    }, delay);
  }, []);

  const handleClick = () => {
    if (gameState === "idle" || gameState === "result" || gameState === "early") {
      startGame();
    } else if (gameState === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState("early");
    } else if (gameState === "ready") {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setGameState("result");
      setShowSubmitModal(true);
      
      if (time < bestTime) {
        setBestTime(time);
        localStorage.setItem("reactionBestTime", time.toString());
      }
    }
  };

  const getBackgroundColor = () => {
    switch (gameState) {
      case "idle": return "bg-white hover:bg-gray-50 border-gray-200";
      case "waiting": return "bg-red-500 hover:bg-red-600 border-red-600";
      case "ready": return "bg-green-500 hover:bg-green-600 border-green-600";
      case "result": return "bg-white hover:bg-gray-50 border-gray-200";
      case "early": return "bg-white hover:bg-gray-50 border-gray-200";
      default: return "bg-white border-gray-200";
    }
  };

  const getTextColor = () => {
    if (gameState === "waiting" || gameState === "ready") return "text-white";
    return "text-gray-900";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[600px] flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Latest Time</span>
          <span className="text-3xl font-black text-gray-900">
            {reactionTime ? `${reactionTime}ms` : "-"}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center">
            <Trophy className="w-3 h-3 mr-1 text-amber-500" /> Best
          </span>
          <span className="text-3xl font-black text-amber-500">
            {bestTime === Infinity ? "-" : `${bestTime}ms`}
          </span>
        </div>
      </div>

      <div 
        onClick={handleClick}
        className={`w-full max-w-[600px] h-[400px] rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-150 border-2 shadow-xl select-none ${getBackgroundColor()}`}
      >
        {gameState === "idle" && (
          <>
            <Zap className="w-20 h-20 text-yellow-500 mb-6" />
            <h2 className="text-4xl font-black text-gray-900 mb-2">Reaction Time</h2>
            <p className="text-gray-500 font-medium text-lg text-center max-w-[300px]">
              When the red box turns green, click as quickly as you can.
            </p>
            <p className="mt-8 text-indigo-600 font-bold animate-pulse text-lg">Click anywhere to start</p>
          </>
        )}

        {gameState === "waiting" && (
          <>
            <Clock className="w-24 h-24 text-white/50 mb-6 animate-pulse" />
            <h2 className="text-5xl font-black text-white mb-2 tracking-widest">Wait for green...</h2>
          </>
        )}

        {gameState === "ready" && (
          <>
            <Zap className="w-24 h-24 text-white mb-6 animate-bounce" />
            <h2 className="text-6xl font-black text-white mb-2 tracking-widest">CLICK!</h2>
          </>
        )}

        {gameState === "result" && (
          <>
            <Trophy className="w-20 h-20 text-yellow-500 mb-6" />
            <h2 className="text-5xl font-black text-gray-900 mb-2">{reactionTime} ms</h2>
            <p className="text-gray-500 font-medium text-lg mt-4 text-center max-w-[350px]">
              {reactionTime! < 200 ? "Incredible reflexes! You're superhuman." : 
               reactionTime! < 250 ? "Great job! That's faster than average." :
               reactionTime! < 300 ? "Good! Keep practicing to get under 250ms." :
               "A bit slow. Try to focus and anticipate the change!"}
            </p>
            <p className="mt-8 text-indigo-600 font-bold animate-pulse text-lg">Click to try again</p>
          </>
        )}

        {gameState === "early" && (
          <>
            <AlertTriangle className="w-20 h-20 text-red-500 mb-6" />
            <h2 className="text-4xl font-black text-gray-900 mb-2">Too Early!</h2>
            <p className="text-gray-500 font-medium text-lg mt-4 text-center">
              You clicked before it turned green. Wait for the signal!
            </p>
            <p className="mt-8 text-indigo-600 font-bold animate-pulse text-lg">Click to try again</p>
          </>
        )}
      </div>
      
      <SubmitScoreModal
        isOpen={showSubmitModal && reactionTime !== null}
        score={reactionTime ? Math.max(0, 1000 - reactionTime) : 0}
        gameId="reaction"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
