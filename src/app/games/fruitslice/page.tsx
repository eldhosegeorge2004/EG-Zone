/* eslint-disable */
import FruitSlice from "@/games/fruitslice/FruitSlice";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Fruit Slice Online Free — Arcade Slicing Game | EG ZONE",
  description:
    "Play Fruit Slice online for free! Swipe to slice flying fruit, chain 3+ combos, grab golden stars and slow-motion snowflakes, and dodge bombs in 60-second rounds.",
};

export default function FruitSlicePage() {
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
            Fruit Slice
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Swipe to slice flying fruit, chain combos, and dodge bombs!
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-3 sm:p-6 bg-white border border-slate-200 shadow-xl">
        <FruitSlice />
      </div>

      <div className="mt-12">
        <GameSEO
          gameName="Fruit Slice"
          description="Fruit Slice is a juicy, fast-paced 60-second arcade slicing game. Swipe across flying watermelons, oranges, apples, pineapples, and more to split them in half with colourful juice splashes. Chain three or more fruits in a single swipe for combo bonus points, catch golden stars for +5 points, and slice snowflakes to trigger 3 seconds of slow-motion. Watch out for bombs — hitting one costs 5 points and shakes the screen!"
          howToPlay={[
            "Click and drag (or swipe on touchscreens) across flying fruit to slice them for +1 point each.",
            "Slice 3 or more fruits in a single continuous swipe to trigger a Combo Bonus equal to the number of items sliced.",
            "Hit Golden Stars (⭐) for an instant +5 points.",
            "Slice Snowflakes (❄️) to activate 3 seconds of slow-motion, making tight waves easier to clear.",
            "Avoid Bombs (💣) at all costs — slicing a bomb deducts 5 points.",
            "Switch between Daily mode (same seeded wave pattern for everyone) and Random mode anytime.",
          ]}
          features={[
            "60-second arcade rounds with escalating wave speed.",
            "Daily seeded mode and endless Random mode.",
            "Combo multiplier for 3+ slices in a single swipe.",
            "Special power-ups: Golden Stars (+5) and Ice Snowflakes (slow-mo).",
            "Web Audio synthesized slice, combo, and bomb sound effects with mute toggle.",
            "Responsive touch and mouse pointer support.",
          ]}
          faqs={[
            {
              question: "How do combos work in Fruit Slice?",
              answer:
                "If you slice 3 or more fruits or stars in a single continuous swipe without lifting your finger or mouse button, you earn bonus points equal to the combo count.",
            },
            {
              question: "What happens if I slice a bomb?",
              answer:
                "Slicing a bomb deducts 5 points from your score (down to a minimum of 0) and triggers a brief screen shake.",
            },
            {
              question: "What is the difference between Daily and Random mode?",
              answer:
                "Daily mode uses a deterministic seed based on today's date so every player gets the exact same fruit and bomb sequence. Random mode generates a fresh sequence every run.",
            },
          ]}
        />
      </div>
    </div>
  );
}
