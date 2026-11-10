/* eslint-disable */
import ChessGame from "@/games/chess/ChessGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Chess Online Free | GameHub",
  description: "Play classic Chess online against intelligent AI or challenge a friend in local two-player mode. Features legal move hints, pawn promotion, and multiple difficulty levels.",
};

export default function ChessPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Play Chess</h1>
        <p className="text-gray-600 font-medium">Outsmart your opponent in the ultimate game of strategy and tactics.</p>
      </div>

      <ChessGame />

      <GameSEO 
        gameName="Chess"
        description="Chess is a timeless two-player strategy board game played on an 8x8 checkered grid. Dating back over a millennium, chess challenges your tactical acumen, foresight, and spatial reasoning. Whether you want to test your mettle against an adaptive computer engine or enjoy a casual pass-and-play match with a friend on the same screen, GameHub delivers a clean, modern, and mobile-friendly chess experience."
        howToPlay={[
          "Select Game Mode: Choose between 'vs Computer' with customizable difficulty (Easy, Medium, Hard) or '2 Players' local pass-and-play.",
          "Move Pieces: Click or tap any piece of your color to reveal all valid legal destination squares marked with visual dots.",
          "Capture Opponents: Move your piece onto an enemy-occupied square to capture it and remove it from the board.",
          "Understand Piece Rules: Pawns advance forward and capture diagonally; Knights move in an L-shape and jump over pieces; Bishops glide diagonally; Rooks move along straight ranks and files; Queens move in any direction; Kings move one step in any direction.",
          "Special Moves: Execute castling to protect your king and pawn promotion when reaching the 8th rank to transform into a Queen, Rook, Bishop, or Knight.",
          "Deliver Checkmate: Trap the enemy King so that it is under attack with no legal moves to escape. Checkmate wins the game!"
        ]}
        features={[
          "Smart Computer AI with Easy, Medium, and Hard difficulty levels",
          "Local 2-Player Pass & Play mode for friends on mobile, tablet, or desktop",
          "Complete FIDE chess rule validation powered by chess.js (including castling, en passant, promotion, and stalemates)",
          "Interactive Pawn Promotion selector modal",
          "Real-time legal move highlights and last-move tracking",
          "Undo move and board rotation (flip board) support",
          "Captured pieces counter and real-time check/checkmate alerts",
          "Responsive, high-contrast wood-grain board design optimized for touch and mouse"
        ]}
        faqs={[
          {
            question: "Can I play Chess against a friend on the same device?",
            answer: "Yes! Switch to the '2 Players' mode at the top of the board. Both players can take turns making moves on the same phone, tablet, or computer."
          },
          {
            question: "How do the AI difficulty levels work?",
            answer: "Easy makes casual moves suitable for beginners learning the game. Medium prioritizes material gains, checks, and tactical defense. Hard performs deeper positional evaluation and minimax calculations to provide a robust challenge."
          },
          {
            question: "How does pawn promotion work?",
            answer: "When your pawn reaches the furthest rank opposite your starting position, a promotion modal automatically appears, allowing you to choose whether to turn your pawn into a Queen, Rook, Bishop, or Knight."
          },
          {
            question: "What causes a draw in this chess game?",
            answer: "A game can end in a draw due to Stalemate (no legal moves while not in check), Threefold Repetition (identical board state repeated three times), or Insufficient Material (neither side has enough pieces to force checkmate)."
          }
        ]}
      />
    </div>
  );
}
