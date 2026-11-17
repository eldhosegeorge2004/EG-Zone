/* eslint-disable */
import WhackMole from "@/games/mole/WhackMole";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Whack-a-Mole Online Free | EG ZONE",
  description:
    "Play classic Whack-a-Mole arcade game online for free. Test your reaction time, whack standard moles for points, catch rare golden moles, and dodge dangerous explosive bombs.",
};

export default function WhackMolePage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <WhackMole />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="Whack-a-Mole"
            description="Whack-a-Mole brings the nostalgic, high-energy carnival arcade experience straight to your browser. Test your hand-eye coordination and reflex speed against mischievous moles popping out of a 3x3 underground burrow. Stay alert for bonus golden moles that bestow massive score boosts, but beware of explosive bomb moles that penalize your hard-earned points. Can you keep up as the mole spawn speed intensifies across sixty intense seconds?"
            howToPlay={[
              "Start the Timer: Click the Start Game button to initiate the 60-second countdown clock.",
              "Whack Standard Moles: Click or tap standard moles instantly as they pop up to earn +1 point before they duck away.",
              "Catch Golden Moles: React quickly when golden moles emerge to score a hefty +5 point bonus.",
              "Avoid Bomb Moles: Do not strike bomb moles; hitting an explosive mole causes a 5-point deduction penalty.",
              "Beat Your High Score: Minimize missed opportunities and chain successful whacks to set new personal best records.",
            ]}
            features={[
              "Fast Reflex Gameplay: Dynamic spawn intervals accelerate as your score increases to test lightning-fast reactions.",
              "Special Mole Variety: Encounter standard moles (+1), high-value golden moles (+5), and hazardous bomb hazards (-5).",
              "Visual & Audio Impact: Dedicated Web Audio API sound effects for whacks, misses, and bomb detonations with floating score indicators.",
              "Persistent High Scores: Tracks personal best scores using browser localStorage for continuous replayability.",
              "Full Touchscreen Optimization: Responsive layout and zero-delay touch handlers make whacking intuitive on mobile devices.",
            ]}
            faqs={[
              {
                question: "What happens if a mole escapes without being hit?",
                answer:
                  "If a standard or golden mole ducks back underground before you whack it, it registers as a miss on your scoreboard.",
              },
              {
                question: "How long does each round last?",
                answer:
                  "Each Whack-a-Mole round lasts 60 seconds with live countdown bars indicating the remaining play time.",
              },
              {
                question: "Does the difficulty increase during the game?",
                answer:
                  "Yes! As your score ascends past 10, 20, and 30 points, moles stay visible for shorter durations and appear much more frequently.",
              },
              {
                question: "Can I play on smartphones or touch devices?",
                answer:
                  "Yes, the game is built with mobile touch event handlers that allow immediate finger taps without double-tap delay.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
