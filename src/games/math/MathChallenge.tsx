/* eslint-disable */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw, Trophy, Calculator, Timer } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

export default function MathChallenge() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState("+");
  const [answer, setAnswer] = useState(0);
  const [userInput, setUserInput] = useState("");
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("mathBestScore");
    if (saved) setBestScore(parseInt(saved));
  }, []);

  const generateProblem = useCallback(() => {
    const ops = ["+", "-", "*"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1, n2, ans;
    
    if (op === "+") {
      n1 = Math.floor(Math.random() * 50) + 1;
      n2 = Math.floor(Math.random() * 50) + 1;
      ans = n1 + n2;
    } else if (op === "-") {
      n1 = Math.floor(Math.random() * 50) + 20;
      n2 = Math.floor(Math.random() * n1); // Ensure positive result
      ans = n1 - n2;
    } else {
      n1 = Math.floor(Math.random() * 12) + 2;
      n2 = Math.floor(Math.random() * 12) + 2;
      ans = n1 * n2;
    }
    
    setNum1(n1);
    setNum2(n2);
    setOperator(op);
    setAnswer(ans);
    setUserInput("");
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsPlaying(true);
    setIsGameOver(false);
    setShowSubmitModal(false);
    generateProblem();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      setIsGameOver(true);
      setShowSubmitModal(true);
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem("mathBestScore", score.toString());
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, score, bestScore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying) return;
    
    if (parseInt(userInput) === answer) {
      setScore(s => s + 1);
      generateProblem();
    } else {
      // Wrong answer penalty: lose 2 seconds
      setTimeLeft(prev => Math.max(0, prev - 2));
      setUserInput("");
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Top Stats Bar */}
      <div className="w-full max-w-[500px] flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
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

      {/* Game Area */}
      <div className="relative w-full max-w-[500px]">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10"></div>
        
        <div className="relative bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl min-h-[350px] w-full flex flex-col items-center justify-center">
          
          {/* Start Screen */}
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
                <Calculator className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Math Challenge</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Solve as many math problems as you can in 60 seconds. Wrong answers cost 2 seconds!
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
              >
                Start Challenge
              </button>
            </div>
          )}

          {/* Game Over Screen */}
          {isGameOver && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-indigo-100">
                <Trophy className="w-12 h-12 text-indigo-500" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Time's Up!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                You solved <span className="font-black text-blue-600 text-xl">{score}</span> problems.
              </p>
              <button
                onClick={startGame}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full max-w-[250px]"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Play Again
              </button>
            </div>
          )}

          {/* Playing Area */}
          {isPlaying && (
            <div className="w-full flex flex-col items-center">
              <div className="text-5xl sm:text-7xl font-black text-gray-900 mb-8 tracking-tighter">
                {num1} <span className="text-blue-500">{operator}</span> {num2}
              </div>
              
              <form onSubmit={handleSubmit} className="w-full max-w-[300px]">
                <input
                  ref={inputRef}
                  type="number"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="w-full text-center text-4xl font-bold p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all shadow-inner"
                  placeholder="="
                  autoFocus
                />
              </form>
            </div>
          )}

        </div>
      </div>
      
      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={score}
        gameId="math"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
