/* eslint-disable */
import ZipGame from "@/games/zip/ZipGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Zip Online Free — 15 Rounds of Path Puzzles | EG ZONE",
  description:
    "Play Zip online for free! Connect the numbers in order and fill every single square on the grid without hitting walls. 15 procedural rounds with hints and star ratings.",
};

export default function ZipPage() {
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
            Zip
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Connect numbers in order, respect the walls, and fill every cell
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-4 sm:p-6 bg-white border border-slate-200 shadow-xl">
        <ZipGame />
      </div>

      <div className="mt-12">
        <GameSEO
          gameName="Zip"
          description="Zip is a captivating spatial logic puzzle game where your objective is to connect numbers in sequential order and cover every single square on the grid with a continuous path. As you advance through 15 increasingly difficult rounds, grids expand from 4x4 up to 7x7, while dark partition walls block direct routes and fewer numbered clues are provided. The challenge lies in routing your line so no empty pockets are left behind. Fast completion times and zero hints reward you with maximum 3-star ratings across all 15 rounds."
          howToPlay={[
            "Start from Number 1: Drag your finger or mouse starting from the circled '1' node.",
            "Connect in Ascending Order: You must visit number 2, then 3, then 4 in strictly ascending sequence.",
            "Fill Every Single Cell: The puzzle is only solved when your line snakes through every empty square on the board.",
            "Avoid Partition Walls: Dark bold lines on the grid are solid barriers — your line cannot cross through them.",
            "Non-Overlapping Path: Your path cannot cross itself or reuse any previously visited square.",
            "Undo and Retrace: Dragging backwards or clicking the Undo button allows you to retrace steps freely without penalty.",
            "Use Hints Wisely: When stuck, the Hint button backs you up to your last correct tile and highlights the next 3 steps, but adds a 10-second penalty."
          ]}
          features={[
            "15 progressive procedural rounds with dynamic grid sizes scaling from 4x4 up to 7x7",
            "Unique Hamilton path solver algorithm ensuring every puzzle has a valid solution",
            "Intelligent wall partition generator that introduces clever labyrinth mazes",
            "Performance-based 3-star rating system based on your solve time and hint usage",
            "Seamless drag-and-draw touch and mouse controls with sub-step collision detection",
            "Built-in smart hint system to teach routing techniques on challenging levels",
            "Persistent local high-score tracking storing your best star collection"
          ]}
          faqs={[
            {
              question: "Why does the line stop moving when I drag?",
              answer:
                "Your path cannot cross over walls, jump over visited cells, or hit a numbered clue out of order (for example, stepping on 3 before touching 2). Plan your route around barriers."
            },
            {
              question: "How do I earn 3 stars on a level?",
              answer:
                "To earn 3 stars, solve the puzzle within the par time limit (based on grid size) without using any hints. Using hints or taking extra time will reduce your rating to 1 or 2 stars."
            },
            {
              question: "Can I play Zip on mobile devices?",
              answer:
                "Yes! Zip is fully optimized for touchscreens with high-precision pointer tracking and zero input lag on iOS and Android devices."
            },
            {
              question: "What happens if I make a wrong turn?",
              answer:
                "You can either drag your finger backwards along your line to smoothly retract it, tap the Undo button to remove the last cell, or click Reset to start the level fresh."
            }
          ]}
        />
      </div>
    </div>
  );
}
