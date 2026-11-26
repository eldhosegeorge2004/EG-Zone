/* eslint-disable */
import TangramFit from "@/games/tangramfit/TangramFit";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Tangram Fit Online Free — Classic 7-Piece Puzzle | EG ZONE",
  description:
    "Play Tangram Fit online for free! Drag and rotate the 7 classic geometric pieces into their outlines to rebuild the square in record time.",
};

export default function TangramFitPage() {
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
            Tangram Fit
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Drag and rotate all 7 tangram pieces into the square!
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-3 sm:p-6 bg-white border border-slate-200 shadow-xl">
        <TangramFit />
      </div>

      <div className="mt-12">
        <GameSEO
          gameName="Tangram Fit"
          description="Tangram Fit brings the timeless 7-piece dissection puzzle to your browser. Scattered below the dashed square outline are five triangles, a square, and a parallelogram, each rotated at a random 45-degree multiple. Drag pieces into place, tap to rotate them, and watch them snap cleanly into position as you race the clock."
          howToPlay={[
            "Drag any coloured piece from the bottom tray up toward the dashed square outline.",
            "Tap or click a piece (without dragging) to rotate it 45 degrees clockwise.",
            "When a piece is close to its matching slot and rotated to the right angle, it snaps and locks into place.",
            "Lock all 7 pieces as fast as possible to set a new best time!",
          ]}
          features={[
            "Classic 7-piece tangram geometry with automatic snap-in.",
            "Smooth pointer drag-and-drop and tap-to-rotate controls.",
            "Daily seeded starting layout and Random shuffle mode.",
            "Fastest completion time saved locally and scored on the leaderboard.",
          ]}
          faqs={[
            {
              question: "Why won't my piece snap into place?",
              answer:
                "A piece only snaps when both its position and its rotation match the target outline. Tap the piece to rotate it in 45° steps until its orientation lines up.",
            },
            {
              question: "Does the square piece need a specific rotation?",
              answer:
                "Because a square has 90-degree symmetry, it snaps at any 90° multiple.",
            },
          ]}
        />
      </div>
    </div>
  );
}
