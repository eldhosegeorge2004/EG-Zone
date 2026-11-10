/* eslint-disable */
"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { Chess, Square, PieceSymbol, Color } from "chess.js";
import { RotateCcw, Trophy, Users, Bot, Undo2, ArrowUpDown } from "lucide-react";

// Piece value mapping for AI evaluation
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece Square Tables for basic positional play
const PST_PAWN = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const PST_KNIGHT = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

// SVG Chess Piece components for crisp vector rendering on all displays
function ChessPieceIcon({ type, color }: { type: PieceSymbol; color: Color }) {
  const isWhite = color === "w";
  const stroke = isWhite ? "#262626" : "#000000";
  const fill = isWhite ? "#ffffff" : "#27272a";
  const shadow = isWhite ? "drop-shadow(0px 2px 2px rgba(0,0,0,0.25))" : "drop-shadow(0px 2px 2px rgba(0,0,0,0.4))";

  // Unicode piece symbols rendered with custom typography styling
  const symbols: Record<PieceSymbol, { w: string; b: string }> = {
    k: { w: "♔", b: "♚" },
    q: { w: "♕", b: "♛" },
    r: { w: "♖", b: "♜" },
    b: { w: "♗", b: "♝" },
    n: { w: "♘", b: "♞" },
    p: { w: "♙", b: "♟" },
  };

  const symbol = isWhite ? symbols[type].w : symbols[type].b;

  return (
    <span
      className={`text-4xl sm:text-5xl font-normal leading-none select-none transition-transform duration-100 ${
        isWhite ? "text-slate-100 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" : "text-zinc-900 drop-shadow-[0_2px_2px_rgba(255,255,255,0.4)]"
      }`}
      style={{
        filter: isWhite ? "drop-shadow(0px 1px 2px rgba(0,0,0,0.9))" : "drop-shadow(0px 1px 1px rgba(0,0,0,0.5))",
      }}
    >
      {symbol}
    </span>
  );
}

export default function ChessGame() {
  const [game, setGame] = useState(() => new Chess());
  const [board, setBoard] = useState(() => game.board());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [gameMode, setGameMode] = useState<"ai" | "pass">("ai");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [flipped, setFlipped] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [, startTransition] = useTransition();

  // Sync board representation whenever game moves occur
  const updateGameState = useCallback((newGameInstance: Chess) => {
    setBoard(newGameInstance.board());
    setHistory(newGameInstance.history());
  }, []);

  const resetGame = useCallback(() => {
    const newG = new Chess();
    setGame(newG);
    updateGameState(newG);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setPendingPromotion(null);
    setIsThinking(false);
  }, [updateGameState]);

  // AI Move calculation
  const makeAIMove = useCallback(() => {
    if (game.isGameOver() || game.turn() !== "b") return;

    setIsThinking(true);

    setTimeout(() => {
      const moves = game.moves({ verbose: true });
      if (moves.length === 0) {
        setIsThinking(false);
        return;
      }

      let chosenMove = moves[0];

      if (aiDifficulty === "easy") {
        // Random move with slight preference for captures
        const captures = moves.filter((m) => m.captured);
        chosenMove = (captures.length > 0 && Math.random() < 0.6)
          ? captures[Math.floor(Math.random() * captures.length)]
          : moves[Math.floor(Math.random() * moves.length)];
      } else if (aiDifficulty === "medium") {
        // 1-ply evaluation: maximize material + captures
        let bestScore = -Infinity;
        for (const m of moves) {
          game.move(m);
          let score = 0;
          if (m.captured) score += PIECE_VALUES[m.captured];
          if (game.isCheckmate()) score += 10000;
          if (game.inCheck()) score += 40;
          game.undo();

          // Add minor noise for variety
          score += Math.random() * 15;
          if (score > bestScore) {
            bestScore = score;
            chosenMove = m;
          }
        }
      } else {
        // Hard: 2-ply Minimax with piece square heuristics
        let bestVal = -Infinity;
        for (const m of moves) {
          game.move(m);
          let val = 0;
          if (m.captured) val += PIECE_VALUES[m.captured];
          if (game.isCheckmate()) val += 10000;

          // Opponent best reply
          const oppMoves = game.moves({ verbose: true });
          let maxOppReply = 0;
          for (const oppM of oppMoves) {
            let oppVal = oppM.captured ? PIECE_VALUES[oppM.captured] : 0;
            if (oppVal > maxOppReply) maxOppReply = oppVal;
          }
          val -= maxOppReply;
          game.undo();

          if (val > bestVal) {
            bestVal = val;
            chosenMove = m;
          }
        }
      }

      try {
        game.move(chosenMove);
        setLastMove({ from: chosenMove.from as Square, to: chosenMove.to as Square });
        updateGameState(game);
      } catch (err) {
        console.error("AI move error:", err);
      } finally {
        setIsThinking(false);
      }
    }, 350);
  }, [game, aiDifficulty, updateGameState]);

  // Execute a player move
  const handleMove = useCallback((from: Square, to: Square, promotionPiece = "q") => {
    try {
      const move = game.move({
        from,
        to,
        promotion: promotionPiece,
      });

      if (move) {
        setLastMove({ from, to });
        setSelectedSquare(null);
        setPossibleMoves([]);
        setPendingPromotion(null);
        updateGameState(game);

        // If playing vs AI and game is not over, schedule AI turn
        if (gameMode === "ai" && !game.isGameOver()) {
          setTimeout(makeAIMove, 200);
        }
      }
    } catch {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  }, [game, gameMode, makeAIMove, updateGameState]);

  // Click handler on squares
  const onSquareClick = (square: Square) => {
    if (isThinking || game.isGameOver()) return;

    // Check if player clicked a destination square of a currently selected piece
    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return;
      }

      // Check if move requires pawn promotion
      const piece = game.get(selectedSquare);
      const isPawnPromotion =
        piece &&
        piece.type === "p" &&
        ((piece.color === "w" && square[1] === "8") || (piece.color === "b" && square[1] === "1"));

      if (isPawnPromotion && possibleMoves.includes(square)) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }

      if (possibleMoves.includes(square)) {
        handleMove(selectedSquare, square);
        return;
      }
    }

    // Otherwise, select piece if it's the current player's piece
    const piece = game.get(square);
    const playerColor = game.turn();

    if (gameMode === "ai" && playerColor === "b") return; // Can't touch AI pieces on AI turn

    if (piece && piece.color === playerColor) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true }).map((m) => m.to as Square);
      setPossibleMoves(moves);
    } else {
      setSelectedSquare(null);
      setPossibleMoves([]);
    }
  };

  const undoMove = () => {
    if (isThinking || history.length === 0) return;
    if (gameMode === "ai") {
      game.undo(); // Undo AI
      game.undo(); // Undo Player
    } else {
      game.undo();
    }
    updateGameState(game);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
  };

  // Determine game status message
  let statusBanner = null;
  if (game.isCheckmate()) {
    const winner = game.turn() === "w" ? "Black" : "White";
    statusBanner = {
      title: `Checkmate! ${winner} Wins! 🏆`,
      color: "bg-emerald-500 text-white",
    };
  } else if (game.isDraw()) {
    let reason = "Draw";
    if (game.isStalemate()) reason = "Stalemate";
    else if (game.isThreefoldRepetition()) reason = "Threefold Repetition";
    else if (game.isInsufficientMaterial()) reason = "Insufficient Material";
    statusBanner = {
      title: `Game Drawn (${reason}) 🤝`,
      color: "bg-amber-500 text-white",
    };
  } else if (game.inCheck()) {
    const checkedPlayer = game.turn() === "w" ? "White" : "Black";
    statusBanner = {
      title: `${checkedPlayer} is in Check! ⚠️`,
      color: "bg-rose-500 text-white",
    };
  }

  // Calculate captured pieces & material difference
  const boardFen = game.fen().split(" ")[0];
  type PieceType = "p" | "n" | "b" | "r" | "q";
  const initialCounts: Record<PieceType, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const currentCounts: { w: Record<PieceType, number>; b: Record<PieceType, number> } = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 },
  };

  for (const char of boardFen) {
    const lower = char.toLowerCase() as PieceType;
    if (lower in initialCounts) {
      if (char === char.toUpperCase()) {
        currentCounts.w[lower]++;
      } else {
        currentCounts.b[lower]++;
      }
    }
  }

  const capturedByWhite: PieceType[] = [];
  const capturedByBlack: PieceType[] = [];

  (["q", "r", "b", "n", "p"] as PieceType[]).forEach((p) => {
    const lostByBlack = initialCounts[p] - currentCounts.b[p];
    for (let i = 0; i < lostByBlack; i++) capturedByWhite.push(p);

    const lostByWhite = initialCounts[p] - currentCounts.w[p];
    for (let i = 0; i < lostByWhite; i++) capturedByBlack.push(p);
  });

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  const displayedFiles = flipped ? [...files].reverse() : files;
  const displayedRanks = flipped ? [...ranks].reverse() : ranks;

  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto">
      {/* Mode Controls Bar */}
      <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-4 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setGameMode("ai");
              resetGame();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              gameMode === "ai" ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Bot className="w-4 h-4" /> vs Computer
          </button>
          <button
            type="button"
            onClick={() => {
              setGameMode("pass");
              resetGame();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              gameMode === "pass" ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Users className="w-4 h-4" /> 2 Players
          </button>
        </div>

        {gameMode === "ai" && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {(["easy", "medium", "hard"] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setAiDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase transition-all ${
                  aiDifficulty === diff ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            title="Flip Board"
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={undoMove}
            disabled={history.length === 0 || isThinking}
            title="Undo Move"
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 text-gray-700 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetGame}
            title="New Game"
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Player Status (Black) */}
      <div className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 rounded-xl mb-2 border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-zinc-700" />
          <span className="font-bold text-sm text-gray-800">
            {gameMode === "ai" ? `Computer (${aiDifficulty.toUpperCase()})` : "Black"}
          </span>
          {game.turn() === "b" && !game.isGameOver() && (
            <span className="text-[10px] bg-zinc-800 text-white font-black px-2 py-0.5 rounded-full animate-pulse">
              {isThinking ? "Thinking..." : "Turn"}
            </span>
          )}
        </div>
        <div className="flex gap-1 text-xs text-gray-500">
          {capturedByWhite.map((p, i) => (
            <span key={i} className="font-serif">
              {{ p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" }[p]}
            </span>
          ))}
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusBanner && (
        <div className={`w-full py-2 px-4 rounded-xl mb-2 font-black text-xs text-center shadow-sm animate-fade-in ${statusBanner.color}`}>
          {statusBanner.title}
        </div>
      )}

      {/* Chessboard */}
      <div className="relative w-full aspect-square max-w-[480px] bg-amber-900/10 p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-xl border-4 border-amber-950/20">
        <div className="w-full h-full grid grid-cols-8 grid-rows-8 rounded-xl overflow-hidden shadow-inner border border-amber-900/40">
          {displayedRanks.map((rank) =>
            displayedFiles.map((file) => {
              const square = `${file}${rank}` as Square;
              const fileIdx = files.indexOf(file);
              const rankIdx = 8 - rank;
              const isLight = (fileIdx + rankIdx) % 2 === 0;
              const piece = game.get(square);
              const isSelected = selectedSquare === square;
              const isPossible = possibleMoves.includes(square);
              const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);

              return (
                <div
                  key={square}
                  onClick={() => onSquareClick(square)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                    isLight ? "bg-[#f0d9b5]" : "bg-[#b58863]"
                  } ${isLastMoveSquare ? "!bg-[#cdd26a]" : ""} ${
                    isSelected ? "!bg-[#f7ec74]" : ""
                  }`}
                >
                  {/* File & Rank labels on corner squares */}
                  {file === (flipped ? "h" : "a") && (
                    <span
                      className={`absolute top-0.5 left-1 text-[9px] font-bold select-none ${
                        isLight ? "text-[#b58863]" : "text-[#f0d9b5]"
                      }`}
                    >
                      {rank}
                    </span>
                  )}
                  {rank === (flipped ? 8 : 1) && (
                    <span
                      className={`absolute bottom-0.5 right-1 text-[9px] font-bold select-none ${
                        isLight ? "text-[#b58863]" : "text-[#f0d9b5]"
                      }`}
                    >
                      {file}
                    </span>
                  )}

                  {/* Move destination indicators */}
                  {isPossible && !piece && (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-600/40 pointer-events-none" />
                  )}
                  {isPossible && piece && (
                    <div className="absolute inset-0 border-4 border-rose-500/60 rounded-sm pointer-events-none" />
                  )}

                  {/* Piece */}
                  {piece && (
                    <ChessPieceIcon type={piece.type} color={piece.color} />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Promotion Modal */}
        {pendingPromotion && (
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 rounded-2xl">
            <div className="bg-white p-5 rounded-2xl shadow-2xl text-center max-w-xs border border-gray-100 animate-in zoom-in-95">
              <h3 className="font-black text-gray-900 text-lg mb-1">Promote Pawn</h3>
              <p className="text-gray-500 text-xs mb-4">Choose your new piece:</p>
              <div className="flex justify-center gap-3">
                {[
                  { type: "q", name: "Queen", sym: "♛" },
                  { type: "r", name: "Rook", sym: "♜" },
                  { type: "b", name: "Bishop", sym: "♝" },
                  { type: "n", name: "Knight", sym: "♞" },
                ].map(({ type, name, sym }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleMove(pendingPromotion.from, pendingPromotion.to, type)}
                    className="w-14 h-16 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center text-3xl font-serif text-gray-800 transition-all hover:scale-105"
                  >
                    <span>{sym}</span>
                    <span className="text-[9px] font-sans font-bold text-gray-500">{name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Player Status (White) */}
      <div className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 rounded-xl mt-2 border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-white border border-gray-400" />
          <span className="font-bold text-sm text-gray-800">
            {gameMode === "ai" ? "You (White)" : "White"}
          </span>
          {game.turn() === "w" && !game.isGameOver() && (
            <span className="text-[10px] bg-indigo-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse">
              Turn
            </span>
          )}
        </div>
        <div className="flex gap-1 text-xs text-gray-500">
          {capturedByBlack.map((p, i) => (
            <span key={i} className="font-serif">
              {{ p: "♙", n: "♘", b: "♗", r: "♖", q: "♕" }[p]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
