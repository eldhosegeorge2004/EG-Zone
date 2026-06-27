/* eslint-disable */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { RotateCcw, X, Circle, Trophy, User, Bot, Users } from "lucide-react";

type Player = "X" | "O" | null;
type Mode = "AI" | "2P";

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState<Player | "Draw">(null);
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  // Custom Settings from repo
  const [mode, setMode] = useState<Mode>("AI");
  const [humanPlayer, setHumanPlayer] = useState<Player>("X");
  
  // Audio Refs
  const clickSoundRef = useRef<HTMLAudioElement>(null);
  const winSoundRef = useRef<HTMLAudioElement>(null);
  const drawSoundRef = useRef<HTMLAudioElement>(null);

  const checkWinner = (squares: Player[]) => {
    for (let i = 0; i < WIN_LINES.length; i++) {
      const [a, b, c] = WIN_LINES[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: WIN_LINES[i] };
      }
    }
    if (!squares.includes(null)) return { winner: "Draw", line: null };
    return null;
  };

  const minimax = (newBoard: Player[], player: Player, aiPlayer: Player, humanPlayerId: Player): { score: number, index?: number } => {
    const availSpots = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    const result = checkWinner(newBoard);
    
    if (result?.winner === humanPlayerId) return { score: -10 };
    if (result?.winner === aiPlayer) return { score: 10 };
    if (availSpots.length === 0) return { score: 0 };

    const moves: { index: number, score: number }[] = [];
    
    for (let i = 0; i < availSpots.length; i++) {
      const move: any = {};
      move.index = availSpots[i];
      newBoard[availSpots[i]] = player;

      if (player === aiPlayer) {
        const res = minimax(newBoard, humanPlayerId, aiPlayer, humanPlayerId);
        move.score = res.score;
      } else {
        const res = minimax(newBoard, aiPlayer, aiPlayer, humanPlayerId);
        move.score = res.score;
      }

      newBoard[availSpots[i]] = null;
      moves.push(move);
    }

    let bestMove = 0;
    if (player === aiPlayer) {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }

    return moves[bestMove];
  };

  const makeAIMove = useCallback((currentBoard: Player[], currPlayer: Player) => {
    const aiPlayer = humanPlayer === "X" ? "O" : "X";
    if (currPlayer !== aiPlayer || winner) return;

    const bestMove = minimax(currentBoard, aiPlayer, aiPlayer, humanPlayer);
    if (bestMove.index !== undefined) {
      handleMove(bestMove.index, currentBoard, currPlayer);
    }
  }, [humanPlayer, winner]);

  const handleMove = (index: number, currentBoard: Player[] = board, currTurn: Player = currentPlayer) => {
    if (currentBoard[index] || winner) return;

    clickSoundRef.current?.play().catch(e => console.error(e));

    const newBoard = [...currentBoard];
    newBoard[index] = currTurn;
    
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner as Player | "Draw");
      setWinLine(result.line);
      if (result.winner === "X") setScores(s => ({ ...s, X: s.X + 1 }));
      if (result.winner === "O") setScores(s => ({ ...s, O: s.O + 1 }));

      if (result.winner === "Draw") {
        drawSoundRef.current?.play().catch(e => console.error(e));
      } else {
        winSoundRef.current?.play().catch(e => console.error(e));
      }

    } else {
      const nextPlayer = currTurn === "X" ? "O" : "X";
      setCurrentPlayer(nextPlayer);
      
      // If Mode is AI and next player is AI, trigger AI
      if (mode === "AI") {
        const aiPlayer = humanPlayer === "X" ? "O" : "X";
        if (nextPlayer === aiPlayer) {
          setTimeout(() => {
            makeAIMove(newBoard, nextPlayer);
          }, 300);
        }
      }
    }
  };

  const startGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X"); // X always goes first
    setWinner(null);
    setWinLine(null);
    setIsPlaying(true);
  }, []);

  // When settings change or game starts, check if AI needs to move first
  useEffect(() => {
    if (isPlaying && mode === "AI" && !winner) {
      const aiPlayer = humanPlayer === "X" ? "O" : "X";
      if (currentPlayer === aiPlayer && board.every(c => c === null)) {
        setTimeout(() => {
          makeAIMove(board, currentPlayer);
        }, 400);
      }
    }
  }, [isPlaying, mode, humanPlayer, currentPlayer, board, makeAIMove, winner]);

  // Restart when settings change
  useEffect(() => {
    if (isPlaying) {
      startGame();
    }
  }, [mode, humanPlayer, startGame]);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[500px] mx-auto font-sans">
      
      <audio ref={clickSoundRef} src="https://cdn.pixabay.com/audio/2022/03/15/audio_26183d9f2f.mp3" preload="auto" />
      <audio ref={winSoundRef} src="https://cdn.pixabay.com/audio/2022/02/23/audio_7f31cd1f87.mp3" preload="auto" />
      <audio ref={drawSoundRef} src="https://cdn.pixabay.com/audio/2022/10/26/audio_53c8d9f3f4.mp3" preload="auto" />

      {/* Settings / Controls */}
      <div className="w-full flex flex-wrap sm:flex-nowrap justify-center sm:justify-between items-center gap-3 mb-6 bg-white/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
        
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 hidden sm:block">Mode</label>
          <select 
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="bg-white border border-gray-200 text-gray-800 text-sm font-bold rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 shadow-sm outline-none"
          >
            <option value="AI">👾 AI</option>
            <option value="2P">👥 2 Player</option>
          </select>
        </div>

        <button
          onClick={startGame}
          className="flex items-center text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm hover:shadow active:scale-95"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Restart
        </button>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 hidden sm:block">Play as</label>
          <select 
            value={humanPlayer!}
            onChange={(e) => setHumanPlayer(e.target.value as Player)}
            disabled={mode === "2P"}
            className="bg-white border border-gray-200 text-gray-800 text-sm font-bold rounded-lg focus:ring-pink-500 focus:border-pink-500 block p-2.5 shadow-sm outline-none disabled:opacity-50"
          >
            <option value="X">❌ Player X</option>
            <option value="O">⭕ Player O</option>
          </select>
        </div>

      </div>

      {/* Score Board */}
      <div className="w-full flex justify-between items-center mb-6 bg-white px-8 py-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider text-cyan-600">Player X</span>
          <span className="text-4xl font-black text-gray-900 leading-none">{scores.X}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-1">Status</span>
          <span className="text-lg font-black text-gray-800 bg-gray-100 px-4 py-1 rounded-full">
            {winner ? (winner === "Draw" ? "Draw!" : `${winner} Wins!`) : `${currentPlayer}'s Turn`}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-xs font-bold uppercase tracking-wider text-pink-600">Player O</span>
          <span className="text-4xl font-black text-gray-900 leading-none">{scores.O}</span>
        </div>
      </div>

      {/* Game Grid */}
      <div className="relative w-full aspect-square max-w-[450px]">
        <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400 via-indigo-400 to-pink-500 rounded-3xl blur opacity-20 transition duration-1000 -z-10"></div>
        
        <div className="relative bg-white/60 backdrop-blur-md rounded-3xl border border-gray-200 shadow-xl w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center">
          
          {!isPlaying && !winner && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl cursor-auto">
               <div className="w-20 h-20 bg-gradient-to-br from-cyan-50 to-pink-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100">
                <X className="w-10 h-10 text-cyan-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Tic-Tac-Toe</h2>
              <p className="text-gray-500 text-base mb-8 max-w-[280px] font-medium leading-relaxed">
                Choose your settings above and click start to begin the game!
              </p>
              <button
                onClick={startGame}
                className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-lg w-full"
              >
                Start Game
              </button>
            </div>
          )}

          {winner && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-3xl cursor-auto">
              <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
                {winner === "Draw" ? "🤝 It's a Draw!" : `🎉 ${winner} Wins!`}
              </h2>
              <p className="text-gray-500 text-lg mb-8 font-medium">
                {winner === "Draw" ? "A perfectly played game!" : `Excellent moves from Player ${winner}!`}
              </p>
              <button
                onClick={startGame}
                className="flex items-center justify-center bg-gray-900 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-gray-900/20 text-lg w-full"
              >
                <RotateCcw className="w-5 h-5 mr-2" /> Play Again
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 grid-rows-3 gap-3 w-full h-full">
            {board.map((cell, idx) => {
              const isWinningCell = winLine?.includes(idx);
              const aiPlayer = mode === "AI" ? (humanPlayer === "X" ? "O" : "X") : null;
              const isAiTurn = mode === "AI" && currentPlayer === aiPlayer;

              return (
                <button
                  key={idx}
                  onClick={() => handleMove(idx)}
                  disabled={cell !== null || isAiTurn || winner !== null}
                  className={`
                    flex items-center justify-center rounded-2xl transition-all duration-300
                    ${!cell && !isAiTurn && !winner ? 'hover:bg-gray-50/80 cursor-pointer active:scale-[0.97]' : 'cursor-default'}
                    ${cell ? 'bg-white shadow-md border border-gray-100' : 'bg-gray-200/50'}
                    ${isWinningCell ? 'ring-4 ring-offset-4 ring-cyan-300 bg-cyan-50 shadow-lg scale-105' : ''}
                  `}
                >
                  {cell === "X" && (
                    <X className={`w-16 h-16 sm:w-20 sm:h-20 text-red-500 transition-all duration-300 animate-in zoom-in-50 ${isWinningCell ? 'drop-shadow-md' : ''}`} strokeWidth={2.5} />
                  )}
                  {cell === "O" && (
                    <Circle className={`w-16 h-16 sm:w-20 sm:h-20 text-teal-500 transition-all duration-300 animate-in zoom-in-50 ${isWinningCell ? 'drop-shadow-md' : ''}`} strokeWidth={2.5} />
                  )}
                </button>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
