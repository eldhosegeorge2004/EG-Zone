/* eslint-disable */
import BubblePopGame from "@/games/bubblepop/BubblePopGame";
import GameSEO from "@/components/GameSEO";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Play Bubble Pop Online Free — Classic Bubble Shooter Arcade | EG ZONE",
  description:
    "Play Bubble Pop online for free! Aim the bubble cannon, match 3 or more colors, trigger chain reactions, and burst colorful clusters in this classic arcade shooter.",
};

export default function BubblePopPage() {
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
            Bubble Pop
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Aim, shoot, and match 3 or more bubbles to clear the board
          </p>
        </div>
      </div>

      <BubblePopGame />

      <div className="mt-12">
        <GameSEO
          gameName="Bubble Pop"
          description="Bubble Pop is a vibrant, fast-paced arcade bubble shooter game with snappy physics and satisfying chain reactions. Point your rotating cannon toward the ceiling to launch colorful spheres into a descending hexagonal grid. Matching clusters of three or more bubbles of the identical color bursts them instantly with cascading bonus points. As disconnected bubbles lose their structural ceiling anchors, they tumble into the void for big combo multipliers. Master bank shots by bouncing bubbles off side walls, swap colors strategically, and unleash powerful bombs and rainbow wildcards as the difficulty ramps up."
          howToPlay={[
            "Aim the Bubble Cannon: Drag across the screen or move your cursor to tilt the launcher. A predictive trajectory line shows your flight path and ricochets.",
            "Match 3 or More: Connect your launched bubble with a cluster of two or more matching colors to burst them.",
            "Drop Disconnected Clusters: Any bubbles left unsupported after a pop will detach and tumble down for massive bonus score multipliers.",
            "Swap Projectiles: Tap the swap icon or the upcoming bubble pod to switch between your current and next loaded bubble.",
            "Watch the Drop Counter: Every few non-popping shots triggers a new row of bubbles descending from the top. Clear clusters quickly!",
            "Unleash Power Bubbles: From level 2 onwards, look out for explosive Bomb bubbles that blast surrounding areas, and Rainbow bubbles that match any adjacent color."
          ]}
          features={[
            "Dynamic angle trajectory guideline with realistic wall ricochet reflection physics",
            "Special power-up bubbles including explosive Bombs and multi-color Rainbow wildcards",
            "Color swap mechanism allowing tactical decisions between active and queued bubbles",
            "Cascading avalanche bonuses when unanchored floating bubbles fall after high-altitude pops",
            "Progressive level escalation with denser layouts and faster row descent timers",
            "Responsive touch controls with seamless drag-to-aim and release-to-shoot ergonomics",
            "Vibrant cartoon aesthetic with juicy pop particle explosions and synth chime audio effects"
          ]}
          faqs={[
            {
              question: "How do I trigger an avalanche in Bubble Pop?",
              answer:
                "Aim for the thin root nodes near the top of the board that support large hanging clusters beneath them. Severing the anchor will cause the entire cluster to fall for heavy points."
            },
            {
              question: "How do wall bank shots work?",
              answer:
                "When aiming toward either the left or right wall, your trajectory dotted line will bounce off at the exact reflection angle, allowing you to reach tricky corners behind frontline bubbles."
            },
            {
              question: "What do the Bomb and Rainbow bubbles do?",
              answer:
                "Bomb bubbles explode on contact, clearing all bubbles within a large blast radius regardless of color. Rainbow bubbles automatically adapt to whatever color is most prominent next to them."
            },
            {
              question: "Can I play Bubble Pop on mobile phones?",
              answer:
                "Yes! Simply touch and drag anywhere on the screen to aim your cannon, and lift your finger to fire. You can also tap the swap circle to change bubbles."
            }
          ]}
        />
      </div>
    </div>
  );
}
