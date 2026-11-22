/* eslint-disable */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw, Trophy, Award } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

const COLORS = ["#ff5a5f", "#ffc233", "#22c493", "#3b82f6", "#a855f7"];
const SYMBOLS = ["●", "■", "▲", "◆", "★"];
const COLOR_NAMES = ["Coral", "Yellow", "Mint", "Blue", "Purple"];

export default function SplashGame() {
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(6);
  const [colorCount, setColorCount] = useState(4);
  const [board, setBoard] = useState<number[]>([]);
  const [movesLeft, setMovesLeft] = useState(10);
  const [gameState, setGameState] = useState<"start" | "play" | "won" | "lost">("start");
  const [bestLevel, setBestLevel] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);

  // Sound effects
  const playPop = (freq = 440) => {
    if (mutedRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  };

  const playFanfare = () => {
    if (mutedRef.current) return;
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => playPop(f), i * 80);
    });
  };

  // Load high score
  useEffect(() => {
    try {
      const b = parseInt(localStorage.getItem("splash_best_level") || "1");
      setBestLevel(b);
    } catch {}
  }, []);

  const initLevel = useCallback((lvl: number) => {
    const n = Math.min(12, 5 + lvl);
    const k = lvl < 3 ? 4 : 5;
    const initialMoves = Math.ceil(n * k * 0.4);

    const newBoard: number[] = [];
    for (let i = 0; i < n * n; i++) {
      newBoard.push(Math.floor(Math.random() * k));
    }

    setGridSize(n);
    setColorCount(k);
    setBoard(newBoard);
    setMovesLeft(initialMoves);
    setGameState("play");
  }, []);

  // Start game on mount
  useEffect(() => {
    initLevel(1);
  }, [initLevel]);

  const handleColorChoice = (chosenColor: number) => {
    if (gameState !== "play" || board.length === 0) return;

    const oldColor = board[0];
    if (chosenColor === oldColor) return;

    playPop(300 + chosenColor * 80);

    const n = gridSize;
    const newBoard = [...board];
    const stack = [0];
    const seen = new Uint8Array(n * n);
    seen[0] = 1;

    while (stack.length > 0) {
      const i = stack.pop()!;
      const x = i % n;
      const y = Math.floor(i / n);
      newBoard[i] = chosenColor;

      const neighbors = [
        x > 0 ? i - 1 : -1,
        x < n - 1 ? i + 1 : -1,
        y > 0 ? i - n : -1,
        y < n - 1 ? i + n : -1,
      ];

      for (let k = 0; k < 4; k++) {
        const nb = neighbors[k];
        if (nb >= 0 && !seen[nb] && board[nb] === oldColor) {
          seen[nb] = 1;
          stack.push(nb);
        }
      }
    }

    const nextMoves = movesLeft - 1;
    setBoard(newBoard);
    setMovesLeft(nextMoves);

    const isAllSame = newBoard.every((v) => v === chosenColor);

    if (isAllSame) {
      playFanfare();
      const nextLvl = level + 1;
      if (nextLvl > bestLevel) {
        setBestLevel(nextLvl);
        try {
          localStorage.setItem("splash_best_level", String(nextLvl));
        } catch {}
      }
      setTimeout(() => {
        setGameState("won");
        setShowSubmitModal(true);
      }, 300);
    } else if (nextMoves <= 0) {
      setTimeout(() => {
        setGameState("lost");
      }, 300);
    }
  };

  const handleNextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    initLevel(nextLvl);
  };

  const handleRetry = () => {
    initLevel(level);
  };

  const toggleMute = () => {
    const nm = !mutedRef.current;
    mutedRef.current = nm;
    setMuted(nm);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto select-none">
      {/* Top HUD */}
      <div className="flex items-center justify-between w-full px-3 py-2.5 mb-3 bg-slate-100 rounded-xl text-slate-800 font-bold text-sm sm:text-base shadow-sm">
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Level {level}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`font-black ${
              movesLeft <= 3 ? "text-rose-500 animate-pulse" : "text-amber-600"
            }`}
          >
            {movesLeft} {movesLeft === 1 ? "move" : "moves"}
          </span>
          <div className="flex items-center gap-1 text-xs bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600 font-semibold ml-2">
            <Trophy className="w-3 h-3 text-amber-500" /> Best: {bestLevel}
          </div>
          <button
            onClick={toggleMute}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
            title="Toggle Sound"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Board */}
      <div className="relative w-full aspect-square p-2 rounded-2xl bg-white border-4 border-slate-200 shadow-xl overflow-hidden">
        <div
          className="grid gap-1 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {board.map((colorIdx, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: COLORS[colorIdx],
              }}
              className="rounded-md transition-colors duration-200 flex items-center justify-center font-bold text-white text-xs sm:text-sm drop-shadow-sm"
            >
              <span className="opacity-75">{SYMBOLS[colorIdx]}</span>
            </div>
          ))}
        </div>

        {/* Win Overlay */}
        {gameState === "won" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/85 backdrop-blur-sm p-6 text-center text-white z-20">
            <h3 className="text-3xl sm:text-4xl font-black text-emerald-400 mb-2">
              Level {level} Cleared!
            </h3>
            <p className="text-slate-200 text-sm mb-6">
              You flooded the board with {movesLeft} {movesLeft === 1 ? "move" : "moves"} to spare.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleNextLevel}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-full shadow-lg transition-all"
              >
                Level {level + 1} →
              </button>
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-full shadow-lg transition-all"
              >
                <Trophy className="w-4 h-4 text-amber-300" /> Save Score
              </button>
            </div>
          </div>
        )}

        {/* Lose Overlay */}
        {gameState === "lost" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center text-white z-20">
            <h3 className="text-3xl sm:text-4xl font-black text-rose-400 mb-2">
              Out of Moves!
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              The board wasn't completely flooded. Give it another shot!
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold rounded-full shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Try Level Again
            </button>
          </div>
        )}
      </div>

      {/* Color Palette Controls */}
      <div className="flex items-center justify-center gap-2.5 sm:gap-4 mt-4 w-full">
        {Array.from({ length: colorCount }, (_, c) => {
          const isCurrentTopLeft = board[0] === c;
          return (
            <button
              key={c}
              onClick={() => handleColorChoice(c)}
              disabled={isCurrentTopLeft || gameState !== "play"}
              style={{ backgroundColor: COLORS[c] }}
              aria-label={COLOR_NAMES[c]}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md transition-all active:translate-y-1 ${
                isCurrentTopLeft
                  ? "opacity-35 cursor-default ring-2 ring-slate-400"
                  : "hover:scale-105 active:scale-95 cursor-pointer hover:shadow-lg"
              }`}
            >
              {SYMBOLS[c]}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500 mt-2 font-medium text-center">
        Tap a color below to flood outward from the top-left corner.
      </p>

      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={level * 100 + movesLeft * 10}
        gameId="splash"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
