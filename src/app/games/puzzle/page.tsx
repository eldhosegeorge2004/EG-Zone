/* eslint-disable */
import PuzzleGame from "@/games/puzzle/PuzzleGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Number Puzzle | GameHub",
  description: "Arrange the numbers in order from 1 to 15 in this classic sliding puzzle.",
};

export default function PuzzlePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Number Puzzle</h1>
        <p className="text-gray-600 font-medium">Slide the tiles to arrange them in order from 1 to 15.</p>
      </div>

      <PuzzleGame />

      <GameSEO 
        gameName="Number Puzzle"
        description="The 15-puzzle (also called Gem Puzzle, Boss Puzzle, or Mystic Square) is a sliding puzzle that consists of a frame of numbered square tiles in random order with one tile missing."
        howToPlay={[
          "Slide Tiles: Click or tap a tile that is adjacent to the empty space to move it.",
          "Arrange: Your goal is to arrange the tiles in numerical order (1, 2, 3... 15).",
          "Top Left: The number 1 should be in the top-left corner.",
          "Empty Space: The empty space should end up in the bottom-right corner."
        ]}
        features={[
          "Classic 4x4 grid layout",
          "Move counter to track your efficiency",
          "Timer to challenge your speed",
          "Great spatial reasoning and logic exercise"
        ]}
        faqs={[
          {
            question: "Is every puzzle solvable?",
            answer: "Yes, our algorithm only generates puzzles that are mathematically possible to solve."
          },
          {
            question: "What is the fastest way to solve it?",
            answer: "A common strategy is to solve the top row first, then the left column, and continue this pattern until only a small 2x2 or 2x3 block is left."
          }
        ]}
      />
    </div>
  );
}
