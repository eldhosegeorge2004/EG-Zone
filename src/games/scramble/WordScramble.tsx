/* eslint-disable */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RotateCcw, Trophy, Type, Timer } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

const TIER_EASY = [
  "CAT", "DOG", "SUN", "MOON", "STAR", "FISH", "BIRD", "BOOK", "TREE", "BALL", 
  "FIRE", "SNOW", "RAIN", "WIND", "GOLD", "BLUE", "PINK", "MILK", "DOOR", "SHIP", 
  "FOOD", "LION", "DUCK", "FROG", "BEAR", "CAKE", "ROSE", "PARK", "HOME", "LAKE"
];

const TIER_MEDIUM = [
  "APPLE", "WATER", "SMILE", "BEACH", "CLOUD", "HEART", "MUSIC", "PLANT", "LIGHT", 
  "HOUSE", "GREEN", "BREAD", "TIGER", "PIZZA", "TRAIN", "HORSE", "CANDY", "CLOCK", 
  "DREAM", "SPACE", "PLANET", "SILVER", "MONKEY", "ORANGE", "CASTLE", "BRIDGE", 
  "SUMMER", "WINTER", "FOREST", "GUITAR"
];

const TIER_HARD = [
  "DIAMOND", "DOLPHIN", "DRAGON", "PYRAMID", "BLANKET", "BICYCLE", "JOURNEY", "RAINBOW", 
  "OCTOPUS", "CRYSTAL", "FREEDOM", "PACKAGE", "MONSTER", "MYSTERY", "WEATHER", "MORNING", 
  "EVENING", "FESTIVAL", "KINGDOM", "VOLCANO"
];

const TIER_MASTER = [
  "ELEPHANT", "COMPUTER", "MOUNTAIN", "BUTTERFLY", "SANDWICH", "UNIVERSE", "ADVENTURE", 
  "CHOCOLATE", "DINOSAUR", "FIREWORKS", "ASTRONAUT", "CHAMPION", "SUNFLOWER", "KANGAROO", 
  "CROCODILE", "HOSPITAL", "BEAUTIFUL", "WONDERFUL", "LIGHTNING"
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
  const scoreRef = useRef(0);
  const recentWordsRef = useRef<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("scrambleBestScore");
    if (saved) setBestScore(parseInt(saved, 10));
  }, []);

  const scramble = (word: string): string => {
    const arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const res = arr.join("");
    // Ensure the scrambled output is not identical to original word
    return res === word && word.length > 1 ? scramble(word) : res;
  };

  const getTierForScore = (currentScore: number) => {
    if (currentScore < 4) return { pool: TIER_EASY, label: "Easy", color: "bg-emerald-100 text-emerald-700" };
    if (currentScore < 8) return { pool: TIER_MEDIUM, label: "Medium", color: "bg-amber-100 text-amber-700" };
    if (currentScore < 12) return { pool: TIER_HARD, label: "Hard", color: "bg-orange-100 text-orange-700" };
    return { pool: TIER_MASTER, label: "Master", color: "bg-rose-100 text-rose-700" };
  };

  const generateWord = useCallback((newScore?: number) => {
    const s = typeof newScore === "number" ? newScore : scoreRef.current;
    const { pool } = getTierForScore(s);

    // Pick a word not used very recently
    const available = pool.filter(w => !recentWordsRef.current.includes(w));
    const candidateList = available.length > 0 ? available : pool;
    const word = candidateList[Math.floor(Math.random() * candidateList.length)];

    recentWordsRef.current = [...recentWordsRef.current.slice(-5), word];

    setCurrentWord(word);
    setScrambledWord(scramble(word));
    setUserInput("");
    setIsWrong(false);
  }, []);

  const startGame = () => {
    scoreRef.current = 0;
    recentWordsRef.current = [];
    setScore(0);
    setTimeLeft(60);
    setIsPlaying(true);
    setIsGameOver(false);
    setShowSubmitModal(false);
    generateWord(0);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (isPlaying && timeLeft === 0) {
      setIsPlaying(false);
      setIsGameOver(true);
      setShowSubmitModal(true);
      if (scoreRef.current > bestScore) {
        setBestScore(scoreRef.current);
        localStorage.setItem("scrambleBestScore", scoreRef.current.toString());
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, bestScore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPlaying) return;
    
    if (userInput.trim().toUpperCase() === currentWord) {
      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;
      setScore(nextScore);
      generateWord(nextScore);
    } else {
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 500);
    }
  };

  const currentTier = getTierForScore(score);

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
              <p className="text-gray-500 text-base mb-8 max-w-[320px] font-medium leading-relaxed">
                Unscramble words in 60 seconds! Starts with <span className="font-bold text-emerald-600">Easy 3-4 letter</span> words and increases in length as you score.
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
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Time&apos;s Up!</h2>
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
              {/* Difficulty indicator badge */}
              <div className="mb-4">
                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full ${currentTier.color}`}>
                  Level: {currentTier.label} ({currentWord.length} letters)
                </span>
              </div>

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
