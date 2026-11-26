/* eslint-disable */
import AngleMatch from "@/games/anglematch/AngleMatch";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Angle Match Online Free — Geometry Estimation Game | EG ZONE",
  description:
    "Test your visual geometry skills in Angle Match! Adjust the slider to match the target angle across 6 rounds and score up to 600 points.",
};

export default function AngleMatchPage() {
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
            Angle Match
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Estimate and match the target angle with pinpoint accuracy!
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-3 sm:p-6 bg-white border border-slate-200 shadow-xl">
        <AngleMatch />
      </div>

      <div className="mt-12">
        <GameSEO
          gameName="Angle Match"
          description="Angle Match is a sharp visual-estimation brain game. Each round presents a target angle rotated at a random orientation on the left, and your adjustable angle on the right. Drag the slider until your angle matches the target's exact opening, then tap Lock in. With 6 rounds worth up to 100 points each, every degree counts!"
          howToPlay={[
            "Observe the blue Target angle on the left — note that its rotation may differ from yours.",
            "Drag the slider below the canvas to adjust the yellow angle on the right between 5° and 175°.",
            "Tap Lock in when you think the two angles match.",
            "An exact match scores 100 points; each degree off deducts 4 points.",
            "Complete all 6 rounds to record your total score out of 600.",
          ]}
          features={[
            "6-round precision challenge with instant degree-by-degree feedback.",
            "Randomized orientations so you judge true angle width, not horizontal alignment.",
            "Daily seeded challenge and unlimited Random mode.",
            "Local best score tracking and global leaderboard submission.",
          ]}
          faqs={[
            {
              question: "What is the maximum possible score in Angle Match?",
              answer:
                "There are 6 rounds worth up to 100 points each, so a perfect run scores 600 points.",
            },
            {
              question: "How is accuracy penalized?",
              answer:
                "Each degree of error between your locked-in angle and the target angle subtracts 4 points from that round's 100-point maximum (minimum 0 per round).",
            },
          ]}
        />
      </div>
    </div>
  );
}
