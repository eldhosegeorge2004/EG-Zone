/* eslint-disable */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Rocket, Plane, Car, Bike, Train, Bus, Ship, Tractor, Play, RotateCcw, Trophy, Users, User } from "lucide-react";
import SubmitScoreModal from "@/components/SubmitScoreModal";

type Card = {
  id: number;
  iconId: string;
  icon: React.ReactNode;
  isFlipped: boolean;
  isMatched: boolean;
  matchedBy?: number; // Player index (0, 1, 2, 3) who matched it
};

type PlayerConfig = {
  name: string;
  colorName: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  glowColor: string;
  cardMatchedBg: string;
};

const PLAYERS: PlayerConfig[] = [
  {
    name: "Player 1",
    colorName: "Blue",
    badgeBg: "bg-blue-500",
    badgeText: "text-blue-600",
    borderColor: "border-blue-500 ring-4 ring-blue-500/20",
    glowColor: "shadow-blue-500/30",
    cardMatchedBg: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30",
  },
  {
    name: "Player 2",
    colorName: "Red",
    badgeBg: "bg-rose-500",
    badgeText: "text-rose-600",
    borderColor: "border-rose-500 ring-4 ring-rose-500/20",
    glowColor: "shadow-rose-500/30",
    cardMatchedBg: "bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30",
  },
  {
    name: "Player 3",
    colorName: "Green",
    badgeBg: "bg-emerald-500",
    badgeText: "text-emerald-600",
    borderColor: "border-emerald-500 ring-4 ring-emerald-500/20",
    glowColor: "shadow-emerald-500/30",
    cardMatchedBg: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30",
  },
  {
    name: "Player 4",
    colorName: "Orange",
    badgeBg: "bg-amber-500",
    badgeText: "text-amber-600",
    borderColor: "border-amber-500 ring-4 ring-amber-500/20",
    glowColor: "shadow-amber-500/30",
    cardMatchedBg: "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30",
  },
];

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
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [playerScores, setPlayerScores] = useState<number[]>([0, 0, 0, 0]);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [bestMoves, setBestMoves] = useState(Infinity);
  const [isWon, setIsWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("memoryBestMoves");
    if (saved) setBestMoves(parseInt(saved, 10));
  }, []);

  const initGame = useCallback((players = playerCount) => {
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
    setActivePlayer(0);
    setPlayerScores(new Array(players).fill(0));
    setIsWon(false);
    setIsPlaying(true);
    setShowSubmitModal(false);
    setStatusMessage("");
  }, [playerCount]);

  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [first, second] = flippedIndices;
      if (cards[first].iconId === cards[second].iconId) {
        // MATCH FOUND
        const claimingPlayer = activePlayer;
        setCards((prev) =>
          prev.map((card, i) =>
            i === first || i === second
              ? { ...card, isMatched: true, matchedBy: claimingPlayer }
              : card
          )
        );

        if (playerCount > 1) {
          setPlayerScores((prev) => {
            const next = [...prev];
            next[claimingPlayer] += 1;
            return next;
          });
          setStatusMessage(`${PLAYERS[claimingPlayer].name} found a pair! Extra turn!`);
        }

        setFlippedIndices([]);
        // In classic rules, matching player gets another turn
      } else {
        // MISMATCH
        const timer = setTimeout(() => {
          setCards((prev) =>
            prev.map((card, i) =>
              i === first || i === second ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedIndices([]);

          // Switch to next player in multiplayer
          if (playerCount > 1) {
            setActivePlayer((curr) => (curr + 1) % playerCount);
            setStatusMessage("");
          }
        }, 750);
        return () => clearTimeout(timer);
      }
    }
  }, [flippedIndices, cards, activePlayer, playerCount]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.isMatched)) {
      setIsWon(true);
      if (playerCount === 1) {
        setShowSubmitModal(true);
        if (moves < bestMoves) {
          setBestMoves(moves);
          localStorage.setItem("memoryBestMoves", moves.toString());
        }
      }
    }
  }, [cards, moves, bestMoves, playerCount]);

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

  // Determine winner for multiplayer
  const getMultiplayerWinner = () => {
    const scores = playerScores.slice(0, playerCount);
    const maxScore = Math.max(...scores);
    const winners = scores
      .map((s, idx) => (s === maxScore ? idx : -1))
      .filter((idx) => idx !== -1);

    if (winners.length === 1) {
      const winner = PLAYERS[winners[0]];
      return {
        isTie: false,
        name: winner.name,
        colorText: winner.badgeText,
        score: maxScore,
      };
    } else {
      const winnerNames = winners.map((idx) => PLAYERS[idx].name).join(" & ");
      return {
        isTie: true,
        name: winnerNames,
        colorText: "text-amber-500",
        score: maxScore,
      };
    }
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto">
      {/* Mode / Player Count Selector */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 bg-white px-5 py-3.5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Players:</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => {
                setPlayerCount(count);
                if (isPlaying) {
                  initGame(count);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                playerCount === count
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {count === 1 ? "1 Solo" : `${count}P`}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stats Bar */}
      {playerCount === 1 ? (
        // Solo Mode Stats
        <div className="w-full flex justify-between items-center mb-6 bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
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
      ) : (
        // Multiplayer Scoreboard
        <div className="w-full mb-6 flex flex-col gap-3">
          <div className={`grid grid-cols-${playerCount} gap-2 sm:gap-3`}>
            {Array.from({ length: playerCount }).map((_, idx) => {
              const p = PLAYERS[idx];
              const isTurn = activePlayer === idx && isPlaying && !isWon;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl p-3 border-2 transition-all flex flex-col items-center text-center ${
                    isTurn ? p.borderColor : "border-gray-200 opacity-80"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${p.badgeBg}`} />
                    <span className="text-xs font-bold text-gray-600 truncate">{p.name}</span>
                  </div>
                  <span className={`text-2xl font-black ${p.badgeText}`}>
                    {playerScores[idx]}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">Pairs</span>
                  {isTurn && (
                    <span className={`mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${p.badgeBg} text-white animate-pulse`}>
                      Turn
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Turn Feedback Banner */}
          {statusMessage && (
            <div className="text-center text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-xl animate-fade-in">
              {statusMessage}
            </div>
          )}
        </div>
      )}

      {/* Game Board Area */}
      <div className="relative w-full">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur opacity-15 transition duration-1000 -z-10" />
        
        <div className="relative bg-white p-4 sm:p-8 rounded-3xl border border-gray-200 shadow-xl min-h-[460px] w-full flex items-center justify-center">
          
          {/* Start Screen Overlay */}
          {!isPlaying && !isWon && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-3xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-inner border border-blue-100">
                {playerCount === 1 ? (
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 ml-1" />
                ) : (
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 sm:mb-3 tracking-tight">
                {playerCount === 1 ? "Memory Match" : `${playerCount}-Player Memory Match`}
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 max-w-[290px] font-medium leading-relaxed">
                {playerCount === 1
                  ? "Flip the cards and find all matching pairs in the fewest moves possible."
                  : `Take turns flipping 2 cards. Each match scores 1 point and gives an extra turn! Most pairs wins.`}
              </p>
              <button
                type="button"
                onClick={() => initGame(playerCount)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-base sm:text-lg w-full max-w-[240px]"
              >
                Start Game
              </button>
            </div>
          )}

          {/* Win / Game Over Screen Overlay */}
          {isWon && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-3xl">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-inner border border-green-100">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500" />
              </div>

              {playerCount === 1 ? (
                // Solo Winner
                <>
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">You Win!</h2>
                  <p className="text-gray-500 text-base sm:text-lg mb-8 font-medium">
                    Solved in <span className="font-black text-indigo-600 text-xl">{moves}</span> moves.
                  </p>
                </>
              ) : (
                // Multiplayer Winner
                (() => {
                  const winner = getMultiplayerWinner();
                  return (
                    <>
                      <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2 tracking-tight">
                        {winner.isTie ? "It's a Tie!" : "Game Over!"}
                      </h2>
                      <p className="text-gray-600 text-lg sm:text-xl font-bold mb-2">
                        {winner.isTie ? (
                          <span className={winner.colorText}>{winner.name} tied!</span>
                        ) : (
                          <span className={winner.colorText}>🏆 {winner.name} Wins!</span>
                        )}
                      </p>
                      <p className="text-gray-500 text-sm mb-6 font-medium">
                        Highest score: <span className="font-black text-gray-900">{winner.score}</span> pairs matched.
                      </p>

                      {/* Mini Final Standings */}
                      <div className="w-full max-w-xs flex justify-center gap-2 mb-6">
                        {Array.from({ length: playerCount }).map((_, idx) => (
                          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-center flex-1">
                            <span className="text-[10px] font-bold text-gray-400 block">{PLAYERS[idx].name}</span>
                            <span className="text-lg font-black text-gray-800">{playerScores[idx]}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()
              )}

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => initGame(playerCount)}
                  className="flex-1 flex items-center justify-center bg-gray-900 text-white px-6 py-3.5 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md text-base"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Play Again
                </button>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          <div className="w-full h-full">
            {cards.length > 0 && (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full h-full aspect-square max-w-[400px] mx-auto">
                {cards.map((card, index) => {
                  const matchedPlayer = typeof card.matchedBy === "number" ? PLAYERS[card.matchedBy] : null;
                  // In solo mode, correctly matched cards turn vibrant green.
                  // In multiplayer, matched cards show the claiming player's unique color.
                  const matchedBg = playerCount === 1
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30 border-emerald-300/40"
                    : (matchedPlayer ? matchedPlayer.cardMatchedBg : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30");

                  return (
                    <div
                      key={index}
                      onClick={() => handleCardClick(index)}
                      className="relative w-full h-full [perspective:1000px] cursor-pointer group"
                    >
                      <div
                        className={`w-full h-full transition-transform duration-500 [transform-style:preserve-3d] shadow-sm rounded-xl ${
                          card.isFlipped || card.isMatched
                            ? "[transform:rotateY(180deg)]"
                            : "group-hover:-translate-y-1"
                        }`}
                      >
                        {/* Card Back (Question Mark) */}
                        <div className="absolute inset-0 [backface-visibility:hidden] bg-gray-50 border-2 border-gray-200 rounded-xl flex items-center justify-center">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                            <span className="text-gray-300 font-black text-base sm:text-lg">?</span>
                          </div>
                        </div>
                        
                        {/* Card Front (Icon) */}
                        <div
                          className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center rounded-xl text-white border-2 border-white/20 shadow-md ${
                            card.isMatched
                              ? matchedBg
                              : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30"
                          }`}
                        >
                          {card.icon}
                          {card.isMatched && matchedPlayer && playerCount > 1 && (
                            <span className="text-[9px] font-black tracking-wider uppercase opacity-90 mt-0.5">
                              {matchedPlayer.name.replace("Player ", "P")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
      
      {/* Submit Score Modal (Solo Mode only) */}
      <SubmitScoreModal
        isOpen={showSubmitModal && playerCount === 1}
        score={Math.max(0, 1000 - moves * 10)}
        gameId="memory"
        onClose={() => setShowSubmitModal(false)}
      />
    </div>
  );
}
