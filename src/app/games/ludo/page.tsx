/* eslint-disable */
import LudoGame from "@/games/ludo/LudoGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Ludo Online Free — Classic Board Game vs AI or Friends | EG ZONE",
  description:
    "Play Ludo online for free! Roll the dice, race your 4 tokens around the board, capture opponents, and play against smart Computer AI or local friends.",
};

export default function LudoPage() {
  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 pb-12">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/games"
          className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Games
        </Link>
        <div className="text-right">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            Ludo
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Roll the dice, capture rivals, and race all 4 tokens home!
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-3 sm:p-6 bg-white border border-slate-200 shadow-xl">
        <LudoGame />
      </div>

      <div className="mt-12">
        <GameSEO
          gameName="Ludo"
          description="Ludo is the timeless four-player strategy board game brought to life with crisp vector graphics, smooth hop animations, and smart AI opponents. Choose any mix of human players and computer opponents across Red, Green, Yellow, and Blue seats, roll the dice, and race all four of your tokens from the yard to the center home triangle while capturing rivals along the way."
          howToPlay={[
            "Tap your glowing corner die to roll.",
            "Roll a 6 to move a token out of your starting yard onto the track.",
            "Tap any highlighted token (or its destination circle) to advance it by the rolled number.",
            "Rolling a 6, capturing an opponent's token, or reaching home grants an extra roll — but three 6s in a row ends your turn!",
            "Land on an opponent's token on a non-safe square to send it back to its yard. Start squares and star squares are safe.",
            "Reach the center home with an exact roll for all 4 tokens to win.",
          ]}
          features={[
            "Flexible 2-to-4 player setup with any mix of Person, Computer AI, or Off seats.",
            "Smart tactical CPU AI that weighs captures, safe squares, and danger.",
            "Smooth token hop animations, destination preview rings, and synthesized Web Audio sound effects.",
            "Automatic game progress saving in localStorage so you never lose a match.",
            "Leaderboard score submission when a human player defeats Computer opponents.",
          ]}
          faqs={[
            {
              question: "Can I play Ludo with friends on the same device?",
              answer:
                "Yes! Under Players, set two or more seats to 'Person' and click Start New Game for local pass-and-play.",
            },
            {
              question: "Which squares are safe in Ludo?",
              answer:
                "All four colored starting squares and all four star-marked squares are safe zones where tokens cannot be captured.",
            },
            {
              question: "How do I submit my score to the leaderboard?",
              answer:
                "When playing against at least one Computer opponent, winning 1st place as a human player unlocks the Save Score modal.",
            },
          ]}
        />
      </div>
    </div>
  );
}
