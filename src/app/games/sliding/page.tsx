/* eslint-disable */
import SlidingPuzzle from "@/games/sliding/SlidingPuzzle";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Sliding Puzzle Online Free | EG ZONE",
  description:
    "Play classic 15-puzzle sliding block game online for free. Choose 3x3, 4x4, or 5x5 grid difficulties, track your move counts and solve times, and challenge your spatial reasoning.",
};

export default function SlidingPuzzlePage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <SlidingPuzzle />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="Sliding Puzzle"
            description="Sliding Puzzle is a timeless mathematical brain teaser where you must slide numbered tiles into sequential order. Starting from a scrambled layout with one open vacancy, every move shifts the pieces until a complete numerical grid is formed. It tests spatial orientation, foresight, and tactical planning across easy 3x3, medium 4x4, and challenging 5x5 board variations. Enjoy seamless responsive controls, real-time move and timer tracking, and persistent local records."
            howToPlay={[
              "Identify the Space: Locate the empty spot on the game board where adjacent tiles can slide.",
              "Click or Tap: Select any numbered tile neighboring the empty position horizontally or vertically to shift it.",
              "Plan Consecutive Rows: Work systematically to assemble top rows and left columns in numerical sequence first.",
              "Solve Corner Pieces: Pair the final corner tiles carefully so you do not break previously aligned rows.",
              "Complete the Order: Place every number sequentially from 1 to the highest number, leaving the blank space at the bottom right.",
            ]}
            features={[
              "Multiple Board Sizes: Play on 3x3 (Easy), 4x4 (Classic 15-Puzzle), or 5x5 (Hard) configurations.",
              "Solvability Guarantee: Smart algorithmic shuffling ensures every randomized game board is 100% solvable.",
              "Move & Timer Counters: Monitor your precision and solve speed with live move counts and second-by-second timers.",
              "Best Records Tracking: Automatically saves your lowest move count and fastest completion time per difficulty in localStorage.",
              "Synthesized Sound Effects: Responsive audio feedback powered by Web Audio API for smooth sliding actions and victory tunes.",
            ]}
            faqs={[
              {
                question: "Is every scrambled sliding puzzle solvable?",
                answer:
                  "Yes, our generator specifically checks mathematical permutation parity or walks valid moves backwards from the solved state to guarantee that every single puzzle can be solved.",
              },
              {
                question: "What is the best strategy to solve a 15-puzzle?",
                answer:
                  "A popular method is solving row by row starting with the top row (1, 2, 3, 4), then the second row (5, 6, 7, 8), and finishing with the bottom two rows simultaneously.",
              },
              {
                question: "Can I play on touchscreen mobile devices?",
                answer:
                  "Absolutely! The tiles respond directly to touchscreen taps on mobile phones and tablets as well as standard mouse clicks on desktop.",
              },
              {
                question: "Are high scores and best times preserved when I refresh?",
                answer:
                  "Yes, personal best records for moves and time are saved directly in your browser's localStorage.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
