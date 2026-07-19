import TicTacToe from "@/games/tictactoe/TicTacToe";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TicTacToePage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg mb-8 flex items-center">
        <Link 
          href="/"
          className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-gray-900 hover:shadow transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
      <TicTacToe />
      <div className="w-full">
        <GameSEO 
          gameName="Tic Tac Toe"
          description="Tic-Tac-Toe is a classic two-player strategy game played on a 3x3 grid. Also known as Noughts and Crosses, it's a simple but engaging game of logic."
          howToPlay={[
            "Choose a Spot: Players take turns placing their mark (X or O) in an empty square on the 3x3 grid.",
            "Get Three in a Row: The goal is to be the first player to get three of your marks in a row—horizontally, vertically, or diagonally.",
            "Block Opponent: Pay attention to your opponent's moves and block them if they get two in a row.",
            "Draw: If all 9 squares are filled and neither player has 3 in a row, the game ends in a draw (a cat's game)."
          ]}
          features={[
            "Play against a friend locally or against the computer AI",
            "Clean, minimalist grid design",
            "Fast-paced rounds",
            "Score tracking"
          ]}
          faqs={[
            {
              question: "Is it possible to always win at Tic-Tac-Toe?",
              answer: "No, if both players play perfectly, every game of Tic-Tac-Toe will end in a draw."
            },
            {
              question: "What is the best starting move?",
              answer: "The center square is mathematically the most advantageous starting move, as it is involved in 4 possible winning lines."
            }
          ]}
        />
      </div>
    </div>
  );
}
