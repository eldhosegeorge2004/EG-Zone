/* eslint-disable */
import SplashGame from "@/games/splash/SplashGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Splash Online Free — Color Flood Puzzle Game | EG ZONE",
  description:
    "Play Splash online for free! Flood the entire board with a single color starting from the top-left corner before running out of moves. Progressive difficulty and accessibility symbols.",
};

export default function SplashPage() {
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
            Splash
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Flood the board with matching colors before your moves run dry
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-4 sm:p-6 bg-white border border-slate-200 shadow-xl">
        <SplashGame />
      </div>

      <div className="mt-12">
        <GameSEO
          gameName="Splash"
          description="Splash is an elegant and addictive color-flooding puzzle game. Starting from the top-left square, choose colors from the bottom palette to absorb neighboring squares of the same color into your expanding territory. Your mission is to paint the entire board in a single uniform color within a strict move allowance. With each cleared level, the grid dimensions grow from 6x6 up to 12x12 while a 5th color is introduced to test your strategic forecasting."
          howToPlay={[
            "Start from Top-Left: Your territory originates at the top-left square of the grid.",
            "Tap a Color: Select any color from the bottom palette different from your territory's current color.",
            "Flood Adjacent Squares: Any neighboring tiles that match the chosen color join your territory.",
            "Watch Your Move Counter: Each color switch consumes 1 move. Plan multi-tile cascades to minimize turns.",
            "Fill the Board to Win: If every tile on the grid shares the same color before moves hit 0, you clear the level!",
            "Advance to Bigger Grids: Succeeding levels increase board dimensions and introduce more color variations."
          ]}
          features={[
            "Classic Flood-It puzzle gameplay enhanced with tactile feedback and sound effects",
            "Universal accessibility support with distinct geometric symbols (●, ■, ▲, ◆, ★) on every tile",
            "Progressive level scaling from compact 6x6 grids up to expansive 12x12 challenges",
            "Move allocation tuning providing a fair yet brain-teasing challenge on every tier",
            "Persistent high-score record saving your furthest reached level",
            "Zero download, works seamlessly on desktop browsers, phones, and tablets"
          ]}
          faqs={[
            {
              question: "What is the best strategy to win in Splash?",
              answer:
                "Look for large clusters of adjacent colors connected to the border of your territory. Absorbing big contiguous groups in a single move rapidly accelerates board coverage and saves valuable moves."
            },
            {
              question: "Are the puzzles colorblind-friendly?",
              answer:
                "Yes! Every color tile features a high-contrast geometric symbol (circle, square, triangle, diamond, star), ensuring full accessibility regardless of color vision deficiency."
            },
            {
              question: "What happens if I run out of moves?",
              answer:
                "If your moves reach zero before the board is completely covered, you can instantly retry the level with a fresh board layout."
            },
            {
              question: "Does the game save my progress?",
              answer:
                "Your highest level achieved is automatically saved to your browser's local storage so you can track your puzzle-solving milestones."
            }
          ]}
        />
      </div>
    </div>
  );
}
