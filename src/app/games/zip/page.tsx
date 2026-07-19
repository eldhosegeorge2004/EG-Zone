/* eslint-disable */
import ZipGame from "@/games/zip/ZipGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Zip | EG ZONE",
  description: "Connect the numbers in sequential order with a single, continuous line without crossing.",
};

export default function ZipPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/games" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 transition-colors font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
      </Link>
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Zip</h1>
        <p className="text-gray-600 font-medium">Connect the numbers with a single, continuous line.</p>
      </div>

      <ZipGame />

      <GameSEO 
        gameName="Zip"
        description="Zip is a relaxing but mentally engaging puzzle game where you must connect numbered dots in sequential order using a single, non-overlapping line."
        howToPlay={[
          "Start at One: Find the dot labeled '1' to begin.",
          "Drag to Connect: Click and hold (or tap and drag) to draw a line from dot 1 to dot 2, then to dot 3, and so on.",
          "Don't Cross Lines: Your line cannot cross over itself or any other existing lines.",
          "Fill the Grid: The puzzle is solved when all numbers are connected in order and every square on the grid is filled."
        ]}
        features={[
          "Simple, satisfying line-drawing mechanics",
          "Hundreds of puzzles ranging from easy to mind-bending",
          "Great for developing spatial reasoning",
          "Relaxing, stress-free gameplay with no time limits"
        ]}
        faqs={[
          {
            question: "What if I make a mistake?",
            answer: "You can easily undo your line by dragging back over it, or pressing a reset button to start the puzzle from scratch."
          },
          {
            question: "Why do I have to fill the whole grid?",
            answer: "Filling the entire grid is part of the challenge! It forces you to think about the path you take, rather than just taking the shortest route between two numbers."
          }
        ]}
      />
    </div>
  );
}
