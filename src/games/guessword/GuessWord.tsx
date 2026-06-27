/* eslint-disable */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, RotateCcw, HelpCircle, Trophy } from "lucide-react";

const WORDS = [
  "APPLE", "TRAIN", "HOUSE", "MOUSE", "BRICK", "CRANE", "SLATE", "PLANT", "LEMON", "WATER",
  "EARTH", "HEART", "LIGHT", "NIGHT", "DREAM", "SMILE", "RIVER", "STONE", "BEACH", "CLOUD",
  "STORM", "POWER", "BRAIN", "FROST", "FLAME", "GHOST", "MAGIC", "SWORD", "SHIELD", "GLASS",
  "CLOCK", "MONEY", "PAPER", "PENNY", "PHONE", "RADIO", "TABLE", "CHAIR", "TRUCK", "WHEEL",
  "ALBUM", "BREAD", "SUGAR", "JUICE", "GRAPE", "BERRY", "MELON", "PIZZA", "PASTA", "SALAD"
];

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"]
];

type LetterState = "correct" | "present" | "absent" | "empty";

export default function GuessWordGame() {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>(Array(6).fill(""));
  const [currentGuessIdx, setCurrentGuessIdx] = useState(0);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [invalidShake, setInvalidShake] = useState(false);

  const startGame = useCallback(() => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuesses(Array(6).fill(""));
    setCurrentGuessIdx(0);
    setCurrentGuess("");
    setIsPlaying(true);
    setIsGameOver(false);
    setIsWon(false);
  }, []);

  const onKeyPress = useCallback((key: string) => {
    if (!isPlaying || isGameOver || isWon) return;

    if (key === "BACK" || key === "Backspace") {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key === "ENTER" || key === "Enter") {
      if (currentGuess.length !== 5) {
        // Shake animation for not enough letters
        setInvalidShake(true);
        setTimeout(() => setInvalidShake(false), 500);
        return;
      }

      // Submit guess
      const newGuesses = [...guesses];
      newGuesses[currentGuessIdx] = currentGuess;
      setGuesses(newGuesses);
      setCurrentGuess("");

      if (currentGuess === targetWord) {
        setIsWon(true);
      } else if (currentGuessIdx === 5) {
        setIsGameOver(true);
      } else {
        setCurrentGuessIdx(prev => prev + 1);
      }

    } else if (/^[A-Z]$/.test(key)) {
      if (currentGuess.length < 5) {
        setCurrentGuess(prev => prev + key);
      }
    }
  }, [currentGuess, currentGuessIdx, guesses, isGameOver, isPlaying, isWon, targetWord]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE" || /^[A-Z]$/.test(key)) {
        onKeyPress(key === "BACKSPACE" ? "BACK" : key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyPress]);

  // Compute colors for a specific row
  const getRowColors = (guess: string) => {
    const colors: LetterState[] = Array(5).fill("absent");
    if (!guess) return colors;

    const targetArr = targetWord.split("");
    const guessArr = guess.split("");

    // First pass: find exact matches (greens)
    for (let i = 0; i < 5; i++) {
      if (guessArr[i] === targetArr[i]) {
        colors[i] = "correct";
        targetArr[i] = null as any; // consume this letter
      }
    }

    // Second pass: find present matches (yellows)
    for (let i = 0; i < 5; i++) {
      if (colors[i] !== "correct" && targetArr.includes(guessArr[i])) {
        colors[i] = "present";
        targetArr[targetArr.indexOf(guessArr[i])] = null as any; // consume
      }
    }

    return colors;
  };

  // Compute keyboard colors
  const getKeyboardColors = () => {
    const keyColors: Record<string, LetterState> = {};
    for (let i = 0; i <= currentGuessIdx; i++) {
      const guess = guesses[i];
      if (!guess) continue;
      const colors = getRowColors(guess);
      for (let j = 0; j < 5; j++) {
        const letter = guess[j];
        const color = colors[j];
        // Only upgrade color, never downgrade
        if (!keyColors[letter] || color === "correct" || (color === "present" && keyColors[letter] !== "correct")) {
          keyColors[letter] = color;
        }
      }
    }
    return keyColors;
  };

  const keyColors = getKeyboardColors();

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[500px] mx-auto">
      
      <div className="w-full flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Guess Word</h1>
        <button
          onClick={startGame}
          className="flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 px-4 py-2 rounded-lg border border-gray-200"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Restart
        </button>
      </div>

      <div className="relative w-full">
        <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10"></div>
        
        <div className="relative bg-white/70 backdrop-blur-md rounded-3xl border border-gray-200 shadow-xl w-full p-4 sm:p-8 flex flex-col items-center">
          
          {!isPlaying && !isWon && !isGameOver && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
               <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                <HelpCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Guess the Word</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Guess the 5-letter hidden word in 6 tries. Green means correct, yellow means wrong place.
              </p>
              <button
                onClick={startGame}
                className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
              >
                Play Now
              </button>
            </div>
          )}

          {/* Win/Loss Overlays */}
          {(isWon || isGameOver) && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl animate-in fade-in zoom-in duration-300">
               {isWon ? (
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-100">
                  <Trophy className="w-12 h-12 text-green-500" />
                </div>
               ) : (
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                  <span className="text-4xl">😢</span>
                </div>
               )}
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
                {isWon ? "Magnificent!" : "Game Over"}
              </h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                The word was <span className="font-black text-gray-900 text-xl tracking-widest">{targetWord}</span>
              </p>
              <button
                onClick={startGame}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full max-w-[250px]"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Play Again
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-rows-6 gap-2 sm:gap-3 mb-8 w-full max-w-[350px]">
            {guesses.map((guess, r) => {
              const isCurrentRow = r === currentGuessIdx;
              const displayGuess = isCurrentRow ? currentGuess.padEnd(5, " ") : guess.padEnd(5, " ");
              const colors = getRowColors(guess);

              return (
                <div 
                  key={r} 
                  className={`grid grid-cols-5 gap-2 sm:gap-3 ${isCurrentRow && invalidShake ? 'animate-[shake_0.2s_ease-in-out_0s_2]' : ''}`}
                >
                  {displayGuess.split("").map((letter, c) => {
                    const colorState = isCurrentRow ? "empty" : colors[c];
                    
                    let bg = "bg-white border-gray-200 text-gray-800";
                    if (colorState === "correct") bg = "bg-emerald-500 border-emerald-600 text-white shadow-inner";
                    else if (colorState === "present") bg = "bg-yellow-400 border-yellow-500 text-white shadow-inner";
                    else if (colorState === "absent") bg = "bg-gray-400 border-gray-500 text-white shadow-inner";
                    else if (letter !== " ") bg = "bg-white border-gray-400 text-gray-900 shadow-sm scale-105";

                    return (
                      <div
                        key={c}
                        className={`
                          aspect-square flex items-center justify-center text-2xl sm:text-3xl font-black uppercase rounded-lg sm:rounded-xl border-2 transition-all duration-300
                          ${bg}
                        `}
                      >
                        {letter}
                      </div>
                    )
                  })}
                </div>
              );
            })}
          </div>

          {/* Keyboard */}
          <div className="w-full max-w-[450px] flex flex-col gap-2">
            {KEYBOARD_ROWS.map((row, r) => (
              <div key={r} className="flex justify-center gap-1 sm:gap-2">
                {row.map((key) => {
                  const state = keyColors[key] || "empty";
                  let bg = "bg-gray-100 text-gray-700 hover:bg-gray-200";
                  if (state === "correct") bg = "bg-emerald-500 text-white hover:bg-emerald-600";
                  else if (state === "present") bg = "bg-yellow-400 text-white hover:bg-yellow-500";
                  else if (state === "absent") bg = "bg-gray-300 text-gray-500";

                  const isAction = key === "ENTER" || key === "BACK";
                  
                  return (
                    <button
                      key={key}
                      onClick={() => onKeyPress(key)}
                      className={`
                        flex items-center justify-center font-bold rounded-md sm:rounded-lg transition-colors
                        ${isAction ? 'px-2 sm:px-4 text-xs sm:text-sm' : 'flex-1 text-sm sm:text-base aspect-[2/3] max-w-[40px]'}
                        ${bg}
                      `}
                      style={{ height: '50px' }}
                    >
                      {key === "BACK" ? "⌫" : key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}} />
    </div>
  );
}
