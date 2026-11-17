/* eslint-disable */
import FruitNinja from "@/games/fruitninja/FruitNinja";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Fruit Ninja Online Free | EG ZONE",
  description:
    "Play Fruit Ninja online for free on EG ZONE. Slice flying juicy fruits, avoid explosive bombs, build epic combos, and test your lightning-fast reflexes directly in your browser!",
};

export default function FruitNinjaPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/games"
          className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <FruitNinja />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="Fruit Ninja"
            description="Experience the exhilarating thrill of Fruit Ninja right in your web browser. Tossed from below, vibrant watermelons, crisp apples, sweet oranges, and bananas leap across your screen awaiting your surgical blade strikes. Precision, timing, and razor-sharp reflexes are required to slice through produce while deftly sidestepping lethal black bombs that threaten to abruptly end your ninja journey. Challenge yourself to chain together multi-fruit combos and set unbeatable personal high scores."
            howToPlay={[
              "Swipe or Drag: Click and drag your mouse cursor or swipe your finger across the touchscreen to slash oncoming fruits.",
              "Slice the Fruit: Slice watermelons, apples, oranges, and bananas before they drop off the bottom of the screen.",
              "Avoid Bombs: Never slice the black explosive bombs, as hitting a single bomb results in an immediate game over.",
              "Manage Your Lives: You begin with three lives. Letting any uncut fruit fall off-screen will cost you one precious heart.",
              "Chain Combos: Slice multiple fruits in rapid succession or in a single fluid swipe to trigger lucrative score multipliers.",
            ]}
            features={[
              "Juicy fruit slicing physics with dynamic split halves and vibrant particle splashes",
              "Multiple fruit types including watermelons, apples, oranges, and bananas",
              "Real-time swipe trail visualization with responsive touch and mouse tracking",
              "Audio synthesized entirely via the Web Audio API without heavy asset downloads",
              "Persistent local high score tracking to monitor your ninja mastery over time",
              "Progressive difficulty scaling that tests reflexes with faster spawns and tricky trajectories",
            ]}
            faqs={[
              {
                question: "Can I play Fruit Ninja on mobile devices and tablets?",
                answer:
                  "Yes, Fruit Ninja features native touch gesture support, allowing smooth swiping on iPhones, iPads, Android smartphones, and tablets directly inside your browser.",
              },
              {
                question: "What happens when I hit a bomb?",
                answer:
                  "Hitting a bomb immediately triggers an explosion and causes an instant Game Over, resetting your active run regardless of how many lives remain.",
              },
              {
                question: "How do combo multipliers work?",
                answer:
                  "When you rapidly slice fruits within a short time window, your combo counter increments, multiplying the points awarded for each subsequent slice.",
              },
              {
                question: "Is any software installation or plugin download required?",
                answer:
                  "No downloads or third-party installations are required. The game runs smoothly on modern browsers using HTML5 Canvas and native JavaScript.",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
