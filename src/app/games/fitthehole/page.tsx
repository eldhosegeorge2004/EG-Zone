/* eslint-disable */
import FitTheHole from "@/games/fitthehole/FitTheHole";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Fit the Hole Online Free — Reflex Polygon Game | EG ZONE",
  description:
    "Play Fit the Hole online for free! Rotate your polygon to match incoming wall cutouts as speed ramps up. Survive with 3 lives and top the leaderboard.",
};

export default function FitTheHolePage() {
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
            Fit the Hole
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Rotate your shape to slip through the rushing neon walls!
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-3 sm:p-6 bg-white border border-slate-200 shadow-xl">
        <FitTheHole />
      </div>

      <div className="mt-12">
        <GameSEO
          gameName="Fit the Hole"
          description="Fit the Hole is a high-energy neon reflex game. A solid wall with a polygon cutout rushes toward you from the top of the screen. Quickly rotate your triangle, square, or hexagon in 30-degree steps so it aligns with the opening before impact. You have 3 lives, and every wall you pass makes the next one faster!"
          howToPlay={[
            "Tap the left half of the screen (or press Left Arrow) to rotate your shape counter-clockwise by 30°.",
            "Tap the right half of the screen (or press Right Arrow) to rotate clockwise by 30°.",
            "Align your shape's orientation with the cutout in the approaching wall.",
            "Each successful pass earns +1 point; missing costs 1 of your 3 lives.",
          ]}
          features={[
            "Three polygon shapes: triangles, squares, and hexagons.",
            "Progressive speed scaling that tests your reflexes.",
            "Tap-left / tap-right mobile controls and keyboard arrow support.",
            "Daily seeded run and Random endless mode.",
          ]}
          faqs={[
            {
              question: "Do symmetric rotations count as a match?",
              answer:
                "Yes! Squares match every 90°, triangles every 120°, and hexagons every 60°, so any equivalent orientation passes cleanly.",
            },
            {
              question: "How many lives do I have?",
              answer:
                "You start each run with 3 lives (♥). Losing all 3 ends the run.",
            },
          ]}
        />
      </div>
    </div>
  );
}
