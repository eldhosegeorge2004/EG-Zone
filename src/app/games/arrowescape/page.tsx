/* eslint-disable */
import ArrowEscapeGame from "@/games/arrowescape/ArrowEscapeGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Arrow Escape Online Free — Logic Grid Puzzle Game | EG ZONE",
  description:
    "Play Arrow Escape online for free! Tap unblocked arrows to slide them off the grid. Plan moves, dodge obstacles, and clear all 10 increasingly challenging puzzle levels.",
};

export default function ArrowEscapePage() {
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 pb-12">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/games"
          className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Games
        </Link>
        <div className="text-right">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Arrow Escape
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Tap arrows to slide them off the board without colliding
          </p>
        </div>
      </div>

      <ArrowEscapeGame />

      <div className="mt-12">
        <GameSEO
          gameName="Arrow Escape"
          description="Arrow Escape is an intuitive yet deeply satisfying logic puzzle game. A tangled grid of multi-directional arrows is laid out before you. Your objective is to tap individual arrows to slide them off the grid one by one. However, if an arrow's flight path is blocked by another arrow anywhere along its trajectory, it will collide and trigger a mistake penalty. Carefully scan the grid to identify arrows with completely unobstructed exit vectors, plan the optimal sequence of moves, and clear all 10 increasingly intricate levels."
          howToPlay={[
            "Analyze the Arrow Maze: Examine the direction each arrow points and trace its line of sight to the boundary of the board.",
            "Tap Unblocked Arrows: Tap an arrow that has a clear, unobstructed path off the grid to slide it out.",
            "Avoid Collisions: Tapping an arrow whose exit path is obstructed by another arrow will shake the arrow and register a mistake.",
            "Build Multiplier Combos: Successfully sliding out consecutive arrows without mistakes builds a combo multiplier up to 5x.",
            "Use Strategic Hints: Stuck on a crowded board? Tap the Hint button to highlight an arrow that is currently safe to remove.",
            "Undo Mistakes: Made an accidental tap or want to reconsider your order? Use the Undo button to reverse your last action."
          ]}
          features={[
            "10 progressively challenging puzzle levels featuring denser grids and longer serpentine arrows",
            "3-star level rating system rewarding flawless runs with zero mistakes",
            "Smooth 60FPS fluid arrow slide animations with responsive sound synthesis",
            "Combo multiplier system that rewards rhythmic and accurate deduction",
            "Tactile haptic vibration feedback on touch devices when collisions occur",
            "Integrated Hint and Undo tool assistance for tricky spatial puzzles",
            "Light and dark contrast modes with persistent level progress tracking"
          ]}
          faqs={[
            {
              question: "How do I know which arrow to tap first?",
              answer:
                "Look along the outer edges of the board. Arrows pointing directly outward toward the perimeter without any other arrow standing in front of their tip are always safe to remove first."
            },
            {
              question: "What happens if I make mistakes?",
              answer:
                "Mistakes reset your combo multiplier to 1x and affect your star rating at the end of the level (3 stars for 0 mistakes, 2 stars for 1-2 mistakes, 1 star for 3+ mistakes)."
            },
            {
              question: "Can I replay completed levels?",
              answer:
                "Yes! Use the Levels button at any time to open the level select grid and replay any unlocked level to improve your star rating or boost your high score."
            },
            {
              question: "Does Arrow Escape work on mobile phones?",
              answer:
                "Yes, Arrow Escape is fully optimized for touchscreens with responsive grid scaling, smooth touch gestures, and haptic vibration feedback."
            }
          ]}
        />
      </div>
    </div>
  );
}
