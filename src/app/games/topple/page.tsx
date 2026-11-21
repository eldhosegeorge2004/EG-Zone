/* eslint-disable */
import ToppleGame from "@/games/topple/ToppleGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Topple Online Free — Tower Stacking Arcade Game | EG ZONE",
  description:
    "Play Topple online for free! Drop sliding blocks to build the tallest skyscraper tower. Trim overhangs, chain perfect placements, and challenge your timing reflexes.",
};

export default function TopplePage() {
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
            Topple
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Drop sliding blocks with pinpoint precision to build the highest tower
          </p>
        </div>
      </div>

      <ToppleGame />

      <div className="mt-12">
        <GameSEO
          gameName="Topple"
          description="Topple is a fast, hypnotic tower-stacking arcade game inspired by classic block stacking titles. A colorful slab slides back and forth horizontally across the screen. When you tap the screen or press the spacebar, the block drops onto the tower beneath. Any portion that overhangs the previous block is sliced off cleanly and plummets into the void, making each successive floor narrower and more challenging to land. Land your block within 7 pixels of exact alignment to earn a 'Perfect' rating and chain consecutive streaks with soaring musical chimes."
          howToPlay={[
            "Watch the Sliding Slab: A colored platform moves continuously left and right across the upper half of the screen.",
            "Tap or Press Spacebar: Time your tap to drop the moving slab precisely on top of the established tower.",
            "Trim Overhangs: Only the overlapping section remains as the foundation for your next floor. Any overhanging excess falls away as debris.",
            "Chain Perfect Placements: Aligning the slab within 7 pixels of the previous block triggers a 'Perfect' combo, increasing your streak and audio chimes.",
            "Avoid Missing Completely: If the sliding slab completely misses the tower with zero overlap, your tower topples and the run ends.",
            "Climb Higher: As your score rises, the sliding velocity steadily speeds up from 230 px/s up to 540 px/s, testing your twitch timing reflexes."
          ]}
          features={[
            "Silky smooth 60FPS canvas physics with realistic gravitational debris drop",
            "Dynamic color palette shifting through vibrant gradient hues as your tower ascends",
            "Chaining Perfect combo system featuring escalating pentatonic audio notes",
            "Adaptive camera scrolling smoothly tracking the pinnacle of your tower as it reaches new heights",
            "Touch and keyboard accessibility with full mobile screen tap and Spacebar support",
            "Haptic vibration feedback on crashes and near misses for tactile immersion",
            "Persistent local high-score tracking to beat your personal best skyscraper record"
          ]}
          faqs={[
            {
              question: "How do I get a high score in Topple?",
              answer:
                "Focus on rhythm rather than rushing. Landing Perfect placements preserves the full width of your block, giving you a wider landing margin for future floors. If you slice off too much early on, your tower becomes razor-thin and very difficult to maintain."
            },
            {
              question: "Does the block speed up as I play?",
              answer:
                "Yes! The speed scales progressively with each successful placement, accelerating from 230 px/s to a blistering 540 px/s at higher scores."
            },
            {
              question: "Can I play Topple on mobile and tablet?",
              answer:
                "Yes, Topple is fully responsive. Tapping anywhere on the screen drops the block instantly with zero latency."
            },
            {
              question: "Can blocks regain width after being trimmed?",
              answer:
                "In Topple, each slice permanently narrows the platform unless you chain multiple consecutive perfect placements, which rewards you with bonus score multipliers."
            }
          ]}
        />
      </div>
    </div>
  );
}
