/* eslint-disable */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw, Trophy, Type, Timer } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

const WORDS = [
  "REACT", "NEXTJS", "JAVASCRIPT", "TYPESCRIPT", "TAILWIND", 
  "FRONTEND", "BACKEND", "DATABASE", "SERVER", "BROWSER",
  "PYTHON", "CODING", "PROGRAM", "DEVELOPER", "WEBSITE",
  "DESIGN", "MOBILE", "DESKTOP", "KEYBOARD", "MONITOR"
];

export default function WordScramble() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isWrong, setIsWrong] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("scrambleBestScore");
    if (saved) setBestScore(parseInt(saved));
  }, []);

  const scramble = (word: string): string => {
    let arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Prevent it from being the exact same word
    const res = arr.join("");
    return res === word && word.length > 1 ? scramble(word) : res;
  };

  const generateWord = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    setScrambledWord(scramble(word));
    setUserInput("");
    setIsWrong(false);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsPlaying(true);
    setIsGameOver(false);
    setShowSubmitModal(false);
    generateWord();
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
        localStorage.setItem("scrambleBestScore", score.toString());
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, score, bestScore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying) return;
    
    if (userInput.toUpperCase() === currentWord) {
      setScore(s => s + 1);
      generateWord();
    } else {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 500);
    }
  };

  return (
    <div className="flex flex-col items-center">
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

      <div className="relative w-full max-w-[500px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10"></div>
        
        <div className="relative bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl min-h-[350px] w-full flex flex-col items-center justify-center">
          
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-emerald-100">
                <Type className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Word Scramble</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Unscramble as many words as you can in 60 seconds.
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
              >
                Start Game
              </button>
            </div>
          )}

          {isGameOver && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-teal-100">
                <Trophy className="w-12 h-12 text-teal-500" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Time's Up!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                You unscrambled <span className="font-black text-emerald-600 text-xl">{score}</span> words.
              </p>
              <button
                onClick={startGame}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full max-w-[250px]"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Play Again
              </button>
            </div>
          )}

          {isPlaying && (
            <div className="w-full flex flex-col items-center">
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {scrambledWord.split("").map((letter, i) => (
                  <div key={i} className="w-12 h-14 sm:w-14 sm:h-16 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black text-gray-800 shadow-sm">
                    {letter}
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSubmit} className="w-full max-w-[300px]">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                  className={`w-full text-center text-2xl font-bold p-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all shadow-inner uppercase tracking-widest ${
                    isWrong ? 'border-red-500 ring-4 ring-red-500/20 animate-shake' : 'border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20'
                  }`}
                  placeholder="TYPE HERE..."
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
        gameId="scramble"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
