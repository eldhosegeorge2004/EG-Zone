/* eslint-disable */
import StackTower from "@/games/stack/StackTower";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Stack Tower Online Free | EG ZONE",
  description: "Test your precision and timing in Stack Tower! Drop sliding platforms with millimeter accuracy, slice off overhangs, build towering structures, and chase the ultimate high score.",
};

export default function StackTowerPage() {
  return (
    <div className="min-h-screen bg-[#090d18] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/games" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Games
        </Link>
        <StackTower />
        <div className="mt-16 text-slate-900">
          <GameSEO
            gameName="Stack Tower"
            description="Stack Tower is a sleek, hyper-satisfying test of visual rhythm and precision timing. Watch oscillating platforms slide horizontally across your screen and trigger the drop at the exact instant they align with the tower underneath. Any misalignment slices away the protruding edge, narrowing your foundation for subsequent blocks as the tower climbs higher and speed escalates."
            howToPlay={[
              "Trigger Drop: Press Space, Enter, click, or tap anywhere on screen to drop the sliding platform onto the stack.",
              "Slice Overhangs: Any portion of the block that hangs past the edges of the base block is immediately trimmed off.",
              "Earn Perfect Placements: Align the block with near-perfect accuracy to preserve the full platform width and trigger combo multipliers.",
              "Ascend to Higher Levels: Every five successful blocks elevate your level ranking and boost the platform traversal speed.",
              "Survive the Narrowing Stack: Keep your focus razor sharp as blocks become thinner and speeds intensify until the platform misses completely."
            ]}
            features={[
              "Hypnotic Kinetic Stacking: Clean, geometric physics simulation with smooth vertical camera tracking as your tower ascends.",
              "Dynamic Rainbow Color Palette: Tower tiers transition through stunning chromatic spectrums with luminous block styling.",
              "Perfect Placement Combos: Consecutive exact alignments trigger special audio cues and visual combo flashes.",
              "Progressive Difficulty Curve: Platform speed and precision requirements naturally increase alongside player score.",
              "One-Touch Responsive Controls: Instant zero-latency inputs on both desktop keyboards and mobile mobile displays."
            ]}
            faqs={[
              {
                question: "What happens when I place a block perfectly?",
                answer: "Achieving a perfect or near-perfect placement retains the platform's full width and builds a combo streak accompanied by musical chimes."
              },
              {
                question: "Why does my block keep getting smaller?",
                answer: "Whenever a block is dropped slightly off-center, the overhanging portion is trimmed off, leaving only the overlapping segment as the platform for the next drop."
              },
              {
                question: "Can I play Stack Tower with just one finger or key?",
                answer: "Yes, Stack Tower is designed for effortless one-touch play using any key (Space/Enter) or a simple tap on touchscreens."
              },
              {
                question: "How is the high score calculated and saved?",
                answer: "Your score equals the total count of successfully stacked tiers. Your personal record is stored securely in your browser's local cache."
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
}
