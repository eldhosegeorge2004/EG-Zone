/* eslint-disable */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, RotateCcw, Trophy, Grid2X2, Delete } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

// Predefined easy puzzles (0 = empty)
const PUZZLES = [
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
  "000260701680070090190004500820100040004602900050003028009300074040050036703018000",
  "100489006730000040000001295007120600500703008006095700914600000020000037800512004"
];

// Solutions corresponding to above
const SOLUTIONS = [
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
  "435269781682571493197834562826195347374682915951743628519326874248957136763418259",
  "152489376739256841468371295387124659591763428246895713914637582625948137873512964"
];

type Cell = {
  val: number;
  isInitial: boolean;
};

export default function SudokuGame() {
  const [board, setBoard] = useState<Cell[]>([]);
  const [solution, setSolution] = useState<string>("");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const startGame = useCallback(() => {
    const r = Math.floor(Math.random() * PUZZLES.length);
    const puzzle = PUZZLES[r];
    setSolution(SOLUTIONS[r]);
    
    const initialBoard = puzzle.split("").map(c => ({
      val: parseInt(c),
      isInitial: c !== "0"
    }));
    
    setBoard(initialBoard);
    setSelectedIdx(null);
    setMistakes(0);
    setIsPlaying(true);
    setIsWon(false);
    setShowSubmitModal(false);
  }, []);

  const handleCellClick = (idx: number) => {
    if (!isPlaying || isWon) return;
    setSelectedIdx(idx);
  };

  const handleInput = useCallback((key: string) => {
    if (!isPlaying || isWon || selectedIdx === null) return;
    if (board[selectedIdx].isInitial) return;

    if (key >= "1" && key <= "9") {
      const num = parseInt(key);
      const newBoard = [...board];
      newBoard[selectedIdx].val = num;
      setBoard(newBoard);
      
      // Check win or mistake
      if (solution[selectedIdx] !== key) {
        setMistakes(m => m + 1);
      } else {
        // Auto-deselect if correct
        setSelectedIdx(null);
        
        // Check win
        if (newBoard.every((cell, i) => cell.val.toString() === solution[i])) {
          setIsWon(true);
          setShowSubmitModal(true);
        }
      }
    } else if (key === "Backspace" || key === "Delete") {
      const newBoard = [...board];
      newBoard[selectedIdx].val = 0;
      setBoard(newBoard);
    } else if (key.startsWith("Arrow")) {
      let r = Math.floor(selectedIdx / 9);
      let c = selectedIdx % 9;
      if (key === "ArrowUp") r = Math.max(0, r - 1);
      if (key === "ArrowDown") r = Math.min(8, r + 1);
      if (key === "ArrowLeft") c = Math.max(0, c - 1);
      if (key === "ArrowRight") c = Math.min(8, c + 1);
      setSelectedIdx(r * 9 + c);
    }
  }, [isPlaying, isWon, selectedIdx, board, solution]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    handleInput(e.key);
  }, [handleInput]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const renderCell = (idx: number) => {
    const cell = board[idx];
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    
    // Border logic for 3x3 blocks
    let borderClasses = "border border-gray-200";
    if (c % 3 === 2 && c !== 8) borderClasses += " border-r-gray-400 border-r-2";
    if (r % 3 === 2 && r !== 8) borderClasses += " border-b-gray-400 border-b-2";
    
    const isSelected = selectedIdx === idx;
    
    // Highlight same row, col, block as selected
    let isRelated = false;
    let isSameNumber = false;
    if (selectedIdx !== null) {
      const sr = Math.floor(selectedIdx / 9);
      const sc = selectedIdx % 9;
      if (r === sr || c === sc || (Math.floor(r/3) === Math.floor(sr/3) && Math.floor(c/3) === Math.floor(sc/3))) {
        isRelated = true;
      }
      if (cell.val !== 0 && cell.val === board[selectedIdx].val) {
        isSameNumber = true;
      }
    }

    const isWrong = cell.val !== 0 && !cell.isInitial && cell.val.toString() !== solution[idx];
    
    let bgClass = "bg-white";
    if (isSelected) bgClass = "bg-indigo-200";
    else if (isSameNumber) bgClass = "bg-indigo-100";
    else if (isRelated) bgClass = "bg-gray-50";

    let textClass = cell.isInitial ? "text-gray-900 font-bold" : "text-indigo-600 font-bold";
    if (isWrong) textClass = "text-red-500 font-bold";

    return (
      <div
        key={idx}
        onClick={() => handleCellClick(idx)}
        className={`w-full h-full flex items-center justify-center text-xl sm:text-2xl cursor-pointer transition-colors ${borderClasses} ${bgClass} ${textClass}`}
      >
        {cell.val !== 0 ? cell.val : ""}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center select-none">
      <div className="w-full max-w-[450px] flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Mistakes</span>
          <span className={`text-3xl font-black leading-none mt-1 ${mistakes > 0 ? 'text-red-500' : 'text-gray-900'}`}>{mistakes}</span>
        </div>
        <button
          onClick={startGame}
          className="flex items-center text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors bg-gray-50 px-4 py-2 rounded-lg border border-gray-200"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Restart
        </button>
      </div>

      <div className="relative w-full max-w-[450px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10"></div>
        
        <div className="relative bg-white p-4 sm:p-6 rounded-3xl border border-gray-200 shadow-xl w-full flex flex-col items-center justify-center">
          
          {!isPlaying && !isWon && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
               <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-indigo-100">
                <Grid2X2 className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Sudoku</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Fill the 9x9 grid so every row, column, and 3x3 box contains digits 1-9.
              </p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
              >
                Start Game
              </button>
            </div>
          )}

          {isWon && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-100">
                <Trophy className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Puzzle Solved!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                You made <span className="font-black text-indigo-600 text-xl">{mistakes}</span> mistakes.
              </p>
              <button
                onClick={startGame}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full max-w-[250px]"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Play Again
              </button>
            </div>
          )}

          {/* Sudoku Board */}
          <div className="w-full aspect-square border-2 border-gray-800 rounded-lg overflow-hidden bg-gray-400 grid grid-cols-9 grid-rows-9 gap-px">
            {board.length === 81 && Array(81).fill(0).map((_, i) => renderCell(i))}
          </div>
          
          {/* Mobile Number Pad */}
          <div className="w-full mt-6 grid grid-cols-5 gap-2 sm:hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleInput(num.toString())}
                className="bg-gray-100 hover:bg-indigo-100 text-indigo-700 font-bold text-xl py-3 rounded-lg border border-gray-200 shadow-sm active:translate-y-1 transition-all touch-manipulation"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleInput("Backspace")}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold flex items-center justify-center py-3 rounded-lg border border-red-200 shadow-sm active:translate-y-1 transition-all touch-manipulation"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
          
          <p className="mt-6 text-gray-400 text-sm font-medium text-center hidden sm:block">
            Click a cell and use your <span className="font-bold text-gray-600">Keyboard (1-9)</span> to fill in numbers.
          </p>

        </div>
      </div>
      
      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={Math.max(0, 1000 - mistakes * 50)}
        gameId="sudoku"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
