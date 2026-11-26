/* eslint-disable */
import Crossword from "@/games/crossword/Crossword";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Mini Crossword Online Free — Daily Word Puzzle | EG ZONE",
  description:
    "Play Mini Crossword online for free! Solve today's daily interlocking word puzzle or generate unlimited random crosswords with hints and timer.",
};

export default function CrosswordPage() {
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
            Crossword
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Solve the daily mini crossword or generate endless random grids!
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-3 sm:p-6 bg-white border border-slate-200 shadow-xl">
        <Crossword />
      </div>

      <div className="mt-12">
        <GameSEO
          gameName="Crossword"
          description="Crossword is a crisp, fast-paced mini crossword puzzle you can play daily or in unlimited random mode. Each grid interlocks 8 curated words across and down in a compact 9x9-max layout. Tap any square to type, click the same square again to toggle between Across and Down, and race the clock to set your personal best."
          howToPlay={[
            "Press Start Crossword to begin the timer and highlight the first clue.",
            "Type letters into the active square; the cursor automatically advances along the highlighted word.",
            "Click an intersecting square a second time (or click any clue in the Across/Down lists) to switch direction.",
            "Use Arrow keys to navigate the grid and Backspace to clear and step backward.",
            "Use Check to highlight wrong letters, or Hint to reveal the current letter (adds +15 seconds).",
          ]}
          features={[
            "Daily Puzzle mode with a shared daily seed for all players.",
            "Unlimited Random Puzzle mode generated on the fly from over 130 clues.",
            "Built-in Check, Hint (+15s), Reveal, and Reset tools.",
            "Local best-time tracking for both Daily and Random modes.",
            "Global leaderboard score submission when you solve the puzzle.",
          ]}
          faqs={[
            {
              question: "How is my leaderboard score calculated?",
              answer:
                "Crossword rewards speed: your final time (including any 15-second hint penalties) is converted into points, so faster solves earn higher scores.",
            },
            {
              question: "How do I switch between Across and Down?",
              answer:
                "Click or tap the currently selected square a second time to toggle direction, or click directly on any clue in the Across or Down list.",
            },
            {
              question: "Can I play more than one puzzle per day?",
              answer:
                "Yes! Switch to Random Puzzle mode to generate as many fresh crosswords as you like.",
            },
          ]}
        />
      </div>
    </div>
  );
}
