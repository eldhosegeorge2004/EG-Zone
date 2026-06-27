/* eslint-disable */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Rocket, Plane, Car, Bike, Train, Bus, Ship, Tractor, Play, RotateCcw, Trophy } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

type Card = {
  id: number;
  iconId: string;
  icon: React.ReactNode;
  isFlipped: boolean;
  isMatched: boolean;
};

const CARD_ICONS = [
  <Rocket key="rocket" className="w-8 h-8" />,
  <Plane key="plane" className="w-8 h-8" />,
  <Car key="car" className="w-8 h-8" />,
  <Bike key="bike" className="w-8 h-8" />,
  <Train key="train" className="w-8 h-8" />,
  <Bus key="bus" className="w-8 h-8" />,
  <Ship key="ship" className="w-8 h-8" />,
  <Tractor key="tractor" className="w-8 h-8" />,
];

export default function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState(Infinity);
  const [isWon, setIsWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("memoryBestMoves");
    if (saved) setBestMoves(parseInt(saved));
  }, []);

  const initGame = useCallback(() => {
    const duplicatedIcons = [...CARD_ICONS, ...CARD_ICONS];
    const shuffled = duplicatedIcons
      .map((icon, index) => ({
        id: index,
        iconId: (icon as any).key,
        icon,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setIsWon(false);
    setIsPlaying(true);
    setShowSubmitModal(false);
  }, []);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [first, second] = flippedIndices;
      if (cards[first].iconId === cards[second].iconId) {
        setCards((prev) =>
          prev.map((card, i) =>
            i === first || i === second ? { ...card, isMatched: true } : card
          )
        );
        setFlippedIndices([]);
      } else {
        const timer = setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedIndices([]);
        }, 600); // Reduced delay for snappier gameplay
        return () => clearTimeout(timer);
      }
    }
  }, [flippedIndices, cards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.isMatched)) {
      setIsWon(true);
      setShowSubmitModal(true);
      if (moves + 1 < bestMoves) {
        setBestMoves(moves + 1);
        localStorage.setItem("memoryBestMoves", (moves + 1).toString());
      }
    }
  }, [cards, moves, bestMoves]);

  const handleCardClick = (index: number) => {
    if (
      flippedIndices.length === 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched
    )
      return;

    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, isFlipped: true } : card))
    );
    setFlippedIndices((prev) => [...prev, index]);

    if (flippedIndices.length === 1) {
      setMoves((m) => m + 1);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Top Stats Bar */}
      <div className="w-full max-w-[500px] flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
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

      {/* Game Board Area */}
      <div className="relative w-full max-w-[500px]">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10"></div>
        
        <div className="relative bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl min-h-[480px] w-full flex items-center justify-center">
          
          {/* Start Screen Overlay */}
          {!isPlaying && !isWon && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
                <Play className="w-10 h-10 text-blue-600 ml-1" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Memory Match</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Flip the tiles and find all matching pairs in the fewest moves possible.
              </p>
              <button
                onClick={initGame}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full max-w-[250px]"
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
                Solved in <span className="font-black text-indigo-600 text-xl">{moves}</span> moves.
              </p>
              <button
                onClick={initGame}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full max-w-[250px]"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Play Again
              </button>
            </div>
          )}

          {/* Cards Grid */}
          <div className="w-full h-full">
            {cards.length > 0 && (
              <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full h-full aspect-square max-w-[400px] mx-auto">
                {cards.map((card, index) => (
                  <div
                    key={index}
                    onClick={() => handleCardClick(index)}
                    className="relative w-full h-full [perspective:1000px] cursor-pointer group"
                  >
                    <div
                      className={`w-full h-full transition-transform duration-500 [transform-style:preserve-3d] shadow-sm rounded-xl ${
                        card.isFlipped || card.isMatched ? "[transform:rotateY(180deg)]" : "group-hover:-translate-y-1"
                      }`}
                    >
                      {/* Card Back (Question Mark) */}
                      <div className="absolute inset-0 [backface-visibility:hidden] bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                          <span className="text-gray-300 font-black text-lg">?</span>
                        </div>
                      </div>
                      
                      {/* Card Front (Icon) */}
                      <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center rounded-xl text-white border-2 border-transparent ${
                        card.isMatched 
                          ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/30 border-white/20" 
                          : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30 border-white/20"
                      }`}>
                        {card.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      
      <SubmitScoreModal
        isOpen={showSubmitModal}
        score={Math.max(0, 1000 - moves * 10)}
        gameId="memory"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
