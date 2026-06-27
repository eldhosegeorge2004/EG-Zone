/* eslint-disable */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw, Keyboard, Trophy } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Programming is the art of telling another human what one wants the computer to do.",
  "To be, or not to be, that is the question.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The only way to do great work is to love what you do."
];

export default function TypingGame() {
  const [text, setText] = useState("");
  const [input, setInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [bestWpm, setBestWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("typingBestWpm");
    if (saved) setBestWpm(parseInt(saved));
  }, []);

  const initGame = useCallback(() => {
    const randomText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    setText(randomText);
    setInput("");
    setIsStarted(true);
    setIsFinished(false);
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setAccuracy(100);
    setShowSubmitModal(false);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  }, []);

  const calculateStats = useCallback(() => {
    if (!startTime) return;
    
    const end = endTime || Date.now();
    const timeMinutes = (end - startTime) / 60000;
    
    // WPM = (characters / 5) / time
    const wordsTyped = input.length / 5;
    const currentWpm = Math.round(wordsTyped / timeMinutes);
    
    // Accuracy
    let correctChars = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === text[i]) correctChars++;
    }
    const currentAcc = input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;

    setWpm(currentWpm);
    setAccuracy(currentAcc);

    if (isFinished && currentWpm > bestWpm && currentAcc >= 90) {
      setBestWpm(currentWpm);
      localStorage.setItem("typingBestWpm", currentWpm.toString());
    }
  }, [startTime, endTime, input, text, isFinished, bestWpm]);

  useEffect(() => {
    calculateStats();
  }, [input, endTime, calculateStats]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished || !isStarted) return;
    
    const val = e.target.value;
    
    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    // Don't allow typing more than the text length
    if (val.length <= text.length) {
      setInput(val);
    }

    if (val.length === text.length) {
      setIsFinished(true);
      setEndTime(Date.now());
      setShowSubmitModal(true);
    }
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let colorClass = "text-gray-400"; // not typed
      let bgClass = "";
      
      if (index < input.length) {
        if (input[index] === char) {
          colorClass = "text-gray-900 font-medium"; // correct
        } else {
          colorClass = "text-red-600"; // incorrect
          bgClass = "bg-red-100 rounded-sm";
        }
      } else if (index === input.length && isStarted && !isFinished) {
        // cursor
        bgClass = "border-l-2 border-indigo-500 bg-indigo-50";
        colorClass = "text-gray-900";
      }

      return (
        <span key={index} className={`${colorClass} ${bgClass} transition-colors`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[700px] flex justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex gap-6 sm:gap-10">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">WPM</span>
            <span className="text-3xl font-black text-gray-900">{wpm}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Accuracy</span>
            <span className={`text-3xl font-black ${accuracy < 90 ? 'text-red-500' : 'text-gray-900'}`}>{accuracy}%</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center">
            <Trophy className="w-3 h-3 mr-1 text-amber-500" /> Best (90%+)
          </span>
          <span className="text-3xl font-black text-amber-500">{bestWpm}</span>
        </div>
      </div>

      <div className="relative group w-full max-w-[700px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur opacity-15 group-hover:opacity-25 transition duration-1000 group-hover:duration-200"></div>
        <div 
          className="relative bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-xl min-h-[300px] flex flex-col items-center justify-center cursor-text"
          onClick={() => isStarted && inputRef.current?.focus()}
        >
          
          {!isStarted && !isFinished && (
            <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-3xl">
              <div className="p-4 bg-purple-100 rounded-full mb-4 shadow-inner">
                <Keyboard className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Typing Speed Test</h2>
              <p className="text-gray-600 text-sm mb-6 max-w-[300px] font-medium">
                Type the text as quickly and accurately as possible. Timer starts when you type the first letter.
              </p>
              <button
                onClick={initGame}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all"
              >
                Start Typing
              </button>
            </div>
          )}

          {isFinished && (
            <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center rounded-3xl">
              <h2 className="text-4xl font-black text-purple-600 mb-2">Test Complete!</h2>
              <div className="flex gap-6 my-6">
                <div className="text-center">
                  <p className="text-gray-500 text-sm font-bold uppercase mb-1">Speed</p>
                  <p className="text-3xl font-black text-gray-900">{wpm} WPM</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm font-bold uppercase mb-1">Accuracy</p>
                  <p className="text-3xl font-black text-gray-900">{accuracy}%</p>
                </div>
              </div>
              <button
                onClick={initGame}
                className="flex items-center bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-all shadow-md hover:bg-gray-800"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Try Again
              </button>
            </div>
          )}

          {isStarted && (
            <>
              <div className="text-2xl sm:text-3xl font-mono leading-relaxed select-none max-w-2xl text-center">
                {renderText()}
              </div>
              {/* Hidden textarea to capture mobile keyboard and desktop input reliably */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onPaste={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
                className="absolute opacity-0 -z-10 pointer-events-none"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </>
          )}
        </div>
      </div>
      
      <SubmitScoreModal
        isOpen={showSubmitModal && accuracy >= 90}
        score={wpm}
        gameId="typing"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
