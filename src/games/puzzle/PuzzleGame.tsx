/* eslint-disable */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, RotateCcw, Trophy, Hash } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

const GRID_SIZE = 4;
const TILE_COUNT = GRID_SIZE * GRID_SIZE;

export default function PuzzleGame() {
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState(Infinity);
  const [isWon, setIsWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("puzzleBestMoves");
    if (saved) setBestMoves(parseInt(saved));
  }, []);

  const initGame = useCallback(() => {
    let newTiles = Array.from({ length: TILE_COUNT - 1 }, (_, i) => i + 1);
    newTiles.push(0); 

    // Shuffle by making random valid moves from the solved state (guarantees solvability)
    for (let i = 0; i < 200; i++) { // Increased shuffle moves
      const emptyIdx = newTiles.indexOf(0);
      const row = Math.floor(emptyIdx / GRID_SIZE);
      const col = emptyIdx % GRID_SIZE;
      
      const possibleMoves = [];
      if (row > 0) possibleMoves.push(emptyIdx - GRID_SIZE); // Up
      if (row < GRID_SIZE - 1) possibleMoves.push(emptyIdx + GRID_SIZE); // Down
      if (col > 0) possibleMoves.push(emptyIdx - 1); // Left
      if (col < GRID_SIZE - 1) possibleMoves.push(emptyIdx + 1); // Right
      
      const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      
      [newTiles[emptyIdx], newTiles[randomMove]] = [newTiles[randomMove], newTiles[emptyIdx]];
    }

    setTiles(newTiles);
    setMoves(0);
    setIsWon(false);
    setIsPlaying(true);
    setShowSubmitModal(false);
  }, []);

  const handleTileClick = (index: number) => {
    if (!isPlaying || isWon || tiles[index] === 0) return;

    const emptyIdx = tiles.indexOf(0);
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyRow = Math.floor(emptyIdx / GRID_SIZE);
    const emptyCol = emptyIdx % GRID_SIZE;

    const isAdjacent = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) || 
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
      setTiles(newTiles);
      setMoves(m => m + 1);

      const checkWin = newTiles.every((val, idx) => {
        if (idx === TILE_COUNT - 1) return val === 0;
        return val === idx + 1;
      });

      if (checkWin) {
        setIsWon(true);
        setShowSubmitModal(true);
        if (moves + 1 < bestMoves) {
          setBestMoves(moves + 1);
          localStorage.setItem("puzzleBestMoves", (moves + 1).toString());
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Top Stats Bar */}
      <div className="w-full max-w-[450px] flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Moves</span>
          <span className="text-3xl font-black text-gray-900 leading-none mt-1">{moves}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center">
            <Trophy className="w-3 h-3 mr-1 text-amber-500" /> Best
          </span>
          <span className="text-3xl font-black text-amber-500 leading-none mt-1">
            {bestMoves === Infinity ? "-" : bestMoves}
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-[450px]">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-rose-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10"></div>
        
        <div className="relative bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl min-h-[480px] w-full flex items-center justify-center">
          
          {/* Start Screen Overlay */}
          {!isPlaying && !isWon && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-orange-100">
                <Hash className="w-10 h-10 text-orange-600 ml-1" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Number Puzzle</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Slide the tiles into the empty space to arrange them in order from 1 to 15.
              </p>
              <button
                onClick={initGame}
                className="bg-gradient-to-r from-orange-500 to-rose-600 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
              >
                Start Game
              </button>
            </div>
          )}

          {/* Win Screen Overlay */}
          {isWon && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-green-100">
                <Trophy className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">You Win!</h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                Solved in <span className="font-black text-orange-600 text-xl">{moves}</span> moves.
              </p>
              <button
                onClick={initGame}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full max-w-[250px]"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Play Again
              </button>
            </div>
          )}

          {/* Puzzle Board using Absolute Positioning for Sliding Animations */}
          <div 
            ref={boardRef}
            className="w-full aspect-square max-w-[400px] relative bg-gray-100 rounded-xl p-2 border border-gray-200 shadow-inner"
          >
            {tiles.length > 0 && tiles.map((tile, index) => {
              // Calculate position based on current index
              const row = Math.floor(index / GRID_SIZE);
              const col = index % GRID_SIZE;
              
              // 25% width/height per tile (100% / 4)
              // We adjust slightly for the gaps. The container has p-2.
              // Instead of complex math, we use percentages for left/top and calc for gaps
              const leftPos = `calc(${col * 25}% + ${col * 4}px)`;
              const topPos = `calc(${row * 25}% + ${row * 4}px)`;

              // If it's the empty tile (0), render an invisible placeholder or just a recessed square
              if (tile === 0) {
                return (
                  <div
                    key={`empty-${index}`}
                    style={{ left: leftPos, top: topPos, width: 'calc(25% - 12px)', height: 'calc(25% - 12px)' }}
                    className="absolute rounded-lg transition-all duration-200 ease-in-out bg-transparent"
                  />
                );
              }

              return (
                <div
                  key={tile}
                  onClick={() => handleCardClick(index)} // Helper to safely call handleTileClick
                  style={{ left: leftPos, top: topPos, width: 'calc(25% - 12px)', height: 'calc(25% - 12px)' }}
                  className={`
                    absolute flex items-center justify-center rounded-lg text-2xl sm:text-3xl font-black 
                    bg-white text-gray-900 border-b-4 border-r-2 border-gray-200 
                    shadow-sm cursor-pointer hover:bg-gray-50
                    transition-all duration-200 ease-in-out z-10
                    active:translate-y-1 active:border-b-0
                  `}
                >
                  {tile}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={Math.max(0, 1000 - moves * 2)}
        gameId="puzzle"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );

  // Define handleCardClick inside the component to pass to the tiles
  function handleCardClick(index: number) {
    handleTileClick(index);
  }
}
