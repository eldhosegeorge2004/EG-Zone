/* eslint-disable */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw, Trophy, Users, Bot, Undo2, Sparkles } from "lucide-react";

type Player = "R" | "Y"; // R = Red (Player 1), Y = Yellow (Player 2 / AI)
type BoardState = (Player | null)[][]; // 6 rows, 7 cols

const ROWS = 6;
const COLS = 7;

// Find lowest available row in a column
function getAvailableRow(board: BoardState, col: number): number | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) return r;
  }
  return null;
}

// Check for 4 in a row and return winning coordinates if found
function checkWin(board: BoardState): { winner: Player; cells: [number, number][] } | null {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const p = board[r][c];
      if (p && p === board[r][c + 1] && p === board[r][c + 2] && p === board[r][c + 3]) {
        return {
          winner: p,
          cells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]],
        };
      }
    }
  }

  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      const p = board[r][c];
      if (p && p === board[r + 1][c] && p === board[r + 2][c] && p === board[r + 3][c]) {
        return {
          winner: p,
          cells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]],
        };
      }
    }
  }

  // Diagonal Down-Right (\)
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const p = board[r][c];
      if (p && p === board[r + 1][c + 1] && p === board[r + 2][c + 2] && p === board[r + 3][c + 3]) {
        return {
          winner: p,
          cells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]],
        };
      }
    }
  }

  // Diagonal Up-Right (/)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const p = board[r][c];
      if (p && p === board[r - 1][c + 1] && p === board[r - 2][c + 2] && p === board[r - 3][c + 3]) {
        return {
          winner: p,
          cells: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]],
        };
      }
    }
  }

  return null;
}

// Check if board is full (draw)
function isBoardFull(board: BoardState): boolean {
  return board[0].every((cell) => cell !== null);
}

// AI Evaluation heuristic
function evaluateWindow(window: (Player | null)[], piece: Player): number {
  const oppPiece: Player = piece === "Y" ? "R" : "Y";
  let score = 0;

  const countPiece = window.filter((c) => c === piece).length;
  const countEmpty = window.filter((c) => c === null).length;
  const countOpp = window.filter((c) => c === oppPiece).length;

  if (countPiece === 4) score += 1000;
  else if (countPiece === 3 && countEmpty === 1) score += 12;
  else if (countPiece === 2 && countEmpty === 2) score += 4;

  if (countOpp === 3 && countEmpty === 1) score -= 80; // Block enemy 3 in a row
  else if (countOpp === 2 && countEmpty === 2) score -= 6;

  return score;
}

function scoreBoard(board: BoardState, piece: Player): number {
  let score = 0;

  // Center column preference
  const centerCol = Math.floor(COLS / 2);
  let centerCount = 0;
  for (let r = 0; r < ROWS; r++) {
    if (board[r][centerCol] === piece) centerCount++;
  }
  score += centerCount * 6;

  // Horizontal windows
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const win = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
      score += evaluateWindow(win, piece);
    }
  }

  // Vertical windows
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      const win = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += evaluateWindow(win, piece);
    }
  }

  // Diagonal Down-Right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const win = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += evaluateWindow(win, piece);
    }
  }

  // Diagonal Up-Right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      const win = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
      score += evaluateWindow(win, piece);
    }
  }

  return score;
}

function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { col: number; score: number } {
  const win = checkWin(board);
  if (win) {
    return { col: -1, score: win.winner === "Y" ? 100000 + depth : -100000 - depth };
  }
  if (isBoardFull(board) || depth === 0) {
    return { col: -1, score: scoreBoard(board, "Y") };
  }

  // Order columns from center outwards for optimal alpha-beta pruning
  const colOrder = [3, 2, 4, 1, 5, 0, 6];
  const validCols = colOrder.filter((c) => getAvailableRow(board, c) !== null);

  if (isMaximizing) {
    let maxScore = -Infinity;
    let bestCol = validCols[0];

    for (const c of validCols) {
      const r = getAvailableRow(board, c)!;
      board[r][c] = "Y";
      const result = minimax(board, depth - 1, alpha, beta, false);
      board[r][c] = null;

      if (result.score > maxScore) {
        maxScore = result.score;
        bestCol = c;
      }
      alpha = Math.max(alpha, maxScore);
      if (alpha >= beta) break;
    }
    return { col: bestCol, score: maxScore };
  } else {
    let minScore = Infinity;
    let bestCol = validCols[0];

    for (const c of validCols) {
      const r = getAvailableRow(board, c)!;
      board[r][c] = "R";
      const result = minimax(board, depth - 1, alpha, beta, true);
      board[r][c] = null;

      if (result.score < minScore) {
        minScore = result.score;
        bestCol = c;
      }
      beta = Math.min(beta, minScore);
      if (alpha >= beta) break;
    }
    return { col: bestCol, score: minScore };
  }
}

export default function Connect4Game() {
  const [board, setBoard] = useState<BoardState>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );
  const [turn, setTurn] = useState<Player>("R");
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<"ai" | "pass">("ai");
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [scores, setScores] = useState({ red: 0, yellow: 0, draws: 0 });
  const [history, setHistory] = useState<{ board: BoardState; turn: Player }[]>([]);

  const resetBoard = useCallback(() => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setTurn("R");
    setWinner(null);
    setWinningCells([]);
    setHistory([]);
    setIsAiThinking(false);
  }, []);

  const resetScores = () => {
    resetBoard();
    setScores({ red: 0, yellow: 0, draws: 0 });
  };

  const makeMove = useCallback(
    (col: number, playerToPlay = turn): boolean => {
      const r = getAvailableRow(board, col);
      if (r === null || winner) return false;

      // Save history for undo
      setHistory((prev) => [
        ...prev,
        {
          board: board.map((row) => [...row]),
          turn: playerToPlay,
        },
      ]);

      const newBoard = board.map((row) => [...row]);
      newBoard[r][col] = playerToPlay;
      setBoard(newBoard);

      const winResult = checkWin(newBoard);
      if (winResult) {
        setWinner(winResult.winner);
        setWinningCells(winResult.cells);
        setScores((s) => ({
          ...s,
          red: winResult.winner === "R" ? s.red + 1 : s.red,
          yellow: winResult.winner === "Y" ? s.yellow + 1 : s.yellow,
        }));
        return true;
      }

      if (isBoardFull(newBoard)) {
        setWinner("Draw");
        setScores((s) => ({ ...s, draws: s.draws + 1 }));
        return true;
      }

      setTurn(playerToPlay === "R" ? "Y" : "R");
      return true;
    },
    [board, turn, winner]
  );

  // Trigger AI move when it is Yellow's turn in "ai" mode
  useEffect(() => {
    if (gameMode !== "ai" || turn !== "Y" || winner || isAiThinking) return;

    setIsAiThinking(true);
    const timeout = setTimeout(() => {
      const colOrder = [3, 2, 4, 1, 5, 0, 6];
      const validCols = colOrder.filter((c) => getAvailableRow(board, c) !== null);
      if (validCols.length === 0) {
        setIsAiThinking(false);
        return;
      }

      let chosenCol = validCols[0];

      if (aiDifficulty === "easy") {
        // Mostly random with immediate win check
        const winningCol = validCols.find((c) => {
          const r = getAvailableRow(board, c)!;
          board[r][c] = "Y";
          const isWin = !!checkWin(board);
          board[r][c] = null;
          return isWin;
        });
        chosenCol = winningCol !== undefined ? winningCol : validCols[Math.floor(Math.random() * validCols.length)];
      } else if (aiDifficulty === "medium") {
        // Immediate win or block; else depth 2 minimax
        const winCol = validCols.find((c) => {
          const r = getAvailableRow(board, c)!;
          board[r][c] = "Y";
          const isWin = !!checkWin(board);
          board[r][c] = null;
          return isWin;
        });
        const blockCol = validCols.find((c) => {
          const r = getAvailableRow(board, c)!;
          board[r][c] = "R";
          const isBlock = !!checkWin(board);
          board[r][c] = null;
          return isBlock;
        });

        if (winCol !== undefined) chosenCol = winCol;
        else if (blockCol !== undefined) chosenCol = blockCol;
        else {
          const { col } = minimax(board, 2, -Infinity, Infinity, true);
          chosenCol = col !== -1 ? col : validCols[0];
        }
      } else {
        // Hard: 4-ply minimax with full heuristic
        const { col } = minimax(board, 4, -Infinity, Infinity, true);
        chosenCol = col !== -1 ? col : validCols[0];
      }

      makeMove(chosenCol, "Y");
      setIsAiThinking(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [gameMode, turn, winner, board, aiDifficulty, makeMove, isAiThinking]);

  const handleColumnClick = (col: number) => {
    if (isAiThinking || winner) return;
    if (gameMode === "ai" && turn !== "R") return;

    makeMove(col, turn);
  };

  const handleUndo = () => {
    if (history.length === 0 || isAiThinking) return;

    if (gameMode === "ai") {
      // In AI mode, undo two moves (player and AI) unless AI hasn't moved yet
      const stepsToUndo = history.length >= 2 ? 2 : 1;
      const targetState = history[history.length - stepsToUndo];
      setBoard(targetState.board);
      setTurn(targetState.turn);
      setHistory((prev) => prev.slice(0, prev.length - stepsToUndo));
    } else {
      const targetState = history[history.length - 1];
      setBoard(targetState.board);
      setTurn(targetState.turn);
      setHistory((prev) => prev.slice(0, -1));
    }

    setWinner(null);
    setWinningCells([]);
  };

  const isWinningCell = (r: number, c: number) => {
    return winningCells.some(([wr, wc]) => wr === r && wc === c);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-xl mx-auto">
      {/* Top Controls Bar */}
      <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-4 bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setGameMode("ai");
              resetBoard();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              gameMode === "ai"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Bot className="w-3.5 h-3.5" /> vs Computer
          </button>
          <button
            type="button"
            onClick={() => {
              setGameMode("pass");
              resetBoard();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              gameMode === "pass"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> 2 Players
          </button>
        </div>

        {gameMode === "ai" && (
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {(["easy", "medium", "hard"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setAiDifficulty(lvl);
                  resetBoard();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  aiDifficulty === lvl
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0 || isAiThinking}
            title="Undo Move"
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-30 rounded-xl transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetBoard}
            title="Restart Game"
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scoreboard Banner */}
      <div className="w-full grid grid-cols-3 gap-3 mb-4">
        {/* Red Player Card */}
        <div
          className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
            turn === "R" && !winner
              ? "bg-rose-50 border-rose-500 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/20"
              : "bg-white border-gray-100 opacity-80"
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
            <span className="text-xs font-bold text-gray-700">
              {gameMode === "ai" ? "You (Red)" : "Player 1"}
            </span>
          </div>
          <span className="text-2xl font-black text-rose-600">{scores.red}</span>
          {turn === "R" && !winner && (
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 mt-0.5 animate-pulse">
              Your Turn
            </span>
          )}
        </div>

        {/* Draws Card */}
        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-gray-100">
          <span className="text-xs font-bold text-gray-400">Ties</span>
          <span className="text-2xl font-black text-gray-700 mt-1">{scores.draws}</span>
        </div>

        {/* Yellow Player Card */}
        <div
          className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${
            turn === "Y" && !winner
              ? "bg-amber-50 border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20"
              : "bg-white border-gray-100 opacity-80"
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
            <span className="text-xs font-bold text-gray-700">
              {gameMode === "ai" ? "Computer" : "Player 2"}
            </span>
          </div>
          <span className="text-2xl font-black text-amber-500">{scores.yellow}</span>
          {turn === "Y" && !winner && (
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 mt-0.5 animate-pulse">
              {isAiThinking ? "Thinking..." : "Turn"}
            </span>
          )}
        </div>
      </div>

      {/* Win / Alert Banner */}
      {winner && (
        <div
          className={`w-full py-3 px-6 rounded-2xl mb-4 font-black text-sm text-center shadow-lg transition-all animate-bounce ${
            winner === "R"
              ? "bg-rose-500 text-white shadow-rose-500/30"
              : winner === "Y"
              ? "bg-amber-500 text-white shadow-amber-500/30"
              : "bg-gray-800 text-white shadow-gray-800/30"
          }`}
        >
          {winner === "Draw"
            ? "It's a Tie! Board is full."
            : winner === "R"
            ? `🎉 ${gameMode === "ai" ? "You Won!" : "Player 1 (Red) Wins!"}`
            : `🏆 ${gameMode === "ai" ? "Computer Wins!" : "Player 2 (Yellow) Wins!"}`}
          <button
            onClick={resetBoard}
            className="ml-3 underline uppercase text-xs font-bold tracking-wider hover:opacity-80"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Connect 4 Board Container */}
      <div className="relative w-full max-w-[440px] aspect-[7/6] bg-blue-600 p-3 sm:p-4 rounded-3xl shadow-2xl border-4 border-blue-700/80">
        {/* Subtle 3D Top Edge highlight */}
        <div className="absolute inset-x-0 top-0 h-2 bg-white/20 rounded-t-3xl pointer-events-none" />

        {/* 7 Columns Container */}
        <div className="w-full h-full grid grid-cols-7 gap-2 sm:gap-2.5">
          {Array.from({ length: COLS }).map((_, c) => {
            const isColHovered = hoverCol === c && !winner && (!isAiThinking || gameMode === "pass");
            const lowestRow = getAvailableRow(board, c);

            return (
              <div
                key={c}
                onClick={() => handleColumnClick(c)}
                onMouseEnter={() => setHoverCol(c)}
                onMouseLeave={() => setHoverCol(null)}
                className={`flex flex-col justify-between h-full cursor-pointer rounded-2xl transition-all relative ${
                  isColHovered ? "bg-blue-500/40" : ""
                }`}
              >
                {/* 6 Holes per column */}
                {Array.from({ length: ROWS }).map((_, r) => {
                  const piece = board[r][c];
                  const isWinning = isWinningCell(r, c);
                  const isGhost = isColHovered && lowestRow === r && !piece;

                  return (
                    <div
                      key={r}
                      className="relative w-full aspect-square flex items-center justify-center p-1"
                    >
                      {/* Deep Inset Hole Background Shadow */}
                      <div className="w-full h-full rounded-full bg-blue-900/60 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
                        {/* Actual Disc */}
                        {piece ? (
                          <div
                            className={`w-full h-full rounded-full transition-all duration-300 transform ${
                              piece === "R"
                                ? "bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 shadow-md shadow-rose-900/40"
                                : "bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 shadow-md shadow-amber-900/40"
                            } ${
                              isWinning
                                ? "scale-95 ring-4 ring-white animate-pulse"
                                : "scale-100"
                            }`}
                          >
                            {/* Inner Disc Rim Detail */}
                            <div className="w-full h-full rounded-full border-2 border-white/20 flex items-center justify-center">
                              <div className="w-1/2 h-1/2 rounded-full border border-black/10 shadow-inner" />
                            </div>
                          </div>
                        ) : isGhost ? (
                          /* Ghost Drop Preview */
                          <div
                            className={`w-full h-full rounded-full opacity-40 transition-opacity animate-pulse ${
                              turn === "R"
                                ? "bg-rose-400 border-2 border-rose-300"
                                : "bg-yellow-400 border-2 border-yellow-300"
                            }`}
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Base board feet / stands */}
        <div className="absolute -bottom-3 left-6 w-12 h-4 bg-blue-800 rounded-b-xl shadow-md -z-10" />
        <div className="absolute -bottom-3 right-6 w-12 h-4 bg-blue-800 rounded-b-xl shadow-md -z-10" />
      </div>

      {/* Instructions / Turn Tip */}
      <p className="mt-4 text-xs text-gray-400 font-medium text-center">
        Click or tap any column to drop your chip. Connect 4 horizontally, vertically, or diagonally to win!
      </p>
    </div>
  );
}
